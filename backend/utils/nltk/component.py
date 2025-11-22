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

# Initialize NLTK data
ensure_nltk_data()

from nltk.corpus import stopwords
STOP_WORDS = set(stopwords.words('english'))


def normalize_text(text: str) -> str:
    """Normalize text by removing spaces and converting to lowercase"""
    return re.sub(r'\s+', '', text.lower())


def create_search_variants(component: str) -> List[str]:
    """Create different variants of a component name for matching"""
    variants = []
    
    # Original component
    variants.append(component)
    variants.append(component.lower())
    
    # Without spaces
    no_space = re.sub(r'\s+', '', component)
    variants.append(no_space)
    variants.append(no_space.lower())
    
    # With different separators
    variants.append(component.replace(' ', ''))
    variants.append(component.replace(' ', '_'))
    variants.append(component.replace(' ', '-'))
    variants.append(component.replace(' ', '').lower())
    variants.append(component.replace(' ', '_').lower())
    variants.append(component.replace(' ', '-').lower())
    
    # Remove duplicates while preserving order
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
    
    Args:
        message: Original message
        found_components: Components found by normal extraction
        data_dict: Dictionary of components and their handy names
        
    Returns:
        Expanded list of components based on collective references
    """
    message_lower = message.lower()
    
    # If we found specific components, check if message indicates "all" of that type
    if found_components:
        # Check for "all" keyword near found components
        if re.search(r'\ball\b', message_lower):
            expanded_components = set()
            
            for component in found_components:
                # If the component is a category (like "Gas Turbine"), 
                # add all its handy name instances
                if component in data_dict and data_dict[component]:
                    expanded_components.update(data_dict[component])
                else:
                    # Check if this component is a handy name, find its category and add all siblings
                    found_category = False
                    for category, handy_list in data_dict.items():
                        if component in handy_list:
                            expanded_components.update(handy_list)
                            found_category = True
                            break
                    
                    if not found_category:
                        # If it's not found in any category, keep it as is
                        expanded_components.add(component)
            
            return list(expanded_components)
    
    # Handle specific collective phrases
    collective_patterns = {
        r'\ball\s+(gas\s*turbines?|gts?)\b': 'Gas Turbine',
        r'\ball\s+(generators?|gtgs?)\b': 'Generator',
        r'\ball\s+(air\s*conditioners?|acs?)\b': 'Air Conditioner',
        r'\ball\s+(missiles?)\b': 'Missile',
        r'\ball\s+(guns?|srgms?|super\s*rapid\s*gun\s*mounts?)\b': 'Super Rapid Gun Mount',
        r'\ball\s+(equipment|components?|systems?|devices?|units?)\b': 'ALL'  # Everything
    }
    
    # Handle pump patterns separately since they have multiple categories
    pump_patterns = [
        r'\ball\s+(pumps?)\b'
    ]
    
    expanded_components = set()
    
    # Check collective patterns
    for pattern, category in collective_patterns.items():
        if re.search(pattern, message_lower):
            if category == 'ALL':
                # Return all handy names from all categories
                for handy_list in data_dict.values():
                    if isinstance(handy_list, list):
                        expanded_components.update(handy_list)
            else:
                # Single category
                if category in data_dict and isinstance(data_dict[category], list):
                    expanded_components.update(data_dict[category])
    
    # Handle pumps specially (since you have pump1, pump2, pump3 as separate categories)
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
        message: Natural language message
        data_dict: Dictionary where keys are standard names and values are lists of handy names
        
    Returns:
        List of matched component names (either all standard or all handy) or None if no components found
    """
    if not message.strip() or not data_dict:
        return None
    
    found_standard = set()
    found_handy = set()
    message_lower = message.lower()
    message_normalized = normalize_text(message)
    
    standard_names = list(data_dict.keys())
    # Flatten all handy names from all lists
    handy_names = []
    for handy_list in data_dict.values():
        if isinstance(handy_list, list):
            handy_names.extend(handy_list)
    
    # 1. ENHANCED EXACT MATCHING - with space variations and case insensitive
    # Check standard names with all variants
    for component in standard_names:
        variants = create_search_variants(component)
        
        for variant in variants:
            # Word boundary matching for spaced variants
            if ' ' in variant or '_' in variant or '-' in variant:
                pattern = r'\b' + re.escape(variant.lower()) + r'\b'
                if re.search(pattern, message_lower):
                    found_standard.add(component)
                    break
            else:
                # For variants without spaces, check both with and without word boundaries
                # With word boundaries
                pattern = r'\b' + re.escape(variant.lower()) + r'\b'
                if re.search(pattern, message_lower):
                    found_standard.add(component)
                    break
                
                # Without word boundaries (for cases like "gt1" in "showgt1data")
                if variant.lower() in message_lower:
                    found_standard.add(component)
                    break
                
                # Check in normalized message (all spaces removed)
                if variant.lower() in message_normalized:
                    found_standard.add(component)
                    break
    
    # Check handy names with all variants
    for component in handy_names:
        variants = create_search_variants(component)
        
        for variant in variants:
            # Word boundary matching for spaced variants
            if ' ' in variant or '_' in variant or '-' in variant:
                pattern = r'\b' + re.escape(variant.lower()) + r'\b'
                if re.search(pattern, message_lower):
                    found_handy.add(component)
                    break
            else:
                # For variants without spaces, check both with and without word boundaries
                # With word boundaries
                pattern = r'\b' + re.escape(variant.lower()) + r'\b'
                if re.search(pattern, message_lower):
                    found_handy.add(component)
                    break
                
                # Without word boundaries
                if variant.lower() in message_lower:
                    found_handy.add(component)
                    break
                
                # Check in normalized message
                if variant.lower() in message_normalized:
                    found_handy.add(component)
                    break
    
    # 2. PATTERN-BASED MATCHING for component prefixes/keywords
    component_keywords = ['component', 'part', 'equipment', 'device', 'system', 'unit']
    
    for keyword in component_keywords:
        # Pattern to match keyword followed by potential component name
        pattern = rf'\b{keyword}\s*([a-zA-Z0-9\-_\s]+?)(?:\s|$|,|\.|\?|/)'
        matches = re.finditer(pattern, message, re.IGNORECASE)
        
        for match in matches:
            potential_component = match.group(1).strip()
            
            # Check against standard names and their variants
            for component in standard_names:
                variants = create_search_variants(component)
                for variant in variants:
                    if variant.lower() == potential_component.lower():
                        found_standard.add(component)
                        break
            
            # Check against handy names and their variants
            for component in handy_names:
                variants = create_search_variants(component)
                for variant in variants:
                    if variant.lower() == potential_component.lower():
                        found_handy.add(component)
                        break
    
    # 3. NLTK-ENHANCED MATCHING for proper nouns and technical terms
    if not found_standard and not found_handy:
        try:
            tokens = word_tokenize(message)
            pos_tags = pos_tag(tokens)
            
            # Extract sequences that could be component names
            potential_sequences = []
            current_sequence = []
            
            for i, (token, pos) in enumerate(pos_tags):
                # Include proper nouns, nouns, and alphanumeric tokens
                if (pos in ['NNP', 'NNPS', 'NN', 'NNS'] or 
                    re.match(r'^[A-Za-z0-9\-_]+$', token)) and token.upper() not in STOP_WORDS:
                    current_sequence.append(token)
                else:
                    if current_sequence:
                        sequence_text = ' '.join(current_sequence)
                        if len(sequence_text) >= 1:  # Allow single character components like "p1"
                            potential_sequences.append(sequence_text)
                        current_sequence = []
            
            # Don't forget the last sequence
            if current_sequence:
                sequence_text = ' '.join(current_sequence)
                if len(sequence_text) >= 1:
                    potential_sequences.append(sequence_text)
            
            # Match sequences against component names with variants
            for sequence in potential_sequences:
                # Check standard names
                for component in standard_names:
                    variants = create_search_variants(component)
                    for variant in variants:
                        if variant.lower() == sequence.lower():
                            found_standard.add(component)
                            break
                
                # Check handy names if no standard matches found for this sequence
                if sequence not in [normalize_text(comp) for comp in found_standard]:
                    for component in handy_names:
                        variants = create_search_variants(component)
                        for variant in variants:
                            if variant.lower() == sequence.lower():
                                found_handy.add(component)
                                break
                                
        except Exception:
            # If NLTK processing fails, fall back to exact matching only
            pass
    
    # 4. SLASH-SEPARATED/COMMA-SEPARATED COMPONENTS handling
    separator_parts = re.split(r'[/,;]', message)
    for part in separator_parts:
        part = part.strip()
        
        # Check standard names with variants
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
        
        # Check handy names only if no standard found in this part
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
    
    # PRIORITY LOGIC: Return standard names if found, otherwise handy names
    initial_components = None
    if found_standard:
        initial_components = list(found_standard)
    elif found_handy:
        initial_components = list(found_handy)
    
    # Handle collective references
    if initial_components:
        final_components = handle_collective_references(message, initial_components, data_dict)
        return final_components if final_components else initial_components
    else:
        # Check for collective references even if no specific components found
        collective_components = handle_collective_references(message, [], data_dict)
        return collective_components if collective_components else None


async def extract_components(message: str, ships: List[str] = None, sys_repo=get_system_config_repository()) -> Optional[List[str]]:
    """
    Create list of component names extracted from natural language message.
    
    Args:
        message: Natural language message
        ships: List of ship names to filter components
        sys_repo: System config repository
        
    Returns:
        List of component names (either standard or handy names) or None if no components found
    """
    data_dict = await sys_repo.get_components_with_nomenclatures_by_ships(ships)
    print("data_dict---->>>", data_dict)
    
    if data_dict is None:
        # Default data structure
        data_dict = {
            "Missile": ["BrahMos"],
            "Generator": ["GTG 1", "GTG 3", "GTG 4", "GTG 2"],
            "pump2": ["p2"],
            "motor 1": ["m1"],
            "Gas Turbine": ["GT 1", "GT 3", "GT 4", "GT 2"],
            "Air Conditioner": ["AC 6", "AC 4", "AC 5", "AC 3", "AC 2", "AC 1"],
            "pump3": ["p3"],
            "pump1": ["p1"],
            "Super Rapid Gun Mount": ["SRGM 1"]
        }
    
    return extract_components_from_message(message, data_dict)


# Example usage and test cases
if __name__ == "__main__":
    # Test data
    test_data_dict = {
        "Missile": ["BrahMos"],
        "Generator": ["GTG 1", "GTG 3", "GTG 4", "GTG 2"],
        "pump2": ["p2"],
        "motor 1": ["m1"],
        "Gas Turbine": ["GT 1", "GT 3", "GT 4", "GT 2"],
        "Air Conditioner": ["AC 6", "AC 4", "AC 5", "AC 3", "AC 2", "AC 1"],
        "pump3": ["p3"],
        "pump1": ["p1"],
        "Super Rapid Gun Mount": ["SRGM 1"]
    }
    
    # Test cases
    test_messages = [
        "Show me all gas turbines",
        "Status of all equipment", 
        "All generators and pumps",
        "Check GT 1 and all other gas turbines",
        "All ACs in the system",
        "Give me data for all air conditioners",
        "Show all components",
        "Status of all generators",
        "All missile systems",
        "Show me everything"
    ]
    
    print("Testing collective reference extraction:")
    print("=" * 50)
    
    for message in test_messages:
        result = extract_components_from_message(message, test_data_dict)
        print(f"Message: '{message}'")
        print(f"Result: {result}")
        print("-" * 30)