import asyncio
import re
from uuid import UUID
from typing import List, Dict, Any, Union, Optional, Tuple
from fastapi import HTTPException
from pydantic import BaseModel, Field
from scipy.stats import weibull_min
import math
import logging

from api.db.dependencies import (
    get_sensor_reading_repository,
    get_sensor_repository,
    get_system_config_repository
)
from utils.nltk.sensors import extract_sensors_from_message

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RULCalculationRequest(BaseModel):
    equipment_id: str = Field(..., description="Equipment/Component ID")
    sensor: str = Field(..., description="sensor name")


class EquipmentRULRequest(BaseModel):
    equipment_id: str = Field(..., description="Equipment ID for all sensors")


class RULResponse(BaseModel):
    P: float
    F: float
    confidence: List[float]
    remaining_life: List[float]
    Table: Dict[str, float]


class EquipmentRULResponse(BaseModel):
    results: Dict[str, float]


class SensorListResponse(BaseModel):
    sensors: List[str]


# ── Helpers ────────────────────────────────────────────────────────────────────

# Keywords that signal "give me every sensor" intent
_ALL_SENSORS_PATTERNS = re.compile(
    r'\b(all\s+sensors?|every\s+sensors?|all\s+available\s+sensors?|everything)\b',
    re.IGNORECASE
)


def _is_all_sensors_query(query: str) -> bool:
    """
    Returns True when the query explicitly asks for all sensors.

    Matches phrases like:
      "RUL for all sensors on GT 1"
      "calculate RUL for every sensor"
      "all available sensors on INS One"
      "calculate everything"
    """
    return bool(_ALL_SENSORS_PATTERNS.search(query))


def _normalise(s: str) -> str:
    """Lowercase + collapse all whitespace for fuzzy comparison."""
    return re.sub(r'\s+', '', s.lower())


def _case_insensitive_lookup(d: Dict[str, Any], key: str) -> Optional[Any]:
    """Dict lookup ignoring case."""
    key_lower = key.lower()
    for k, v in d.items():
        if k.lower() == key_lower:
            return v
    return None


def _fuzzy_dict_lookup(d: Dict[str, Any], key: str) -> Optional[Any]:
    """Dict lookup collapsing all whitespace — handles 'GT1' vs 'GT 1'."""
    key_norm = _normalise(key)
    for k, v in d.items():
        if _normalise(k) == key_norm:
            return v
    return None


def extract_sensor_nomenclature_pairs(
    query: str,
    sensor_dict: Dict[str, List[str]],
) -> Dict[str, List[str]]:
    """
    Extract sensor → nomenclature mappings from a natural language query.

    Uses a lookahead for " of " so that nomenclatures with spaces like "GT 1"
    are captured fully instead of stopping at the first space.

    Returns:
        {raw_nom_from_query: [sensor, ...]}
        Empty dict if no "SENSOR on NOM" pattern is found.
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

    clauses = re.split(r',\s*(?:and\s+)?|;\s*|\band\b', query, flags=re.IGNORECASE)
    pairings: Dict[str, List[str]] = {}

    for clause in clauses:
        found_sensors = sensor_pattern.findall(clause)
        if not found_sensors:
            continue

        nom_match = re.search(
            r'\bon\s+([\w][\w\s\-]*)(?=\s+of\s|\s*,|\s*;|\s*$)',
            clause, re.IGNORECASE
        )
        if not nom_match:
            continue

        raw_nom = nom_match.group(1).strip()
        raw_nom = re.sub(r'\s+of\s.*$', '', raw_nom, flags=re.IGNORECASE).strip()
        logger.debug(f"Parsed nom from clause '{clause.strip()}': '{raw_nom}'")

        for sensor in found_sensors:
            matched_sensor = next(
                (s for s in all_known_sensors if s.lower() == sensor.lower()),
                sensor
            )
            pairings.setdefault(raw_nom, [])
            if matched_sensor not in pairings[raw_nom]:
                pairings[raw_nom].append(matched_sensor)

    logger.info(f"Raw sensor_pairings from NLP: {pairings}")
    return pairings


def _get_sensors_for_nom(
    nom_name: str,
    orig_name: str,
    sensor_pairings: Dict[str, List[str]],
    fallback_sensors: Optional[List[str]]
) -> Optional[List[str]]:
    """
    Resolve which sensors to calculate for a given nomenclature.

    Lookup order (all fuzzy-aware):
      1. Exact nom_name
      2. Exact orig_name
      3. Case-insensitive nom_name
      4. Case-insensitive orig_name
      5. Whitespace-collapsed nom_name  ← "GT1" → "GT 1"
      6. Whitespace-collapsed orig_name
      7. fallback_sensors
    """
    if not sensor_pairings:
        return fallback_sensors

    return (
        sensor_pairings.get(nom_name)
        or sensor_pairings.get(orig_name)
        or _case_insensitive_lookup(sensor_pairings, nom_name)
        or _case_insensitive_lookup(sensor_pairings, orig_name)
        or _fuzzy_dict_lookup(sensor_pairings, nom_name)
        or _fuzzy_dict_lookup(sensor_pairings, orig_name)
        or fallback_sensors
    )


# ── Main Service ───────────────────────────────────────────────────────────────

class RULCalculationService:
    """Handles all RUL calculation logic"""

    CONFIDENCE_LEVELS = [0.8, 0.85, 0.9, 0.95]

    @staticmethod
    def group_sequential_data(
        data: List[tuple[float, float]]
    ) -> List[List[tuple[float, float]]]:
        if not data:
            return []
        result = []
        current_group = [data[0]]
        for item in data[1:]:
            if item[0] >= current_group[-1][0]:
                current_group.append(item)
            else:
                result.append(current_group)
                current_group = [item]
        result.append(current_group)
        return result

    @staticmethod
    def find_threshold_crossing_points(
        grouped_data: List[List[tuple[float, float]]], threshold: float
    ) -> List[float]:
        crossing_points = []
        for group in grouped_data:
            for operating_hours, value in group:
                if value >= threshold:
                    crossing_points.append(operating_hours)
                    break
        return crossing_points

    @staticmethod
    def estimate_weibull_sensors(failure_times: List[float]) -> tuple[float, float]:
        if len(failure_times) == 0:
            raise ValueError("No failure times available for Weibull estimation")
        params = weibull_min.fit(failure_times, floc=0)
        beta, eta = params[0], params[2]
        return round(beta, 2), round(eta, 2)

    @staticmethod
    def calculate_rul(eta: float, beta: float, t0: float, confidence: float) -> float:
        try:
            reliability = math.exp(-((t0 / eta) ** beta))
            rul = (eta * (-math.log(reliability * confidence)) ** (1 / beta)) - t0
            return max(0, rul)
        except (ValueError, ZeroDivisionError) as e:
            logger.error(f"RUL calculation error: {e}")
            return 0.0

    @classmethod
    def calculate_rul_for_all_confidence_levels(
        cls,
        eta: float,
        beta: float,
        tp: float,
        t0: float,
        vc: float,
        p: float,
        f: float,
    ) -> List[float]:
        results = []
        for confidence in cls.CONFIDENCE_LEVELS:
            if vc < p:
                rulp = cls.calculate_rul(eta, beta, tp, confidence)
                rulc = cls.calculate_rul(eta, beta, t0, confidence)
            else:
                m    = abs(f - vc) / (f - p)
                etac = eta * m
                rulp = cls.calculate_rul(etac, beta, tp, confidence)
                rulc = cls.calculate_rul(etac, beta, t0, confidence)
            results.append(round(min(rulc, rulp), 2))
        return results

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

        component_names: List[str] = []
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
        nomenclature_data: List[Dict[str, Any]]
    ) -> Dict[str, List[str]]:
        """
        For each resolved nomenclature, fetch ALL sensor names from the DB.

        Uses get_sensors_grouped_by_nomenclature() (already on the repo) in a
        single call, then filters down to only the nomenclatures we resolved.
        Nomenclatures with no sensors (e.g. BrahMos, SRGM 1) are silently
        skipped — they simply won't appear in the result dict.

        Returns:
            {nomenclature_name: [sensor1, sensor2, ...]}
            Only nomenclatures that actually have sensors are included.
        """
        metadata_repo = get_sensor_repository()

        # ONE call — fetch the complete nom → sensors map from the DB
        try:
            raw_nom_sensors = await metadata_repo.get_sensors_grouped_by_nomenclature()
        except Exception as e:
            logger.error(f"Failed to fetch sensors grouped by nomenclature: {e}")
            return {}

        # Normalise values: the repo may return SensorMetadata objects or plain
        # strings depending on the query — always convert to sensor_name strings.
        def _to_sensor_names(values) -> List[str]:
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
            return names

        all_nom_sensors: Dict[str, List[str]] = {
            nom: _to_sensor_names(sensors)
            for nom, sensors in (raw_nom_sensors or {}).items()
        }

        # Filter to only the nomenclatures we resolved, skip empties
        nom_sensors: Dict[str, List[str]] = {}

        for nom_info in nomenclature_data:
            nom_name = nom_info["nomenclature"]

            if nom_name in nom_sensors:
                # Same nom on multiple ships — don't add twice
                continue

            sensors = (
                all_nom_sensors.get(nom_name)
                or _case_insensitive_lookup(all_nom_sensors, nom_name)
                or _fuzzy_dict_lookup(all_nom_sensors, nom_name)
                or []
            )

            if sensors:
                nom_sensors[nom_name] = sensors
                logger.info(f"Sensors for '{nom_name}': {sensors}")
            else:
                # No sensors in DB for this nomenclature — silently skip
                logger.info(f"No sensors found for '{nom_name}' — skipping.")

        return nom_sensors

    @staticmethod
    async def _calculate_rul_for_single_sensor(
        nomenclature: str,
        component_id: UUID,
        ship: str,
        sensor_name: str
    ) -> Dict[str, Any]:
        metadata_repo = get_sensor_repository()
        reading_repo  = get_sensor_reading_repository()

        try:
            sensor_id = await metadata_repo.get_sensorid_by_name(
                component_id=component_id, sensor_name=sensor_name
            )
            if not sensor_id:
                return {
                    "status": "error", "nomenclature": nomenclature,
                    "ship": ship, "sensor": sensor_name,
                    "error": f"Sensor '{sensor_name}' not found on {nomenclature}"
                }

            pf_values = await metadata_repo.get_sensor_pf_by_id(sensor_id=sensor_id)
            if pf_values is None:
                return {
                    "status": "error", "nomenclature": nomenclature,
                    "ship": ship, "sensor": sensor_name,
                    "error": f"P and F values not found for sensor '{sensor_name}'"
                }

            p, f = pf_values
            logger.info(f"P={p}, F={f} for {sensor_name} on {nomenclature}")

            latest_readings = await reading_repo.get_latest_operating_values_readings(
                sensor_id=sensor_id, limit=2
            )
            if len(latest_readings) < 2:
                return {
                    "status": "error", "nomenclature": nomenclature,
                    "ship": ship, "sensor": sensor_name,
                    "error": "Insufficient data: need at least 2 readings"
                }

            print(f"RAW latest_readings: {latest_readings}")
            tp = latest_readings[-1][0]
            vc = latest_readings[-1][1]
            t0 = latest_readings[-2][0]
            print(f"Latest readings CORRECTED: vc={vc}, tp={tp}, t0={t0}")
            logger.info(f"Latest readings for {nomenclature}/{sensor_name} — vc={vc}, tp={tp}, t0={t0}")

            all_data = await reading_repo.get_latest_readings(sensor_id=sensor_id)
            if not all_data:
                return {
                    "status": "error", "nomenclature": nomenclature,
                    "ship": ship, "sensor": sensor_name,
                    "error": "No historical data found"
                }

            data_tuples     = [(r.operating_hours, r.value) for r in all_data]
            grouped_data    = RULCalculationService.group_sequential_data(data_tuples)
            crossing_points = RULCalculationService.find_threshold_crossing_points(grouped_data, f)

            if not crossing_points:
                return {
                    "status": "error", "nomenclature": nomenclature,
                    "ship": ship, "sensor": sensor_name,
                    "error": f"Threshold F={f} has never been reached in historical data"
                }

            logger.info(f"Found {len(crossing_points)} crossing points for {nomenclature}/{sensor_name}")

            beta, eta = RULCalculationService.estimate_weibull_sensors(crossing_points)
            logger.info(f"Weibull params — beta={beta}, eta={eta}")

            remaining_life = RULCalculationService.calculate_rul_for_all_confidence_levels(
                eta, beta, tp, t0, vc, p, f
            )

            return {
                "status": "success",
                "nomenclature": nomenclature,
                "ship": ship,
                "sensor": sensor_name,
                "sensor_id": str(sensor_id),
                "data": {
                    "P": p, "F": f,
                    "confidence":     RULCalculationService.CONFIDENCE_LEVELS,
                    "remaining_life": remaining_life,
                    "Table": {
                        "0.8":  remaining_life[0],
                        "0.85": remaining_life[1],
                        "0.9":  remaining_life[2],
                        "0.95": remaining_life[3],
                    },
                    "weibull_params":  {"beta": beta, "eta": eta},
                    "latest_readings": {"vc": vc, "tp": tp, "t0": t0}
                }
            }

        except Exception as e:
            logger.error(f"RUL calculation failed for {nomenclature}/{sensor_name}: {e}", exc_info=True)
            return {
                "status": "error", "nomenclature": nomenclature,
                "ship": ship, "sensor": sensor_name, "error": str(e)
            }

    @staticmethod
    async def _calculate_rul_batch(
        nomenclature_data: List[Dict[str, Any]],
        sensor_pairings: Dict[str, List[str]],
        fallback_sensors: Optional[List[str]] = None,
        all_sensors_map: Optional[Dict[str, List[str]]] = None,
    ) -> Tuple[Dict[str, Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Calculate RUL for all (nomenclature, ship, sensor) combos in parallel.

        Sensor resolution priority per nomenclature:
          1. all_sensors_map[nom]   — when "all sensors" was requested
          2. sensor_pairings        — specific sensors from query ("GTG_S4 on GT 1")
          3. fallback_sensors       — flat list from generic query ("RUL for S2 and S3")
        """
        errors: List[Dict[str, Any]] = []
        tasks:     List[Any] = []
        task_meta: List[Dict[str, str]] = []

        for nom_info in nomenclature_data:
            nom_name  = nom_info["nomenclature"]
            orig_name = nom_info["original_name"]
            ship      = nom_info["ship"]

            # ── Resolve sensors for this nomenclature ──────────────────────
            if all_sensors_map is not None:
                # "All sensors" path: use DB-fetched sensor list per nom
                sensors_for_this = (
                    all_sensors_map.get(nom_name)
                    or _fuzzy_dict_lookup(all_sensors_map, nom_name)
                    or []
                )
                if not sensors_for_this:
                    # This nomenclature simply has no sensors — not an error,
                    # just skip it silently (e.g. BrahMos, SRGM 1)
                    logger.info(f"'{nom_name}' has no sensors in DB — skipping.")
                    continue
            else:
                # Specific sensors path: pairing dict or flat fallback
                sensors_for_this = _get_sensors_for_nom(
                    nom_name=nom_name,
                    orig_name=orig_name,
                    sensor_pairings=sensor_pairings,
                    fallback_sensors=fallback_sensors
                )
                if not sensors_for_this:
                    errors.append({
                        "nomenclature": nom_name, "ship": ship,
                        "type": "no_sensors_mapped",
                        "message": (
                            f"No sensors mapped to '{nom_name}'. "
                            f"Pairing keys: {list(sensor_pairings.keys())}. "
                            f"Use 'SENSOR on {nom_name} of SHIP' or 'all sensors on {nom_name}'."
                        ),
                        "severity": "warning"
                    })
                    continue

            for sensor_name in sensors_for_this:
                tasks.append(
                    RULCalculationService._calculate_rul_for_single_sensor(
                        nomenclature=nom_name,
                        component_id=nom_info["component_id"],
                        ship=ship,
                        sensor_name=sensor_name
                    )
                )
                task_meta.append({"nomenclature": nom_name, "ship": ship, "sensor": sensor_name})

        results = await asyncio.gather(*tasks, return_exceptions=True)
        ship_grouped: Dict[str, Dict[str, Any]] = {}

        for result, meta in zip(results, task_meta):
            if isinstance(result, Exception):
                errors.append({
                    "nomenclature": meta["nomenclature"], "ship": meta["ship"],
                    "sensor": meta["sensor"], "type": "unexpected_error",
                    "message": str(result), "severity": "error"
                })
                continue

            if result["status"] == "error":
                errors.append({
                    "nomenclature": result["nomenclature"], "ship": result["ship"],
                    "sensor": result["sensor"], "type": "calculation_error",
                    "message": result["error"], "severity": "error"
                })
                continue

            s   = result["ship"]
            nom = result["nomenclature"]
            sen = result["sensor"]

            ship_grouped.setdefault(s, {})
            ship_grouped[s].setdefault(nom, {"nomenclature": nom, "ship": s, "sensors": {}})
            ship_grouped[s][nom]["sensors"][sen] = result["data"]

        return ship_grouped, errors

    @staticmethod
    async def rul(
        rul_query: str,
        name: Union[str, List[str]],
        ships: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Main orchestrator for RUL calculation.

        Supports three query modes (detected automatically):

        ┌─────────────────────────────────────────────────────────────────────┐
        │ Mode 1 — SPECIFIC SENSORS with pairing                              │
        │   "Calculate RUL for GTG_S4 on GT 1 of INS One"                    │
        │   → Only GTG_S4 is calculated for GT 1 on INS One                  │
        │                                                                     │
        │ Mode 2 — FLAT SENSOR LIST (no pairing)                              │
        │   "Calculate RUL for S2 and S3"                                     │
        │   → S2 and S3 tried against every resolved nomenclature             │
        │                                                                     │
        │ Mode 3 — ALL SENSORS                                                │
        │   "all sensors on GT 1"                                             │
        │   "all sensors on INS One"                                          │
        │   "calculate everything"                                            │
        │   → Every sensor in the DB for each resolved nomenclature           │
        └─────────────────────────────────────────────────────────────────────┘
        """
        metadata_repo = get_sensor_repository()

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

        # Fetch sensor dicts once
        sensor_dict_component    = await metadata_repo.get_sensors_grouped_by_component()
        sensor_dict_nomenclature = await metadata_repo.get_sensors_grouped_by_nomenclature()

        # Normalise: repo may return SensorMetadata objects instead of plain strings
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

        sensor_dict_component    = _normalise_sensor_dict(sensor_dict_component)
        sensor_dict_nomenclature = _normalise_sensor_dict(sensor_dict_nomenclature)
        combined_sensor_dict     = {**sensor_dict_component, **sensor_dict_nomenclature}

        # ── Detect query mode ─────────────────────────────────────────────────
        sensor_pairings:  Dict[str, List[str]] = {}
        fallback_sensors: Optional[List[str]]  = None
        is_all_sensors = _is_all_sensors_query(rul_query)

        if is_all_sensors:
            # Mode 3: "all sensors" — sensors fetched from DB after nom resolution
            logger.info("All-sensors mode detected.")
        else:
            # Mode 1: try paired extraction first
            sensor_pairings = extract_sensor_nomenclature_pairs(rul_query, combined_sensor_dict)

            if sensor_pairings:
                logger.info(f"Mode 1 — sensor pairings: {sensor_pairings}")
            else:
                # Mode 2: flat fallback
                logger.info("Mode 2 — falling back to flat sensor extraction.")
                fallback_sensors = extract_sensors_from_message(rul_query, combined_sensor_dict)

                if not fallback_sensors:
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            "No sensors found in query. Examples:\n"
                            "  • Specific: 'Calculate RUL for GTG_S4 on GT 1 of INS One'\n"
                            "  • All:      'Calculate RUL for all sensors on GT 1'"
                        )
                    )
                logger.info(f"Flat sensors: {fallback_sensors}")

        # ── Resolve names → nomenclatures ─────────────────────────────────────
        nomenclature_data, resolution_errors = await RULCalculationService._resolve_names_to_nomenclatures(
            names=name, ships=ships
        )

        if not nomenclature_data:
            raise HTTPException(
                status_code=404,
                detail={"message": "No valid nomenclatures found", "errors": resolution_errors}
            )

        # ── Mode 3: fetch all sensors from DB per nomenclature ────────────────
        all_sensors_map: Optional[Dict[str, List[str]]] = None
        if is_all_sensors:
            all_sensors_map = await RULCalculationService._fetch_all_sensors_for_nomenclatures(
                nomenclature_data
            )
            logger.info(f"All-sensors map: { {k: len(v) for k, v in all_sensors_map.items()} }")

        # ── Calculate RUL in parallel ─────────────────────────────────────────
        ship_grouped_data, calculation_errors = await RULCalculationService._calculate_rul_batch(
            nomenclature_data=nomenclature_data,
            sensor_pairings=sensor_pairings,
            fallback_sensors=fallback_sensors,
            all_sensors_map=all_sensors_map,
        )

        # ── Build response ────────────────────────────────────────────────────
        all_errors       = resolution_errors + calculation_errors
        successful_names = list(set(n["original_name"] for n in nomenclature_data))
        failed_names     = [e["name"] for e in resolution_errors if "name" in e]
        ships_returned   = list(ship_grouped_data.keys())

        if all_errors and not ship_grouped_data:
            status = "error"
        elif all_errors:
            status = "partial_success"
        else:
            status = "success"

        # Summarise which sensors were actually used
        if is_all_sensors:
            sensors_extracted = sorted(set(
                s
                for sensors in (all_sensors_map or {}).values()
                for s in sensors
            ))
        elif sensor_pairings:
            sensors_extracted = sorted(set(s for sensors in sensor_pairings.values() for s in sensors))
        else:
            sensors_extracted = fallback_sensors or []

        response: Dict[str, Any] = {
            "status": status,
            "data":   ship_grouped_data,
            "metadata": {
                "requested":         name,
                "successful":        successful_names,
                "failed":            failed_names,
                "ships_requested":   original_ships or "all",
                "ships_returned":    ships_returned,
                "rul_query":         rul_query,
                "query_mode": (
                    "all_sensors"  if is_all_sensors  else
                    "paired"       if sensor_pairings  else
                    "flat"
                ),
                "sensors_extracted": sensors_extracted,
                "sensor_pairings":   sensor_pairings or None,
            }
        }

        if all_errors:
            response["errors"] = all_errors

        if status == "error":
            raise HTTPException(
                status_code=404,
                detail={"message": "Failed to calculate RUL", "errors": all_errors}
            )

        return response