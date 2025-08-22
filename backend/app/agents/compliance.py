import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class ComplianceAgent:
    def __init__(self):
        # Simple rule hints; real implementation would parse CP in detail
        self.rules = {
            "nor_within_limits": "NOR must be tendered within port limits and during office hours unless WIPON/WIBON/WIFPON applies.",
            "laytime_exceptions": "Laytime exceptions include weather working days, strikes, and exceptions listed in CP.",
            "sof_accuracy": "SOF entries should be accurate, chronological, and signed by master/agent."
        }

    def validate(self, sof: Dict[str, Any], cp_notes: str = "") -> Dict[str, Any]:
        issues: List[str] = []
        warnings: List[str] = []
        events = sof.get("extracted_data", {})

        # Check NOR presence
        if not events.get("nor_time"):
            issues.append("NOR timestamp missing in SOF.")

        # Check arrival/departure
        if not events.get("arrival_time"):
            issues.append("Arrival time missing in SOF.")
        if not events.get("departure_time"):
            warnings.append("Departure time missing; voyage may be ongoing.")

        # Basic chronology check (string presence only here)
        if events.get("arrival_time") and events.get("departure_time"):
            pass  # Placeholder for ordering check

        # Add rule hints
        hints = list(self.rules.values())
        return {
            "issues": issues,
            "warnings": warnings,
            "hints": hints
        }

    def process_query(self, query: str) -> str:
        return "Provide SOF data to validate." 