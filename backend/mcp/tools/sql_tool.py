"""
mcp/tools/sql_tool.py
----------------------
SQLTool — BaseTool implementation for GENERAL intent SQL queries.

Registered in AVAILABLE_TOOLS as "sql_query".
Bound to GENERAL intent via ToolOrchestrator._TOOL_NAMES["GENERAL"].

Responsibilities (all inside execute()):
    1. Receive shape + resolved params (UUIDs already bound by EntityLinker)
    2. Look up cached SQL template from SQLPatternMemory (HIT)
       or generate via SQLGenerator (MISS) and store for next time
    3. Validate SQL — no DDL, known tables, all params bound
    4. Execute via AsyncDatabaseService pattern (get_async_db_service)
    5. Return rows as list of dicts

Multi-ship (Option C):
    If arguments contain ship_ids (list), the single-ship template is
    executed once per ship_id and results are merged. This avoids
    SQL Server's lack of ANY(:list) support entirely.

Strict rule: zero changes to existing tools or BaseTool.

Changes
-------
BUG FIX  _validate : CTE alias names (defined in WITH ... AS (...) blocks)
                     were being extracted by _TABLE_RE and flagged as unknown
                     tables. Added _extract_cte_names() which collects all
                     alias names declared in WITH clauses, then subtracts them
                     from the FROM/JOIN hits before the known-tables check.
                     Fixes "Unknown tables referenced: ['ranked']" for any
                     query shape that uses a CTE (e.g. OH_READ|CURRENT_AGE_MULTI).

         _extract_tables : Same CTE-subtraction applied so stored tables_used
                     metadata is also clean (no phantom CTE names persisted
                     to SQLPatternMemory).
"""

from __future__ import annotations

import logging
import re
from typing import TYPE_CHECKING, Any, Dict, List, Optional, Set, Tuple

from sqlalchemy import text

from api.db.connection import get_async_db_service, get_session_context
from utils.nlpLayer.chat_logger import log_stage
from utils.nlpLayer.sql_pattern_memory import SQLPatternMemory

from .base_tool import BaseTool

if TYPE_CHECKING:
    from utils.nlpLayer.general.sql_generator import SQLGenerator

logger = logging.getLogger(__name__)

# ------------------------------------------------------------------
# Known tables — SQL Server schema registry
# Case-insensitive comparison — store lowercase
# ------------------------------------------------------------------
_KNOWN_TABLES: Set[str] = {
    # Core hierarchy
    "ships",
    "departments",
    "systems",
    "system_configuration",
    "system_config_additional_info",
    "redundancy_data",
    # Sensors
    "sensor_metadata",
    "sensor_readings",
    "failure_modes",
    # Reliability
    "etabeta",
    "alphabeta",
    "eb_actual_data",
    "eb_ttf_data",
    "eb_interval_data",
    "eb_expert",
    "eb_nprd",
    "eb_oem",
    "eb_oem_expert",
    "eb_prob_failure",
    # Overhaul
    "overhaul_metadata",
    "overhaul_readings",
    # Maintenance / RCM
    "rcm",
    "data_manager_maintenance_data",
    "maintenance_configuration_data",
    # Mission / operational
    "mission_configurations",
    "etl_schedule",
    "monthly_utilization",
}

_UNSAFE_RE = re.compile(
    r'\b(DROP|ALTER|CREATE|TRUNCATE|INSERT|UPDATE|DELETE|'
    r'REPLACE|MERGE|GRANT|REVOKE|EXEC|EXECUTE)\b',
    re.IGNORECASE,
)
_TABLE_RE = re.compile(
    r'\b(?:FROM|JOIN)\s+(?:\w+\.)?(\w+)',
    re.IGNORECASE,
)
_PARAM_RE = re.compile(r':([a-zA-Z_][a-zA-Z0-9_]*)')

# Matches the first word of every CTE definition:
#   WITH ranked AS (        → "ranked"
#   ), next_cte AS (        → "next_cte"
# Two passes: one for the leading WITH, one for subsequent comma-separated CTEs.
_CTE_LEAD_RE = re.compile(
    r'\bWITH\s+(\w+)\s+AS\s*\(',
    re.IGNORECASE,
)
_CTE_CONT_RE = re.compile(
    r',\s*(\w+)\s+AS\s*\(',
    re.IGNORECASE,
)

# Params the binder can always provide — used on MISS to constrain LLM
_AVAILABLE_PARAMS = [
    "ship_id", "ship_ids",
    "component_id", "component_ids",
    "sensor_id", "sensor_ids",
    "start_date", "end_date",
    "duration_hours",
    "limit", "offset",
]


# ------------------------------------------------------------------
# CTE alias extraction
# ------------------------------------------------------------------

def _extract_cte_names(sql: str) -> Set[str]:
    """
    Return the set of CTE alias names defined in WITH ... AS (...) clauses.

    These names appear in FROM / JOIN after the CTE block but are NOT real
    schema tables — they must be excluded from the known-tables check.

    Handles:
        WITH ranked AS (...)                    → {"ranked"}
        WITH cte1 AS (...), cte2 AS (...)       → {"cte1", "cte2"}
        WITH a AS (...) SELECT ... FROM b AS () → {"a"}  (only WITH-block aliases)

    Case-insensitive; returns lowercase names for consistent comparison.
    """
    names: Set[str] = set()
    names.update(m.lower() for m in _CTE_LEAD_RE.findall(sql))
    names.update(m.lower() for m in _CTE_CONT_RE.findall(sql))
    return names


# ------------------------------------------------------------------
# Entity cardinality helpers
# ------------------------------------------------------------------

def bind_entity(
    arguments: Dict[str, Any],
    key_single: str,
    key_multi: str,
    items: list,
    attr: str,
) -> None:
    """
    Bind a resolved entity list into arguments as either a single param
    or a list param, depending on cardinality.

    CONTRACT: exactly one of key_single / key_multi will be set after
    this call — never both, never neither (if items is non-empty).

    Args:
        arguments:  Mutable param dict being built for this query.
        key_single: Param name for single-entity case (e.g. "component_id").
        key_multi:  Param name for multi-entity case (e.g. "component_ids").
        items:      Resolved entity objects from EntityLinker.
        attr:       Attribute name to extract from each item (e.g. "component_id").
    """
    if not items:
        return

    # Clear both keys unconditionally — prevents dual-param collision
    # if bind_entity is called multiple times or on a pre-populated dict.
    arguments.pop(key_single, None)
    arguments.pop(key_multi, None)

    if len(items) == 1:
        arguments[key_single] = getattr(items[0], attr)
    else:
        arguments[key_multi] = [getattr(x, attr) for x in items]


def dedupe_by(items: list, key: str) -> list:
    """
    Deduplicate a list of objects by a named attribute.

    ⚠️  Last-write wins: if multiple objects share the same key value,
    the LAST one in the list is kept. This is intentional and O(n).

    Assumption: duplicates are semantically equivalent (same data,
    different Python objects from linker expansion). If this assumption
    ever breaks, the bug is in the upstream linker, not here.
    """
    return list({getattr(x, key): x for x in items}.values())


def expand_in_param(sql: str, arguments: Dict[str, Any], key: str) -> Tuple[str, Dict[str, Any]]:
    """
    Expand a list-valued param :key into individual positional params
    (:key_0, :key_1, ...) that every SQL Server driver can handle.

    Safe against substring collisions (e.g. :ship_id vs :ship_ids) via
    word-boundary regex.

    CONTRACT (enforced by bind_entity upstream):
        If key is present in arguments → it has at least one value.
        If key has no values         → key must not be in arguments.
    Therefore the empty-list case should never be reached here.

    Args:
        sql:       Raw SQL template string.
        arguments: Mutable param dict; key is popped and replaced in-place.
        key:       Param name to expand (e.g. "component_ids").

    Returns:
        (updated_sql, updated_arguments)

    Raises:
        ValueError: If :key appears more than once in the SQL template
                    (UNION / subquery duplication — fix the template).
    """
    values = arguments.pop(key, None)

    if not values:
        return sql, arguments

    # Safety: tolerate a single scalar being passed as a list param
    if not isinstance(values, (list, tuple)):
        values = [values]

    placeholders: List[str] = []
    for i, v in enumerate(values):
        param_key = f"{key}_{i}"
        placeholders.append(f":{param_key}")
        arguments[param_key] = v

    placeholder_str = ", ".join(placeholders)

    # Word-boundary replacement — prevents :ship_id matching inside :ship_ids
    sql = re.sub(
        rf":{re.escape(key)}\b",
        placeholder_str,
        sql,
        count=1,
    )

    # Guard: if the token still exists, the template uses it more than once.
    # A second occurrence would be left as a dead :key token, causing a
    # cryptic "missing bind parameter" error from the driver at runtime.
    if re.search(rf":{re.escape(key)}\b", sql):
        raise ValueError(
            f"expand_in_param: '{key}' appears more than once in SQL template. "
            f"Fix the template — duplicate list params are not supported."
        )

    return sql, arguments


class SQLTool(BaseTool):
    """
    Tool for GENERAL intent SQL queries.
    Registered as "sql_query" in AVAILABLE_TOOLS.
    """

    def __init__(
        self,
        sql_memory: SQLPatternMemory,
        sql_generator: "SQLGenerator",
    ):
        """
        Args:
            sql_memory:    Shared SQLPatternMemory (ChromaDB-backed).
            sql_generator: SQLGenerator for cache MISS path.
        Both injected at app startup via build_available_tools().
        """
        self._memory    = sql_memory
        self._generator = sql_generator

    # ------------------------------------------------------------------
    # BaseTool interface
    # ------------------------------------------------------------------

    @property
    def name(self) -> str:
        return "sql_query"

    @property
    def description(self) -> str:
        return (
            "Execute a parameterised SQL query for general naval maintenance "
            "database lookups. Accepts a shape key and resolved entity params."
        )

    @property
    def parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "shape": {
                    "type": "string",
                    "description": (
                        "QueryShape key identifying the SQL template to use. "
                        "E.g. 'SEN|SHIP', 'COMP|AGG_SHIP', 'OH_READ|RANGE'."
                    ),
                },
                "ship_id": {
                    "type": "string",
                    "description": "UUID of a single ship.",
                },
                "ship_ids": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "UUIDs for multi-ship queries (Option C loop).",
                },
                "component_id": {
                    "type": "string",
                    "description": "UUID of a single component.",
                },
                "component_ids": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "UUIDs for multi-component queries.",
                },
                "sensor_id": {
                    "type": "string",
                    "description": "UUID of a single sensor.",
                },
                "sensor_ids": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "UUIDs for multi-sensor queries.",
                },
                "start_date": {
                    "type": "string",
                    "description": "ISO datetime string for range start.",
                },
                "end_date": {
                    "type": "string",
                    "description": "ISO datetime string for range end.",
                },
                "limit": {
                    "type": "integer",
                    "description": "Max rows to return (default 100).",
                },
                "_user_query": {
                    "type": "string",
                    "description": (
                        "Original user message — passed through for MISS "
                        "context only, never used in SQL."
                    ),
                },
            },
            "required": ["shape"],
        }

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name":        self.name,
            "description": self.description,
            "parameters":  self.parameters,
        }

    # ------------------------------------------------------------------
    # Main execution entry point
    # ------------------------------------------------------------------

    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Called by ToolExecutor.execute_tool("sql_query", arguments).

        Args:
            parameters: shape + resolved UUIDs + optional temporal params.

        Returns:
            {"success": True/False, "data": {...}} or {"success": False, "error": "..."}
        """
        shape = parameters.get("shape", "").strip()
        if not shape:
            return {"success": False, "error": "No shape provided to sql_query tool."}

        log_stage("SQL_TOOL", f"shape={shape}")

        # ── Step 1: Get SQL template (HIT or MISS) ────────────────────
        sql_template, fetch_error = await self._get_template(shape, parameters)
        if fetch_error:
            return {"success": False, "error": fetch_error}

        # ── Step 2: Multi-ship Option C ───────────────────────────────
        # If ship_ids present, loop single-ship template per ship
        ship_ids: Optional[List[str]] = parameters.get("ship_ids")

        if ship_ids and len(ship_ids) > 1:
            return await self._execute_multi_ship(
                sql_template, parameters, ship_ids, shape
            )

        # ── Step 3: Expand list params into individual bind params ────
        # Must happen before _build_bound_params so declared param names
        # in the SQL match the expanded keys (e.g. component_ids_0, _1 …)
        sql_template, parameters = expand_in_param(sql_template, parameters, "component_ids")
        sql_template, parameters = expand_in_param(sql_template, parameters, "sensor_ids")
        # ship_ids with len==1 falls through here (len>1 caught above)
        sql_template, parameters = expand_in_param(sql_template, parameters, "ship_ids")

        # ── Step 4: Single execution path ────────────────────────────
        bound_params = self._build_bound_params(parameters, sql_template)

        validation_error = self._validate(sql_template, bound_params)
        if validation_error:
            log_stage("VALIDATOR", f"REJECT: {validation_error}")
            await self._memory.invalidate(shape)
            return {"success": False, "error": validation_error}

        log_stage("VALIDATOR", "PASS")

        try:
            rows = await self._run_query(sql_template, bound_params)
        except Exception as exc:
            import traceback
            log_stage("SQL_ERR", traceback.format_exc())
            logger.error("[SQLTool] query failed shape=%s: %s", shape, exc)
            return {
                "success": False,
                "error":   "Database query failed. Please try again.",
            }

        log_stage("SQL_TOOL", f"success rows={len(rows)}")
        return {
            "success": True,
            "data": {
                "rows":          rows,
                "row_count":     len(rows),
                "shape":         shape,
                "generated_sql": sql_template,
                "parameters":    bound_params,
            },
        }

    # ------------------------------------------------------------------
    # Template fetch — HIT or MISS
    # ------------------------------------------------------------------

    async def _get_template(
        self,
        shape: str,
        parameters: Dict[str, Any],
    ) -> Tuple[Optional[str], Optional[str]]:

        message = parameters.get("_user_query", shape)

        memory_result = await self._memory.find(shape, message)

        if memory_result:
            log_stage("SQL_MEMORY", f"HIT key={shape}")
            return memory_result.sql_template, None

        log_stage("SQL_MEMORY", f"MISS key={shape} → generating via LLM")

        user_query = parameters.get("_user_query", "")
        try:
            sql_template, param_schema = await self._generator.generate(
                shape=shape,
                user_query=user_query,
                available_params=_AVAILABLE_PARAMS,
            )
        except ValueError as exc:
            logger.error("[SQLTool] generation failed shape=%s: %s", shape, exc)
            return None, str(exc)

        await self._memory.store(
            key=shape,
            message=message,
            sql_template=sql_template,
            param_schema=param_schema,
            tables_used=self._extract_tables(sql_template),
        )
        log_stage("SQL_MEMORY", f"stored new pattern key={shape}")
        return sql_template, None

    # ------------------------------------------------------------------
    # Multi-ship execution — Option C
    # ------------------------------------------------------------------

    async def _execute_multi_ship(
        self,
        sql_template: str,
        parameters: Dict[str, Any],
        ship_ids: List[str],
        shape: str,
    ) -> Dict[str, Any]:
        """
        Run single-ship template once per ship_id, merge results.
        Avoids SQL Server ANY(:list) limitation entirely.
        """
        log_stage("SQL_TOOL", f"multi-ship loop n={len(ship_ids)}")

        all_rows: List[Dict[str, Any]] = []

        for ship_id in ship_ids:
            # Build a clean per-iteration param dict with this ship only.
            # Expand any remaining list params (component_ids, sensor_ids)
            # per iteration so each cursor.execute() receives scalar params.
            iteration_params = {**parameters, "ship_id": ship_id}
            iter_sql = sql_template

            iter_sql, iteration_params = expand_in_param(iter_sql, iteration_params, "component_ids")
            iter_sql, iteration_params = expand_in_param(iter_sql, iteration_params, "sensor_ids")

            bound_params = self._build_bound_params(iteration_params, iter_sql)

            validation_error = self._validate(iter_sql, bound_params)
            if validation_error:
                log_stage("VALIDATOR", f"REJECT (multi-ship): {validation_error}")
                await self._memory.invalidate(shape)
                return {"success": False, "error": validation_error}

            try:
                rows = await self._run_query(iter_sql, bound_params)
                all_rows.extend(rows)
            except Exception as exc:
                logger.error(
                    "[SQLTool] multi-ship query failed ship_id=%s: %s",
                    ship_id, exc,
                )
                return {
                    "success": False,
                    "error":   "Database query failed on multi-ship execution.",
                }

        log_stage("VALIDATOR", "PASS")
        log_stage("SQL_TOOL", f"multi-ship success total_rows={len(all_rows)}")

        return {
            "success": True,
            "data": {
                "rows":          all_rows,
                "row_count":     len(all_rows),
                "shape":         shape,
                "generated_sql": sql_template,
            },
        }

    # ------------------------------------------------------------------
    # Param binding
    # ------------------------------------------------------------------

    def _build_bound_params(
        self,
        parameters: Dict[str, Any],
        sql_template: str,
    ) -> Dict[str, Any]:
        import uuid as _uuid_module
        from datetime import datetime, timezone

        declared = set(_PARAM_RE.findall(sql_template))
        bound: Dict[str, Any] = {}

        # These are pipeline-internal keys — never forwarded to SQL
        _SKIP = {"shape", "_user_query", "ship_ids", "component_ids", "sensor_ids"}

        for param in declared:
            if param in _SKIP:
                continue

            value = parameters.get(param)

            # Coerce ISO date strings → datetime
            if param in ("start_date", "end_date") and isinstance(value, str):
                try:
                    value = datetime.fromisoformat(value)
                except ValueError:
                    pass

            # Default end_date → now if absent
            if param == "end_date" and value is None:
                value = datetime.now(timezone.utc)

            # Default limit → 100
            if param == "limit":
                value = int(value) if value is not None else 100

            # Default offset → 0
            if param == "offset":
                value = int(value) if value is not None else 0

            # Coerce UUID strings → uuid.UUID for SQL Server uniqueidentifier
            if param.endswith("_id") and isinstance(value, str):
                try:
                    value = _uuid_module.UUID(value)
                except ValueError:
                    pass

            bound[param] = value

        return bound

    # ------------------------------------------------------------------
    # Validation
    # ------------------------------------------------------------------

    def _validate(
        self,
        sql: str,
        bound_params: Dict[str, Any],
    ) -> Optional[str]:
        """
        Returns error string if invalid, None if clean.
        Three checks: no DDL, all params bound, known tables only.

        CTE aliases (WITH ranked AS (...)) are excluded from the
        known-tables check — they are inline result sets, not schema tables.
        """
        # 1 — No DDL / DML
        hit = _UNSAFE_RE.search(sql)
        if hit:
            return f"Unsafe keyword '{hit.group()}' detected — execution blocked."

        # 2 — All :params in SQL are bound
        declared = set(_PARAM_RE.findall(sql))
        unbound  = declared - set(bound_params.keys())
        if unbound:
            return f"Unbound params in SQL: {sorted(unbound)}."

        # 3 — All tables are known (CTE aliases excluded)
        used     = {t.lower() for t in _TABLE_RE.findall(sql)}
        cte_names = _extract_cte_names(sql)
        real_tables = used - cte_names          # remove inline CTE aliases
        unknown  = real_tables - _KNOWN_TABLES
        if unknown:
            return f"Unknown tables referenced: {sorted(unknown)}."

        return None

    # ------------------------------------------------------------------
    # Query execution — AsyncDatabaseService pattern
    # ------------------------------------------------------------------

    async def _run_query(
        self,
        sql: str,
        bound_params: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """
        Mirrors AsyncDatabaseService.execute_query() pattern exactly.
        Sync session + run_in_thread via get_async_db_service().
        """
        async_db = get_async_db_service()

        def _sync_execute():
            log_stage("SQL_RUN", f"executing: {sql[:200]} | params: {bound_params}")
            with get_session_context() as session:
                result = session.execute(text(sql), bound_params)
                return [dict(row) for row in result.mappings().all()]

        return await async_db.run_in_thread(_sync_execute)

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _extract_tables(self, sql: str) -> List[str]:
        """Return real schema tables used in sql, excluding CTE aliases."""
        all_hits  = {t.lower() for t in _TABLE_RE.findall(sql)}
        cte_names = _extract_cte_names(sql)
        return list(all_hits - cte_names)

    def _infer_param_schema(self, sql: str) -> Dict[str, str]:
        """Infer param types from naming convention for storage."""
        schema: Dict[str, str] = {}
        for p in _PARAM_RE.findall(sql):
            if p.endswith("_ids"):
                schema[p] = "uuid[]"
            elif p.endswith("_id"):
                schema[p] = "uuid"
            elif p.endswith(("_date", "_ts")):
                schema[p] = "datetime"
            elif p in ("limit", "offset"):
                schema[p] = "int"
            else:
                schema[p] = "str"
        return schema