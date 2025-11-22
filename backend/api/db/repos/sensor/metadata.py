from collections import defaultdict
import sys

from api.models.systemconfiguration import SystemConfiguration
sys.path.append('..')
from typing import List, Optional
from uuid import UUID
from sqlmodel import Session, select
from api.models.sensor import (
    FailureMode, FailureModeDetailResponse, FailureModesAnalysisResponse, SensorDetailResponse, 
    SensorMetadata, SensorMetadataCreate, SensorMetadataUpdate
)
from api.db.connection import get_session_context, get_async_db_service
from typing import Dict, Tuple


class SensorRepository:
    def __init__(self, session: Session, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()

    def _create_sensor_sync(self, session: Session, sensor_data: SensorMetadataCreate) -> SensorMetadata:
        """Synchronous sensor creation"""
        
        statement = select(SensorMetadata).where(
            SensorMetadata.sensor_name == sensor_data.sensor_name,
            SensorMetadata.component_id == sensor_data.component_id
        )
        existing_sensor = session.exec(statement).first()
        
        if existing_sensor:
            raise ValueError(
                f"Sensor with name '{sensor_data.sensor_name}' already exists for this component"
            )
        
        # Validate failure_mode_id exists if provided
        if sensor_data.failure_mode_id:
            failure_mode = session.get(FailureMode, sensor_data.failure_mode_id)
            if not failure_mode:
                raise ValueError(f"Failure mode with ID {sensor_data.failure_mode_id} not found")
        
        # Create sensor - sensor_id will be auto-generated
        sensor = SensorMetadata(**sensor_data.model_dump(exclude_unset=True))
        session.add(sensor)
        session.commit()
        session.refresh(sensor)
        return sensor

    async def create_sensor(self, sensor_data: SensorMetadataCreate) -> SensorMetadata:
        """Async sensor creation"""
        def _create():
            with get_session_context() as session:
                return self._create_sensor_sync(session, sensor_data)

        return await self.async_service.run_in_thread(_create)
    def _get_sensors_sync(self, session: Session, skip: int = 0, limit: int = 100) -> List[SensorMetadata]:
        """Synchronous sensor listing"""
        statement = select(SensorMetadata).offset(skip).limit(limit)
        return session.exec(statement).all()

    async def get_sensors(self, skip: int = 0, limit: int = 100) -> List[SensorMetadata]:
        """Async sensor listing"""
        def _get():
            with get_session_context() as session:
                return self._get_sensors_sync(session, skip, limit)

        return await self.async_service.run_in_thread(_get)

    def _get_sensor_by_id_sync(self, session: Session, sensor_id: str) -> Optional[SensorMetadata]:
        """Synchronous sensor retrieval by ID"""
        return session.get(SensorMetadata, sensor_id)

    async def get_sensor_by_id(self, sensor_id: str) -> Optional[SensorMetadata]:
        """Async sensor retrieval by ID"""
        def _get():
            with get_session_context() as session:
                return self._get_sensor_by_id_sync(session, sensor_id)

        return await self.async_service.run_in_thread(_get)
    
    def _get_sensorid_by_name_sync(self, session: Session, sensor_name: str, component_id: UUID) -> Optional[UUID]:
        """Synchronous sensor retrieval by ID"""
        statement = select(SensorMetadata.sensor_id).where(
            (SensorMetadata.component_id == component_id) & 
            (SensorMetadata.sensor_name == sensor_name)
        )
        result = session.exec(statement).first()  # Get single result
        return result  # Returns UUID or None

    async def get_sensorid_by_name(self, sensor_name: str, component_id: UUID) -> Optional[UUID]:
        """Async sensor retrieval by ID"""
        def _get():
            with get_session_context() as session:
                return self._get_sensorid_by_name_sync(session, sensor_name, component_id)

        return await self.async_service.run_in_thread(_get)
    
    def _get_sensor_minmax_by_id_sync(self, session: Session, sensor_id: UUID)-> Optional[Tuple[float, float,str]]:
        """Synchronous sensor retrieval by ID"""
        statement = select(SensorMetadata.min_value,SensorMetadata.max_value,SensorMetadata.unit).where(
            (SensorMetadata.sensor_id == sensor_id)
        )
        result = session.exec(statement).first()  # Get single result
        return result  # Returns UUID or None

    async def get_sensor_minmax_by_id(self, sensor_id: UUID)-> Optional[Tuple[float, float,str]]:
        """Async sensor retrieval by ID"""
        def _get():
            with get_session_context() as session:
                return self._get_sensor_minmax_by_id_sync(session,sensor_id)

        return await self.async_service.run_in_thread(_get)
    
    def _get_sensor_pf_by_id_sync(self, session: Session, sensor_id: UUID)-> Optional[Tuple[float, float]]:
        """Synchronous sensor retrieval by ID"""
        statement = select(SensorMetadata.P,SensorMetadata.F).where(
            (SensorMetadata.sensor_id == sensor_id)
        )
        result = session.exec(statement).first()  # Get single result
        return result  # Returns UUID or None

    async def get_sensor_pf_by_id(self, sensor_id: UUID)-> Optional[Tuple[float, float]]:
        """Async sensor retrieval by ID"""
        def _get():
            with get_session_context() as session:
                return self._get_sensor_pf_by_id_sync(session,sensor_id)

        return await self.async_service.run_in_thread(_get)

    def _get_sensors_by_component_sync(self, session: Session, component_id: str) -> List[SensorMetadata]:
        """Synchronous sensors by component"""
        statement = select(SensorMetadata).where(
            SensorMetadata.component_id == component_id)
        return session.exec(statement).all()

    async def get_sensors_by_component(self, component_id: str) -> List[SensorMetadata]:
        """Async sensors by component"""
        def _get():
            with get_session_context() as session:
                return self._get_sensors_by_component_sync(session, component_id)

        return await self.async_service.run_in_thread(_get)

    def _update_sensor_sync(self, session: Session, sensor_id: str, sensor_update: SensorMetadataUpdate) -> Optional[SensorMetadata]:
        """Synchronous sensor update"""
        sensor = session.get(SensorMetadata, sensor_id)
        if not sensor:
            return None

        update_data = sensor_update.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(sensor, key, value)

        session.add(sensor)
        session.commit()
        session.refresh(sensor)
        return sensor

    async def update_sensor(self, sensor_id: str, sensor_update: SensorMetadataUpdate) -> Optional[SensorMetadata]:
        """Async sensor update"""
        def _update():
            with get_session_context() as session:
                return self._update_sensor_sync(session, sensor_id, sensor_update)

        return await self.async_service.run_in_thread(_update)

    def _delete_sensor_sync(self, session: Session, sensor_id: str) -> bool:
        """Synchronous sensor deletion"""
        sensor = session.get(SensorMetadata, sensor_id)
        if not sensor:
            return False

        session.delete(sensor)
        session.commit()
        return True

    async def delete_sensor(self, sensor_id: str) -> bool:
        """Async sensor deletion"""
        def _delete():
            with get_session_context() as session:
                return self._delete_sensor_sync(session, sensor_id)

        return await self.async_service.run_in_thread(_delete)


    def _get_sensors_grouped_by_component_sync(self, session: Session) -> Dict[str, List[str]]:
        """Synchronous get sensors grouped by component"""
        # Join SystemConfiguration with SensorMetadata
        statement = (
            select(SystemConfiguration.component_name, SensorMetadata.sensor_name)
            .join(SensorMetadata, SystemConfiguration.component_id == SensorMetadata.component_id)
            .order_by(SystemConfiguration.component_name, SensorMetadata.sensor_name)
        )
        
        results = session.exec(statement).all()
        
        # Group sensors by component name
        component_sensors = {}
        for component_name, sensor_name in results:
            if component_name not in component_sensors:
                component_sensors[component_name] = []
            component_sensors[component_name].append(sensor_name)
        
        return component_sensors

    async def get_sensors_grouped_by_component(self) -> Dict[str, List[str]]:
        """Get sensors grouped by component name"""
        def _get():
            with get_session_context() as session:
                return self._get_sensors_grouped_by_component_sync(session)
        
        return await self.async_service.run_in_thread(_get)
    
    def _get_sensors_grouped_by_nomenclature_sync(self, session: Session) -> Dict[str, List[str]]:
        """Synchronous get sensors grouped by component"""
        # Join SystemConfiguration with SensorMetadata
        statement = (
            select(SystemConfiguration.nomenclature, SensorMetadata.sensor_name)
            .join(SensorMetadata, SystemConfiguration.component_id == SensorMetadata.component_id)
            .order_by(SystemConfiguration.nomenclature, SensorMetadata.sensor_name)
        )
        
        results = session.exec(statement).all()
        
        # Group sensors by component name
        component_sensors = {}
        for component_name, sensor_name in results:
            if component_name not in component_sensors:
                component_sensors[component_name] = []
            component_sensors[component_name].append(sensor_name)
        
        return component_sensors

    async def get_sensors_grouped_by_nomenclature(self) -> Dict[str, List[str]]:
        """Get sensors grouped by component name"""
        def _get():
            with get_session_context() as session:
                return self._get_sensors_grouped_by_nomenclature_sync(session)
        
        return await self.async_service.run_in_thread(_get)
    
    def _get_failure_modes_analysis_sync(self, session: Session, component_id: Optional[UUID] = None) -> FailureModesAnalysisResponse:
        """
        Fetch all failure modes with their associated sensors and build the analysis response.
        Optionally filter by component_id.
        """
        # Build query for sensors with optional component filter
        sensor_query = select(SensorMetadata)
        if component_id:
            sensor_query = sensor_query.where(SensorMetadata.component_id == component_id)
        
        all_sensors = session.exec(sensor_query).all()
        
        # Count sensors without failure modes
        sensors_without_fm = sum(1 for s in all_sensors if s.failure_mode_id is None)
        
        # Get sensors with failure modes
        sensors_with_fm = [s for s in all_sensors if s.failure_mode_id is not None]
        
        # Fetch all relevant failure modes
        if sensors_with_fm:
            fm_ids = list(set(s.failure_mode_id for s in sensors_with_fm))
            fm_query = select(FailureMode).where(FailureMode.failure_mode_id.in_(fm_ids))
            failure_modes = session.exec(fm_query).all()
            
            # Create a map of failure_mode_id -> FailureMode
            fm_map = {fm.failure_mode_id: fm for fm in failure_modes}
        else:
            fm_map = {}
        
        # Group sensors by failure mode name
        failure_mode_data = defaultdict(lambda: {"sensors": [], "fm_obj": None})
        
        for sensor in sensors_with_fm:
            fm = fm_map.get(sensor.failure_mode_id)
            if fm:
                fm_name = fm.name
                
                sensor_detail = SensorDetailResponse(
                    sensor_name=sensor.sensor_name,
                    unit=sensor.unit,
                    min_value=sensor.min_value,
                    max_value=sensor.max_value,
                    frequency=sensor.frequency,
                    P=sensor.P,
                    F=sensor.F,
                    component_id=sensor.component_id,
                    sensor_id=sensor.sensor_id,
                    failure_mode_id=sensor.failure_mode_id
                )
                
                failure_mode_data[fm_name]["sensors"].append(sensor_detail)
                failure_mode_data[fm_name]["fm_obj"] = fm
        
        # Build the response data dictionary
        data_dict = {}
        for fm_name, fm_info in failure_mode_data.items():
            fm_obj = fm_info["fm_obj"]
            data_dict[fm_name] = FailureModeDetailResponse(
                id=fm_obj.failure_mode_id,
                severity=fm_obj.severity,
                sensor_count=len(fm_info["sensors"]),
                sensors=fm_info["sensors"]
            )
        
        # Calculate alerted sensors (sensors with P and F values)
        alerted_sensors = sum(
            1 for s in all_sensors 
            if s.P is not None and s.F is not None
        )
        
        return FailureModesAnalysisResponse(
            Total_failure_modes_count=len(data_dict),
            Total_sensors_count=len(all_sensors),
            alerted_sensors=alerted_sensors,
            sensors_without_failure_modes=sensors_without_fm,
            data=data_dict
        )

    async def get_failure_modes_analysis(self, component_id: Optional[UUID] = None) -> FailureModesAnalysisResponse:
        """
        Async wrapper to get failure modes analysis.
        
        Args:
            component_id: Optional UUID to filter by specific component
            
        Returns:
            FailureModesAnalysisResponse with complete analysis
        """
        def _get():
            with get_session_context() as session:
                return self._get_failure_modes_analysis_sync(session, component_id)
        
        return await self.async_service.run_in_thread(_get)