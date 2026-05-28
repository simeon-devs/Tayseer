"""SQLAlchemy model for the overrides table."""

import uuid
from sqlalchemy import String, Text, DateTime, Float, Integer, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from backend.database import Base


class Override(Base):
    """Records when staff override an AI decision. The original decision is preserved."""

    __tablename__ = "overrides"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    case_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False
    )
    staff_id: Mapped[str] = mapped_column(String, nullable=False)
    original_decision_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("decisions.id"), nullable=True
    )
    new_amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    new_duration: Mapped[int | None] = mapped_column(Integer, nullable=True)
    justification: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    case: Mapped["Case"] = relationship("Case", back_populates="overrides")  # noqa: F821
