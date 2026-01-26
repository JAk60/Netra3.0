SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- sp_process_monthly_utilization_etl WITH WATCHMAN
-- Added watermark filtering for incremental sync
-- =============================================
ALTER PROCEDURE [dbo].[sp_process_monthly_utilization_etl]
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @component_id UNIQUEIDENTIFIER;
    DECLARE @ship_name VARCHAR(255);
    DECLARE @nomenclature NVARCHAR(MAX);
    DECLARE @frequency_minutes INT;
    DECLARE @retry_count INT;
    DECLARE @max_retries INT;
    DECLARE @run_id UNIQUEIDENTIFIER;
    DECLARE @start_time DATETIME2;
    DECLARE @rows_inserted INT;
    DECLARE @rows_updated INT;
    DECLARE @sql NVARCHAR(MAX);
    DECLARE @params NVARCHAR(500);
    DECLARE @last_watermark DATETIME2;  -- ⚡ NEW
    
    -- Temp table to hold components to process
    CREATE TABLE #components_to_process (
        component_id UNIQUEIDENTIFIER,
        ship_name VARCHAR(255),
        nomenclature NVARCHAR(MAX),
        frequency_minutes INT,
        retry_count INT,
        max_retries INT,
        last_watermark DATETIME2  -- ⚡ NEW
    );
    
    -- Find components ready to process
    INSERT INTO #components_to_process
    SELECT 
        sc.component_id,
        s.ship_name,
        sc.nomenclature,
        ISNULL(es.frequency_minutes, 5) as frequency_minutes,
        ISNULL(es.retry_count, 0) as retry_count,
        ISNULL(es.max_retries, 3) as max_retries,
        ISNULL(es.source_watermark, '1900-01-01') as last_watermark  -- ⚡ NEW
    FROM system_configuration sc
    INNER JOIN ships s ON sc.ship_id = s.ship_id
    LEFT JOIN etl_schedule es ON sc.component_id = es.component_id
    WHERE sc.etl = 1
      AND (es.next_run_time IS NULL OR es.next_run_time <= GETDATE())
      AND (es.status IS NULL OR es.status NOT IN ('running'))
      AND (es.retry_count IS NULL OR es.retry_count < es.max_retries);
    
    -- Process each component
    DECLARE component_cursor CURSOR FOR
    SELECT component_id, ship_name, nomenclature, frequency_minutes, retry_count, max_retries, last_watermark
    FROM #components_to_process;
    
    OPEN component_cursor;
    FETCH NEXT FROM component_cursor INTO @component_id, @ship_name, @nomenclature, @frequency_minutes, @retry_count, @max_retries, @last_watermark;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @run_id = NEWID();
        SET @start_time = GETDATE();
        SET @rows_inserted = 0;
        SET @rows_updated = 0;
        
        BEGIN TRY
            -- ⚡ WATCHMAN: Log watermark being used
            PRINT '⚡ Watchman filter for ' + @nomenclature;
            PRINT 'Last watermark: ' + CAST(@last_watermark AS VARCHAR(50));
            
            -- Update status to running
            MERGE INTO etl_schedule AS target
            USING (SELECT @component_id AS component_id) AS source
            ON target.component_id = source.component_id
            WHEN MATCHED THEN
                UPDATE SET status = 'running', updated_at = GETDATE()
            WHEN NOT MATCHED THEN
                INSERT (component_id, frequency_minutes, status, next_run_time, created_at, updated_at)
                VALUES (@component_id, @frequency_minutes, 'running', GETDATE(), GETDATE(), GETDATE());
            
            -- Create temp table for fetched data
            CREATE TABLE #monthly_data (
                component_id UNIQUEIDENTIFIER,
                operation_date DATE,
                utilization NUMERIC(18)
            );
            
            -- Build and execute cross-database query
            -- ⚡ KEY CHANGE: Added watermark filter in WHERE clause
            SET @sql = N'
                INSERT INTO #monthly_data (component_id, operation_date, utilization)
                SELECT DISTINCT
                    @component_id as component_id,
                    CAST(CONCAT(
                        T_SRARMthlyHeader.SrarYear,
                        ''-'',
                        RIGHT(''00'' + CAST(T_SRARMthlyHeader.SrarMonth AS VARCHAR(2)), 2),
                        ''-'',
                        ''01''
                    ) AS DATE) AS operation_date,
                    ISNULL(T_SRARMthlyEquipments.HrsForMonth, 0) AS utilization
                FROM [CMMSOFFLINE].[dbo].T_SRARMthlyEquipments WITH (NOLOCK)
                FULL JOIN [CMMSOFFLINE].[dbo].T_SRARMthlyHeader WITH (NOLOCK) 
                    ON T_SRARMthlyEquipments.Universal_ID_T_SRARMthlyHeader = T_SRARMthlyHeader.Universal_ID_T_SRARMthlyHeader
                FULL JOIN [CMMSOFFLINE].[dbo].T_EquipmentShipDetail WITH (NOLOCK) 
                    ON T_SRARMthlyEquipments.Universal_ID_T_EquipmentShipDetail = T_EquipmentShipDetail.Universal_ID_T_EquipmentShipDetail
                FULL JOIN [CMMSOFFLINE].[dbo].M_Equipment WITH (NOLOCK) 
                    ON T_EquipmentShipDetail.Universal_ID_M_Equipment = M_Equipment.Universal_ID_M_Equipment
                FULL JOIN [CMMSOFFLINE].[dbo].M_Ship WITH (NOLOCK) 
                    ON T_EquipmentShipDetail.Universal_ID_M_Ship = M_Ship.Universal_ID_M_Ship
                FULL JOIN [CMMSOFFLINE].[dbo].M_Command WITH (NOLOCK) 
                    ON M_Ship.Universal_ID_M_Command = M_Command.Universal_ID_M_Command
                FULL JOIN [CMMSOFFLINE].[dbo].M_ShipCategory WITH (NOLOCK) 
                    ON M_Ship.Universal_ID_M_ShipCategory = M_ShipCategory.Universal_ID_M_ShipCategory
                FULL JOIN [CMMSOFFLINE].[dbo].M_Department WITH (NOLOCK) 
                    ON T_EquipmentShipDetail.Universal_ID_M_Department = M_Department.Universal_ID_M_Department
                WHERE (T_SRARMthlyHeader.Active = 1 AND T_SRARMthlyEquipments.Active = 1)
                    AND T_SRARMthlyHeader.SrarYear IS NOT NULL
                    AND T_SRARMthlyHeader.SrarMonth IS NOT NULL
                    AND T_SRARMthlyHeader.SrarMonth >= 1 
                    AND T_SRARMthlyHeader.SrarMonth <= 12
                    AND M_Ship.ShipName = @ship_name
                    AND T_EquipmentShipDetail.Nomenclature = @nomenclature
                    AND T_SRARMthlyEquipments.updatedDate > @last_watermark;  -- ⚡ WATERMARK FILTER
            ';
            
            SET @params = N'@component_id UNIQUEIDENTIFIER, @ship_name VARCHAR(255), @nomenclature NVARCHAR(MAX), @last_watermark DATETIME2';
            
            -- Execute the query
            EXEC sp_executesql @sql, @params, @component_id, @ship_name, @nomenclature, @last_watermark;
            
            -- ⚡ Log how many rows were affected by watermark
            DECLARE @watermark_rows INT = (SELECT COUNT(*) FROM #monthly_data);
            PRINT 'Rows after watermark filter: ' + CAST(@watermark_rows AS VARCHAR(10));
            
            -- MERGE into monthly_utilization
            MERGE monthly_utilization AS target
            USING #monthly_data AS source
            ON target.component_id = source.component_id
               AND target.operation_date = source.operation_date
            WHEN MATCHED AND target.utlization != source.utilization THEN
                UPDATE SET utlization = source.utilization
            WHEN NOT MATCHED THEN
                INSERT (id, component_id, operation_date, utlization)
                VALUES (NEWID(), source.component_id, source.operation_date, source.utilization);
            
            -- Count inserted and updated rows
            SELECT @rows_inserted = COUNT(*) FROM #monthly_data md
            WHERE NOT EXISTS (
                SELECT 1 FROM monthly_utilization mu 
                WHERE mu.component_id = md.component_id 
                AND mu.operation_date = md.operation_date
            );
            
            SELECT @rows_updated = (SELECT COUNT(*) FROM #monthly_data) - @rows_inserted;
            
            -- Success: Update schedule
            -- ⚡ CRITICAL: Update watermark after successful sync
            DECLARE @new_watermark DATETIME2;
            
            SET @sql = N'
                SELECT @new_watermark_out = MAX(T_SRARMthlyEquipments.updatedDate)
                FROM [CMMSOFFLINE].[dbo].T_SRARMthlyEquipments WITH (NOLOCK)
                FULL JOIN [CMMSOFFLINE].[dbo].T_EquipmentShipDetail WITH (NOLOCK) 
                    ON T_SRARMthlyEquipments.Universal_ID_T_EquipmentShipDetail = T_EquipmentShipDetail.Universal_ID_T_EquipmentShipDetail
                FULL JOIN [CMMSOFFLINE].[dbo].M_Ship WITH (NOLOCK) 
                    ON T_EquipmentShipDetail.Universal_ID_M_Ship = M_Ship.Universal_ID_M_Ship
                WHERE M_Ship.ShipName = @ship_name
                  AND T_EquipmentShipDetail.Nomenclature = @nomenclature
                  AND T_SRARMthlyEquipments.Active = 1;
            ';
            
            SET @params = N'@ship_name VARCHAR(255), @nomenclature NVARCHAR(MAX), @new_watermark_out DATETIME2 OUTPUT';
            EXEC sp_executesql @sql, @params, @ship_name, @nomenclature, @new_watermark_out = @new_watermark OUTPUT;
            
            UPDATE etl_schedule
            SET status = 'idle',
                last_run_time = GETDATE(),
                next_run_time = DATEADD(MINUTE, @frequency_minutes, GETDATE()),
                retry_count = 0,
                error_message = NULL,
                source_watermark = @new_watermark,  -- ⚡ NEW: Save watermark
                target_watermark = GETDATE(),       -- ⚡ NEW: Save sync completion time
                updated_at = GETDATE()
            WHERE component_id = @component_id;
            
            PRINT '✅ Watermark updated to: ' + CAST(@new_watermark AS VARCHAR(50));
            
            -- Log success
            INSERT INTO etl_audit_log (
                log_id,
                run_id, 
                component_id, 
                ship_name, 
                nomenclature,
                start_time, 
                end_time, 
                rows_processed, 
                rows_inserted, 
                rows_updated,
                status, 
                retry_attempt,
                created_at
            )
            VALUES (
                NEWID(),
                @run_id, 
                @component_id, 
                @ship_name, 
                @nomenclature,
                @start_time, 
                GETDATE(), 
                @rows_inserted + @rows_updated, 
                @rows_inserted, 
                @rows_updated,
                'success', 
                @retry_count,
                GETDATE()
            );
            
            -- Cleanup
            DROP TABLE #monthly_data;
            
        END TRY
        BEGIN CATCH
            DECLARE @error_message NVARCHAR(MAX) = ERROR_MESSAGE();
            DECLARE @error_line INT = ERROR_LINE();
            DECLARE @error_full NVARCHAR(MAX) = 'Line ' + CAST(@error_line AS VARCHAR(10)) + ': ' + @error_message;
            
            -- Update schedule with error
            UPDATE etl_schedule
            SET status = 'error',
                retry_count = retry_count + 1,
                error_message = @error_full,
                next_run_time = DATEADD(MINUTE, POWER(2, retry_count + 1), GETDATE()),
                updated_at = GETDATE()
            WHERE component_id = @component_id;
            
            -- Log failure
            INSERT INTO etl_audit_log (
                log_id,
                run_id, 
                component_id, 
                ship_name, 
                nomenclature,
                start_time, 
                end_time, 
                rows_processed, 
                rows_inserted, 
                rows_updated,
                status, 
                error_details, 
                retry_attempt,
                created_at
            )
            VALUES (
                NEWID(),
                @run_id, 
                @component_id, 
                @ship_name, 
                @nomenclature,
                @start_time, 
                GETDATE(), 
                0, 
                0, 
                0,
                'failed', 
                @error_full, 
                @retry_count,
                GETDATE()
            );
            
            -- Cleanup if table exists
            IF OBJECT_ID('tempdb..#monthly_data') IS NOT NULL
                DROP TABLE #monthly_data;
            
            -- Continue to next component (don't stop entire batch)
        END CATCH
        
        FETCH NEXT FROM component_cursor INTO @component_id, @ship_name, @nomenclature, @frequency_minutes, @retry_count, @max_retries, @last_watermark;
    END
    
    CLOSE component_cursor;
    DEALLOCATE component_cursor;
    
    DROP TABLE #components_to_process;
    
    RETURN 0;
END
GO