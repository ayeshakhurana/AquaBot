import os
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure

logger = logging.getLogger(__name__)

class MongoDBService:
    def __init__(self):
        self.client = None
        self.db = None
        self.is_connected = False
        
        # MongoDB connection string
        mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        db_name = os.getenv("MONGODB_DB", "maritime_ai")
        
        try:
            self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
            # Test connection
            self.client.admin.command('ping')
            self.db = self.client[db_name]
            self.is_connected = True
            logger.info("MongoDB connected successfully")
            
            # Create indexes for better performance
            self._create_indexes()
            
        except (ConnectionFailure, OperationFailure) as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            self.is_connected = False
    
    def _create_indexes(self):
        """Create database indexes for better performance"""
        try:
            # Chats collection indexes
            self.db.chats.create_index([("timestamp", -1)])
            self.db.chats.create_index([("user_id", 1), ("timestamp", -1)])
            
            # Voyages collection indexes
            self.db.voyages.create_index([("created_at", -1)])
            self.db.voyages.create_index([("status", 1)])
            
            # Documents collection indexes
            self.db.documents.create_index([("uploaded_at", -1)])
            self.db.documents.create_index([("document_type", 1)])
            
            logger.info("Database indexes created successfully")
        except Exception as e:
            logger.error(f"Failed to create indexes: {e}")
    
    def save_chat(self, user_id: str, message: str, response: str, agent_type: str, context: Dict[str, Any] = None) -> bool:
        """Save a chat interaction to MongoDB"""
        if not self.is_connected:
            logger.warning("MongoDB not connected, skipping chat save")
            return False
        
        try:
            chat_doc = {
                "user_id": user_id,
                "message": message,
                "response": response,
                "agent_type": agent_type,
                "context": context or {},
                "timestamp": datetime.utcnow(),
                "created_at": datetime.utcnow()
            }
            
            result = self.db.chats.insert_one(chat_doc)
            logger.info(f"Chat saved with ID: {result.inserted_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to save chat: {e}")
            return False
    
    def get_chat_history(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve chat history for a user"""
        if not self.is_connected:
            logger.warning("MongoDB not connected, returning empty chat history")
            return []
        
        try:
            cursor = self.db.chats.find(
                {"user_id": user_id},
                {"_id": 0}  # Exclude MongoDB _id
            ).sort("timestamp", -1).limit(limit)
            
            chats = list(cursor)
            logger.info(f"Retrieved {len(chats)} chat messages for user {user_id}")
            return chats
            
        except Exception as e:
            logger.error(f"Failed to retrieve chat history: {e}")
            return []
    
    def save_voyage(self, voyage_data: Dict[str, Any]) -> Optional[str]:
        """Save voyage information to MongoDB"""
        if not self.is_connected:
            logger.warning("MongoDB not connected, skipping voyage save")
            return None
        
        try:
            voyage_doc = {
                **voyage_data,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "status": voyage_data.get("status", "active")
            }
            
            result = self.db.voyages.insert_one(voyage_doc)
            voyage_id = str(result.inserted_id)
            logger.info(f"Voyage saved with ID: {voyage_id}")
            return voyage_id
            
        except Exception as e:
            logger.error(f"Failed to save voyage: {e}")
            return None
    
    def get_voyages(self, user_id: str = None, status: str = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve voyages with optional filtering"""
        if not self.is_connected:
            logger.warning("MongoDB not connected, returning empty voyages list")
            return []
        
        try:
            query = {}
            if user_id:
                query["user_id"] = user_id
            if status:
                query["status"] = status
            
            cursor = self.db.voyages.find(
                query,
                {"_id": 0}
            ).sort("created_at", -1).limit(limit)
            
            voyages = list(cursor)
            logger.info(f"Retrieved {len(voyages)} voyages")
            return voyages
            
        except Exception as e:
            logger.error(f"Failed to retrieve voyages: {e}")
            return []
    
    def save_document(self, filename: str, document_type: str, analysis_result: Dict[str, Any], user_id: str = None) -> Optional[str]:
        """Save document analysis result to MongoDB"""
        if not self.is_connected:
            logger.warning("MongoDB not connected, skipping document save")
            return None
        
        try:
            doc = {
                "filename": filename,
                "document_type": document_type,
                "analysis_result": analysis_result,
                "user_id": user_id,
                "uploaded_at": datetime.utcnow(),
                "created_at": datetime.utcnow()
            }
            
            result = self.db.documents.insert_one(doc)
            doc_id = str(result.inserted_id)
            logger.info(f"Document saved with ID: {doc_id}")
            return doc_id
            
        except Exception as e:
            logger.error(f"Failed to save document: {e}")
            return None
    
    def get_documents(self, user_id: str = None, document_type: str = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve documents with optional filtering"""
        if not self.is_connected:
            logger.warning("MongoDB not connected, returning empty documents list")
            return []
        
        try:
            query = {}
            if user_id:
                query["user_id"] = user_id
            if document_type:
                query["document_type"] = document_type
            
            cursor = self.db.documents.find(
                query,
                {"_id": 0}
            ).sort("uploaded_at", -1).limit(limit)
            
            documents = list(cursor)
            logger.info(f"Retrieved {len(documents)} documents")
            return documents
            
        except Exception as e:
            logger.error(f"Failed to retrieve documents: {e}")
            return []
    
    def update_voyage_status(self, voyage_id: str, status: str, updates: Dict[str, Any] = None) -> bool:
        """Update voyage status and other fields"""
        if not self.is_connected:
            logger.warning("MongoDB not connected, skipping voyage update")
            return False
        
        try:
            update_data = {
                "status": status,
                "updated_at": datetime.utcnow()
            }
            if updates:
                update_data.update(updates)
            
            result = self.db.voyages.update_one(
                {"_id": voyage_id},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                logger.info(f"Voyage {voyage_id} status updated to {status}")
                return True
            else:
                logger.warning(f"No voyage found with ID {voyage_id}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to update voyage status: {e}")
            return False
    
    def get_system_stats(self) -> Dict[str, Any]:
        """Get system statistics from MongoDB"""
        if not self.is_connected:
            return {"error": "MongoDB not connected"}
        
        try:
            stats = {
                "total_chats": self.db.chats.count_documents({}),
                "total_voyages": self.db.voyages.count_documents({}),
                "total_documents": self.db.documents.count_documents({}),
                "active_voyages": self.db.voyages.count_documents({"status": "active"}),
                "recent_chats": self.db.chats.count_documents({
                    "timestamp": {"$gte": datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)}
                })
            }
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get system stats: {e}")
            return {"error": str(e)}
    
    def close_connection(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            self.is_connected = False
            logger.info("MongoDB connection closed")
    
    def __del__(self):
        """Destructor to ensure connection is closed"""
        self.close_connection() 