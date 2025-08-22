import requests
import json
from typing import Dict, Any, Optional, List
import logging

logger = logging.getLogger(__name__)

class PortsAgent:
    def __init__(self):
        # Major ports database with UN/LOCODE format
        self.ports_database = {
            "SGSIN": {
                "name": "Singapore",
                "country": "Singapore",
                "coordinates": {"lat": 1.2905, "lon": 103.8520},
                "facilities": ["Container Terminal", "Bulk Terminal", "Oil Terminal", "LNG Terminal"],
                "max_draft": 15.0,
                "tidal_range": 2.5,
                "restrictions": ["VTS mandatory", "Pilot required"],
                "contact": {"phone": "+65 6321 0000", "email": "info@mpa.gov.sg"}
            },
            "INBOM": {
                "name": "Mumbai",
                "country": "India",
                "coordinates": {"lat": 19.0760, "lon": 72.8777},
                "facilities": ["Container Terminal", "Bulk Terminal", "Oil Terminal"],
                "max_draft": 14.5,
                "tidal_range": 4.5,
                "restrictions": ["Pilot required", "Tidal restrictions"],
                "contact": {"phone": "+91 22 2262 1818", "email": "info@mumbaiport.gov.in"}
            },
            "INMAA": {
                "name": "Chennai",
                "country": "India",
                "coordinates": {"lat": 13.0827, "lon": 80.2707},
                "facilities": ["Container Terminal", "Bulk Terminal", "Oil Terminal"],
                "max_draft": 16.5,
                "tidal_range": 1.2,
                "restrictions": ["Pilot required", "24/7 operations"],
                "contact": {"phone": "+91 44 2536 0000", "email": "info@chennaiport.gov.in"}
            },
            "INCCU": {
                "name": "Kolkata",
                "country": "India",
                "coordinates": {"lat": 22.5726, "lon": 88.3639},
                "facilities": ["Container Terminal", "Bulk Terminal", "Oil Terminal"],
                "max_draft": 12.5,
                "tidal_range": 4.2,
                "restrictions": ["Pilot required", "Tidal restrictions", "River navigation"],
                "contact": {"phone": "+91 33 2248 0000", "email": "info@kolkataport.gov.in"}
            },
            "INVIZ": {
                "name": "Vishakapatnam",
                "country": "India",
                "coordinates": {"lat": 17.6868, "lon": 83.2185},
                "facilities": ["Container Terminal", "Bulk Terminal", "Oil Terminal", "Iron Ore Terminal"],
                "max_draft": 18.0,
                "tidal_range": 1.8,
                "restrictions": ["Pilot required", "24/7 operations"],
                "contact": {"phone": "+91 891 256 0000", "email": "info@vizagport.gov.in"}
            },
            "NLRTM": {
                "name": "Rotterdam",
                "country": "Netherlands",
                "coordinates": {"lat": 51.9225, "lon": 4.4792},
                "facilities": ["Container Terminal", "Bulk Terminal", "Oil Terminal", "LNG Terminal"],
                "max_draft": 24.0,
                "tidal_range": 1.8,
                "restrictions": ["VTS mandatory", "Pilot required"],
                "contact": {"phone": "+31 10 252 1000", "email": "info@portofrotterdam.com"}
            },
            "CNSHA": {
                "name": "Shanghai",
                "country": "China",
                "coordinates": {"lat": 31.2304, "lon": 121.4737},
                "facilities": ["Container Terminal", "Bulk Terminal", "Oil Terminal", "LNG Terminal"],
                "max_draft": 17.5,
                "tidal_range": 4.5,
                "restrictions": ["VTS mandatory", "Pilot required", "Tidal restrictions"],
                "contact": {"phone": "+86 21 6329 0000", "email": "info@portshanghai.com.cn"}
            },
            "USLAX": {
                "name": "Los Angeles",
                "country": "United States",
                "coordinates": {"lat": 34.0522, "lon": -118.2437},
                "facilities": ["Container Terminal", "Bulk Terminal", "Oil Terminal"],
                "max_draft": 16.0,
                "tidal_range": 1.5,
                "restrictions": ["VTS mandatory", "Pilot required"],
                "contact": {"phone": "+1 310 732 7678", "email": "info@portoflosangeles.org"}
            },
            "USNYC": {
                "name": "New York",
                "country": "United States",
                "coordinates": {"lat": 40.7128, "lon": -74.0060},
                "facilities": ["Container Terminal", "Bulk Terminal", "Oil Terminal"],
                "max_draft": 15.0,
                "tidal_range": 1.4,
                "restrictions": ["VTS mandatory", "Pilot required", "Hudson River navigation"],
                "contact": {"phone": "+1 212 435 4600", "email": "info@nyc.gov"}
            },
            "DEHAM": {
                "name": "Hamburg",
                "country": "Germany",
                "coordinates": {"lat": 53.5511, "lon": 9.9937},
                "facilities": ["Container Terminal", "Bulk Terminal", "Oil Terminal"],
                "max_draft": 15.5,
                "tidal_range": 3.6,
                "restrictions": ["VTS mandatory", "Pilot required", "Elbe River navigation"],
                "contact": {"phone": "+49 40 37709 0", "email": "info@hafen-hamburg.de"}
            },
            "BEANR": {
                "name": "Antwerp",
                "country": "Belgium",
                "coordinates": {"lat": 51.2194, "lon": 4.4025},
                "facilities": ["Container Terminal", "Bulk Terminal", "Oil Terminal", "Chemical Terminal"],
                "max_draft": 17.5,
                "tidal_range": 5.0,
                "restrictions": ["VTS mandatory", "Pilot required", "Scheldt River navigation"],
                "contact": {"phone": "+32 3 205 2011", "email": "info@portofantwerp.com"}
            },
            "AEDXB": {
                "name": "Dubai",
                "country": "United Arab Emirates",
                "coordinates": {"lat": 25.2048, "lon": 55.2708},
                "facilities": ["Container Terminal", "Bulk Terminal", "Oil Terminal", "LNG Terminal"],
                "max_draft": 16.0,
                "tidal_range": 1.8,
                "restrictions": ["VTS mandatory", "Pilot required"],
                "contact": {"phone": "+971 4 881 0000", "email": "info@dpa.ae"}
            },
            "HKHKG": {
                "name": "Hong Kong",
                "country": "Hong Kong",
                "coordinates": {"lat": 22.3193, "lon": 114.1694},
                "facilities": ["Container Terminal", "Bulk Terminal", "Oil Terminal"],
                "max_draft": 17.5,
                "tidal_range": 2.0,
                "restrictions": ["VTS mandatory", "Pilot required"],
                "contact": {"phone": "+852 2852 4888", "email": "info@mardep.gov.hk"}
            },
            "JPTYO": {
                "name": "Tokyo",
                "country": "Japan",
                "coordinates": {"lat": 35.6762, "lon": 139.6503},
                "facilities": ["Container Terminal", "Bulk Terminal", "Oil Terminal"],
                "max_draft": 16.0,
                "tidal_range": 1.8,
                "restrictions": ["VTS mandatory", "Pilot required"],
                "contact": {"phone": "+81 3 5463 8000", "email": "info@tokyo-port.go.jp"}
            },
            "KRBUS": {
                "name": "Busan",
                "country": "South Korea",
                "coordinates": {"lat": 35.1796, "lon": 129.0756},
                "facilities": ["Container Terminal", "Bulk Terminal", "Oil Terminal"],
                "max_draft": 17.0,
                "tidal_range": 1.5,
                "restrictions": ["VTS mandatory", "Pilot required"],
                "contact": {"phone": "+82 51 999 0000", "email": "info@busanpa.com"}
            }
        }
        
        # Port categories for search
        self.port_categories = {
            "container": ["SGSIN", "NLRTM", "CNSHA", "USLAX", "USNYC", "DEHAM", "BEANR", "AEDXB", "HKHKG", "JPTYO", "KRBUS"],
            "bulk": ["INBOM", "INMAA", "INCCU", "INVIZ", "NLRTM", "CNSHA", "USLAX", "USNYC", "DEHAM", "BEANR"],
            "oil": ["SGSIN", "INBOM", "INMAA", "INCCU", "INVIZ", "NLRTM", "CNSHA", "USLAX", "USNYC", "DEHAM", "BEANR", "AEDXB"],
            "lng": ["SGSIN", "NLRTM", "CNSHA", "AEDXB"],
            "chemical": ["BEANR", "NLRTM", "CNSHA"]
        }
    
    def get_port_details(self, port_identifier: str) -> Dict[str, Any]:
        """Get detailed port information by name or UN/LOCODE"""
        try:
            # Try to find port by UN/LOCODE first
            if port_identifier.upper() in self.ports_database:
                port_code = port_identifier.upper()
                port_data = self.ports_database[port_code].copy()
                port_data["un_locode"] = port_code
                return port_data
            
            # Try to find by name
            for code, data in self.ports_database.items():
                if port_identifier.lower() in data["name"].lower():
                    port_data = data.copy()
                    port_data["un_locode"] = code
                    return port_data
            
            # Try to find by partial name match
            for code, data in self.ports_database.items():
                if any(word in data["name"].lower() for word in port_identifier.lower().split()):
                    port_data = data.copy()
                    port_data["un_locode"] = code
                    return port_data
            
            return {"error": f"Port '{port_identifier}' not found in database"}
            
        except Exception as e:
            logger.error(f"Error getting port details: {str(e)}")
            return {"error": f"Failed to get port details: {str(e)}"}
    
    def search_ports(self, query: str, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """Search ports by name, country, or facilities"""
        try:
            results = []
            query_lower = query.lower()
            
            for code, data in self.ports_database.items():
                # Check if port matches search criteria
                matches = False
                
                # Search in name
                if query_lower in data["name"].lower():
                    matches = True
                
                # Search in country
                if query_lower in data["country"].lower():
                    matches = True
                
                # Search in facilities
                if any(query_lower in facility.lower() for facility in data["facilities"]):
                    matches = True
                
                # Filter by category if specified
                if category and category in self.port_categories:
                    if code not in self.port_categories[category]:
                        continue
                
                if matches:
                    port_result = data.copy()
                    port_result["un_locode"] = code
                    results.append(port_result)
            
            return results
            
        except Exception as e:
            logger.error(f"Error searching ports: {str(e)}")
            return []
    
    def get_ports_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Get all ports in a specific category"""
        try:
            if category not in self.port_categories:
                return []
            
            ports = []
            for code in self.port_categories[category]:
                if code in self.ports_database:
                    port_data = self.ports_database[code].copy()
                    port_data["un_locode"] = code
                    ports.append(port_data)
            
            return ports
            
        except Exception as e:
            logger.error(f"Error getting ports by category: {str(e)}")
            return []
    
    def get_port_restrictions(self, port_identifier: str) -> Dict[str, Any]:
        """Get port restrictions and requirements"""
        try:
            port_data = self.get_port_details(port_identifier)
            
            if "error" in port_data:
                return port_data
            
            return {
                "port_name": port_data["name"],
                "un_locode": port_data["un_locode"],
                "restrictions": port_data["restrictions"],
                "max_draft": port_data["max_draft"],
                "tidal_range": port_data["tidal_range"],
                "contact": port_data["contact"]
            }
            
        except Exception as e:
            logger.error(f"Error getting port restrictions: {str(e)}")
            return {"error": f"Failed to get port restrictions: {str(e)}"}
    
    def get_port_facilities(self, port_identifier: str) -> Dict[str, Any]:
        """Get port facilities and capabilities"""
        try:
            port_data = self.get_port_details(port_identifier)
            
            if "error" in port_data:
                return port_data
            
            return {
                "port_name": port_data["name"],
                "un_locode": port_data["un_locode"],
                "facilities": port_data["facilities"],
                "max_draft": port_data["max_draft"],
                "coordinates": port_data["coordinates"]
            }
            
        except Exception as e:
            logger.error(f"Error getting port facilities: {str(e)}")
            return {"error": f"Failed to get port facilities: {str(e)}"}
    
    def process_query(self, query: str) -> str:
        """Process natural language port queries"""
        query_lower = query.lower()
        
        if "port" in query_lower or "facility" in query_lower or "restriction" in query_lower:
            # Extract port name from query
            port_name = self._extract_port_from_query(query)
            
            if port_name:
                if "restriction" in query_lower or "requirement" in query_lower:
                    result = self.get_port_restrictions(port_name)
                elif "facility" in query_lower or "capability" in query_lower:
                    result = self.get_port_facilities(port_name)
                else:
                    result = self.get_port_details(port_name)
                
                if "error" not in result:
                    return self._format_port_response(result, query_lower)
                else:
                    return f"❌ {result['error']}"
            else:
                return "🏠 Please specify a port name for information (e.g., 'port facilities in Singapore')"
        else:
            return "🏠 I can provide port information including facilities, restrictions, and contact details. Ask me about specific ports!"
    
    def _extract_port_from_query(self, query: str) -> Optional[str]:
        """Extract port name from natural language query"""
        query_words = query.lower().split()
        
        # Check for specific port names
        for code, data in self.ports_database.items():
            if data["name"].lower() in query_words:
                return data["name"]
        
        # Check for common port abbreviations
        common_ports = {
            "vizag": "Vishakapatnam",
            "la": "Los Angeles",
            "ny": "New York",
            "hk": "Hong Kong"
        }
        
        for abbrev, port_name in common_ports.items():
            if abbrev in query_words:
                return port_name
        
        return None
    
    def _format_port_response(self, port_data: Dict[str, Any], query_type: str) -> str:
        """Format port information as a readable response"""
        port_name = port_data["name"]
        un_locode = port_data["un_locode"]
        
        if "restriction" in query_type:
            response = f"""
**🏠 Port Restrictions - {port_name}:**
🏷️ **UN/LOCODE**: {un_locode}
📍 **Country**: {port_data['country']}

**⚠️ Restrictions & Requirements:**
"""
            for restriction in port_data["restrictions"]:
                response += f"- {restriction}\n"
            
            response += f"""

**📏 Operational Limits:**
- **Max Draft**: {port_data['max_draft']} meters
- **Tidal Range**: {port_data['tidal_range']} meters

**📞 Contact Information:**
- **Phone**: {port_data['contact']['phone']}
- **Email**: {port_data['contact']['email']}
"""
        
        elif "facility" in query_type:
            response = f"""
**🏠 Port Facilities - {port_name}:**
🏷️ **UN/LOCODE**: {un_locode}
📍 **Country**: {port_data['country']}

**🏗️ Available Facilities:**
"""
            for facility in port_data["facilities"]:
                response += f"- {facility}\n"
            
            response += f"""

**📏 Operational Limits:**
- **Max Draft**: {port_data['max_draft']} meters
- **Coordinates**: {port_data['coordinates']['lat']:.4f}°N, {port_data['coordinates']['lon']:.4f}°E
"""
        
        else:
            response = f"""
**🏠 Port Information - {port_name}:**
🏷️ **UN/LOCODE**: {un_locode}
📍 **Country**: {port_data['country']}
🌍 **Coordinates**: {port_data['coordinates']['lat']:.4f}°N, {port_data['coordinates']['lon']:.4f}°E

**🏗️ Facilities:**
"""
            for facility in port_data["facilities"]:
                response += f"- {facility}\n"
            
            response += f"""

**📏 Operational Limits:**
- **Max Draft**: {port_data['max_draft']} meters
- **Tidal Range**: {port_data['tidal_range']} meters

**⚠️ Restrictions:**
"""
            for restriction in port_data["restrictions"]:
                response += f"- {restriction}\n"
            
            response += f"""

**📞 Contact Information:**
- **Phone**: {port_data['contact']['phone']}
- **Email**: {port_data['contact']['email']}
"""
        
        return response.strip() 