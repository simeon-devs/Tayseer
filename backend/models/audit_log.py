"""SQLAlchemy model for the audit_log table.

Never update or delete rows from this table.
"""

import uuid
from sqlalchemy import String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from backend.database import Base


class AuditLog(Base):
    """Append-only audit log. Every write operation in the system produces one row.

    Never update or delete rows from this table.
    """

    __tablename__ = "audit_log"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    case_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cases.id"), nullable=True
    )
    action: Mapped[str] = mapped_column(String, nullable=False)
    performed_by: Mapped[str] = mapped_column(String, nullable=False, default="system")
    details: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    case: Mapped["Case | None"] = relationship("Case", back_populates="audit_logs")  # noqa: F821
