"""Add rejected and additional_info_required to cases status constraint.

Revision ID: 0003
Revises: 0002
Create Date: 2026-06-05

"""

from alembic import op

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Drop and recreate the cases status check constraint to include new statuses."""
    op.drop_constraint("ck_cases_status", "cases", type_="check")
    op.create_check_constraint(
        "ck_cases_status",
        "cases",
        "status IN ('pending', 'processing', 'approved', 'escalated', 'overridden', 'closed',"
        " 'rejected', 'additional_info_required')",
    )


def downgrade() -> None:
    """Revert cases status check constraint to original set of statuses."""
    op.drop_constraint("ck_cases_status", "cases", type_="check")
    op.create_check_constraint(
        "ck_cases_status",
        "cases",
        "status IN ('pending', 'processing', 'approved', 'escalated', 'overridden', 'closed')",
    )
