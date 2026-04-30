"""
nlpLayer/general/sql_generator.py
-----------------------------------
Stage: cache MISS — generates a reusable parameterised SQL template
for a given QueryShape, stores it in SQLPatternMemory.

One LLM call per novel shape. The result is cached permanently so
the LLM is never called again for the same structural pattern.

Critical design rules baked into the prompt:
    - SQL Server T-SQL dialect only (TOP not LIMIT, GETDATE() not NOW())
    - Parameterised output only — :param_name placeholders, never literals
    - Known column names injected verbatim — typos included (utlization)
    - Join paths made explicit — no direct ship_id on sensor_readings
      or monthly_utilization, must go through system_configuration
    - multi-ship handled outside — single-ship templates only,
      SQLTool loops for ship_ids (Option C)

Output contract from LLM:
    {
      "sql": "SELECT TOP(:limit) ... WHERE sc.ship_id = :ship_id ...",
      "params": {"ship_id": "uuid", "limit": "int"},
      "tables": ["sensor_metadata", "system_configuration", "ships"]
    }
"""

from __future__ import annotations

import json
import logging
from typing import Any, Dict, List, Optional, Tuple

from backend.utils.nlpLayer.chat_logger import log_stage

logger = logging.getLogger(__name__)

# ------------------------------------------------------------------
# Compact DDL — hand-written, authoritative column names
# This is the single source of truth injected into every MISS prompt.
# ------------------------------------------------------------------
_COMPACT_DDL = """
-- ── CORE HIERARCHY ───────────────────────────────────────────────────────────
-- ships(ship_id UUID PK, ship_name, ship_category, ship_class, command)
-- departments(department_id UUID PK, department_name, department_code, ship_id FK→ships)
-- systems(system_id UUID PK, system_type)
-- system_configuration(
--     component_id UUID PK,
--     component_name,
--     nomenclature,
--     ship_id    UUID FK→ships,
--     department_id UUID FK→departments,
--     system_id  UUID FK→systems,
--     parent_id  UUID FK→system_configuration  -- NULL for top-level, non-NULL for assemblies
--     is_lmu, RepairType, CMMS_EquipmentCode
-- )

-- ── SENSORS ──────────────────────────────────────────────────────────────────
-- sensor_metadata(
--     sensor_id UUID PK,
--     sensor_name, unit, min_value, max_value, P, F,
--     component_id UUID FK→system_configuration,
--     failure_mode_id UUID FK→failure_modes
-- )
-- sensor_readings(
--     id UUID PK,
--     sensor_id UUID FK→sensor_metadata,
--     component_id UUID FK→system_configuration,
--     value FLOAT, date DATETIME, operating_hours INT, alert BIT
--     -- NOTE: NO direct ship_id — join via component_id→system_configuration
-- )
-- failure_modes(failure_mode_id UUID PK, name, severity, component_id FK→system_configuration)

-- ── OVERHAUL ─────────────────────────────────────────────────────────────────
-- Overhaul_metadata(
--     id UUID PK,
--     component_id UUID FK→system_configuration,
--     overhaul_frequency_hours INT,
--     total_overhaul_events INT,
--     last_overhaul_date NVARCHAR   -- stored as string 'YYYY-MM-DD', NOT a date type
-- )
-- Overhaul_Readings(
--     id UUID PK,
--     component_id UUID FK→system_configuration,
--     maintenance_type NVARCHAR,
--     defect_date DATE,
--     cmms_running_age FLOAT,
--     running_age FLOAT
-- )

-- ── RCM ──────────────────────────────────────────────────────────────────────
-- rcm(
--     rcm_id NVARCHAR PK,
--     component_id UUID FK→system_configuration,
--     decision_path NVARCHAR(JSON),
--     maintenance_policy NVARCHAR,
--     created_date DATETIME,
--     modified_date DATETIME
-- )

-- ── RELIABILITY PARAMS ───────────────────────────────────────────────────────
-- etabeta(id UUID PK, component_id FK, eta FLOAT, beta FLOAT, priority INT)
-- alphabeta(id UUID PK, component_id FK, alpha FLOAT, beta FLOAT)
-- EB_actual_data(id UUID PK, component_id FK, interval_start_date DATE, interval_end_date DATE, f_s NVARCHAR)
-- EB_TTF_data(id UUID PK, component_id FK, hours FLOAT, f_s NVARCHAR, priority INT)
-- EB_interval_data(id UUID PK, component_id FK, installation_start_date DATE, installation_end_date DATE, removal_start_date DATE, removal_end_date DATE, f_s NVARCHAR)
-- EB_expert(id UUID PK, component_id FK, most_likely_life FLOAT, max_life FLOAT, min_life FLOAT, num_component_wo_failure INT, time_wo_failure FLOAT)
-- EB_nprd(id UUID PK, component_id FK, failure_rate FLOAT, beta FLOAT)
-- EB_oem(id UUID PK, component_id FK, life_estimate1_name, life_estimate1_val FLOAT, life_estimate2_name, life_estimate2_val FLOAT)
-- EB_oem_expert(id UUID PK, component_id FK, most_likely_life FLOAT, max_life FLOAT, min_life FLOAT, life_estimate_name, life_estimate_val FLOAT, num_component_wo_failure INT, time_wo_failure FLOAT)
-- EB_prob_failure(id UUID PK, component_id FK, p_time FLOAT, failure_p FLOAT)

-- ── MAINTENANCE / UTILISATION ────────────────────────────────────────────────
-- data_manager_maintenance_data(
--     id UUID PK,
--     component_id UUID FK→system_configuration,
--     event_type, maint_date DATE, maintenance_type, maintenance_duration FLOAT,
--     failure_mode, description
-- )
-- maintenance_configuration_data(
--     maintenance_id UUID PK,
--     component_id UUID FK→system_configuration,
--     pm_applicable, can_be_replaced_by_ship_staff, is_system_param_recorded
-- )
-- monthly_utilization(
--     id UUID PK,
--     component_id UUID FK→system_configuration,
--     operation_date DATETIME,
--     utlization DECIMAL    -- NOTE: spelled 'utlization' (one 'i') — do NOT fix this typo
--     -- NOTE: NO direct ship_id — join via component_id→system_configuration
-- )

-- ── ADDITIONAL INFO ──────────────────────────────────────────────────────────
-- system_config_additional_info(id UUID PK, component_id FK, component_name, num_cycle_or_runtime FLOAT, installation_date DATE, unit)
-- redundancy_data(redundancy_id UUID PK, component_id FK, k, n INT, redundancy_type, system_name)
"""

# ------------------------------------------------------------------
# Few-shot examples — shape → correct parameterised SQL
# These double as ground truth for the LLM and cover the 5 most
# common shapes. Keep in sync with seed_patterns.py.
# ------------------------------------------------------------------
_FEW_SHOT_EXAMPLES = """
EXAMPLE 1 — shape: SEN|SHIP
Query: "list all sensors on INS ONE"
Output:
{
  "sql": "SELECT TOP(:limit) sm.sensor_name, sm.unit, sc.nomenclature AS component_name, sh.ship_name FROM sensor_metadata sm JOIN system_configuration sc ON sm.component_id = sc.component_id JOIN ships sh ON sc.ship_id = sh.ship_id WHERE sc.ship_id = :ship_id ORDER BY sc.nomenclature, sm.sensor_name",
  "params": {"ship_id": "uuid", "limit": "int"},
  "tables": ["sensor_metadata", "system_configuration", "ships"]
}

EXAMPLE 2 — shape: COMP|AGG_SHIP
Query: "show all components on INS TWO"
Output:
{
  "sql": "SELECT TOP(:limit) sc.nomenclature, sc.component_name, sc.component_id, sh.ship_name FROM system_configuration sc JOIN ships sh ON sc.ship_id = sh.ship_id WHERE sc.ship_id = :ship_id ORDER BY sc.component_name",
  "params": {"ship_id": "uuid", "limit": "int"},
  "tables": ["system_configuration", "ships"]
}

EXAMPLE 3 — shape: OH_READ|RANGE  
Query: "overhaul readings for GT 1 last year"
Output:
{
  "sql": "SELECT TOP(:limit) orr.maintenance_type, orr.defect_date, orr.cmms_running_age, orr.running_age, sc.nomenclature AS component_name, sh.ship_name FROM Overhaul_Readings orr JOIN system_configuration sc ON orr.component_id = sc.component_id JOIN ships sh ON sc.ship_id = sh.ship_id WHERE orr.component_id = :component_id AND orr.defect_date BETWEEN :start_date AND :end_date ORDER BY orr.defect_date DESC",
  "params": {"component_id": "uuid", "start_date": "datetime", "end_date": "datetime", "limit": "int"},
  "tables": ["Overhaul_Readings", "system_configuration", "ships"]
}

EXAMPLE 4 — shape: FM|COMP
Query: "what are the failure modes for AC 1"
Output:
{
  "sql": "SELECT TOP(:limit) fm.name AS failure_mode_name, fm.severity, sc.nomenclature AS component_name, sh.ship_name FROM failure_modes fm JOIN system_configuration sc ON fm.component_id = sc.component_id JOIN ships sh ON sc.ship_id = sh.ship_id WHERE fm.component_id = :component_id ORDER BY fm.severity",
  "params": {"component_id": "uuid", "limit": "int"},
  "tables": ["failure_modes", "system_configuration", "ships"]
}

EXAMPLE 5 — shape: UTIL|SHIP
Query: "monthly utilisation for INS ONE"
Output:
{
  "sql": "SELECT TOP(:limit) mu.operation_date, mu.utlization, sc.nomenclature AS component_name FROM monthly_utilization mu JOIN system_configuration sc ON mu.component_id = sc.component_id WHERE sc.ship_id = :ship_id ORDER BY mu.operation_date DESC",
  "params": {"ship_id": "uuid", "limit": "int"},
  "tables": ["monthly_utilization", "system_configuration"]
}
"""

# ------------------------------------------------------------------
# SQL Server dialect rules — injected verbatim into every prompt
# ------------------------------------------------------------------
_TSQL_RULES = """
SQL SERVER T-SQL RULES (strictly follow these):
1. Use TOP(:limit) — NEVER use LIMIT :limit (that is PostgreSQL)
2. Use GETDATE() for current timestamp, NOT NOW()
3. No ILIKE — use LIKE with UPPER() if case-insensitive needed
4. UUID columns are uniqueidentifier — compare with = directly, no casting
5. String concatenation uses + not ||
6. 'utlization' column in monthly_utilization is spelled with ONE 'i' — do NOT correct it
7. sensor_readings has NO direct ship_id — always join via component_id→system_configuration
8. monthly_utilization has NO direct ship_id — always join via component_id→system_configuration
9. Overhaul_metadata.last_overhaul_date is NVARCHAR not DATE — use CONVERT(DATE, last_overhaul_date) for comparisons
10. Generate only SELECT statements — no INSERT, UPDATE, DELETE, DROP, ALTER
"""


class SQLGenerator:
    """
    On cache MISS: calls LLM with full schema + shape context
    to produce a reusable parameterised SQL template.

    Instantiate once with an LLM client. Call generate() per MISS.
    """

    def __init__(self, llm_service):
        """
        Args:
            llm_service: Same LLM service used by the rest of the pipeline.
                         Must expose call_llm(messages, temperature) -> str.
        """
        self._llm = llm_service

    async def generate(
        self,
        shape: str,
        user_query: str,
        available_params: List[str],
    ) -> Tuple[str, Dict[str, str]]:
        """
        Generate a parameterised SQL template for a novel shape.

        Args:
            shape:            QueryShape key e.g. "SEN|SHIP", "OH_READ|RANGE"
            user_query:       Original user message (for context only)
            available_params: Param names the binder can provide.
                              LLM must only use :params from this list.

        Returns:
            (sql_template, param_schema) tuple.
            sql_template: parameterised SQL string with :param_name placeholders
            param_schema: {"param_name": "type"} dict

        Raises:
            ValueError if LLM response cannot be parsed or SQL fails validation.
        """
        log_stage("SQL_GEN", f"generating template for shape={shape}")

        prompt = self._build_prompt(shape, user_query, available_params)

        try:
            raw = await self._llm.call_llm(
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a SQL Server T-SQL expert. "
                            "Output ONLY valid JSON. No explanation, no markdown."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.0,
            )
        except Exception as exc:
            logger.error("[SQLGenerator] LLM call failed: %s", exc)
            raise ValueError(f"SQL generation LLM call failed: {exc}")

        sql_template, param_schema = self._parse_response(raw, shape)
        log_stage("SQL_GEN", f"generated {len(sql_template)} chars, params={list(param_schema.keys())}")
        return sql_template, param_schema

    # ------------------------------------------------------------------
    # Prompt construction
    # ------------------------------------------------------------------

    def _build_prompt(
        self,
        shape: str,
        user_query: str,
        available_params: List[str],
    ) -> str:
        params_list = "\n".join(f"  - :{p}" for p in available_params)

        return f"""You are generating a reusable SQL Server T-SQL template for a naval maintenance system.

SCHEMA:
{_COMPACT_DDL}

{_TSQL_RULES}

AVAILABLE :params (use ONLY these — no other placeholders):
{params_list}

TARGET SHAPE: {shape}
USER QUERY (for context only — generate a REUSABLE template, not a one-off query):
"{user_query}"

FEW-SHOT EXAMPLES (follow this exact output format):
{_FEW_SHOT_EXAMPLES}

CRITICAL OUTPUT RULES:
- Use :param_name placeholders for ALL variable values — never hardcode UUIDs or dates
- Only use :params from the AVAILABLE list above
- Always include TOP(:limit) for row limiting
- Return ONLY JSON in this exact shape — no markdown, no explanation:

{{
  "sql": "<complete parameterised T-SQL SELECT statement>",
  "params": {{"param_name": "uuid|int|datetime|str", ...}},
  "tables": ["table1", "table2"]
}}"""

    # ------------------------------------------------------------------
    # Response parsing
    # ------------------------------------------------------------------

    def _parse_response(
        self, raw: str, shape: str
    ) -> Tuple[str, Dict[str, str]]:
        """
        Parse LLM JSON response into (sql_template, param_schema).
        Raises ValueError on any parse failure.
        """
        cleaned = raw.strip()
        # Strip markdown fences if LLM ignored the instruction
        if cleaned.startswith("```"):
            lines = cleaned.splitlines()
            cleaned = "\n".join(
                lines[1:-1] if lines[-1].strip() == "```" else lines[1:]
            )

        try:
            data: Dict[str, Any] = json.loads(cleaned)
        except json.JSONDecodeError as exc:
            logger.error("[SQLGenerator] JSON parse failed for shape=%s: %s\nRaw: %.500s", shape, exc, raw)
            raise ValueError(f"SQL generator returned invalid JSON for shape '{shape}'.")

        sql = data.get("sql", "").strip()
        params = data.get("params", {})

        if not sql:
            raise ValueError(f"SQL generator returned empty SQL for shape '{shape}'.")

        if not isinstance(params, dict):
            raise ValueError(f"SQL generator returned invalid params for shape '{shape}'.")

        return sql, params