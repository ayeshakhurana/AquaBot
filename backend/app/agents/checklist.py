import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class ChecklistAgent:
    def __init__(self):
        self.templates = {
            "pre_fixture": [
                "Obtain charter party draft",
                "Review vessel certificates (class, P&I, statutory)",
                "Confirm cargo specs and load/discharge ports",
                "Nominate vessel and issue NOR requirements"
            ],
            "on_voyage": [
                "Issue NOR on arrival per CP terms",
                "Record SOF events with timestamps",
                "Monitor weather and routing",
                "Exchange arrival/departure reports"
            ],
            "post_voyage": [
                "Prepare laytime statement",
                "Issue demurrage/despatch invoice",
                "Archive CP, NOR, SOF, B/L copies",
                "Submit performance and bunker reports"
            ]
        }
    
    def suggest(self, stage: str) -> Dict[str, Any]:
        stage_key = stage.strip().lower().replace('-', '_').replace(' ', '_')
        items = self.templates.get(stage_key)
        if not items:
            return {"stage": stage, "items": [], "error": "Unknown stage"}
        return {"stage": stage_key, "items": items}

    def process_query(self, query: str) -> str:
        q = query.lower()
        if any(k in q for k in ["pre-fixture", "pre fixture", "prefixture"]):
            return "\n".join(self.templates["pre_fixture"]) 
        if any(k in q for k in ["on-voyage", "on voyage"]):
            return "\n".join(self.templates["on_voyage"]) 
        if any(k in q for k in ["post-voyage", "post voyage", "postvoyage"]):
            return "\n".join(self.templates["post_voyage"]) 
        return "Specify voyage stage: pre-fixture, on-voyage, or post-voyage." 