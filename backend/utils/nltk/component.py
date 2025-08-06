from api.db.dependencies import get_system_config_repository
import nltk
import re
import asyncio
from typing import List, Optional
from nltk.tokenize import word_tokenize
from nltk.tag import pos_tag
from difflib import get_close_matches

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


def extract_components_from_message(
    message: str, 
    data_dict: dict
) -> Optional[List[str]]:
    """
    Extract component names from natural language message.
    Enhanced to handle components without spaces and in lowercase.
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
    if found_standard:
        return list(found_standard)
    elif found_handy:
        return list(found_handy)
    else:
        return None


async def extract_components(message: str, ships: List[str] = None,sys_repo=get_system_config_repository()) -> Optional[List[str]]:
    """
    Create list of component names extracted from natural language message.
    
    Args:
        message: Natural language message
        data_dict: Dictionary where keys are standard names and values are lists of handy names
        
    Returns:
        List of component names (either standard or handy names) or None if no components found
    """
    data_dict=await sys_repo.get_components_with_nomenclatures_by_ships(ships)
    print("data_dict---->>>",data_dict)
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


   