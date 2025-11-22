import re
from typing import Dict, List, Tuple, Optional
from difflib import SequenceMatcher
import asyncio
import httpx

class EquipmentDisambiguator:
    """
    Handles disambiguation between standard equipment names and handy names
    """
    
    def __init__(self, equipment_endpoint: str = "http://localhost:8000/api/equipment/names", 
                 equipment_dict: Optional[Dict[str, List[str]]] = None):
        self.equipment_endpoint = equipment_endpoint
        self.equipment_mapping = equipment_dict or {}
        self.reverse_mapping = {}  # handy_name -> standard_name
        
        # If equipment_dict is provided, build reverse mapping immediately
        if equipment_dict:
            self._build_reverse_mapping()
    
    async def load_equipment_mapping(self) -> Dict[str, List[str]]:
        """
        Load equipment mapping from endpoint
        Returns: {standard_name: [handy_names]}
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(self.equipment_endpoint)
                response.raise_for_status()
                self.equipment_mapping = response.json()
                
                # Build reverse mapping for quick lookups
                self.reverse_mapping = {}
                for standard_name, handy_names in self.equipment_mapping.items():
                    for handy_name in handy_names:
                        self.reverse_mapping[handy_name.lower()] = standard_name
                
                print(f"Loaded {len(self.equipment_mapping)} equipment entries")
                return self.equipment_mapping
                
        except Exception as e:
            print(f"Failed to load equipment mapping: {e}")
            # Fallback to mock data for testing
            return {
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
    
    def _get_mock_data(self) -> Dict[str, List[str]]:
        """Mock data for testing when endpoint is unavailable"""
        mock_data = {
            "PUMP_001_MAIN_SEAWATER": [
                "Main Sea Water Pump",
                "Primary Cooling Pump", 
                "MSW Pump",
                "Big Blue Pump"
            ],
            "PUMP_002_BACKUP_SEAWATER": [
                "Backup Sea Water Pump",
                "Secondary Cooling Pump",
                "BSW Pump",
                "Standby Pump"
            ],
            "PUMP_005_BALLAST_WATER": [
                "Ballast Pump",
                "Tank Pump", 
                "Ballast Water System",
                "BWS Pump"
            ],
            "ENGINE_001_MAIN_DIESEL": [
                "Main Engine",
                "Primary Diesel Engine",
                "ME1",
                "Main Propulsion"
            ],
            "GENERATOR_001_EMERGENCY": [
                "Emergency Generator",
                "Backup Gen",
                "Emergency Power",
                "EG1"
            ]
        }
        
        self.equipment_mapping = mock_data
        
        # Build reverse mapping
        self.reverse_mapping = {}
        for standard_name, handy_names in mock_data.items():
            for handy_name in handy_names:
                self.reverse_mapping[handy_name.lower()] = standard_name
        
        return mock_data
    
    def calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two strings"""
        return SequenceMatcher(None, text1.lower(), text2.lower()).ratio()
    
    def extract_keywords(self, text: str) -> List[str]:
        """Extract meaningful keywords from text"""
        # Remove common stop words and split
        stop_words = {'the', 'a', 'an', 'of', 'for', 'in', 'on', 'at', 'to', 'and', 'or'}
        words = re.findall(r'\b\w+\b', text.lower())
        return [word for word in words if word not in stop_words and len(word) > 1]
    
    def score_match(self, user_input: str, standard_name: str, handy_names: List[str]) -> Tuple[float, str, str]:
        """
        Score how well user input matches an equipment entry
        Returns: (confidence_score, best_match_name, match_type)
        """
        user_keywords = set(self.extract_keywords(user_input))
        max_score = 0.0
        best_match_name = standard_name
        match_type = "standard"
        
        # Check standard name
        standard_keywords = set(self.extract_keywords(standard_name))
        keyword_overlap = len(user_keywords.intersection(standard_keywords)) / max(len(user_keywords), 1)
        similarity_score = self.calculate_similarity(user_input, standard_name)
        standard_score = (keyword_overlap * 0.7) + (similarity_score * 0.3)
        
        if standard_score > max_score:
            max_score = standard_score
            best_match_name = standard_name
            match_type = "standard"
        
        # Check handy names
        for handy_name in handy_names:
            handy_keywords = set(self.extract_keywords(handy_name))
            keyword_overlap = len(user_keywords.intersection(handy_keywords)) / max(len(user_keywords), 1)
            similarity_score = self.calculate_similarity(user_input, handy_name)
            handy_score = (keyword_overlap * 0.7) + (similarity_score * 0.3)
            
            if handy_score > max_score:
                max_score = handy_score
                best_match_name = handy_name
                match_type = "handy"
        
        return max_score, best_match_name, match_type
    
    async def disambiguate_equipment(self, user_input: str, confidence_threshold: float = 0.5) -> Dict:
        """
        Main disambiguation function
        """
        if not self.equipment_mapping:
            await self.load_equipment_mapping()
        
        print(f"\nDisambiguating: '{user_input}'")
        print("-" * 50)
        
        # Score all equipment
        matches = []
        for standard_name, handy_names in self.equipment_mapping.items():
            score, best_match, match_type = self.score_match(user_input, standard_name, handy_names)
            
            if score >= confidence_threshold:
                matches.append({
                    'standard_name': standard_name,
                    'handy_names': handy_names,
                    'best_match': best_match,
                    'match_type': match_type,
                    'confidence': score,
                    'confidence_percent': round(score * 100, 1)
                })
        
        # Sort by confidence
        matches.sort(key=lambda x: x['confidence'], reverse=True)
        
        # Decision logic
        if not matches:
            return {
                'status': 'no_match',
                'message': f"No equipment found matching '{user_input}'",
                'suggestions': self._get_suggestions(user_input)
            }
        
        elif len(matches) == 1 and matches[0]['confidence'] >= 0.8:
            # High confidence single match
            match = matches[0]
            return {
                'status': 'auto_resolved',
                'standard_name': match['standard_name'],
                'matched_name': match['best_match'],
                'match_type': match['match_type'],
                'confidence': match['confidence_percent'],
                'message': f"Found: {match['best_match']} ({match['standard_name']})"
            }
        
        else:
            # Multiple matches or low confidence - need disambiguation
            return {
                'status': 'disambiguation_needed',
                'message': f"Found {len(matches)} possible matches for '{user_input}':",
                'matches': matches[:5],  # Top 5 matches
                'prompt': self._create_disambiguation_prompt(matches[:5])
            }
    
    def _get_suggestions(self, user_input: str) -> List[str]:
        """Get suggestions when no matches found"""
        suggestions = []
        user_keywords = set(self.extract_keywords(user_input))
        
        for standard_name, handy_names in self.equipment_mapping.items():
            all_names = [standard_name] + handy_names
            for name in all_names:
                name_keywords = set(self.extract_keywords(name))
                if user_keywords.intersection(name_keywords):
                    suggestions.append(name)
                    break
        
        return suggestions[:3]
    
    def _create_disambiguation_prompt(self, matches: List[Dict]) -> str:
        """Create user-friendly disambiguation prompt"""
        prompt = "Which equipment did you mean?\n\n"
        
        for i, match in enumerate(matches, 1):
            prompt += f"{i}. {match['best_match']}\n"
            prompt += f"   Standard name: {match['standard_name']}\n"
            prompt += f"   Confidence: {match['confidence_percent']}%\n"
            prompt += f"   Also known as: {', '.join(match['handy_names'][:3])}\n\n"
        
        prompt += f"{len(matches) + 1}. None of the above\n\n"
        prompt += "Please select a number or provide more specific details."
        
        return prompt
    
    def resolve_disambiguation_choice(self, matches: List[Dict], choice: int) -> Dict:
        """Resolve user's disambiguation choice"""
        if 1 <= choice <= len(matches):
            selected_match = matches[choice - 1]
            return {
                'status': 'resolved',
                'standard_name': selected_match['standard_name'],
                'selected_name': selected_match['best_match'],
                'confidence': selected_match['confidence_percent']
            }
        else:
            return {
                'status': 'rejected',
                'message': 'Please provide more specific equipment details'
            }


# Test function
async def test_disambiguation():
    """Test the disambiguation system"""
    disambiguator = EquipmentDisambiguator({
        "Missile": ["BrahMos"],
        "Generator": ["GTG 1", "GTG 3", "GTG 4", "GTG 2"],
        "pump2": ["p2"],
        "motor 1": ["m1"],
        "Gas Turbine": ["GT 1", "GT 3", "GT 4", "GT 2"],
        "Air Conditioner": ["AC 6", "AC 4", "AC 5", "AC 3", "AC 2", "AC 1"],
        "pump3": ["p3"],
        "pump1": ["p1"],
        "Super Rapid Gun Mount": ["SRGM 1"]
    })
    
    # Load equipment data
    await disambiguator.load_equipment_mapping()
    
    # Test cases
    test_cases = [
    # Clear/Unambiguous questions
    "What is the status of BrahMos missile?",
    "Check the temperature of AC 3",
    "Show me GTG 2 performance data",
    "Is SRGM 1 operational?",
    "What's the pressure reading on p1?",
    
    # Ambiguous - multiple instances possible
    "Turn on the air conditioner",
    "Check the generator status", 
    "What's wrong with the pump?",
    "Start the gas turbine",
    "Show me AC diagnostics",
    
    # Partially specified
    "Check GTG 1 and GTG 3 temperatures",
    "Turn off all air conditioners except AC 1",
    "Compare GT 2 and GT 4 efficiency",
    "What's the status of pumps p2 and p3?",
    "Show generator GTG performance",
    
    # Context-dependent ambiguity
    "The pump is making noise - which one?",
    "AC unit needs maintenance",
    "Generator 1 or generator 2?",
    "Check the main pump system",
    "Is the gun mount ready for operation?"
]
    
    print("=" * 60)
    print("EQUIPMENT DISAMBIGUATION TESTING")
    print("=" * 60)
    
    for test_input in test_cases:
        result = await disambiguator.disambiguate_equipment(test_input)
        
        print(f"\nInput: '{test_input}'")
        print(f"Status: {result['status']}")
        print(f"Message: {result.get('message', 'N/A')}")
        
        if result['status'] == 'auto_resolved':
            print(f"✓ Resolved to: {result['standard_name']}")
            print(f"  Matched name: {result['matched_name']}")
            print(f"  Confidence: {result['confidence']}%")
        
        elif result['status'] == 'disambiguation_needed':
            print(f"? {len(result['matches'])} matches found:")
            for match in result['matches'][:3]:  # Show top 3
                print(f"  - {match['best_match']} ({match['confidence_percent']}%)")
        
        elif result['status'] == 'no_match':
            if result.get('suggestions'):
                print(f"  Suggestions: {', '.join(result['suggestions'])}")
        
        print("-" * 40)

# Run the test
if __name__ == "__main__":
    asyncio.run(test_disambiguation())