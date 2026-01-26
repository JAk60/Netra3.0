SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Overhaul Watchman: Batch Check All Components
-- Description: Checks all enabled components for overhaul data changes
-- =============================================

CREATE OR ALTER PROCEDURE [dbo].[sp_oh_watchman_batch]
    @triggered_by VARCHAR(50) = 'beat_schedule'
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @batch_start_time DATETIME2 = GETDATE();
    DECLARE @total_components INT = 0;
    DECLARE @needs_sync_count INT = 0;
    DECLARE @total_changed_rows INT = 0;
    DECLARE @batch_duration_ms INT;
    
    CREATE TABLE #WatchmanResults (
        component_id UNIQUEIDENTIFIER,
        needs_sync BIT,
        decision_reason VARCHAR(100),
        changed_rows INT,
        source_count INT,
        target_count INT,
        source_watermark DATETIME2,
        risk_score INT,
        check_duration_ms INT,
        error_message NVARCHAR(MAX)
    );
    
    BEGIN TRY
        DECLARE @component_id UNIQUEIDENTIFIER;
        
        CREATE TABLE #ComponentsToCheck (
            component_id UNIQUEIDENTIFIER,
            priority INT
        );
        
        INSERT INTO #ComponentsToCheck (component_id, priority)
        SELECT 
            sc.component_id,
            CASE WHEN EXISTS (
                SELECT 1 FROM etl_schedule es 
                WHERE es.component_id = sc.component_id
                AND es.etl_type = 'overhaul_readings'
            ) THEN 0 ELSE 1 END AS priority
        FROM system_configuration sc
        WHERE sc.etl = 1
          AND sc.component_id IS NOT NULL
          AND sc.nomenclature IS NOT NULL
          AND sc.ship_id IS NOT NULL
        GROUP BY sc.component_id;
        
        DECLARE component_cursor CURSOR LOCAL FAST_FORWARD FOR
        SELECT component_id
        FROM #ComponentsToCheck
        ORDER BY priority DESC, component_id;
        
        OPEN component_cursor;
        FETCH NEXT FROM component_cursor INTO @component_id;
        
        WHILE @@FETCH_STATUS = 0
        BEGIN
            SET @total_components = @total_components + 1;
            
            BEGIN TRY
                INSERT INTO #WatchmanResults (
                    component_id, needs_sync, decision_reason, changed_rows,
                    source_count, target_count, source_watermark, risk_score, check_duration_ms
                )
                EXEC sp_oh_watchman_check 
                    @component_id = @component_id,
                    @triggered_by = @triggered_by;
            END TRY
            BEGIN CATCH
                INSERT INTO #WatchmanResults (
                    component_id, needs_sync, decision_reason, changed_rows, risk_score, error_message
                )
                VALUES (
                    @component_id, 0, 'error', 0, 0, ERROR_MESSAGE()
                );
            END CATCH
            
            FETCH NEXT FROM component_cursor INTO @component_id;
        END
        
        CLOSE component_cursor;
        DEALLOCATE component_cursor;
        DROP TABLE #ComponentsToCheck;
        
        SELECT 
            @needs_sync_count = COUNT(*),
            @total_changed_rows = SUM(changed_rows)
        FROM #WatchmanResults
        WHERE needs_sync = 1;
        
        SET @batch_duration_ms = DATEDIFF(MILLISECOND, @batch_start_time, GETDATE());
        
        DECLARE @stat_date DATE = CAST(GETDATE() AS DATE);
        DECLARE @avg_check_ms FLOAT;
        
        SELECT @avg_check_ms = AVG(CAST(check_duration_ms AS FLOAT))
        FROM #WatchmanResults
        WHERE check_duration_ms IS NOT NULL;
        
        MERGE INTO watchman_statistics AS target
        USING (
            SELECT 
                @stat_date AS stat_date,
                @total_components AS batch_checks,
                @needs_sync_count AS batch_syncs,
                (@total_components - @needs_sync_count) AS batch_skips,
                ISNULL(@avg_check_ms, 0) AS avg_duration,
                ISNULL(@total_changed_rows, 0) AS rows_synced
        ) AS source
        ON target.stat_date = source.stat_date
        WHEN MATCHED THEN
            UPDATE SET
                total_checks = ISNULL(target.total_checks, 0) + source.batch_checks,
                syncs_triggered = ISNULL(target.syncs_triggered, 0) + source.batch_syncs,
                syncs_skipped = ISNULL(target.syncs_skipped, 0) + source.batch_skips,
                avg_check_duration_ms = (ISNULL(target.avg_check_duration_ms, 0) + source.avg_duration) / 2.0,
                total_rows_synced = ISNULL(target.total_rows_synced, 0) + source.rows_synced,
                skip_rate_percent = (CAST(ISNULL(target.syncs_skipped, 0) + source.batch_skips AS FLOAT) / 
                    CAST(ISNULL(target.total_checks, 0) + source.batch_checks AS FLOAT) * 100.0)
        WHEN NOT MATCHED THEN
            INSERT (stat_id, stat_date, total_checks, syncs_triggered, syncs_skipped,
                    avg_check_duration_ms, total_rows_synced, skip_rate_percent, created_at)
            VALUES (NEWID(), source.stat_date, source.batch_checks, source.batch_syncs, source.batch_skips,
                    source.avg_duration, source.rows_synced,
                    CASE WHEN source.batch_checks > 0 
                         THEN (CAST(source.batch_skips AS FLOAT) / CAST(source.batch_checks AS FLOAT) * 100.0)
                         ELSE 0 END, GETDATE());
        
        SELECT 
            wr.component_id, sc.nomenclature AS component_name, s.ship_name,
            wr.needs_sync, wr.decision_reason, wr.changed_rows, wr.source_count,
            wr.target_count, wr.source_watermark, wr.risk_score, wr.check_duration_ms,
            wr.error_message, es.last_run_time, es.next_run_time, es.status
        FROM #WatchmanResults wr
        INNER JOIN system_configuration sc ON wr.component_id = sc.component_id
        INNER JOIN ships s ON sc.ship_id = s.ship_id
        LEFT JOIN etl_schedule es ON wr.component_id = es.component_id AND es.etl_type = 'overhaul_readings'
        WHERE wr.needs_sync = 1
        ORDER BY wr.risk_score DESC, wr.changed_rows DESC;
        
        SELECT 
            total_components = @total_components,
            needs_sync = @needs_sync_count,
            up_to_date = @total_components - @needs_sync_count,
            total_changed_rows = @total_changed_rows,
            avg_check_duration_ms = @avg_check_ms,
            batch_duration_ms = @batch_duration_ms,
            check_timestamp = GETDATE(),
            efficiency_percent = CASE 
                WHEN @total_components > 0 
                THEN (CAST(@total_components - @needs_sync_count AS FLOAT) / CAST(@total_components AS FLOAT) * 100.0)
                ELSE 0 END;
        
        DROP TABLE #WatchmanResults;
        
        PRINT '🔧 Overhaul Watchman: ' + CAST(@total_components AS VARCHAR) + ' components | ' + 
              CAST(@needs_sync_count AS VARCHAR) + ' need sync';
        
    END TRY
    BEGIN CATCH
        IF OBJECT_ID('tempdb..#WatchmanResults') IS NOT NULL DROP TABLE #WatchmanResults;
        IF OBJECT_ID('tempdb..#ComponentsToCheck') IS NOT NULL DROP TABLE #ComponentsToCheck;
        
         THROW;
    END CATCH
END
GO

PRINT '✅ sp_oh_watchman_batch created successfully';
GO