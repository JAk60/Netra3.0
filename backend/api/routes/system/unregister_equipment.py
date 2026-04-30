"""
FastAPI router for equipment unregistration
File: backend/routers/unregister_equipment.py
"""
import logging
from uuid import UUID
from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, status, Depends

from api.models.unregister import (
    UnregisterEquipmentResult,
    UnregisterEquipmentRequest
)

from api.models.users import User
from auth.security import get_current_user
from api.db.dependencies import get_unregister_equipment_repository
from api.db.dependencies import get_unregister_equipment_repository
from api.db.repos.system.unregister_equipment import UnregisterEquipmentService_repo
from utils.nlpLayer.catalog_refresh import schedule_catalog_rebuild

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/equipment",
    tags=["Equipment Management"],
    # dependencies=[Depends(get_current_user)]  # Require authentication
)


@router.delete(
    "/unregister/{component_id}",
    response_model=UnregisterEquipmentResult,
    status_code=status.HTTP_200_OK,
    summary="Unregister Equipment",
    description="""
    Unregister (delete) equipment and all related data with cascade deletion.
    
    **This is a destructive operation that will delete:**
    - The component and all child components
    - All sensor readings and metadata
    - All failure modes
    - All ETL schedules, execution logs, and audit logs
    - All watchman audit logs
    - All overhaul metadata and readings
    - All RCM records
    - All reliability records (EtaBeta, AlphaBeta)
    
    **This operation is transactional** - if any deletion fails, all changes are rolled back.
    
    **Warning:** This action cannot be undone!
    """
)
async def unregister_equipment(
    component_id: UUID,
    request_body: UnregisterEquipmentRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    repo: UnregisterEquipmentService_repo = Depends(get_unregister_equipment_repository)
    # current_user: User = Depends(get_current_user)
) -> UnregisterEquipmentResult:
    """
    Unregister equipment with full cascade deletion
    
    Args:
        component_id: UUID of the component to delete
        request: Unregister request with confirmation flag
        current_user: Authenticated user making the request
    
    Returns:
        UnregisterEquipmentResult with deletion summary
    
    Raises:
        HTTPException 400: If confirmation flag is not set
        HTTPException 404: If component not found
        HTTPException 500: If deletion fails
    """
    try:
        # Safety check: require explicit confirmation
        if not request_body.confirm_deletion:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Deletion must be confirmed. Set confirm_deletion=true"
            )
        
        # Verify component_id matches request body
        if request_body.component_id != component_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Component ID in path does not match request body"
            )
        
        logger.info(
            # f"User {current_user.username} initiating unregistration "
            f"of component {component_id}"
        )
        
        # Execute unregistration
        result = await repo.unregister_equipment(
            component_id
        )
        
        logger.info(
            f"Successfully unregistered component {result.component_name} "
            f"(Total records deleted: {result.deletion_summary.total_records_deleted})"
        )
        
        schedule_catalog_rebuild(request, background_tasks)
        
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
        logger.error(f"Failed to unregister equipment: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unregister equipment: {str(e)}"
        )


@router.post(
    "/unregister",
    response_model=UnregisterEquipmentResult,
    status_code=status.HTTP_200_OK,
    summary="Unregister Equipment (Alternative)",
    description="Alternative endpoint using POST with component_id in request body"
)
async def unregister_equipment_post(
    request_body: UnregisterEquipmentRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    repo: UnregisterEquipmentService_repo = Depends(get_unregister_equipment_repository)
    # current_user: User = Depends(get_current_user)
) -> UnregisterEquipmentResult:
    """
    Alternative unregister endpoint using POST
    Useful for frontend forms that prefer POST over DELETE
    """
    try:
        if not request_body.confirm_deletion:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Deletion must be confirmed. Set confirm_deletion=true"
            )
        
        logger.info(
            # f"User {current_user.username} initiating unregistration "
            f"of component {request_body.component_id} (POST method)"
        )
        
        result = await repo.unregister_equipment(
            request_body.component_id
        )
        
        schedule_catalog_rebuild(request, background_tasks)
        
        return result
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Component {request_body.component_id} not found"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to unregister equipment: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unregister equipment: {str(e)}"
        )