import math
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class NavigationAgent:
    def __init__(self):
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
        
        # Standard vessel speeds (knots)
        self.vessel_speeds = {
            "container": 20,      # Container ships
            "bulk": 12,           # Bulk carriers
            "tanker": 14,         # Oil tankers
            "lng": 18,            # LNG carriers
            "lpg": 16,            # LPG carriers
            "general": 12         # General cargo
        }
    
    def calculate_distance(self, port1: str, port2: str, vessel_type: str = "general") -> Dict[str, Any]:
        """Calculate great-circle distance between two ports"""
        try:
            # Validate ports
            if port1 not in self.major_ports:
                return {"error": f"Port '{port1}' not found in database"}
            if port2 not in self.major_ports:
                return {"error": f"Port '{port2}' not found in database"}
            
            # Get coordinates
            coords1 = self.major_ports[port1]
            coords2 = self.major_ports[port2]
            
            # Calculate distance using Haversine formula
            distance_data = self._haversine_distance(
                coords1["lat"], coords1["lon"],
                coords2["lat"], coords2["lon"]
            )
            
            # Calculate ETA at different speeds
            eta_data = self._calculate_eta(distance_data["distance_nm"], vessel_type)
            
            # Generate route insights
            route_insights = self._generate_route_insights(port1, port2, distance_data)
            
            return {
                "port1": port1,
                "port2": port2,
                "coordinates": {
                    "port1": coords1,
                    "port2": coords2
                },
                "distance": distance_data,
                "eta": eta_data,
                "route_insights": route_insights,
                "timestamp": self._get_current_timestamp()
            }
            
        except Exception as e:
            logger.error(f"Error calculating distance: {str(e)}")
            return {"error": f"Distance calculation failed: {str(e)}"}
    
    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> Dict[str, float]:
        """Calculate great-circle distance using Haversine formula"""
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
            "distance_nm": round(distance_nm, 1),
            "distance_km": round(distance_km, 1),
            "distance_mi": round(distance_mi, 1)
        }
    
    def _calculate_eta(self, distance_nm: float, vessel_type: str) -> Dict[str, Any]:
        """Calculate ETA at different vessel speeds"""
        base_speed = self.vessel_speeds.get(vessel_type, self.vessel_speeds["general"])
        
        eta_data = {}
        
        # Calculate ETA at base speed
        eta_hours = distance_nm / base_speed
        eta_days = eta_hours / 24
        
        eta_data["base_speed"] = {
            "speed_knots": base_speed,
            "eta_hours": round(eta_hours, 1),
            "eta_days": round(eta_days, 2)
        }
        
        # Calculate ETA at different speeds
        eta_data["alternative_speeds"] = {}
        for speed in [10, 15, 20, 25]:
            if speed != base_speed:
                alt_eta_hours = distance_nm / speed
                alt_eta_days = alt_eta_hours / 24
                eta_data["alternative_speeds"][f"{speed}_knots"] = {
                    "eta_hours": round(alt_eta_hours, 1),
                    "eta_days": round(alt_eta_days, 2)
                }
        
        return eta_data
    
    def _generate_route_insights(self, port1: str, port2: str, distance_data: Dict[str, float]) -> Dict[str, Any]:
        """Generate maritime route insights"""
        insights = {
            "route_type": self._classify_route(port1, port2),
            "operational_considerations": [],
            "weather_zones": [],
            "port_approaches": {}
        }
        
        # Route classification
        if insights["route_type"] == "coastal":
            insights["operational_considerations"].extend([
                "Coastal navigation - monitor local traffic",
                "Frequent port calls possible",
                "Consider bunkering opportunities"
            ])
        elif insights["route_type"] == "oceanic":
            insights["operational_considerations"].extend([
                "Oceanic passage - plan for extended periods at sea",
                "Monitor weather routing",
                "Consider bunkering strategy"
            ])
        
        # Weather zones (simplified)
        if self._is_tropical_route(port1, port2):
            insights["weather_zones"].append("Tropical waters - monitor cyclone activity")
        
        if self._is_polar_route(port1, port2):
            insights["weather_zones"].append("Polar waters - ice navigation considerations")
        
        # Port approach considerations
        insights["port_approaches"] = {
            "port1": self._get_port_approach_info(port1),
            "port2": self._get_port_approach_info(port2)
        }
        
        return insights
    
    def _classify_route(self, port1: str, port2: str) -> str:
        """Classify route type based on distance and geography"""
        distance_nm = self._get_distance_between_ports(port1, port2)
        
        if distance_nm < 500:
            return "coastal"
        elif distance_nm < 2000:
            return "regional"
        else:
            return "oceanic"
    
    def _get_distance_between_ports(self, port1: str, port2: str) -> float:
        """Get cached distance between ports"""
        if port1 in self.major_ports and port2 in self.major_ports:
            coords1 = self.major_ports[port1]
            coords2 = self.major_ports[port2]
            distance_data = self._haversine_distance(
                coords1["lat"], coords1["lon"],
                coords2["lat"], coords2["lon"]
            )
            return distance_data["distance_nm"]
        return 0
    
    def _is_tropical_route(self, port1: str, port2: str) -> bool:
        """Check if route passes through tropical waters"""
        tropical_ports = ["Singapore", "Mumbai", "Chennai", "Kolkata", "Vishakapatnam", "Dubai", "Hong Kong"]
        return port1 in tropical_ports or port2 in tropical_ports
    
    def _is_polar_route(self, port1: str, port2: str) -> bool:
        """Check if route passes through polar waters"""
        # Simplified check - could be enhanced with actual route analysis
        return False
    
    def _get_port_approach_info(self, port_name: str) -> Dict[str, Any]:
        """Get port approach information"""
        # Simplified port approach data
        approach_data = {
            "Singapore": {"depth": "15m", "tidal_range": "2.5m", "approach_notes": "Deep water approach, busy traffic"},
            "Rotterdam": {"depth": "24m", "tidal_range": "1.8m", "approach_notes": "Deep water, Europort access"},
            "Shanghai": {"depth": "17.5m", "tidal_range": "4.5m", "approach_notes": "Yangtze River approach, strong currents"},
            "Los Angeles": {"depth": "16m", "tidal_range": "1.5m", "approach_notes": "San Pedro Bay, moderate traffic"},
            "New York": {"depth": "15m", "tidal_range": "1.4m", "approach_notes": "Hudson River approach, busy port"}
        }
        
        return approach_data.get(port_name, {
            "depth": "Varies",
            "tidal_range": "Varies", 
            "approach_notes": "Check port authority information"
        })
    
    def _get_current_timestamp(self) -> str:
        """Get current timestamp in ISO format"""
        from datetime import datetime
        return datetime.now().isoformat()
    
    def process_query(self, query: str) -> str:
        """Process natural language navigation queries"""
        query_lower = query.lower()
        
        if any(word in query_lower for word in ["distance", "route", "between", "from", "to"]):
            # Extract port names from query
            ports_found = []
            for port in self.major_ports.keys():
                if port.lower() in query_lower:
                    ports_found.append(port)
            
            if len(ports_found) >= 2:
                port1, port2 = ports_found[0], ports_found[1]
                
                # Determine vessel type from query
                vessel_type = "general"
                if "container" in query_lower:
                    vessel_type = "container"
                elif "bulk" in query_lower:
                    vessel_type = "bulk"
                elif "tanker" in query_lower:
                    vessel_type = "tanker"
                
                # Calculate distance
                result = self.calculate_distance(port1, port2, vessel_type)
                
                if "error" not in result:
                    return self._format_distance_response(result)
                else:
                    return f"❌ {result['error']}"
            
            elif len(ports_found) == 1:
                port = ports_found[0]
                return f"""
**📏 Distance Calculator for {port}:**

I found {port} in your query. To calculate distance, please specify two ports.

**Example queries:**
- "distance between {port} and Rotterdam"
- "route from {port} to Shanghai"
- "how far is it from {port} to Los Angeles"

**Available major ports:**
- Singapore, Mumbai, Chennai, Kolkata, Vishakapatnam
- Rotterdam, Shanghai, Los Angeles, New York
- Hamburg, Antwerp, Dubai, Hong Kong, Tokyo, Busan
"""
            else:
                return """
**📏 Maritime Distance Calculator:**

I can calculate sea distances between major ports worldwide.

**Example queries:**
- "distance between Singapore and Mumbai"
- "route from Rotterdam to Shanghai"
- "how far is it from Los Angeles to Tokyo"

**Available major ports:**
- **Asia**: Singapore, Mumbai, Chennai, Kolkata, Vishakapatnam, Shanghai, Hong Kong, Tokyo, Busan, Dubai
- **Europe**: Rotterdam, Hamburg, Antwerp
- **Americas**: Los Angeles, New York

**Calculation Method:**
- Great-circle distance (shortest sea route)
- Includes ETA at various speeds
- Accounts for different vessel types
"""
        else:
            return """
**📏 Maritime Navigation Assistant:**

I calculate sea distances between ports using great-circle navigation.

**What I can do:**
- Calculate port-to-port distances
- Provide ETA estimates for different vessel types
- Show route insights and considerations
- Explain navigation factors

**Ask me about:**
- "distance between [Port A] and [Port B]"
- "route from [Port] to [Port]"
- "how far is [Port] from [Port]"
"""
    
    def _format_distance_response(self, result: Dict[str, Any]) -> str:
        """Format distance calculation results"""
        port1 = result["port1"]
        port2 = result["port2"]
        distance = result["distance"]
        eta = result["eta"]
        insights = result["route_insights"]
        
        response = f"""
**📏 Maritime Distance Calculation:**

**🌍 Route**: {port1} → {port2}

**📍 Coordinates:**
- **{port1}**: {result['coordinates']['port1']['lat']:.4f}°N, {result['coordinates']['port1']['lon']:.4f}°E
- **{port2}**: {result['coordinates']['port2']['lat']:.4f}°N, {result['coordinates']['port2']['lon']:.4f}°E

**📊 Distance:**
- **Nautical Miles**: {distance['distance_nm']} NM
- **Kilometers**: {distance['distance_km']} km
- **Statute Miles**: {distance['distance_mi']} mi

**⏱️ Estimated Time:**
- **At {eta['base_speed']['speed_knots']} knots**: {eta['base_speed']['eta_hours']} hours ({eta['base_speed']['eta_days']} days)
"""
        
        # Add alternative speeds
        if eta["alternative_speeds"]:
            response += "\n**Alternative Speeds:**\n"
            for speed, eta_data in eta["alternative_speeds"].items():
                speed_value = speed.replace("_knots", "")
                response += f"- **{speed_value} knots**: {eta_data['eta_hours']} hours ({eta_data['eta_days']} days)\n"
        
        # Add route insights
        response += f"""

**🚢 Route Insights:**
- **Route Type**: {insights['route_type'].title()}
- **Weather Zones**: {', '.join(insights['weather_zones']) if insights['weather_zones'] else 'Standard maritime conditions'}

**⚠️ Operational Considerations:**
"""
        for consideration in insights["operational_considerations"]:
            response += f"- {consideration}\n"
        
        # Add port approach info
        response += f"""

**🏠 Port Approaches:**
- **{port1}**: {insights['port_approaches']['port1']['approach_notes']}
- **{port2}**: {insights['port_approaches']['port2']['approach_notes']}

**💡 Note:** Great-circle distance is the shortest sea route. Actual voyage may be longer due to port approaches, traffic separation schemes, weather routing, and port congestion.
"""
        
        return response.strip() 