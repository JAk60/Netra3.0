import sys
sys.path.append('..')
import asyncio
from typing import Optional
from uuid import UUID
from sqlmodel import func, cast, String, Integer, case
from sqlmodel import Session, select
from api.models.sensor import (
    SensorReading
)
from api.db.connection import get_session_context
from typing import Optional

class SensorAnalyticsService:
    def __init__(self, async_service):
        self.async_service = async_service

    # 1. Standard Stats (Your Current Implementation)
    def _get_standard_stats_sync(self, session: Session, sensor_id: UUID) -> Optional[dict]:
        """Standard sensor statistics"""
        statement = select(
            func.count(SensorReading.id).label("total_readings"),
            func.avg(SensorReading.value).label("avg_value"),
            func.min(SensorReading.value).label("min_value"),
            func.max(SensorReading.value).label("max_value"),
            func.sum(func.cast(SensorReading.alert, Integer)).label("alert_count"),
            func.max(SensorReading.date).label("last_reading_date")
        ).where(SensorReading.sensor_id == sensor_id)

        result = session.exec(statement).first()
        if result and result.total_readings > 0:
            return {
                "sensor_id": sensor_id,
                "total_readings": result.total_readings,
                "avg_value": float(result.avg_value),
                "min_value": float(result.min_value),
                "max_value": float(result.max_value),
                "alert_count": result.alert_count,
                "last_reading_date": result.last_reading_date
            }
        return None

    async def get_standard_stats(self, sensor_id: UUID) -> Optional[dict]:
        """Async standard sensor statistics"""
        def _get():
            with get_session_context() as session:
                return self._get_standard_stats_sync(session, sensor_id)
        return await self.async_service.run_in_thread(_get)

    # 2. Statistical Distribution Stats
    def _get_distribution_stats_sync(self, session: Session, sensor_id: UUID) -> Optional[dict]:
        """Statistical distribution analyzer"""
        statement = select(
            func.stdev(SensorReading.value).label("std_deviation"),
            func.var(SensorReading.value).label("variance"),
            func.percentile_cont(0.5).within_group(SensorReading.value.asc()).label("median_value"),
            func.percentile_cont(0.25).within_group(SensorReading.value.asc()).label("percentile_25"),
            func.percentile_cont(0.75).within_group(SensorReading.value.asc()).label("percentile_75"),
            func.percentile_cont(0.95).within_group(SensorReading.value.asc()).label("percentile_95"),
            (func.max(SensorReading.value) - func.min(SensorReading.value)).label("value_range"),
            func.count(SensorReading.id).label("total_readings")
        ).where(SensorReading.sensor_id == sensor_id)

        result = session.exec(statement).first()
        if result and result.total_readings > 0:
            return {
                "sensor_id": sensor_id,
                "std_deviation": float(result.std_deviation) if result.std_deviation else 0.0,
                "variance": float(result.variance) if result.variance else 0.0,
                "median_value": float(result.median_value) if result.median_value else 0.0,
                "percentile_25": float(result.percentile_25) if result.percentile_25 else 0.0,
                "percentile_75": float(result.percentile_75) if result.percentile_75 else 0.0,
                "percentile_95": float(result.percentile_95) if result.percentile_95 else 0.0,
                "value_range": float(result.value_range) if result.value_range else 0.0,
                "total_readings": result.total_readings
            }
        return None

    async def get_distribution_stats(self, sensor_id: UUID) -> Optional[dict]:
        """Async distribution statistics"""
        def _get():
            with get_session_context() as session:
                return self._get_distribution_stats_sync(session, sensor_id)
        return await self.async_service.run_in_thread(_get)

    # 3. Temporal Analysis Stats
    def _get_temporal_stats_sync(self, session: Session, sensor_id: UUID) -> Optional[dict]:
        """Time pattern analyzer"""
        statement = select(
            func.min(SensorReading.date).label("first_reading_date"),
            func.max(SensorReading.date).label("last_reading_date"),
            func.count(func.distinct(cast(SensorReading.date, String))).label("active_days"),
            func.count(SensorReading.id).label("total_readings"),
            func.datediff('second', func.min(SensorReading.date), func.max(SensorReading.date)).label("total_duration_seconds")
        ).where(SensorReading.sensor_id == sensor_id)

        result = session.exec(statement).first()
        if result and result.total_readings > 0:
            avg_readings_per_day = result.total_readings / result.active_days if result.active_days > 0 else 0
            
            return {
                "sensor_id": sensor_id,
                "first_reading_date": result.first_reading_date,
                "last_reading_date": result.last_reading_date,
                "active_days": result.active_days,
                "total_readings": result.total_readings,
                "avg_readings_per_day": float(avg_readings_per_day),
                "total_duration_seconds": float(result.total_duration_seconds) if result.total_duration_seconds else 0.0,
                "total_duration_hours": float(result.total_duration_seconds / 3600) if result.total_duration_seconds else 0.0
            }
        return None

    async def get_temporal_stats(self, sensor_id: UUID) -> Optional[dict]:
        """Async temporal analysis statistics"""
        def _get():
            with get_session_context() as session:
                return self._get_temporal_stats_sync(session, sensor_id)
        return await self.async_service.run_in_thread(_get)

    # 4. Alert Intelligence Stats
    def _get_alert_stats_sync(self, session: Session, sensor_id: UUID) -> Optional[dict]:
        """Alert analyzer"""
        statement = select(
            func.count(SensorReading.id).label("total_readings"),
            func.sum(cast(SensorReading.alert, Integer)).label("alert_count"),
            func.max(
                case(
                    (SensorReading.alert == True, SensorReading.date),
                    else_=None
                )
            ).label("last_alert_date"),
            func.min(
                case(
                    (SensorReading.alert == True, SensorReading.date),
                    else_=None
                )
            ).label("first_alert_date"),
            func.avg(
                case(
                    (SensorReading.alert == True, SensorReading.value),
                    else_=None
                )
            ).label("avg_alert_value"),
            func.sum(
                case(
                    (SensorReading.alert == True, 1),
                    else_=0
                )
            ).label("alert_readings")
        ).where(SensorReading.sensor_id == sensor_id)

        result = session.exec(statement).first()
        if result and result.total_readings > 0:
            alert_percentage = (result.alert_count * 100.0 / result.total_readings) if result.total_readings > 0 else 0.0
            
            return {
                "sensor_id": sensor_id,
                "total_readings": result.total_readings,
                "alert_count": result.alert_count or 0,
                "alert_percentage": float(alert_percentage),
                "last_alert_date": result.last_alert_date,
                "first_alert_date": result.first_alert_date,
                "avg_alert_value": float(result.avg_alert_value) if result.avg_alert_value else None,
                "alert_readings": result.alert_readings or 0
            }
        return None

    async def get_alert_stats(self, sensor_id: UUID) -> Optional[dict]:
        """Async alert intelligence statistics"""
        def _get():
            with get_session_context() as session:
                return self._get_alert_stats_sync(session, sensor_id)
        return await self.async_service.run_in_thread(_get)

    # 5. Operational Performance Stats
    def _get_operational_stats_sync(self, session: Session, sensor_id: UUID) -> Optional[dict]:
        """Operations monitor"""
        statement = select(
            func.count(SensorReading.id).label("total_readings"),
            func.avg(SensorReading.operating_hours).label("avg_operating_hours"),
            func.min(SensorReading.operating_hours).label("min_operating_hours"),
            func.max(SensorReading.operating_hours).label("max_operating_hours"),
            func.sum(
                case(
                    (SensorReading.operating_hours.is_(None), 1),
                    else_=0
                )
            ).label("null_operating_hours_count")
        ).where(SensorReading.sensor_id == sensor_id)

        result = session.exec(statement).first()
        if result and result.total_readings > 0:
            readings_per_operating_hour = (result.total_readings / result.max_operating_hours) if result.max_operating_hours and result.max_operating_hours > 0 else 0
            
            return {
                "sensor_id": sensor_id,
                "total_readings": result.total_readings,
                "avg_operating_hours": float(result.avg_operating_hours) if result.avg_operating_hours else None,
                "min_operating_hours": float(result.min_operating_hours) if result.min_operating_hours else None,
                "max_operating_hours": float(result.max_operating_hours) if result.max_operating_hours else None,
                "null_operating_hours_count": result.null_operating_hours_count,
                "readings_per_operating_hour": float(readings_per_operating_hour)
            }
        return None

    async def get_operational_stats(self, sensor_id: UUID) -> Optional[dict]:
        """Async operational performance statistics"""
        def _get():
            with get_session_context() as session:
                return self._get_operational_stats_sync(session, sensor_id)
        return await self.async_service.run_in_thread(_get)

    # 6. Data Quality Stats
    def _get_quality_stats_sync(self, session: Session, sensor_id: UUID) -> Optional[dict]:
        """Quality checker"""
        # First query for basic stats
        basic_statement = select(
            func.count(SensorReading.id).label("total_readings"),
            func.sum(
                case(
                    (SensorReading.operating_hours.is_(None), 1),
                    else_=0
                )
            ).label("null_count"),
            func.count(func.distinct(SensorReading.value)).label("unique_values"),
            func.avg(SensorReading.value).label("avg_value"),
            func.stdev(SensorReading.value).label("std_deviation")
        ).where(SensorReading.sensor_id == sensor_id)

        basic_result = session.exec(basic_statement).first()
        
        if basic_result and basic_result.total_readings > 0:
            null_percentage = (basic_result.null_count * 100.0 / basic_result.total_readings) if basic_result.total_readings > 0 else 0.0
            
            # Second query for outliers (using the calculated avg and stddev)
            if basic_result.avg_value and basic_result.std_deviation:
                outlier_threshold_upper = basic_result.avg_value + (3 * basic_result.std_deviation)
                outlier_threshold_lower = basic_result.avg_value - (3 * basic_result.std_deviation)
                
                outlier_statement = select(
                    func.sum(
                        case(
                            ((SensorReading.value > outlier_threshold_upper) | 
                             (SensorReading.value < outlier_threshold_lower), 1),
                            else_=0
                        )
                    ).label("outlier_count")
                ).where(SensorReading.sensor_id == sensor_id)
                
                outlier_result = session.exec(outlier_statement).first()
                outlier_count = outlier_result.outlier_count if outlier_result else 0
            else:
                outlier_count = 0

            # Duplicate detection query - simplified for SQL Server
            duplicate_statement = select(
                func.count(SensorReading.id).label("total_count"),
                func.count(func.distinct(
                    cast(SensorReading.date, String) + '|' + cast(SensorReading.value, String)
                )).label("unique_combinations")
            ).where(SensorReading.sensor_id == sensor_id)
            
            duplicate_result = session.exec(duplicate_statement).first()
            potential_duplicates = (duplicate_result.total_count - duplicate_result.unique_combinations) if duplicate_result else 0

            return {
                "sensor_id": sensor_id,
                "total_readings": basic_result.total_readings,
                "null_count": basic_result.null_count,
                "null_percentage": float(null_percentage),
                "unique_values": basic_result.unique_values,
                "potential_duplicates": potential_duplicates,
                "outlier_count": outlier_count,
                "data_completeness": float(100.0 - null_percentage)
            }
        return None

    async def get_quality_stats(self, sensor_id: UUID) -> Optional[dict]:
        """Async data quality statistics"""
        def _get():
            with get_session_context() as session:
                return self._get_quality_stats_sync(session, sensor_id)
        return await self.async_service.run_in_thread(_get)

    # 7. Sensor Activity Stats (Modified for single sensor)
    def _get_activity_stats_sync(self, session: Session, sensor_id: UUID) -> Optional[dict]:
        """Activity monitor for single sensor"""
        statement = select(
            func.count(SensorReading.id).label("total_readings"),
            func.count(func.distinct(SensorReading.component_id)).label("unique_components"),
            func.count(func.distinct(cast(SensorReading.date, String))).label("active_days"),
            func.min(SensorReading.date).label("first_activity"),
            func.max(SensorReading.date).label("last_activity")
        ).where(SensorReading.sensor_id == sensor_id)

        result = session.exec(statement).first()
        if result and result.total_readings > 0:
            avg_readings_per_day = result.total_readings / result.active_days if result.active_days > 0 else 0
            
            return {
                "sensor_id": sensor_id,
                "total_readings": result.total_readings,
                "unique_components": result.unique_components,
                "active_days": result.active_days,
                "avg_readings_per_day": float(avg_readings_per_day),
                "first_activity": result.first_activity,
                "last_activity": result.last_activity
            }
        return None

    async def get_activity_stats(self, sensor_id: UUID) -> Optional[dict]:
        """Async sensor activity statistics"""
        def _get():
            with get_session_context() as session:
                return self._get_activity_stats_sync(session, sensor_id)
        return await self.async_service.run_in_thread(_get)

    # 8. Trend Analysis Stats
    def _get_trend_stats_sync(self, session: Session, sensor_id: UUID) -> Optional[dict]:
        """Trend analyzer"""
        # Basic trend calculation
        basic_statement = select(
            func.count(SensorReading.id).label("total_readings"),
            func.first_value(SensorReading.value).over(
                order_by=SensorReading.date.asc()
            ).label("first_value"),
            func.last_value(SensorReading.value).over(
                order_by=SensorReading.date.desc()
            ).label("last_value"),
            func.avg(
                case(
                    (SensorReading.date >= func.dateadd('day', -7, func.getdate()), 
                     SensorReading.value),
                    else_=None
                )
            ).label("recent_avg_7d"),
            func.avg(
                case(
                    (SensorReading.date >= func.dateadd('day', -30, func.getdate()), 
                     SensorReading.value),
                    else_=None
                )
            ).label("recent_avg_30d"),
            func.avg(SensorReading.value).label("overall_avg")
        ).where(SensorReading.sensor_id == sensor_id)

        result = session.exec(basic_statement).first()
        if result and result.total_readings > 0:
            # Calculate trend direction
            total_value_change = (result.last_value - result.first_value) if (result.last_value and result.first_value) else 0
            
            # Trend direction analysis
            if total_value_change > 0:
                trend_direction = "increasing"
            elif total_value_change < 0:
                trend_direction = "decreasing"
            else:
                trend_direction = "stable"

            return {
                "sensor_id": sensor_id,
                "total_readings": result.total_readings,
                "first_value": float(result.first_value) if result.first_value else None,
                "last_value": float(result.last_value) if result.last_value else None,
                "total_value_change": float(total_value_change),
                "trend_direction": trend_direction,
                "recent_avg_7d": float(result.recent_avg_7d) if result.recent_avg_7d else None,
                "recent_avg_30d": float(result.recent_avg_30d) if result.recent_avg_30d else None,
                "overall_avg": float(result.overall_avg) if result.overall_avg else None,
                "recent_vs_overall_7d": float(result.recent_avg_7d / result.overall_avg - 1) if (result.recent_avg_7d and result.overall_avg and result.overall_avg != 0) else None,
                "recent_vs_overall_30d": float(result.recent_avg_30d / result.overall_avg - 1) if (result.recent_avg_30d and result.overall_avg and result.overall_avg != 0) else None
            }
        return None

    async def get_trend_stats(self, sensor_id: UUID) -> Optional[dict]:
        """Async trend analysis statistics"""
        def _get():
            with get_session_context() as session:
                return self._get_trend_stats_sync(session, sensor_id)
        return await self.async_service.run_in_thread(_get)

    # Composite Analytics Functions
    async def get_quick_dashboard_stats(self, sensor_id: UUID) -> Optional[dict]:
        """Quick Stats Dashboard: Standard + Data Quality"""
        standard_stats = await self.get_standard_stats(sensor_id)
        quality_stats = await self.get_quality_stats(sensor_id)
        
        if standard_stats and quality_stats:
            return {
                "sensor_id": sensor_id,
                "dashboard_type": "quick",
                "standard": standard_stats,
                "quality": quality_stats
            }
        return None

    async def get_deep_analysis_stats(self, sensor_id: UUID) -> Optional[dict]:
        """Deep Analysis Suite: Statistical Distribution + Temporal Analysis"""
        distribution_stats = await self.get_distribution_stats(sensor_id)
        temporal_stats = await self.get_temporal_stats(sensor_id)
        
        if distribution_stats and temporal_stats:
            return {
                "sensor_id": sensor_id,
                "analysis_type": "deep",
                "distribution": distribution_stats,
                "temporal": temporal_stats
            }
        return None

    async def get_alert_management_stats(self, sensor_id: UUID) -> Optional[dict]:
        """Alert Management System: Alert Intelligence + Operational Performance"""
        alert_stats = await self.get_alert_stats(sensor_id)
        operational_stats = await self.get_operational_stats(sensor_id)
        
        if alert_stats and operational_stats:
            return {
                "sensor_id": sensor_id,
                "management_type": "alerts",
                "alerts": alert_stats,
                "operations": operational_stats
            }
        return None

    async def get_health_monitor_stats(self, sensor_id: UUID) -> Optional[dict]:
        """Sensor Health Monitor: Activity + Trend Analysis"""
        activity_stats = await self.get_activity_stats(sensor_id)
        trend_stats = await self.get_trend_stats(sensor_id)
        
        if activity_stats and trend_stats:
            return {
                "sensor_id": sensor_id,
                "monitor_type": "health",
                "activity": activity_stats,
                "trends": trend_stats
            }
        return None

    async def get_complete_analytics(self, sensor_id: UUID) -> Optional[dict]:
        """Complete analytics suite - all categories"""
        results = await asyncio.gather(
            self.get_standard_stats(sensor_id),
            self.get_distribution_stats(sensor_id),
            self.get_temporal_stats(sensor_id),
            self.get_alert_stats(sensor_id),
            self.get_operational_stats(sensor_id),
            self.get_quality_stats(sensor_id),
            self.get_activity_stats(sensor_id),
            self.get_trend_stats(sensor_id),
            return_exceptions=True
        )
        
        analytics = {}
        categories = [
            "standard", "distribution", "temporal", "alerts", 
            "operations", "quality", "activity", "trends"
        ]
        
        for i, result in enumerate(results):
            if not isinstance(result, Exception) and result:
                analytics[categories[i]] = result
        
        if analytics:
            return {
                "sensor_id": sensor_id,
                "analytics_type": "complete",
                "timestamp": func.getdate(),
                "categories": analytics
            }
        return None