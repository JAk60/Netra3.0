SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Overhaul: Update Watermark After Successful Sync
-- Description: Updates watermark in etl_schedule for overhaul_readings type
-- =============================================

CREATE OR ALTER PROCEDURE [dbo].[sp_oh_update_watermark]
    @component_id UNIQUEIDENTIFIER,
    @execution_id UNIQUEIDENTIFIER = NULL,
    @rows_synced INT = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ship_name VARCHAR(255);
    DECLARE @nomenclature NVARCHAR(MAX);
    DECLARE @new_watermark DATETIME2;
    DECLARE @sync_duration_seconds INT;
    
    BEGIN TRY
        -- ============================================
        -- STEP 1: GET COMPONENT CONFIGURATION
        -- ============================================
        SELECT 
            @ship_name = s.ship_name,
            @nomenclature = sc.nomenclature
        FROM system_configuration sc
        INNER JOIN ships s ON sc.ship_id = s.ship_id
        WHERE sc.component_id = @component_id;
        
        IF @ship_name IS NULL OR @nomenclature IS NULL
        BEGIN
            RAISERROR('Component not found', 16, 1);
            RETURN;
        END
        
        -- ============================================
        -- STEP 2: GET NEW WATERMARK FROM SOURCE
        -- ============================================
        SELECT @new_watermark = MAX(T_Dart.DefectDate)
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
        -- STEP 3: GET SYNC DURATION
        -- ============================================
        IF @execution_id IS NOT NULL
        BEGIN
            SELECT @sync_duration_seconds = duration_seconds
            FROM etl_execution_progress
            WHERE execution_id = @execution_id;
        END
        
        -- ============================================
        -- STEP 4: UPDATE ETL_SCHEDULE
        -- ============================================
        IF EXISTS (
            SELECT 1 FROM etl_schedule 
            WHERE component_id = @component_id AND etl_type = 'overhaul_readings'
        )
        BEGIN
            UPDATE etl_schedule
            SET source_watermark = @new_watermark,
                target_watermark = GETDATE(),
                rows_changed_since_last_check = 0,
                sync_risk_score = 0,
                last_sync_start = CASE 
                    WHEN @execution_id IS NOT NULL THEN (
                        SELECT start_time FROM etl_execution_progress WHERE execution_id = @execution_id
                    )
                    ELSE last_sync_start
                END,
                last_sync_duration_seconds = ISNULL(@sync_duration_seconds, last_sync_duration_seconds),
                updated_at = GETDATE()
            WHERE component_id = @component_id AND etl_type = 'overhaul_readings';
        END
        ELSE
        BEGIN
            INSERT INTO etl_schedule (
                component_id, etl_type, frequency_minutes, status, retry_count, max_retries,
                next_run_time, source_watermark, target_watermark, rows_changed_since_last_check,
                sync_risk_score, last_sync_start, last_sync_duration_seconds, created_at, updated_at
            )
            VALUES (
                @component_id, 'overhaul_readings', 60, 'idle', 0, 3,
                DATEADD(HOUR, 1, GETDATE()), @new_watermark, GETDATE(), 0,
                0, GETDATE(), @sync_duration_seconds, GETDATE(), GETDATE()
            );
        END
        
        -- ============================================
        -- STEP 5: UPDATE WATCHMAN AUDIT LOG
        -- ============================================
        DECLARE @audit_id_to_update UNIQUEIDENTIFIER;
        
        SELECT TOP 1 @audit_id_to_update = audit_id
        FROM watchman_audit_log
        WHERE component_id = @component_id
          AND needs_sync = 1
          AND job_queued = 0
          AND decision_reason LIKE 'overhaul:%'
        ORDER BY check_timestamp DESC;
        
        IF @audit_id_to_update IS NOT NULL
        BEGIN
            UPDATE watchman_audit_log
            SET job_queued = 1, execution_id = @execution_id
            WHERE audit_id = @audit_id_to_update;
        END
        
        -- ============================================
        -- STEP 6: UPDATE DAILY STATISTICS
        -- ============================================
        DECLARE @stat_date DATE = CAST(GETDATE() AS DATE);
        
        UPDATE watchman_statistics
        SET total_rows_synced = total_rows_synced + ISNULL(@rows_synced, 0)
        WHERE stat_date = @stat_date;
        
        -- ============================================
        -- RETURN SUCCESS
        -- ============================================
        SELECT 
            component_id = @component_id,
            new_watermark = @new_watermark,
            watermark_updated = 1,
            rows_synced = @rows_synced,
            message = 'Watermark updated successfully';
        
        PRINT '✅ Overhaul watermark updated | Rows: ' + CAST(@rows_synced AS VARCHAR);
        
    END TRY
    BEGIN CATCH
        SELECT 
            component_id = @component_id,
            watermark_updated = 0,
            error_message = ERROR_MESSAGE();
    END CATCH
END
GO

PRINT '✅ sp_oh_update_watermark created successfully';
GO