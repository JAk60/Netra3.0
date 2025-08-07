from api.db.dependencies import get_ship_repository
# from api.routes.chat import ReliabilityFilters
import nltk
import re
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional
from nltk.tokenize import word_tokenize
from nltk.tag import pos_tag
from difflib import get_close_matches

class ReliabilityFilters(BaseModel):
    """Filters for reliability calculations"""
    ships: Optional[List[str]] = None
    explain: Optional[bool] = False
    # Add more filter options as needed
    additional_filters: Optional[Dict[str, Any]] = {}
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


async def extract_ships_from_message(message: str, ship_repo=get_ship_repository()) -> Optional[List[str]]:
    """
    Extract ship names from natural language message.
    
    Args:
        message: Natural language message
        available_ships: List of available ship names
        
    Returns:
        List of matched ship names or None if no ships found
    """
        # Get ship objects from repository
    ship_objects = await ship_repo.get_all_ships()

    # Extract ship names from ShipRead objects
    # Assuming ShipRead has a 'name' attribute - adjust this based on your actual model
    available_ships = [ship.ship_name for ship in ship_objects]
    if not message.strip() or not available_ships:
        return None
    
    found_ships = set()
    message_lower = message.lower()
    
    # 1. EXACT MATCHING - most reliable approach
    # Check each ship name directly in the message
    for ship in available_ships:
        ship_lower = ship.lower()
        
        # Use word boundaries to avoid partial matches
        # This prevents "INS TWO" from matching when only "INS ONE" is mentioned
        pattern = r'\b' + re.escape(ship_lower) + r'\b'
        if re.search(pattern, message_lower):
            found_ships.add(ship)
    
    # 2. PATTERN-BASED MATCHING for ship prefixes
    # Handle cases like "ship INS ONE" or "on INS ONE"
    ship_prefixes = ['uss', 'hms', 'ins', 'rms', 'mv', 'ss', 'usns', 'fgs', 'hnlms']
    
    # Pattern to match: "ship INS ONE", "on INS ONE", etc.
    for prefix in ship_prefixes:
        pattern = rf'\b(?:ship\s+|on\s+|of\s+)?{prefix}\s+([a-zA-Z0-9\s]+?)(?:\s|$|,|\.|\?|/)'
        matches = re.finditer(pattern, message, re.IGNORECASE)
        
        for match in matches:
            potential_ship = f"{prefix.upper()} {match.group(1).strip()}"
            
            # Find exact match in available ships
            for ship in available_ships:
                if ship.lower() == potential_ship.lower():
                    found_ships.add(ship)
    
    # 3. NLTK-ENHANCED MATCHING for proper nouns
    # Only use this as fallback and be more conservative
    if not found_ships:
        try:
            tokens = word_tokenize(message)
            pos_tags = pos_tag(tokens)
            
            # Extract sequences of proper nouns
            proper_noun_sequences = []
            current_sequence = []
            
            for i, (token, pos) in enumerate(pos_tags):
                if pos in ['NNP', 'NNPS'] and token.upper() not in STOP_WORDS:
                    current_sequence.append(token)
                else:
                    if current_sequence:
                        # Check if this sequence could be a ship name
                        sequence_text = ' '.join(current_sequence)
                        if len(sequence_text) >= 3:  # Minimum length check
                            proper_noun_sequences.append(sequence_text)
                        current_sequence = []
            
            # Don't forget the last sequence
            if current_sequence:
                sequence_text = ' '.join(current_sequence)
                if len(sequence_text) >= 3:
                    proper_noun_sequences.append(sequence_text)
            
            # Match proper noun sequences against ship names with high threshold
            for sequence in proper_noun_sequences:
                matches = get_close_matches(
                    sequence.lower(),
                    [ship.lower() for ship in available_ships],
                    n=1,
                    cutoff=0.85  # High threshold to avoid false positives
                )
                
                for match in matches:
                    # Find original ship name
                    for ship in available_ships:
                        if ship.lower() == match:
                            found_ships.add(ship)
                            break
                            
        except Exception:
            # If NLTK processing fails, fall back to exact matching only
            pass
    
    # 4. SLASH-SEPARATED SHIPS handling
    # Handle patterns like "INS ONE/INS TWO/INS THREE"
    slash_parts = re.split(r'[/,]', message)
    for part in slash_parts:
        part = part.strip()
        for ship in available_ships:
            if ship.lower() in part.lower():
                # Double-check with word boundaries
                pattern = r'\b' + re.escape(ship.lower()) + r'\b'
                if re.search(pattern, part.lower()):
                    found_ships.add(ship)
    
    return list(found_ships) if found_ships else None


async def create_ship_filter(message: str) -> ReliabilityFilters:
    """
    Create ReliabilityFilters object with extracted ships.
    
    Args:
        message: Natural language message
        ship_repo: Ship repository instance
        
    Returns:
        ReliabilityFilters object
    """
    # Now extract ships from the message using string names
    extracted_ships =await extract_ships_from_message(message)
    
    return ReliabilityFilters(
        ships=extracted_ships,
        explain=True,
        additional_filters={}
    )


