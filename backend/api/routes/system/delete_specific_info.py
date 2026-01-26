"""
FastAPI router for deleting specific table data
File: backend/routers/delete_specific_info.py
"""
import logging
from uuid import UUID
from fastapi import APIRouter, HTTPException, status, Depends

from api.models.delete_specific import (
    DeleteSpecificInfoResult,
    DeleteSpecificInfoRequest,
    AvailableTablesResponse,
    TableType
)

from api.models.users import User
from auth.security import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/equipment",
    tags=["Equipment Management"],
    dependencies=[Depends(get_current_user)]
)


@router.get(
    "/{component_id}/tables",
    response_model=AvailableTablesResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Available Tables",
    description="Get list of all tables with record counts for a component"
)
async def get_available_tables(
    component_id: UUID,
    current_user: User = Depends(get_current_user)
) -> AvailableTablesResponse:
    """Get available tables and their record counts"""
    try:
        result = await delete_specific_info.get_available_tables(
            component_id
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Component {component_id} not found"
        )
    except Exception as e:
        logger.error(f"Failed to get available tables: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get available tables: {str(e)}"
        )


@router.delete(
    "/delete-specific/{component_id}",
    response_model=DeleteSpecificInfoResult,
    status_code=status.HTTP_200_OK,
    summary="Delete Specific Table Data",
    description="""
    Delete data from a specific table for a component.
    
    **This is a destructive operation that will delete:**
    - All records from the selected table for this component
    
    **Available tables:**
    - sensor_readings
    - sensor_metadata
    - failure_modes
    - etl_execution_logs
    - etl_execution_progress
    - etl_schedules
    - etl_audit_logs
    - watchman_audit_logs
    - overhaul_readings
    - overhaul_metadata
    - rcm_records
    - eta_beta_records
    - alpha_beta_records
    
    **This operation is transactional** - if deletion fails, changes are rolled back.
    
    **Warning:** This action cannot be undone!
    """
)
async def delete_specific_info(
    component_id: UUID,
    request: DeleteSpecificInfoRequest,
    current_user: User = Depends(get_current_user)
) -> DeleteSpecificInfoResult:
    """
    Delete specific table data for a component
    
    Args:
        component_id: UUID of the component
        request: Delete request with table type and confirmation
        current_user: Authenticated user
    
    Returns:
        DeleteSpecificInfoResult with deletion summary
    
    Raises:
        HTTPException 400: If confirmation flag is not set
        HTTPException 404: If component not found
        HTTPException 500: If deletion fails
    """
    try:
        # Safety check: require explicit confirmation
        if not request.confirm_deletion:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Deletion must be confirmed. Set confirm_deletion=true"
            )
        
        # Verify component_id matches request body
        if request.component_id != component_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Component ID in path does not match request body"
            )
        
        logger.info(
            f"User {current_user.username} deleting {request.table_type} data "
            f"for component {component_id}"
        )
        
        # Execute deletion
        result = await delete_specific_info.delete_specific_info(
            component_id, request.table_type
        )
        
        logger.info(
            f"Successfully deleted {result.records_deleted} records from "
            f"{result.table_type} for component {result.component_name}"
        )
        
        return result
        
    except ValueError as e:
        logger.error(f"Component not found: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Component {component_id} not found"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete specific info: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete specific info: {str(e)}"
        )


@router.post(
    "/delete-specific",
    response_model=DeleteSpecificInfoResult,
    status_code=status.HTTP_200_OK,
    summary="Delete Specific Table Data (Alternative)",
    description="Alternative endpoint using POST with component_id in request body"
)
async def delete_specific_info_post(
    request: DeleteSpecificInfoRequest,
    current_user: User = Depends(get_current_user)
) -> DeleteSpecificInfoResult:
    """Alternative delete specific endpoint using POST"""
    try:
        if not request.confirm_deletion:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Deletion must be confirmed. Set confirm_deletion=true"
            )
        
        logger.info(
            f"User {current_user.username} deleting {request.table_type} data "
            f"for component {request.component_id} (POST method)"
        )
        
        result = await delete_specific_info.delete_specific_info(
            request.component_id, request.table_type
        )
        
        return result
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Component {request.component_id} not found"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete specific info: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete specific info: {str(e)}"
        )