from api.db.repos.system.department import DepartmentRepository
from api.db.repos.system.ship import ShipRepository
from api.db.repos.system.sys_config import SystemConfigurationRepository
from api.db.repos.system.system import SystemRepository
from sqlmodel import Session
from fastapi import Depends
from api.db.connection import get_session, get_async_db_service, AsyncDatabaseService
from api.db.repos.sensor.failuremode import FailureModeRepository
from api.db.repos.sensor.metadata import SensorRepository
from api.db.repos.sensor.reading import SensorReadingRepository
from api.db.repos.reliability.config import Mission_ConfigService
from api.db.repos.reliability.monthly_utilization import MonthlyUtilizationRepository
from api.db.repos.reliability.overhaul import OverhaulMetadataRepository, OverhaulReadingsRepository
from api.db.repos.reliability.rcm import RcmRepository
from api.db.repos.reliability.alpha_beta import AlphaBetaRepository
from api.db.repos.reliability.assemblies.eta_beta import EtaBetaRepository
from .repositories import (
    UserRepository,
    TokenRepository,
)

# Repository dependencies
def get_rcm_repo(session: Session = Depends(get_session)) -> Mission_ConfigService:
    return RcmRepository(session)
def get_overhaul_metadata_repo(session: Session = Depends(get_session)) -> Mission_ConfigService:
    return OverhaulMetadataRepository(session)
def get_overhaul_readings_repo(session: Session = Depends(get_session)) -> Mission_ConfigService:
    return OverhaulReadingsRepository(session)
def get_monthly_utilization_repository(session: Session = Depends(get_session)) -> Mission_ConfigService:
    return MonthlyUtilizationRepository(session)

def get_mission_conifg_repository(session: Session = Depends(get_session)) -> Mission_ConfigService:
    return Mission_ConfigService(session)

def get_system_repository(session: Session = Depends(get_session)) -> SystemRepository:
    return SystemRepository(session)

def get_ship_repository(session: Session = Depends(get_session)) -> ShipRepository:
    return ShipRepository(session)

def get_department_repository(session: Session = Depends(get_session)) -> DepartmentRepository:
    return DepartmentRepository(session)

def get_system_config_repository(session: Session = Depends(get_session)) -> SystemConfigurationRepository:
    return SystemConfigurationRepository(session)

def get_user_repository(session: Session = Depends(get_session)) -> UserRepository:
    return UserRepository(session)

def get_token_repository(session: Session = Depends(get_session)) -> TokenRepository:
    return TokenRepository(session)

def get_sensor_repository(session: Session = Depends(get_session)) -> SensorRepository:
    return SensorRepository(session)

def get_sensor_reading_repository(session: Session = Depends(get_session)) -> SensorReadingRepository:
    return SensorReadingRepository(session)

def get_failure_mode_repository(session: Session = Depends(get_session)) -> FailureModeRepository:
    return FailureModeRepository(session)

def get_eta_beta_repository(session: Session = Depends(get_session)) -> EtaBetaRepository:
    return EtaBetaRepository(session)

def get_alpha_beta_repository(session: Session = Depends(get_session)) -> AlphaBetaRepository:
    return AlphaBetaRepository(session)
# Async database service dependency
def get_async_db() -> AsyncDatabaseService:
    return get_async_db_service()

# Repository manager for complex operations
class RepositoryManager:
    def __init__(self, session: Session):
        self.session = session
        self.ships = ShipRepository(session)
        self.departments = DepartmentRepository(session)
        self.components = SystemConfigurationRepository(session)
        self.users = UserRepository(session)
        self.tokens = TokenRepository(session)
        self.sensors = SensorRepository(session)
        self.sensor_readings = SensorReadingRepository(session)
        self.EtaBeta = EtaBetaRepository(session)
        self.AlphaBeta = AlphaBetaRepository(session)
    
    def commit(self):
        self.session.commit()
    
    def rollback(self):
        self.session.rollback()
    
    def close(self):
        self.session.close()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.rollback()
        else:
            self.commit()

def get_repository_manager(session: Session = Depends(get_session)) -> RepositoryManager:
    return RepositoryManager(session)
