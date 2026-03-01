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


# ── Helpers ────────────────────────────────────────────────────────────────────

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
    merged = dict(component_dict)
    for key, values in nomenclature_dict.items():
        if key in merged:
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


# ── FIX #6: Sensor+Nomenclature+Ship pairing extraction for sensors.py ────────
def extract_sensor_nomenclature_ship_pairings(
    query: str,
    sensor_dict: Dict[str, List[str]],
) -> Dict[str, Dict[str, Any]]:
    """
    Extract sensor → nomenclature → ship mappings from a natural language query.

    Handles all patterns:
      - "GTG_S4 on GTG 1 of INS One"        (standard)
      - "GTG_S4 on GTG 1 on INS One"        (on/on)
      - "GTG_S4 sensor of GTG 1 on INS One" (sensor keyword + of/on swap)
      - "GTG_S4 of GTG 1 on INS One"        (of first)

    Returns:
        {nom_name: {"sensors": [...], "ship": str_or_None}}
        Empty dict if no pairings found.
    """
    all_known_sensors: set = set()
    for sensors in sensor_dict.values():
        all_known_sensors.update(sensors)

    if not all_known_sensors:
        return {}

    sensor_pattern = re.compile(
        r'\b(' + '|'.join(re.escape(s) for s in sorted(all_known_sensors, key=len, reverse=True)) + r')\b',
        re.IGNORECASE
    )

    # Split on commas and "and" to get individual clauses
    clauses = re.split(r',\s*(?:and\s+)?|;\s*|\band\b', query, flags=re.IGNORECASE)
    pairings: Dict[str, Dict[str, Any]] = {}

    for clause in clauses:
        found_sensors = sensor_pattern.findall(clause)
        if not found_sensors:
            continue

        # Strip optional "sensor" keyword noise
        # e.g. "GTG_S4 sensor of GTG 1 on INS One" → "GTG_S4 of GTG 1 on INS One"
        clause_clean = re.sub(r'\bsensor\b', '', clause, flags=re.IGNORECASE).strip()

        raw_nom   = None
        ship_name = None

        for sensor in found_sensors:
            # KEY FIX: anchor the nom/ship regex to start AFTER the sensor name
            # This prevents "values of" or other earlier "of/on" in the clause
            # from being mistakenly captured as the nom.
            # e.g. "show me values of GTG_S4 of GTG 1 on ins one"
            #       → after "GTG_S4": " of GTG 1 on ins one" → NOM="GTG 1", SHIP="ins one" ✅
            sensor_match = re.search(re.escape(sensor), clause_clean, re.IGNORECASE)
            if not sensor_match:
                continue

            after_sensor = clause_clean[sensor_match.end():]

            full_match = re.search(
                r'^\s*\b(?:on|of)\s+(.+?)\s+(?:on|of)\s+(.+?)(?=\s*,|\s*;|\s*\band\b|\s*$)',
                after_sensor, re.IGNORECASE
            )

            if full_match:
                raw_nom   = full_match.group(1).strip()
                ship_name = full_match.group(2).strip()
            else:
                # Fallback: nom only, no ship
                nom_match = re.search(
                    r'^\s*\b(?:on|of)\s+(.+?)(?=\s*,|\s*;|\s*$)',
                    after_sensor, re.IGNORECASE
                )
                raw_nom   = nom_match.group(1).strip() if nom_match else None
                ship_name = None

            break  # use first sensor in clause to determine nom/ship

        if not raw_nom:
            continue

        for sensor in found_sensors:
            matched_sensor = next(
                (s for s in all_known_sensors if s.lower() == sensor.lower()),
                sensor
            )
            if raw_nom not in pairings:
                pairings[raw_nom] = {"sensors": [], "ship": ship_name}
            if matched_sensor not in pairings[raw_nom]["sensors"]:
                pairings[raw_nom]["sensors"].append(matched_sensor)

    return pairings


class Sensor:

    @staticmethod
    def _fuzzy_match_month(word: str) -> Optional[str]:
        """
        Fuzzy-match a single word against known month names/abbreviations.

        FIX #7: Require minimum 5 characters for fuzzy matching to prevent
        short words like 'ins', 'one', 'two', 'on', 'of' from matching
        month abbreviations like 'jan', 'feb' etc.
        Exact matches are still allowed for any length.
        """
        MONTH_TOKENS = [
            'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december',
            'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'sept',
            'oct', 'nov', 'dec',
        ]

        word = word.lower().strip()
        if not word or len(word) < 3:
            return None

        # Exact match first — allow any length
        if word in MONTH_TOKENS:
            return word

        # FIX #7: Fuzzy match only on words >= 5 chars
        # This prevents 'ins' (3), 'one' (3), 'two' (3), 'on' (2) etc.
        # from fuzzy-matching 'jan', 'jun', 'jan' etc.
        if len(word) < 5:
            return None

        from difflib import SequenceMatcher
        best_token  = None
        best_ratio  = 0.0
        THRESHOLD   = 0.6

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
        FIX #7 applied in _fuzzy_match_month — 'ins' no longer matches 'jan'.
        """
        if not time_query:
            return {}

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

        # ── Exact date range ─────────────────────────────────────────────────
        elif match := re.search(
            r'(\d{4}-\d{2}-\d{2})(?:\s+to\s+|\s*-\s*)(\d{4}-\d{2}-\d{2})', query
        ):
            try:
                params['start_date'] = parser.parse(match.group(1))
                params['end_date']   = parser.parse(match.group(2))
            except Exception:
                pass

        # ── Year-only ────────────────────────────────────────────────────────
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
            # ── Fuzzy month detection (FIX #7: min 5 chars for fuzzy) ────────
            detected_month = None
            detected_year  = None

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

        if not params:
            params = {}

        return params

    @staticmethod
    async def _resolve_names_to_nomenclatures(
        names: List[str],
        ships: Optional[List[str]] = None
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
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
        metadata_repo
    ) -> Tuple[Dict[str, List[str]], Optional[Exception]]:
        try:
            raw = await metadata_repo.get_sensors_grouped_by_nomenclature()
        except Exception as e:
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
        metadata_repo,
        reading_repo,
        # FIX #5: optional pairing to restrict which sensor goes to which (nom, ship)
        sensor_pairings: Optional[Dict[str, Dict[str, Any]]] = None,
    ) -> Tuple[Dict[str, Dict[str, Any]], List[Dict[str, Any]]]:

        async def fetch_for_single_nomenclature(
            nom_info: Dict[str, Any]
        ) -> Tuple[Optional[Dict[str, Any]], List[Dict[str, Any]]]:
            local_errors: List[Dict[str, Any]] = []
            nomenclature = nom_info["nomenclature"]
            component_id = nom_info["component_id"]
            ship         = nom_info["ship"]

            # FIX #5: resolve which sensors to use for this (nom, ship) combo
            sensors_to_fetch = sensors  # default: all extracted sensors

            if sensor_pairings:
                pairing = (
                    sensor_pairings.get(nomenclature)
                    or _case_insensitive_lookup(sensor_pairings, nomenclature)
                    or _fuzzy_dict_lookup(sensor_pairings, nomenclature)
                )
                if pairing:
                    paired_ship = pairing.get("ship")
                    # Skip this (nom, ship) if it's the wrong ship for this pairing
                    if paired_ship and _normalise(ship) != _normalise(paired_ship):
                        return None, []
                    sensors_to_fetch = pairing["sensors"]
                else:
                    # No pairing entry for this nom — skip entirely in paired mode
                    return None, []

            try:
                sensor_data: Dict[str, Any] = {}

                for sensor_name in sensors_to_fetch:
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
        metadata_repo,
        reading_repo
    ) -> Tuple[Dict[str, Dict[str, Any]], List[Dict[str, Any]]]:

        async def fetch_one(
            nom_info: Dict[str, Any]
        ) -> Tuple[Optional[Dict[str, Any]], List[Dict[str, Any]]]:
            sensors  = nom_info.get("_sensors", [])
            nom_copy = {k: v for k, v in nom_info.items() if k != "_sensors"}

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

        Supports three query modes:
          Mode 1 — SPECIFIC SENSORS with nom+ship pairing  (FIX #5, #6)
          Mode 2 — FLAT SENSOR LIST, no pairing
          Mode 3 — ALL SENSORS per nomenclature
        """
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
            name = list(dict.fromkeys(name))

        original_ships = ships
        if ships:
            ships = [s.strip() for s in ships]

        # FIX #7: parse_time_query now uses fixed _fuzzy_match_month
        time_params = await Sensor._parse_time_query(time_query)

        raw_component    = await metadata_repo.get_sensors_grouped_by_component()
        raw_nomenclature = await metadata_repo.get_sensors_grouped_by_nomenclature()

        combined_sensor_dict = _merge_sensor_dicts(
            _normalise_sensor_dict(raw_component),
            _normalise_sensor_dict(raw_nomenclature)
        )

        # ── Detect query mode ─────────────────────────────────────────────────
        is_all_sensors = _is_all_sensors_query(time_query)
        sensors: List[str] = []
        sensor_pairings: Dict[str, Dict[str, Any]] = {}

        if is_all_sensors:
            # Mode 3
            pass
        else:
            # FIX #5/#6: Try pairing extraction first (Mode 1)
            sensor_pairings = extract_sensor_nomenclature_ship_pairings(
                time_query, combined_sensor_dict
            )

            if sensor_pairings:
                # Mode 1: paired — collect all sensors from pairings
                sensors = list({
                    s
                    for p in sensor_pairings.values()
                    for s in p["sensors"]
                })
            else:
                # Mode 2: flat extraction
                sensors = extract_sensors_from_message(time_query, combined_sensor_dict)

                if not sensors:
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            "No sensors specified in query. Examples:\n"
                            "  • Specific: 'Show GTG_S4 on GTG 1 for last 7 days'\n"
                            "  • All:      'Show all sensors on GTG 1 for last 7 days'"
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
                    no_sensor_errors.append({
                        "nomenclature": nom_name,
                        "ship":         nom_info.get("ship", "Unknown"),
                        "type":         "no_sensors_in_db",
                        "message":      f"No sensors found in DB for nomenclature '{nom_name}'",
                        "severity":     "info"
                    })

            ship_grouped_data, fetch_errors = await Sensor._fetch_sensor_readings_batch_all(
                nomenclature_data=expanded,
                time_params=time_params,
                metadata_repo=metadata_repo,
                reading_repo=reading_repo
            )
            fetch_errors = no_sensor_errors + fetch_errors

            actually_fetched_sensors: set = set()
            for ship_data in ship_grouped_data.values():
                for nom_data in ship_data.values():
                    actually_fetched_sensors.update(nom_data.get("sensors", {}).keys())
            all_sensors_extracted = sorted(actually_fetched_sensors)
            query_mode = "all_sensors"

        else:
            # Mode 1 (paired) or Mode 2 (flat)
            ship_grouped_data, fetch_errors = await Sensor._fetch_sensor_readings_batch(
                nomenclature_data=nomenclature_data,
                sensors=sensors,
                time_params=time_params,
                metadata_repo=metadata_repo,
                reading_repo=reading_repo,
                sensor_pairings=sensor_pairings if sensor_pairings else None,
            )
            all_sensors_extracted = sensors
            query_mode = "paired" if sensor_pairings else "specific"

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