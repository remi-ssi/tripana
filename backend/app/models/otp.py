from sqlalchemy import Column, String, DateTime, Boolean, Integer, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from datetime import datetime
import uuid
from app.database import Base


class OTPCode(Base):
    __tablename__ = "otp_codes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, nullable=False, index=True)

    # store HASHED otp, not plain text
    hashed_code = Column(String, nullable=False)
    is_used = Column(Boolean, default=False)
    attempts = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        Index("idx_otp_email_code", "email", "hashed_code"),
    )