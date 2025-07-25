from sqlmodel import SQLModel, Field, Relationship
from typing import TYPE_CHECKING, Optional, List
from datetime import datetime
from uuid import UUID, uuid4

if TYPE_CHECKING:
    from .reliability import EtaBeta, AlphaBeta
print(f"systemconfiguration.py loaded from {__file__}")
# Ship Models
class ShipBase(SQLModel):
    ship_name: str = Field(max_length=255)
    ship_category: Optional[str] = Field(default=None, max_length=255)
    ship_class: Optional[str] = Field(default=None, max_length=255)
    command: Optional[str] = Field(default=None, max_length=255)


class Ship(ShipBase, table=True):
    __tablename__ = "ships"

    ship_id: UUID = Field(primary_key=True, default_factory=uuid4)
    created_date: datetime = Field(default_factory=datetime.utcnow)
    modified_date: datetime = Field(default_factory=datetime.utcnow)

    # Relationship with components - A ship HAS many components directly
    components: List["SystemConfiguration"] = Relationship(back_populates="ship")
    
    # Relationship with departments - A ship HAS many departments (organizational units)
    departments: List["Department"] = Relationship(back_populates="ship")


class ShipCreate(ShipBase):
    pass


class ShipRead(ShipBase):
    ship_id: UUID
    created_date: datetime
    modified_date: datetime
    
    class Config:
        from_attributes = True  # This allows creation from SQLModel objects
        json_encoders = {
            UUID: str,  # Convert UUID to string for JSON serialization
            datetime: lambda v: v.isoformat() if v else None  # Convert datetime to ISO string
        }


class ShipUpdate(SQLModel):
    ship_name: Optional[str] = Field(default=None, max_length=255)
    ship_category: Optional[str] = Field(default=None, max_length=255)
    ship_class: Optional[str] = Field(default=None, max_length=255)
    command: Optional[str] = Field(default=None, max_length=255)
    modified_date: datetime = Field(default_factory=datetime.utcnow)


# Department Models (Organizational units without direct component ownership)
class DepartmentBase(SQLModel):
    department_name: str = Field(max_length=255)
    department_code: Optional[str] = Field(default=None, max_length=50)
    ship_id: UUID = Field(foreign_key="ships.ship_id")  # Department BELONGS TO a ship


class Department(DepartmentBase, table=True):
    __tablename__ = "departments"

    department_id: UUID = Field(primary_key=True, default_factory=uuid4)
    created_date: datetime = Field(default_factory=datetime.utcnow)
    modified_date: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    ship: Optional["Ship"] = Relationship(back_populates="departments")  # Department belongs to ONE ship
    components: List["SystemConfiguration"] = Relationship(back_populates="department")  # Components assigned to this department


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentRead(DepartmentBase):
    department_id: UUID
    created_date: datetime
    modified_date: datetime


class DepartmentUpdate(SQLModel):
    department_name: Optional[str] = Field(default=None, max_length=255)
    department_code: Optional[str] = Field(default=None, max_length=50)
    ship_id: Optional[UUID] = Field(default=None)
    modified_date: datetime = Field(default_factory=datetime.utcnow)


# System Configuration Models
class SystemConfigurationBase(SQLModel):
    component_name: str = Field(max_length=255)
    ship_id: UUID = Field(foreign_key="ships.ship_id")  # Component BELONGS TO a ship
    department_id: UUID = Field(foreign_key="departments.department_id")  # Component is ASSIGNED TO a department
    parent_id: Optional[UUID] = Field(default=None, foreign_key="system_configuration.component_id")  # Self-reference for hierarchy
    CMMS_EquipmentCode: Optional[str] = Field(default=None, max_length=200)
    is_lmu: int = Field(default=1)
    parent_name: Optional[str] = Field(default=None, max_length=8000)
    nomenclature: Optional[str] = Field(default=None, max_length=8000)
    etl: Optional[bool] = Field(default=None)


class SystemConfiguration(SystemConfigurationBase, table=True):
    __tablename__ = "system_configuration"

    component_id: UUID = Field(primary_key=True, default_factory=uuid4)
    created_date: datetime = Field(default_factory=datetime.utcnow)
    modified_date: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    ship: Optional["Ship"] = Relationship(back_populates="components")  # Component belongs to ONE ship
    department: Optional["Department"] = Relationship(back_populates="components")  # Component is assigned to ONE department

    # Self-referencing relationship for parent-child hierarchy within components
    parent: Optional["SystemConfiguration"] = Relationship(
        back_populates="children",
        sa_relationship_kwargs={"remote_side": "SystemConfiguration.component_id"}
    )
    children: List["SystemConfiguration"] = Relationship(back_populates="parent")

    # Relationships with reliability models
    eta_beta_records: List["EtaBeta"] = Relationship(back_populates="component")
    alpha_beta_records: List["AlphaBeta"] = Relationship(back_populates="component")


class SystemConfigurationCreate(SystemConfigurationBase):
    pass


class SystemConfigurationRead(SystemConfigurationBase):
    component_id: UUID
    created_date: datetime
    modified_date: datetime

    model_config = {
        "from_attributes": True
    }


class SystemConfigurationUpdate(SQLModel):
    component_name: Optional[str] = Field(default=None, max_length=255)
    ship_id: Optional[UUID] = Field(default=None)
    department_id: Optional[UUID] = Field(default=None)  # Can reassign component to different department
    parent_id: Optional[UUID] = Field(default=None)
    CMMS_EquipmentCode: Optional[str] = Field(default=None, max_length=200)
    is_lmu: Optional[int] = Field(default=None)
    parent_name: Optional[str] = Field(default=None, max_length=8000)
    nomenclature: Optional[str] = Field(default=None, max_length=8000)
    etl: Optional[bool] = Field(default=None)
    modified_date: datetime = Field(default_factory=datetime.utcnow)


# Response Models with Relationships
class ComponentWithDepartment(SystemConfigurationRead):
    department: Optional[DepartmentRead] = None


class DepartmentWithComponents(DepartmentRead):
    components: List[SystemConfigurationRead] = []


class ShipWithComponents(ShipRead):
    components: List[SystemConfigurationRead] = []


class ShipWithDepartments(ShipRead):
    departments: List[DepartmentRead] = []


class ShipWithFullHierarchy(ShipRead):
    departments: List[DepartmentWithComponents] = []
    components: List[ComponentWithDepartment] = []


class ComponentWithChildren(SystemConfigurationRead):
    children: List["ComponentWithChildren"] = []


class ComponentWithParent(SystemConfigurationRead):
    parent: Optional[SystemConfigurationRead] = None


class ComponentFullInfo(SystemConfigurationRead):
    ship: Optional[ShipRead] = None
    department: Optional[DepartmentRead] = None
    parent: Optional[SystemConfigurationRead] = None
    children: List[SystemConfigurationRead] = []


# Statistics and Analytics Models
class ShipStats(SQLModel):
    ship_id: UUID
    ship_name: str
    total_departments: int
    total_components: int
    components_by_department: dict


class DepartmentStats(SQLModel):
    department_id: UUID
    department_name: str
    ship_name: str
    total_components: int
    root_components: int
    child_components: int


class ComponentHierarchyStats(SQLModel):
    component_id: UUID
    component_name: str
    department_name: str
    ship_name: str
    hierarchy_level: int
    total_children: int
    is_root: bool


# Search and Filter Models
class ComponentSearchFilter(SQLModel):
    ship_id: Optional[UUID] = None
    department_id: Optional[UUID] = None
    component_name: Optional[str] = None
    parent_id: Optional[UUID] = None
    is_lmu: Optional[int] = None
    has_parent: Optional[bool] = None
    cmms_equipment_code: Optional[str] = None


class ShipSearchFilter(SQLModel):
    ship_name: Optional[str] = None
    ship_category: Optional[str] = None
    ship_class: Optional[str] = None
    command: Optional[str] = None


# Bulk Operations Models
class BulkComponentCreate(SQLModel):
    components: List[SystemConfigurationCreate]


class BulkComponentUpdate(SQLModel):
    updates: List[dict]  # List of {component_id: UUID, updates: SystemConfigurationUpdate}


class BulkOperationResult(SQLModel):
    success_count: int
    error_count: int
    errors: List[str]
    created_ids: List[UUID]
    updated_ids: List[UUID]