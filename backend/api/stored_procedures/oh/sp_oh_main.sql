SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Overhaul Main: Process Single Component
-- Description: Main SP that processes overhaul data for one component
-- =============================================

CREATE OR ALTER PROCEDURE [dbo].[sp_oh_main]
    @ship_name VARCHAR(255),
    @nomenclature NVARCHAR(MAX),
    @session_id INT,
    @component_id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @start_time DATETIME2 = GETDATE();
    DECLARE @rows_affected INT = 0;
    
    BEGIN TRY
        -- ============================================
        -- CREATE TEMP TABLES
        -- ============================================
        CREATE TABLE #DefectDates (
            defect_date DATE,
            defect_day INT
        );
        
        CREATE TABLE #OperationalData (
            operation_date DATE,
            average_running FLOAT
        );
        
        CREATE TABLE #FinalResults (
            component_id UNIQUEIDENTIFIER,
            defect_date DATE,
            cmms_running_age FLOAT
        );
        
        -- ============================================
        -- STEP 1: GET DEFECT DATES FROM SOURCE
        -- ============================================
        INSERT INTO #DefectDates (defect_date, defect_day)
        SELECT DISTINCT
            CONVERT(DATE, T_Dart.DefectDate, 23) AS defect_date,
            DAY(T_Dart.DefectDate) AS defect_day
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
        -- STEP 2: GET OPERATIONAL DATA (SRAR)
        -- ============================================
        INSERT INTO #OperationalData (operation_date, average_running)
        SELECT DISTINCT
            DATEFROMPARTS(T_SRARMthlyHeader.SrarYear, T_SRARMthlyHeader.SrarMonth, 1) AS operation_date,
            ISNULL(T_SRARMthlyEquipments.HrsForMonth, 0) AS average_running
        FROM [CMMSOFFLINE].[dbo].T_SRARMthlyEquipments WITH (NOLOCK)
        INNER JOIN [CMMSOFFLINE].[dbo].T_SRARMthlyHeader WITH (NOLOCK) 
            ON T_SRARMthlyEquipments.Universal_ID_T_SRARMthlyHeader = T_SRARMthlyHeader.Universal_ID_T_SRARMthlyHeader
        INNER JOIN [CMMSOFFLINE].[dbo].T_EquipmentShipDetail WITH (NOLOCK) 
            ON T_SRARMthlyEquipments.Universal_ID_T_EquipmentShipDetail = T_EquipmentShipDetail.Universal_ID_T_EquipmentShipDetail
        INNER JOIN [CMMSOFFLINE].[dbo].M_Ship WITH (NOLOCK) 
            ON T_EquipmentShipDetail.Universal_ID_M_Ship = M_Ship.Universal_ID_M_Ship
        WHERE T_SRARMthlyHeader.Active = 1 
          AND T_SRARMthlyEquipments.Active = 1
          AND T_SRARMthlyHeader.SrarYear IS NOT NULL
          AND T_SRARMthlyHeader.SrarMonth BETWEEN 1 AND 12
          AND M_Ship.ShipName = @ship_name
          AND T_EquipmentShipDetail.Nomenclature = @nomenclature;
        
        -- ============================================
        -- STEP 3: CALCULATE INTERPOLATED AGE
        -- ============================================
        INSERT INTO #FinalResults (component_id, defect_date, cmms_running_age)
        SELECT 
            @component_id AS component_id,
            dd.defect_date,
            ISNULL(cumulative_sum, 0) + ISNULL((avg_daily_rate * dd.defect_day), 0) AS cmms_running_age
        FROM #DefectDates dd
        CROSS APPLY (
            SELECT SUM(average_running) AS cumulative_sum
            FROM #OperationalData
            WHERE operation_date <= DATEFROMPARTS(YEAR(dd.defect_date), MONTH(dd.defect_date), 1)
        ) cum_calc
        CROSS APPLY (
            SELECT AVG(average_running) / 30.0 AS avg_daily_rate
            FROM (
                SELECT TOP 5 average_running
                FROM #OperationalData
                WHERE operation_date <= DATEFROMPARTS(YEAR(dd.defect_date), MONTH(dd.defect_date), 1)
                  AND average_running > 0
                ORDER BY operation_date DESC
            ) AS last_5_months
        ) daily_calc;
        
        -- ============================================
        -- STEP 4: MERGE INTO TARGET TABLE
        -- ============================================
        MERGE Overhaul_Readings AS target
        USING #FinalResults AS source
        ON target.component_id = source.component_id AND target.defect_date = source.defect_date
        WHEN MATCHED THEN
            UPDATE SET
                target.cmms_running_age = source.cmms_running_age,
                target.maintenance_type = 'Corrective Maintenance'
                -- ⚡ REMOVED: target.running_age = NULL (column doesn't allow NULL)
        WHEN NOT MATCHED THEN
            INSERT (id, component_id, maintenance_type, defect_date, cmms_running_age, running_age)
            VALUES (NEWID(), source.component_id, 'Corrective Maintenance', 
                    source.defect_date, source.cmms_running_age, 0);
        
        SET @rows_affected = @@ROWCOUNT;
        
        -- ============================================
        -- CLEANUP & RETURN
        -- ============================================
        DROP TABLE #DefectDates;
        DROP TABLE #OperationalData;
        DROP TABLE #FinalResults;
        
        SELECT 
            session_id = @session_id,
            component_id = @component_id,
            rows_affected = @rows_affected;
        
        PRINT '✅ Overhaul processing complete | Rows: ' + CAST(@rows_affected AS VARCHAR);
        
    END TRY
    BEGIN CATCH
        IF OBJECT_ID('tempdb..#DefectDates') IS NOT NULL DROP TABLE #DefectDates;
        IF OBJECT_ID('tempdb..#OperationalData') IS NOT NULL DROP TABLE #OperationalData;
        IF OBJECT_ID('tempdb..#FinalResults') IS NOT NULL DROP TABLE #FinalResults;
        
        THROW
    END CATCH
END
GO

PRINT '✅ sp_oh_main created successfully';
GO