import re
import nltk
from typing import List, Optional, Dict
from nltk.tokenize import word_tokenize
from nltk.tag import pos_tag

# Ensure NLTK data is downloaded
def ensure_nltk_data():
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

def normalize_text(text: str) -> str:
    """Normalize text by removing spaces and converting to lowercase."""
    return re.sub(r'\s+', '', text.lower())

def create_search_variants(sensor: str) -> List[str]:
    """Create different variants of a sensor name for matching."""
    variants = set()
    # Original and lowercase
    variants.add(sensor)
    variants.add(sensor.lower())
    # Without spaces/underscores
    no_space = re.sub(r'[\s_]', '', sensor)
    variants.add(no_space)
    variants.add(no_space.lower())
    # With hyphens
    variants.add(sensor.replace(' ', '-').replace('_', '-'))
    variants.add(sensor.replace(' ', '-').replace('_', '-').lower())
    return list(variants)

def handle_collective_references(
    message: str,
    found_sensors: List[str],
    sensor_dict: Dict[str, List[str]],
    equipment_type_map: Optional[Dict[str, List[str]]] = None
) -> List[str]:
    """
    Handle collective references like 'all sensors for GT 1' or 'all GT 1 sensors'.
    Returns sensor IDs, not standard names.
    
    Args:
        message: The input message
        found_sensors: List of already found sensors (standard names or IDs)
        sensor_dict: Dictionary mapping standard names to sensor IDs
        equipment_type_map: Optional mapping of equipment prefixes to their aliases
                          e.g., {'GT': ['gas turbine', 'turbine'], 'AC': ['compressor']}
    """
    message_lower = message.lower()
    expanded_sensors = set()
    
    # Default equipment type mapping if none provided
    if equipment_type_map is None:
        equipment_type_map = {
            'GT': ['gas turbine', 'gasturbine', 'turbine'],
            'AC': ['air compressor', 'aircompressor', 'compressor'],
            'GEN': ['generator'],
            'PUMP': ['pump'],
            'MOTOR': ['motor'],
        }

    # If specific sensors are found, check for "all" references
    if found_sensors:
        if re.search(r'\ball\s+sensors?\b', message_lower):
            for sensor in found_sensors:
                # If the sensor is a standard name, add all its sensor IDs
                if sensor in sensor_dict:
                    expanded_sensors.update(sensor_dict[sensor])
                else:
                    # If it's a sensor ID, find its standard name and add all siblings
                    for standard, sensors in sensor_dict.items():
                        if sensor in sensors:
                            expanded_sensors.update(sensors)
                            break
            return list(expanded_sensors)

    # Handle patterns like "all sensors for AC 1" or "all AC 1 sensors"
    # Also handle just "AC 1 sensors" (without "all")
    for standard in sensor_dict:
        standard_escaped = re.escape(standard.lower())
        
        # Pattern 1: "all sensors for/of/in <standard>"
        pattern1 = rf'\ball\s+sensors?\s+(?:for|of|in)\s+{standard_escaped}\b'
        if re.search(pattern1, message_lower):
            expanded_sensors.update(sensor_dict[standard])
            continue
        
        # Pattern 2: "all <standard> sensors"
        pattern2 = rf'\ball\s+{standard_escaped}\s+sensors?\b'
        if re.search(pattern2, message_lower):
            expanded_sensors.update(sensor_dict[standard])
            continue
        
        # Pattern 3: "<standard> sensors" (without "all") - but NOT if a specific sensor ID is mentioned
        pattern3 = rf'\b{standard_escaped}\s+sensors?\b'
        # Check if any specific sensor IDs from this standard are mentioned
        has_specific_sensor = any(
            re.search(rf'\b{re.escape(sensor.lower())}\b', message_lower)
            for sensor in sensor_dict[standard]
        )
        if re.search(pattern3, message_lower) and not has_specific_sensor:
            expanded_sensors.update(sensor_dict[standard])
            continue

    # Handle "all sensors for all <type>" patterns
    # e.g., "all sensors for all gas turbines", "all sensors for all ACs"
    if re.search(r'\ball\s+sensors?\s+for\s+all\b', message_lower):
        for standard in sensor_dict:
            # Extract the prefix (e.g., "GT", "AC") from standard name
            prefix_match = re.match(r'^([A-Z]+)', standard)
            if prefix_match:
                prefix = prefix_match.group(1).upper()
                
                # Check if this prefix or its aliases appear in the message
                if prefix in equipment_type_map:
                    for alias in equipment_type_map[prefix]:
                        if alias in message_lower:
                            expanded_sensors.update(sensor_dict[standard])
                            break
                # Also check if the prefix itself appears
                if re.search(rf'\b{prefix.lower()}\b', message_lower):
                    expanded_sensors.update(sensor_dict[standard])

    return list(expanded_sensors) if expanded_sensors else found_sensors

def extract_sensors_from_message(
    message: str,
    sensor_dict: Dict[str, List[str]],
    equipment_type_map: Optional[Dict[str, List[str]]] = None
) -> Optional[List[str]]:
    """
    Extract sensor names from a natural language message.
    Returns sensor IDs for collective references, otherwise standard names or sensor IDs.
    
    Args:
        message: The natural language message
        sensor_dict: Dictionary mapping standard names to sensor IDs
        equipment_type_map: Optional mapping of equipment prefixes to their aliases
    """
    if not message.strip() or not sensor_dict:
        return None

    found_standard = set()
    found_sensor_ids = set()
    message_lower = message.lower()
    message_normalized = normalize_text(message)

    # Flatten all sensor IDs
    all_sensor_ids = []
    for sensors in sensor_dict.values():
        all_sensor_ids.extend(sensors)

    # CRITICAL FIX: Check for SPECIFIC sensor IDs FIRST (before standard names)
    # This ensures GT_1_S2 is matched before GT 1
    for standard, sensors in sensor_dict.items():
        for sensor in sensors:
            # Check if the exact sensor ID (with underscores) appears in the message
            # Use word boundaries but account for underscores not being word characters
            sensor_pattern = re.escape(sensor).replace(r'\_', r'[_\s]')
            if re.search(rf'(?<![A-Za-z0-9_]){sensor_pattern}(?![A-Za-z0-9_])', message, re.IGNORECASE):
                found_sensor_ids.add(sensor)
                continue
            
            # Also check normalized variants (without spaces/underscores)
            sensor_normalized = normalize_text(sensor)
            if len(sensor_normalized) > 4 and sensor_normalized in message_normalized:
                # Additional check: make sure this isn't a partial match
                # e.g., "gt1s2" should match "GT_1_S2" but not just "GT 1"
                if re.search(r'_S\d+', sensor, re.IGNORECASE):  # Has sensor suffix
                    found_sensor_ids.add(sensor)

    # Only check standard names if no specific sensor IDs were found
    if not found_sensor_ids:
        for standard, sensors in sensor_dict.items():
            # Check standard name variants
            standard_escaped = re.escape(standard.lower())
            if re.search(rf'\b{standard_escaped}\b', message_lower):
                found_standard.add(standard)

    # 2. NLTK-enhanced matching for sequences (only if nothing found yet)
    if not found_sensor_ids and not found_standard:
        try:
            tokens = word_tokenize(message)
            pos_tags = pos_tag(tokens)
            current_sequence = []
            potential_sequences = []

            for token, pos in pos_tags:
                if (pos in ['NNP', 'NNPS', 'NN', 'NNS'] or re.match(r'^[A-Za-z0-9\-_]+$', token)) and token.upper() not in STOP_WORDS:
                    current_sequence.append(token)
                else:
                    if current_sequence:
                        potential_sequences.append(' '.join(current_sequence))
                        current_sequence = []
            if current_sequence:
                potential_sequences.append(' '.join(current_sequence))

            for sequence in potential_sequences:
                # Check sensor IDs first
                for sensor in all_sensor_ids:
                    if any(variant.lower() == sequence.lower() for variant in create_search_variants(sensor)):
                        found_sensor_ids.add(sensor)
                        break
                # Then check standard names
                if not found_sensor_ids:
                    for standard in sensor_dict:
                        if any(variant.lower() == sequence.lower() for variant in create_search_variants(standard)):
                            found_standard.add(standard)
                            break
        except Exception:
            pass

    # 3. Handle collective references ONLY if no specific sensor IDs were found
    if found_sensor_ids:
        # Specific sensor IDs mentioned - return them directly
        return list(found_sensor_ids)
    
    # Check if this is a collective reference
    initial_sensors = list(found_standard)
    if initial_sensors:
        collective_sensors = handle_collective_references(
            message, initial_sensors, sensor_dict, equipment_type_map
        )
        
        # If collective handler returned sensor IDs, use those
        if collective_sensors and collective_sensors != initial_sensors:
            return collective_sensors
    
    # Return what was found
    return initial_sensors if initial_sensors else None

# Example usage
if __name__ == "__main__":
    test_sensor_dict = {'GT 1': ['GT_1_S1', 'GT_1_S2', 'GT_1_S3']}

    test_messages = [
      "Show me the values of the GT_1_S2 sensor on GT 1 of INS One for the last 20 days.",
      "Show me all sensors for GT 1",
      "Show me GT 1 sensors",
      "Show me GT_1_S1 and GT_1_S3"
    ]

    print("Testing sensor extraction:") 
    print("=" * 50)
    for message in test_messages:
        result = extract_sensors_from_message(message, test_sensor_dict)
        print(f"Message: '{message}'")
        print(f"Result: {result}")
        print("-" * 30)