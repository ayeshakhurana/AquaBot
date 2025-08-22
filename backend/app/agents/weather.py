import requests
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import logging
import os

logger = logging.getLogger(__name__)

class WeatherAgent:
    def __init__(self):
        self.open_meteo_base_url = "https://api.open-meteo.com/v1"
        # API keys loaded from environment (dotenv loaded in main)
        self.openweather_api_key = os.getenv("OPENWEATHER_API_KEY")
        self.stormglass_api_key = os.getenv("STORMGLASS_API_KEY")
        
        self.major_ports = {
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
    
    def get_weather_forecast(self, port_name: str, coordinates: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
        """Get weather forecast for a specific port"""
        try:
            # Use provided coordinates or look up port coordinates
            if coordinates:
                lat, lon = coordinates["lat"], coordinates["lon"]
                port_name = "Custom Location"
            elif port_name in self.major_ports:
                lat, lon = self.major_ports[port_name]["lat"], self.major_ports[port_name]["lon"]
            else:
                return {"error": f"Port '{port_name}' not found in database"}
            
            # Prefer OpenWeather if API key available, else fallback to Open-Meteo
            weather_data_raw = None
            source = None
            if self.openweather_api_key:
                weather_data_raw = self._fetch_openweather_data(lat, lon)
                source = "openweather"
                # If OpenWeather failed, fallback
                if isinstance(weather_data_raw, dict) and weather_data_raw.get("error"):
                    weather_data_raw = None
                    source = None
            
            if weather_data_raw is None:
                weather_data_raw = self._fetch_open_meteo_data(lat, lon)
                source = "open-meteo"
                if "error" in weather_data_raw:
                    return weather_data_raw
            
            # Optional: augment with Stormglass marine data if key present
            marine_data = None
            if self.stormglass_api_key:
                marine_data = self._fetch_stormglass_data(lat, lon)
                if isinstance(marine_data, dict) and marine_data.get("error"):
                    marine_data = None
            
            # Process and format the data
            formatted_data = self._format_weather_data(weather_data_raw, port_name, lat, lon, source, marine_data)
            
            return formatted_data
            
        except Exception as e:
            logger.error(f"Error getting weather forecast: {str(e)}")
            return {"error": f"Failed to fetch weather data: {str(e)}"}
    
    def _fetch_open_meteo_data(self, lat: float, lon: float) -> Dict[str, Any]:
        """Fetch weather data from Open-Meteo API"""
        try:
            url = f"{self.open_meteo_base_url}/forecast"
            params = {
                "latitude": lat,
                "longitude": lon,
                "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation,weather_code",
                "hourly": "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation,weather_code",
                "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max",
                "timezone": "auto"
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Open-Meteo API request failed: {str(e)}")
            return {"error": f"API request failed: {str(e)}"}
        except Exception as e:
            logger.error(f"Error parsing Open-Meteo response: {str(e)}")
            return {"error": f"Response parsing failed: {str(e)}"}
    
    def _fetch_openweather_data(self, lat: float, lon: float) -> Dict[str, Any]:
        """Fetch weather data from OpenWeather One Call API if available"""
        try:
            if not self.openweather_api_key:
                return {"error": "OpenWeather API key not configured"}
            url = "https://api.openweathermap.org/data/2.5/onecall"
            params = {
                "lat": lat,
                "lon": lon,
                "units": "metric",
                "exclude": "minutely,alerts",
                "appid": self.openweather_api_key
            }
            res = requests.get(url, params=params, timeout=10)
            res.raise_for_status()
            return res.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"OpenWeather API request failed: {str(e)}")
            return {"error": f"API request failed: {str(e)}"}
        except Exception as e:
            logger.error(f"Error parsing OpenWeather response: {str(e)}")
            return {"error": f"Response parsing failed: {str(e)}"}
    
    def _fetch_stormglass_data(self, lat: float, lon: float) -> Dict[str, Any]:
        """Fetch marine weather data from Stormglass if available"""
        try:
            if not self.stormglass_api_key:
                return {"error": "Stormglass API key not configured"}
            url = "https://api.stormglass.io/v2/weather/point"
            params = {
                "lat": lat,
                "lng": lon,
                "params": ",".join([
                    "waveHeight",
                    "waveDirection",
                    "wavePeriod",
                    "windSpeed",
                    "windDirection"
                ])
            }
            headers = {"Authorization": self.stormglass_api_key}
            res = requests.get(url, params=params, headers=headers, timeout=10)
            res.raise_for_status()
            return res.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Stormglass API request failed: {str(e)}")
            return {"error": f"API request failed: {str(e)}"}
        except Exception as e:
            logger.error(f"Error parsing Stormglass response: {str(e)}")
            return {"error": f"Response parsing failed: {str(e)}"}
    
    def _format_weather_data(self, weather_data: Dict[str, Any], port_name: str, lat: float, lon: float, source: str, marine_data: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Format weather data from selected source for maritime use"""
        try:
            if source == "openweather":
                current_raw = weather_data.get("current", {})
                daily_raw = weather_data.get("daily", [])
                current_weather = {
                    "temperature": current_raw.get("temp"),
                    "humidity": current_raw.get("humidity"),
                    "wind_speed": current_raw.get("wind_speed"),
                    "wind_direction": current_raw.get("wind_deg"),
                    "precipitation": current_raw.get("rain", {}).get("1h") if isinstance(current_raw.get("rain"), dict) else None,
                    "weather_code": (current_raw.get("weather", [{}])[0] or {}).get("id"),
                    "weather_description": (current_raw.get("weather", [{}])[0] or {}).get("description")
                }
                daily_forecast = []
                for i, d in enumerate(daily_raw[:3]):
                    date = (datetime.now() + timedelta(days=i+1)).strftime("%A")
                    daily_forecast.append({
                        "date": date,
                        "max_temp": (d.get("temp") or {}).get("max"),
                        "precipitation": (d.get("rain") or 0)
                    })
            else:
                # Open-Meteo formatting (existing)
                current = weather_data.get("current", {})
                daily = weather_data.get("daily", {})
                
                current_weather = {
                    "temperature": current.get("temperature_2m"),
                    "humidity": current.get("relative_humidity_2m"),
                    "wind_speed": current.get("wind_speed_10m"),
                    "wind_direction": current.get("wind_direction_10m"),
                    "precipitation": current.get("precipitation"),
                    "weather_code": current.get("weather_code"),
                    "weather_description": self._interpret_weather_code(current.get("weather_code", 0))
                }
                daily_forecast = []
                daily_temps = daily.get("temperature_2m_max", [])
                daily_precip = daily.get("precipitation_sum", [])
                for i in range(min(3, len(daily_temps))):
                    date = (datetime.now() + timedelta(days=i+1)).strftime("%A")
                    daily_forecast.append({
                        "date": date,
                        "max_temp": daily_temps[i] if i < len(daily_temps) else None,
                        "precipitation": daily_precip[i] if i < len(daily_precip) else None
                    })
            
            # Maritime-specific insights
            maritime_insights = self._generate_maritime_insights(current_weather, daily_forecast)
            
            # Optional marine augmentation
            marine_summary = None
            if marine_data and isinstance(marine_data, dict):
                try:
                    hours = marine_data.get("hours") or []
                    if hours:
                        h0 = hours[0]
                        # Providers' keys vary; pick first available
                        wave_h = (h0.get("waveHeight") or {}).get("sg") if isinstance(h0.get("waveHeight"), dict) else None
                        wave_dir = (h0.get("waveDirection") or {}).get("sg") if isinstance(h0.get("waveDirection"), dict) else None
                        wave_period = (h0.get("wavePeriod") or {}).get("sg") if isinstance(h0.get("wavePeriod"), dict) else None
                        marine_summary = {
                            "wave_height_m": wave_h,
                            "wave_direction_deg": wave_dir,
                            "wave_period_s": wave_period
                        }
                        # Add to insights
                        if wave_h and wave_h > 2.5:
                            maritime_insights["safety_considerations"].append("High wave heights may affect berthing/loading")
                except Exception:
                    pass
            
            return {
                "port_name": port_name,
                "coordinates": {"lat": lat, "lon": lon},
                "timestamp": datetime.now().isoformat(),
                "current_weather": current_weather,
                "daily_forecast": daily_forecast,
                "maritime_insights": maritime_insights,
                "source": source,
                "marine": marine_summary
            }
            
        except Exception as e:
            logger.error(f"Error formatting weather data: {str(e)}")
            return {"error": f"Data formatting failed: {str(e)}"}
    
    def _interpret_weather_code(self, code: int) -> str:
        """Convert WMO weather codes to readable descriptions"""
        weather_codes = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Foggy",
            48: "Depositing rime fog",
            51: "Light drizzle",
            53: "Moderate drizzle",
            55: "Dense drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            71: "Slight snow",
            73: "Moderate snow",
            75: "Heavy snow",
            95: "Thunderstorm",
            96: "Thunderstorm with slight hail",
            99: "Thunderstorm with heavy hail"
        }
        return weather_codes.get(code, f"Unknown weather (code: {code})")
    
    def _generate_maritime_insights(self, current_weather: Dict[str, Any], daily_forecast: list) -> Dict[str, Any]:
        """Generate maritime-specific weather insights"""
        insights = {
            "operational_impact": [],
            "safety_considerations": [],
            "recommendations": []
        }
        
        # Wind analysis
        wind_speed = current_weather.get("wind_speed", 0)
        if wind_speed and wind_speed > 25:  # km/h (approx; OpenWeather is m/s, but units set to metric -> m/s? Adjust)
            insights["operational_impact"].append("High winds may affect cargo operations")
            insights["safety_considerations"].append("Monitor wind conditions for safe operations")
        elif wind_speed and wind_speed > 15:
            insights["operational_impact"].append("Moderate winds - normal operations possible")
        
        # Precipitation analysis
        precipitation = current_weather.get("precipitation", 0) or 0
        try:
            if precipitation > 5:  # mm
                insights["operational_impact"].append("Heavy precipitation may delay cargo operations")
                insights["recommendations"].append("Consider weather working days in laytime calculations")
        except Exception:
            pass
        
        # Visibility analysis - if weather description contains fog
        description = (current_weather.get("weather_description") or "").lower()
        if "fog" in description:
            insights["operational_impact"].append("Reduced visibility may affect port operations")
            insights["safety_considerations"].append("Monitor visibility for safe navigation")
        
        # General recommendations
        insights["recommendations"].extend([
            "Check local port authority weather reports",
            "Monitor marine weather broadcasts",
            "Document weather-related delays",
            "Consider seasonal weather patterns"
        ])
        
        return insights
    
    def process_query(self, query: str) -> str:
        """Process natural language weather queries"""
        query_lower = query.lower()
        
        if "weather" in query_lower or "forecast" in query_lower:
            # Extract location from query
            location = self._extract_location_from_query(query)
            
            if location:
                weather_data = self.get_weather_forecast(location)
                
                if "error" not in weather_data:
                    return self._format_weather_response(weather_data)
                else:
                    return f"❌ Unable to get weather for {location}: {weather_data['error']}"
            else:
                return "🌤️ Please specify a port name for weather information (e.g., 'weather in Singapore')"
        else:
            return "🌤️ I can provide weather forecasts for major ports. Ask me about weather in specific ports!"
    
    def _extract_location_from_query(self, query: str) -> Optional[str]:
        """Extract port name from natural language query"""
        query_words = query.lower().split()
        
        # Check for specific port names
        for port in self.major_ports.keys():
            if port.lower() in query_words:
                return port
        
        # Check for common port abbreviations
        common_ports = {
            "sg": "Singapore",
            "rtm": "Rotterdam",
            "sha": "Shanghai",
            "la": "Los Angeles",
            "ny": "New York"
        }
        for abbr, full in common_ports.items():
            if abbr in query_words:
                return full
        
        return None
    
    def _format_weather_response(self, data: Dict[str, Any]) -> str:
        """Format weather response for chat output"""
        try:
            current = data.get("current_weather", {})
            insights = data.get("maritime_insights", {})
            lines = [
                f"🌤️ Weather for {data.get('port_name')} ({data.get('coordinates', {}).get('lat')}, {data.get('coordinates', {}).get('lon')})",
                f"• Temperature: {current.get('temperature', 'N/A')}°C",
                f"• Wind: {current.get('wind_speed', 'N/A')} ({current.get('wind_direction', 'N/A')}°)",
                f"• Conditions: {current.get('weather_description', 'N/A')}"
            ]
            if insights.get("operational_impact"):
                lines.append("\nOperational Impact:")
                for impact in insights["operational_impact"]:
                    lines.append(f"- {impact}")
            if insights.get("safety_considerations"):
                lines.append("\nSafety Considerations:")
                for s in insights["safety_considerations"]:
                    lines.append(f"- {s}")
            return "\n".join(lines)
        except Exception:
            return "Weather data available." 