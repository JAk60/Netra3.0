
# ==================== reliability/utils/data_transformers.py ====================

"""
Data transformation utilities for reliability calculations.
Converts database records into formats suitable for Weibull analysis.

IMPORTANT: These functions work with detached SQLAlchemy objects.
They extract only the data they need and don't trigger any lazy loading.
"""

from typing import List
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


def extract_ttf_from_actual_data(actual_data_records: List) -> List[float]:
    """
    Extract time-to-failure values from ActualData records.
    Works with detached SQLAlchemy objects - extracts data immediately.
    
    ActualData contains exact installation and removal dates.
    TTF is calculated as the time difference in hours.
    
    Args:
        actual_data_records: List of ActualData objects with:
                           - interval_start_date: installation date
                           - interval_end_date: removal/failure date
        
    Returns:
        List of TTF values in hours
        
    Example:
        >>> records = await actual_data_repo.get_by_component(component_id)
        >>> ttf_values = extract_ttf_from_actual_data(records)
        >>> print(f"Extracted {len(ttf_values)} TTF values")
    """
    ttf_values = []
    
    for record in actual_data_records:
        try:
            # Extract attributes immediately before they become detached
            start_date = record.interval_start_date
            end_date = record.interval_end_date
            record_id = record.id
            
            # Validate dates exist
            if start_date is None or end_date is None:
                logger.warning(f"Skipping record {record_id}: missing dates")
                continue
            
            # Calculate time difference in days
            days = (end_date - start_date).days
            
            # Convert to hours (assuming 24/7 operation)
            hours = days * 24.0
            
            # Only include positive values
            if hours > 0:
                ttf_values.append(hours)
            else:
                logger.warning(
                    f"Skipping record {record_id}: non-positive TTF ({hours} hours)"
                )
                
        except AttributeError as e:
            logger.error(f"Record missing required fields: {e}")
        except Exception as e:
            logger.error(f"Error processing record: {e}")
    
    logger.info(f"Extracted {len(ttf_values)} TTF values from {len(actual_data_records)} records")
    return ttf_values


def extract_ttf_from_interval_data(interval_data_records: List) -> List[float]:
    """
    Extract time-to-failure values from IntervalData records.
    Works with detached SQLAlchemy objects - extracts data immediately.
    
    IntervalData contains date ranges (not exact dates).
    Uses the mean date of each interval for TTF calculation.
    
    Args:
        interval_data_records: List of IntervalData objects with:
                             - installation_start_date
                             - installation_end_date
                             - removal_start_date
                             - removal_end_date
        
    Returns:
        List of TTF values in hours
        
    Example:
        >>> records = await interval_data_repo.get_by_component(component_id)
        >>> ttf_values = extract_ttf_from_interval_data(records)
        >>> print(f"Extracted {len(ttf_values)} TTF values")
    """
    ttf_values = []
    
    for record in interval_data_records:
        try:
            # Extract all attributes immediately before they become detached
            install_start = record.installation_start_date
            install_end = record.installation_end_date
            removal_start = record.removal_start_date
            removal_end = record.removal_end_date
            record_id = record.id
            
            # Validate all dates exist
            if not all([install_start, install_end, removal_start, removal_end]):
                logger.warning(f"Skipping record {record_id}: missing dates")
                continue
            
            # Calculate mean installation date
            install_days = (install_end - install_start).days
            mean_install = install_start + timedelta(days=install_days / 2)

            # Calculate mean removal date
            removal_days = (removal_end - removal_start).days
            mean_removal = removal_start + timedelta(days=removal_days / 2)

            # Calculate TTF using mean dates
            days = (mean_removal - mean_install).days
            hours = days * 24.0
            
            # Only include positive values
            if hours > 0:
                ttf_values.append(hours)
            else:
                logger.warning(
                    f"Skipping record {record_id}: non-positive TTF ({hours} hours)"
                )
                
        except AttributeError as e:
            logger.error(f"Record missing required fields: {e}")
        except Exception as e:
            logger.error(f"Error processing record: {e}")
    
    logger.info(f"Extracted {len(ttf_values)} TTF values from {len(interval_data_records)} records")
    return ttf_values