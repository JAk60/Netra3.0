SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Overhaul Watchman: Check Single Component
-- Description: Detects if component needs overhaul sync by checking DefectDate watermark
-- =============================================

CREATE OR ALTER PROCEDURE [dbo].[sp_oh_watchman_check]
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
    DECLARE @latest_defect_date DATETIME2;
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
            AND es.etl_type = 'overhaul_readings'  -- ⚡ CRITICAL FILTER
        WHERE sc.component_id = @component_id
          AND sc.etl = 1;
        
        -- Check if component exists
        IF @ship_name IS NULL OR @nomenclature IS NULL
        BEGIN
            DECLARE @error_msg NVARCHAR(200) = 'Component not found or ETL not enabled: ' + CAST(@component_id AS NVARCHAR(50));
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
        WHERE es.component_id = @component_id
          AND es.etl_type = 'overhaul_readings';
        
        -- ============================================
        -- STEP 2: CHECK SOURCE DATABASE FOR NEW DEFECTS
        -- ============================================
        SELECT 
            @changed_rows = COUNT(*),
            @latest_defect_date = MAX(T_Dart.DefectDate)
        FROM [CMMSOFFLINE].[dbo].t_DART WITH (NOLOCK)
        INNER JOIN [CMMSOFFLINE].[dbo].T_EquipmentShipDetail WITH (NOLOCK) 
            ON T_Dart.Universal_ID_T_EquipmentShipDetail = T_EquipmentShipDetail.Universal_ID_T_EquipmentShipDetail
        INNER JOIN [CMMSOFFLINE].[dbo].M_Ship WITH (NOLOCK) 
            ON T_EquipmentShipDetail.Universal_ID_M_Ship = M_Ship.Universal_ID_M_Ship
        WHERE T_EquipmentShipDetail.Nomenclature = @nomenclature
          AND M_Ship.ShipName = @ship_name
          AND T_Dart.Active = 1
          AND T_EquipmentShipDetail.Active = 1
          AND T_Dart.Is_Defect = 1
          AND T_Dart.RoutineDefect = 2
          AND T_Dart.DefectDate IS NOT NULL
          AND T_Dart.DefectDate > @last_watermark;
        
        -- Get total source defect count
        SELECT @source_row_count = COUNT(*)
        FROM [CMMSOFFLINE].[dbo].t_DART WITH (NOLOCK)
        INNER JOIN [CMMSOFFLINE].[dbo].T_EquipmentShipDetail WITH (NOLOCK) 
            ON T_Dart.Universal_ID_T_EquipmentShipDetail = T_EquipmentShipDetail.Universal_ID_T_EquipmentShipDetail
        INNER JOIN [CMMSOFFLINE].[dbo].M_Ship WITH (NOLOCK) 
            ON T_EquipmentShipDetail.Universal_ID_M_Ship = M_Ship.Universal_ID_M_Ship
        WHERE T_EquipmentShipDetail.Nomenclature = @nomenclature
          AND M_Ship.ShipName = @ship_name
          AND T_Dart.Active = 1
          AND T_EquipmentShipDetail.Active = 1
          AND T_Dart.Is_Defect = 1
          AND T_Dart.RoutineDefect = 2
          AND T_Dart.DefectDate IS NOT NULL;
        
        -- ============================================
        -- STEP 3: GET TARGET ROW COUNT
        -- ============================================
        SELECT @target_row_count = COUNT(*)
        FROM Overhaul_Readings
        WHERE component_id = @component_id;
        
        -- ============================================
        -- STEP 4: DECISION LOGIC
        -- ============================================
        IF @last_watermark = '1900-01-01'
        BEGIN
            SET @needs_sync = 1;
            SET @decision_reason = 'first_run';
            SET @risk_score = 100;
        END
        ELSE IF @changed_rows > 0
        BEGIN
            SET @needs_sync = 1;
            SET @decision_reason = 'new_defects_detected';
            
            DECLARE @volume_score FLOAT = (CAST(@changed_rows AS FLOAT) / 50.0) * 40.0;
            DECLARE @time_score FLOAT = (@hours_since_last_sync / 168.0) * 30.0;
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
        ELSE IF ABS(@source_row_count - @target_row_count) > 10
        BEGIN
            SET @needs_sync = 1;
            SET @decision_reason = 'row_count_mismatch';
            SET @risk_score = 50;
        END
        ELSE
        BEGIN
            SET @needs_sync = 0;
            SET @decision_reason = 'no_changes';
            SET @risk_score = 0;
        END
        
        -- ============================================
        -- STEP 5: UPDATE ETL_SCHEDULE
        -- ============================================
        IF NOT EXISTS (
            SELECT 1 FROM etl_schedule 
            WHERE component_id = @component_id 
            AND etl_type = 'overhaul_readings'
        )
        BEGIN
            INSERT INTO etl_schedule (
                component_id, 
                etl_type, 
                frequency_minutes, 
                status, 
                retry_count, 
                max_retries,
                next_run_time, 
                source_watermark, 
                rows_changed_since_last_check, 
                sync_risk_score, 
                cancellation_requested,  -- ⚡ ADDED
                created_at, 
                updated_at
            )
            VALUES (
                @component_id, 
                'overhaul_readings', 
                60, 
                'idle', 
                0, 
                3,
                DATEADD(MINUTE, 60, GETDATE()), 
                NULL, 
                @changed_rows, 
                @risk_score, 
                0,  -- ⚡ ADDED - cancellation_requested default
                GETDATE(), 
                GETDATE()
            );
        END
        ELSE
        BEGIN
            UPDATE etl_schedule
            SET rows_changed_since_last_check = @changed_rows,
                last_change_detected = CASE WHEN @needs_sync = 1 THEN GETDATE() ELSE last_change_detected END,
                sync_risk_score = @risk_score,
                updated_at = GETDATE()
            WHERE component_id = @component_id
              AND etl_type = 'overhaul_readings';
        END
        
        -- ============================================
        -- STEP 6: LOG TO WATCHMAN AUDIT
        -- ============================================
        SET @check_duration_ms = DATEDIFF(MILLISECOND, @check_start_time, GETDATE());
        
        INSERT INTO watchman_audit_log (
            audit_id, component_id, check_timestamp, needs_sync, decision_reason,
            source_row_count, target_row_count, changed_rows_count, source_watermark,
            check_duration_ms, job_queued, triggered_by
        )
        VALUES (
            NEWID(), @component_id, GETDATE(), @needs_sync, 'overhaul:' + @decision_reason,
            @source_row_count, @target_row_count, @changed_rows, @latest_defect_date,
            @check_duration_ms, @needs_sync, @triggered_by
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
            source_watermark = @latest_defect_date,
            last_watermark = CASE WHEN @last_watermark = '1900-01-01' THEN NULL ELSE @last_watermark END,
            risk_score = @risk_score,
            check_duration_ms = @check_duration_ms;
        
    END TRY
    BEGIN CATCH
        DECLARE @error_message NVARCHAR(MAX) = ERROR_MESSAGE();
        DECLARE @error_line INT = ERROR_LINE();
        
        -- Truncate error message to fit in decision_reason (100 chars max)
        DECLARE @short_error VARCHAR(100);
        SET @short_error = LEFT('overhaul:error', 100);
        
        INSERT INTO watchman_audit_log (
            audit_id, component_id, check_timestamp, needs_sync, 
            decision_reason, triggered_by
        )
        VALUES (
            NEWID(), @component_id, GETDATE(), 0,
            @short_error, @triggered_by
        );
        
        SELECT 
            component_id = @component_id,
            needs_sync = 0,
            decision_reason = 'error',
            error_message = 'Line ' + CAST(@error_line AS VARCHAR(10)) + ': ' + @error_message;
        
        RAISERROR(@error_message, 16, 1);
    END CATCH
END
GO

PRINT '✅ sp_oh_watchman_check created successfully';
GO