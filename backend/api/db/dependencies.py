from sqlmodel import Session
from fastapi import Depends
from db.connection import get_session, get_async_db_service, AsyncDatabaseService
from .repositories import (
    AlphaBetaRepository,
    EtaBetaRepository,
    FailureModeRepository,
    ShipRepository, 
    DepartmentRepository, 
    SystemConfigurationRepository,
    UserRepository,
    TokenRepository,
    SensorRepository,
    SensorReadingRepository
)

# Repository dependencies
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
