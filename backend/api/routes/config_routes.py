from fastapi import APIRouter, HTTPException, status
import logging

from api.models.mission_configuration import MissionConfiguration, MissionConfigurationCreate
from backend.api.db.dependencies import get_mission_conifg_repository



logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/Mission-configuration",
    tags=["Mission Configurations"]
)

# Initialize service
config_service = get_mission_conifg_repository()


@router.post(
    "/create",
    response_model=MissionConfiguration,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new Mission configuration",
    description="Create a new Mission configuration with the provided data"
)
async def create_Mission_configuration(
    config_data: MissionConfigurationCreate
) -> MissionConfiguration:
    """
    Create a new Mission configuration.
    
    Args:
        config_data: Mission configuration data
        
    Returns:
        Created Mission configuration
        
    Raises:
        HTTPException: If configuration creation fails
    """
    try:
        config = await config_service.create(config_data)
        return config
    except Exception as e:
        logger.error(f"Error creating Mission configuration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create Mission configuration: {str(e)}"
        )

@router.get(
    "/get_all_mission_configs",
    response_model=list[MissionConfiguration],
    summary="List all Mission configurations",
    description="Retrieve all Mission configurations"
)
async def list_Mission_configurations() -> list[MissionConfiguration]:
    """
    List all Mission configurations.
    
    Returns:
        List of Mission configurations
        
    Raises:
        HTTPException: If listing fails
    """
    try:
        configs = await config_service.get_all()
        return configs
    except Exception as e:
        logger.error(f"Error listing Mission configurations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list Mission configurations: {str(e)}"
        )

@router.get(
    "/{config_id}",
    response_model=MissionConfiguration,
    summary="Get Mission configuration by ID",
    description="Retrieve a specific Mission configuration by its ID"
)
async def get_Mission_configuration(config_id: str) -> MissionConfiguration:
    """
    Get a Mission configuration by ID.
    
    Args:
        config_id: Configuration ID
        
    Returns:
        Mission configuration
        
    Raises:
        HTTPException: If configuration not found
    """
    try:
        config = await config_service.get_by_id(config_id)
        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Mission configuration with ID {config_id} not found"
            )
        return config
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving Mission configuration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve Mission configuration: {str(e)}"
        )




@router.put(
    "/{config_id}",
    response_model=MissionConfiguration,
    summary="Update Mission configuration",
    description="Update an existing Mission configuration"
)
async def update_Mission_configuration(
    config_id: str,
    config_data: MissionConfigurationCreate
) -> MissionConfiguration:
    """
    Update a Mission configuration.
    
    Args:
        config_id: Configuration ID
        config_data: Updated configuration data
        
    Returns:
        Updated Mission configuration
        
    Raises:
        HTTPException: If configuration not found or update fails
    """
    try:
        config = await config_service.update(config_id, config_data)
        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Mission configuration with ID {config_id} not found"
            )
        return config
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating Mission configuration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update Mission configuration: {str(e)}"
        )


@router.delete(
    "/{config_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Mission configuration",
    description="Delete a Mission configuration by ID"
)
async def delete_Mission_configuration(config_id: str) -> None:
    """
    Delete a Mission configuration.
    
    Args:
        config_id: Configuration ID
        
    Raises:
        HTTPException: If configuration not found or deletion fails
    """
    try:
        success = await config_service.delete(config_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Mission configuration with ID {config_id} not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting Mission configuration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete Mission configuration: {str(e)}"
        )