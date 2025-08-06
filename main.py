import json
import re
from typing import Dict, List, Any, Optional
import copy

from utils.nltk.component import extract_components
from utils.nltk.ship import extract_ships_from_message

class ShipComponentQuerySystem:
    def __init__(self, ship_data: Dict):
        """Initialize with ship data JSON"""
        self.ship_data = ship_data
    
    async def extract_query_intent(self, message: str) -> Dict[str, Any]:
        """Extract the intent and entities from the message"""
        message_lower = message.lower()
        
        intent_patterns = {
            'list_components': ['what components', 'which components', 'list components', 'show components', 'components in'],
            'component_details': ['details of', 'information about', 'tell me about', 'describe'],
            'system_info': ['system has', 'system contains', 'in system', 'system information'],
            'count_components': ['how many', 'count of', 'number of']
        }
        
        intent = 'general_query'
        for intent_type, patterns in intent_patterns.items():
            if any(pattern in message_lower for pattern in patterns):
                intent = intent_type
                break
        
        return {
            'intent': intent,
            'ships': await extract_ships_from_message(message),
            'components': await extract_components(message),
            'original_message': message
        }
    
    def should_include_system(self, system: Dict, requested_components: List[str]) -> bool:
        """Determine if a system should be included based on the query"""
        if not requested_components:
            return True  # Include all systems if no specific request
        
        # Check if system type is requested
        system_type = system.get('system_type')
        if system_type in requested_components:
            return True
        
        # Check if any component in this system is requested
        system_component_ids = system.get('has_components', [])
        if any(comp_id in requested_components for comp_id in system_component_ids):
            return True
        
        return False
    
    def should_include_component(self, component: Dict, requested_components: List[str]) -> bool:
        """Determine if a component should be included based on the query"""
        if not requested_components:
            return True  # Include all components if no specific request
        
        component_id = component.get('component_id')
        if component_id in requested_components:
            return True
        
        return False
    
    def filter_system_preserve_structure(self, system: Dict, requested_components: List[str]) -> Optional[Dict]:
        """Filter system while preserving the exact original structure"""
        if not self.should_include_system(system, requested_components):
            return None
        
        # Deep copy to avoid modifying original
        filtered_system = copy.deepcopy(system)
        
        # Filter components while preserving structure
        filtered_components = []
        filtered_component_ids = []
        
        # Handle case where 'components' might be None or missing
        components = system.get('components', [])
        if components is None:
            components = []
        
        for component in components:
            # If no specific components requested, include all from this system
            # OR if this system type was requested, include all its components
            # OR if this specific component was requested
            if (not requested_components or 
                system.get('system_type') in requested_components or
                self.should_include_component(component, requested_components)):
                
                filtered_components.append(component)
                component_id = component.get('component_id')
                if component_id:
                    filtered_component_ids.append(component_id)
        
        # Update the system with filtered components while preserving all other fields
        filtered_system['components'] = filtered_components
        filtered_system['has_components'] = filtered_component_ids
        filtered_system['total_components'] = len(filtered_components)
        filtered_system['root_components_count'] = len(filtered_components)  # Assuming all are root components
        
        return filtered_system
    
    async def process_natural_language_query(self, message: str) -> Dict[str, Any]:
        """
        Main function to process natural language query and return filtered JSON
        while preserving the EXACT original structure
        """
        
        # Extract query information
        query_data = await self.extract_query_intent(message)
        requested_components = query_data['components']
        
        # Handle case where extracted components might be None
        if requested_components is None:
            requested_components = []
        
        # Deep copy original data to avoid modifying it
        filtered_data = copy.deepcopy(self.ship_data)
        
        # Filter systems while preserving structure
        filtered_systems = []
        filtered_system_ids = []
        
        # Handle case where 'systems' might be None or missing
        systems = self.ship_data.get('systems', [])
        if systems is None:
            systems = []
        
        for system in systems:
            filtered_system = self.filter_system_preserve_structure(system, requested_components)
            if filtered_system:
                filtered_systems.append(filtered_system)
                system_id = system.get('system_id')
                if system_id:
                    filtered_system_ids.append(system_id)
        
        # Update top-level fields while preserving structure
        filtered_data['systems'] = filtered_systems
        filtered_data['has_systems'] = filtered_system_ids
        filtered_data['total_systems'] = len(filtered_systems)
        
        # Add query metadata without changing the core structure
        # This can be used by visualizers to understand what was filtered
        filtered_data['_query_metadata'] = {
            'original_query': message,
            'query_intent': query_data['intent'],
            'extracted_ships': query_data['ships'] or [],
            'extracted_components': query_data['components'] or [],
            'is_filtered': len(requested_components) > 0,
            'processing_timestamp': '2025-07-31T00:00:00Z'
        }
        
        return filtered_data

# Example usage showing structure preservation:
def main():
    # Example ship data (using the structure from your JSON)
    ship_data = {
  "ship_id": "33f13701-849f-4030-8d71-a0f65eac992e",
  "ship_name": "INS ONE",
  "ship_category": "DESTROYER AND FRIGATES",
  "ship_class": "KOLKATA (P-15A)",
  "total_systems": 4,
  "has_systems": [
    "64044bde-5b46-4ab3-b44d-2d140833284b",
    "017bdf6b-d9f2-4f31-869d-842ad61a9627",
    "6b3a59eb-4cc2-4480-b512-9357aed35540",
    "a2b3e95b-c3b8-43ce-af79-eb445794f7ab"
  ],
  "systems": [
    {
      "system_id": "64044bde-5b46-4ab3-b44d-2d140833284b",
      "system_type": "propulsion",
      "created_date": "2025-07-30T15:29:54.093000",
      "total_components": 4,
      "root_components_count": 4,
      "belongs_to_ship": "33f13701-849f-4030-8d71-a0f65eac992e",
      "has_components": [
        "5358d044-9f4f-44cf-a975-341221f7189d",
        "ab055ca1-2aa1-4c55-a1b1-39ead450a131",
        "8e7c0c15-f44e-42be-bbf4-e04a62fc242e",
        "da570729-9a1e-4fa1-8399-e21c93c46e8f"
      ],
      "system_type_shared_with_systems": [],
      "components": [
        {
          "component_id": "5358d044-9f4f-44cf-a975-341221f7189d",
          "component_name": "Gas Turbine",
          "department_id": "67eb0464-d025-42be-8049-240f17c1aa83",
          "parent_id": None,
          "CMMS_EquipmentCode": None,
          "is_lmu": 1,
          "parent_name": None,
          "nomenclature": "GT 1",
          "etl": False,
          "created_date": "2025-07-14T09:54:15.823000",
          "modified_date": "2025-07-14T09:54:15.823000",
          "belongs_to_system": "64044bde-5b46-4ab3-b44d-2d140833284b",
          "has_children": [],
          "is_child_of": None,
          "has_descendants": [],
          "is_root_component": True,
          "child_count": 0,
          "descendant_count": 0,
          "children": []
        },
        {
          "component_id": "ab055ca1-2aa1-4c55-a1b1-39ead450a131",
          "component_name": "Gas Turbine",
          "department_id": "67eb0464-d025-42be-8049-240f17c1aa83",
          "parent_id": None,
          "CMMS_EquipmentCode": None,
          "is_lmu": 1,
          "parent_name": None,
          "nomenclature": "GT 3",
          "etl": False,
          "created_date": "2025-07-14T09:54:15.843000",
          "modified_date": "2025-07-14T09:54:15.843000",
          "belongs_to_system": "64044bde-5b46-4ab3-b44d-2d140833284b",
          "has_children": [],
          "is_child_of": None,
          "has_descendants": [],
          "is_root_component": True,
          "child_count": 0,
          "descendant_count": 0,
          "children": []
        },
        {
          "component_id": "8e7c0c15-f44e-42be-bbf4-e04a62fc242e",
          "component_name": "Gas Turbine",
          "department_id": "67eb0464-d025-42be-8049-240f17c1aa83",
          "parent_id": None,
          "CMMS_EquipmentCode": None,
          "is_lmu": 1,
          "parent_name": None,
          "nomenclature": "GT 4",
          "etl": False,
          "created_date": "2025-07-14T09:54:15.853000",
          "modified_date": "2025-07-14T09:54:15.853000",
          "belongs_to_system": "64044bde-5b46-4ab3-b44d-2d140833284b",
          "has_children": [],
          "is_child_of": None,
          "has_descendants": [],
          "is_root_component": True,
          "child_count": 0,
          "descendant_count": 0,
          "children": []
        },
        {
          "component_id": "da570729-9a1e-4fa1-8399-e21c93c46e8f",
          "component_name": "Gas Turbine",
          "department_id": "67eb0464-d025-42be-8049-240f17c1aa83",
          "parent_id": None,
          "CMMS_EquipmentCode": None,
          "is_lmu": 1,
          "parent_name": None,
          "nomenclature": "GT 2",
          "etl": False,
          "created_date": "2025-07-14T09:54:15.833000",
          "modified_date": "2025-07-14T09:54:15.833000",
          "belongs_to_system": "64044bde-5b46-4ab3-b44d-2d140833284b",
          "has_children": [],
          "is_child_of": None,
          "has_descendants": [],
          "is_root_component": True,
          "child_count": 0,
          "descendant_count": 0,
          "children": []
        }
      ]
    },
    {
      "system_id": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
      "system_type": "power_generation",
      "created_date": "2025-07-30T15:29:54.093000",
      "total_components": 4,
      "root_components_count": 4,
      "belongs_to_ship": "33f13701-849f-4030-8d71-a0f65eac992e",
      "has_components": [
        "443360a0-6218-486b-a34c-1813963177b7",
        "5eefd3c9-cbe0-48db-a43d-89247f46ed8a",
        "1872dfb4-58f9-48d4-a713-953cd7e1048a",
        "c652b6b3-9d13-4e4d-833e-dd71aecd102b"
      ],
      "system_type_shared_with_systems": [],
      "components": [
        {
          "component_id": "443360a0-6218-486b-a34c-1813963177b7",
          "component_name": "Generator",
          "department_id": "67eb0464-d025-42be-8049-240f17c1aa83",
          "parent_id": None,
          "CMMS_EquipmentCode": None,
          "is_lmu": 1,
          "parent_name": None,
          "nomenclature": "GTG 1",
          "etl": False,
          "created_date": "2025-07-14T09:54:15.860000",
          "modified_date": "2025-07-14T09:54:15.860000",
          "belongs_to_system": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
          "has_children": [],
          "is_child_of": None,
          "has_descendants": [],
          "is_root_component": True,
          "child_count": 0,
          "descendant_count": 0,
          "children": []
        },
        {
          "component_id": "5eefd3c9-cbe0-48db-a43d-89247f46ed8a",
          "component_name": "Generator",
          "department_id": "67eb0464-d025-42be-8049-240f17c1aa83",
          "parent_id": None,
          "CMMS_EquipmentCode": None,
          "is_lmu": 1,
          "parent_name": None,
          "nomenclature": "GTG 3",
          "etl": False,
          "created_date": "2025-07-14T09:54:15.880000",
          "modified_date": "2025-07-14T09:54:15.880000",
          "belongs_to_system": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
          "has_children": [],
          "is_child_of": None,
          "has_descendants": [],
          "is_root_component": True,
          "child_count": 0,
          "descendant_count": 0,
          "children": []
        },
        {
          "component_id": "1872dfb4-58f9-48d4-a713-953cd7e1048a",
          "component_name": "Generator",
          "department_id": "67eb0464-d025-42be-8049-240f17c1aa83",
          "parent_id": None,
          "CMMS_EquipmentCode": None,
          "is_lmu": 1,
          "parent_name": None,
          "nomenclature": "GTG 4",
          "etl": False,
          "created_date": "2025-07-14T09:54:15.887000",
          "modified_date": "2025-07-14T09:54:15.887000",
          "belongs_to_system": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
          "has_children": [],
          "is_child_of": None,
          "has_descendants": [],
          "is_root_component": True,
          "child_count": 0,
          "descendant_count": 0,
          "children": []
        },
        {
          "component_id": "c652b6b3-9d13-4e4d-833e-dd71aecd102b",
          "component_name": "Generator",
          "department_id": "67eb0464-d025-42be-8049-240f17c1aa83",
          "parent_id": None,
          "CMMS_EquipmentCode": None,
          "is_lmu": 1,
          "parent_name": None,
          "nomenclature": "GTG 2",
          "etl": False,
          "created_date": "2025-07-14T09:54:15.873000",
          "modified_date": "2025-07-14T09:54:15.873000",
          "belongs_to_system": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
          "has_children": [],
          "is_child_of": None,
          "has_descendants": [],
          "is_root_component": True,
          "child_count": 0,
          "descendant_count": 0,
          "children": []
        }
      ]
    },
    {
      "system_id": "6b3a59eb-4cc2-4480-b512-9357aed35540",
      "system_type": "support",
      "created_date": "2025-07-30T15:29:54.093000",
      "total_components": 6,
      "root_components_count": 6,
      "belongs_to_ship": "33f13701-849f-4030-8d71-a0f65eac992e",
      "has_components": [
        "308804ec-bca2-45e9-b665-515de88ffa70",
        "38093be3-acb7-40db-80ec-542dfc8d5d7d",
        "6493cf2d-16e8-4d8f-b25c-a700e2c184b0",
        "73c2a73c-0e92-4742-9775-af95e89e1841",
        "73e87156-1ff9-494e-9f7f-f0fdad5f4a20",
        "d10aa05d-1f80-436d-b612-f52e28c44676"
      ],
      "system_type_shared_with_systems": [],
      "components": [
        {
          "component_id": "308804ec-bca2-45e9-b665-515de88ffa70",
          "component_name": "Air Conditioner",
          "department_id": "5ddd9800-d8ab-4e22-a1de-ae7ad5dfd432",
          "parent_id": None,
          "CMMS_EquipmentCode": None,
          "is_lmu": 1,
          "parent_name": None,
          "nomenclature": "AC 6",
          "etl": False,
          "created_date": "2025-07-14T09:54:15.903000",
          "modified_date": "2025-07-14T09:54:15.903000",
          "belongs_to_system": "6b3a59eb-4cc2-4480-b512-9357aed35540",
          "has_children": [],
          "is_child_of": None,
          "has_descendants": [],
          "is_root_component": True,
          "child_count": 0,
          "descendant_count": 0,
          "children": []
        },
        {
          "component_id": "38093be3-acb7-40db-80ec-542dfc8d5d7d",
          "component_name": "Air Conditioner",
          "department_id": "5ddd9800-d8ab-4e22-a1de-ae7ad5dfd432",
          "parent_id": None,
          "CMMS_EquipmentCode": None,
          "is_lmu": 1,
          "parent_name": None,
          "nomenclature": "AC 4",
          "etl": False,
          "created_date": "2025-07-14T09:54:15.813000",
          "modified_date": "2025-07-14T09:54:15.813000",
          "belongs_to_system": "6b3a59eb-4cc2-4480-b512-9357aed35540",
          "has_children": [],
          "is_child_of": None,
          "has_descendants": [],
          "is_root_component": True,
          "child_count": 0,
          "descendant_count": 0,
          "children": []
        },
        {
          "component_id": "6493cf2d-16e8-4d8f-b25c-a700e2c184b0",
          "component_name": "Air Conditioner",
          "department_id": "5ddd9800-d8ab-4e22-a1de-ae7ad5dfd432",
          "parent_id": None,
          "CMMS_EquipmentCode": None,
          "is_lmu": 1,
          "parent_name": None,
          "nomenclature": "AC 5",
          "etl": False,
          "created_date": "2025-07-14T09:54:15.897000",
          "modified_date": "2025-07-14T09:54:15.897000",
          "belongs_to_system": "6b3a59eb-4cc2-4480-b512-9357aed35540",
          "has_children": [],
          "is_child_of": None,
          "has_descendants": [],
          "is_root_component": True,
          "child_count": 0,
          "descendant_count": 0,
          "children": []
        },
        {
          "component_id": "73c2a73c-0e92-4742-9775-af95e89e1841",
          "component_name": "Air Conditioner",
          "department_id": "5ddd9800-d8ab-4e22-a1de-ae7ad5dfd432",
          "parent_id": None,
          "CMMS_EquipmentCode": None,
          "is_lmu": 1,
          "parent_name": None,
          "nomenclature": "AC 3",
          "etl": False,
          "created_date": "2025-07-14T09:54:15.803000",
          "modified_date": "2025-07-14T09:54:15.803000",
          "belongs_to_system": "6b3a59eb-4cc2-4480-b512-9357aed35540",
          "has_children": [],
          "is_child_of": None,
          "has_descendants": [],
          "is_root_component": True,
          "child_count": 0,
          "descendant_count": 0,
          "children": []
        },
        {
          "component_id": "73e87156-1ff9-494e-9f7f-f0fdad5f4a20",
          "component_name": "Air Conditioner",
          "department_id": "5ddd9800-d8ab-4e22-a1de-ae7ad5dfd432",
          "parent_id": None,
          "CMMS_EquipmentCode": None,
          "is_lmu": 1,
          "parent_name": None,
          "nomenclature": "AC 2",
          "etl": False,
          "created_date": "2025-07-14T09:54:15.793000",
          "modified_date": "2025-07-14T09:54:15.793000",
          "belongs_to_system": "6b3a59eb-4cc2-4480-b512-9357aed35540",
          "has_children": [],
          "is_child_of": None,
          "has_descendants": [],
          "is_root_component": True,
          "child_count": 0,
          "descendant_count": 0,
          "children": []
        },
        {
          "component_id": "d10aa05d-1f80-436d-b612-f52e28c44676",
          "component_name": "Air Conditioner",
          "department_id": "5ddd9800-d8ab-4e22-a1de-ae7ad5dfd432",
          "parent_id": None,
          "CMMS_EquipmentCode": None,
          "is_lmu": 1,
          "parent_name": None,
          "nomenclature": "AC 1",
          "etl": False,
          "created_date": "2025-07-14T09:54:15.723000",
          "modified_date": "2025-07-14T09:54:15.723000",
          "belongs_to_system": "6b3a59eb-4cc2-4480-b512-9357aed35540",
          "has_children": [],
          "is_child_of": None,
          "has_descendants": [],
          "is_root_component": True,
          "child_count": 0,
          "descendant_count": 0,
          "children": []
        }
      ]
    },
    {
      "system_id": "a2b3e95b-c3b8-43ce-af79-eb445794f7ab",
      "system_type": "firing",
      "created_date": "2025-07-30T15:29:54.093000",
      "total_components": 2,
      "root_components_count": 2,
      "belongs_to_ship": "33f13701-849f-4030-8d71-a0f65eac992e",
      "has_components": [
        "1c16dacf-69cd-4061-b004-113d85948c61",
        "db30946a-2baf-49e4-9ceb-ec72365089b4"
      ],
      "system_type_shared_with_systems": [],
      "components": [
        {
          "component_id": "1c16dacf-69cd-4061-b004-113d85948c61",
          "component_name": "Missile",
          "department_id": "5ddd9800-d8ab-4e22-a1de-ae7ad5dfd432",
          "parent_id": None,
          "CMMS_EquipmentCode": None,
          "is_lmu": 1,
          "parent_name": None,
          "nomenclature": "BrahMos",
          "etl": False,
          "created_date": "2025-07-14T09:54:15.920000",
          "modified_date": "2025-07-14T09:54:15.920000",
          "belongs_to_system": "a2b3e95b-c3b8-43ce-af79-eb445794f7ab",
          "has_children": [],
          "is_child_of": None,
          "has_descendants": [],
          "is_root_component": True,
          "child_count": 0,
          "descendant_count": 0,
          "children": []
        },
        {
          "component_id": "db30946a-2baf-49e4-9ceb-ec72365089b4",
          "component_name": "Super Rapid Gun Mount",
          "department_id": "5ddd9800-d8ab-4e22-a1de-ae7ad5dfd432",
          "parent_id": None,
          "CMMS_EquipmentCode": None,
          "is_lmu": 1,
          "parent_name": None,
          "nomenclature": "SRGM 1",
          "etl": False,
          "created_date": "2025-07-14T09:54:15.910000",
          "modified_date": "2025-07-14T09:54:15.910000",
          "belongs_to_system": "a2b3e95b-c3b8-43ce-af79-eb445794f7ab",
          "has_children": [],
          "is_child_of": None,
          "has_descendants": [],
          "is_root_component": True,
          "child_count": 0,
          "descendant_count": 0,
          "children": []
        }
      ]
    }
  ]
}
    
    # Initialize the query system
    query_system = ShipComponentQuerySystem(ship_data)
    
    # Example queries
    test_queries = [
        # "What components does propulsion system have in INS ONE?",
        # "Show me all generators in INS ONE",
        # "Tell me about GT 1 component",
        # "What firing systems does the ship have?"
        "what is the reliability of the propulsion system in INS TWO?",
        # "how many components are there in the power generation system of INS TWO?",
        # "list all components in the support system of INS TWO",
        # "give me details about the firing system in INS TWO",
        # "how many air conditioners are there in INS TWO?",
        # "what is the total number of components in the propulsion system of INS TWO?",
        # "show me the components in the propulsion system of INS TWO",
    ]
    
    print("Structure-Preserving Ship Component Query System:")
    print("=" * 60)
    
    for query in test_queries:
        print(f"\nQuery: {query}")
        result = query_system.process_natural_language_query(query)
        print(json.dumps(result, indent=2))
        # Show that structure is preserved
        print(f"Original structure preserved: {type(result).__name__}")
        print(f"Has ship_id: {'ship_id' in result}")
        print(f"Has ship_name: {'ship_name' in result}")
        print(f"Has systems array: {'systems' in result and isinstance(result['systems'], list)}")
        print(f"Filtered systems count: {result.get('total_systems', 0)}")
        print(f"Query metadata available: {'_query_metadata' in result}")
        
        # You can still access all original fields
        if result.get('systems'):
            first_system = result['systems'][0]
            print(f"First system has original fields: {list(first_system.keys())}")
        
        print("-" * 30)

if __name__ == "__main__":
    main()
