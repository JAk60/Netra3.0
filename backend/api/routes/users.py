# routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from api.models import User, UserRead, UserRole, UserUpdate
from auth.security import get_current_active_user, require_role
from api.db.dependencies import get_user_repository
from api.db.repositories import UserRepository
from backend.api.db.dependencies import get_alpha_beta_repository, get_monthly_utilization_repository
from mission_configuration.mission_configuration import MissionReliabilityCalculator

router = APIRouter(prefix="/users", tags=["Users"])
@router.get("/", response_model=List[UserRead])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_role("admin")),
    user_repo: UserRepository = Depends(get_user_repository)
):
    users = await user_repo.get_users(skip, limit)
    return users

@router.get("/{user_id}", response_model=UserRead)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    user_repo: UserRepository = Depends(get_user_repository)
):
    # Users can only view their own profile unless they're admin
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = await user_repo.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@router.put("/{user_id}", response_model=UserRead)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    user_repo: UserRepository = Depends(get_user_repository)
):
    # Users can only update their own profile unless they're admin
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = await user_repo.update_user(user_id, user_update)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(require_role("admin")),
    user_repo: UserRepository = Depends(get_user_repository)
):
    success = await user_repo.delete_user(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "User deleted successfully"}

# Router instance
router = APIRouter(prefix="/api/mission-reliability", tags=["Mission Reliability"])
alpha_beta_repo = get_alpha_beta_repository()
utilization_repo = get_monthly_utilization_repository()  # or whatever your utilization repo class is

calculator = MissionReliabilityCalculator(
    alpha_beta_repo,
    utilization_repo
)
@router.get("/calculate")
async def calculate_mission_reliability():
    """
    Calculate mission reliability using predefined dummy data.
    Simply hit this endpoint to get the mission reliability result.
    """
    try:
        # Hardcoded mission config (your dummy data)
        mission_config =  {
  "config_id": "a76d41ec-72db-4829-b4e4-6f3234de89ef",
  "config_name": "HAction",
  "ship_id": "33f13701-849f-4030-8d71-a0f65eac992e",
  "ship_name": "INS ONE",
  "total_duration": 70,
  "created_at": "2025-11-29T13:43:09.790Z",
  "phases": [
    {
      "phase_name": "Harbour",
      "duration_hours": 10,
      "sequence_order": 0,
      "propulsion": {
        "k": 1,
        "n": 2
      },
      "power_generation": {
        "k": 1,
        "n": 2
      },
      "support": {
        "k": 2,
        "n": 4
      },
      "firing": {
        "k": 0,
        "n": 2
      }
    },
    {
      "phase_name": "Action",
      "duration_hours": 50,
      "sequence_order": 1,
      "propulsion": {
        "k": 1,
        "n": 2
      },
      "power_generation": {
        "k": 1,
        "n": 2
      },
      "support": {
        "k": 1,
        "n": 4
      },
      "firing": {
        "k": 1,
        "n": 2
      }
    },
    {
      "phase_name": "Harbour",
      "duration_hours": 10,
      "sequence_order": 2,
      "propulsion": {
        "k": 1,
        "n": 2
      },
      "power_generation": {
        "k": 1,
        "n": 2
      },
      "support": {
        "k": 2,
        "n": 4
      },
      "firing": {
        "k": 0,
        "n": 2
      }
    }
  ],
  "systems": {
    "propulsion": {
      "system_id": "64044bde-5b46-4ab3-b44d-2d140833284b",
      "selected_equipment": [
        {
          "component_id": "5358d044-9f4f-44cf-a975-341221f7189d",
          "name": "Gas Turbine",
          "nomenclature": "GT 1"
        },
        {
          "component_id": "ab055ca1-2aa1-4c55-a1b1-39ead450a131",
          "name": "Gas Turbine",
          "nomenclature": "GT 3"
        }
      ]
    },
    "power_generation": {
      "system_id": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
      "selected_equipment": [
        {
          "component_id": "443360a0-6218-486b-a34c-1813963177b7",
          "name": "Generator",
          "nomenclature": "GTG 1"
        },
        {
          "component_id": "5eefd3c9-cbe0-48db-a43d-89247f46ed8a",
          "name": "Generator",
          "nomenclature": "GTG 3"
        }
      ]
    },
    "support": {
      "system_id": "6b3a59eb-4cc2-4480-b512-9357aed35540",
      "selected_equipment": [
        {
          "component_id": "308804ec-bca2-45e9-b665-515de88ffa70",
          "name": "Air Conditioner",
          "nomenclature": "AC 6"
        },
        {
          "component_id": "38093be3-acb7-40db-80ec-542dfc8d5d7d",
          "name": "Air Conditioner",
          "nomenclature": "AC 4"
        },
        {
          "component_id": "6493cf2d-16e8-4d8f-b25c-a700e2c184b0",
          "name": "Air Conditioner",
          "nomenclature": "AC 5"
        },
        {
          "component_id": "73c2a73c-0e92-4742-9775-af95e89e1841",
          "name": "Air Conditioner",
          "nomenclature": "AC 3"
        }
      ]
    },
    "firing": {
      "system_id": "a2b3e95b-c3b8-43ce-af79-eb445794f7ab",
      "selected_equipment": [
        {
          "component_id": "1c16dacf-69cd-4061-b004-113d85948c61",
          "name": "Missile",
          "nomenclature": "BrahMos"
        },
        {
          "component_id": "db30946a-2baf-49e4-9ceb-ec72365089b4",
          "name": "Super Rapid Gun Mount",
          "nomenclature": "SRGM 1"
        }
      ]
    }
  }
}



        
        # Calculate mission reliability
        result = await calculator.calculate(mission_config)
        
        # Return the result
        if result['success']:
            return {
                "success": True,
                "message": "Mission reliability calculated successfully",
                "data": result['data']
            }
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"Calculation failed: {result.get('error', 'Unknown error')}"
            )
    
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error: {str(e)}"
        )