from api.db.dependencies import get_ship_repository
import nltk
import re
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from nltk.tokenize import word_tokenize
from nltk.tag import pos_tag
from difflib import get_close_matches
from collections import defaultdict


class ReliabilityFilters(BaseModel):
    """Filters for reliability calculations"""
    ships: Optional[List[str]] = None
    explain: Optional[bool] = False
    additional_filters: Optional[Dict[str, Any]] = {}


# ── NLTK bootstrap ────────────────────────────────────────────────────────────
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


# ── PARTIAL TOKEN UNIQUENESS INDEX ────────────────────────────────────────────
def build_partial_token_index(available_ships: List[str]) -> Dict[str, List[str]]:
    """
    Build an index mapping every individual word/token of a ship name
    to the list of ships that contain it.

    Example:
        "INS ONE"  -> tokens: ["ins", "one"]
        "INS TWO"  -> tokens: ["ins", "two"]

        index = {
            "ins": ["INS ONE", "INS TWO"],   # not unique
            "one": ["INS ONE"],              # unique! → resolves to "INS ONE"
            "two": ["INS TWO"],              # unique!
        }

    Only tokens longer than 2 chars are indexed to avoid noise.
    """
    index: Dict[str, List[str]] = defaultdict(list)

    for ship in available_ships:
        for token in re.split(r'[\s\-_]+', ship.lower()):
            if len(token) > 2:
                index[token].append(ship)

    return dict(index)


def match_via_partial_tokens(
    message: str,
    available_ships: List[str],
    token_index: Dict[str, List[str]],
) -> set:
    """
    For every word in the message, check if it uniquely maps to exactly
    one ship in the token index. If yes, that ship is considered a match.

    This is what lets "one" resolve to "INS ONE" if no other ship has "one".
    """
    found = set()
    message_tokens = re.findall(r'[a-zA-Z0-9]+', message.lower())

    for token in message_tokens:
        if token in STOP_WORDS or len(token) <= 2:
            continue

        ships_with_token = token_index.get(token, [])

        if len(ships_with_token) == 1:
            # This token is unique to exactly one ship → confident match
            found.add(ships_with_token[0])
        # If multiple ships share the token (e.g. "INS"), skip —
        # we need more specificity; the other matching stages will handle it.

    return found


# ── MAIN EXTRACTION FUNCTION ──────────────────────────────────────────────────
async def extract_ships_from_message(
    message: str,
    ship_repo=get_ship_repository(),
) -> Optional[List[str]]:
    """
    Extract ship names from a natural language message using four strategies:

    1. Exact match       — "INS ONE" found literally in the message.
    2. Prefix pattern    — "on INS ONE", "ship INS ONE", etc.
    3. Partial token     — "one" uniquely maps to "INS ONE" (NEW ✨).
    4. NLTK proper nouns — fuzzy fallback for everything else.
    5. Slash/comma list  — "INS ONE/INS TWO/INS THREE".
    """
    ship_objects = await ship_repo.get_all_ships()
    available_ships = [ship.ship_name for ship in ship_objects]

    if not message.strip() or not available_ships:
        return None

    found_ships: set = set()
    message_lower = message.lower()

    # ── 1. EXACT MATCHING ─────────────────────────────────────────────────────
    for ship in available_ships:
        pattern = r'\b' + re.escape(ship.lower()) + r'\b'
        if re.search(pattern, message_lower):
            found_ships.add(ship)

    # ── 2. PREFIX-PATTERN MATCHING ────────────────────────────────────────────
    ship_prefixes = ['uss', 'hms', 'ins', 'rms', 'mv', 'ss', 'usns', 'fgs', 'hnlms']
    for prefix in ship_prefixes:
        pattern = rf'\b(?:ship\s+|on\s+|of\s+)?{prefix}\s+([a-zA-Z0-9\s]+?)(?:\s|$|,|\.|\?|/)'
        for match in re.finditer(pattern, message, re.IGNORECASE):
            potential_ship = f"{prefix.upper()} {match.group(1).strip()}"
            for ship in available_ships:
                if ship.lower() == potential_ship.lower():
                    found_ships.add(ship)

    # ── 3. PARTIAL TOKEN UNIQUENESS MATCHING (NEW) ────────────────────────────
    # Build the index fresh each call (or cache it externally for performance).
    token_index = build_partial_token_index(available_ships)
    partial_matches = match_via_partial_tokens(message, available_ships, token_index)
    found_ships.update(partial_matches)

    # ── 4. NLTK PROPER-NOUN FUZZY FALLBACK ───────────────────────────────────
    if not found_ships:
        try:
            tokens = word_tokenize(message)
            pos_tags = pos_tag(tokens)

            proper_noun_sequences = []
            current_sequence: List[str] = []

            for token, pos in pos_tags:
                if pos in ['NNP', 'NNPS'] and token.upper() not in STOP_WORDS:
                    current_sequence.append(token)
                else:
                    if current_sequence:
                        seq = ' '.join(current_sequence)
                        if len(seq) >= 3:
                            proper_noun_sequences.append(seq)
                        current_sequence = []

            if current_sequence:
                seq = ' '.join(current_sequence)
                if len(seq) >= 3:
                    proper_noun_sequences.append(seq)

            for sequence in proper_noun_sequences:
                close = get_close_matches(
                    sequence.lower(),
                    [s.lower() for s in available_ships],
                    n=1,
                    cutoff=0.85,
                )
                for match in close:
                    for ship in available_ships:
                        if ship.lower() == match:
                            found_ships.add(ship)
                            break

        except Exception:
            pass

    # ── 5. SLASH / COMMA SEPARATED LIST ──────────────────────────────────────
    for part in re.split(r'[/,]', message):
        part = part.strip()
        for ship in available_ships:
            pattern = r'\b' + re.escape(ship.lower()) + r'\b'
            if re.search(pattern, part.lower()):
                found_ships.add(ship)

    return list(found_ships) if found_ships else None


# ── FILTER FACTORY ────────────────────────────────────────────────────────────
async def create_ship_filter(message: str) -> ReliabilityFilters:
    extracted_ships = await extract_ships_from_message(message)
    return ReliabilityFilters(
        ships=extracted_ships,
        explain=True,
        additional_filters={},
    )