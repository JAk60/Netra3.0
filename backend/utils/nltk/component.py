from api.db.dependencies import get_system_config_repository
import nltk
import re
from typing import List, Optional
from nltk.tokenize import word_tokenize
from nltk.tag import pos_tag

# NLTK downloads - these will persist in your venv after first run
def ensure_nltk_data():
    """Download NLTK data if not already present (runs once in venv)"""
    required_data = [
        ('tokenizers/punkt', 'punkt'),
        ('taggers/averaged_perceptron_tagger', 'averaged_perceptron_tagger'),
        ('corpora/stopwords', 'stopwords'),
    ]
    for path, name in required_data:
        try:
            nltk.data.find(path)
        except LookupError:
            nltk.download(name)

ensure_nltk_data()

from nltk.corpus import stopwords
STOP_WORDS = set(stopwords.words('english'))


# ── Pre-processing: strip "all sensors / everything" noise ────────────────────
# These phrases add no component/nomenclature information and confuse the
# NLTK tagger + regex matchers.  Strip them BEFORE extraction so that:
#   "all sensors on GT 1 of INS One"  →  "GT 1 of INS One"
#   "calculate everything for GT 1"   →  "for GT 1"
#   "RUL for GTG_S4 on GT 1"          →  unchanged  (no noise match)
_ALL_SENSORS_NOISE = re.compile(
    r'\b(?:calculate\s+|show\s+|give\s+|provide\s+)?'
    r'(?:[a-zA-Z]+\s+for\s+)?'
    r'(?:all\s+available\s+sensors?|all\s+sensors?|every\s+sensors?|everything)'
    r'(?:\s+on\b)?',
    re.IGNORECASE
)

# Also strip leading filler words that can be left over after noise removal
_LEADING_FILLER = re.compile(r'^\s*(for|of|on|the|a|an)\s+', re.IGNORECASE)


def _preprocess_message_for_component_extraction(message: str) -> str:
    """
    Strip "all sensors / everything" noise so the component extractor can
    find the actual equipment name that follows.

    Examples:
        "all sensors on GT 1 of INS One"      → "GT 1 of INS One"
        "Calculate RUL for all sensors on GT 1" → "GT 1"
        "calculate everything for GT 1"         → "GT 1"
        "all available sensors on AC 2"         → "AC 2"
        "Get RUL for GTG_S4 on GT 1"           → "Get RUL for GTG_S4 on GT 1"  (unchanged)
    """
    cleaned = _ALL_SENSORS_NOISE.sub('', message).strip()
    # Remove any leading filler left over (e.g. "for GT 1" → "GT 1")
    cleaned = _LEADING_FILLER.sub('', cleaned).strip()
    return cleaned if cleaned else message  # Never return empty — fall back to original


def normalize_text(text: str) -> str:
    """Normalize text by removing spaces and converting to lowercase"""
    return re.sub(r'\s+', '', text.lower())


def create_search_variants(component: str) -> List[str]:
    """Create different variants of a component name for matching"""
    variants = []

    variants.append(component)
    variants.append(component.lower())

    no_space = re.sub(r'\s+', '', component)
    variants.append(no_space)
    variants.append(no_space.lower())

    variants.append(component.replace(' ', ''))
    variants.append(component.replace(' ', '_'))
    variants.append(component.replace(' ', '-'))
    variants.append(component.replace(' ', '').lower())
    variants.append(component.replace(' ', '_').lower())
    variants.append(component.replace(' ', '-').lower())

    seen = set()
    unique_variants = []
    for variant in variants:
        if variant not in seen:
            seen.add(variant)
            unique_variants.append(variant)

    return unique_variants


def handle_collective_references(message: str, found_components: List[str], data_dict: dict) -> List[str]:
    """
    Handle collective references like 'all gas turbines', 'all equipment', etc.
    """
    message_lower = message.lower()

    if found_components:
        if re.search(r'\ball\b', message_lower):
            expanded_components = set()

            for component in found_components:
                if component in data_dict and data_dict[component]:
                    expanded_components.update(data_dict[component])
                else:
                    found_category = False
                    for category, handy_list in data_dict.items():
                        if component in handy_list:
                            expanded_components.update(handy_list)
                            found_category = True
                            break

                    if not found_category:
                        expanded_components.add(component)

            return list(expanded_components)

    collective_patterns = {
        r'\ball\s+(?:the\s+)?(gas\s*turbines?|gts?)\b': 'Gas Turbine',
        r'\ball\s+(?:the\s+)?(generators?|gtgs?)\b': 'Generator',
        r'\ball\s+(?:the\s+)?(air\s*conditioners?|acs?)\b': 'Air Conditioner',
        r'\ball\s+(?:the\s+)?(missiles?)\b': 'Missile',
        r'\ball\s+(?:the\s+)?(guns?|srgms?|super\s*rapid\s*gun\s*mounts?)\b': 'Super Rapid Gun Mount',
        r'\ball\s+(?:the\s+)?(equipment|components?|systems?|devices?|units?)\b': 'ALL'  # ← was missing (?:the\s+)?
    }

    pump_patterns = [r'\ball\s+(pumps?)\b']

    expanded_components = set()

    for pattern, category in collective_patterns.items():
        if re.search(pattern, message_lower):
            if category == 'ALL':
                for handy_list in data_dict.values():
                    if isinstance(handy_list, list):
                        expanded_components.update(handy_list)
            else:
                if category in data_dict and isinstance(data_dict[category], list):
                    expanded_components.update(data_dict[category])

    for pattern in pump_patterns:
        if re.search(pattern, message_lower):
            for key in data_dict.keys():
                if key.lower().startswith('pump'):
                    if isinstance(data_dict[key], list):
                        expanded_components.update(data_dict[key])

    return list(expanded_components) if expanded_components else found_components


def extract_components_from_message(
    message: str,
    data_dict: dict
) -> Optional[List[str]]:
    """
    Extract component names from natural language message.

    Enhanced to handle components without spaces and in lowercase.
    Now also handles collective references like 'all gas turbines'.
    Returns either standard names OR handy names, not mixed.

    Args:
        message:   Natural language message (already pre-processed by caller)
        data_dict: Dictionary where keys are standard names and values are lists of handy names

    Returns:
        List of matched component names (either all standard or all handy) or None
    """
    if not message.strip() or not data_dict:
        return None

    found_standard = set()
    found_handy    = set()
    message_lower      = message.lower()
    message_normalized = normalize_text(message)

    standard_names = list(data_dict.keys())
    handy_names: List[str] = []
    for handy_list in data_dict.values():
        if isinstance(handy_list, list):
            handy_names.extend(handy_list)

    # 1. ENHANCED EXACT MATCHING
    for component in standard_names:
        variants = create_search_variants(component)
        for variant in variants:
            if ' ' in variant or '_' in variant or '-' in variant:
                pattern = r'\b' + re.escape(variant.lower()) + r'\b'
                if re.search(pattern, message_lower):
                    found_standard.add(component)
                    break
            else:
                pattern = r'\b' + re.escape(variant.lower()) + r'\b'
                if re.search(pattern, message_lower):
                    found_standard.add(component)
                    break
                if variant.lower() in message_lower:
                    found_standard.add(component)
                    break
                if variant.lower() in message_normalized:
                    found_standard.add(component)
                    break

    for component in handy_names:
        variants = create_search_variants(component)
        for variant in variants:
            if ' ' in variant or '_' in variant or '-' in variant:
                pattern = r'\b' + re.escape(variant.lower()) + r'\b'
                if re.search(pattern, message_lower):
                    found_handy.add(component)
                    break
            else:
                pattern = r'\b' + re.escape(variant.lower()) + r'\b'
                if re.search(pattern, message_lower):
                    found_handy.add(component)
                    break
                if variant.lower() in message_lower:
                    found_handy.add(component)
                    break
                if variant.lower() in message_normalized:
                    found_handy.add(component)
                    break

    # 2. PATTERN-BASED MATCHING
    component_keywords = ['component', 'part', 'equipment', 'device', 'system', 'unit']

    for keyword in component_keywords:
        pattern = rf'\b{keyword}\s*([a-zA-Z0-9\-_\s]+?)(?:\s|$|,|\.|\?|/)'
        matches = re.finditer(pattern, message, re.IGNORECASE)

        for match in matches:
            potential_component = match.group(1).strip()

            for component in standard_names:
                variants = create_search_variants(component)
                for variant in variants:
                    if variant.lower() == potential_component.lower():
                        found_standard.add(component)
                        break

            for component in handy_names:
                variants = create_search_variants(component)
                for variant in variants:
                    if variant.lower() == potential_component.lower():
                        found_handy.add(component)
                        break

    # 3. NLTK-ENHANCED MATCHING
    if not found_standard and not found_handy:
        try:
            tokens   = word_tokenize(message)
            pos_tags = pos_tag(tokens)

            potential_sequences = []
            current_sequence    = []

            for token, pos in pos_tags:
                if (pos in ['NNP', 'NNPS', 'NN', 'NNS'] or
                        re.match(r'^[A-Za-z0-9\-_]+$', token)) and token.upper() not in STOP_WORDS:
                    current_sequence.append(token)
                else:
                    if current_sequence:
                        sequence_text = ' '.join(current_sequence)
                        if len(sequence_text) >= 1:
                            potential_sequences.append(sequence_text)
                        current_sequence = []

            if current_sequence:
                sequence_text = ' '.join(current_sequence)
                if len(sequence_text) >= 1:
                    potential_sequences.append(sequence_text)

            for sequence in potential_sequences:
                for component in standard_names:
                    variants = create_search_variants(component)
                    for variant in variants:
                        if variant.lower() == sequence.lower():
                            found_standard.add(component)
                            break

                if sequence not in [normalize_text(comp) for comp in found_standard]:
                    for component in handy_names:
                        variants = create_search_variants(component)
                        for variant in variants:
                            if variant.lower() == sequence.lower():
                                found_handy.add(component)
                                break

        except Exception:
            pass

    # 4. SLASH/COMMA-SEPARATED COMPONENTS
    separator_parts = re.split(r'[/,;]', message)
    for part in separator_parts:
        part = part.strip()

        for component in standard_names:
            variants = create_search_variants(component)
            for variant in variants:
                if ' ' in variant or '_' in variant or '-' in variant:
                    pattern = r'\b' + re.escape(variant.lower()) + r'\b'
                    if re.search(pattern, part.lower()):
                        found_standard.add(component)
                        break
                else:
                    if variant.lower() in part.lower() or variant.lower() in normalize_text(part):
                        found_standard.add(component)
                        break

        part_has_standard = any(
            any(var.lower() in part.lower() or var.lower() in normalize_text(part)
                for var in create_search_variants(comp))
            for comp in found_standard
        )

        if not part_has_standard:
            for component in handy_names:
                variants = create_search_variants(component)
                for variant in variants:
                    if ' ' in variant or '_' in variant or '-' in variant:
                        pattern = r'\b' + re.escape(variant.lower()) + r'\b'
                        if re.search(pattern, part.lower()):
                            found_handy.add(component)
                            break
                    else:
                        if variant.lower() in part.lower() or variant.lower() in normalize_text(part):
                            found_handy.add(component)
                            break

    # PRIORITY: standard names first, then handy names
    initial_components = None
    if found_standard:
        initial_components = list(found_standard)
    elif found_handy:
        initial_components = list(found_handy)

    if initial_components:
        final_components = handle_collective_references(message, initial_components, data_dict)
        return final_components if final_components else initial_components
    else:
        collective_components = handle_collective_references(message, [], data_dict)
        return collective_components if collective_components else None


async def extract_components(
    message: str,
    ships: List[str] = None,
    sys_repo=None
) -> Optional[List[str]]:
    """
    Extract component/nomenclature names from a natural language message.

    ── Key change ──────────────────────────────────────────────────────────────
    Before passing the message to the extractor, we strip "all sensors /
    everything" noise phrases so that queries like:

        "all sensors on GT 1 of INS One"   →  extractor sees "GT 1 of INS One"
        "calculate everything for GT 1"    →  extractor sees "GT 1"
        "RUL for GTG_S4 on GT 1"           →  extractor sees original (unchanged)

    This prevents the ValueError "No component or nomenclature found" that was
    raised when the user asked for all sensors on an equipment.
    ────────────────────────────────────────────────────────────────────────────

    Args:
        message:  Natural language message
        ships:    Optional list of ship names to filter components
        sys_repo: System config repository

    Returns:
        List of component/nomenclature names or None
    """
     # ✅ Proper lazy initialization
    if sys_repo is None:
        sys_repo = get_system_config_repository()
    data_dict = await sys_repo.get_components_with_nomenclatures_by_ships(ships)
    print("data_dict---->>>", data_dict)

    if data_dict is None:
        data_dict = {
            "Missile":             ["BrahMos"],
            "Generator":           ["GTG 1", "GTG 3", "GTG 4", "GTG 2"],
            "pump2":               ["p2"],
            "motor 1":             ["m1"],
            "Gas Turbine":         ["GT 1", "GT 3", "GT 4", "GT 2"],
            "Air Conditioner":     ["AC 6", "AC 4", "AC 5", "AC 3", "AC 2", "AC 1"],
            "pump3":               ["p3"],
            "pump1":               ["p1"],
            "Super Rapid Gun Mount": ["SRGM 1"]
        }

    # ── Strip noise BEFORE extraction ────────────────────────────────────────
    cleaned_message = _preprocess_message_for_component_extraction(message)
    if cleaned_message != message:
        print(f"extract_components: pre-processed '{message}' → '{cleaned_message}'")

    return extract_components_from_message(cleaned_message, data_dict)


async def extract_assemblies(
    message: str,
    ships: List[str] = None,
    sys_repo=get_system_config_repository()
) -> Optional[dict]:
    """
    Extract assembly-level nomenclatures from a message.

    This method:
    1. Gets all nomenclatures (both parent and assembly level) from the database
    2. Identifies parent equipment mentioned in the message
    3. Extracts assembly-level nomenclatures mentioned in the message
    4. Handles "all assemblies" requests for specific parents OR entire ship
    5. Returns a mapping of parent equipment to their assemblies

    Args:
        message:  Natural language message
        ships:    Optional list of ship names to filter components
        sys_repo: System config repository

    Returns:
        Dictionary mapping parent nomenclatures to lists of assembly nomenclatures, or None
        Format: {"GT1": ["P1", "P3"], "GT2": ["P1", "P2"]}
    """
    if not message.strip():
        return None

    all_nomenclatures_dict = await sys_repo.get_all_nomenclatures_by_ships(ships)

    if not all_nomenclatures_dict:
        print("No nomenclatures found in database")
        return None

    print(f"All nomenclatures from DB: {all_nomenclatures_dict}")

    message_lower      = message.lower()
    message_normalized = normalize_text(message)

    global_all_assemblies_patterns = [
        r'\ball\s+(assemblies|components|parts|systems|units)\b',
        r'\ball\s+(assembly|component|part|system|unit)\s+(assemblies|components|parts|systems|units)\b',
        r'\bevery\s+(assembly|component|part|system|unit)\b',
        r'\ball\s+the\s+(assemblies|components|parts|systems|units)\b',
        r'\bshow\s+(all|everything|every)\b.*\b(assemblies|components|parts)\b',
        r'\b(assemblies|components|parts)\s+on\s+the\s+ship\b',
        r'\ball\s+ship\s+(assemblies|components|parts)\b',
    ]

    wants_all_ship_assemblies = any(
        re.search(pattern, message_lower)
        for pattern in global_all_assemblies_patterns
    )

    # Step 1: Extract parent equipment from message
    found_parents      = set()
    parent_nomenclatures = list(all_nomenclatures_dict.keys())

    for parent in parent_nomenclatures:
        variants = create_search_variants(parent)
        for variant in variants:
            if ' ' in variant or '_' in variant or '-' in variant:
                pattern = r'\b' + re.escape(variant.lower()) + r'\b'
                if re.search(pattern, message_lower):
                    found_parents.add(parent)
                    break
            else:
                pattern = r'\b' + re.escape(variant.lower()) + r'\b'
                if re.search(pattern, message_lower):
                    found_parents.add(parent)
                    break
                if variant.lower() in message_lower:
                    found_parents.add(parent)
                    break
                if variant.lower() in message_normalized:
                    found_parents.add(parent)
                    break

    if wants_all_ship_assemblies and not found_parents:
        print("Detected request for all assemblies on ship")
        result = {
            parent: assemblies
            for parent, assemblies in all_nomenclatures_dict.items()
            if assemblies
        }
        return result if result else None

    if not found_parents:
        print("No parent equipment found in message")
        return None

    print(f"Found parent equipment: {found_parents}")

    # Step 2: For each parent, extract assemblies
    result: dict = {}

    wants_all_parent_assemblies = re.search(
        r'\ball\s+(assemblies|components|parts|systems|units)\b',
        message_lower
    )

    for parent in found_parents:
        all_assemblies = all_nomenclatures_dict.get(parent, [])
        if not all_assemblies:
            continue

        if wants_all_parent_assemblies or wants_all_ship_assemblies:
            result[parent] = all_assemblies
            continue

        found_assemblies = set()

        for assembly in all_assemblies:
            variants = create_search_variants(assembly)
            for variant in variants:
                if ' ' in variant or '_' in variant or '-' in variant:
                    pattern = r'\b' + re.escape(variant.lower()) + r'\b'
                    if re.search(pattern, message_lower):
                        found_assemblies.add(assembly)
                        break
                else:
                    pattern = r'\b' + re.escape(variant.lower()) + r'\b'
                    if re.search(pattern, message_lower):
                        found_assemblies.add(assembly)
                        break
                    if variant.lower() in message_lower:
                        found_assemblies.add(assembly)
                        break
                    if variant.lower() in message_normalized:
                        found_assemblies.add(assembly)
                        break

        result[parent] = list(found_assemblies) if found_assemblies else all_assemblies

    return result if result else None


# Example test cases
if __name__ == "__main__":
    print("\n\nTesting enhanced assembly extraction:")
    print("=" * 50)

    assembly_test_cases = [
        ("Show P1 and P3 of GT1",           "Should extract GT1 with P1 and P3"),
        ("All assemblies of GT1",            "Should extract all assemblies of GT1"),
        ("Status of GT1 P2",                 "Should extract GT1 with P2"),
        ("Check GT1 and GT2 assemblies",     "Should extract all assemblies of GT1 and GT2"),
        ("Show all assemblies",              "Should extract ALL parents with ALL their assemblies"),
        ("Give me all assemblies on the ship", "Should extract ALL parents with ALL their assemblies"),
        ("List every assembly",              "Should extract ALL parents with ALL their assemblies"),
        ("Show me all the assemblies",       "Should extract ALL parents with ALL their assemblies"),
        ("All ship assemblies",              "Should extract ALL parents with ALL their assemblies"),
        ("Show everything - all components and assemblies", "Should extract ALL parents with ALL their assemblies"),
        ("All assemblies of GT1 and GT2",    "Should extract all assemblies of GT1 and GT2"),
        ("Show all assemblies for Gas Turbines", "Should extract assemblies of all Gas Turbines"),
    ]

    print("Example test cases (requires async execution):")
    for message, expected in assembly_test_cases:
        print(f"\nMessage: '{message}'")
        print(f"Expected: {expected}")
        print("-" * 50)