import asyncio
from datetime import datetime
import re
from typing import List, Dict, Any, Union, Optional, Tuple
from fastapi import HTTPException
from dateutil import parser
from api.db.dependencies import (
    get_sensor_reading_repository,
    get_sensor_repository,
    get_system_config_repository
)
from utils.nltk.sensors import extract_sensors_from_message


# ── Helpers shared with RUL ────────────────────────────────────────────────────

def _normalise(s: str) -> str:
    return re.sub(r'\s+', '', s.lower())


def _case_insensitive_lookup(d: Dict[str, Any], key: str) -> Optional[Any]:
    key_lower = key.lower()
    for k, v in d.items():
        if k.lower() == key_lower:
            return v
    return None


def _fuzzy_dict_lookup(d: Dict[str, Any], key: str) -> Optional[Any]:
    key_norm = _normalise(key)
    for k, v in d.items():
        if _normalise(k) == key_norm:
            return v
    return None


def _normalise_sensor_dict(d: dict) -> Dict[str, List[str]]:
    """
    Convert repo response to {nom: [sensor_name_str, ...]} regardless of
    whether the repo returns plain strings or SensorMetadata ORM objects.
    """
    result = {}
    for key, values in (d or {}).items():
        names = []
        for v in (values or []):
            if isinstance(v, str):
                names.append(v)
            elif hasattr(v, "sensor_name"):
                names.append(v.sensor_name)
            elif hasattr(v, "name"):
                names.append(v.name)
            else:
                s = str(v)
                if s:
                    names.append(s)
        result[key] = names
    return result


def _merge_sensor_dicts(
    component_dict: Dict[str, List[str]],
    nomenclature_dict: Dict[str, List[str]]
) -> Dict[str, List[str]]:
    """
    Merge two sensor dicts WITHOUT silently overwriting keys.
    Values from both dicts are combined (union) for matching keys.

    FIX: Previously used {**d1, **d2} which silently dropped component
    sensor lists when a nomenclature had the same key name.
    """
    merged = dict(component_dict)
    for key, values in nomenclature_dict.items():
        if key in merged:
            # Combine and deduplicate
            existing = merged[key]
            merged[key] = list(dict.fromkeys(existing + values))
        else:
            merged[key] = values
    return merged


# "all sensors" intent detection
_ALL_SENSORS_PATTERN = re.compile(
    r'\b(all\s+sensors?|every\s+sensors?|all\s+available\s+sensors?|everything)\b',
    re.IGNORECASE
)


def _is_all_sensors_query(query: str) -> bool:
    return bool(_ALL_SENSORS_PATTERN.search(query))


class Sensor:

    @staticmethod
    def _fuzzy_match_month(word: str) -> Optional[str]:
        """
        Fuzzy-match a single word against known month names/abbreviations.

        Handles typos like 'ajnuary', 'jaunary', 'decmeber', 'augst' etc.
        Uses character-overlap ratio — requires >60% similarity to match,
        so short unrelated words don't accidentally match.

        Returns the canonical month name string (e.g. 'january') or None.
        """
        # All known month tokens in priority order (longer first so 'sept' beats 'sep')
        MONTH_TOKENS = [
            'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december',
            'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'sept',
            'oct', 'nov', 'dec',
        ]

        word = word.lower().strip()
        if not word or len(word) < 3:
            return None

        # Exact match first
        if word in MONTH_TOKENS:
            return word

        # Fuzzy: use difflib SequenceMatcher ratio
        from difflib import SequenceMatcher
        best_token  = None
        best_ratio  = 0.0
        THRESHOLD   = 0.6  # require at least 60% similarity

        for token in MONTH_TOKENS:
            ratio = SequenceMatcher(None, word, token).ratio()
            if ratio > best_ratio:
                best_ratio  = ratio
                best_token  = token

        return best_token if best_ratio >= THRESHOLD else None

    @staticmethod
    async def _parse_time_query(time_query: str) -> Dict[str, Any]:
        """
        Parse natural language time queries into function parameters.

        FIX 1: Fuzzy month matching via _fuzzy_match_month() so typos like
                'ajnuary', 'jaunary', 'augst' still resolve correctly.

        FIX 2: Fallback is now {} (no date filter = fetch ALL data) instead of
                {'last_days': 7}. When the user says something like "show me
                january data" but we can't parse a date, it's better to return
                everything than silently restrict to an arbitrary 7-day window.
                Also covers the case where the DB has no recent data at all.

        FIX 3: year-only queries converted to explicit start/end date range.
        """
        if not time_query:
            return {}  # FIX: was last_days:7 — return all data instead

        query = time_query.lower().strip()
        params = {}

        # ── Relative: hours ──────────────────────────────────────────────────
        if match := re.search(r'last\s+(\d+)\s+hours?', query):
            params['last_hours'] = int(match.group(1))
        elif match := re.search(r'past\s+(\d+)\s+hours?', query):
            params['last_hours'] = int(match.group(1))
        elif match := re.search(r'(\d+)\s+hours?\s+ago', query):
            params['last_hours'] = int(match.group(1))

        # ── Relative: days ───────────────────────────────────────────────────
        elif match := re.search(r'last\s+(\d+)\s+days?', query):
            params['last_days'] = int(match.group(1))
        elif match := re.search(r'past\s+(\d+)\s+days?', query):
            params['last_days'] = int(match.group(1))
        elif match := re.search(r'(\d+)\s+days?\s+ago', query):
            params['last_days'] = int(match.group(1))

        # ── Relative: weeks ──────────────────────────────────────────────────
        elif match := re.search(r'last\s+(\d+)\s+weeks?', query):
            params['last_weeks'] = int(match.group(1))
        elif match := re.search(r'past\s+(\d+)\s+weeks?', query):
            params['last_weeks'] = int(match.group(1))

        # ── Relative: months ─────────────────────────────────────────────────
        elif match := re.search(r'last\s+(\d+)\s+months?', query):
            params['last_months'] = int(match.group(1))
        elif match := re.search(r'past\s+(\d+)\s+months?', query):
            params['last_months'] = int(match.group(1))

        elif 'last week' in query or 'past week' in query:
            params['last_days'] = 7
        elif 'last month' in query or 'past month' in query:
            params['last_months'] = 1
        elif 'last year' in query or 'past year' in query:
            params['last_months'] = 12

        # ── Today / yesterday ────────────────────────────────────────────────
        elif re.search(r'\btoday\b', query):
            params['today'] = True
        elif re.search(r'\byesterday\b', query):
            params['yesterday'] = True

        # ── Exact date range: 2024-01-01 to 2024-03-31 ──────────────────────
        elif match := re.search(
            r'(\d{4}-\d{2}-\d{2})(?:\s+to\s+|\s*-\s*)(\d{4}-\d{2}-\d{2})', query
        ):
            try:
                params['start_date'] = parser.parse(match.group(1))
                params['end_date']   = parser.parse(match.group(2))
            except Exception:
                pass

        # ── Year-only: "2025" or "year 2025" ────────────────────────────────
        elif match := re.search(r'\byear\s+(\d{4})\b', query):
            year = int(match.group(1))
            params['start_date'] = datetime(year, 1, 1)
            params['end_date']   = datetime(year, 12, 31, 23, 59, 59)
        elif match := re.search(r'^\s*(\d{4})\s*$', query):
            year = int(match.group(1))
            params['start_date'] = datetime(year, 1, 1)
            params['end_date']   = datetime(year, 12, 31, 23, 59, 59)

        # ── Week number ──────────────────────────────────────────────────────
        elif match := re.search(r'week\s+(\d+)(?:\s+of\s+(\d{4}))?', query):
            params['week_number'] = int(match.group(1))
            if match.group(2):
                params['year'] = int(match.group(2))

        # ── This week / month / year ─────────────────────────────────────────
        elif 'this week' in query:
            params['last_days'] = 7
        elif 'this month' in query:
            now = datetime.now()
            params['year']  = now.year
            params['month'] = now.month
        elif 'this year' in query:
            now = datetime.now()
            params['start_date'] = datetime(now.year, 1, 1)
            params['end_date']   = datetime(now.year, 12, 31, 23, 59, 59)

        # ── Recent / overnight / this morning ────────────────────────────────
        elif query in ['recent', 'recently', 'latest']:
            params['last_hours'] = 24
        elif query in ['overnight', 'last night']:
            params['last_hours'] = 12
        elif 'this morning' in query:
            now = datetime.now()
            params['start_date'] = now.replace(hour=6,  minute=0, second=0, microsecond=0)
            params['end_date']   = now.replace(hour=12, minute=0, second=0, microsecond=0)

        else:
            # ── FIX: Fuzzy month detection ───────────────────────────────────
            # Try every word in the query for a fuzzy month match.
            # This catches typos like 'ajnuary', 'jaunary', 'decmeber' etc.
            # Also handles "month + year" in any word order.
            detected_month = None
            detected_year  = None

            # Extract any 4-digit year from the query
            year_match = re.search(r'\b(\d{4})\b', query)
            if year_match:
                detected_year = int(year_match.group(1))

            for word in re.split(r'[\s,]+', query):
                matched = Sensor._fuzzy_match_month(word)
                if matched:
                    detected_month = matched
                    break

            if detected_month:
                params['month_name'] = detected_month
                if detected_year:
                    params['year'] = detected_year
                # If no year found, repo defaults to current year — fine

        # ── Final fallback: no date filter = return ALL data ─────────────────
        # FIX: was {'last_days': 7} which silently restricted results when
        # no time was specified or when a typo caused a parse miss.
        # Returning {} means get_readings_time_based() applies no date filter.
        if not params:
            params = {}  # all data — no date filter applied

        return params

    @staticmethod
    async def _resolve_names_to_nomenclatures(
        names: List[str],
        ships: Optional[List[str]] = None
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Resolve all names (components/nomenclatures) to actual nomenclatures in ONE batch.

        Returns:
            (nomenclature_list, errors)
        """
        sys_repo = get_system_config_repository()
        errors = []
        nomenclature_data = []

        component_checks = await asyncio.gather(
            *[sys_repo.is_component(name) for name in names],
            return_exceptions=True
        )

        component_names: List[str]    = []
        nomenclature_names: List[str] = []

        for name, is_comp in zip(names, component_checks):
            if isinstance(is_comp, Exception):
                errors.append({
                    "name": name, "type": "validation_error",
                    "message": f"Failed to validate name: {str(is_comp)}", "severity": "error"
                })
            elif is_comp:
                component_names.append(name)
            else:
                nomenclature_names.append(name)

        if component_names:
            component_results = await asyncio.gather(
                *[sys_repo.get_nomenclatures_wrt_component_name_wrt_ships(c, ships=ships)
                  for c in component_names],
                return_exceptions=True
            )
            for comp_name, result in zip(component_names, component_results):
                if isinstance(result, Exception):
                    errors.append({
                        "name": comp_name, "type": "fetch_error",
                        "message": f"Failed to fetch nomenclatures: {str(result)}", "severity": "error"
                    })
                elif not result:
                    errors.append({
                        "name": comp_name, "type": "no_data",
                        "message": f"No nomenclatures found for component '{comp_name}'", "severity": "warning"
                    })
                else:
                    for nom_data in result:
                        nomenclature_data.append({
                            "original_name": comp_name,
                            "nomenclature":  nom_data["nomenclature"],
                            "component_id":  nom_data["id"],
                            "ship":          nom_data.get("ship", "Unknown")
                        })

        if nomenclature_names:
            nomenclature_results = await asyncio.gather(
                *[sys_repo.get_component_id_and_ship_name_by_nomenclature(n)
                  for n in nomenclature_names],
                return_exceptions=True
            )
            for nom_name, result in zip(nomenclature_names, nomenclature_results):
                if isinstance(result, Exception):
                    errors.append({
                        "name": nom_name, "type": "fetch_error",
                        "message": f"Failed to fetch component data: {str(result)}", "severity": "error"
                    })
                elif not result:
                    errors.append({
                        "name": nom_name, "type": "not_found",
                        "message": f"No component found for nomenclature: {nom_name}", "severity": "error"
                    })
                else:
                    filtered = [(cid, ship) for cid, ship in result if not ships or ship in ships]
                    if not filtered:
                        errors.append({
                            "name": nom_name, "type": "filtered_out",
                            "message": f"Nomenclature '{nom_name}' not found on ships: {ships}", "severity": "warning"
                        })
                    else:
                        for comp_id, ship in filtered:
                            nomenclature_data.append({
                                "original_name": nom_name,
                                "nomenclature":  nom_name,
                                "component_id":  comp_id,
                                "ship":          ship
                            })

        return nomenclature_data, errors

    @staticmethod
    async def _fetch_all_sensors_for_nomenclatures(
        nomenclature_data: List[Dict[str, Any]],
        metadata_repo  # FIX: repo passed in, not re-instantiated per call
    ) -> Tuple[Dict[str, List[str]], Optional[Exception]]:
        """
        Fetch ALL sensor name strings from the DB for each resolved nomenclature.

        FIX: Now accepts a pre-instantiated repo instead of calling get_sensor_repository()
        internally to avoid shared-state race conditions under asyncio.gather.

        FIX: Errors are now raised/returned instead of silently swallowed.

        Returns:
            ({nomenclature_name: [sensor_name, ...]}, error_or_None)
        """
        try:
            raw = await metadata_repo.get_sensors_grouped_by_nomenclature()
        except Exception as e:
            # FIX: was `return {}` — now surfaces the error to the caller
            return {}, e

        all_nom_sensors = _normalise_sensor_dict(raw)

        nom_sensors: Dict[str, List[str]] = {}
        for nom_info in nomenclature_data:
            nom_name = nom_info["nomenclature"]
            if nom_name in nom_sensors:
                continue

            sensors = (
                all_nom_sensors.get(nom_name)
                or _case_insensitive_lookup(all_nom_sensors, nom_name)
                or _fuzzy_dict_lookup(all_nom_sensors, nom_name)
                or []
            )

            if sensors:
                nom_sensors[nom_name] = sensors

        return nom_sensors, None

    @staticmethod
    async def _fetch_sensor_readings_batch(
        nomenclature_data: List[Dict[str, Any]],
        sensors: List[str],
        time_params: Dict[str, Any],
        metadata_repo,   # FIX: repos passed in, not re-instantiated per nested call
        reading_repo
    ) -> Tuple[Dict[str, Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Fetch sensor readings for ALL nomenclatures in parallel.

        FIX: Repos are now injected parameters rather than created inside this
        method. This prevents shared-state issues when called from within
        asyncio.gather (previously each nested gather re-called get_*_repository()
        which could yield stale/shared connection-pool state).

        FIX: Errors are collected as return values from each coroutine instead
        of being appended to a shared list from concurrent tasks (avoids
        concurrent mutation of a shared list).

        Args:
            nomenclature_data: Resolved list from _resolve_names_to_nomenclatures
            sensors:           List of sensor name strings to fetch
            time_params:       Parsed time parameters for get_readings_time_based()
            metadata_repo:     Injected sensor metadata repository
            reading_repo:      Injected sensor reading repository

        Returns:
            (ship_grouped_data, errors)
        """

        async def fetch_for_single_nomenclature(
            nom_info: Dict[str, Any]
        ) -> Tuple[Optional[Dict[str, Any]], List[Dict[str, Any]]]:
            """Returns (result_or_None, local_errors)"""
            local_errors: List[Dict[str, Any]] = []
            nomenclature = nom_info["nomenclature"]
            component_id = nom_info["component_id"]
            ship         = nom_info["ship"]

            try:
                sensor_data: Dict[str, Any] = {}

                for sensor_name in sensors:
                    try:
                        sensor_id = await metadata_repo.get_sensorid_by_name(
                            component_id=component_id,
                            sensor_name=sensor_name
                        )

                        if not sensor_id:
                            local_errors.append({
                                "nomenclature": nomenclature, "ship": ship,
                                "sensor": sensor_name, "type": "sensor_not_found",
                                "message": f"Sensor '{sensor_name}' not found on {nomenclature}",
                                "severity": "warning"
                            })
                            continue

                        sensor_minmax = await metadata_repo.get_sensor_minmax_by_id(
                            sensor_id=sensor_id
                        )

                        if sensor_minmax is None:
                            local_errors.append({
                                "nomenclature": nomenclature, "ship": ship,
                                "sensor": sensor_name, "type": "minmax_not_found",
                                "message": f"Min/max values not found for sensor '{sensor_name}'",
                                "severity": "warning"
                            })
                            continue

                        min_val, max_val, unit = sensor_minmax

                        readings = await reading_repo.get_readings_time_based(
                            sensor_id=sensor_id,
                            component_id=component_id,
                            **time_params
                        )

                        if readings is None:
                            readings = []
                        elif not isinstance(readings, list):
                            raise ValueError(f"Expected list of readings, got {type(readings)}")

                        sensor_data[sensor_name] = {
                            "sensor_id":  str(sensor_id),
                            "readings":   readings,
                            "min_value":  min_val,
                            "max_value":  max_val,
                            "unit":       unit
                        }

                    except Exception as e:
                        local_errors.append({
                            "nomenclature": nomenclature, "ship": ship,
                            "sensor": sensor_name, "type": "sensor_fetch_error",
                            "message": str(e), "severity": "error"
                        })

                result = {
                    "ship":        ship,
                    "nomenclature": nomenclature,
                    "data": {
                        "nomenclature": nomenclature,
                        "component_id": str(component_id),
                        "ship":         ship,
                        "sensors":      sensor_data
                    }
                }
                return result, local_errors

            except Exception as e:
                local_errors.append({
                    "nomenclature": nomenclature, "ship": ship,
                    "type": "nomenclature_fetch_error",
                    "message": str(e), "severity": "error"
                })
                return None, local_errors

        # FIX: each task returns (result, local_errors) — no shared mutable list
        raw_results = await asyncio.gather(
            *[fetch_for_single_nomenclature(nom) for nom in nomenclature_data],
            return_exceptions=True
        )

        ship_grouped: Dict[str, Dict[str, Any]] = {}
        all_errors: List[Dict[str, Any]] = []

        for raw in raw_results:
            if isinstance(raw, Exception):
                all_errors.append({
                    "type": "unexpected_error",
                    "message": str(raw), "severity": "error"
                })
                continue

            result, local_errors = raw
            all_errors.extend(local_errors)

            if result is None:
                continue

            ship         = result["ship"]
            nomenclature = result["nomenclature"]
            data         = result["data"]

            ship_grouped.setdefault(ship, {})
            ship_grouped[ship][nomenclature] = data

        return ship_grouped, all_errors

    @staticmethod
    async def _fetch_sensor_readings_batch_all(
        nomenclature_data: List[Dict[str, Any]],
        time_params: Dict[str, Any],
        metadata_repo,  # FIX: injected
        reading_repo    # FIX: injected
    ) -> Tuple[Dict[str, Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Like _fetch_sensor_readings_batch but uses per-nomenclature sensor lists
        (stored in nom_info["_sensors"]) instead of a shared sensor list.

        FIX: No longer calls _fetch_sensor_readings_batch from inside asyncio.gather.
        Each nom's sensors are unpacked and fed directly into the same single-nom
        coroutine path to avoid nested gather + shared-repo issues.

        FIX: Repos are injected, not re-instantiated.
        """

        async def fetch_one(
            nom_info: Dict[str, Any]
        ) -> Tuple[Optional[Dict[str, Any]], List[Dict[str, Any]]]:
            sensors      = nom_info.get("_sensors", [])
            nom_copy     = {k: v for k, v in nom_info.items() if k != "_sensors"}

            # Directly call batch with single-item list + injected repos
            ship_grouped, errs = await Sensor._fetch_sensor_readings_batch(
                nomenclature_data=[nom_copy],
                sensors=sensors,
                time_params=time_params,
                metadata_repo=metadata_repo,
                reading_repo=reading_repo
            )

            for ship_key, noms in ship_grouped.items():
                for nom_key, data in noms.items():
                    return {"ship": ship_key, "nomenclature": nom_key, "data": data}, errs
            return None, errs

        # FIX: each task returns (result, local_errors) — no shared mutable list
        raw_results = await asyncio.gather(
            *[fetch_one(nom) for nom in nomenclature_data],
            return_exceptions=True
        )

        ship_grouped: Dict[str, Dict[str, Any]] = {}
        all_errors: List[Dict[str, Any]] = []

        for raw in raw_results:
            if isinstance(raw, Exception):
                all_errors.append({
                    "type": "unexpected_error",
                    "message": str(raw), "severity": "error"
                })
                continue

            result, local_errors = raw
            all_errors.extend(local_errors)

            if result is None:
                continue

            ship         = result["ship"]
            nomenclature = result["nomenclature"]
            ship_grouped.setdefault(ship, {})
            ship_grouped[ship][nomenclature] = result["data"]

        return ship_grouped, all_errors

    @staticmethod
    async def sensor_readings(
        time_query: str,
        name: Union[str, List[str]],
        ships: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Main orchestrator for sensor reading retrieval.

        Supports three query modes (detected automatically):

        ┌─────────────────────────────────────────────────────────────────────┐
        │ Mode 1 — SPECIFIC SENSORS with pairing                              │
        │   "Show GTG_S4 on GT 1 of INS One for last 7 days"                 │
        │   → Only GTG_S4 fetched for GT 1 on INS One                        │
        │                                                                     │
        │ Mode 2 — FLAT SENSOR LIST (no pairing)                              │
        │   "Show S2 and S3 for last 24 hours"                                │
        │   → S2 and S3 tried against every resolved nomenclature             │
        │                                                                     │
        │ Mode 3 — ALL SENSORS                                                │
        │   "all sensors on GT 1 for last week"                               │
        │   "everything for last 7 days"                                      │
        │   → Every sensor in DB for each resolved nomenclature               │
        └─────────────────────────────────────────────────────────────────────┘

        FIX: Repos are now instantiated ONCE here and passed down to all
        helper methods. This eliminates the race condition where nested
        asyncio.gather calls each called get_*_repository() independently,
        potentially getting stale or conflicting connection pool state.

        Args:
            time_query: Natural language query with sensor + time info.
            name:       Component name(s) or Nomenclature name(s).
            ships:      Optional list of ship names to filter by.

        Returns:
            {
                "status": "success" | "partial_success" | "error",
                "data":   { ship → { nomenclature → { sensors → { ... } } } },
                "metadata": { ... },
                "errors": [ ... ]   # omitted when empty
            }
        """
        # FIX: Instantiate repos ONCE at the top level and pass them down.
        # Previously each helper called get_*_repository() independently,
        # which under concurrent load can return shared/stale state.
        metadata_repo = get_sensor_repository()
        reading_repo  = get_sensor_reading_repository()

        # Normalise name input
        if isinstance(name, str):
            try:
                import ast
                name = ast.literal_eval(name)
            except Exception:
                name = [name]
        if isinstance(name, list):
            name = list(dict.fromkeys(name))  # deduplicate, preserve order

        original_ships = ships
        if ships:
            ships = [s.strip() for s in ships]

        # Parse time query ONCE
        time_params = await Sensor._parse_time_query(time_query)

        # Fetch + normalise sensor dicts ONCE
        raw_component    = await metadata_repo.get_sensors_grouped_by_component()
        raw_nomenclature = await metadata_repo.get_sensors_grouped_by_nomenclature()

        # FIX: Use merge helper instead of {**d1, **d2} to prevent silent key overwrites
        combined_sensor_dict = _merge_sensor_dicts(
            _normalise_sensor_dict(raw_component),
            _normalise_sensor_dict(raw_nomenclature)
        )

        # ── Detect query mode ─────────────────────────────────────────────────
        is_all_sensors = _is_all_sensors_query(time_query)
        sensors: List[str] = []

        if is_all_sensors:
            # Mode 3: sensors fetched from DB after nom resolution
            pass
        else:
            # Mode 1 / Mode 2: extract sensor names from query
            sensors = extract_sensors_from_message(time_query, combined_sensor_dict)

            if not sensors:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "No sensors specified in query. Examples:\n"
                        "  • Specific: 'Show GTG_S4 on GT 1 for last 7 days'\n"
                        "  • All:      'Show all sensors on GT 1 for last 7 days'"
                    )
                )

        # Resolve names → nomenclatures
        nomenclature_data, resolution_errors = await Sensor._resolve_names_to_nomenclatures(
            names=name, ships=ships
        )

        if not nomenclature_data:
            raise HTTPException(
                status_code=404,
                detail={"message": "No valid nomenclatures found", "errors": resolution_errors}
            )

        # Mode 3: fetch all sensors from DB per nomenclature
        if is_all_sensors:
            # FIX: repo is now passed in, and errors from the fetch are surfaced
            all_sensors_map, fetch_meta_err = await Sensor._fetch_all_sensors_for_nomenclatures(
                nomenclature_data, metadata_repo=metadata_repo
            )

            if fetch_meta_err is not None:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to fetch sensor metadata: {fetch_meta_err}"
                )

            expanded: List[Dict[str, Any]] = []
            no_sensor_errors: List[Dict[str, Any]] = []

            for nom_info in nomenclature_data:
                nom_name = nom_info["nomenclature"]
                nom_sensors = (
                    all_sensors_map.get(nom_name)
                    or _fuzzy_dict_lookup(all_sensors_map, nom_name)
                    or []
                )
                if nom_sensors:
                    expanded.append({**nom_info, "_sensors": nom_sensors})
                else:
                    # FIX: was silently skipped — now surfaces as an info-level error
                    # so the caller knows why this nomenclature is absent from results
                    no_sensor_errors.append({
                        "nomenclature": nom_name,
                        "ship":         nom_info.get("ship", "Unknown"),
                        "type":         "no_sensors_in_db",
                        "message":      f"No sensors found in DB for nomenclature '{nom_name}'",
                        "severity":     "info"
                    })

            # FIX: injected repos passed through
            ship_grouped_data, fetch_errors = await Sensor._fetch_sensor_readings_batch_all(
                nomenclature_data=expanded,
                time_params=time_params,
                metadata_repo=metadata_repo,
                reading_repo=reading_repo
            )
            fetch_errors = no_sensor_errors + fetch_errors

            # FIX: sensors_extracted now only lists sensors actually found & fetched,
            # not the full union from the DB scan (which included sensors from other noms)
            actually_fetched_sensors: set = set()
            for ship_data in ship_grouped_data.values():
                for nom_data in ship_data.values():
                    actually_fetched_sensors.update(nom_data.get("sensors", {}).keys())
            all_sensors_extracted = sorted(actually_fetched_sensors)
            query_mode = "all_sensors"

        else:
            # Mode 1 / 2: uniform sensor list for all nomenclatures
            # FIX: injected repos passed through
            ship_grouped_data, fetch_errors = await Sensor._fetch_sensor_readings_batch(
                nomenclature_data=nomenclature_data,
                sensors=sensors,
                time_params=time_params,
                metadata_repo=metadata_repo,
                reading_repo=reading_repo
            )
            all_sensors_extracted = sensors
            query_mode = "specific"

        # Build response
        all_errors       = resolution_errors + fetch_errors
        successful_names = list(set(n["original_name"] for n in nomenclature_data))
        failed_names     = [e["name"] for e in resolution_errors if "name" in e]
        ships_returned   = list(ship_grouped_data.keys())

        if all_errors and not ship_grouped_data:
            status = "error"
        elif all_errors:
            status = "partial_success"
        else:
            status = "success"

        response: Dict[str, Any] = {
            "status": status,
            "data":   ship_grouped_data,
            "metadata": {
                "requested":         name,
                "successful":        successful_names,
                "failed":            failed_names,
                "ships_requested":   original_ships or "all",
                "ships_returned":    ships_returned,
                "time_query":        time_query,
                "time_params":       time_params if time_params else {"filter": "none — all data"},
                "query_mode":        query_mode,
                "sensors_extracted": all_sensors_extracted
            }
        }

        if all_errors:
            response["errors"] = all_errors

        if status == "error":
            raise HTTPException(
                status_code=404,
                detail={"message": "Failed to retrieve sensor readings", "errors": all_errors}
            )

        return response