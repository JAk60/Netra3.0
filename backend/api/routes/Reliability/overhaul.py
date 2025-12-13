from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, HTTPException, status
import logging

from api.db.dependencies import get_overhaul_metadata_repo, get_overhaul_readings_repo
from api.models.Overhaul import OverhaulMetadataCreate, OverhaulMetadataResponse, OverhaulReadingsCreate, OverhaulReadingsResponse


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/overhaul", tags=["Overhaul Management"])

# Initialize services
metadata_service = get_overhaul_metadata_repo()
readings_service = get_overhaul_readings_repo()


# ============= Overhaul Metadata Endpoints =============

@router.post(
    "/metadata",
    response_model=OverhaulMetadataResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Overhaul Metadata"
)
async def create_overhaul_metadata(
    metadata_data: OverhaulMetadataCreate
):
    """
    Create a new overhaul metadata record for a component.
    
    - **component_id**: UUID of the component
    - **overhaul_frequency_hours**: Hours between overhauls
    - **total_overhaul_events**: Total number of overhauls performed
    - **last_overhaul_date**: Optional date of last overhaul (ISO format)
    """
    try:
        metadata = await metadata_service.create(metadata_data)
        return metadata
    except Exception as e:
        logger.error(f"Error creating overhaul metadata: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create overhaul metadata: {str(e)}"
        )


# ============= Overhaul Readings Endpoints =============

@router.post(
    "/readings",
    response_model=OverhaulReadingsResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Overhaul Reading"
)
async def create_overhaul_reading(
    readings_data: OverhaulReadingsCreate
):
    """
    Create a new overhaul reading record for a component.
    
    - **component_id**: UUID of the component
    - **maintenance_type**: Type of maintenance performed
    - **defect_date**: Date when defect was identified
    - **cmms_running_age**: CMMS recorded running age
    - **running_age**: Actual running age
    """
    try:
        reading = await readings_service.create(readings_data)
        return reading
    except Exception as e:
        logger.error(f"Error creating overhaul reading: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create overhaul reading: {str(e)}"
        )


@router.get("/", response_model=List[dict])
async def get_all_overhaul_metadata(
    ship_id: Optional[UUID] = None
):
    """
    Get all overhaul metadata records filtered by ship.
    
    Args:
        ship_id: Optional filter by ship ID (filters through system_configuration table)
        session: Database session
    
    Returns:
        List of overhaul metadata records for the specified ship
    """
    try:
        metadata_list = await metadata_service.get_all(ship_id=ship_id)
        return metadata_list
    except Exception as e:
        logger.error(f"Error fetching overhaul metadata: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch overhaul metadata: {str(e)}"
        )
# ============= Health Check =============

@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Health Check"
)
async def health_check():
    """Check if the overhaul service is running"""
    return {
        "status": "healthy",
        "service": "Overhaul Management",
        "endpoints": {
            "metadata": "/overhaul/metadata",
            "readings": "/overhaul/readings"
        }
    }