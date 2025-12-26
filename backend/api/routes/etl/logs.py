from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from uuid import UUID
from typing import List

from api.db.connection import get_session
from api.models.etl import ETLExecutionLog, LogEntry



router = APIRouter(prefix="/api/v1/logs", tags=["Logs"])


@router.get("/{execution_id}", response_model=List[LogEntry])
async def get_execution_logs(
    execution_id: UUID,
    limit: int = 100,
    offset: int = 0,
    log_level: str = None,
    session: Session = Depends(get_session)
):
    """
    Get logs for a specific execution
    
    - **limit**: Number of logs to return (default: 100)
    - **offset**: Number of logs to skip (default: 0)
    - **log_level**: Filter by log level (optional)
    """
    try:
        statement = select(ETLExecutionLog).where(
            ETLExecutionLog.execution_id == execution_id
        )
        
        if log_level:
            statement = statement.where(ETLExecutionLog.log_level == log_level.upper())
        
        statement = statement.order_by(
            ETLExecutionLog.logged_at.asc()
        ).limit(limit).offset(offset)
        
        logs = session.exec(statement).all()
        
        return [
            LogEntry(
                log_id=log.log_id,
                execution_id=log.execution_id,
                log_level=log.log_level,
                message=log.message,
                source=log.source,
                logged_at=log.logged_at
            )
            for log in logs
        ]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{execution_id}/latest")
async def get_latest_logs(
    execution_id: UUID,
    since: str = None,  # ISO timestamp
    session: Session = Depends(get_session)
):
    """
    Get logs since a specific timestamp (for polling)
    
    - **since**: ISO timestamp to fetch logs after (optional)
    """
    try:
        statement = select(ETLExecutionLog).where(
            ETLExecutionLog.execution_id == execution_id
        )
        
        if since:
            from datetime import datetime
            since_dt = datetime.fromisoformat(since.replace('Z', '+00:00'))
            statement = statement.where(ETLExecutionLog.logged_at > since_dt)
        
        statement = statement.order_by(ETLExecutionLog.logged_at.asc())
        
        logs = session.exec(statement).all()
        
        return [
            LogEntry(
                log_id=log.log_id,
                execution_id=log.execution_id,
                log_level=log.log_level,
                message=log.message,
                source=log.source,
                logged_at=log.logged_at
            )
            for log in logs
        ]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))