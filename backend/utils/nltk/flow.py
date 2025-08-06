import nltk
import re
from typing import Dict, List, Any, Set
from collections import defaultdict

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('taggers/averaged_perceptron_tagger')
except LookupError:
    nltk.download('averaged_perceptron_tagger')

from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.tag import pos_tag

class NaturalLanguageQueryFilter:
    """
    Natural Language Query Filter for ReactFlow Hierarchy JSON
    Filters ship hierarchy data based on natural language queries while maintaining structure
    """
    
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
        
        # Define system type mappings and synonyms for your 4 ship system types
        self.system_type_mappings = {
            'propulsion': [
                'propulsion', 'engine', 'motor', 'drive', 'thrust', 'turbine', 
                'gas turbine', 'gas turbines', 'main engine', 'propeller'
            ],
            'power generation': [
                'power generation', 'power', 'generator', 'generators', 'electrical', 
                'electric', 'gtg', 'gtgs', 'gas turbine generator', 'electricity',
                'generation', 'power supply'
            ],
            'support': [
                'support', 'ac', 'air conditioning', 'hvac', 'cooling', 'ventilation',
                'air', 'climate', 'environmental', 'life support', 'auxiliary'
            ],
            'firing': [
                'firing', 'fire', 'missile', 'missiles', 'srgm', 'weapon', 'weapons',
                'combat', 'armament', 'launcher', 'defense', 'offensive', 'attack'
            ]
        }
        
        # Query intent patterns
        self.intent_patterns = {
            'filter_by_type': [
                r'(?:show|display|filter|find|get|what|which).*(?:system|component|equipment).*(?:type|category)',
                r'(?:probability|chance|likelihood).*(?:of|for).*(?:system|component)',
                r'(?:only|just).*(?:show|display).*(?:system|component)',
            ],
            'exclude_type': [
                r'(?:exclude|remove|hide|without|except|not).*(?:system|component)',
                r'(?:everything|all).*(?:except|but|excluding)',
            ],
            'component_details': [
                r'(?:components|equipment|parts).*(?:of|in|for).*(?:system)',
                r'(?:what.*components|which.*equipment)',
            ]
        }
    
    async def extract_system_types_from_query(self, query: str) -> List[str]:
        """Extract system types mentioned in the natural language query"""
        query_lower = query.lower()
        tokens = word_tokenize(query_lower)
        
        # Remove stop words and get POS tags
        filtered_tokens = [token for token in tokens if token not in self.stop_words]
        pos_tags = pos_tag(filtered_tokens)
        
        # Extract nouns and adjectives that might be system types
        relevant_words = [word for word, pos in pos_tags if pos in ['NN', 'NNS', 'JJ', 'NNP']]
        
        found_types = []
        
        # Check each system type mapping
        for system_type, synonyms in self.system_type_mappings.items():
            for synonym in synonyms:
                if synonym in query_lower or any(synonym in word for word in relevant_words):
                    found_types.append(system_type)
                    break
        
        return list(set(found_types))  # Remove duplicates
    
    def determine_query_intent(self, query: str) -> str:
        """Determine the intent of the query"""
        query_lower = query.lower()
        
        for intent, patterns in self.intent_patterns.items():
            for pattern in patterns:
                if re.search(pattern, query_lower):
                    return intent
        
        # Default intent
        return 'filter_by_type'
    
    async def should_exclude_system_type(self, query: str) -> bool:
        """Check if the query indicates exclusion of system types"""
        exclude_keywords = ['exclude', 'remove', 'hide', 'without', 'except', 'not', 'excluding', 'filter out', 'out']
        query_lower = query.lower()
        
        # Check for exclude keywords
        for keyword in exclude_keywords:
            if keyword in query_lower:
                print(f"Found exclusion keyword: '{keyword}' in query")
                return True
        
        # Check for specific exclusion phrases
        exclusion_phrases = [
            r'filter\s+out',
            r'remove\s+.*',
            r'exclude\s+.*',
            r'without\s+.*',
            r'except\s+.*',
            r'all\s+(?:systems|components)?\s*except',
            r'everything\s+(?:but|except)'
        ]
        
        for phrase in exclusion_phrases:
            if re.search(phrase, query_lower):
                print(f"Found exclusion phrase pattern: '{phrase}' in query")
                return True
        
        return False
    
    async def filter_hierarchy_json(self, hierarchy_json: Dict[str, Any], query: str) -> Dict[str, Any]:
        """
        Filter the ReactFlow hierarchy JSON based on natural language query
        Maintains the original structure while filtering relevant content
        """
        # Extract system types from query
        target_system_types =await  self.extract_system_types_from_query(query)
        
        if not target_system_types:
            print(f"Warning: No system types found in query: '{query}'")
            return hierarchy_json
        
        print(f"Extracted system types: {target_system_types}")
        
        # Determine if we should include or exclude
        should_exclude =await self.should_exclude_system_type(query)
        print(f"Should exclude: {should_exclude}")
        
        # Create filtered copy
        filtered_json = {
            "nodes": [],
            "edges": [],
            "metadata": hierarchy_json["metadata"].copy()
        }
        
        # Track which nodes to keep
        nodes_to_keep = set()
        
        # Always keep ship node and systems collective node
        ship_nodes = [node for node in hierarchy_json["nodes"] if node["data"]["node_type"] == "ship"]
        systems_nodes = [node for node in hierarchy_json["nodes"] if node["data"]["node_type"] == "systems_collective"]
        
        for node in ship_nodes + systems_nodes:
            filtered_json["nodes"].append(node)
            nodes_to_keep.add(node["id"])
        
        # Filter system_type nodes based on query
        relevant_system_types = []
        for node in hierarchy_json["nodes"]:
            if node["data"]["node_type"] == "system_type":
                system_type = node["data"]["system_type"].lower()
                
                # Check if this system type matches our target types
                type_matches = any(target_type.lower() in system_type or 
                                 system_type in target_type.lower() or
                                 any(synonym in system_type for synonym in self.system_type_mappings.get(target_type, []))
                                 for target_type in target_system_types)
                
                # Include or exclude based on intent
                should_include_node = False
                if should_exclude:
                    # If excluding, include nodes that DON'T match
                    should_include_node = not type_matches
                else:
                    # If including, include nodes that DO match
                    should_include_node = type_matches
                
                if should_include_node:
                    filtered_json["nodes"].append(node)
                    nodes_to_keep.add(node["id"])
                    relevant_system_types.append(node["data"]["system_type"])
        
        # Filter component nodes (only include components of relevant system types)
        relevant_components = []
        for node in hierarchy_json["nodes"]:
            if node["data"]["node_type"] == "component":
                component_system_type = node["data"]["system_type"]
                if component_system_type in relevant_system_types:
                    filtered_json["nodes"].append(node)
                    nodes_to_keep.add(node["id"])
                    relevant_components.append(node["id"])
        
        # Filter edges (only include edges between kept nodes)
        for edge in hierarchy_json["edges"]:
            if edge["source"] in nodes_to_keep and edge["target"] in nodes_to_keep:
                filtered_json["edges"].append(edge)
        
        # Update metadata
        filtered_json["metadata"]["query"] = query
        filtered_json["metadata"]["extracted_system_types"] = target_system_types
        filtered_json["metadata"]["filtered_system_types"] = relevant_system_types
        filtered_json["metadata"]["total_nodes"] = len(filtered_json["nodes"])
        filtered_json["metadata"]["total_edges"] = len(filtered_json["edges"])
        filtered_json["metadata"]["hierarchy"] = {
            "ships": len([n for n in filtered_json["nodes"] if n["data"]["node_type"] == "ship"]),
            "systems": len([n for n in filtered_json["nodes"] if n["data"]["node_type"] == "systems_collective"]),
            "system_types": len([n for n in filtered_json["nodes"] if n["data"]["node_type"] == "system_type"]),
            "components": len([n for n in filtered_json["nodes"] if n["data"]["node_type"] == "component"])
        }
        
        print(f"Filtered results: {len(relevant_system_types)} system types, {len(relevant_components)} components")
        
        return filtered_json
    
    async def process_flow_query(self, hierarchy_json: Dict[str, Any], query: str) -> Dict[str, Any]:
        """
        Main method to process natural language query and return filtered JSON
        """
        print(f"Processing query: '{query}'")
        
        # Validate input
        if not hierarchy_json or "nodes" not in hierarchy_json:
            raise ValueError("Invalid hierarchy JSON format")
        
        # Filter the hierarchy
        filtered_result =await  self.filter_hierarchy_json(hierarchy_json, query)
        
        return filtered_result
