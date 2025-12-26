"""Adding assembly level tables

Revision ID: cb90e1cb957c
Revises: 66fa5f87bdbb
Create Date: 2025-12-18 19:06:53.289450
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision: str = "cb90e1cb957c"
down_revision: Union[str, Sequence[str], None] = "66fa5f87bdbb"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ---------- EB_TTF_data ----------
    op.create_table(
        "EB_TTF_data",
        sa.Column("component_id", sa.Uuid(), nullable=False),
        sa.Column("hours", sa.Float(), nullable=False),
        sa.Column(
            "f_s",
            sa.Enum("FAILURE", "SUSPENSION", name="failurestatusenum"),
            nullable=False,
        ),
        sa.Column("priority", sa.Integer(), nullable=False),
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("created_date", sa.DateTime(), nullable=False),
        sa.Column("modified_date", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["component_id"], ["system_configuration.component_id"]
        ),
    )
    op.create_index(
        "ix_EB_TTF_data_component_id",
        "EB_TTF_data",
        ["component_id"],
    )

    # ---------- EB_actual_data ----------
    op.create_table(
        "EB_actual_data",
        sa.Column("component_id", sa.Uuid(), nullable=False),
        sa.Column("interval_start_date", sa.Date(), nullable=False),
        sa.Column("interval_end_date", sa.Date(), nullable=False),
        sa.Column(
            "f_s",
            sa.Enum("FAILURE", "SUSPENSION", name="failurestatusenum"),
            nullable=False,
        ),
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("created_date", sa.DateTime(), nullable=False),
        sa.Column("modified_date", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["component_id"], ["system_configuration.component_id"]
        ),
    )
    op.create_index(
        "ix_EB_actual_data_component_id",
        "EB_actual_data",
        ["component_id"],
    )

    # ---------- EB_expert ----------
    op.create_table(
        "EB_expert",
        sa.Column("component_id", sa.Uuid(), nullable=False),
        sa.Column("most_likely_life", sa.Float(), nullable=False),
        sa.Column("max_life", sa.Float(), nullable=False),
        sa.Column("min_life", sa.Float(), nullable=False),
        sa.Column("num_component_wo_failure", sa.Integer(), nullable=False),
        sa.Column("time_wo_failure", sa.Float(), nullable=False),
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("created_date", sa.DateTime(), nullable=False),
        sa.Column("modified_date", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["component_id"], ["system_configuration.component_id"]
        ),
    )
    op.create_index(
        "ix_EB_expert_component_id",
        "EB_expert",
        ["component_id"],
    )

    # ---------- EB_interval_data ----------
    op.create_table(
        "EB_interval_data",
        sa.Column("component_id", sa.Uuid(), nullable=False),
        sa.Column("installation_start_date", sa.Date(), nullable=False),
        sa.Column("installation_end_date", sa.Date(), nullable=False),
        sa.Column("removal_start_date", sa.Date(), nullable=False),
        sa.Column("removal_end_date", sa.Date(), nullable=False),
        sa.Column(
            "f_s",
            sa.Enum("FAILURE", "SUSPENSION", name="failurestatusenum"),
            nullable=False,
        ),
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("created_date", sa.DateTime(), nullable=False),
        sa.Column("modified_date", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["component_id"], ["system_configuration.component_id"]
        ),
    )
    op.create_index(
        "ix_EB_interval_data_component_id",
        "EB_interval_data",
        ["component_id"],
    )

    # ---------- EB_nprd ----------
    op.create_table(
        "EB_nprd",
        sa.Column("component_id", sa.Uuid(), nullable=False),
        sa.Column("failure_rate", sa.Float(), nullable=False),
        sa.Column("beta", sa.Float(), nullable=False),
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("created_date", sa.DateTime(), nullable=False),
        sa.Column("modified_date", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["component_id"], ["system_configuration.component_id"]
        ),
    )
    op.create_index(
        "ix_EB_nprd_component_id",
        "EB_nprd",
        ["component_id"],
    )

    # ---------- EB_oem ----------
    op.create_table(
        "EB_oem",
        sa.Column("component_id", sa.Uuid(), nullable=False),
        sa.Column("life_estimate1_name", sa.String(50), nullable=False),
        sa.Column("life_estimate1_val", sa.Float(), nullable=False),
        sa.Column("life_estimate2_name", sa.String(50), nullable=False),
        sa.Column("life_estimate2_val", sa.Float(), nullable=False),
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("created_date", sa.DateTime(), nullable=False),
        sa.Column("modified_date", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["component_id"], ["system_configuration.component_id"]
        ),
    )
    op.create_index(
        "ix_EB_oem_component_id",
        "EB_oem",
        ["component_id"],
    )

    # ---------- EB_oem_expert ----------
    op.create_table(
        "EB_oem_expert",
        sa.Column("component_id", sa.Uuid(), nullable=False),
        sa.Column("most_likely_life", sa.Float(), nullable=False),
        sa.Column("max_life", sa.Float(), nullable=False),
        sa.Column("min_life", sa.Float(), nullable=False),
        sa.Column("life_estimate_name", sa.String(50)),
        sa.Column("life_estimate_val", sa.Float()),
        sa.Column("num_component_wo_failure", sa.Integer(), nullable=False),
        sa.Column("time_wo_failure", sa.Float(), nullable=False),
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("created_date", sa.DateTime(), nullable=False),
        sa.Column("modified_date", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["component_id"], ["system_configuration.component_id"]
        ),
    )
    op.create_index(
        "ix_EB_oem_expert_component_id",
        "EB_oem_expert",
        ["component_id"],
    )

    # ---------- EB_prob_failure ----------
    op.create_table(
        "EB_prob_failure",
        sa.Column("component_id", sa.Uuid(), nullable=False),
        sa.Column("p_time", sa.Float(), nullable=False),
        sa.Column("failure_p", sa.Float(), nullable=False),
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("created_date", sa.DateTime(), nullable=False),
        sa.Column("modified_date", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["component_id"], ["system_configuration.component_id"]
        ),
    )
    op.create_index(
        "ix_EB_prob_failure_component_id",
        "EB_prob_failure",
        ["component_id"],
    )


def downgrade() -> None:
    op.drop_table("EB_prob_failure")
    op.drop_table("EB_oem_expert")
    op.drop_table("EB_oem")
    op.drop_table("EB_nprd")
    op.drop_table("EB_interval_data")
    op.drop_table("EB_expert")
    op.drop_table("EB_actual_data")
    op.drop_table("EB_TTF_data")
