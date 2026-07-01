from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime

from ..dependencies import get_current_user
from ..db import get_db
from ..models.user import Notification
from typing import List

router = APIRouter(prefix="/notifications", tags=["notifications"])

class NotificationResponse(BaseModel):
    id: str
    message: str
    is_read: bool
    created_at: datetime

@router.get("/", response_model=List[NotificationResponse])
async def list_notifications(db: AsyncSession = Depends(get_db), user = Depends(get_current_user)):
    result = await db.execute(select(Notification).where(Notification.user_id == user.id).order_by(Notification.created_at.desc()))
    notes = result.scalars().all()
    return [NotificationResponse(id=str(n.id), message=n.message, is_read=n.is_read, created_at=n.created_at) for n in notes]

@router.post("/read/{notification_id}")
async def mark_as_read(notification_id: str, db: AsyncSession = Depends(get_db), user = Depends(get_current_user)):
    result = await db.execute(select(Notification).where(Notification.id == notification_id, Notification.user_id == user.id))
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=404, detail="Notification not found")
    note.is_read = True
    db.add(note)
    await db.commit()
    return {"message": "Notification marked as read"}

@router.post("/read-all")
async def mark_all_as_read(db: AsyncSession = Depends(get_db), user = Depends(get_current_user)):
    await db.execute(update(Notification).where(Notification.user_id == user.id).values(is_read=True))
    await db.commit()
    return {"message": "All notifications marked as read"}
