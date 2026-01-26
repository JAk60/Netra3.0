-- =============================================
-- Watchman: Batch Check All Components
-- Description: Checks all enabled components and returns those needing sync
-- =============================================

CREATE OR ALTER PROCEDURE [dbo].[usp_watchman_check_batch]
    @triggered_by VARCHAR(50) = 'beat_schedule'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @batch_start_time DATETIME2 = GETDATE();
    DECLARE @total_components INT = 0;
    DECLARE @needs_sync_count INT = 0;
    DECLARE @total_changed_rows INT = 0;
    DECLARE @batch_duration_ms INT;

    -- Temp table to store check results
    CREATE TABLE #WatchmanResults
    (
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
        -- ============================================
        -- STEP 1: GET ALL COMPONENTS TO CHECK
        -- ============================================
        DECLARE @component_id UNIQUEIDENTIFIER;
        
        -- Use temp table to avoid DISTINCT + ORDER BY conflict
        CREATE TABLE #ComponentsToCheck
    (
        component_id UNIQUEIDENTIFIER,
        priority INT
    );
        
        -- Insert components with priority
        INSERT INTO #ComponentsToCheck
        (component_id, priority)
    SELECT
        sc.component_id,
        CASE WHEN EXISTS (
                SELECT 1
        FROM etl_schedule es
        WHERE es.component_id = sc.component_id
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
    ORDER BY priority, component_id;
        
        -- ============================================
        -- STEP 2: CHECK EACH COMPONENT
        -- ============================================
        OPEN component_cursor;
        FETCH NEXT FROM component_cursor INTO @component_id;
        
        WHILE @@FETCH_STATUS = 0
        BEGIN
        SET @total_components = @total_components + 1;

        BEGIN TRY
                -- Call single component check
                INSERT INTO #WatchmanResults
            (
            component_id,
            needs_sync,
            decision_reason,
            changed_rows,
            source_count,
            target_count,
            source_watermark,
            risk_score,
            check_duration_ms
            )
        EXEC usp_watchman_check_component 
                    @component_id = @component_id,
                    @triggered_by = @triggered_by;
                
            END TRY
            BEGIN CATCH
                -- Log component error but continue
                INSERT INTO #WatchmanResults
            (
            component_id,
            needs_sync,
            decision_reason,
            changed_rows,
            risk_score,
            error_message
            )
        VALUES
            (
                @component_id,
                0,
                'error',
                0,
                0,
                ERROR_MESSAGE()
                );
            END CATCH

        FETCH NEXT FROM component_cursor INTO @component_id;
    END
        
        CLOSE component_cursor;
        DEALLOCATE component_cursor;
        
        DROP TABLE #ComponentsToCheck;
        
        -- ============================================
        -- STEP 3: CALCULATE BATCH STATISTICS
        -- ============================================
        SELECT
        @needs_sync_count = COUNT(*),
        @total_changed_rows = SUM(changed_rows)
    FROM #WatchmanResults
    WHERE needs_sync = 1;
        
        SET @batch_duration_ms = DATEDIFF(MILLISECOND, @batch_start_time, GETDATE());
        
        -- ============================================
        -- STEP 4: UPDATE DAILY STATISTICS
        -- ============================================
        DECLARE @stat_date DATE = CAST(GETDATE() AS DATE);
        DECLARE @avg_check_ms FLOAT;
        
        SELECT @avg_check_ms = AVG(CAST(check_duration_ms AS FLOAT))
    FROM #WatchmanResults
    WHERE check_duration_ms IS NOT NULL;
        
        -- Upsert daily stats
        MERGE INTO watchman_statistics AS target
        USING (
            SELECT
        @stat_date AS stat_date,
        @total_components AS batch_checks,
        @needs_sync_count AS batch_syncs,
        (@total_components - @needs_sync_count) AS batch_skips,
        @avg_check_ms AS avg_duration,
        @total_changed_rows AS rows_synced
        ) AS source
        ON target.stat_date = source.stat_date
        WHEN MATCHED THEN
            UPDATE SET
                total_checks = target.total_checks + source.batch_checks,
                syncs_triggered = target.syncs_triggered + source.batch_syncs,
                syncs_skipped = target.syncs_skipped + source.batch_skips,
                avg_check_duration_ms = (
                    ISNULL(target.avg_check_duration_ms, 0) + ISNULL(source.avg_duration, 0)
                ) / 2.0,
                total_rows_synced = target.total_rows_synced + source.rows_synced,
                skip_rate_percent = (
                    CAST(target.syncs_skipped + source.batch_skips AS FLOAT) / 
                    CAST(target.total_checks + source.batch_checks AS FLOAT) * 100.0
                )
        WHEN NOT MATCHED THEN
            INSERT (
                stat_id,
                stat_date,
                total_checks,
                syncs_triggered,
                syncs_skipped,
                avg_check_duration_ms,
                total_rows_synced,
                skip_rate_percent,
                created_at
            )
            VALUES (
                NEWID(),
                source.stat_date,
                source.batch_checks,
                source.batch_syncs,
                source.batch_skips,
                source.avg_duration,
                source.rows_synced,
                CASE 
                    WHEN source.batch_checks > 0 
                    THEN (CAST(source.batch_skips AS FLOAT) / CAST(source.batch_checks AS FLOAT) * 100.0)
                    ELSE 0 
                END,
                GETDATE()
            );
        
        -- ============================================
        -- STEP 5: RETURN COMPONENTS NEEDING SYNC
        -- ============================================
        -- Return components ordered by risk score (highest first)
        SELECT
        wr.component_id,
        sc.nomenclature AS component_name,
        s.ship_name,
        wr.needs_sync,
        wr.decision_reason,
        wr.changed_rows,
        wr.source_count,
        wr.target_count,
        wr.source_watermark,
        wr.risk_score,
        wr.check_duration_ms,
        wr.error_message,
        es.last_run_time,
        es.next_run_time
    FROM #WatchmanResults wr
        INNER JOIN system_configuration sc ON wr.component_id = sc.component_id
        INNER JOIN ships s ON sc.ship_id = s.ship_id
        LEFT JOIN etl_schedule es ON wr.component_id = es.component_id
    WHERE wr.needs_sync = 1
    ORDER BY wr.risk_score DESC, wr.changed_rows DESC;
        
        -- ============================================
        -- STEP 6: RETURN BATCH SUMMARY
        -- ============================================
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
                ELSE 0 
            END;
        
        -- ============================================
        -- CLEANUP
        -- ============================================
        DROP TABLE #WatchmanResults;
        
        PRINT 'Watchman Batch Check Complete';
        PRINT 'Total Components: ' + CAST(@total_components AS VARCHAR(10));
        PRINT 'Need Sync: ' + CAST(@needs_sync_count AS VARCHAR(10));
        PRINT 'Up to Date: ' + CAST(@total_components - @needs_sync_count AS VARCHAR(10));
        PRINT 'Batch Duration: ' + CAST(@batch_duration_ms AS VARCHAR(10)) + 'ms';
        
    END TRY
    BEGIN CATCH
        -- Cleanup on error
        IF OBJECT_ID('tempdb..#WatchmanResults') IS NOT NULL
            DROP TABLE #WatchmanResults;
        
        IF OBJECT_ID('tempdb..#ComponentsToCheck') IS NOT NULL
            DROP TABLE #ComponentsToCheck;
        
        DECLARE @error_message NVARCHAR(MAX) = ERROR_MESSAGE();
        DECLARE @error_line INT = ERROR_LINE();
        
        PRINT 'Watchman Batch Check Failed';
        PRINT 'Error: Line ' + CAST(@error_line AS VARCHAR(10)) + ': ' + @error_message;
        
        RAISERROR(@error_message, 16, 1);
    END CATCH
END
GO