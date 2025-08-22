import logging
from typing import Dict, Any, Optional
from ..services.gemini import GeminiService

logger = logging.getLogger(__name__)

class CPAgent:
    def __init__(self, gemini_service: Optional[GeminiService] = None):
        self.gemini = gemini_service

    def explain_clause(self, clause_text: str, context: Optional[Dict[str, Any]] = None) -> str:
        try:
            if not self.gemini or not self.gemini.is_configured:
                return "CP Agent unavailable: Gemini not configured."
            prompt = (
                "You are a maritime charter party expert. Explain the following clause clearly, "
                "noting obligations, risks, and typical interpretations. If relevant, give examples.\n\n"
                f"Clause:\n{clause_text}\n\n"
                "Return a concise explanation with headings: Summary, Obligations, Risks, Notes."
            )
            return self.gemini.generate_response(prompt)
        except Exception as e:
            logger.error(f"Error explaining clause: {e}")
            return "Error explaining clause."

    def process_query(self, query: str) -> str:
        return self.explain_clause(query) 