-- =============================================
-- Watchman: Check Single Component for Changes
-- Description: Detects if component needs sync by checking updatedDate watermark
-- =============================================

CREATE OR ALTER PROCEDURE [dbo].[usp_watchman_check_component]
    @component_id UNIQUEIDENTIFIER,
    @triggered_by VARCHAR(50) = 'auto'
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Variables
    DECLARE @ship_name VARCHAR(255);
    DECLARE @nomenclature NVARCHAR(MAX);
    DECLARE @last_watermark DATETIME2;
    DECLARE @changed_rows INT = 0;
    DECLARE @latest_updatedDate DATETIME2;
    DECLARE @source_row_count INT = 0;
    DECLARE @target_row_count INT = 0;
    DECLARE @needs_sync BIT = 0;
    DECLARE @decision_reason VARCHAR(100);
    DECLARE @risk_score INT = 0;
    DECLARE @hours_since_last_sync FLOAT;
    DECLARE @check_start_time DATETIME2 = GETDATE();
    DECLARE @check_duration_ms INT;
    
    BEGIN TRY
        -- ============================================
        -- STEP 1: GET COMPONENT CONFIGURATION
        -- ============================================
        SELECT 
            @ship_name = s.ship_name,
            @nomenclature = sc.nomenclature,
            @last_watermark = es.source_watermark
        FROM system_configuration sc
        INNER JOIN ships s ON sc.ship_id = s.ship_id
        LEFT JOIN etl_schedule es ON sc.component_id = es.component_id
        WHERE sc.component_id = @component_id
          AND sc.etl = 1;
        
        -- Check if component exists
        IF @ship_name IS NULL OR @nomenclature IS NULL
        BEGIN
            DECLARE @error_msg NVARCHAR(200) = 'Component not found or ETL not enabled for component_id: ' + CAST(@component_id AS NVARCHAR(50));
            RAISERROR(@error_msg, 16, 1);
            RETURN;
        END
        
        -- If never synced, set watermark to old date
        IF @last_watermark IS NULL
            SET @last_watermark = '1900-01-01';
        
        -- Calculate hours since last sync
        SELECT @hours_since_last_sync = DATEDIFF(MINUTE, 
            ISNULL(es.last_run_time, DATEADD(HOUR, -24, GETDATE())), 
            GETDATE()) / 60.0
        FROM etl_schedule es
        WHERE es.component_id = @component_id;
        
        -- ============================================
        -- STEP 2: CHECK SOURCE DATABASE FOR CHANGES
        -- ============================================
        -- Count changed rows and get latest updatedDate
        SELECT 
            @changed_rows = COUNT(*),
            @latest_updatedDate = MAX(srar.updatedDate)
        FROM [CMMSOFFLINE].[dbo].T_SRARMthlyEquipments srar WITH (NOLOCK)
        INNER JOIN [CMMSOFFLINE].[dbo].T_SRARMthlyHeader hdr WITH (NOLOCK)
            ON srar.Universal_ID_T_SRARMthlyHeader = hdr.Universal_ID_T_SRARMthlyHeader
        INNER JOIN [CMMSOFFLINE].[dbo].T_EquipmentShipDetail esd WITH (NOLOCK)
            ON srar.Universal_ID_T_EquipmentShipDetail = esd.Universal_ID_T_EquipmentShipDetail
        INNER JOIN [CMMSOFFLINE].[dbo].M_Ship ship WITH (NOLOCK)
            ON esd.Universal_ID_M_Ship = ship.Universal_ID_M_Ship
        WHERE ship.ShipName = @ship_name
          AND esd.Nomenclature = @nomenclature
          AND srar.Active = 1
          AND hdr.Active = 1
          AND srar.updatedDate > @last_watermark;
        
        -- Get total source row count
        SELECT @source_row_count = COUNT(*)
        FROM [CMMSOFFLINE].[dbo].T_SRARMthlyEquipments srar WITH (NOLOCK)
        INNER JOIN [CMMSOFFLINE].[dbo].T_SRARMthlyHeader hdr WITH (NOLOCK)
            ON srar.Universal_ID_T_SRARMthlyHeader = hdr.Universal_ID_T_SRARMthlyHeader
        INNER JOIN [CMMSOFFLINE].[dbo].T_EquipmentShipDetail esd WITH (NOLOCK)
            ON srar.Universal_ID_T_EquipmentShipDetail = esd.Universal_ID_T_EquipmentShipDetail
        INNER JOIN [CMMSOFFLINE].[dbo].M_Ship ship WITH (NOLOCK)
            ON esd.Universal_ID_M_Ship = ship.Universal_ID_M_Ship
        WHERE ship.ShipName = @ship_name
          AND esd.Nomenclature = @nomenclature
          AND srar.Active = 1
          AND hdr.Active = 1;
        
        -- ============================================
        -- STEP 3: GET TARGET ROW COUNT
        -- ============================================
        SELECT @target_row_count = COUNT(*)
        FROM monthly_utilization
        WHERE component_id = @component_id;
        
        -- ============================================
        -- STEP 4: DECISION LOGIC
        -- ============================================
        IF @last_watermark = '1900-01-01'
        BEGIN
            -- First run - always sync
            SET @needs_sync = 1;
            SET @decision_reason = 'first_run';
            SET @risk_score = 100; -- Highest priority
        END
        ELSE IF @changed_rows > 0
        BEGIN
            -- Data changes detected
            SET @needs_sync = 1;
            SET @decision_reason = 'data_changed';
            
            -- Calculate risk score (0-100)
            DECLARE @volume_score FLOAT = (CAST(@changed_rows AS FLOAT) / 100.0) * 40.0;
            DECLARE @time_score FLOAT = (@hours_since_last_sync / 24.0) * 30.0;
            DECLARE @drift_score FLOAT = 0;
            
            IF @source_row_count > 0 AND @target_row_count > 0
            BEGIN
                DECLARE @row_diff_percent FLOAT = ABS(CAST(@source_row_count - @target_row_count AS FLOAT) / CAST(@source_row_count AS FLOAT)) * 100.0;
                SET @drift_score = (@row_diff_percent / 100.0) * 30.0;
            END
            
            SET @risk_score = CAST(
                CASE 
                    WHEN (@volume_score + @time_score + @drift_score) > 100 THEN 100
                    ELSE (@volume_score + @time_score + @drift_score)
                END AS INT
            );
        END
        ELSE IF ABS(@source_row_count - @target_row_count) > 5
        BEGIN
            -- Row count mismatch (tolerance: 5 rows)
            SET @needs_sync = 1;
            SET @decision_reason = 'row_count_mismatch';
            SET @risk_score = 50; -- Medium priority
        END
        ELSE
        BEGIN
            -- No changes
            SET @needs_sync = 0;
            SET @decision_reason = 'no_changes';
            SET @risk_score = 0;
        END
        
        -- ============================================
        -- STEP 5: UPDATE ETL_SCHEDULE
        -- ============================================
        UPDATE etl_schedule
        SET rows_changed_since_last_check = @changed_rows,
            last_change_detected = CASE WHEN @needs_sync = 1 THEN GETDATE() ELSE last_change_detected END,
            sync_risk_score = @risk_score,
            updated_at = GETDATE()
        WHERE component_id = @component_id;
        
        -- ============================================
        -- STEP 6: LOG TO WATCHMAN AUDIT
        -- ============================================
        SET @check_duration_ms = DATEDIFF(MILLISECOND, @check_start_time, GETDATE());
        
        INSERT INTO watchman_audit_log (
            audit_id,
            component_id,
            check_timestamp,
            needs_sync,
            decision_reason,
            source_row_count,
            target_row_count,
            changed_rows_count,
            source_watermark,
            check_duration_ms,
            job_queued,
            triggered_by
        )
        VALUES (
            NEWID(),
            @component_id,
            GETDATE(),
            @needs_sync,
            @decision_reason,
            @source_row_count,
            @target_row_count,
            @changed_rows,
            @latest_updatedDate,
            @check_duration_ms,
            @needs_sync, -- Job will be queued if needs_sync=1
            @triggered_by
        );
        
        -- ============================================
        -- STEP 7: RETURN RESULT
        -- ============================================
        SELECT 
            component_id = @component_id,
            needs_sync = @needs_sync,
            decision_reason = @decision_reason,
            changed_rows = @changed_rows,
            source_count = @source_row_count,
            target_count = @target_row_count,
            source_watermark = @latest_updatedDate,
            last_watermark = CASE WHEN @last_watermark = '1900-01-01' THEN NULL ELSE @last_watermark END,
            risk_score = @risk_score,
            check_duration_ms = @check_duration_ms;
        
    END TRY
    BEGIN CATCH
        DECLARE @error_message NVARCHAR(MAX) = ERROR_MESSAGE();
        DECLARE @error_line INT = ERROR_LINE();
        
        -- Log error
        INSERT INTO watchman_audit_log (
            audit_id,
            component_id,
            check_timestamp,
            needs_sync,
            decision_reason,
            triggered_by
        )
        VALUES (
            NEWID(),
            @component_id,
            GETDATE(),
            0,
            'error: ' + @error_message,
            @triggered_by
        );
        
        -- Return error
        SELECT 
            component_id = @component_id,
            needs_sync = 0,
            decision_reason = 'error',
            error_message = 'Line ' + CAST(@error_line AS VARCHAR(10)) + ': ' + @error_message;
        
        RAISERROR(@error_message, 16, 1);
    END CATCH
END
GO