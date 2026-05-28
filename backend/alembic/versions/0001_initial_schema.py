"""Initial schema: create all six tables in dependency order.

Revision ID: 0001
Revises:
Create Date: 2026-05-28

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create all tables in foreign key dependency order."""

    # 1. citizens (no foreign keys)
    op.create_table(
        "citizens",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name_ar", sa.String(), nullable=False),
        sa.Column("name_en", sa.String(), nullable=False),
        sa.Column("emirates_id", sa.String(), nullable=False),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.UniqueConstraint("emirates_id", name="uq_citizens_emirates_id"),
    )

    # 2. cases (depends on citizens)
    op.create_table(
        "cases",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "citizen_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("citizens.id"),
            nullable=False,
        ),
        sa.Column("status", sa.String(), nullable=False, server_default="pending"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("assigned_to", sa.String(), nullable=True),
        sa.CheckConstraint(
            "status IN ('pending', 'processing', 'approved', 'escalated', 'overridden', 'closed')",
            name="ck_cases_status",
        ),
    )

    # 3. documents (depends on cases)
    op.create_table(
        "documents",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "case_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("cases.id"),
            nullable=False,
        ),
        sa.Column("document_type", sa.String(), nullable=False),
        sa.Column("file_path", sa.String(), nullable=False),
        sa.Column("extracted_fields", postgresql.JSONB(), nullable=True),
        sa.Column("extraction_confidence", sa.Float(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "document_type IN ('salary_certificate', 'bank_statement', 'emirates_id', 'tenancy_contract', 'other')",
            name="ck_documents_document_type",
        ),
    )

    # 4. decisions (depends on cases)
    op.create_table(
        "decisions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "case_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("cases.id"),
            nullable=False,
            unique=True,
        ),
        sa.Column("approved_amount", sa.Float(), nullable=True),
        sa.Column("duration_months", sa.Integer(), nullable=True),
        sa.Column("monthly_instalment", sa.Float(), nullable=True),
        sa.Column("hardship_score", sa.Float(), nullable=True),
        sa.Column("escalate_flag", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("escalation_reason", sa.String(), nullable=True),
        sa.Column("rationale_en", sa.Text(), nullable=True),
        sa.Column("rationale_ar", sa.Text(), nullable=True),
        sa.Column("rules_applied", postgresql.JSONB(), nullable=True),
        sa.Column("confidence_score", sa.Float(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.UniqueConstraint("case_id", name="uq_decisions_case_id"),
    )

    # 5. overrides (depends on cases and decisions)
    op.create_table(
        "overrides",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "case_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("cases.id"),
            nullable=False,
        ),
        sa.Column("staff_id", sa.String(), nullable=False),
        sa.Column(
            "original_decision_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("decisions.id"),
            nullable=True,
        ),
        sa.Column("new_amount", sa.Float(), nullable=True),
        sa.Column("new_duration", sa.Integer(), nullable=True),
        sa.Column("justification", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    # 6. audit_log (depends on cases, append-only)
    op.create_table(
        "audit_log",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "case_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("cases.id"),
            nullable=True,
        ),
        sa.Column("action", sa.String(), nullable=False),
        sa.Column("performed_by", sa.String(), nullable=False, server_default="system"),
        sa.Column("details", postgresql.JSONB(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )


def downgrade() -> None:
    """Drop all tables in reverse dependency order."""
    op.drop_table("audit_log")
    op.drop_table("overrides")
    op.drop_table("decisions")
    op.drop_table("documents")
    op.drop_table("cases")
    op.drop_table("citizens")
