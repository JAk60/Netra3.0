-- =============================================
-- ETL Stored Procedure: Overhaul Readings
-- Description: Extracts defect data, calculates interpolated age, and loads into Overhaul_Readings
-- =============================================

CREATE OR ALTER PROCEDURE [dbo].[usp_ETL_Overhaul_Readings]
AS
BEGIN
    SET NOCOUNT ON;
    
    -- ============================================
    -- DATABASE CONFIGURATION
    -- ============================================
    DECLARE @SourceDB VARCHAR(100) = 'SourceDatabase';  -- Replace with your source database name
    DECLARE @ClientDB VARCHAR(100) = 'ClientDatabase';  -- Replace with your client database name
    
    -- Error handling variables
    DECLARE @ErrorMessage NVARCHAR(4000);
    DECLARE @ErrorSeverity INT;
    DECLARE @ErrorState INT;
    
    -- Processing counters
    DECLARE @ProcessedCount INT = 0;
    DECLARE @ErrorCount INT = 0;
    
    BEGIN TRY
        -- ============================================
        -- TEMP TABLES
        -- ============================================
        
        -- Temp table for component configuration
        CREATE TABLE #ComponentConfig (
            component_id UNIQUEIDENTIFIER,
            nomenclature VARCHAR(MAX),
            ship_id UNIQUEIDENTIFIER,
            ship_name VARCHAR(MAX)
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
        
        SET @SQL = N'
        INSERT INTO #ComponentConfig (component_id, nomenclature, ship_id, ship_name)
        SELECT sc.component_id, sc.nomenclature, sc.ship_id, s.ship_name
        FROM ' + QUOTENAME(@ClientDB) + '.dbo.system_configuration sc
        INNER JOIN ' + QUOTENAME(@ClientDB) + '.dbo.ships s ON sc.ship_id = s.ship_id
        WHERE sc.etl = 1 
            AND sc.component_id IS NOT NULL 
            AND sc.nomenclature IS NOT NULL 
            AND sc.ship_id IS NOT NULL;';
        
        EXEC sp_executesql @SQL;
        
        -- ============================================
        -- STEP 2: LOOP THROUGH EACH COMPONENT
        -- ============================================
        DECLARE @ComponentID UNIQUEIDENTIFIER;
        DECLARE @Nomenclature VARCHAR(MAX);
        DECLARE @ShipID UNIQUEIDENTIFIER;
        DECLARE @ShipName VARCHAR(MAX);
        
        DECLARE component_cursor CURSOR LOCAL FAST_FORWARD FOR
        SELECT component_id, nomenclature, ship_id, ship_name
        FROM #ComponentConfig;
        
        OPEN component_cursor;
        FETCH NEXT FROM component_cursor INTO @ComponentID, @Nomenclature, @ShipID, @ShipName;
        
        WHILE @@FETCH_STATUS = 0
        BEGIN
            BEGIN TRY
                -- Clear temp tables for this component
                TRUNCATE TABLE #DefectDates;
                TRUNCATE TABLE #OperationalData;
                
                -- ============================================
                -- STEP 3: GET DEFECT DATES FROM SOURCE DB
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
                    AND T_Dart.DefectDate IS NOT NULL;';
                
                EXEC sp_executesql @SQL, 
                    N'@CompID UNIQUEIDENTIFIER, @Nomenclature VARCHAR(MAX), @ShipName VARCHAR(MAX)',
                    @CompID = @ComponentID,
                    @Nomenclature = @Nomenclature,
                    @ShipName = @ShipName;
                
                -- ============================================
                -- STEP 4: GET OPERATIONAL DATA (SRAR)
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
                    CASE 
                        WHEN current_age IS NULL THEN NULL
                        WHEN current_age = 0 THEN 0
                        ELSE current_age + (current_age / 30.0) * dd.defect_day
                    END AS cmms_running_age
                FROM #DefectDates dd
                CROSS APPLY (
                    -- Get current month's age or average of last 5 non-zero months
                    SELECT 
                        COALESCE(
                            NULLIF(curr.average_running, 0),
                            (
                                SELECT AVG(prev.average_running)
                                FROM (
                                    SELECT TOP 5 average_running
                                    FROM #OperationalData
                                    WHERE component_id = dd.component_id
                                        AND operation_date < DATEFROMPARTS(YEAR(dd.defect_date), MONTH(dd.defect_date), 1)
                                        AND average_running > 0
                                    ORDER BY operation_date DESC
                                ) AS prev
                            ),
                            0  -- If both current and previous are 0/NULL, default to 0
                        ) AS current_age
                    FROM (
                        SELECT average_running
                        FROM #OperationalData
                        WHERE component_id = dd.component_id
                            AND operation_date = DATEFROMPARTS(YEAR(dd.defect_date), MONTH(dd.defect_date), 1)
                    ) curr
                ) age_calc;
                
                SET @ProcessedCount = @ProcessedCount + @@ROWCOUNT;
                
            END TRY
            BEGIN CATCH
                SET @ErrorCount = @ErrorCount + 1;
                -- Log error but continue processing other components
                PRINT 'Error processing component: ' + CAST(@ComponentID AS VARCHAR(50)) + ' - ' + ERROR_MESSAGE();
            END CATCH
            
            FETCH NEXT FROM component_cursor INTO @ComponentID, @Nomenclature, @ShipID, @ShipName;
        END
        
        CLOSE component_cursor;
        DEALLOCATE component_cursor;
        
        -- ============================================
        -- STEP 6: MERGE INTO FINAL TABLE
        -- ============================================
        SET @SQL = N'
        MERGE ' + QUOTENAME(@ClientDB) + '.dbo.Overhaul_Readings AS target
        USING #FinalResults AS source
        ON target.component_id = source.component_id AND target.defect_date = source.defect_date
        WHEN MATCHED THEN
            UPDATE SET
                target.cmms_running_age = source.cmms_running_age,
                target.maintenance_type = ''Corrective Maintenance'',
                target.running_age = NULL
        WHEN NOT MATCHED THEN
            INSERT (id, component_id, maintenance_type, defect_date, cmms_running_age, running_age)
            VALUES (NEWID(), source.component_id, ''Corrective Maintenance'', source.defect_date, source.cmms_running_age, NULL);';
        
        EXEC sp_executesql @SQL;
        
        -- ============================================
        -- CLEANUP & RESULTS
        -- ============================================
        DROP TABLE #ComponentConfig;
        DROP TABLE #DefectDates;
        DROP TABLE #OperationalData;
        DROP TABLE #FinalResults;
        
        PRINT 'ETL Process Completed Successfully';
        PRINT 'Total Records Processed: ' + CAST(@ProcessedCount AS VARCHAR(10));
        PRINT 'Components with Errors: ' + CAST(@ErrorCount AS VARCHAR(10));
        
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