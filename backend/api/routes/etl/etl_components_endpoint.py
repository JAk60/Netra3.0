from fastapi import APIRouter, HTTPException, Depends, Query
from sqlmodel import Session, select
from typing import List, Optional
from uuid import UUID
import logging

from api.db.connection import get_session, get_srcdb_pointer
from api.models.systemconfiguration import SystemConfiguration, Ship, Department
from api.models.etl import ETLSchedule, ComponentETLInfo

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/etl", tags=["ETL Management"])


@router.get("/components", response_model=List[ComponentETLInfo])
async def get_components_by_filters(
    ship_id: UUID = Query(..., description="Ship ID"),
    department_id: UUID = Query(..., description="Department ID"),
    session: Session = Depends(get_session)
):
    """
    Get components with ETL info filtered by ship and department
    
    Returns component details with monthly_utilization and overhaul_readings schedules
    """
    try:
        # Query components with their schedules
        stmt = select(
            SystemConfiguration,
            Ship,
            Department
        ).join(
            Ship, SystemConfiguration.ship_id == Ship.ship_id
        ).join(
            Department, SystemConfiguration.department_id == Department.department_id
        ).where(
            SystemConfiguration.ship_id == ship_id,
            SystemConfiguration.department_id == department_id
        )
        
        results = session.exec(stmt).all()
        
        if not results:
            return []
        
        components_info = []
        
        for config, ship, department in results:
            # Get schedules for this component
            schedule_stmt = select(ETLSchedule).where(
                ETLSchedule.component_id == config.component_id
            )
            schedules = session.exec(schedule_stmt).all()
            
            # Create schedule map
            schedule_map = {s.etl_type: s for s in schedules}
            monthly_schedule = schedule_map.get('monthly_utilization')
            overhaul_schedule = schedule_map.get('overhaul_readings')
            
            components_info.append(ComponentETLInfo(
                component_id=config.component_id,
                component_name=config.component_name or "Unknown",
                nomenclature=config.nomenclature or "Unknown",
                ship_name=ship.ship_name,
                department_name=department.department_name,
                etl_enabled=bool(config.etl) if config.etl is not None else False,  # Handle NULL
                
                # Monthly Utilization
                monthly_last_sync=monthly_schedule.last_run_time if monthly_schedule else None,
                monthly_next_sync=monthly_schedule.next_run_time if monthly_schedule else None,
                monthly_status=monthly_schedule.status if monthly_schedule else "not_configured",
                
                # Overhaul Readings
                overhaul_last_sync=overhaul_schedule.last_run_time if overhaul_schedule else None,
                overhaul_next_sync=overhaul_schedule.next_run_time if overhaul_schedule else None,
                overhaul_status=overhaul_schedule.status if overhaul_schedule else "not_configured"
            ))
        
        return components_info
        
    except Exception as e:
        logger.error(f"Failed to get components: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/components/{component_id}/toggle")
async def toggle_etl(
    component_id: UUID,
    enable: bool = Query(..., description="Enable or disable ETL"),
    session: Session = Depends(get_session)
):
    """
    Enable or disable ETL for a component
    
    Updates the etl flag in system_configuration table
    """
    try:
        stmt = select(SystemConfiguration).where(
            SystemConfiguration.component_id == component_id
        )
        component = session.exec(stmt).first()
        
        if not component:
            raise HTTPException(status_code=404, detail="Component not found")
        
        component.etl = enable
        session.add(component)
        session.commit()
        session.refresh(component)
        
        logger.info(f"ETL {'enabled' if enable else 'disabled'} for component {component_id}")
        
        return {
            "success": True,
            "component_id": str(component_id),
            "etl_enabled": enable,
            "message": f"ETL {'enabled' if enable else 'disabled'} successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to toggle ETL: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/fetch_srcdb_data")
async def fetch_srcdb_data(
    session: Session = Depends(get_session)
):
    """
    Fetch data from the source database
    """
    try:
        # Get the source database connection pointer
        src_pointer = get_srcdb_pointer()
        srcquery = """
                    SELECT 
                        EquipmentName as component_name,
                        M_Equipment.EquipmentCode as CMMS_EquipmentCode,
                        ShipName as ship_name,
                        M_ShipCategory.ShipCategoryName as ship_category,
                        M_ShipClass.Description as ship_class,
                        CommandName as command,
                        M_Department.Description as department,
                        Nomenclature as nomenclature
                    FROM 
                        T_EquipmentShipDetail WITH(NOLOCK) 
                        INNER JOIN M_Equipment WITH(NOLOCK) ON T_EquipmentShipDetail.Universal_ID_M_Equipment = M_Equipment.Universal_ID_M_Equipment
                        INNER JOIN M_Ship WITH(NOLOCK) ON T_EquipmentShipDetail.Universal_ID_M_Ship = M_Ship.Universal_ID_M_Ship
                        INNER JOIN M_ShipClass WITH(NOLOCK) ON M_Ship.Universal_ID_M_ShipClass = M_ShipClass.Universal_ID_M_ShipClass
                        INNER JOIN M_ShipCategory WITH(NOLOCK) ON M_Ship.Universal_ID_M_ShipCategory = M_ShipCategory.Universal_ID_M_ShipCategory
                        INNER JOIN M_Command WITH(NOLOCK)  ON M_Ship.Universal_ID_M_Command = M_Command.Universal_ID_M_Command 
                        INNER JOIN M_Department WITH(NOLOCK) ON T_EquipmentShipDetail.Universal_ID_M_Department = M_Department.Universal_ID_M_Department
                    WHERE 
                        T_EquipmentShipDetail.Active = 1 
                        AND RemovalDate IS NULL """
        
        src_pointer.execute(srcquery)
        rows = src_pointer.fetchall()
        
        # Convert rows to list of dictionaries
        columns = [column[0] for column in src_pointer.description]
        data = [dict(zip(columns, row)) for row in rows]
        
        return {
            "success": True,
            "data": data
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch source database data: {e}")
        raise HTTPException(status_code=500, detail=str(e))