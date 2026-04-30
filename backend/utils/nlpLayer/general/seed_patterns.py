"""
nlpLayer/general/seed_patterns.py  (REFINED v5)
-------------------------------------------------
Hand-written SQL templates for common GENERAL query shapes.
Run once at startup via seed_sql_patterns() — idempotent, skips existing keys.

All SQL is SQL Server T-SQL:
    - TOP(:limit) not LIMIT :limit  (and NOT OFFSET/FETCH — see OH_READ|ALL_OVERHAUL_COMP fix)
    - No direct ship_id on sensor_readings or monthly_utilization
      — always join via system_configuration
    - Overhaul_metadata.last_overhaul_date is NVARCHAR — CONVERT(DATE,...) for comparisons
    - 'utlization' column is intentionally misspelled in monthly_utilization
    - system_config_additional_info.component_id is nullable — guard with IS NOT NULL

═══════════════════════════════════════════════════════════════════════════════
CHANGES FROM v4
═══════════════════════════════════════════════════════════════════════════════

BUG FIX:
    OH_READ|CURRENT_AGE uses TOP(1) — correct for a single named component, but
    wrong for ship-wide or multi-ship age queries: TOP(1) returns the single most
    recent non-overhaul row across ALL component_ids, not one row per component.

    OH_READ|CURRENT_AGE_MULTI — new shape added.
    Uses ROW_NUMBER() PARTITION BY orr.component_id to get the most recent
    non-overhaul reading per component, then TOP(:limit) caps the outer result.
    Accepts :ship_ids (uuid[]) so multi-ship queries are supported.
    shape_router redirects OH_READ|SHIP → OH_READ|CURRENT_AGE_MULTI when
    _is_age_query() is True.

    OH_READ|SHIP — new shape added.
    Fills the pre-existing gap where has_ship_only=True resolved to this key
    in the shape table but no seed pattern existed. Handles genuine ship-level
    history dumps (no maintenance_type filter). Age queries are intercepted by
    shape_router before reaching downstream handlers, so this pattern only fires
    for "show all maintenance records on INS ONE"-style requests.
"""

from __future__ import annotations

SEED_PATTERNS = [

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # SHIPS
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    {
        "key": "SHIP|LIST",
        "description": "List all ships in the fleet",
        "sql_template": (
            "SELECT TOP(:limit) sh.ship_id, sh.ship_name, sh.ship_category, "
            "sh.ship_class, sh.command "
            "FROM ships sh "
            "ORDER BY sh.ship_name"
        ),
        "param_schema": {"limit": "int"},
        "tables_used": ["ships"],
    },

    {
        "key": "SHIP|DETAIL",
        "description": "Full detail for a single ship including department and component counts",
        "sql_template": (
            "SELECT TOP(:limit) sh.ship_id, sh.ship_name, sh.ship_category, "
            "sh.ship_class, sh.command, "
            "COUNT(DISTINCT d.department_id) AS department_count, "
            "COUNT(DISTINCT sc.component_id) AS component_count "
            "FROM ships sh "
            "LEFT JOIN departments d ON d.ship_id = sh.ship_id "
            "LEFT JOIN system_configuration sc ON sc.ship_id = sh.ship_id "
            "WHERE sh.ship_id = :ship_id "
            "GROUP BY sh.ship_id, sh.ship_name, sh.ship_category, sh.ship_class, sh.command"
        ),
        "param_schema": {"ship_id": "uuid", "limit": "int"},
        "tables_used": ["ships", "departments", "system_configuration"],
    },

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # DEPARTMENTS
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    {
        "key": "DEPT|SHIP",
        "description": "List all departments on a single ship",
        "sql_template": (
            "SELECT TOP(:limit) d.department_id, d.department_name, d.department_code, "
            "sh.ship_name "
            "FROM departments d "
            "JOIN ships sh ON d.ship_id = sh.ship_id "
            "WHERE d.ship_id = :ship_id "
            "ORDER BY d.department_name"
        ),
        "param_schema": {"ship_id": "uuid", "limit": "int"},
        "tables_used": ["departments", "ships"],
    },

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # SYSTEMS
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    {
        "key": "SYS|TYPE",
        "description": "List components belonging to a given system type on a ship",
        # system_type enum values: propulsion | power_generation | support | firing
        "sql_template": (
            "SELECT TOP(:limit) sc.component_id, sc.component_name, sc.nomenclature, "
            "sy.system_type, sh.ship_name "
            "FROM system_configuration sc "
            "JOIN systems sy ON sc.system_id = sy.system_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE sc.ship_id = :ship_id "
            "AND sy.system_type = :system_type "
            "ORDER BY sc.component_name"
        ),
        "param_schema": {"ship_id": "uuid", "system_type": "str", "limit": "int"},
        "tables_used": ["system_configuration", "systems", "ships"],
    },

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # COMPONENTS  (system_configuration)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    {
        "key": "COMP|AGG_SHIP",
        "description": "List all components on a single named ship",
        "sql_template": (
            "SELECT TOP(:limit) sc.nomenclature, sc.component_name, sc.component_id, "
            "sc.CMMS_EquipmentCode, sc.RepairType, sh.ship_name "
            "FROM system_configuration sc "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE sc.ship_id = :ship_id "
            "ORDER BY sc.component_name, sc.nomenclature"
        ),
        "param_schema": {"ship_id": "uuid", "limit": "int"},
        "tables_used": ["system_configuration", "ships"],
    },

    {
        "key": "COMP|DETAIL",
        "description": "Full detail for one or more specific components including department and system type",
        "sql_template": (
            "SELECT TOP(:limit) sc.component_id, sc.component_name, sc.nomenclature, "
            "sc.CMMS_EquipmentCode, sc.RepairType, sc.is_lmu, sc.parent_id, "
            "sh.ship_name, d.department_name, sy.system_type "
            "FROM system_configuration sc "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "JOIN departments d ON sc.department_id = d.department_id "
            "JOIN systems sy ON sc.system_id = sy.system_id "
            "WHERE sc.component_id IN (:component_ids)"
        ),
        "param_schema": {"component_ids": "uuid[]", "limit": "int"},
        "tables_used": ["system_configuration", "ships", "departments", "systems"],
    },

    {
        "key": "COMP|TOP_LEVEL_SHIP",
        "description": "Top-level (parent) components on a ship — components with no parent",
        "sql_template": (
            "SELECT TOP(:limit) sc.component_id, sc.component_name, sc.nomenclature, "
            "sc.RepairType, sh.ship_name "
            "FROM system_configuration sc "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE sc.ship_id = :ship_id "
            "AND sc.parent_id IS NULL "
            "ORDER BY sc.component_name"
        ),
        "param_schema": {"ship_id": "uuid", "limit": "int"},
        "tables_used": ["system_configuration", "ships"],
    },

    {
        "key": "COMP|CHILDREN",
        "description": "Direct child sub-assemblies of one or more parent components",
        "sql_template": (
            "SELECT TOP(:limit) sc.component_id, sc.component_name, sc.nomenclature, "
            "sc.RepairType, sc.parent_id, sh.ship_name "
            "FROM system_configuration sc "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE sc.parent_id IN (:component_ids) "
            "ORDER BY sc.component_name"
        ),
        "param_schema": {"component_ids": "uuid[]", "limit": "int"},
        "tables_used": ["system_configuration", "ships"],
    },

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # SENSOR METADATA
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    {
        "key": "SEN|SHIP",
        "description": "List all sensors on a single named ship",
        "sql_template": (
            "SELECT TOP(:limit) sm.sensor_id, sm.sensor_name, sm.unit, "
            "sm.min_value, sm.max_value, sm.P, sm.F, sm.frequency, "
            "sc.nomenclature AS component, sc.component_id, sh.ship_name "
            "FROM sensor_metadata sm "
            "JOIN system_configuration sc ON sm.component_id = sc.component_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE sc.ship_id = :ship_id "
            "ORDER BY sc.nomenclature, sm.sensor_name"
        ),
        "param_schema": {"ship_id": "uuid", "limit": "int"},
        "tables_used": ["sensor_metadata", "system_configuration", "ships"],
    },

    {
        "key": "SEN|COMP",
        "description": "List all sensors for one or more specific components",
        "sql_template": (
            "SELECT TOP(:limit) sm.sensor_id, sm.sensor_name, sm.unit, "
            "sm.min_value, sm.max_value, sm.P, sm.F, sm.frequency, "
            "sc.nomenclature AS component, sh.ship_name "
            "FROM sensor_metadata sm "
            "JOIN system_configuration sc ON sm.component_id = sc.component_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE sm.component_id IN (:component_ids) "
            "ORDER BY sm.sensor_name"
        ),
        "param_schema": {"component_ids": "uuid[]", "limit": "int"},
        "tables_used": ["sensor_metadata", "system_configuration", "ships"],
    },

    {
        "key": "SEN|FAILURE_MODE",
        "description": "Sensors associated with a specific failure mode",
        "sql_template": (
            "SELECT TOP(:limit) sm.sensor_id, sm.sensor_name, sm.unit, "
            "sm.min_value, sm.max_value, sm.P, sm.F, "
            "fm.name AS failure_mode_name, fm.severity, "
            "sc.nomenclature AS component, sh.ship_name "
            "FROM sensor_metadata sm "
            "JOIN failure_modes fm ON sm.failure_mode_id = fm.failure_mode_id "
            "JOIN system_configuration sc ON sm.component_id = sc.component_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE sm.failure_mode_id IN (:failure_mode_ids) "
            "ORDER BY fm.severity, sm.sensor_name"
        ),
        "param_schema": {"failure_mode_ids": "uuid[]", "limit": "int"},
        "tables_used": ["sensor_metadata", "failure_modes", "system_configuration", "ships"],
    },

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # SENSOR READINGS
    # Only alert-based patterns kept — raw reading dumps are not useful.
    # alert is BIT in SQL Server — WHERE sr.alert = 1 is correct.
    # No ship_id on sensor_readings — always join via system_configuration.
    #
    # Shape selection contract:
    #   READ|ALERT_COMP    — sensor not specified; filter by component_id
    #   READ|ALERT_SENSOR  — specific sensor resolved; filter by sensor_id (narrower)
    #   READ|ALERT_SHIP    — no component; filter by ship via system_configuration
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    {
        "key": "READ|ALERT_COMP",
        "description": "All alerted sensor readings for one or more specific components — use when no specific sensor is named",
        "sql_template": (
            "SELECT TOP(:limit) sr.value, sr.date, sr.operating_hours, "
            "sm.sensor_name, sm.unit, sm.min_value, sm.max_value, "
            "sc.nomenclature AS component, sh.ship_name "
            "FROM sensor_readings sr "
            "JOIN sensor_metadata sm ON sr.sensor_id = sm.sensor_id "
            "JOIN system_configuration sc ON sr.component_id = sc.component_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE sr.component_id IN (:component_ids) AND sr.alert = 1 "
            "ORDER BY sr.date DESC"
        ),
        "param_schema": {"component_ids": "uuid[]", "limit": "int"},
        "tables_used": ["sensor_readings", "sensor_metadata", "system_configuration", "ships"],
    },

    {
        "key": "READ|ALERT_SENSOR",
        "description": "Alerted sensor readings filtered to one or more specific sensors by sensor_id — use when a named sensor is resolved (e.g. GT_S1 sensor of GT1)",
        # BUG FIX: READ|ALERT_COMP was silently ignoring resolved sensor_ids,
        # returning all component alerts instead of the sensor-specific ones.
        # This shape filters by sr.sensor_id directly — the narrowest correct scope.
        # shape_router selects this shape when resolved.sensors is non-empty
        # and entity_target == fault.
        "sql_template": (
            "SELECT TOP(:limit) sr.value, sr.date, sr.operating_hours, "
            "sm.sensor_name, sm.unit, sm.min_value, sm.max_value, "
            "sc.nomenclature AS component, sh.ship_name "
            "FROM sensor_readings sr "
            "JOIN sensor_metadata sm ON sr.sensor_id = sm.sensor_id "
            "JOIN system_configuration sc ON sr.component_id = sc.component_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE sr.sensor_id IN (:sensor_ids) AND sr.alert = 1 "
            "ORDER BY sr.date DESC"
        ),
        "param_schema": {"sensor_ids": "uuid[]", "limit": "int"},
        "tables_used": ["sensor_readings", "sensor_metadata", "system_configuration", "ships"],
    },

    {
        "key": "READ|ALERT_SHIP",
        "description": "All alerted sensor readings across an entire ship",
        "sql_template": (
            "SELECT TOP(:limit) sr.value, sr.date, sr.operating_hours, "
            "sm.sensor_name, sm.unit, sm.min_value, sm.max_value, "
            "sc.nomenclature AS component, sh.ship_name "
            "FROM sensor_readings sr "
            "JOIN sensor_metadata sm ON sr.sensor_id = sm.sensor_id "
            "JOIN system_configuration sc ON sr.component_id = sc.component_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE sc.ship_id = :ship_id AND sr.alert = 1 "
            "ORDER BY sr.date DESC"
        ),
        "param_schema": {"ship_id": "uuid", "limit": "int"},
        "tables_used": ["sensor_readings", "sensor_metadata", "system_configuration", "ships"],
    },

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # FAILURE MODES
    # failure_mode on maintenance_data is VARCHAR text, NOT a FK here.
    # These patterns target the failure_modes table only.
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    {
        "key": "FM|COMP",
        "description": "Failure modes for one or more specific components",
        "sql_template": (
            "SELECT TOP(:limit) fm.failure_mode_id, fm.name AS failure_mode_name, "
            "fm.severity, sc.nomenclature AS component, sh.ship_name "
            "FROM failure_modes fm "
            "JOIN system_configuration sc ON fm.component_id = sc.component_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE fm.component_id IN (:component_ids) "
            "ORDER BY fm.severity, fm.name"
        ),
        "param_schema": {"component_ids": "uuid[]", "limit": "int"},
        "tables_used": ["failure_modes", "system_configuration", "ships"],
    },

    {
        "key": "FM|SHIP",
        "description": "All failure modes across all components on a ship",
        "sql_template": (
            "SELECT TOP(:limit) fm.failure_mode_id, fm.name AS failure_mode_name, "
            "fm.severity, sc.nomenclature AS component, sh.ship_name "
            "FROM failure_modes fm "
            "JOIN system_configuration sc ON fm.component_id = sc.component_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE sc.ship_id = :ship_id "
            "ORDER BY fm.severity, sc.nomenclature"
        ),
        "param_schema": {"ship_id": "uuid", "limit": "int"},
        "tables_used": ["failure_modes", "system_configuration", "ships"],
    },

    {
        "key": "FM|SEVERITY",
        "description": "Failure modes on a ship filtered by severity level",
        # severity is VARCHAR free text — caller provides the exact severity string.
        "sql_template": (
            "SELECT TOP(:limit) fm.failure_mode_id, fm.name AS failure_mode_name, "
            "fm.severity, sc.nomenclature AS component, sc.component_id, sh.ship_name "
            "FROM failure_modes fm "
            "JOIN system_configuration sc ON fm.component_id = sc.component_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE sc.ship_id = :ship_id "
            "AND fm.severity = :severity "
            "ORDER BY sc.nomenclature"
        ),
        "param_schema": {"ship_id": "uuid", "severity": "str", "limit": "int"},
        "tables_used": ["failure_modes", "system_configuration", "ships"],
    },

    {
        "key": "FM|WITH_SENSORS",
        "description": "Failure modes with their associated sensors for one or more components",
        # LEFT JOIN keeps failure modes that have no sensor assigned.
        "sql_template": (
            "SELECT TOP(:limit) fm.failure_mode_id, fm.name AS failure_mode_name, "
            "fm.severity, sm.sensor_name, sm.unit, sm.P, sm.F, "
            "sc.nomenclature AS component, sh.ship_name "
            "FROM failure_modes fm "
            "LEFT JOIN sensor_metadata sm ON sm.failure_mode_id = fm.failure_mode_id "
            "JOIN system_configuration sc ON fm.component_id = sc.component_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE fm.component_id IN (:component_ids) "
            "ORDER BY fm.severity, fm.name, sm.sensor_name"
        ),
        "param_schema": {"component_ids": "uuid[]", "limit": "int"},
        "tables_used": ["failure_modes", "sensor_metadata", "system_configuration", "ships"],
    },

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # OVERHAUL METADATA
    # CRITICAL: last_overhaul_date is NVARCHAR — always CONVERT(DATE, ...) for
    # any date arithmetic or comparison.
    # Main use: overhaul frequency questions only.
    # Actual overhaul event history → use Overhaul_Readings patterns instead.
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    {
        "key": "OH_META|COMP",
        "description": "Overhaul frequency and schedule metadata for one or more specific components",
        "sql_template": (
            "SELECT TOP(:limit) om.overhaul_frequency_hours, om.total_overhaul_events, "
            "om.last_overhaul_date, "
            "sc.nomenclature AS component, sh.ship_name "
            "FROM Overhaul_metadata om "
            "JOIN system_configuration sc ON om.component_id = sc.component_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE om.component_id IN (:component_ids)"
        ),
        "param_schema": {"component_ids": "uuid[]", "limit": "int"},
        "tables_used": ["Overhaul_metadata", "system_configuration", "ships"],
    },

    {
        "key": "OH_META|SHIP",
        "description": "Overhaul frequency and schedule metadata for all components on a ship",
        "sql_template": (
            "SELECT TOP(:limit) om.overhaul_frequency_hours, om.total_overhaul_events, "
            "om.last_overhaul_date, "
            "sc.nomenclature AS component, sc.component_id, sh.ship_name "
            "FROM Overhaul_metadata om "
            "JOIN system_configuration sc ON om.component_id = sc.component_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE sc.ship_id = :ship_id "
            "ORDER BY sc.nomenclature"
        ),
        "param_schema": {"ship_id": "uuid", "limit": "int"},
        "tables_used": ["Overhaul_metadata", "system_configuration", "ships"],
    },

    {
        "key": "OH_META|OVERDUE",
        "description": "Components overdue for overhaul based on frequency and last overhaul date",
        # last_overhaul_date is NVARCHAR — must CONVERT(DATE, ...) before DATEDIFF.
        # Uses hours-based frequency compared to calendar days as a proxy
        # (divide overhaul_frequency_hours by 24 for rough day equivalent).
        "sql_template": (
            "SELECT TOP(:limit) om.overhaul_frequency_hours, om.total_overhaul_events, "
            "om.last_overhaul_date, "
            "DATEDIFF(day, CONVERT(DATE, om.last_overhaul_date), :reference_date) AS days_since_last_overhaul, "
            "sc.nomenclature AS component, sc.component_id, sh.ship_name "
            "FROM Overhaul_metadata om "
            "JOIN system_configuration sc ON om.component_id = sc.component_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE sc.ship_id = :ship_id "
            "AND om.last_overhaul_date IS NOT NULL "
            "AND DATEDIFF(day, CONVERT(DATE, om.last_overhaul_date), :reference_date) "
            "    > (om.overhaul_frequency_hours / 24) "
            "ORDER BY days_since_last_overhaul DESC"
        ),
        "param_schema": {"ship_id": "uuid", "reference_date": "date", "limit": "int"},
        "tables_used": ["Overhaul_metadata", "system_configuration", "ships"],
    },

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # OVERHAUL READINGS
    # defect_date is proper DATE column — no CONVERT needed.
    # cmms_running_age and running_age are FLOAT.
    # maintenance_type is VARCHAR free text — 'overhaul' is the key value.
    #
    # Shape selection contract:
    #   OH_READ|LATEST_COMP       maintenance_type = 'overhaul'   last actual overhaul event (single component)
    #   OH_READ|CURRENT_AGE       maintenance_type != 'overhaul'  last operational reading, single component
    #   OH_READ|CURRENT_AGE_MULTI maintenance_type != 'overhaul'  one latest reading per component, ship/multi-ship
    #   OH_READ|COMP              no filter                        full event history, one or more components
    #   OH_READ|SHIP              no filter                        full event history, entire ship
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    {
        "key": "OH_READ|ALL_OVERHAUL_COMP",
        "description": "All overhaul events history for one or more specific components — returns only rows where maintenance_type = 'overhaul'. Use this for: 'show all overhaul events of AC6', 'full overhaul history of GT1'",
        # BUG FIX: replaced OFFSET 0 ROWS FETCH NEXT :limit ROWS ONLY with TOP(:limit).
        # OFFSET/FETCH was the only template deviating from the TOP pattern, causing
        # inconsistent :limit binding in expand_in_param(). TOP(:limit) is correct
        # for SQL Server and consistent with every other template in this file.
        "sql_template": (
            "SELECT TOP(:limit) orr.maintenance_type, orr.defect_date, "
            "orr.cmms_running_age, orr.running_age, "
            "sc.nomenclature AS component, sh.ship_name "
            "FROM Overhaul_Readings orr "
            "JOIN system_configuration sc ON orr.component_id = sc.component_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE orr.component_id IN (:component_ids) "
            "AND orr.maintenance_type = 'overhaul' "
            "ORDER BY orr.defect_date DESC"
        ),
        "param_schema": {"component_ids": "uuid[]", "limit": "int"},
        "tables_used": ["Overhaul_Readings", "system_configuration", "ships"],
    },

    {
        "key": "OH_READ|COMP",
        "description": "Full overhaul and maintenance event history for one or more specific components",
        "sql_template": (
            "SELECT TOP(:limit) orr.maintenance_type, orr.defect_date, "
            "orr.cmms_running_age, orr.running_age, "
            "sc.nomenclature AS component, sh.ship_name "
            "FROM Overhaul_Readings orr "
            "JOIN system_configuration sc ON orr.component_id = sc.component_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE orr.component_id IN (:component_ids) "
            "ORDER BY orr.defect_date DESC"
        ),
        "param_schema": {"component_ids": "uuid[]", "limit": "int"},
        "tables_used": ["Overhaul_Readings", "system_configuration", "ships"],
    },

    {
        "key": "OH_READ|LATEST_COMP",
        "description": "Most recent overhaul event for one or more specific components — answers when was last overhaul. Only rows where maintenance_type = 'overhaul' are considered.",
        # Only maintenance_type = 'overhaul' rows considered so corrective/inspection
        # rows cannot be returned as the "last overhaul" event.
        # Use this for: "when was GT1 last overhauled", "last overhaul date of GT1"
        "sql_template": (
            "SELECT TOP(1) orr.maintenance_type, orr.defect_date, "
            "orr.cmms_running_age, orr.running_age, "
            "sc.nomenclature AS component, sh.ship_name "
            "FROM Overhaul_Readings orr "
            "JOIN system_configuration sc ON orr.component_id = sc.component_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE orr.component_id IN (:component_ids) "
            "AND orr.maintenance_type = 'overhaul' "
            "ORDER BY orr.defect_date DESC"
        ),
        "param_schema": {"component_ids": "uuid[]", "limit": "int"},
        "tables_used": ["Overhaul_Readings", "system_configuration", "ships"],
    },

    {
    "key": "OH_READ|CURRENT_AGE",
    "description": "Current running age of a single specific component.",
    "sql_template": (
        "SELECT TOP(1) "
        "    ROUND(orr.running_age, 0) AS current_Age, "
        "    sc.nomenclature AS nomenclature, "
        "    sh.ship_name "
        "FROM Overhaul_Readings orr "
        "JOIN system_configuration sc ON orr.component_id = sc.component_id "
        "JOIN ships sh ON sc.ship_id = sh.ship_id "
        "WHERE orr.component_id IN (:component_ids) "
        "AND orr.maintenance_type != 'overhaul' "
        "ORDER BY orr.defect_date DESC"
    ),
    "param_schema": {"component_ids": "uuid[]", "limit": "int"},
    "tables_used": ["Overhaul_Readings", "system_configuration", "ships"],
    },

    {
    "key": "OH_READ|CURRENT_AGE_MULTI",
    "description": (
        "Current running age for all components on one or more ships — one latest "
        "non-overhaul reading per component."
    ),
    "sql_template": (
        "WITH ranked AS ( "
        "    SELECT "
        "        ROUND(orr.running_age, 0) AS current_Age, "
        "        orr.component_id, "
        "        sc.nomenclature AS nomenclature, "
        "        sh.ship_name, "
        "        ROW_NUMBER() OVER ( "
        "            PARTITION BY orr.component_id "
        "            ORDER BY orr.defect_date DESC "
        "        ) AS rn "
        "    FROM Overhaul_Readings orr "
        "    JOIN system_configuration sc ON orr.component_id = sc.component_id "
        "    JOIN ships sh ON sc.ship_id = sh.ship_id "
        "    WHERE sc.ship_id IN (:ship_ids) "
        "    AND orr.maintenance_type != 'overhaul' "
        ") "
        "SELECT TOP(:limit) current_Age, nomenclature, ship_name "
        "FROM ranked "
        "WHERE rn = 1 "
        "ORDER BY ship_name, nomenclature"
    ),
    "param_schema": {"ship_ids": "uuid[]", "limit": "int"},
    "tables_used": ["Overhaul_Readings", "system_configuration", "ships"],
    },

    {
        "key": "OH_READ|SHIP",
        "description": (
            "Full overhaul and maintenance event history for all components on a ship — "
            "no maintenance_type filter applied. Use when the user asks for all maintenance "
            "records or overhaul history at the ship level without specifying a component. "
            "Age queries are intercepted by shape_router (OH_READ|SHIP → OH_READ|CURRENT_AGE_MULTI) "
            "before reaching downstream handlers, so this pattern only fires for genuine "
            "history dump requests such as 'show all maintenance records on INS ONE'."
        ),
        # Exists to satisfy the ("overhaul", False, False, True, False) → "OH_READ|SHIP"
        # entry in shape_router's _SHAPE_TABLE, which previously had no seed pattern.
        # scalar :ship_id kept consistent with every other |SHIP-keyed pattern in this file.
        "sql_template": (
            "SELECT TOP(:limit) orr.maintenance_type, orr.defect_date, "
            "orr.cmms_running_age, orr.running_age, "
            "sc.nomenclature AS component, sh.ship_name "
            "FROM Overhaul_Readings orr "
            "JOIN system_configuration sc ON orr.component_id = sc.component_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE sc.ship_id = :ship_id "
            "ORDER BY orr.defect_date DESC"
        ),
        "param_schema": {"ship_id": "uuid", "limit": "int"},
        "tables_used": ["Overhaul_Readings", "system_configuration", "ships"],
    },

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # UTILISATION  (monthly_utilization)
    # CRITICAL: column is "utlization" (one 'i') — this misspelling must be
    # preserved exactly in all SQL references.
    # operation_date is DATETIME, component_id FK (no ship_id column).
    # One record per component per month — not a high-volume table.
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    {
        "key": "UTIL|LATEST_COMP",
        "description": "Most recent utilisation record for one or more specific components — answers what is current utilisation",
        # Use this for: "what is the utilisation of GT1", "current utilisation of GT1"
        "sql_template": (
            "SELECT TOP(1) mu.operation_date, mu.utlization, "
            "sc.nomenclature AS component, sh.ship_name "
            "FROM monthly_utilization mu "
            "JOIN system_configuration sc ON mu.component_id = sc.component_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE mu.component_id IN (:component_ids) "
            "ORDER BY mu.operation_date DESC"
        ),
        "param_schema": {"component_ids": "uuid[]", "limit": "int"},
        "tables_used": ["monthly_utilization", "system_configuration", "ships"],
    },

    {
        "key": "UTIL|RANGE",
        "description": "Utilisation records for one or more components within a date range — answers utilisation for a specific month or period",
        # Use this for: "utilisation of GT1 in March 2020", "utilisation between Jan and Jun 2020"
        # operation_date is DATETIME so BETWEEN works correctly.
        # Caller sets start_date = end_date for a single month query.
        "sql_template": (
            "SELECT TOP(:limit) mu.operation_date, mu.utlization, "
            "sc.nomenclature AS component, sh.ship_name "
            "FROM monthly_utilization mu "
            "JOIN system_configuration sc ON mu.component_id = sc.component_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE mu.component_id IN (:component_ids) "
            "AND mu.operation_date BETWEEN :start_date AND :end_date "
            "ORDER BY mu.operation_date DESC"
        ),
        "param_schema": {"component_ids": "uuid[]", "start_date": "datetime", "end_date": "datetime", "limit": "int"},
        "tables_used": ["monthly_utilization", "system_configuration", "ships"],
    },

    {
        "key": "UTIL|AVG_COMP",
        "description": "Average monthly utilisation for one or more specific components",
        # Use this for: "what is the average utilisation of GT1"
        # Note 'utlization' misspelling preserved in AVG() call.
        "sql_template": (
            "SELECT TOP(:limit) sc.nomenclature AS component, sc.component_id, "
            "AVG(mu.utlization) AS avg_utilization, "
            "COUNT(mu.id) AS record_count, "
            "MAX(mu.operation_date) AS latest_record_date, "
            "sh.ship_name "
            "FROM monthly_utilization mu "
            "JOIN system_configuration sc ON mu.component_id = sc.component_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE mu.component_id IN (:component_ids) "
            "GROUP BY sc.component_id, sc.nomenclature, sh.ship_name "
            "ORDER BY avg_utilization DESC"
        ),
        "param_schema": {"component_ids": "uuid[]", "limit": "int"},
        "tables_used": ["monthly_utilization", "system_configuration", "ships"],
    },

    {
        "key": "UTIL|AVG_SHIP",
        "description": "Average monthly utilisation per component across an entire ship — fleet health dashboard",
        # Note 'utlization' misspelling preserved in AVG() call.
        "sql_template": (
            "SELECT TOP(:limit) sc.nomenclature AS component, sc.component_id, "
            "AVG(mu.utlization) AS avg_utilization, "
            "COUNT(mu.id) AS record_count, "
            "MAX(mu.operation_date) AS latest_record_date, "
            "sh.ship_name "
            "FROM monthly_utilization mu "
            "JOIN system_configuration sc ON mu.component_id = sc.component_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE sc.ship_id = :ship_id "
            "GROUP BY sc.component_id, sc.nomenclature, sh.ship_name "
            "ORDER BY avg_utilization DESC"
        ),
        "param_schema": {"ship_id": "uuid", "limit": "int"},
        "tables_used": ["monthly_utilization", "system_configuration", "ships"],
    },

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # RELIABILITY PARAMETERS
    # alphabeta: top-level components (parent_id IS NULL)
    # etabeta:   sub-assembly components (parent_id IS NOT NULL), has priority col
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    {
        "key": "REL|ALPHA_COMP",
        "description": "AlphaBeta reliability parameters for one or more top-level components",
        "sql_template": (
            "SELECT TOP(:limit) ab.alpha, ab.beta, "
            "sc.nomenclature AS component, sc.component_name, sh.ship_name "
            "FROM alphabeta ab "
            "JOIN system_configuration sc ON ab.component_id = sc.component_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE ab.component_id IN (:component_ids)"
        ),
        "param_schema": {"component_ids": "uuid[]", "limit": "int"},
        "tables_used": ["alphabeta", "system_configuration", "ships"],
    },

    {
        "key": "REL|ALPHA_SHIP",
        "description": "AlphaBeta reliability parameters for all top-level components on a ship",
        # parent_id IS NULL correctly scopes to top-level only.
        "sql_template": (
            "SELECT TOP(:limit) ab.alpha, ab.beta, "
            "sc.nomenclature AS component, sc.component_name, sh.ship_name "
            "FROM alphabeta ab "
            "JOIN system_configuration sc ON ab.component_id = sc.component_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE sc.ship_id = :ship_id "
            "AND sc.parent_id IS NULL "
            "ORDER BY sc.component_name"
        ),
        "param_schema": {"ship_id": "uuid", "limit": "int"},
        "tables_used": ["alphabeta", "system_configuration", "ships"],
    },

    {
        "key": "REL|ETA_COMP",
        "description": "EtaBeta reliability parameters for one or more assembly-level components",
        "sql_template": (
            "SELECT TOP(:limit) eb.eta, eb.beta, eb.priority, "
            "sc.nomenclature AS component, sc.component_name, sh.ship_name, "
            "sc_parent.nomenclature AS parent_nomenclature, "
            "sc_parent.component_name AS parent_component_name "
            "FROM etabeta eb "
            "JOIN system_configuration sc ON eb.component_id = sc.component_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "LEFT JOIN system_configuration sc_parent ON sc.parent_id = sc_parent.component_id "
            "WHERE eb.component_id IN (:component_ids) "
            "ORDER BY eb.priority"
        ),
        "param_schema": {"component_ids": "uuid[]", "limit": "int"},
        "tables_used": ["etabeta", "system_configuration", "ships"],
    },

    {
        "key": "REL|ETA_SHIP",
        "description": "EtaBeta reliability parameters for all assembly-level components on a ship",
        # parent_id IS NOT NULL correctly scopes to sub-assemblies only.
        "sql_template": (
            "SELECT TOP(:limit) eb.eta, eb.beta, eb.priority, "
            "sc.nomenclature AS component, sc.component_name, sh.ship_name, "
            "sc_parent.nomenclature AS parent_nomenclature, "
            "sc_parent.component_name AS parent_component_name "
            "FROM etabeta eb "
            "JOIN system_configuration sc ON eb.component_id = sc.component_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "LEFT JOIN system_configuration sc_parent ON sc.parent_id = sc_parent.component_id "
            "WHERE sc.ship_id = :ship_id "
            "AND sc.parent_id IS NOT NULL "
            "ORDER BY sc_parent.component_name, sc.component_name, eb.priority"
        ),
        "param_schema": {"ship_id": "uuid", "limit": "int"},
        "tables_used": ["etabeta", "system_configuration", "ships"],
    },

    {
        "key": "REL|ETA_PRIORITY",
        "description": "Top N highest-priority EtaBeta components on a ship — useful for maintenance scheduling",
        # Returns sub-assemblies ordered by priority ascending (1 = highest).
        "sql_template": (
            "SELECT TOP(:limit) eb.eta, eb.beta, eb.priority, "
            "sc.nomenclature AS component, sc.component_name, sc.component_id, sh.ship_name "
            "FROM etabeta eb "
            "JOIN system_configuration sc ON eb.component_id = sc.component_id "
            "JOIN ships sh ON sc.ship_id = sh.ship_id "
            "WHERE sc.ship_id = :ship_id "
            "ORDER BY eb.priority ASC"
        ),
        "param_schema": {"ship_id": "uuid", "limit": "int"},
        "tables_used": ["etabeta", "system_configuration", "ships"],
    },

]


async def seed_sql_patterns(sql_memory) -> None:
    """
    Idempotent seed function — safe to call on every startup.
    Skips keys that already exist in the collection.
    """
    from backend.utils.nlpLayer.chat_logger import log_stage

    entries = [
        {**p, "message": p["description"]}
        for p in SEED_PATTERNS
    ]

    inserted = await sql_memory.seed(entries)
    log_stage("SEED", f"seed_sql_patterns complete — {inserted} inserted")