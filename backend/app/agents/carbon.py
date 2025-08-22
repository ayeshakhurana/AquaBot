import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class CarbonAgent:
    def __init__(self):
        # Emission factors kg CO2 per ton of fuel
        # Typical marine fuels (simplified):
        self.emission_factors = {
            "hfo": 3114,   # kg CO2/ton
            "vlsfo": 3114,
            "mgo": 3206,
            "lng": 2750
        }
        # Default specific fuel consumption (SFC) ton per day per ship type (simplified)
        self.sfc_tpd = {
            "container": 50.0,
            "bulk": 35.0,
            "tanker": 40.0,
            "lng": 60.0,
            "general": 30.0
        }
    
    def estimate(self, distance_nm: float, days_at_sea: float, fuel: str = "vlsfo", vessel_type: str = "general") -> Dict[str, Any]:
        try:
            fuel_key = fuel.lower()
            ef = self.emission_factors.get(fuel_key, self.emission_factors["vlsfo"])  # kg CO2/ton
            sfc = self.sfc_tpd.get(vessel_type, self.sfc_tpd["general"])  # ton/day
            fuel_tons = sfc * days_at_sea
            co2_kg = ef * fuel_tons
            return {
                "distance_nm": distance_nm,
                "days_at_sea": days_at_sea,
                "fuel_tons": round(fuel_tons, 2),
                "co2_kg": round(co2_kg, 2),
                "co2_tons": round(co2_kg / 1000, 2),
                "fuel": fuel_key,
                "vessel_type": vessel_type
            }
        except Exception as e:
            logger.error(f"Error estimating emissions: {e}")
            return {"error": str(e)} 