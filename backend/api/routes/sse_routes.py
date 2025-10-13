import sys
sys.path.append('..')

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from typing import Optional, Dict, Any
from uuid import UUID
import logging
from datetime import datetime

# Import your analytics service
from api.db.connection import get_async_db_service
from api.db.repos.sensor.analytics import SensorAnalyticsService

# Configure logging
logger = logging.getLogger(__name__)

# Create the router
router = APIRouter(
    prefix="/sensors/{sensor_id}/analytics",
    tags=["Sensor Analytics"],
    responses={
        404: {"description": "Sensor not found or no data available"},
        500: {"description": "Internal server error"},
    }
)

# Dependency to get analytics service
async def get_analytics_service():
    """Dependency to get the analytics service instance"""
    async_service = get_async_db_service()
    return SensorAnalyticsService(async_service)

# Individual Analytics Endpoints

@router.get("/standard", 
    summary="Get Standard Statistics",
    description="Retrieve basic sensor statistics including count, averages, min/max values, and alert counts",
    response_model=Dict[str, Any]
)
async def get_standard_stats(
    sensor_id: UUID,
    analytics_service: SensorAnalyticsService = Depends(get_analytics_service)
) -> Dict[str, Any]:
    """Get standard sensor statistics"""
    try:
        stats = await analytics_service.get_standard_stats(sensor_id)
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No data found for sensor {sensor_id}"
            )
        return stats
    except Exception as e:
        logger.error(f"Error getting standard stats for sensor {sensor_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve standard statistics"
        )

@router.get("/distribution",
    summary="Get Distribution Statistics", 
    description="Retrieve statistical distribution data including standard deviation, variance, and percentiles",
    response_model=Dict[str, Any]
)
async def get_distribution_stats(
    sensor_id: UUID,
    analytics_service: SensorAnalyticsService = Depends(get_analytics_service)
) -> Dict[str, Any]:
    """Get distribution statistics"""
    try:
        stats = await analytics_service.get_distribution_stats(sensor_id)
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No data found for sensor {sensor_id}"
            )
        return stats
    except Exception as e:
        logger.error(f"Error getting distribution stats for sensor {sensor_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve distribution statistics"
        )

@router.get("/temporal",
    summary="Get Temporal Analysis",
    description="Retrieve time-based patterns and temporal statistics",
    response_model=Dict[str, Any]
)
async def get_temporal_stats(
    sensor_id: UUID,
    analytics_service: SensorAnalyticsService = Depends(get_analytics_service)
) -> Dict[str, Any]:
    """Get temporal analysis statistics"""
    try:
        stats = await analytics_service.get_temporal_stats(sensor_id)
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No data found for sensor {sensor_id}"
            )
        return stats
    except Exception as e:
        logger.error(f"Error getting temporal stats for sensor {sensor_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve temporal statistics"
        )

@router.get("/alerts",
    summary="Get Alert Intelligence",
    description="Retrieve alert-related statistics and intelligence",
    response_model=Dict[str, Any]
)
async def get_alert_stats(
    sensor_id: UUID,
    analytics_service: SensorAnalyticsService = Depends(get_analytics_service)
) -> Dict[str, Any]:
    """Get alert intelligence statistics"""
    try:
        stats = await analytics_service.get_alert_stats(sensor_id)
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No data found for sensor {sensor_id}"
            )
        return stats
    except Exception as e:
        logger.error(f"Error getting alert stats for sensor {sensor_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve alert statistics"
        )

@router.get("/operational",
    summary="Get Operational Performance",
    description="Retrieve operational performance metrics and statistics",
    response_model=Dict[str, Any]
)
async def get_operational_stats(
    sensor_id: UUID,
    analytics_service: SensorAnalyticsService = Depends(get_analytics_service)
) -> Dict[str, Any]:
    """Get operational performance statistics"""
    try:
        stats = await analytics_service.get_operational_stats(sensor_id)
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No data found for sensor {sensor_id}"
            )
        return stats
    except Exception as e:
        logger.error(f"Error getting operational stats for sensor {sensor_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve operational statistics"
        )

@router.get("/quality",
    summary="Get Data Quality Statistics",
    description="Retrieve data quality metrics including completeness, duplicates, and outliers",
    response_model=Dict[str, Any]
)
async def get_quality_stats(
    sensor_id: UUID,
    analytics_service: SensorAnalyticsService = Depends(get_analytics_service)
) -> Dict[str, Any]:
    """Get data quality statistics"""
    try:
        stats = await analytics_service.get_quality_stats(sensor_id)
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No data found for sensor {sensor_id}"
            )
        return stats
    except Exception as e:
        logger.error(f"Error getting quality stats for sensor {sensor_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve quality statistics"
        )

@router.get("/activity",
    summary="Get Activity Statistics",
    description="Retrieve sensor activity patterns and usage statistics",
    response_model=Dict[str, Any]
)
async def get_activity_stats(
    sensor_id: UUID,
    analytics_service: SensorAnalyticsService = Depends(get_analytics_service)
) -> Dict[str, Any]:
    """Get activity statistics"""
    try:
        stats = await analytics_service.get_activity_stats(sensor_id)
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No data found for sensor {sensor_id}"
            )
        return stats
    except Exception as e:
        logger.error(f"Error getting activity stats for sensor {sensor_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve activity statistics"
        )

@router.get("/trends",
    summary="Get Trend Analysis",
    description="Retrieve trend analysis and directional statistics",
    response_model=Dict[str, Any]
)
async def get_trend_stats(
    sensor_id: UUID,
    analytics_service: SensorAnalyticsService = Depends(get_analytics_service)
) -> Dict[str, Any]:
    """Get trend analysis statistics"""
    try:
        stats = await analytics_service.get_trend_stats(sensor_id)
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No data found for sensor {sensor_id}"
            )
        return stats
    except Exception as e:
        logger.error(f"Error getting trend stats for sensor {sensor_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve trend statistics"
        )

# Composite Analytics Endpoints

@router.get("/dashboard/quick",
    summary="Quick Dashboard Analytics",
    description="Get combined standard and quality statistics for quick dashboard view",
    response_model=Dict[str, Any]
)
async def get_quick_dashboard(
    sensor_id: UUID,
    analytics_service: SensorAnalyticsService = Depends(get_analytics_service)
) -> Dict[str, Any]:
    """Get quick dashboard analytics (standard + quality)"""
    try:
        stats = await analytics_service.get_quick_dashboard_stats(sensor_id)
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No data found for sensor {sensor_id}"
            )
        return stats
    except Exception as e:
        logger.error(f"Error getting quick dashboard for sensor {sensor_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve quick dashboard statistics"
        )

@router.get("/analysis/deep",
    summary="Deep Analysis Suite",
    description="Get comprehensive analysis including distribution and temporal statistics",
    response_model=Dict[str, Any]
)
async def get_deep_analysis(
    sensor_id: UUID,
    analytics_service: SensorAnalyticsService = Depends(get_analytics_service)
) -> Dict[str, Any]:
    """Get deep analysis suite (distribution + temporal)"""
    try:
        stats = await analytics_service.get_deep_analysis_stats(sensor_id)
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No data found for sensor {sensor_id}"
            )
        return stats
    except Exception as e:
        logger.error(f"Error getting deep analysis for sensor {sensor_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve deep analysis statistics"
        )

@router.get("/management/alerts",
    summary="Alert Management System",
    description="Get alert intelligence combined with operational performance metrics",
    response_model=Dict[str, Any]
)
async def get_alert_management(
    sensor_id: UUID,
    analytics_service: SensorAnalyticsService = Depends(get_analytics_service)
) -> Dict[str, Any]:
    """Get alert management statistics (alerts + operations)"""
    try:
        stats = await analytics_service.get_alert_management_stats(sensor_id)
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No data found for sensor {sensor_id}"
            )
        return stats
    except Exception as e:
        logger.error(f"Error getting alert management for sensor {sensor_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve alert management statistics"
        )

@router.get("/monitor/health",
    summary="Sensor Health Monitor",
    description="Get sensor health monitoring data including activity and trend analysis",
    response_model=Dict[str, Any]
)
async def get_health_monitor(
    sensor_id: UUID,
    analytics_service: SensorAnalyticsService = Depends(get_analytics_service)
) -> Dict[str, Any]:
    """Get health monitor statistics (activity + trends)"""
    try:
        stats = await analytics_service.get_health_monitor_stats(sensor_id)
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No data found for sensor {sensor_id}"
            )
        return stats
    except Exception as e:
        logger.error(f"Error getting health monitor for sensor {sensor_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve health monitor statistics"
        )

@router.get("/complete",
    summary="Complete Analytics Suite",
    description="Get all available analytics categories in a single comprehensive response",
    response_model=Dict[str, Any]
)
async def get_complete_analytics(
    sensor_id: UUID,
    analytics_service: SensorAnalyticsService = Depends(get_analytics_service)
) -> Dict[str, Any]:
    """Get complete analytics suite - all categories"""
    try:
        stats = await analytics_service.get_complete_analytics(sensor_id)
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No data found for sensor {sensor_id}"
            )
        return stats
    except Exception as e:
        logger.error(f"Error getting complete analytics for sensor {sensor_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve complete analytics"
        )

# Health Check Endpoint
@router.get("/health",
    summary="Analytics Service Health Check",
    description="Check if the analytics service is operational",
    response_model=Dict[str, Any]
)
async def analytics_health_check() -> Dict[str, Any]:
    """Health check for analytics service"""
    return {
        "service": "sensor_analytics",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

# Utility endpoint to list available analytics
@router.get("/",
    summary="List Available Analytics",
    description="Get a list of all available analytics endpoints and their descriptions",
    response_model=Dict[str, Any]
)
async def list_analytics_endpoints() -> Dict[str, Any]:
    """List all available analytics endpoints"""
    return {
        "sensor_analytics": {
            "individual": {
                "standard": "Basic statistics (count, avg, min, max, alerts)",
                "distribution": "Statistical distribution (std dev, variance, percentiles)",
                "temporal": "Time-based patterns and analysis",
                "alerts": "Alert intelligence and patterns",
                "operational": "Operational performance metrics",
                "quality": "Data quality assessment",
                "activity": "Activity patterns and usage",
                "trends": "Trend analysis and direction"
            },
            "composite": {
                "quick_dashboard": "Standard + Quality (for dashboards)",
                "deep_analysis": "Distribution + Temporal (comprehensive analysis)",
                "alert_management": "Alerts + Operations (alert management)",
                "health_monitor": "Activity + Trends (sensor health)",
                "complete": "All analytics categories combined"
            },
            "utilities": {
                "health": "Service health check",
                "list": "This endpoint - lists all available analytics"
            }
        },
        "usage": {
            "base_url": "/sensors/{sensor_id}/analytics",
            "example": "/sensors/123e4567-e89b-12d3-a456-426614174000/analytics/standard"
        }
    }