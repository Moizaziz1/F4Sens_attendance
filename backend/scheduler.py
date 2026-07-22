import asyncio
from datetime import datetime, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert

from models.user import User, Notification, Attendance
from auth import create_access_token

async def run_missed_attendance_notifications(db: AsyncSession):
    """Check for employees without today's attendance and create a notification.
    This function can be called from a scheduled APScheduler job or manually via admin endpoint.
    """
    today = date.today()
    # Get all active employees
    result = await db.execute(select(User.id).where(User.role == "employee", User.is_active == True))
    employee_ids = [row[0] for row in result.fetchall()]
    # Get employees who already have an attendance record for today
    result = await db.execute(select(Attendance.user_id).where(Attendance.date == today))
    present_ids = {row[0] for row in result.fetchall()}
    missing_ids = set(employee_ids) - present_ids
    notifications = []
    for uid in missing_ids:
        msg = f"You missed your attendance for {today.isoformat()}. Please contact your admin."
        notifications.append({"user_id": uid, "message": msg})
    if notifications:
        await db.execute(insert(Notification), notifications)
        await db.commit()

# APScheduler setup (to be imported by the app if needed)
def start_scheduler(app):
    from apscheduler.schedulers.asyncio import AsyncIOScheduler
    from pytz import timezone
    scheduler = AsyncIOScheduler(timezone=timezone('Asia/Karachi'))
    # Run daily at 22:00 PKT (10 PM)
    scheduler.add_job(lambda: asyncio.create_task(_run_job(app)), 'cron', hour=22, minute=0)
    scheduler.start()

async def _run_job(app):
    async for session in app.state.db_session():
        await run_missed_attendance_notifications(session)
        break
