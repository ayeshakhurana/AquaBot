import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import uuid

logger = logging.getLogger(__name__)

class MemoryService:
    def __init__(self):
        # Conversation storage
        self.conversations = {}
        self.interactions = []
        
        # Memory settings
        self.max_conversations = 100
        self.max_interactions = 1000
        self.conversation_timeout_hours = 24
        
        # Context management
        self.active_contexts = {}
        self.context_timeout_minutes = 30
    
    def store_interaction(self, user_message: str, ai_response: str, agent_type: str = "general", 
                         context: Optional[Dict[str, Any]] = None, conversation_id: Optional[str] = None) -> str:
        """Store a new interaction in memory"""
        try:
            # Generate conversation ID if not provided
            if not conversation_id:
                conversation_id = str(uuid.uuid4())
            
            # Create interaction record
            interaction = {
                "id": str(uuid.uuid4()),
                "conversation_id": conversation_id,
                "timestamp": datetime.now().isoformat(),
                "user_message": user_message,
                "ai_response": ai_response,
                "agent_type": agent_type,
                "context": context or {},
                "metadata": {
                    "message_length": len(user_message),
                    "response_length": len(ai_response),
                    "processing_time": None  # Could be added later
                }
            }
            
            # Store interaction
            self.interactions.append(interaction)
            
            # Maintain conversation
            if conversation_id not in self.conversations:
                self.conversations[conversation_id] = {
                    "id": conversation_id,
                    "created_at": datetime.now().isoformat(),
                    "last_updated": datetime.now().isoformat(),
                    "interaction_count": 0,
                    "agent_types_used": set(),
                    "context_summary": {}
                }
            
            # Update conversation
            conv = self.conversations[conversation_id]
            conv["last_updated"] = datetime.now().isoformat()
            conv["interaction_count"] += 1
            conv["agent_types_used"].add(agent_type)
            
            # Update context summary
            if context:
                self._update_context_summary(conv, context)
            
            # Cleanup old data
            self._cleanup_old_data()
            
            return conversation_id
            
        except Exception as e:
            logger.error(f"Error storing interaction: {str(e)}")
            return None
    
    def get_conversation_history(self, conversation_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get conversation history for a specific conversation"""
        try:
            if conversation_id not in self.conversations:
                return []
            
            # Get interactions for this conversation
            conv_interactions = [
                interaction for interaction in self.interactions
                if interaction["conversation_id"] == conversation_id
            ]
            
            # Sort by timestamp (newest first) and limit
            conv_interactions.sort(key=lambda x: x["timestamp"], reverse=True)
            return conv_interactions[:limit]
            
        except Exception as e:
            logger.error(f"Error getting conversation history: {str(e)}")
            return []
    
    def get_recent_interactions(self, limit: int = 50, agent_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get recent interactions with optional filtering"""
        try:
            filtered_interactions = self.interactions.copy()
            
            # Filter by agent type if specified
            if agent_type:
                filtered_interactions = [
                    interaction for interaction in filtered_interactions
                    if interaction["agent_type"] == agent_type
                ]
            
            # Sort by timestamp (newest first) and limit
            filtered_interactions.sort(key=lambda x: x["timestamp"], reverse=True)
            return filtered_interactions[:limit]
            
        except Exception as e:
            logger.error(f"Error getting recent interactions: {str(e)}")
            return []
    
    def get_conversation_summary(self, conversation_id: str) -> Optional[Dict[str, Any]]:
        """Get summary of a specific conversation"""
        try:
            if conversation_id not in self.conversations:
                return None
            
            conv = self.conversations[conversation_id]
            
            # Get recent interactions for context
            recent_interactions = self.get_conversation_history(conversation_id, 5)
            
            summary = {
                "conversation_id": conversation_id,
                "created_at": conv["created_at"],
                "last_updated": conv["last_updated"],
                "interaction_count": conv["interaction_count"],
                "agent_types_used": list(conv["agent_types_used"]),
                "context_summary": conv["context_summary"],
                "recent_topics": self._extract_recent_topics(recent_interactions),
                "duration": self._calculate_conversation_duration(conv["created_at"], conv["last_updated"])
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"Error getting conversation summary: {str(e)}")
            return None
    
    def search_interactions(self, query: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Search interactions by content"""
        try:
            query_lower = query.lower()
            matching_interactions = []
            
            for interaction in self.interactions:
                # Search in user message and AI response
                if (query_lower in interaction["user_message"].lower() or 
                    query_lower in interaction["ai_response"].lower()):
                    matching_interactions.append(interaction)
            
            # Sort by timestamp (newest first) and limit
            matching_interactions.sort(key=lambda x: x["timestamp"], reverse=True)
            return matching_interactions[:limit]
            
        except Exception as e:
            logger.error(f"Error searching interactions: {str(e)}")
            return []
    
    def get_agent_usage_stats(self) -> Dict[str, Any]:
        """Get statistics about agent usage"""
        try:
            stats = {}
            
            # Count interactions by agent type
            agent_counts = {}
            for interaction in self.interactions:
                agent_type = interaction["agent_type"]
                agent_counts[agent_type] = agent_counts.get(agent_type, 0) + 1
            
            # Calculate percentages
            total_interactions = len(self.interactions)
            agent_percentages = {}
            for agent_type, count in agent_counts.items():
                agent_percentages[agent_type] = (count / total_interactions * 100) if total_interactions > 0 else 0
            
            stats["total_interactions"] = total_interactions
            stats["agent_counts"] = agent_counts
            stats["agent_percentages"] = agent_percentages
            stats["total_conversations"] = len(self.conversations)
            stats["active_conversations"] = len([c for c in self.conversations.values() 
                                              if self._is_conversation_active(c["last_updated"])])
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting agent usage stats: {str(e)}")
            return {}
    
    def create_context(self, context_data: Dict[str, Any], timeout_minutes: Optional[int] = None) -> str:
        """Create a new context for conversation"""
        try:
            context_id = str(uuid.uuid4())
            
            self.active_contexts[context_id] = {
                "id": context_id,
                "created_at": datetime.now().isoformat(),
                "timeout_minutes": timeout_minutes or self.context_timeout_minutes,
                "data": context_data,
                "last_accessed": datetime.now().isoformat()
            }
            
            return context_id
            
        except Exception as e:
            logger.error(f"Error creating context: {str(e)}")
            return None
    
    def get_context(self, context_id: str) -> Optional[Dict[str, Any]]:
        """Get context data by ID"""
        try:
            if context_id not in self.active_contexts:
                return None
            
            context = self.active_contexts[context_id]
            
            # Check if context has expired
            if self._is_context_expired(context):
                del self.active_contexts[context_id]
                return None
            
            # Update last accessed time
            context["last_accessed"] = datetime.now().isoformat()
            
            return context["data"]
            
        except Exception as e:
            logger.error(f"Error getting context: {str(e)}")
            return None
    
    def update_context(self, context_id: str, new_data: Dict[str, Any]) -> bool:
        """Update existing context with new data"""
        try:
            if context_id not in self.active_contexts:
                return False
            
            context = self.active_contexts[context_id]
            
            # Merge new data with existing data
            context["data"].update(new_data)
            context["last_accessed"] = datetime.now().isoformat()
            
            return True
            
        except Exception as e:
            logger.error(f"Error updating context: {str(e)}")
            return False
    
    def get_current_timestamp(self) -> str:
        """Get current timestamp in ISO format"""
        return datetime.now().isoformat()
    
    def _update_context_summary(self, conversation: Dict[str, Any], context: Dict[str, Any]):
        """Update conversation context summary"""
        try:
            if "context_summary" not in conversation:
                conversation["context_summary"] = {}
            
            summary = conversation["context_summary"]
            
            # Update with new context data
            for key, value in context.items():
                if key not in summary:
                    summary[key] = []
                
                # Store unique values
                if value not in summary[key]:
                    summary[key].append(value)
                    
                    # Limit to last 10 values
                    if len(summary[key]) > 10:
                        summary[key] = summary[key][-10:]
            
        except Exception as e:
            logger.error(f"Error updating context summary: {str(e)}")
    
    def _extract_recent_topics(self, interactions: List[Dict[str, Any]]) -> List[str]:
        """Extract recent conversation topics"""
        try:
            topics = []
            
            for interaction in interactions[:5]:  # Last 5 interactions
                # Extract key words from user message
                message_words = interaction["user_message"].lower().split()
                
                # Look for maritime-related keywords
                maritime_keywords = ["laytime", "weather", "port", "distance", "charter", "cargo", "vessel"]
                for keyword in maritime_keywords:
                    if keyword in message_words:
                        topics.append(keyword)
            
            # Return unique topics
            return list(set(topics))
            
        except Exception as e:
            logger.error(f"Error extracting recent topics: {str(e)}")
            return []
    
    def _calculate_conversation_duration(self, created_at: str, last_updated: str) -> str:
        """Calculate conversation duration"""
        try:
            created = datetime.fromisoformat(created_at)
            updated = datetime.fromisoformat(last_updated)
            duration = updated - created
            
            if duration.days > 0:
                return f"{duration.days} days"
            elif duration.seconds > 3600:
                hours = duration.seconds // 3600
                return f"{hours} hours"
            else:
                minutes = duration.seconds // 60
                return f"{minutes} minutes"
            
        except Exception as e:
            logger.error(f"Error calculating conversation duration: {str(e)}")
            return "Unknown"
    
    def _is_conversation_active(self, last_updated: str) -> bool:
        """Check if conversation is still active"""
        try:
            last_updated_dt = datetime.fromisoformat(last_updated)
            timeout_threshold = datetime.now() - timedelta(hours=self.conversation_timeout_hours)
            return last_updated_dt > timeout_threshold
        except Exception:
            return False
    
    def _is_context_expired(self, context: Dict[str, Any]) -> bool:
        """Check if context has expired"""
        try:
            created_at = datetime.fromisoformat(context["created_at"])
            timeout_minutes = context["timeout_minutes"]
            timeout_threshold = datetime.now() - timedelta(minutes=timeout_minutes)
            return created_at < timeout_threshold
        except Exception:
            return True
    
    def _cleanup_old_data(self):
        """Clean up old conversations and interactions"""
        try:
            # Remove old conversations
            current_time = datetime.now()
            expired_conversations = []
            
            for conv_id, conv in self.conversations.items():
                last_updated = datetime.fromisoformat(conv["last_updated"])
                if current_time - last_updated > timedelta(hours=self.conversation_timeout_hours):
                    expired_conversations.append(conv_id)
            
            for conv_id in expired_conversations:
                del self.conversations[conv_id]
            
            # Remove old interactions
            if len(self.interactions) > self.max_interactions:
                # Keep only the most recent interactions
                self.interactions.sort(key=lambda x: x["timestamp"], reverse=True)
                self.interactions = self.interactions[:self.max_interactions]
            
            # Clean up expired contexts
            expired_contexts = []
            for context_id, context in self.active_contexts.items():
                if self._is_context_expired(context):
                    expired_contexts.append(context_id)
            
            for context_id in expired_contexts:
                del self.active_contexts[context_id]
                
        except Exception as e:
            logger.error(f"Error during cleanup: {str(e)}")
    
    def process_query(self, query: str) -> str:
        """Process natural language queries about the memory service"""
        query_lower = query.lower()
        
        if "memory" in query_lower or "history" in query_lower:
            if "stats" in query_lower or "usage" in query_lower:
                stats = self.get_agent_usage_stats()
                return f"""
**🧠 Memory Service Statistics:**

**Total Interactions:** {stats.get('total_interactions', 0)}
**Total Conversations:** {stats.get('total_conversations', 0)}
**Active Conversations:** {stats.get('active_conversations', 0)}

**Agent Usage:**
"""
                for agent_type, count in stats.get("agent_counts", {}).items():
                    percentage = stats.get("agent_percentages", {}).get(agent_type, 0)
                    return f"- **{agent_type}**: {count} ({percentage:.1f}%)"
                
                return "No agent usage data available."
            
            elif "search" in query_lower:
                return """
**🧠 Memory Search:**

I can search through conversation history for specific topics or content.

**Search Capabilities:**
- Search by keywords or phrases
- Filter by agent type
- Find related conversations
- Extract context and patterns

**Example searches:**
- "laytime calculations"
- "weather forecasts"
- "port information"
- "charter party"
"""
            else:
                return """
**🧠 Memory Service:**

I maintain conversation history and context for better maritime assistance.

**Features:**
- Conversation tracking
- Context management
- Interaction history
- Agent usage statistics
- Search capabilities

**Commands:**
- "memory stats" - View usage statistics
- "memory search" - Search conversations
- "memory help" - Get assistance
"""
        else:
            return """
**🧠 Conversation Memory System:**

I track and manage conversation context to provide better maritime assistance.

**Capabilities:**
- Store conversation history
- Maintain context across interactions
- Track agent usage patterns
- Enable conversation search
- Context-aware responses

Ask me about memory features or conversation history!
""" 