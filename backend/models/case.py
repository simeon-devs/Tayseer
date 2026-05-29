"""SQLAlchemy model for the cases table."""

import uuid
from sqlalchemy import String, Float, DateTime, ForeignKey, CheckConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from backend.database import Base

VALID_STATUSES = ("pending", "processing", "approved", "escalated", "overridden", "closed")


class Case(Base):
    """One row per rescheduling request. Status tracks the case lifecycle."""

    __tablename__ = "cases"

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'processing', 'approved', 'escalated', 'overridden', 'closed')",
            name="ck_cases_status",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    citizen_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("citizens.id"), nullable=False
    )
    status: Mapped[str] = mapped_column(String, nullable=False, default="pending")
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    assigned_to: Mapped[str | None] = mapped_column(String, nullable=True)
    arrears_amount: Mapped[float | None] = mapped_column(Float, nullable=True)

    citizen: Mapped["Citizen"] = relationship("Citizen", back_populates="cases")  # noqa: F821
    documents: Mapped[list["Document"]] = relationship("Document", back_populates="case")  # noqa: F821
    decision: Mapped["Decision | None"] = relationship("Decision", back_populates="case", uselist=False)  # noqa: F821
    overrides: Mapped[list["Override"]] = relationship("Override", back_populates="case")  # noqa: F821
    audit_logs: Mapped[list["AuditLog"]] = relationship("AuditLog", back_populates="case")  # noqa: F821
