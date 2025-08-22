import re
import math
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

def validate_api_key(api_key: str) -> bool:
    """
    Validate API key format and basic structure
    
    Args:
        api_key: API key to validate
    
    Returns:
        True if valid, False otherwise
    """
    try:
        if not api_key or not isinstance(api_key, str):
            return False
        
        # Basic validation - should be non-empty and reasonable length
        if len(api_key) < 10 or len(api_key) > 100:
            return False
        
        # Should contain alphanumeric characters
        if not re.match(r'^[A-Za-z0-9\-_]+$', api_key):
            return False
        
        return True
        
    except Exception as e:
        logger.error(f"Error validating API key: {e}")
        return False

def calculate_nautical_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> Dict[str, float]:
    """
    Calculate great-circle distance between two points using Haversine formula
    
    Args:
        lat1: Latitude of first point (degrees)
        lon1: Longitude of first point (degrees)
        lat2: Latitude of second point (degrees)
        lon2: Longitude of second point (degrees)
    
    Returns:
        Dictionary with distances in different units
    """
    try:
        # Convert to radians
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        # Haversine formula
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        # Earth radius in different units
        earth_radius_nm = 3440.065  # nautical miles
        earth_radius_km = 6371      # kilometers
        earth_radius_mi = 3959      # statute miles
        
        distance_nm = c * earth_radius_nm
        distance_km = c * earth_radius_km
        distance_mi = c * earth_radius_mi
        
        return {
            "nautical_miles": round(distance_nm, 2),
            "kilometers": round(distance_km, 2),
            "statute_miles": round(distance_mi, 2)
        }
        
    except Exception as e:
        logger.error(f"Error calculating nautical distance: {e}")
        return {"error": str(e)}

def calculate_eta(distance_nm: float, speed_knots: float) -> Dict[str, Any]:
    """
    Calculate estimated time of arrival
    
    Args:
        distance_nm: Distance in nautical miles
        speed_knots: Speed in knots
    
    Returns:
        Dictionary with ETA information
    """
    try:
        if speed_knots <= 0:
            return {"error": "Speed must be positive"}
        
        # Calculate time in hours
        time_hours = distance_nm / speed_knots
        time_days = time_hours / 24
        
        # Calculate ETA from current time
        current_time = datetime.now()
        eta_time = current_time + timedelta(hours=time_hours)
        
        return {
            "distance_nm": distance_nm,
            "speed_knots": speed_knots,
            "time_hours": round(time_hours, 2),
            "time_days": round(time_days, 2),
            "eta_datetime": eta_time.isoformat(),
            "eta_formatted": eta_time.strftime("%Y-%m-%d %H:%M:%S")
        }
        
    except Exception as e:
        logger.error(f"Error calculating ETA: {e}")
        return {"error": str(e)}

def parse_maritime_date(date_string: str) -> Optional[datetime]:
    """
    Parse maritime date formats commonly used in shipping documents
    
    Args:
        date_string: Date string to parse
    
    Returns:
        Parsed datetime object or None if parsing fails
    """
    try:
        # Common maritime date formats
        formats = [
            "%d/%m/%Y",
            "%d-%m-%Y",
            "%Y-%m-%d",
            "%d/%m/%y",
            "%d-%m-%y",
            "%d %B %Y",
            "%d %b %Y",
            "%B %d, %Y",
            "%b %d, %Y"
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(date_string, fmt)
            except ValueError:
                continue
        
        # Try parsing with time included
        time_formats = [
            "%d/%m/%Y %H:%M",
            "%d-%m-%Y %H:%M",
            "%Y-%m-%d %H:%M",
            "%d/%m/%Y, %H:%M",
            "%d-%m-%Y, %H:%M"
        ]
        
        for fmt in time_formats:
            try:
                return datetime.strptime(date_string, fmt)
            except ValueError:
                continue
        
        return None
        
    except Exception as e:
        logger.error(f"Error parsing maritime date '{date_string}': {e}")
        return None

def format_maritime_time(dt: datetime, include_seconds: bool = False) -> str:
    """
    Format datetime in maritime standard format
    
    Args:
        dt: Datetime object to format
        include_seconds: Whether to include seconds
    
    Returns:
        Formatted time string
    """
    try:
        if include_seconds:
            return dt.strftime("%d/%m/%Y %H:%M:%S")
        else:
            return dt.strftime("%d/%m/%Y %H:%M")
            
    except Exception as e:
        logger.error(f"Error formatting maritime time: {e}")
        return str(dt)

def calculate_laytime(laytime_hours: float, notice_period_hours: float = 6) -> Dict[str, Any]:
    """
    Calculate laytime with notice period
    
    Args:
        laytime_hours: Allowed laytime in hours
        notice_period_hours: Notice period in hours
    
    Returns:
        Dictionary with laytime calculations
    """
    try:
        total_time_hours = laytime_hours + notice_period_hours
        total_time_days = total_time_hours / 24
        
        # Calculate working days (assuming 24-hour operations)
        working_days = math.ceil(total_time_days)
        
        return {
            "laytime_hours": laytime_hours,
            "notice_period_hours": notice_period_hours,
            "total_time_hours": total_time_hours,
            "total_time_days": round(total_time_days, 2),
            "working_days": working_days,
            "laytime_days": round(laytime_hours / 24, 2)
        }
        
    except Exception as e:
        logger.error(f"Error calculating laytime: {e}")
        return {"error": str(e)}

def calculate_demurrage_despatch(actual_hours: float, allowed_hours: float, 
                                daily_rate: float) -> Dict[str, Any]:
    """
    Calculate demurrage or despatch amounts
    
    Args:
        actual_hours: Actual time used in hours
        allowed_hours: Allowed time in hours
        daily_rate: Daily rate in currency units
    
    Returns:
        Dictionary with demurrage/despatch calculations
    """
    try:
        time_difference = actual_hours - allowed_hours
        time_difference_days = time_difference / 24
        
        if time_difference > 0:
            # Demurrage (penalty)
            demurrage_amount = time_difference_days * daily_rate
            return {
                "type": "demurrage",
                "time_exceeded_hours": time_difference,
                "time_exceeded_days": round(time_difference_days, 2),
                "daily_rate": daily_rate,
                "amount": round(demurrage_amount, 2),
                "penalty": True
            }
        else:
            # Despatch (bonus)
            time_saved_hours = abs(time_difference)
            time_saved_days = time_saved_hours / 24
            despatch_amount = time_saved_days * daily_rate * 0.5  # Usually 50% of demurrage rate
            
            return {
                "type": "despatch",
                "time_saved_hours": time_saved_hours,
                "time_saved_days": round(time_saved_days, 2),
                "daily_rate": daily_rate,
                "despatch_rate": daily_rate * 0.5,
                "amount": round(despatch_amount, 2),
                "bonus": True
            }
            
    except Exception as e:
        logger.error(f"Error calculating demurrage/despatch: {e}")
        return {"error": str(e)}

def extract_port_coordinates(port_name: str) -> Optional[Dict[str, float]]:
    """
    Extract port coordinates from common maritime databases
    
    Args:
        port_name: Name of the port
    
    Returns:
        Dictionary with latitude and longitude or None if not found
    """
    # Common major ports database
    major_ports = {
        "Singapore": {"lat": 1.2905, "lon": 103.8520},
        "Mumbai": {"lat": 19.0760, "lon": 72.8777},
        "Chennai": {"lat": 13.0827, "lon": 80.2707},
        "Kolkata": {"lat": 22.5726, "lon": 88.3639},
        "Vishakapatnam": {"lat": 17.6868, "lon": 83.2185},
        "Rotterdam": {"lat": 51.9225, "lon": 4.4792},
        "Shanghai": {"lat": 31.2304, "lon": 121.4737},
        "Los Angeles": {"lat": 34.0522, "lon": -118.2437},
        "New York": {"lat": 40.7128, "lon": -74.0060},
        "Hamburg": {"lat": 53.5511, "lon": 9.9937},
        "Antwerp": {"lat": 51.2194, "lon": 4.4025},
        "Dubai": {"lat": 25.2048, "lon": 55.2708},
        "Hong Kong": {"lat": 22.3193, "lon": 114.1694},
        "Tokyo": {"lat": 35.6762, "lon": 139.6503},
        "Busan": {"lat": 35.1796, "lon": 129.0756}
    }
    
    # Check exact match first
    if port_name in major_ports:
        return major_ports[port_name]
    
    # Check case-insensitive match
    for name, coords in major_ports.items():
        if port_name.lower() == name.lower():
            return coords
    
    # Check partial match
    for name, coords in major_ports.items():
        if port_name.lower() in name.lower() or name.lower() in port_name.lower():
            return coords
    
    return None

def validate_coordinates(lat: float, lon: float) -> bool:
    """
    Validate geographic coordinates
    
    Args:
        lat: Latitude
        lon: Longitude
    
    Returns:
        True if coordinates are valid, False otherwise
    """
    try:
        # Latitude: -90 to 90
        if not -90 <= lat <= 90:
            return False
        
        # Longitude: -180 to 180
        if not -180 <= lon <= 180:
            return False
        
        return True
        
    except Exception:
        return False

def format_maritime_number(number: float, unit: str = "") -> str:
    """
    Format numbers in maritime standard format
    
    Args:
        number: Number to format
        unit: Unit of measurement
    
    Returns:
        Formatted number string
    """
    try:
        if unit.lower() in ["nm", "nautical_miles", "nautical miles"]:
            return f"{number:.1f} NM"
        elif unit.lower() in ["km", "kilometers"]:
            return f"{number:.1f} km"
        elif unit.lower() in ["mt", "metric_tons", "metric tons"]:
            return f"{number:,.0f} MT"
        elif unit.lower() in ["knots"]:
            return f"{number:.1f} knots"
        else:
            return f"{number:.2f} {unit}".strip()
            
    except Exception as e:
        logger.error(f"Error formatting maritime number: {e}")
        return str(number)

def sanitize_maritime_text(text: str) -> str:
    """
    Sanitize maritime text for safe processing
    
    Args:
        text: Text to sanitize
    
    Returns:
        Sanitized text
    """
    try:
        if not text:
            return ""
        
        # Remove potentially dangerous characters
        sanitized = re.sub(r'[<>"\']', '', text)
        
        # Normalize whitespace
        sanitized = re.sub(r'\s+', ' ', sanitized)
        
        # Trim whitespace
        sanitized = sanitized.strip()
        
        return sanitized
        
    except Exception as e:
        logger.error(f"Error sanitizing maritime text: {e}")
        return text if text else ""

def get_maritime_timezone_offset(port_name: str) -> Optional[int]:
    """
    Get timezone offset for major ports
    
    Args:
        port_name: Name of the port
    
    Returns:
        Timezone offset in hours from UTC or None if not found
    """
    # Common port timezones (UTC offsets)
    port_timezones = {
        "Singapore": 8,
        "Mumbai": 5.5,
        "Chennai": 5.5,
        "Kolkata": 5.5,
        "Vishakapatnam": 5.5,
        "Rotterdam": 1,
        "Shanghai": 8,
        "Los Angeles": -8,
        "New York": -5,
        "Hamburg": 1,
        "Antwerp": 1,
        "Dubai": 4,
        "Hong Kong": 8,
        "Tokyo": 9,
        "Busan": 9
    }
    
    return port_timezones.get(port_name)

def convert_maritime_time_to_utc(local_time: datetime, port_name: str) -> Optional[datetime]:
    """
    Convert local port time to UTC
    
    Args:
        local_time: Local time at port
        port_name: Name of the port
    
    Returns:
        UTC time or None if conversion fails
    """
    try:
        offset = get_maritime_timezone_offset(port_name)
        if offset is None:
            return None
        
        # Convert to UTC
        utc_time = local_time - timedelta(hours=offset)
        return utc_time
        
    except Exception as e:
        logger.error(f"Error converting maritime time to UTC: {e}")
        return None 