import uuid
from datetime import datetime, date
from typing import Optional

from sqlalchemy import Column, String, DateTime, Date, Text, Boolean, Enum, UniqueConstraint, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from ..db import Base

# Enums for role and attendance status
ROLE_ENUM = ('employee', 'admin')
STATUS_ENUM = ('present', 'absent', 'late')

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default='employee')  # consider Enum in DB
    department = Column(String, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default='now()')

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    date = Column(Date, nullable=False)
    check_in = Column(DateTime(timezone=True), nullable=True)
    check_out = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, nullable=False, default='present')
    note = Column(Text, nullable=True)
    __table_args__ = (UniqueConstraint('user_id', 'date', name='uq_user_date'),)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default='now()')
