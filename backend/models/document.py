"""SQLAlchemy model for the documents table."""

import uuid
from sqlalchemy import String, DateTime, Float, ForeignKey, CheckConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from backend.database import Base

VALID_DOCUMENT_TYPES = (
    "salary_certificate",
    "bank_statement",
    "emirates_id",
    "tenancy_contract",
    "other",
)


class Document(Base):
    """One row per uploaded document per case."""

    __tablename__ = "documents"

    __table_args__ = (
        CheckConstraint(
            "document_type IN ('salary_certificate', 'bank_statement', 'emirates_id', 'tenancy_contract', 'other')",
            name="ck_documents_document_type",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    case_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False
    )
    document_type: Mapped[str] = mapped_column(String, nullable=False)
    file_path: Mapped[str] = mapped_column(String, nullable=False)
    extracted_fields: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    extraction_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    case: Mapped["Case"] = relationship("Case", back_populates="documents")  # noqa: F821
