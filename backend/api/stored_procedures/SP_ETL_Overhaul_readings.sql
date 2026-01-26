SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- ETL Stored Procedure: Overhaul Readings
-- Description: Extracts defect data, calculates interpolated age, and loads into Overhaul_Readings
-- WITH WATCHMAN: Supports component-specific execution and watermark filtering
-- MODIFIED: Single row inserts for trigger compatibility
-- =============================================

ALTER PROCEDURE [dbo].[usp_ETL_Overhaul_Readings]
    @component_id UNIQUEIDENTIFIER = NULL  -- ⚡ NEW: Optional parameter for single component
AS
BEGIN
    SET NOCOUNT ON;
    
    -- ============================================
    -- DATABASE CONFIGURATION
    -- ============================================
    DECLARE @SourceDB VARCHAR(100) = 'CMMSOFFLINE';
    DECLARE @ClientDB VARCHAR(100) = 'NetraKoshx';
    
    -- Error handling variables
    DECLARE @ErrorMessage NVARCHAR(4000);
    DECLARE @ErrorSeverity INT;
    DECLARE @ErrorState INT;
    
    -- Processing counters
    DECLARE @ProcessedCount INT = 0;
    DECLARE @ErrorCount INT = 0;
    DECLARE @InsertedCount INT = 0;
    DECLARE @UpdatedCount INT = 0;
    
    BEGIN TRY
        -- ============================================
        -- TEMP TABLES
        -- ============================================
        
        -- Temp table for component configuration
        CREATE TABLE #ComponentConfig (
            component_id UNIQUEIDENTIFIER,
            nomenclature VARCHAR(MAX),
            ship_id UNIQUEIDENTIFIER,
            ship_name VARCHAR(MAX),
            last_watermark DATETIME2  -- ⚡ NEW: For incremental sync
        );
        
        -- Temp table for defect dates
        CREATE TABLE #DefectDates (
            component_id UNIQUEIDENTIFIER,
            defect_date DATE,
            defect_day INT
        );
        
        -- Temp table for operational data (SRAR)
        CREATE TABLE #OperationalData (
            component_id UNIQUEIDENTIFIER,
            operation_date DATE,
            average_running FLOAT
        );
        
        -- Temp table for final results
        CREATE TABLE #FinalResults (
            component_id UNIQUEIDENTIFIER,
            defect_date DATE,
            cmms_running_age FLOAT
        );
        
        -- ============================================
        -- STEP 1: GET COMPONENTS TO PROCESS
        -- ============================================
        DECLARE @SQL NVARCHAR(MAX);
        
        -- ⚡ NEW: Filter by component_id if provided, otherwise process all
        SET @SQL = N'
        INSERT INTO #ComponentConfig (component_id, nomenclature, ship_id, ship_name, last_watermark)
        SELECT 
            sc.component_id, 
            sc.nomenclature, 
            sc.ship_id, 
            s.ship_name,
            ISNULL(es.source_watermark, ''1900-01-01'') as last_watermark
        FROM ' + QUOTENAME(@ClientDB) + '.dbo.system_configuration sc
        INNER JOIN ' + QUOTENAME(@ClientDB) + '.dbo.ships s ON sc.ship_id = s.ship_id
        LEFT JOIN ' + QUOTENAME(@ClientDB) + '.dbo.etl_schedule es ON sc.component_id = es.component_id
        WHERE sc.etl = 1 
            AND sc.component_id IS NOT NULL 
            AND sc.nomenclature IS NOT NULL 
            AND sc.ship_id IS NOT NULL';
        
        -- ⚡ Add component filter if specified
        IF @component_id IS NOT NULL
        BEGIN
            SET @SQL = @SQL + N' AND sc.component_id = @comp_id';
            EXEC sp_executesql @SQL, N'@comp_id UNIQUEIDENTIFIER', @comp_id = @component_id;
            
            PRINT '⚡ Processing single component: ' + CAST(@component_id AS VARCHAR(50));
        END
        ELSE
        BEGIN
            EXEC sp_executesql @SQL;
            PRINT '⚡ Processing all components with ETL enabled';
        END
        
        -- ============================================
        -- STEP 2: LOOP THROUGH EACH COMPONENT
        -- ============================================
        DECLARE @ComponentID UNIQUEIDENTIFIER;
        DECLARE @Nomenclature VARCHAR(MAX);
        DECLARE @ShipID UNIQUEIDENTIFIER;
        DECLARE @ShipName VARCHAR(MAX);
        DECLARE @LastWatermark DATETIME2;  -- ⚡ NEW
        
        DECLARE component_cursor CURSOR LOCAL FAST_FORWARD FOR
        SELECT component_id, nomenclature, ship_id, ship_name, last_watermark
        FROM #ComponentConfig;
        
        OPEN component_cursor;
        FETCH NEXT FROM component_cursor INTO @ComponentID, @Nomenclature, @ShipID, @ShipName, @LastWatermark;
        
        WHILE @@FETCH_STATUS = 0
        BEGIN
            BEGIN TRY
                -- Clear temp tables for this component
                TRUNCATE TABLE #DefectDates;
                TRUNCATE TABLE #OperationalData;
                
                -- ⚡ Log watermark info
                PRINT '─────────────────────────────────────────────';
                PRINT 'Component: ' + @Nomenclature + ' (' + @ShipName + ')';
                PRINT 'Last watermark: ' + CAST(@LastWatermark AS VARCHAR(50));
                
                -- ============================================
                -- STEP 3: GET DEFECT DATES FROM SOURCE DB
                -- ⚡ NEW: Filter by watermark (updatedDate)
                -- ============================================
                SET @SQL = N'
                INSERT INTO #DefectDates (component_id, defect_date, defect_day)
                SELECT
                    @CompID AS component_id,
                    CONVERT(DATE, T_Dart.DefectDate, 23) AS defect_date,
                    DAY(T_Dart.DefectDate) AS defect_day
                FROM ' + QUOTENAME(@SourceDB) + '.dbo.t_DART WITH (NOLOCK)
                INNER JOIN ' + QUOTENAME(@SourceDB) + '.dbo.T_EquipmentShipDetail WITH (NOLOCK) 
                    ON T_Dart.Universal_ID_T_EquipmentShipDetail = T_EquipmentShipDetail.Universal_ID_T_EquipmentShipDetail
                INNER JOIN ' + QUOTENAME(@SourceDB) + '.dbo.M_Ship WITH (NOLOCK) 
                    ON T_EquipmentShipDetail.Universal_ID_M_Ship = M_Ship.Universal_ID_M_Ship
                WHERE
                    T_EquipmentShipDetail.Nomenclature = @Nomenclature
                    AND M_Ship.ShipName = @ShipName
                    AND T_Dart.Active = 1
                    AND T_EquipmentShipDetail.Active = 1
                    AND T_Dart.Is_Defect = 1
                    AND T_Dart.RoutineDefect = 2
                    AND T_Dart.DefectDate IS NOT NULL
                    AND T_Dart.updatedDate > @LastWatermark;';  -- ⚡ WATERMARK FILTER
                
                EXEC sp_executesql @SQL, 
                    N'@CompID UNIQUEIDENTIFIER, @Nomenclature VARCHAR(MAX), @ShipName VARCHAR(MAX), @LastWatermark DATETIME2',
                    @CompID = @ComponentID,
                    @Nomenclature = @Nomenclature,
                    @ShipName = @ShipName,
                    @LastWatermark = @LastWatermark;
                
                DECLARE @defect_rows INT = (SELECT COUNT(*) FROM #DefectDates);
                PRINT 'Defects after watermark filter: ' + CAST(@defect_rows AS VARCHAR(10));
                
                -- ============================================
                -- STEP 4: GET OPERATIONAL DATA (SRAR)
                -- Note: We need ALL historical data for cumulative calculations
                -- ============================================
                SET @SQL = N'
                INSERT INTO #OperationalData (component_id, operation_date, average_running)
                SELECT DISTINCT
                    @CompID as component_id,
                    DATEFROMPARTS(
                        T_SRARMthlyHeader.SrarYear,
                        T_SRARMthlyHeader.SrarMonth,
                        1
                    ) AS operation_date,
                    ISNULL(T_SRARMthlyEquipments.HrsForMonth, 0) AS average_running
                FROM ' + QUOTENAME(@SourceDB) + '.dbo.T_SRARMthlyEquipments WITH (NOLOCK)
                INNER JOIN ' + QUOTENAME(@SourceDB) + '.dbo.T_SRARMthlyHeader WITH (NOLOCK) 
                    ON T_SRARMthlyEquipments.Universal_ID_T_SRARMthlyHeader = T_SRARMthlyHeader.Universal_ID_T_SRARMthlyHeader
                INNER JOIN ' + QUOTENAME(@SourceDB) + '.dbo.T_EquipmentShipDetail WITH (NOLOCK) 
                    ON T_SRARMthlyEquipments.Universal_ID_T_EquipmentShipDetail = T_EquipmentShipDetail.Universal_ID_T_EquipmentShipDetail
                INNER JOIN ' + QUOTENAME(@SourceDB) + '.dbo.M_Ship WITH (NOLOCK) 
                    ON T_EquipmentShipDetail.Universal_ID_M_Ship = M_Ship.Universal_ID_M_Ship
                WHERE 
                    T_SRARMthlyHeader.Active = 1 
                    AND T_SRARMthlyEquipments.Active = 1
                    AND T_SRARMthlyHeader.SrarYear IS NOT NULL
                    AND T_SRARMthlyHeader.SrarMonth IS NOT NULL
                    AND T_SRARMthlyHeader.SrarMonth >= 1 
                    AND T_SRARMthlyHeader.SrarMonth <= 12
                    AND M_Ship.ShipName = @ShipName
                    AND T_EquipmentShipDetail.Nomenclature = @Nomenclature;';
                
                EXEC sp_executesql @SQL,
                    N'@CompID UNIQUEIDENTIFIER, @Nomenclature VARCHAR(MAX), @ShipName VARCHAR(MAX)',
                    @CompID = @ComponentID,
                    @Nomenclature = @Nomenclature,
                    @ShipName = @ShipName;
                
                -- ============================================
                -- STEP 5: CALCULATE INTERPOLATED AGE
                -- ============================================
                INSERT INTO #FinalResults (component_id, defect_date, cmms_running_age)
                SELECT 
                    dd.component_id,
                    dd.defect_date,
                    ISNULL(cumulative_sum, 0) + ISNULL((avg_daily_rate * dd.defect_day), 0) AS cmms_running_age
                FROM #DefectDates dd
                CROSS APPLY (
                    -- Step 1: Get cumulative sum up to and including the current month
                    SELECT SUM(average_running) AS cumulative_sum
                    FROM #OperationalData
                    WHERE component_id = dd.component_id
                        AND operation_date <= DATEFROMPARTS(YEAR(dd.defect_date), MONTH(dd.defect_date), 1)
                ) cum_calc
                CROSS APPLY (
                    -- Step 2: Get average of last 5 non-zero months for interpolation
                    SELECT 
                        AVG(average_running) / 30.0 AS avg_daily_rate
                    FROM (
                        SELECT TOP 5 average_running
                        FROM #OperationalData
                        WHERE component_id = dd.component_id
                            AND operation_date <= DATEFROMPARTS(YEAR(dd.defect_date), MONTH(dd.defect_date), 1)
                            AND average_running > 0
                        ORDER BY operation_date DESC
                    ) AS last_5_months
                ) daily_calc;
                
                DECLARE @results_count INT = @@ROWCOUNT;
                SET @ProcessedCount = @ProcessedCount + @results_count;
                
                PRINT 'Calculated ages for ' + CAST(@results_count AS VARCHAR(10)) + ' defect records';
                
            END TRY
            BEGIN CATCH
                SET @ErrorCount = @ErrorCount + 1;
                -- Log error but continue processing other components
                PRINT '❌ Error processing component: ' + CAST(@ComponentID AS VARCHAR(50)) + ' - ' + ERROR_MESSAGE();
            END CATCH
            
            FETCH NEXT FROM component_cursor INTO @ComponentID, @Nomenclature, @ShipID, @ShipName, @LastWatermark;
        END
        
        CLOSE component_cursor;
        DEALLOCATE component_cursor;
        
        -- ============================================
        -- STEP 6: INSERT INTO FINAL TABLE (ONE ROW AT A TIME)
        -- ⚡ MODIFIED: Single row inserts for trigger compatibility
        -- ============================================
        
        DECLARE @curr_component_id UNIQUEIDENTIFIER;
        DECLARE @curr_defect_date DATE;
        DECLARE @curr_cmms_age FLOAT;
        DECLARE @existing_id UNIQUEIDENTIFIER;
        
        PRINT '─────────────────────────────────────────────';
        PRINT 'Starting single-row insert/update process...';
        
        DECLARE result_cursor CURSOR LOCAL FAST_FORWARD FOR
        SELECT component_id, defect_date, cmms_running_age
        FROM #FinalResults
        ORDER BY component_id, defect_date;  -- Process in order
        
        OPEN result_cursor;
        FETCH NEXT FROM result_cursor INTO @curr_component_id, @curr_defect_date, @curr_cmms_age;
        
        WHILE @@FETCH_STATUS = 0
        BEGIN
            BEGIN TRY
                -- Check if record exists
                SET @SQL = N'
                SELECT @existing_id_out = id
                FROM ' + QUOTENAME(@ClientDB) + '.dbo.Overhaul_Readings
                WHERE component_id = @comp_id AND defect_date = @def_date;';
                
                EXEC sp_executesql @SQL,
                    N'@comp_id UNIQUEIDENTIFIER, @def_date DATE, @existing_id_out UNIQUEIDENTIFIER OUTPUT',
                    @comp_id = @curr_component_id,
                    @def_date = @curr_defect_date,
                    @existing_id_out = @existing_id OUTPUT;
                
                IF @existing_id IS NOT NULL
                BEGIN
                    -- UPDATE existing record
                    SET @SQL = N'
                    UPDATE ' + QUOTENAME(@ClientDB) + '.dbo.Overhaul_Readings
                    SET cmms_running_age = @cmms,
                        maintenance_type = ''Corrective Maintenance'',
                        running_age = NULL
                    WHERE id = @id;';
                    
                    EXEC sp_executesql @SQL,
                        N'@cmms FLOAT, @id UNIQUEIDENTIFIER',
                        @cmms = @curr_cmms_age,
                        @id = @existing_id;
                    
                    SET @UpdatedCount = @UpdatedCount + 1;
                END
                ELSE
                BEGIN
                    -- INSERT new record (trigger will fire here)
                    SET @SQL = N'
                    INSERT INTO ' + QUOTENAME(@ClientDB) + '.dbo.Overhaul_Readings
                    (id, component_id, maintenance_type, defect_date, cmms_running_age, running_age)
                    VALUES 
                    (NEWID(), @comp_id, ''Corrective Maintenance'', @def_date, @cmms, 0);';
                    
                    EXEC sp_executesql @SQL,
                        N'@comp_id UNIQUEIDENTIFIER, @def_date DATE, @cmms FLOAT',
                        @comp_id = @curr_component_id,
                        @def_date = @curr_defect_date,
                        @cmms = @curr_cmms_age;
                    
                    SET @InsertedCount = @InsertedCount + 1;
                END
                
                SET @existing_id = NULL;  -- Reset for next iteration
                
            END TRY
            BEGIN CATCH
                SET @ErrorCount = @ErrorCount + 1;
                PRINT '❌ Error processing record (Component: ' + CAST(@curr_component_id AS VARCHAR(50)) + 
                      ', Date: ' + CAST(@curr_defect_date AS VARCHAR(20)) + '): ' + ERROR_MESSAGE();
            END CATCH
            
            FETCH NEXT FROM result_cursor INTO @curr_component_id, @curr_defect_date, @curr_cmms_age;
        END
        
        CLOSE result_cursor;
        DEALLOCATE result_cursor;
        
        PRINT 'Single-row processing complete';
        
        -- ⚡ NEW: Update watermark for processed component(s)
        IF @component_id IS NOT NULL
        BEGIN
            -- Single component: update its watermark
            DECLARE @new_watermark DATETIME2;
            
            SET @SQL = N'
                SELECT @new_watermark_out = MAX(T_Dart.updatedDate)
                FROM ' + QUOTENAME(@SourceDB) + '.dbo.t_DART WITH (NOLOCK)
                INNER JOIN ' + QUOTENAME(@SourceDB) + '.dbo.T_EquipmentShipDetail WITH (NOLOCK) 
                    ON T_Dart.Universal_ID_T_EquipmentShipDetail = T_EquipmentShipDetail.Universal_ID_T_EquipmentShipDetail
                INNER JOIN ' + QUOTENAME(@SourceDB) + '.dbo.M_Ship WITH (NOLOCK) 
                    ON T_EquipmentShipDetail.Universal_ID_M_Ship = M_Ship.Universal_ID_M_Ship
                WHERE T_EquipmentShipDetail.Nomenclature = @Nomenclature
                  AND M_Ship.ShipName = @ShipName
                  AND T_Dart.Active = 1;
            ';
            
            -- Get nomenclature and ship_name for this component
            DECLARE @comp_nomenclature VARCHAR(MAX);
            DECLARE @comp_ship_name VARCHAR(MAX);
            
            SELECT TOP 1 @comp_nomenclature = nomenclature, @comp_ship_name = ship_name
            FROM #ComponentConfig
            WHERE component_id = @component_id;
            
            EXEC sp_executesql @SQL,
                N'@Nomenclature VARCHAR(MAX), @ShipName VARCHAR(MAX), @new_watermark_out DATETIME2 OUTPUT',
                @Nomenclature = @comp_nomenclature,
                @ShipName = @comp_ship_name,
                @new_watermark_out = @new_watermark OUTPUT;
            
            -- Update the watermark in etl_schedule
            SET @SQL = N'
                UPDATE ' + QUOTENAME(@ClientDB) + '.dbo.etl_schedule
                SET source_watermark = @new_watermark,
                    target_watermark = GETDATE(),
                    updated_at = GETDATE()
                WHERE component_id = @component_id;
            ';
            
            EXEC sp_executesql @SQL,
                N'@new_watermark DATETIME2, @component_id UNIQUEIDENTIFIER',
                @new_watermark = @new_watermark,
                @component_id = @component_id;
            
            PRINT '✅ Watermark updated to: ' + CAST(@new_watermark AS VARCHAR(50));
        END
        
        -- ============================================
        -- CLEANUP & RESULTS
        -- ============================================
        DROP TABLE #ComponentConfig;
        DROP TABLE #DefectDates;
        DROP TABLE #OperationalData;
        DROP TABLE #FinalResults;
        
        PRINT '═════════════════════════════════════════════';
        PRINT '✅ ETL Process Completed Successfully';
        PRINT 'Total Records Processed: ' + CAST(@ProcessedCount AS VARCHAR(10));
        PRINT 'Records Inserted: ' + CAST(@InsertedCount AS VARCHAR(10));
        PRINT 'Records Updated: ' + CAST(@UpdatedCount AS VARCHAR(10));
        PRINT 'Components with Errors: ' + CAST(@ErrorCount AS VARCHAR(10));
        PRINT '═════════════════════════════════════════════';
        
    END TRY
    BEGIN CATCH
        -- Cleanup on error
        IF OBJECT_ID('tempdb..#ComponentConfig') IS NOT NULL DROP TABLE #ComponentConfig;
        IF OBJECT_ID('tempdb..#DefectDates') IS NOT NULL DROP TABLE #DefectDates;
        IF OBJECT_ID('tempdb..#OperationalData') IS NOT NULL DROP TABLE #OperationalData;
        IF OBJECT_ID('tempdb..#FinalResults') IS NOT NULL DROP TABLE #FinalResults;
        
        SELECT 
            @ErrorMessage = ERROR_MESSAGE(),
            @ErrorSeverity = ERROR_SEVERITY(),
            @ErrorState = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO