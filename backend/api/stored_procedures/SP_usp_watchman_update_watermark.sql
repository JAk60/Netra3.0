-- =============================================
-- Watchman: Update Watermark After Successful Sync
-- Description: Called after ETL job completes to save new watermark
-- =============================================

CREATE OR ALTER PROCEDURE [dbo].[usp_watchman_update_watermark]
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
            DECLARE @error_msg NVARCHAR(200) = 'Component not found: ' + CAST(@component_id AS NVARCHAR(50));
            RAISERROR(@error_msg, 16, 1);
            RETURN;
        END
        
        -- ============================================
        -- STEP 2: GET NEW WATERMARK FROM SOURCE
        -- ============================================
        SELECT @new_watermark = MAX(srar.updatedDate)
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
        -- STEP 3: GET SYNC DURATION (if execution_id provided)
        -- ============================================
        IF @execution_id IS NOT NULL
        BEGIN
            SELECT @sync_duration_seconds = duration_seconds
            FROM etl_execution_progress
            WHERE execution_id = @execution_id;
        END
        
        -- ============================================
        -- STEP 4: UPDATE ETL_SCHEDULE WITH NEW WATERMARK
        -- ============================================
        UPDATE etl_schedule
        SET source_watermark = @new_watermark,
            target_watermark = GETDATE(),
            rows_changed_since_last_check = 0,
            sync_risk_score = 0,
            last_sync_start = CASE 
                WHEN @execution_id IS NOT NULL THEN (
                    SELECT start_time 
                    FROM etl_execution_progress 
                    WHERE execution_id = @execution_id
                )
                ELSE last_sync_start
            END,
            last_sync_duration_seconds = ISNULL(@sync_duration_seconds, last_sync_duration_seconds),
            updated_at = GETDATE()
        WHERE component_id = @component_id;
        
        -- Verify update
        IF @@ROWCOUNT = 0
        BEGIN
            -- Component not in etl_schedule yet, insert it
            INSERT INTO etl_schedule (
                component_id,
                source_watermark,
                target_watermark,
                rows_changed_since_last_check,
                sync_risk_score,
                last_sync_start,
                last_sync_duration_seconds,
                frequency_minutes,
                status,
                created_at,
                updated_at
            )
            VALUES (
                @component_id,
                @new_watermark,
                GETDATE(),
                0,
                0,
                GETDATE(),
                @sync_duration_seconds,
                5, -- Default frequency
                'idle',
                GETDATE(),
                GETDATE()
            );
        END
        
        -- ============================================
        -- STEP 5: UPDATE WATCHMAN AUDIT LOG
        -- ============================================
        -- Mark the most recent audit entry as synced
        -- Use subquery to get audit_id first, then update
        DECLARE @audit_id_to_update UNIQUEIDENTIFIER;
        
        SELECT TOP 1 @audit_id_to_update = audit_id
        FROM watchman_audit_log
        WHERE component_id = @component_id
          AND needs_sync = 1
          AND job_queued = 0
        ORDER BY check_timestamp DESC;
        
        IF @audit_id_to_update IS NOT NULL
        BEGIN
            UPDATE watchman_audit_log
            SET job_queued = 1,
                execution_id = @execution_id
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
        -- STEP 7: RETURN SUCCESS
        -- ============================================
        SELECT 
            component_id = @component_id,
            new_watermark = @new_watermark,
            watermark_updated = 1,
            target_watermark = GETDATE(),
            rows_synced = @rows_synced,
            message = 'Watermark updated successfully';
        
        PRINT 'Watermark updated for component: ' + CAST(@component_id AS VARCHAR(50));
        PRINT 'New watermark: ' + ISNULL(CAST(@new_watermark AS VARCHAR(50)), 'NULL');
        
    END TRY
    BEGIN CATCH
        DECLARE @error_message NVARCHAR(MAX) = ERROR_MESSAGE();
        DECLARE @error_line INT = ERROR_LINE();
        
        PRINT 'Failed to update watermark for component: ' + CAST(@component_id AS VARCHAR(50));
        PRINT 'Error: Line ' + CAST(@error_line AS VARCHAR(10)) + ': ' + @error_message;
        
        -- Return error but don't fail (watermark update is not critical)
        SELECT 
            component_id = @component_id,
            watermark_updated = 0,
            error_message = 'Line ' + CAST(@error_line AS VARCHAR(10)) + ': ' + @error_message;
        
        -- Don't raise error - just log it
    END CATCH
END
GO