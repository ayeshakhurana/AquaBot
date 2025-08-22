import requests
import json
from typing import Dict, Any, Optional, List
import logging
from datetime import datetime
import asyncio

logger = logging.getLogger(__name__)

class AlertsAgent:
    def __init__(self):
        self.telegram_bot_token = None
        self.telegram_chat_id = None
        self.matrix_homeserver = None
        self.matrix_user_id = None
        self.matrix_access_token = None
        self.matrix_room_id = None
        
        # Alert types and priorities
        self.alert_types = {
            "weather": {
                "priority": "high",
                "icon": "🌤️",
                "description": "Weather alerts and warnings"
            },
            "navigation": {
                "priority": "medium",
                "icon": "🧭",
                "description": "Navigation and routing alerts"
            },
            "port": {
                "priority": "medium",
                "icon": "🏠",
                "description": "Port operations and restrictions"
            },
            "safety": {
                "priority": "high",
                "icon": "⚠️",
                "description": "Safety and security alerts"
            },
            "operational": {
                "priority": "low",
                "icon": "📊",
                "description": "Operational updates and notifications"
            }
        }
        
        # Alert history
        self.alert_history = []
    
    def configure_telegram(self, bot_token: str, chat_id: str):
        """Configure Telegram bot for alerts"""
        try:
            self.telegram_bot_token = bot_token
            self.telegram_chat_id = chat_id
            
            # Test the configuration
            test_result = self._test_telegram_connection()
            if test_result["success"]:
                logger.info("Telegram bot configured successfully")
                return {"success": True, "message": "Telegram bot configured successfully"}
            else:
                logger.error(f"Telegram configuration failed: {test_result['error']}")
                return {"success": False, "error": test_result["error"]}
                
        except Exception as e:
            logger.error(f"Error configuring Telegram: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def configure_matrix(self, homeserver: str, user_id: str, access_token: str, room_id: str):
        """Configure Matrix client for alerts"""
        try:
            self.matrix_homeserver = homeserver.rstrip('/')
            self.matrix_user_id = user_id
            self.matrix_access_token = access_token
            self.matrix_room_id = room_id
            
            # Test the configuration
            test_result = self._test_matrix_connection()
            if test_result["success"]:
                logger.info("Matrix client configured successfully")
                return {"success": True, "message": "Matrix client configured successfully"}
            else:
                logger.error(f"Matrix configuration failed: {test_result['error']}")
                return {"success": False, "error": test_result["error"]}
                
        except Exception as e:
            logger.error(f"Error configuring Matrix: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def send_alert(self, alert_type: str, title: str, message: str, priority: Optional[str] = None, 
                   data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Send alert through configured channels"""
        try:
            # Validate alert type
            if alert_type not in self.alert_types:
                return {"success": False, "error": f"Invalid alert type: {alert_type}"}
            
            # Set priority if not specified
            if not priority:
                priority = self.alert_types[alert_type]["priority"]
            
            # Create alert object
            alert = {
                "id": self._generate_alert_id(),
                "type": alert_type,
                "title": title,
                "message": message,
                "priority": priority,
                "timestamp": datetime.now().isoformat(),
                "data": data or {},
                "status": "sent"
            }
            
            # Send to Telegram
            telegram_result = {"success": False, "error": "Not configured"}
            if self.telegram_bot_token and self.telegram_chat_id:
                telegram_result = self._send_telegram_alert(alert)
            
            # Send to Matrix
            matrix_result = {"success": False, "error": "Not configured"}
            if self.matrix_homeserver and self.matrix_user_id and self.matrix_access_token:
                matrix_result = self._send_matrix_alert(alert)
            
            # Store in history
            self.alert_history.append(alert)
            
            # Return results
            return {
                "success": True,
                "alert_id": alert["id"],
                "telegram": telegram_result,
                "matrix": matrix_result,
                "timestamp": alert["timestamp"]
            }
            
        except Exception as e:
            logger.error(f"Error sending alert: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def send_weather_alert(self, port_name: str, weather_data: Dict[str, Any]) -> Dict[str, Any]:
        """Send weather-specific alert"""
        try:
            # Extract key weather information
            current = weather_data.get("current_weather", {})
            insights = weather_data.get("maritime_insights", {})
            
            # Determine alert priority based on conditions
            priority = "low"
            if current.get("wind_speed", 0) > 25 or current.get("precipitation", 0) > 10:
                priority = "high"
            elif current.get("wind_speed", 0) > 15 or current.get("precipitation", 0) > 5:
                priority = "medium"
            
            # Create weather alert
            title = f"🌤️ Weather Alert - {port_name}"
            message = f"""
**Port**: {port_name}
**Temperature**: {current.get('temperature', 'N/A')}°C
**Wind**: {current.get('wind_speed', 'N/A')} km/h from {current.get('wind_direction', 'N/A')}°
**Conditions**: {current.get('weather_description', 'N/A')}

**Operational Impact:**
"""
            
            for impact in insights.get("operational_impact", []):
                message += f"• {impact}\n"
            
            message += f"""

**Safety Considerations:**
"""
            for safety in insights.get("safety_considerations", []):
                message += f"• {safety}\n"
            
            # Send alert
            return self.send_alert(
                alert_type="weather",
                title=title,
                message=message.strip(),
                priority=priority,
                data=weather_data
            )
            
        except Exception as e:
            logger.error(f"Error sending weather alert: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def send_navigation_alert(self, port1: str, port2: str, distance_data: Dict[str, Any]) -> Dict[str, Any]:
        """Send navigation-specific alert"""
        try:
            title = f"🧭 Navigation Update - {port1} to {port2}"
            message = f"""
**Route**: {port1} → {port2}
**Distance**: {distance_data['distance']['distance_nm']} NM ({distance_data['distance']['distance_km']} km)

**ETA at Different Speeds:**
"""
            
            eta = distance_data.get("eta", {})
            if "base_speed" in eta:
                base = eta["base_speed"]
                message += f"• **{base['speed_knots']} knots**: {base['eta_hours']} hours ({base['eta_days']} days)\n"
            
            if "alternative_speeds" in eta:
                for speed, eta_data in eta["alternative_speeds"].items():
                    speed_value = speed.replace("_knots", "")
                    message += f"• **{speed_value} knots**: {eta_data['eta_hours']} hours ({eta_data['eta_days']} days)\n"
            
            message += f"""

**Route Insights:**
• **Type**: {distance_data['route_insights']['route_type'].title()}
• **Weather Zones**: {', '.join(distance_data['route_insights']['weather_zones']) if distance_data['route_insights']['weather_zones'] else 'Standard conditions'}
"""
            
            # Send alert
            return self.send_alert(
                alert_type="navigation",
                title=title,
                message=message.strip(),
                priority="medium",
                data=distance_data
            )
            
        except Exception as e:
            logger.error(f"Error sending navigation alert: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def send_port_alert(self, port_name: str, alert_type: str, message: str, priority: str = "medium") -> Dict[str, Any]:
        """Send port-specific alert"""
        try:
            title = f"🏠 Port Alert - {port_name}"
            
            # Send alert
            return self.send_alert(
                alert_type="port",
                title=title,
                message=message,
                priority=priority,
                data={"port_name": port_name, "alert_type": alert_type}
            )
            
        except Exception as e:
            logger.error(f"Error sending port alert: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def get_alert_history(self, limit: int = 50, alert_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get alert history with optional filtering"""
        try:
            history = self.alert_history.copy()
            
            # Filter by type if specified
            if alert_type:
                history = [alert for alert in history if alert["type"] == alert_type]
            
            # Sort by timestamp (newest first) and limit
            history.sort(key=lambda x: x["timestamp"], reverse=True)
            return history[:limit]
            
        except Exception as e:
            logger.error(f"Error getting alert history: {str(e)}")
            return []
    
    def _send_telegram_alert(self, alert: Dict[str, Any]) -> Dict[str, Any]:
        """Send alert via Telegram bot"""
        try:
            if not self.telegram_bot_token or not self.telegram_chat_id:
                return {"success": False, "error": "Telegram not configured"}
            
            # Format message for Telegram
            message = f"{alert['title']}\n\n{alert['message']}"
            
            # Add priority indicator
            priority_icons = {"high": "🔴", "medium": "🟡", "low": "🟢"}
            priority_icon = priority_icons.get(alert["priority"], "⚪")
            message = f"{priority_icon} {message}"
            
            # Send via Telegram Bot API
            url = f"https://api.telegram.org/bot{self.telegram_bot_token}/sendMessage"
            data = {
                "chat_id": self.telegram_chat_id,
                "text": message,
                "parse_mode": "Markdown"
            }
            
            response = requests.post(url, data=data, timeout=10)
            response.raise_for_status()
            
            result = response.json()
            if result.get("ok"):
                return {"success": True, "message_id": result["result"]["message_id"]}
            else:
                return {"success": False, "error": result.get("description", "Unknown error")}
                
        except Exception as e:
            logger.error(f"Error sending Telegram alert: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def _send_matrix_alert(self, alert: Dict[str, Any]) -> Dict[str, Any]:
        """Send alert via Matrix"""
        try:
            if not all([self.matrix_homeserver, self.matrix_user_id, self.matrix_access_token, self.matrix_room_id]):
                return {"success": False, "error": "Matrix not configured"}
            
            # Format message for Matrix
            message = f"{alert['title']}\n\n{alert['message']}"
            
            # Add priority indicator
            priority_icons = {"high": "🔴", "medium": "🟡", "low": "🟢"}
            priority_icon = priority_icons.get(alert["priority"], "⚪")
            message = f"{priority_icon} {message}"
            
            # Send via Matrix Client-Server API
            url = f"{self.matrix_homeserver}/_matrix/client/r0/rooms/{self.matrix_room_id}/send/m.room.message"
            headers = {
                "Authorization": f"Bearer {self.matrix_access_token}",
                "Content-Type": "application/json"
            }
            data = {
                "msgtype": "m.text",
                "body": message,
                "format": "org.matrix.custom.html",
                "formatted_body": message.replace("\n", "<br>")
            }
            
            response = requests.post(url, headers=headers, json=data, timeout=10)
            response.raise_for_status()
            
            result = response.json()
            if "event_id" in result:
                return {"success": True, "event_id": result["event_id"]}
            else:
                return {"success": False, "error": "No event ID in response"}
                
        except Exception as e:
            logger.error(f"Error sending Matrix alert: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def _test_telegram_connection(self) -> Dict[str, Any]:
        """Test Telegram bot connection"""
        try:
            if not self.telegram_bot_token:
                return {"success": False, "error": "Bot token not configured"}
            
            url = f"https://api.telegram.org/bot{self.telegram_bot_token}/getMe"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            result = response.json()
            if result.get("ok"):
                return {"success": True, "bot_info": result["result"]}
            else:
                return {"success": False, "error": result.get("description", "Unknown error")}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _test_matrix_connection(self) -> Dict[str, Any]:
        """Test Matrix client connection"""
        try:
            if not all([self.matrix_homeserver, self.matrix_user_id, self.matrix_access_token]):
                return {"success": False, "error": "Matrix not fully configured"}
            
            url = f"{self.matrix_homeserver}/_matrix/client/r0/account/whoami"
            headers = {"Authorization": f"Bearer {self.matrix_access_token}"}
            
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            result = response.json()
            if "user_id" in result:
                return {"success": True, "user_info": result}
            else:
                return {"success": False, "error": "Invalid response format"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _generate_alert_id(self) -> str:
        """Generate unique alert ID"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        import random
        random_suffix = random.randint(1000, 9999)
        return f"ALERT_{timestamp}_{random_suffix}"
    
    def process_query(self, query: str) -> str:
        """Process natural language alert queries"""
        query_lower = query.lower()
        
        if "alert" in query_lower or "notification" in query_lower:
            if "configure" in query_lower or "setup" in query_lower:
                return """
**🔔 Alert Configuration:**

I can send alerts via Telegram and Matrix. To configure:

**Telegram Setup:**
1. Create a bot with @BotFather
2. Get your chat ID
3. Use: `configure_telegram(bot_token, chat_id)`

**Matrix Setup:**
1. Get your access token from your Matrix client
2. Use: `configure_matrix(homeserver, user_id, access_token, room_id)`

**Alert Types Available:**
- 🌤️ Weather alerts
- 🧭 Navigation updates  
- 🏠 Port operations
- ⚠️ Safety warnings
- 📊 Operational updates
"""
            elif "history" in query_lower or "list" in query_lower:
                history = self.get_alert_history(10)
                if history:
                    response = "**🔔 Recent Alerts:**\n\n"
                    for alert in history:
                        response += f"**{alert['title']}** ({alert['priority']})\n{alert['timestamp']}\n\n"
                    return response.strip()
                else:
                    return "No alerts sent yet."
            else:
                return """
**🔔 Alert System:**

I can send maritime alerts via:
- **Telegram**: Instant bot notifications
- **Matrix**: Secure chat platform

**Alert Types:**
- Weather warnings and forecasts
- Navigation updates and route changes
- Port operations and restrictions
- Safety alerts and warnings
- Operational notifications

**Commands:**
- "configure alerts" - Setup notification channels
- "alert history" - View recent alerts
- "send alert" - Create custom alerts
"""
        else:
            return """
**🔔 Maritime Alert System:**

I provide real-time maritime alerts and notifications through multiple channels.

**Features:**
- Multi-channel delivery (Telegram, Matrix)
- Priority-based alerting
- Weather and navigation alerts
- Port operation notifications
- Custom alert creation

Ask me about configuring alerts or viewing alert history!
""" 