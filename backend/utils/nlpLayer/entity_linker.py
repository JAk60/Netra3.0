"""
nlpLayer/entity_linker.py
--------------------------
Stage 2A — Entity Linker.

Three in-memory catalogs built at startup from the live DB.
Three-tier resolution per mention (alias → fuzzy → embedding).
Catalog check per pair/triplet. Hard stop on first failed check.

Replaces ALL of:
    utils/nltk/component.py
    utils/nltk/ship.py
    utils/nltk/sensors.py
    ReliabilityFilter / RCMFilter filter/resolution logic
    extract_sensor_nomenclature_pairs (rul.py)
    extract_sensor_nomenclature_ship_pairings (sensors.py)

Fixes applied
-------------
FIX-2  _resolve_sensor      : Tier 0 added — structured sensor IDs
                              (LETTERS_S<digits>) resolve via direct catalog
                              lookup before any alias/fuzzy/embedding logic.
                              Avoids the embedding path entirely for well-formed
                              IDs and surfaces a clear SENSOR_NOT_FOUND error
                              instead of cascading into ship resolution.

FIX-3  _resolve_triplets    : REMOVED — the original guard raised
                              SENSOR_REQUIRED for any RUL query where
                              sensor="all", blocking legitimate "all sensors
                              on <ship>" queries. Replaced by FIX-AGG-SENSOR.

FIX-4  _catalog_check_triplet : Now receives the already-resolved ship entry and
                              compares sensor.ship_id against the *requested*
                              ship_id, not against the sensor's own ship record.
                              Prevents a sensor from a different ship passing
                              the check silently.

FIX-AGG-SENSOR _resolve_triplets : sensor="all" + component="all" now expands
                              to all sensors on the ship via the new
                              _resolve_all_sensors_for_ship() helper instead
                              of raising SENSOR_REQUIRED. The catalogue slice
                              built by Stage 0 guarantees the sensor list is
                              always available without an extra DB call.

FIX-RCM-ASSEMBLY             : Assembly suffix strip (Tier A) added to
                              _resolve_component. Handles user phrases like
                              "p1 assembly", "pump 1 unit", "valve block module"
                              where the trailing word is a type qualifier, not
                              part of the component name. Strips the suffix and
                              retries T1 + T3 before raising ENTITY_NOT_FOUND.

STAGE-0 additions
-----------------
get_catalogue_slice()       : Given a list of ship_ids (supplied by the
                              frontend via signal.matched_ships), returns a
                              scoped catalogue dict shaped for injection into
                              LLM prompts:
                                {
                                  ship_name: {
                                    "components": [nomenclature, ...],
                                    "assemblies": {
                                      parent_nom: [child_nom, ...]
                                    },
                                    "sensors":    [sensor_name, ...]
                                  }
                                }
                              Top-level components and assemblies are separated
                              so the LLM can see parent→child relationships for
                              RCM queries. Only components and sensors belonging
                              to the requested ships are included.

                              get_ship_names() and match_ships_in_query()
                              removed — ship matching is now done on the
                              frontend against the live fleet list.
"""

from __future__ import annotations

import logging
import re
from typing import Any, Dict, List, Optional, Tuple

from .aliases import (
    COMPONENT_TYPE_ALIASES,
    NOMENCLATURE_ALIASES,
    SENSOR_ALIASES,
    SHIP_ALIASES,
)
from .chat_logger import log_stage
from api.models.nlp.nlplayer import (
    CatalogEntry,
    ExtractionResult,
    GeneralResolvedContext,
    IntentSignal,
    PipelineError,
    PipelineStage,
    RawPair,
    RawTriplet,
    ResolvedEntities,
    ResolvedPair,
    ResolvedTriplet,
    SensorCatalogEntry,
)

logger = logging.getLogger(__name__)

# Tier 3 similarity threshold
_EMBEDDING_THRESHOLD = 0.85

# Intents resolved to pairs
_PAIR_INTENTS = {"RELIABILITY", "RCM"}

# Intents resolved to triplets
_TRIPLET_INTENTS = {"SENSOR", "RUL"}

# Keywords that mean "expand to all components/sensors on the ship"
_ALL_KEYWORDS = {"all", "every", "each", "allequipment", "allcomponents", "everything"}

_SEP_PATTERN = re.compile(r"[\s\-_]+")

# FIX-2 — structured sensor ID pattern used for Tier 0 direct lookup hint
_SENSOR_ID_RE = re.compile(r'^[A-Za-z]+_S\d+$')

# FIX-RCM-ASSEMBLY — trailing type-qualifier suffixes that are NOT part of the
# component name. Strip these before falling through to ENTITY_NOT_FOUND.
# Examples: "p1 assembly" → "p1", "pump 1 unit" → "pump 1", "valve block module" → "valve block"
_SUFFIX_RE = re.compile(
    r'\s*(assembly|assemblies|unit|block|module|sub[-\s]?assembly|system)\s*$',
    re.IGNORECASE,
)


def _normalise(text: str) -> str:
    """Lowercase and strip all separators for Tier 2 fuzzy matching."""
    return _SEP_PATTERN.sub("", text.lower())


class EntityLinker:
    """
    Resolves raw entity mentions to canonical DB IDs.

    Call build_catalogs() once at app startup (or after DB changes).
    Then call resolve() per request — it is stateless after catalog build.

    NOTE: instance_catalog maps norm_nomenclature → List[CatalogEntry]
    because the same nomenclature (e.g. 'GT 1') can exist on multiple ships
    with different component_ids. The correct entry is selected downstream
    by matching ship_id.
    """

    def __init__(self, embedding_model=None):
        """
        Args:
            embedding_model: Optional. Any object with an encode(texts: List[str]) method
                             returning numpy arrays. sentence-transformers compatible.
                             If None, Tier 3 is disabled (Tier 2 miss → error).
        """
        self._embedding_model = embedding_model

        # Catalogs populated by build_catalogs()
        self._instance_catalog: Dict[str, List[CatalogEntry]] = {}     # norm_nomenclature → [entries]
        self._type_catalog: Dict[str, List[CatalogEntry]] = {}         # norm_type_name → [entries]
        self._sensor_catalog: Dict[str, SensorCatalogEntry] = {}       # norm_sensor_name → entry
        self._ship_catalog: Dict[str, Dict[str, str]] = {}             # norm_ship_name → {ship_id, ship_name}

        # Embedding indexes (populated lazily if embedding_model provided)
        self._nomenclature_vectors: List[Tuple[str, Any]] = []         # [(norm_nomenclature, vector)]
        self._ship_vectors: List[Tuple[str, Any]] = []
        self._sensor_vectors: List[Tuple[str, Any]] = []

        self._catalogs_built = False

    # ------------------------------------------------------------------
    # Catalog construction — call once at startup
    # ------------------------------------------------------------------

    async def build_catalogs(self, system_repo, sensor_repo) -> None:
        """
        Build all three catalogs from the live DB.
        Args:
            system_repo: Your existing system config repository.
                         Must expose get_all_components() and get_all_sensors().
            sensor_repo: Must expose get_all_sensors().
        """
        logger.info("[EntityLinker] Building catalogs...")

        components = system_repo.get_all_components()   # list of dicts/objects
        sensors    = sensor_repo.get_all_sensors()      # list of dicts/objects

        instance_catalog: Dict[str, List[CatalogEntry]] = {}
        type_catalog: Dict[str, List[CatalogEntry]] = {}
        ship_catalog: Dict[str, Dict[str, str]] = {}

        for comp in components:
            entry = CatalogEntry(
                component_id=str(comp["component_id"]),
                component_name=comp["component_name"],
                nomenclature=comp["nomenclature"],
                ship_id=str(comp["ship_id"]),
                ship_name=comp["ship_name"],
                parent_id=str(comp["parent_id"]) if comp.get("parent_id") else None,
                is_assembly=bool(comp.get("parent_id")),
            )

            # instance catalog — accumulate into list (same nomenclature can exist on multiple ships)
            norm_nom = _normalise(entry.nomenclature)
            instance_catalog.setdefault(norm_nom, []).append(entry)

            # type catalog — accumulate by component type name
            norm_type = _normalise(entry.component_name)
            type_catalog.setdefault(norm_type, []).append(entry)

            # ship catalog — one entry per ship (safe to overwrite, ship data is identical)
            norm_ship = _normalise(entry.ship_name)
            ship_catalog[norm_ship] = {
                "ship_id": entry.ship_id,
                "ship_name": entry.ship_name,
            }

        sensor_catalog: Dict[str, SensorCatalogEntry] = {}
        for sen in sensors:
            s_entry = SensorCatalogEntry(
                sensor_id=str(sen["sensor_id"]),
                sensor_name=sen["sensor_name"],
                parent_component_id=str(sen["component_id"]),
                parent_nomenclature=sen["component_nomenclature"],
                ship_id=str(sen["ship_id"]),
                ship_name=sen["ship_name"],
            )
            norm_sen = _normalise(s_entry.sensor_name)
            sensor_catalog[norm_sen] = s_entry

        self._instance_catalog = instance_catalog
        self._type_catalog = type_catalog
        self._sensor_catalog = sensor_catalog
        self._ship_catalog = ship_catalog

        # Pre-build embedding index if model is available
        if self._embedding_model:
            self._build_embedding_index()

        self._catalogs_built = True
        logger.info(
            "[EntityLinker] Catalogs built — %d nomenclatures (%d total instances), "
            "%d types, %d sensors, %d ships",
            len(instance_catalog),
            sum(len(v) for v in instance_catalog.values()),
            len(type_catalog),
            len(sensor_catalog),
            len(ship_catalog),
        )

    async def rebuild_catalogs(self) -> None:
        """
        Re-build all catalogs from the live DB.

        Opens its own DB session so callers (e.g. FastAPI BackgroundTasks)
        do not need to supply repos. Safe to call while the server is
        running — the old catalogs remain available until the new ones are
        fully built, then they are swapped in atomically (Python GIL
        guarantees dict assignment is atomic).
        """
        from api.db.connection import get_session_context
        from api.db.repos.system.sys_config import SystemConfigurationRepository
        from api.db.repos.sensor.metadata import SensorRepository

        logger.info("[EntityLinker] Rebuilding catalogs (live refresh)...")
        with get_session_context() as session:
            system_repo = SystemConfigurationRepository(session)
            sensor_repo = SensorRepository(session)
            await self.build_catalogs(system_repo, sensor_repo)
        logger.info("[EntityLinker] Catalog rebuild complete.")

    def _build_embedding_index(self) -> None:
        """Pre-compute embedding vectors for all catalog entries."""
        nom_texts    = list(self._instance_catalog.keys())
        ship_texts   = list(self._ship_catalog.keys())
        sensor_texts = list(self._sensor_catalog.keys())

        nom_vecs    = self._embedding_model.encode(nom_texts)
        ship_vecs   = self._embedding_model.encode(ship_texts)
        sensor_vecs = self._embedding_model.encode(sensor_texts)

        self._nomenclature_vectors = list(zip(nom_texts, nom_vecs))
        self._ship_vectors         = list(zip(ship_texts, ship_vecs))
        self._sensor_vectors       = list(zip(sensor_texts, sensor_vecs))

    # ------------------------------------------------------------------
    # ⭐ STAGE-0 — Ship matching and catalogue slice
    # ------------------------------------------------------------------

    def get_catalogue_slice(
        self, ship_ids: List[str]
    ) -> Dict[str, Any]:
        """
        Build a scoped catalogue dict for the given ship IDs.

        Top-level components and assemblies are separated so the LLM can
        see the parent→child relationship for RCM queries. Only components
        and sensors belonging to the requested ships are included.

        Args:
            ship_ids: List of ship_id strings to include.

        Returns:
            {
              "INS ONE": {
                "components": ["GT 1", "GT 2", "AC 1", ...],
                "assemblies": {
                  "GT 1": ["p1", "p2", "pump 2"],
                  "AC 1": ["valve block", "compressor"]
                },
                "sensors":    ["GT_S1", "GT_S2", "AC_S1", ...]
              },
              "INS TWO": { ... }
            }

        Notes:
            - components contains only top-level entries (parent_id IS NULL).
            - assemblies groups child entries by parent nomenclature.
            - If a ship_id is not found in the catalog, it is silently skipped.
        """
        if not self._catalogs_built:
            raise RuntimeError("EntityLinker.build_catalogs() must be called first.")

        ship_id_set = set(ship_ids)

        # Build ship_id → ship_name lookup from ship catalog
        ship_id_to_name: Dict[str, str] = {
            entry["ship_id"]: entry["ship_name"]
            for entry in self._ship_catalog.values()
            if entry["ship_id"] in ship_id_set
        }

        # Initialise result structure
        slice_: Dict[str, Any] = {
            ship_name: {
                "components": set(),
                "assemblies": {},   # parent_nom → set of child_noms
                "sensors": set(),
            }
            for ship_name in ship_id_to_name.values()
        }

        # Populate components — split top-level vs assemblies
        for entry_list in self._instance_catalog.values():
            for entry in entry_list:
                if entry.ship_id not in ship_id_set:
                    continue
                ship_name = ship_id_to_name[entry.ship_id]
                if not entry.is_assembly:
                    # Top-level component
                    slice_[ship_name]["components"].add(entry.nomenclature)
                else:
                    # Assembly — group under parent nomenclature
                    parent_nom = self._get_parent_nomenclature(entry.parent_id)
                    if parent_nom:
                        assemblies = slice_[ship_name]["assemblies"]
                        assemblies.setdefault(parent_nom, set()).add(entry.nomenclature)

        # Populate sensors
        for sensor_entry in self._sensor_catalog.values():
            if sensor_entry.ship_id in ship_id_set:
                ship_name = ship_id_to_name[sensor_entry.ship_id]
                slice_[ship_name]["sensors"].add(sensor_entry.sensor_name)

        # Convert sets to sorted lists for stable, readable prompt output
        result: Dict[str, Any] = {}
        for ship_name, data in slice_.items():
            ship_result: Dict[str, Any] = {
                "components": sorted(data["components"]),
                "sensors":    sorted(data["sensors"]),
            }
            # Only include assemblies key if there are any assemblies
            if data["assemblies"]:
                ship_result["assemblies"] = {
                    parent: sorted(children)
                    for parent, children in sorted(data["assemblies"].items())
                }
            result[ship_name] = ship_result

        log_stage(
            "STAGE-0",
            f"catalogue slice built for {list(result.keys())} — "
            + ", ".join(
                f"{s}: {len(d['components'])} components, "
                f"{len(d.get('assemblies', {}))} assembly parents, "
                f"{len(d['sensors'])} sensors"
                for s, d in result.items()
            )
        )

        return result

    def _get_parent_nomenclature(self, parent_id: Optional[str]) -> Optional[str]:
        """
        Look up the nomenclature of a parent component by its component_id.

        Used during catalogue slice construction to group assemblies under
        their parent's display name.
        """
        if not parent_id:
            return None
        for entry_list in self._instance_catalog.values():
            for entry in entry_list:
                if entry.component_id == parent_id:
                    return entry.nomenclature
        return None

    # ------------------------------------------------------------------
    # Main resolution entry point
    # ------------------------------------------------------------------

    async def resolve(
        self, extraction: ExtractionResult, signal: IntentSignal
    ) -> ResolvedEntities:
        """
        Resolve raw mentions from the LLM extractor to real DB IDs.

        Returns ResolvedEntities on success.
        Raises PipelineError on first failed resolution or catalog check.
        """
        if not self._catalogs_built:
            raise RuntimeError("EntityLinker.build_catalogs() must be called before resolve().")

        intent = signal.intent

        if intent in _PAIR_INTENTS:
            pairs = await self._resolve_pairs(extraction.pairs, intent)
            return ResolvedEntities(
                intent=intent,
                pairs=pairs,
                has_negation=signal.has_negation,
            )

        if intent in _TRIPLET_INTENTS:
            triplets = await self._resolve_triplets(extraction.triplets, intent)
            return ResolvedEntities(
                intent=intent,
                triplets=triplets,
                has_negation=signal.has_negation,
            )

        # GENERAL — no entity resolution needed
        return ResolvedEntities(intent=intent)

    # ------------------------------------------------------------------
    # Pair resolution (RELIABILITY / RCM)
    # ------------------------------------------------------------------

    async def _resolve_pairs(
        self, raw_pairs: List[RawPair], intent: str
    ) -> List[ResolvedPair]:
        resolved: List[ResolvedPair] = []

        for raw in raw_pairs:
            norm_comp = _normalise(raw.component)
            # Resolve ship early so it can be used for filtering in all paths
            ship_entry = self._resolve_ship(raw.ship)

            # Path 1 — pure aggregate: "all", "every", etc.
            if norm_comp in _ALL_KEYWORDS:
                component_entries = self._resolve_all_components_for_ship(raw.ship)
                for entry in component_entries:
                    resolved.append(ResolvedPair(
                        component_id=entry.component_id,
                        nomenclature=entry.nomenclature,
                        ship_id=ship_entry["ship_id"],
                        ship_name=ship_entry["ship_name"],
                        is_assembly=entry.is_assembly,
                        confidence=1.0,
                    ))
                log_stage(
                    "LINKER CHK",
                    f"all → {len(component_entries)} components on {ship_entry['ship_name']} → PASS"
                )
                continue

            # Path 2 — normal resolution (Instance-first) [FIXED]
            # We attempt to resolve as a specific component nomenclature first.
            # _resolve_component prioritises nomenclatures/aliases over type aliases.
            # This prevents specific IDs like 'gtg1' from being shadowed by broad types.
            try:
                # We only want to resolve and 'continue' if it's a specific instance match.
                # If it's a category/type (like 'gtg'), we let Path 3 handle it for group logging.
                is_instance = (
                    norm_comp in self._instance_catalog or 
                    norm_comp in NOMENCLATURE_ALIASES
                )

                if is_instance:
                    component_entries = self._resolve_component(raw.component)
                    matched = [e for e in component_entries if e.ship_id == ship_entry["ship_id"]]

                    if not matched:
                        raise PipelineError(
                            stage=PipelineStage.LINKER,
                            code="PAIR_INVALID",
                            message=f"'{raw.component}' is not on '{ship_entry['ship_name']}'.",
                            entity=raw.component,
                        )

                    for entry in matched:
                        resolved.append(ResolvedPair(
                            component_id=entry.component_id,
                            nomenclature=entry.nomenclature,
                            ship_id=ship_entry["ship_id"],
                            ship_name=ship_entry["ship_name"],
                            is_assembly=entry.is_assembly,
                            confidence=1.0,
                        ))
                        log_stage(
                            "LINKER CHK",
                            f"{entry.nomenclature} ({entry.component_id}) + "
                            f"{ship_entry['ship_name']} → PASS "
                            f"({'assembly' if entry.is_assembly else 'component'})"
                        )
                    continue
            except PipelineError as e:
                # If resolution failed but we were sure it was an instance, re-raise.
                # Otherwise fall through to type aggregates.
                if is_instance:
                    raise e

            # Path 3 — type aggregate (e.g. "gtg", "ac", "assembly")
            # This handles broad expansion for component types.
            if norm_comp in {"assembly", "assemblies"}:
                assembly_entries = self._resolve_all_assemblies_for_ship(ship_entry)
                if not assembly_entries:
                    raise PipelineError(
                        stage=PipelineStage.LINKER,
                        code="PAIR_INVALID",
                        message=f"No assembly-type components found on '{ship_entry['ship_name']}'.",
                        entity=raw.component,
                    )
                for entry in assembly_entries:
                    resolved.append(ResolvedPair(
                        component_id=entry.component_id,
                        nomenclature=entry.nomenclature,
                        ship_id=ship_entry["ship_id"],
                        ship_name=ship_entry["ship_name"],
                        is_assembly=True,
                        confidence=1.0,
                    ))
                log_stage("LINKER CHK", f"assembly type → {len(assembly_entries)} assemblies on {ship_entry['ship_name']} → PASS")
                continue

            norm_type_direct = norm_comp
            norm_type_alias  = _normalise(COMPONENT_TYPE_ALIASES.get(norm_comp, ""))
            type_entries = (
                self._type_catalog.get(norm_type_direct)
                or self._type_catalog.get(norm_type_alias)
            )

            if type_entries:
                ship_type_entries = [e for e in type_entries if e.ship_id == ship_entry["ship_id"]]
                if not ship_type_entries:
                    raise PipelineError(
                        stage=PipelineStage.LINKER,
                        code="PAIR_INVALID",
                        message=f"No '{raw.component}' components found on '{ship_entry['ship_name']}'.",
                        entity=raw.component,
                    )
                for entry in ship_type_entries:
                    resolved.append(ResolvedPair(
                        component_id=entry.component_id,
                        nomenclature=entry.nomenclature,
                        ship_id=ship_entry["ship_id"],
                        ship_name=ship_entry["ship_name"],
                        is_assembly=entry.is_assembly,
                        confidence=1.0,
                    ))
                log_stage("LINKER CHK", f"type '{raw.component}' → {len(ship_type_entries)} instances on {ship_entry['ship_name']} → PASS")
                continue

            # Path 4 — Fallback for fuzzy / embedding / assembly suffix stripping
            component_entries = self._resolve_component(raw.component)
            matched = [e for e in component_entries if e.ship_id == ship_entry["ship_id"]]
            if not matched:
                raise PipelineError(stage=PipelineStage.LINKER, code="PAIR_INVALID", message="...", entity=raw.component)

            for entry in matched:
                resolved.append(ResolvedPair(
                    component_id=entry.component_id,
                    nomenclature=entry.nomenclature,
                    ship_id=ship_entry["ship_id"],
                    ship_name=ship_entry["ship_name"],
                    is_assembly=entry.is_assembly,
                    confidence=1.0,
                ))
                log_stage("LINKER CHK", f"{entry.nomenclature} + {ship_entry['ship_name']} → PASS")

        return resolved
    # ------------------------------------------------------------------
    # Triplet resolution (RUL / SENSOR)
    # ------------------------------------------------------------------

    async def _resolve_triplets(
        self, raw_triplets: List[RawTriplet], intent: str
    ) -> List[ResolvedTriplet]:
        resolved: List[ResolvedTriplet] = []

        for raw in raw_triplets:

            ship_entry = self._resolve_ship(raw.ship)

            sensor_val    = _normalise(raw.sensor or "all")
            sensor_is_all = sensor_val in _ALL_KEYWORDS
            comp_is_all   = _normalise(raw.component or "all") in _ALL_KEYWORDS

            # Resolve sensor(s)
            if not sensor_is_all:
                # Explicit sensor ID — resolve directly
                sensor_entries = self._resolve_sensor(raw.sensor)
            elif comp_is_all:
                # "all sensors on <ship>" — expand across every sensor on the ship.
                # FIX-AGG-SENSOR: replaces the old FIX-3 hard error for RUL.
                sensor_entries = self._resolve_all_sensors_for_ship(raw.ship)
            else:
                # "all sensors for <component> on <ship>"
                sensor_entries = self._resolve_all_sensors_for_component(
                    raw.component, raw.ship
                )

            for sen in sensor_entries:
                # FIX-4 — catalog check validates against the *requested* ship
                self._catalog_check_triplet(sen, raw.sensor or "all", raw.component, ship_entry)

                norm_parent    = _normalise(sen.parent_nomenclature)
                parent_entries = self._instance_catalog.get(norm_parent, [])

                comp_entry = next(
                    (e for e in parent_entries if e.ship_id == ship_entry["ship_id"]),
                    None,
                )
                if not comp_entry:
                    raise PipelineError(
                        stage=PipelineStage.LINKER,
                        code="COMPONENT_NOT_FOUND",
                        message=(
                            f"Component '{sen.parent_nomenclature}' not found "
                            f"on '{ship_entry['ship_name']}'."
                        ),
                        entity=sen.parent_nomenclature,
                    )

                resolved.append(ResolvedTriplet(
                    sensor_id=sen.sensor_id,
                    sensor_name=sen.sensor_name,
                    component_id=comp_entry.component_id,
                    nomenclature=comp_entry.nomenclature,
                    ship_id=ship_entry["ship_id"],
                    ship_name=ship_entry["ship_name"],
                    confidence=1.0,
                ))
                log_stage(
                    "LINKER CHK",
                    f"{sen.sensor_name} → {comp_entry.nomenclature} ({comp_entry.component_id}) "
                    f"+ {ship_entry['ship_name']} → PASS",
                )

        return resolved

    # ------------------------------------------------------------------
    # Resolve component — returns list (multiple ships or type expansion)
    # ------------------------------------------------------------------

    def _resolve_component(self, raw: str) -> List[CatalogEntry]:
        """
        Resolve a raw component mention.

        Returns a list of CatalogEntry objects. Multiple entries are returned when:
        - The same nomenclature exists on more than one ship (e.g. 'GT 1' on INS ONE and INS TWO)
        - A type mention expands to all instances of that type

        The caller is responsible for filtering by ship_id.

        Resolution tiers:
            T1  — alias + direct nomenclature + component type alias lookup
            T2  — normalised fuzzy (separator-stripped exact match)
            T3  — embedding similarity (if model available)
            TA  — assembly suffix strip + T1/T3 retry  [FIX-RCM-ASSEMBLY]
        """
        norm = _normalise(raw)

        # Tier 1 — nomenclature alias
        if norm in NOMENCLATURE_ALIASES:
            canonical = _normalise(NOMENCLATURE_ALIASES[norm])
            if canonical in self._instance_catalog:
                entries = self._instance_catalog[canonical]
                log_stage("LINKER T1", f"'{raw}' → nom alias → {entries[0].nomenclature} ({len(entries)} entries)")
                return entries

        # Tier 1 — direct nomenclature lookup
        if norm in self._instance_catalog:
            entries = self._instance_catalog[norm]
            log_stage("LINKER T1", f"'{raw}' → direct nom → {entries[0].nomenclature} ({len(entries)} entries)")
            return entries

        # Tier 1 — component type alias
        if norm in COMPONENT_TYPE_ALIASES:
            type_name = _normalise(COMPONENT_TYPE_ALIASES[norm])
            if type_name in self._type_catalog:
                entries = self._type_catalog[type_name]
                log_stage("LINKER T1", f"'{raw}' → type alias → {COMPONENT_TYPE_ALIASES[norm]} ({len(entries)} instances)")
                return entries

        # Tier 2 — normalised fuzzy match on nomenclatures
        for catalog_norm, entries in self._instance_catalog.items():
            if catalog_norm == norm:
                log_stage("LINKER T2", f"'{raw}' → fuzzy nom → {entries[0].nomenclature} ({len(entries)} entries)")
                return entries

        # Tier 2 — normalised fuzzy match on types
        for type_norm, entries in self._type_catalog.items():
            if type_norm == norm:
                log_stage("LINKER T2", f"'{raw}' → fuzzy type → {entries[0].component_name} ({len(entries)} instances)")
                return entries

        # Tier 3 — embedding similarity
        if self._embedding_model and self._nomenclature_vectors:
            match = self._embedding_match(norm, self._nomenclature_vectors)
            if match:
                entries = self._instance_catalog[match]
                log_stage("LINKER T3", f"'{raw}' → embedding → {entries[0].nomenclature} ({len(entries)} entries)")
                return entries

        # Tier A — FIX-RCM-ASSEMBLY
        # Strip trailing type-qualifier suffixes and retry resolution.
        # Handles: "p1 assembly" → "p1", "pump 1 unit" → "pump 1",
        #          "valve block module" → "valve block"
        stripped = _SUFFIX_RE.sub("", raw).strip()
        stripped_norm = _normalise(stripped)
        if stripped_norm and stripped_norm != norm:
            log_stage("LINKER TA", f"'{raw}' → suffix strip → '{stripped}'")

            # TA T1 — direct nomenclature on stripped name
            if stripped_norm in self._instance_catalog:
                entries = self._instance_catalog[stripped_norm]
                log_stage("LINKER TA", f"'{raw}' → suffix strip + direct nom → {entries[0].nomenclature} ({len(entries)} entries)")
                return entries

            # TA T1 — type alias on stripped name
            if stripped_norm in COMPONENT_TYPE_ALIASES:
                type_name = _normalise(COMPONENT_TYPE_ALIASES[stripped_norm])
                if type_name in self._type_catalog:
                    entries = self._type_catalog[type_name]
                    log_stage("LINKER TA", f"'{raw}' → suffix strip + type alias → {COMPONENT_TYPE_ALIASES[stripped_norm]} ({len(entries)} instances)")
                    return entries

            # TA T3 — embedding on stripped name
            if self._embedding_model and self._nomenclature_vectors:
                match = self._embedding_match(stripped_norm, self._nomenclature_vectors)
                if match:
                    entries = self._instance_catalog[match]
                    log_stage("LINKER TA+T3", f"'{raw}' → suffix strip + embedding → {entries[0].nomenclature} ({len(entries)} entries)")
                    return entries

        raise PipelineError(
            stage=PipelineStage.LINKER,
            code="ENTITY_NOT_FOUND",
            message=f"Could not resolve '{raw}' to any known component or equipment type.",
            entity=raw,
        )

    def _resolve_all_components_for_ship(self, raw_ship: str) -> List[CatalogEntry]:
        """Return every component instance registered on a given ship."""
        ship_entry = self._resolve_ship(raw_ship)
        entries = [
            e
            for entry_list in self._instance_catalog.values()
            for e in entry_list
            if e.ship_id == ship_entry["ship_id"]
        ]
        if not entries:
            raise PipelineError(
                stage=PipelineStage.LINKER,
                code="ENTITY_NOT_FOUND",
                message=f"No components found on '{ship_entry['ship_name']}'.",
                entity=raw_ship,
            )
        log_stage(
            "LINKER",
            f"all components on {ship_entry['ship_name']} → {len(entries)} found"
        )
        return entries

    def _resolve_all_assemblies_for_ship(
        self, ship_entry: Dict[str, str]
    ) -> List[CatalogEntry]:
        """
        Return every assembly-type component on the given ship.

        An assembly is any CatalogEntry where is_assembly=True (parent_id IS NOT NULL).
        Used when the query asks for "all assemblies on <ship>" without scoping
        to a specific parent component.
        """
        entries = [
            e
            for entry_list in self._instance_catalog.values()
            for e in entry_list
            if e.ship_id == ship_entry["ship_id"] and e.is_assembly
        ]
        log_stage(
            "LINKER",
            f"all assemblies on {ship_entry['ship_name']} → {len(entries)} found"
        )
        return entries

    def _resolve_all_sensors_for_component(
        self, raw_component: str, raw_ship: str
    ) -> List[SensorCatalogEntry]:
        """Return all sensors for a given component on a given ship."""
        entries  = self._resolve_component(raw_component)
        ship     = self._resolve_ship(raw_ship)
        comp_ids = {e.component_id for e in entries if e.ship_id == ship["ship_id"]}

        sensors = [
            s for s in self._sensor_catalog.values()
            if s.parent_component_id in comp_ids and s.ship_id == ship["ship_id"]
        ]
        if not sensors:
            raise PipelineError(
                stage=PipelineStage.LINKER,
                code="SENSOR_NOT_FOUND",
                message=f"No sensors found for '{raw_component}' on '{raw_ship}'.",
                entity=raw_component,
            )
        log_stage("LINKER", f"all sensors for {raw_component} on {raw_ship} → {len(sensors)} found")
        return sensors

    def _resolve_all_sensors_for_ship(
        self, raw_ship: str
    ) -> List[SensorCatalogEntry]:
        """
        Return every sensor registered on the given ship, regardless of
        which component each sensor belongs to.
        """
        ship = self._resolve_ship(raw_ship)
        sensors = [
            s for s in self._sensor_catalog.values()
            if s.ship_id == ship["ship_id"]
        ]
        if not sensors:
            raise PipelineError(
                stage=PipelineStage.LINKER,
                code="SENSOR_NOT_FOUND",
                message=f"No sensors found on '{ship['ship_name']}'.",
                entity=raw_ship,
            )
        log_stage(
            "LINKER",
            f"all sensors on {ship['ship_name']} → {len(sensors)} found"
        )
        return sensors

    # ------------------------------------------------------------------
    # Resolve ship
    # ------------------------------------------------------------------

    def _resolve_ship(self, raw: str) -> Dict[str, str]:
        """Resolve a raw ship mention. Returns {ship_id, ship_name}."""
        norm = _normalise(raw)

        # Tier 1 — ship alias
        if norm in SHIP_ALIASES:
            canonical = _normalise(SHIP_ALIASES[norm])
            if canonical in self._ship_catalog:
                entry = self._ship_catalog[canonical]
                log_stage("LINKER T1", f"'{raw}' → ship alias → {entry['ship_name']} ({entry['ship_id']})")
                return entry

        # Tier 1 — direct ship catalog lookup
        if norm in self._ship_catalog:
            entry = self._ship_catalog[norm]
            log_stage("LINKER T1", f"'{raw}' → direct ship → {entry['ship_name']}")
            return entry

        # Tier 2 — normalised fuzzy
        for catalog_norm, entry in self._ship_catalog.items():
            if catalog_norm == norm:
                log_stage("LINKER T2", f"'{raw}' → fuzzy ship → {entry['ship_name']}")
                return entry

        # Tier 3 — embedding
        if self._embedding_model and self._ship_vectors:
            match = self._embedding_match(norm, self._ship_vectors)
            if match:
                entry = self._ship_catalog[match]
                log_stage("LINKER T3", f"'{raw}' → embedding → {entry['ship_name']}")
                return entry

        raise PipelineError(
            stage=PipelineStage.LINKER,
            code="ENTITY_NOT_FOUND",
            message=f"Could not resolve '{raw}' to any known ship.",
            entity=raw,
        )

    # ------------------------------------------------------------------
    # Resolve sensor
    # ------------------------------------------------------------------

    def _resolve_sensor(self, raw: str) -> List[SensorCatalogEntry]:
        """
        Resolve a raw sensor mention. Returns a list (almost always one).

        FIX-2 — Tier 0 added for structured sensor IDs.
        """
        norm = _normalise(raw)

        # FIX-2 — Tier 0: structured sensor ID direct lookup
        if _SENSOR_ID_RE.match(raw):
            if norm in self._sensor_catalog:
                entry = self._sensor_catalog[norm]
                log_stage("LINKER T0", f"'{raw}' → structured ID direct → {entry.sensor_name} ({entry.sensor_id})")
                return [entry]
            raise PipelineError(
                stage=PipelineStage.LINKER,
                code="SENSOR_NOT_FOUND",
                message=(
                    f"Sensor '{raw}' was not found in the catalog. "
                    f"Please check the sensor ID."
                ),
                entity=raw,
            )

        # Tier 1 — sensor alias
        if norm in SENSOR_ALIASES:
            canonical = _normalise(SENSOR_ALIASES[norm])
            if canonical in self._sensor_catalog:
                entry = self._sensor_catalog[canonical]
                log_stage("LINKER T1", f"'{raw}' → sensor alias → {entry.sensor_name} ({entry.sensor_id})")
                return [entry]

        # Tier 1 — direct sensor catalog
        if norm in self._sensor_catalog:
            entry = self._sensor_catalog[norm]
            log_stage("LINKER T1", f"'{raw}' → direct sensor → {entry.sensor_name}")
            return [entry]

        # Tier 2 — normalised fuzzy
        for catalog_norm, entry in self._sensor_catalog.items():
            if catalog_norm == norm:
                log_stage("LINKER T2", f"'{raw}' → fuzzy sensor → {entry.sensor_name}")
                return [entry]

        # Tier 3 — embedding
        if self._embedding_model and self._sensor_vectors:
            match = self._embedding_match(norm, self._sensor_vectors)
            if match:
                entry = self._sensor_catalog[match]
                log_stage("LINKER T3", f"'{raw}' → embedding → {entry.sensor_name}")
                return [entry]

        raise PipelineError(
            stage=PipelineStage.LINKER,
            code="SENSOR_NOT_FOUND",
            message=f"Could not resolve '{raw}' to any known sensor.",
            entity=raw,
        )
    
    async def resolve_for_general(
        self,
        extraction: ExtractionResult,
        matched_ships: List[Dict[str, str]],
    ) -> "GeneralResolvedContext":
        """
        Unlike resolve(), this never raises on a miss — it returns whatever
        it can find and leaves unknowns as empty lists. The SQL tool
        downstream handles partial resolution gracefully.

        Uses extraction.scope to decide how aggressively to expand:
        fleet     — no ship filtering, return empty components/sensors
        ship      — resolve ships only
        component — resolve ships + attempt component resolution
        sensor    — resolve ships + attempt sensor resolution
        """
        scope = extraction.scope or "fleet"

        # Resolve ships — use frontend-matched records first, fall back to extractor
        ships = []
        source_ships = matched_ships or []
        if not source_ships and extraction.raw_ships:
            # Soft attempt — don't raise, just skip misses
            for raw in extraction.raw_ships:
                try:
                    entry = self._resolve_ship(raw)
                    source_ships.append({"ship_id": entry["ship_id"], "ship_name": entry["ship_name"]})
                except PipelineError:
                    log_stage("LINKER-G", f"ship '{raw}' → no match (soft skip)")
        ships = source_ships

        # Resolve components — soft, scope permitting
        components = []
        if scope in {"component", "sensor"} and extraction.raw_components:
            for raw in extraction.raw_components:
                try:
                    entries = self._resolve_component(raw)
                    # Filter to matched ships if we have them
                    ship_ids = {s["ship_id"] for s in ships}
                    if ship_ids:
                        entries = [e for e in entries if e.ship_id in ship_ids]
                    components.extend(entries)
                except PipelineError:
                    log_stage("LINKER-G", f"component '{raw}' → no match (soft skip)")

        # Resolve sensors — soft
        sensors = []
        if scope == "sensor" and extraction.raw_sensors:
            for raw in extraction.raw_sensors:
                try:
                    entries = self._resolve_sensor(raw)
                    sensors.extend(entries)
                except PipelineError:
                    log_stage("LINKER-G", f"sensor '{raw}' → no match (soft skip)")

        log_stage(
            "LINKER-G",
            f"scope={scope} ships={len(ships)} "
            f"components={len(components)} sensors={len(sensors)}"
        )

        return GeneralResolvedContext(
            ships=ships,
            components=components,
            sensors=sensors,
            topic_hint=extraction.topic_hint,
            scope=scope,
        )

    # ------------------------------------------------------------------
    # Catalog checks
    # ------------------------------------------------------------------

    def _catalog_check_triplet(
        self,
        sensor_entry: SensorCatalogEntry,
        raw_sensor: str,
        raw_component: str,
        resolved_ship: Dict[str, str],   # FIX-4: accept already-resolved ship
    ) -> None:
        """
        Verify the sensor belongs to the requested ship.

        FIX-4: The original implementation resolved the ship from the
        sensor's own ship_name, which meant it was always checking the sensor
        against itself — a ship mismatch could never be detected.
        """
        if sensor_entry.ship_id != resolved_ship["ship_id"]:
            raise PipelineError(
                stage=PipelineStage.LINKER,
                code="SENSOR_SHIP_MISMATCH",
                message=(
                    f"Sensor '{sensor_entry.sensor_name}' belongs to "
                    f"'{sensor_entry.ship_name}', not '{resolved_ship['ship_name']}'. "
                    f"Please check the ship name."
                ),
                entity=raw_sensor,
            )

    # ------------------------------------------------------------------
    # Tier 3 — embedding similarity
    # ------------------------------------------------------------------

    def _embedding_match(
        self,
        norm_query: str,
        index: List[Tuple[str, Any]],
    ) -> Optional[str]:
        """
        Find the best matching catalog key via cosine similarity.
        Returns the catalog key string if score >= threshold, else None.
        """
        import numpy as np

        query_vec  = self._embedding_model.encode([norm_query])[0]
        best_score = -1.0
        best_key   = None

        for catalog_key, vec in index:
            score = float(np.dot(query_vec, vec) / (
                np.linalg.norm(query_vec) * np.linalg.norm(vec) + 1e-10
            ))
            if score > best_score:
                best_score = score
                best_key   = catalog_key

        if best_score >= _EMBEDDING_THRESHOLD:
            log_stage("LINKER T3", f"embedding score={best_score:.3f} → {best_key}")
            return best_key

        log_stage("LINKER T3", f"embedding best score={best_score:.3f} < {_EMBEDDING_THRESHOLD} → FAIL")
        return None