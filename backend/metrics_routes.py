from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from database import get_db
from models import Task, User, TaskStatus
from schemas import MetricsSummary
from dependencies import get_current_user

router = APIRouter(prefix="/api/metrics", tags=["Metrics"])


@router.get("/summary", response_model=MetricsSummary)
async def get_metrics_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get live counts of total, completed, pending, and in-progress tasks.
    """
    query = (
        select(Task.status, func.count(Task.id))
        .filter(Task.owner_id == current_user.id)
        .group_by(Task.status)
    )
    result = await db.execute(query)
    rows = result.all()
    
    counts = {
        "total": 0,
        "completed": 0,
        "pending": 0,
        "inProgress": 0
    }
    
    for status, count in rows:
        counts["total"] += count
        if status == TaskStatus.completed:
            counts["completed"] = count
        elif status == TaskStatus.pending:
            counts["pending"] = count
        elif status == TaskStatus.in_progress:
            counts["inProgress"] = count

            
    return counts
