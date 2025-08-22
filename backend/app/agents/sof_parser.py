import re
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import math
try:
    import fitz  # PyMuPDF
except Exception:
    fitz = None

logger = logging.getLogger(__name__)

class SOFParserAgent:
    def __init__(self):
        # SOF field patterns
        self.sof_patterns = {
            "vessel_name": [
                r"vessel[:\s]+([A-Za-z\s\-]+?)(?:\n|$)",
                r"m/v\s+([A-Za-z\s\-]+?)(?:\n|$)",
                r"m\.v\.\s+([A-Za-z\s\-]+?)(?:\n|$)",
                r"ship[:\s]+([A-Za-z\s\-]+?)(?:\n|$)"
            ],
            "voyage_number": [
                r"voyage[:\s]+([A-Za-z0-9\s\-]+?)(?:\n|$)",
                r"voy\s+([A-Za-z0-9\s\-]+?)(?:\n|$)",
                r"voyage\s+no[:\s]+([A-Za-z0-9\s\-]+?)(?:\n|$)"
            ],
            "arrival_time": [
                r"arrival[:\s]+([0-9]{1,2}[/\-][0-9]{1,2}[/\-][0-9]{2,4}[,\s]+[0-9]{1,2}:[0-9]{2})",
                r"arrived[:\s]+([0-9]{1,2}[/\-][0-9]{1,2}[/\-][0-9]{2,4}[,\s]+[0-9]{1,2}:[0-9]{2})",
                r"eta[:\s]+([0-9]{1,2}[/\-][0-9]{1,2}[/\-][0-9]{2,4}[,\s]+[0-9]{1,2}:[0-9]{2})"
            ],
            "departure_time": [
                r"departure[:\s]+([0-9]{1,2}[/\-][0-9]{1,2}[/\-][0-9]{2,4}[,\s]+[0-9]{1,2}:[0-9]{2})",
                r"departed[:\s]+([0-9]{1,2}[/\-][0-9]{1,2}[/\-][0-9]{2,4}[,\s]+[0-9]{1,2}:[0-9]{2})",
                r"etd[:\s]+([0-9]{1,2}[/\-][0-9]{1,2}[/\-][0-9]{2,4}[,\s]+[0-9]{1,2}:[0-9]{2})"
            ],
            "nor_time": [
                r"nor[:\s]+([0-9]{1,2}[/\-][0-9]{1,2}[/\-][0-9]{2,4}[,\s]+[0-9]{1,2}:[0-9]{2})",
                r"notice\s+of\s+readiness[:\s]+([0-9]{1,2}[/\-][0-9]{1,2}[/\-][0-9]{2,4}[,\s]+[0-9]{1,2}:[0-9]{2})",
                r"readiness[:\s]+([0-9]{1,2}[/\-][0-9]{1,2}[/\-][0-9]{2,4}[,\s]+[0-9]{1,2}:[0-9]{2})"
            ],
            "laytime_allowed": [
                r"laytime[:\s]+([0-9]+(?:\.[0-9]+)?)\s*(hours?|days?)",
                r"lay\s+time[:\s]+([0-9]+(?:\.[0-9]+)?)\s*(hours?|days?)",
                r"allowed\s+time[:\s]+([0-9]+(?:\.[0-9]+)?)\s*(hours?|days?)"
            ],
            "cargo_quantity": [
                r"cargo[:\s]+([0-9,]+(?:\.[0-9]+)?)\s*(mt|tons?|metric\s+tons?)",
                r"quantity[:\s]+([0-9,]+(?:\.[0-9]+)?)\s*(mt|tons?|metric\s+tons?)",
                r"loaded[:\s]+([0-9,]+(?:\.[0-9]+)?)\s*(mt|tons?|metric\s+tons?)",
                r"discharged[:\s]+([0-9,]+(?:\.[0-9]+)?)\s*(mt|tons?|metric\s+tons?)"
            ],
            "berth_info": [
                r"berth[:\s]+([A-Za-z0-9\s\-]+?)(?:\n|$)",
                r"terminal[:\s]+([A-Za-z0-9\s\-]+?)(?:\n|$)",
                r"quay[:\s]+([A-Za-z0-9\s\-]+?)(?:\n|$)"
            ],
            "port_name": [
                r"port[:\s]+([A-Za-z\s]+?)(?:\n|$)",
                r"at\s+([A-Za-z\s]+?)(?:\n|$)",
                r"in\s+([A-Za-z\s]+?)(?:\n|$)"
            ]
        }
        
        # Standard laytime parameters
        self.default_laytime_params = {
            "notice_period": 6,  # hours
            "working_hours_per_day": 24,
            "sundays_holidays_excluded": True,
            "weather_working_days": True
        }
    
    def parse_sof_document(self, content: bytes, filename: str) -> Dict[str, Any]:
        """Parse Statement of Facts document and extract key information"""
        try:
            # Convert content to text
            if isinstance(content, bytes):
                text_content = content.decode('utf-8', errors='ignore')
            else:
                text_content = str(content)
            # If PDF content looks binary or empty text, try PyMuPDF
            if fitz and (filename.lower().endswith('.pdf')) and (not text_content or len(text_content.strip()) < 20):
                try:
                    doc = fitz.open(stream=content, filetype='pdf')
                    pages_text = []
                    for page in doc:
                        pages_text.append(page.get_text())
                    text_content = "\n".join(pages_text)
                except Exception:
                    pass
            
            # Extract SOF data
            extracted_data = self._extract_sof_data(text_content)
            
            # Parse dates and times
            parsed_data = self._parse_dates_and_times(extracted_data)
            
            # Calculate laytime
            laytime_calculations = self._calculate_laytime(parsed_data)
            
            # Generate demurrage/despatch analysis
            financial_analysis = self._analyze_financial_implications(parsed_data, laytime_calculations)
            
            return {
                "filename": filename,
                "extracted_data": extracted_data,
                "parsed_data": parsed_data,
                "laytime_calculations": laytime_calculations,
                "financial_analysis": financial_analysis,
                "analysis_timestamp": datetime.now().isoformat(),
                "confidence_score": self._calculate_confidence_score(extracted_data)
            }
            
        except Exception as e:
            logger.error(f"Error parsing SOF document: {str(e)}")
            return {"error": f"SOF parsing failed: {str(e)}"}
    
    def _extract_sof_data(self, text_content: str) -> Dict[str, Any]:
        """Extract SOF data using pattern matching"""
        extracted_data = {}
        
        for field_name, patterns in self.sof_patterns.items():
            extracted_data[field_name] = []
            
            for pattern in patterns:
                matches = re.findall(pattern, text_content, re.IGNORECASE)
                for match in matches:
                    if isinstance(match, tuple):
                        # Handle groups in regex
                        extracted_data[field_name].extend([m for m in match if m.strip()])
                    else:
                        # Single match
                        if match.strip():
                            extracted_data[field_name].append(match.strip())
            
            # Remove duplicates while preserving order
            seen = set()
            unique_matches = []
            for match in extracted_data[field_name]:
                if match not in seen:
                    seen.add(match)
                    unique_matches.append(match)
            extracted_data[field_name] = unique_matches
        
        return extracted_data
    
    def _parse_dates_and_times(self, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse and standardize dates and times from extracted data"""
        parsed_data = extracted_data.copy()
        
        # Parse arrival time
        if extracted_data.get("arrival_time"):
            parsed_data["arrival_datetime"] = self._parse_datetime(extracted_data["arrival_time"][0])
        
        # Parse departure time
        if extracted_data.get("departure_time"):
            parsed_data["departure_datetime"] = self._parse_datetime(extracted_data["departure_time"][0])
        
        # Parse NOR time
        if extracted_data.get("nor_time"):
            parsed_data["nor_datetime"] = self._parse_datetime(extracted_data["nor_time"][0])
        
        # Parse laytime allowed
        if extracted_data.get("laytime_allowed"):
            parsed_data["laytime_hours"] = self._parse_laytime(extracted_data["laytime_allowed"][0])
        
        # Parse cargo quantity
        if extracted_data.get("cargo_quantity"):
            parsed_data["cargo_mt"] = self._parse_cargo_quantity(extracted_data["cargo_quantity"][0])
        
        return parsed_data
    
    def _parse_datetime(self, datetime_str: str) -> Optional[datetime]:
        """Parse datetime string to datetime object"""
        try:
            # Try different date formats
            formats = [
                "%d/%m/%Y, %H:%M",
                "%d-%m-%Y, %H:%M",
                "%Y-%m-%d, %H:%M",
                "%d/%m/%y, %H:%M",
                "%d-%m-%y, %H:%M"
            ]
            
            for fmt in formats:
                try:
                    return datetime.strptime(datetime_str, fmt)
                except ValueError:
                    continue
            
            # If no format matches, try without time
            date_formats = [
                "%d/%m/%Y",
                "%d-%m-%Y",
                "%Y-%m-%d",
                "%d/%m/%y",
                "%d-%m-%y"
            ]
            
            for fmt in date_formats:
                try:
                    return datetime.strptime(datetime_str, fmt)
                except ValueError:
                    continue
            
            return None
            
        except Exception as e:
            logger.error(f"Error parsing datetime '{datetime_str}': {str(e)}")
            return None
    
    def _parse_laytime(self, laytime_str: str) -> Optional[float]:
        """Parse laytime string to hours"""
        try:
            # Extract number and unit
            match = re.search(r"([0-9]+(?:\.[0-9]+)?)\s*(hours?|days?)", laytime_str, re.IGNORECASE)
            if match:
                value = float(match.group(1))
                unit = match.group(2).lower()
                
                if "day" in unit:
                    return value * 24
                else:
                    return value
            
            return None
            
        except Exception as e:
            logger.error(f"Error parsing laytime '{laytime_str}': {str(e)}")
            return None
    
    def _parse_cargo_quantity(self, cargo_str: str) -> Optional[float]:
        """Parse cargo quantity string to metric tons"""
        try:
            # Extract number
            match = re.search(r"([0-9,]+(?:\.[0-9]+)?)", cargo_str)
            if match:
                # Remove commas and convert to float
                value_str = match.group(1).replace(",", "")
                return float(value_str)
            
            return None
            
        except Exception as e:
            logger.error(f"Error parsing cargo quantity '{cargo_str}': {str(e)}")
            return None
    
    def _calculate_laytime(self, parsed_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate laytime usage and efficiency"""
        try:
            calculations = {}
            
            # Get key timestamps
            nor_time = parsed_data.get("nor_datetime")
            arrival_time = parsed_data.get("arrival_datetime")
            departure_time = parsed_data.get("departure_datetime")
            laytime_allowed = parsed_data.get("laytime_hours")
            
            if nor_time and departure_time:
                # Calculate total time from NOR to departure
                total_time = departure_time - nor_time
                total_hours = total_time.total_seconds() / 3600
                
                calculations["total_time_hours"] = total_hours
                calculations["total_time_days"] = total_hours / 24
                
                # Calculate laytime efficiency
                if laytime_allowed:
                    calculations["laytime_allowed_hours"] = laytime_allowed
                    calculations["laytime_allowed_days"] = laytime_allowed / 24
                    
                    if total_hours <= laytime_allowed:
                        calculations["laytime_status"] = "within_limit"
                        calculations["time_saved_hours"] = laytime_allowed - total_hours
                        calculations["time_saved_days"] = (laytime_allowed - total_hours) / 24
                    else:
                        calculations["laytime_status"] = "exceeded"
                        calculations["time_exceeded_hours"] = total_hours - laytime_allowed
                        calculations["time_exceeded_days"] = (total_hours - laytime_allowed) / 24
            
            # Calculate cargo handling rate
            cargo_mt = parsed_data.get("cargo_mt")
            if cargo_mt and "total_time_hours" in calculations:
                calculations["cargo_rate_mt_per_hour"] = cargo_mt / calculations["total_time_hours"]
                calculations["cargo_rate_mt_per_day"] = cargo_mt / calculations["total_time_days"]
            
            return calculations
            
        except Exception as e:
            logger.error(f"Error calculating laytime: {str(e)}")
            return {"error": f"Laytime calculation failed: {str(e)}"}
    
    def _analyze_financial_implications(self, parsed_data: Dict[str, Any], 
                                      laytime_calculations: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze financial implications of laytime usage"""
        try:
            financial_analysis = {}
            
            # Example demurrage/despatch rates (should come from charter party)
            example_rates = {
                "demurrage_rate_usd_per_day": 25000,
                "despatch_rate_usd_per_day": 12500  # Usually 50% of demurrage
            }
            
            if "laytime_status" in laytime_calculations:
                status = laytime_calculations["laytime_status"]
                
                if status == "within_limit":
                    # Calculate despatch
                    time_saved_days = laytime_calculations.get("time_saved_days", 0)
                    despatch_amount = time_saved_days * example_rates["despatch_rate_usd_per_day"]
                    
                    financial_analysis["despatch_amount_usd"] = despatch_amount
                    financial_analysis["despatch_rate_usd_per_day"] = example_rates["despatch_rate_usd_per_day"]
                    financial_analysis["time_saved_days"] = time_saved_days
                    financial_analysis["financial_impact"] = "positive"
                    
                elif status == "exceeded":
                    # Calculate demurrage
                    time_exceeded_days = laytime_calculations.get("time_exceeded_days", 0)
                    demurrage_amount = time_exceeded_days * example_rates["demurrage_rate_usd_per_day"]
                    
                    financial_analysis["demurrage_amount_usd"] = demurrage_amount
                    financial_analysis["demurrage_rate_usd_per_day"] = example_rates["demurrage_rate_usd_per_day"]
                    financial_analysis["time_exceeded_days"] = time_exceeded_days
                    financial_analysis["financial_impact"] = "negative"
            
            # Add rate information
            financial_analysis["example_rates"] = example_rates
            financial_analysis["note"] = "Rates are examples. Actual rates should be verified from charter party."
            
            return financial_analysis
            
        except Exception as e:
            logger.error(f"Error analyzing financial implications: {str(e)}")
            return {"error": f"Financial analysis failed: {str(e)}"}
    
    def _calculate_confidence_score(self, extracted_data: Dict[str, Any]) -> float:
        """Calculate confidence score for extracted data"""
        try:
            # Count fields with data
            fields_with_data = sum(1 for field_data in extracted_data.values() if field_data)
            total_fields = len(extracted_data)
            
            # Base confidence on data completeness
            base_confidence = fields_with_data / total_fields if total_fields > 0 else 0
            
            # Boost confidence for critical fields
            critical_fields = ["vessel_name", "arrival_time", "departure_time"]
            critical_boost = 0.2
            
            critical_fields_present = sum(1 for field in critical_fields if extracted_data.get(field))
            critical_confidence = critical_fields_present / len(critical_fields) * critical_boost
            
            final_confidence = min(base_confidence + critical_confidence, 1.0)
            
            return round(final_confidence, 2)
            
        except Exception as e:
            logger.error(f"Error calculating confidence score: {str(e)}")
            return 0.0
    
    def calculate_laytime_scenario(self, laytime_hours: float, notice_period: float = 6, 
                                 working_hours_per_day: float = 24) -> Dict[str, Any]:
        """Calculate laytime for a given scenario"""
        try:
            # Calculate total time including notice period
            total_time_hours = laytime_hours + notice_period
            total_time_days = total_time_hours / working_hours_per_day
            
            # Calculate demurrage/despatch scenarios
            demurrage_rate_per_day = 25000  # USD per day (example)
            despatch_rate_per_day = demurrage_rate_per_day * 0.5  # Usually 50% of demurrage
            
            return {
                "laytime_hours": laytime_hours,
                "notice_period_hours": notice_period,
                "total_time_hours": total_time_hours,
                "total_time_days": total_time_days,
                "demurrage_rate_usd_per_day": demurrage_rate_per_day,
                "despatch_rate_usd_per_day": despatch_rate_per_day,
                "working_hours_per_day": working_hours_per_day
            }
            
        except Exception as e:
            logger.error(f"Error calculating laytime scenario: {str(e)}")
            return {"error": f"Laytime calculation failed: {str(e)}"}
    
    def process_query(self, query: str) -> str:
        return "Upload an SOF document to analyze and compute laytime." 