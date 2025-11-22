from uuid import UUID
from api.models.sensor import (
    SensorReading,
    SensorReadingCreate,
    SensorReadingResponse
)

from fastapi import APIRouter, HTTPException, Query, Path, Depends
from typing import List, Optional
from datetime import datetime
from api.db.dependencies import get_sensor_repository, get_sensor_reading_repository
# from api.db.repositories import FailureModeRepository, SensorReadingRepository


router = APIRouter(tags=["sensor_reading"],)

@router.post("/{sensor_id}/readings", response_model=SensorReading, status_code=201)
async def create_sensor_reading(
    reading_data: SensorReadingCreate,
    sensor_id: str = Path(..., description="Unique sensor identifier"),
    reading_repo = Depends(get_sensor_reading_repository)
):
    """Create a new sensor reading"""
    try:
        # Add sensor_id to the reading data
        reading_data.sensor_id = sensor_id
        return await reading_repo.create_reading(reading_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/readings/bulk", response_model=List[SensorReading], status_code=201)
async def bulk_create_readings(
    readings_data: List[SensorReadingCreate],
    reading_repo = Depends(
        get_sensor_reading_repository)
):
    """Create multiple sensor readings in bulk"""
    try:
        if not readings_data:
            raise HTTPException(status_code=400, detail="No readings provided")
        if len(readings_data) > 1000:  # Reasonable limit
            raise HTTPException(
                status_code=400, detail="Too many readings (max 1000)")
        return await reading_repo.bulk_create_readings(readings_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


from fastapi import HTTPException

@router.get("/readings", response_model=List[SensorReadingResponse])
async def get_readings(
    sensor_id: Optional[UUID] = Query(None),
    component_id: Optional[UUID] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    skip: int = 0,
    limit: int = 100,
    reading_repo = Depends(get_sensor_reading_repository)
):
    try:
        print("hello world")
        readings = await reading_repo.get_readings(
            sensor_id=sensor_id,
            component_id=component_id,
            start_date=start_date,
            end_date=end_date,
            skip=skip,
            limit=limit
        )
        # ✅ Ensure proper JSON serialization
        return [SensorReadingResponse.model_validate(r) for r in readings]
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))




@router.get("/{sensor_id}/readings", response_model=List[SensorReading])
async def get_sensor_readings(
    sensor_id: str = Path(..., description="Unique sensor identifier"),
    start_date: Optional[datetime] = Query(
        None, description="Filter readings from this date"),
    end_date: Optional[datetime] = Query(
        None, description="Filter readings until this date"),
    skip: int = Query(0, ge=0, description="Number of readings to skip"),
    limit: int = Query(100, ge=1, le=1000,
                       description="Maximum number of readings to return"),
    reading_repo = Depends(
        get_sensor_reading_repository)
):
    """Get readings for a specific sensor"""
    try:
        # Validate date range
        if start_date and end_date and start_date > end_date:
            raise HTTPException(
                status_code=400, detail="start_date must be before end_date")

        return await reading_repo.get_readings(
            sensor_id=sensor_id,
            start_date=start_date,
            end_date=end_date,
            skip=skip,
            limit=limit
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/readings/latest", response_model=List[SensorReading])
async def get_latest_readings(
    limit: int = Query(
        50, ge=1, le=500, description="Maximum number of latest readings to return"),
    reading_repo = Depends(
        get_sensor_reading_repository)
):
    """Get the most recent sensor readings across all sensors"""
    try:
        return await reading_repo.get_latest_readings(limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/readings/alerts", response_model=List[SensorReading])
async def get_active_alerts(
    reading_repo = Depends(
        get_sensor_reading_repository)
):
    """Get all active sensor alerts"""
    try:
        return await reading_repo.get_active_alerts()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{sensor_id}/stats")
async def get_sensor_statistics(
    sensor_id: UUID = Path(..., description="Unique sensor identifier"),
    reading_repo = Depends(
        get_sensor_reading_repository)
):
    """Get statistical summary for a specific sensor"""
    try:
        stats = await reading_repo.get_sensor_stats(sensor_id)
        if not stats:
            raise HTTPException(
                status_code=404,
                detail=f"No statistics available for sensor {sensor_id} (sensor may not exist or have no readings)"
            )
        return stats
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting stats for sensor {sensor_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# HEALTH CHECK AND UTILITY ENDPOINTS


@router.get("/health", status_code=200)
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "sensor-api"}


@router.get("/component/{component_id}/readings", response_model=List[SensorReading])
async def get_component_readings(
    component_id: str = Path(..., description="Component identifier"),
    start_date: Optional[datetime] = Query(
        None, description="Filter readings from this date"),
    end_date: Optional[datetime] = Query(
        None, description="Filter readings until this date"),
    skip: int = Query(0, ge=0, description="Number of readings to skip"),
    limit: int = Query(100, ge=1, le=1000,
                       description="Maximum number of readings to return"),
    reading_repo = Depends(
        get_sensor_reading_repository)
):
    """Get all readings for sensors belonging to a specific component"""
    try:
        # Validate date range
        if start_date and end_date and start_date > end_date:
            raise HTTPException(
                status_code=400, detail="start_date must be before end_date")

        return await reading_repo.get_readings(
            component_id=component_id,
            start_date=start_date,
            end_date=end_date,
            skip=skip,
            limit=limit
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/component/{component_id}/alerts", response_model=List[SensorReading])
async def get_component_alerts(
    component_id: str = Path(..., description="Component identifier"),
    reading_repo = Depends(
        get_sensor_reading_repository)
):
    """Get active alerts for all sensors in a specific component"""
    try:
        # Get all alerts and filter by component_id
        all_alerts = await reading_repo.get_active_alerts()
        component_alerts = [
            alert for alert in all_alerts if alert.component_id == component_id]
        return component_alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


from fastapi import APIRouter, Query, Depends, HTTPException
from typing import List, Optional
from datetime import datetime
import re
from dateutil import parser

async def parse_time_query(time_query: str) -> dict:
    """
    Parse natural language time queries into function parameters.
    Returns a dict with parameters for get_readings_time_based()
    """
    if not time_query:
        return {}
    
    query = time_query.lower().strip()
    params = {}
    
    # Relative time patterns
    if match := re.search(r'last\s+(\d+)\s+hours?', query):
        params['last_hours'] = int(match.group(1))
    elif match := re.search(r'past\s+(\d+)\s+hours?', query):
        params['last_hours'] = int(match.group(1))
    elif match := re.search(r'(\d+)\s+hours?\s+ago', query):
        params['last_hours'] = int(match.group(1))
    
    elif match := re.search(r'last\s+(\d+)\s+days?', query):
        params['last_days'] = int(match.group(1))
    elif match := re.search(r'past\s+(\d+)\s+days?', query):
        params['last_days'] = int(match.group(1))
    elif match := re.search(r'(\d+)\s+days?\s+ago', query):
        params['last_days'] = int(match.group(1))
    
    elif match := re.search(r'last\s+(\d+)\s+weeks?', query):
        params['last_weeks'] = int(match.group(1))
    elif match := re.search(r'past\s+(\d+)\s+weeks?', query):
        params['last_weeks'] = int(match.group(1))
    
    elif match := re.search(r'last\s+(\d+)\s+months?', query):
        params['last_months'] = int(match.group(1))
    elif match := re.search(r'past\s+(\d+)\s+months?', query):
        params['last_months'] = int(match.group(1))
    
    # Special relative periods
    elif 'last week' in query or 'past week' in query:
        params['last_days'] = 7
    elif 'last month' in query or 'past month' in query:
        params['last_months'] = 1
    elif 'last year' in query or 'past year' in query:
        params['last_months'] = 12
    
    # Today/Yesterday
    elif query in ['today', "today's", 'today data', 'todays data']:
        params['today'] = True
    elif query in ['yesterday', "yesterday's", 'yesterday data', 'yesterdays data']:
        params['yesterday'] = True
    
    # Month patterns
    elif match := re.search(r'(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)\s+(\d{4})', query):
        params['month_name'] = match.group(1)
        params['year'] = int(match.group(2))
    elif match := re.search(r'(\d{4})\s+(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)', query):
        params['year'] = int(match.group(1))
        params['month_name'] = match.group(2)
    elif match := re.search(r'(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)', query):
        params['month_name'] = match.group(1)
    
    # Year patterns
    elif match := re.search(r'^\s*(\d{4})\s*$', query):
        params['year'] = int(match.group(1))
    elif match := re.search(r'year\s+(\d{4})', query):
        params['year'] = int(match.group(1))
    
    # Week patterns
    elif match := re.search(r'week\s+(\d+)(?:\s+of\s+(\d{4}))?', query):
        params['week_number'] = int(match.group(1))
        if match.group(2):
            params['year'] = int(match.group(2))
    
    # This week/month/year
    elif 'this week' in query:
        params['last_days'] = 7
    elif 'this month' in query:
        now = datetime.now()
        params['year'] = now.year
        params['month'] = now.month
    elif 'this year' in query:
        params['year'] = datetime.now().year
    
    # Date range patterns (basic ISO format)
    elif match := re.search(r'(\d{4}-\d{2}-\d{2})(?:\s+to\s+|\s*-\s*)(\d{4}-\d{2}-\d{2})', query):
        try:
            params['start_date'] = parser.parse(match.group(1))
            params['end_date'] = parser.parse(match.group(2))
        except:
            pass
    
    # Common shortcuts
    elif query in ['recent', 'recently', 'latest']:
        params['last_hours'] = 24
    elif query in ['overnight', 'last night']:
        params['last_hours'] = 12
    elif query in ['this morning']:
        now = datetime.now()
        params['start_date'] = now.replace(hour=6, minute=0, second=0, microsecond=0)
        params['end_date'] = now.replace(hour=12, minute=0, second=0, microsecond=0)
    
    return params


@router.get("/readings/query", response_model=List[SensorReadingResponse])
async def get_readings_by_query(
    q: str = Query(
        ..., 
        description="Natural language time query",
        example="last 24 hours"
    ),
    sensor_id: Optional[UUID] = Query(None, description="Filter by sensor ID"),
    component_id: Optional[UUID] = Query(None, description="Filter by component ID"),
    skip: int = Query(0, ge=0, description="Records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum readings to return"),
    reading_repo = Depends(get_sensor_reading_repository)
):
    """
    Get sensor readings using natural language time queries.
    
    ## Supported Query Examples:
    
    ### Relative Time:
    - "last 24 hours" / "past 24 hours" / "24 hours ago"
    - "last 7 days" / "past 7 days" / "7 days ago"
    - "last 2 weeks" / "past 2 weeks"
    - "last 3 months" / "past 3 months"
    - "last week" / "last month" / "last year"
    
    ### Specific Days:
    - "today" / "today's" / "today data"
    - "yesterday" / "yesterday's" / "yesterday data"
    
    ### Months:
    - "august 2025" / "2025 august" / "aug 2025"
    - "january" / "jan" (current year)
    - "december 2024" / "dec 2024"
    
    ### Years:
    - "2025" / "year 2025"
    - "2024"
    
    ### Weeks:
    - "week 35" / "week 35 of 2025"
    
    ### Current Periods:
    - "this week" / "this month" / "this year"
    
    ### Date Ranges:
    - "2025-08-01 to 2025-08-31"
    - "2025-01-01 - 2025-12-31"
    
    ### Common Shortcuts:
    - "recent" / "recently" / "latest" (last 24 hours)
    - "overnight" / "last night" (last 12 hours)
    - "this morning" (6 AM to 12 PM today)
    
    ### Combined Examples:
    - `?q=last 48 hours&sensor_id=temp_01`
    - `?q=august 2025&component_id=hvac&limit=500`
    - `?q=today&sensor_id=hum_01`
    """
    try:
        # Parse the natural language query
        time_params = await parse_time_query(q)
        
        if not time_params:
            raise HTTPException(
                status_code=400,
                detail=f"Could not understand time query: '{q}'. Please try queries like 'last 24 hours', 'today', 'august 2025', etc."
            )
        
        # Call the repository with parsed parameters
        readings = await reading_repo.get_readings_time_based(
            sensor_id=sensor_id,
            component_id=component_id,
            skip=skip,
            limit=limit,
            **time_params
        )
        
        return readings
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Log the actual error for debugging
        print(f"Error in get_readings_by_query: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
@router.get("/readings/ask", response_model=List[SensorReadingResponse])
async def get_readings_by_query(
    q: str = Query(
        ..., 
        description="Natural language time query",
        example="last 24 hours"
    ),
    sensor_name: Optional[str] = Query(None, description="Filter by sensor name"),
    component_id: Optional[UUID] = Query(None, description="Filter by component ID"),
    skip: int = Query(0, ge=0, description="Records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum readings to return"),
    reading_repo = Depends(get_sensor_reading_repository),
    metadata_repo = Depends(get_sensor_repository)
):
    """
    Get sensor readings using natural language time queries.
    
    ## Supported Query Examples:
    
    ### Relative Time:
    - "last 24 hours" / "past 24 hours" / "24 hours ago"
    - "last 7 days" / "past 7 days" / "7 days ago"
    - "last 2 weeks" / "past 2 weeks"
    - "last 3 months" / "past 3 months"
    - "last week" / "last month" / "last year"
    
    ### Specific Days:
    - "today" / "today's" / "today data"
    - "yesterday" / "yesterday's" / "yesterday data"
    
    ### Months:
    - "august 2025" / "2025 august" / "aug 2025"
    - "january" / "jan" (current year)
    - "december 2024" / "dec 2024"
    
    ### Years:
    - "2025" / "year 2025"
    - "2024"
    
    ### Weeks:
    - "week 35" / "week 35 of 2025"
    
    ### Current Periods:
    - "this week" / "this month" / "this year"
    
    ### Date Ranges:
    - "2025-08-01 to 2025-08-31"
    - "2025-01-01 - 2025-12-31"
    
    ### Common Shortcuts:
    - "recent" / "recently" / "latest" (last 24 hours)
    - "overnight" / "last night" (last 12 hours)
    - "this morning" (6 AM to 12 PM today)
    
    ### Combined Examples:
    - `?q=last 48 hours&sensor_id=temp_01`
    - `?q=august 2025&component_id=hvac&limit=500`
    - `?q=today&sensor_id=hum_01`
    """
    try:
        # Parse the natural language query
        time_params = await parse_time_query(q)
        print("time_params",time_params)
        sensor_id=await metadata_repo.get_sensorid_by_name(sensor_name,component_id)
        if not time_params:
            raise HTTPException(
                status_code=400,
                detail=f"Could not understand time query: '{q}'. Please try queries like 'last 24 hours', 'today', 'august 2025', etc."
            )
        
        # Call the repository with parsed parameters
        readings = await reading_repo.get_readings_time_based(
            sensor_id=sensor_id,
            component_id=component_id,
            skip=skip,
            limit=limit,
            **time_params
        )
        
        return readings
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Log the actual error for debugging
        print(f"Error in get_readings_by_query: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

