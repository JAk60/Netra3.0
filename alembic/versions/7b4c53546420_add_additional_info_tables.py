"""add additional info tables

Revision ID: 7b4c53546420
Revises: 3960ba7a097c
Create Date: 2026-03-01
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mssql

# revision identifiers
revision: str = "7b4c53546420"
down_revision: Union[str, Sequence[str], None] = "3960ba7a097c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    # ─────────────────────────────────────────────
    # data_manager_maintenance_data
    # ─────────────────────────────────────────────
    op.create_table(
        "data_manager_maintenance_data",
        sa.Column("component_id", mssql.UNIQUEIDENTIFIER(), nullable=False),
        sa.Column("event_type", sa.String(200), nullable=True),
        sa.Column("maint_date", sa.Date(), nullable=True),
        sa.Column("maintenance_type", sa.String(200), nullable=True),
        sa.Column("replaced_component_type", sa.String(200), nullable=True),
        sa.Column("cannabalised_age", sa.String(100), nullable=True),
        sa.Column("maintenance_duration", sa.Float(), nullable=True),
        sa.Column("failure_mode", sa.String(), nullable=True),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("id", mssql.UNIQUEIDENTIFIER(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(
            ["component_id"],
            ["system_configuration.component_id"],
        ),
    )

    op.create_index(
        "ix_data_manager_maintenance_data_component_id",
        "data_manager_maintenance_data",
        ["component_id"],
    )

    # ─────────────────────────────────────────────
    # maintenance_configuration_data
    # ─────────────────────────────────────────────
    op.create_table(
        "maintenance_configuration_data",
        sa.Column("component_id", mssql.UNIQUEIDENTIFIER(), nullable=False),
        sa.Column("pm_applicable", sa.String(20), nullable=True),
        sa.Column("can_be_replaced_by_ship_staff", sa.String(20), nullable=True),
        sa.Column("is_system_param_recorded", sa.String(20), nullable=True),
        sa.Column("maintenance_id", mssql.UNIQUEIDENTIFIER(), nullable=False),
        sa.PrimaryKeyConstraint("maintenance_id"),
        sa.ForeignKeyConstraint(
            ["component_id"],
            ["system_configuration.component_id"],
        ),
    )

    op.create_index(
        "ix_maintenance_configuration_data_component_id",
        "maintenance_configuration_data",
        ["component_id"],
    )

    # ─────────────────────────────────────────────
    # redundancy_data
    # ─────────────────────────────────────────────
    op.create_table(
        "redundancy_data",
        sa.Column("component_id", mssql.UNIQUEIDENTIFIER(), nullable=False),
        sa.Column("k", sa.String(1), nullable=True),
        sa.Column("n", sa.Integer(), nullable=True),
        sa.Column("redundancy_type", sa.String(), nullable=True),
        sa.Column("system_name", sa.String(), nullable=True),
        sa.Column("system_parent_name", sa.String(), nullable=True),
        sa.Column("redundancy_id", mssql.UNIQUEIDENTIFIER(), nullable=False),
        sa.PrimaryKeyConstraint("redundancy_id"),
        sa.ForeignKeyConstraint(
            ["component_id"],
            ["system_configuration.component_id"],
        ),
    )

    op.create_index(
        "ix_redundancy_data_component_id",
        "redundancy_data",
        ["component_id"],
    )

    # ─────────────────────────────────────────────
    # system_config_additional_info
    # ─────────────────────────────────────────────
    op.create_table(
        "system_config_additional_info",
        sa.Column("component_id", mssql.UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("component_name", sa.String(), nullable=True),
        sa.Column("num_cycle_or_runtime", sa.Float(), nullable=True),
        sa.Column("installation_date", sa.Date(), nullable=True),
        sa.Column("unit", sa.String(), nullable=True),
        sa.Column("id", mssql.UNIQUEIDENTIFIER(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(
            ["component_id"],
            ["system_configuration.component_id"],
        ),
    )

    op.create_index(
        "ix_system_config_additional_info_component_id",
        "system_config_additional_info",
        ["component_id"],
    )


def downgrade() -> None:

    op.drop_index("ix_system_config_additional_info_component_id", table_name="system_config_additional_info")
    op.drop_table("system_config_additional_info")

    op.drop_index("ix_redundancy_data_component_id", table_name="redundancy_data")
    op.drop_table("redundancy_data")

    op.drop_index("ix_maintenance_configuration_data_component_id", table_name="maintenance_configuration_data")
    op.drop_table("maintenance_configuration_data")

    op.drop_index("ix_data_manager_maintenance_data_component_id", table_name="data_manager_maintenance_data")
    op.drop_table("data_manager_maintenance_data")