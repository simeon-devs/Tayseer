"""SQLAlchemy model for the decisions table."""

import uuid
from sqlalchemy import String, Text, DateTime, Float, Integer, Boolean, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from backend.database import Base


class Decision(Base):
    """One row per case. The unique constraint on case_id enforces one decision per case."""

    __tablename__ = "decisions"

    __table_args__ = (
        UniqueConstraint("case_id", name="uq_decisions_case_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    case_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False, unique=True
    )
    approved_amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    duration_months: Mapped[int | None] = mapped_column(Integer, nullable=True)
    monthly_instalment: Mapped[float | None] = mapped_column(Float, nullable=True)
    hardship_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    escalate_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    escalation_reason: Mapped[str | None] = mapped_column(String, nullable=True)
    rationale_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    rationale_ar: Mapped[str | None] = mapped_column(Text, nullable=True)
    rules_applied: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    confidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    case: Mapped["Case"] = relationship("Case", back_populates="decision")  # noqa: F821
