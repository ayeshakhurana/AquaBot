from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn
import json
import logging
import os
import requests
from datetime import datetime

# Import agents and services
from .agents.weather import WeatherAgent
from .agents.navigation import NavigationAgent
from .agents.ports import PortsAgent
from .agents.voice import VoiceAgent
from .agents.documents import DocumentsAgent
from .agents.sof_parser import SOFParserAgent
from .agents.cp import CPAgent
from .agents.checklist import ChecklistAgent
from .agents.carbon import CarbonAgent
from .agents.compliance import ComplianceAgent

from .services.gemini import GeminiService
from .services.memory import MemoryService
from .services.mongodb import MongoDBService

from .utils.logger import setup_logger

# Import middleware
try:
    from .middleware.error_handler import (
        ErrorHandlerMiddleware, 
        RateLimitMiddleware, 
        LoggingMiddleware, 
        SecurityMiddleware
    )
    MIDDLEWARE_AVAILABLE = True
except ImportError:
    MIDDLEWARE_AVAILABLE = False
    print("Warning: Middleware not available, running without advanced features")

# Setup logging
logger = setup_logger()

# Initialize FastAPI app
app = FastAPI(
    title="Maritime AI Assistant",
    description="Intelligent maritime operations platform with AI-powered agents",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "mongodb": mongodb_service.is_connected if mongodb_service else False,
        "version": "2.0.0"
    }

# Add middleware if available
if MIDDLEWARE_AVAILABLE:
    app.add_middleware(ErrorHandlerMiddleware)
    app.add_middleware(RateLimitMiddleware, requests_per_minute=100)
    app.add_middleware(LoggingMiddleware)
    app.add_middleware(SecurityMiddleware)
else:
    print("Running without advanced middleware features")

# CORS middleware - configurable for production
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
gemini_service = GeminiService()
memory_service = MemoryService()

# Initialize MongoDB with fallback
try:
    mongodb_service = MongoDBService()
    if not mongodb_service.is_connected:
        print("Warning: MongoDB not connected. Running in fallback mode.")
        mongodb_service = None
except Exception as e:
    print(f"Warning: MongoDB initialization failed: {e}. Running in fallback mode.")
    mongodb_service = None

# Configure Gemini from environment if available
try:
    from dotenv import load_dotenv
    load_dotenv()
    _gemini_key = os.getenv("GOOGLE_API_KEY")
    if _gemini_key:
        gemini_service.configure(_gemini_key)
except Exception:
    pass

# Initialize agents
weather_agent = WeatherAgent()
navigation_agent = NavigationAgent()
ports_agent = PortsAgent()
voice_agent = VoiceAgent()
documents_agent = DocumentsAgent()
sof_parser_agent = SOFParserAgent()
cp_agent = CPAgent(gemini_service)
checklist_agent = ChecklistAgent()
carbon_agent = CarbonAgent()
compliance_agent = ComplianceAgent()

# Pydantic models
class ChatRequest(BaseModel):
    message: str
    agent_type: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    user_id: Optional[str] = "default_user"  # For MongoDB persistence

class ChatResponse(BaseModel):
    response: str
    agent_type: Optional[str] = None
    timestamp: str
    context: Optional[Dict[str, Any]] = None

class WeatherRequest(BaseModel):
    port_name: Optional[str] = None
    coordinates: Optional[Dict[str, float]] = None

class DistanceRequest(BaseModel):
    port1: str
    port2: str

class DocumentAnalysisRequest(BaseModel):
    file_type: str
    content: str

class GeocodeRequest(BaseModel):
    query: str

class RouteRequest(BaseModel):
    start: Dict[str, float]  # {lat, lon}
    end: Dict[str, float]    # {lat, lon}

class CarbonRequest(BaseModel):
    distance_nm: float
    days_at_sea: float
    fuel: str = "vlsfo"
    vessel_type: str = "general"

class ComplianceRequest(BaseModel):
    sof_data: Dict[str, Any]
    cp_notes: Optional[str] = ""

class VoyageRequest(BaseModel):
    vessel_name: str
    departure_port: str
    arrival_port: str
    cargo_type: str
    estimated_departure: str
    estimated_arrival: str
    user_id: Optional[str] = "default_user"

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "service": "Maritime AI Assistant",
        "version": "2.0.0",
        "mongodb_status": "connected" if mongodb_service and mongodb_service.is_connected else "disconnected",
        "voice_status": voice_agent.get_service_status()
    }

# Chat endpoint with MongoDB persistence
@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Intelligent router by explicit agent_type or inferred intent
        message_lower = request.message.lower()
        agent = request.agent_type or "general"

        if agent != "general":
            # Direct routing if agent specified
            if agent == "weather":
                response = weather_agent.process_query(request.message)
            elif agent == "navigation":
                response = navigation_agent.process_query(request.message)
            elif agent == "ports":
                response = ports_agent.process_query(request.message)
            elif agent == "documents":
                response = documents_agent.process_query(request.message)
            elif agent == "sof_parser":
                response = sof_parser_agent.process_query(request.message)
            elif agent == "cp":
                response = cp_agent.process_query(request.message)
            elif agent == "checklist":
                response = checklist_agent.process_query(request.message)
            elif agent == "carbon":
                response = "Provide distance (nm) and days at sea to estimate CO2."
            elif agent == "compliance":
                response = "Provide SOF and CP to validate compliance."
            else:
                response = gemini_service.generate_response(request.message)
        else:
            # Infer intent
            if any(k in message_lower for k in ["laytime", "demurrage", "despatch", "sof"]):
                response = sof_parser_agent.process_query(request.message)
            elif any(k in message_lower for k in ["weather", "forecast", "wind", "wave"]):
                response = weather_agent.process_query(request.message)
            elif any(k in message_lower for k in ["distance", "eta", "route", "routing"]):
                response = navigation_agent.process_query(request.message)
            elif any(k in message_lower for k in ["cp", "charter party", "clause", "demurrage clause"]):
                response = cp_agent.process_query(request.message)
            elif any(k in message_lower for k in ["checklist", "pre-fixture", "on-voyage", "post-voyage"]):
                response = checklist_agent.process_query(request.message)
            elif any(k in message_lower for k in ["carbon", "emission", "co2"]):
                response = "Provide distance (nm) and days at sea to estimate CO2."
            else:
                # Fallback to Gemini
                response = gemini_service.generate_response(request.message)
        
        # Store in memory and MongoDB
        memory_service.store_interaction(
            user_message=request.message,
            ai_response=response,
            agent_type=request.agent_type,
            context=request.context
        )
        
        # Persist to MongoDB if available
        if mongodb_service:
            try:
                mongodb_service.save_chat(
                    user_id=request.user_id,
                    message=request.message,
                    response=response,
                    agent_type=request.agent_type or "general",
                    context=request.context
                )
            except Exception as e:
                logger.warning(f"Failed to save chat to MongoDB: {e}")
        else:
            logger.info("MongoDB not available, chat not persisted")
        
        return ChatResponse(
            response=response,
            agent_type=request.agent_type,
            timestamp=memory_service.get_current_timestamp(),
            context=request.context
        )
    
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Weather endpoint
@app.post("/api/weather")
async def get_weather(request: WeatherRequest):
    try:
        weather_data = weather_agent.get_weather_forecast(
            port_name=request.port_name,
            coordinates=request.coordinates
        )
        return weather_data
    except Exception as e:
        logger.error(f"Error in weather endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Distance calculation endpoint
@app.post("/api/distance")
async def calculate_distance(request: DistanceRequest):
    try:
        distance_data = navigation_agent.calculate_distance(
            port1=request.port1,
            port2=request.port2
        )
        return distance_data
    except Exception as e:
        logger.error(f"Error in distance endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Document analysis endpoint
@app.post("/api/documents/analyze")
async def analyze_document(
    file: UploadFile = File(...),
    analysis_type: str = Form("general")
):
    try:
        content = await file.read()
        
        if analysis_type == "sof":
            result = sof_parser_agent.parse_sof_document(content, file.filename)
        else:
            result = documents_agent.analyze_document(content, file.filename, file.content_type)
        
        return result
    except Exception as e:
        logger.error(f"Error in document analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Port information endpoint
@app.get("/api/ports/{port_name}")
async def get_port_info(port_name: str):
    try:
        port_info = ports_agent.get_port_details(port_name)
        return port_info
    except Exception as e:
        logger.error(f"Error in port info endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Enhanced voice endpoints
@app.post("/api/voice/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        audio_content = await file.read()
        transcription = voice_agent.transcribe_audio(audio_content, file.filename)
        return transcription
    except Exception as e:
        logger.error(f"Error in voice transcription: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/voice/tts")
async def text_to_speech(text: str, voice: str = "en_female", speed: float = 1.0):
    try:
        tts_result = voice_agent.text_to_speech(text, voice, speed)
        return tts_result
    except Exception as e:
        logger.error(f"Error in TTS: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/voice/status")
async def get_voice_status():
    return voice_agent.get_service_status()

@app.get("/api/voice/voices")
async def get_available_voices():
    return voice_agent.get_available_voices()

# MongoDB persistence endpoints
@app.post("/api/voyages")
async def create_voyage(voyage: VoyageRequest):
    if not mongodb_service:
        raise HTTPException(status_code=503, detail="MongoDB service not available")
    
    try:
        voyage_data = voyage.dict()
        voyage_id = mongodb_service.save_voyage(voyage_data)
        if voyage_id:
            return {"success": True, "voyage_id": voyage_id, "message": "Voyage created successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to create voyage")
    except Exception as e:
        logger.error(f"Error creating voyage: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/voyages")
async def get_voyages(user_id: Optional[str] = None, status: Optional[str] = None, limit: int = 50):
    if not mongodb_service:
        raise HTTPException(status_code=503, detail="MongoDB service not available")
    
    try:
        voyages = mongodb_service.get_voyages(user_id, status, limit)
        return {"voyages": voyages, "count": len(voyages)}
    except Exception as e:
        logger.error(f"Error retrieving voyages: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chats/history")
async def get_chat_history(user_id: str = "default_user", limit: int = 50):
    if not mongodb_service:
        raise HTTPException(status_code=503, detail="MongoDB service not available")
    
    try:
        chats = mongodb_service.get_chat_history(user_id, limit)
        return {"chats": chats, "count": len(chats)}
    except Exception as e:
        logger.error(f"Error retrieving chat history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/documents")
async def get_documents(user_id: Optional[str] = None, document_type: Optional[str] = None, limit: int = 50):
    if not mongodb_service:
        raise HTTPException(status_code=503, detail="MongoDB service not available")
    
    try:
        documents = mongodb_service.get_documents(user_id, document_type, limit)
        return {"documents": documents, "count": len(documents)}
    except Exception as e:
        logger.error(f"Error retrieving documents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stats")
async def get_system_stats():
    if not mongodb_service:
        return {"error": "MongoDB service not available", "status": "unavailable"}
    
    try:
        stats = mongodb_service.get_system_stats()
        return stats
    except Exception as e:
        logger.error(f"Error retrieving system stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Agent capabilities endpoint
@app.get("/api/agents/capabilities")
async def get_agent_capabilities():
    return {
        "agents": {
            "weather": {
                "name": "Weather Agent",
                "description": "Port weather forecasts and maritime conditions",
                "capabilities": ["port_weather", "voyage_weather", "storm_alerts"]
            },
            "navigation": {
                "name": "Navigation Agent", 
                "description": "Distance calculations and route optimization",
                "capabilities": ["port_distance", "route_planning", "eta_calculation"]
            },
            "ports": {
                "name": "Ports Agent",
                "description": "Port information and UN/LOCODE data",
                "capabilities": ["port_details", "facilities", "restrictions"]
            },
            "documents": {
                "name": "Documents Agent",
                "description": "Maritime document parsing and analysis",
                "capabilities": ["pdf_parsing", "docx_parsing", "content_analysis"]
            },
            "sof_parser": {
                "name": "SOF Parser Agent",
                "description": "Statement of Facts parsing and laytime calculations",
                "capabilities": ["sof_extraction", "laytime_calc", "demurrage_analysis"]
            },
            "cp": {
                "name": "Charter Party Agent",
                "description": "CP clause explanations and Q&A",
                "capabilities": ["clause_explanation", "obligation_analysis", "risk_assessment"]
            },
            "checklist": {
                "name": "Checklist Agent",
                "description": "Voyage stage document and action checklists",
                "capabilities": ["pre_fixture", "on_voyage", "post_voyage"]
            },
            "carbon": {
                "name": "Carbon Agent",
                "description": "CO2 emission estimation for voyages",
                "capabilities": ["emission_calculation", "fuel_analysis", "compliance_reporting"]
            },
            "compliance": {
                "name": "Compliance Agent",
                "description": "SOF compliance validation against CP terms",
                "capabilities": ["rule_validation", "issue_detection", "compliance_reporting"]
            }
        }
    }

# Public config endpoint (exposes only safe values for frontend)
@app.get("/api/config/public")
async def get_public_config():
    try:
        maptiler_key = os.getenv("MAPTILER_API_KEY")
        tile_url = None
        if maptiler_key:
            # Raster tile template for Leaflet
            tile_url = f"https://api.maptiler.com/maps/streets/{'{z}'}/{'{x}'}/{'{y}'}.png?key={maptiler_key}"
        return {"maptilerTileUrlTemplate": tile_url}
    except Exception as e:
        logger.error(f"Error in public config endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Geocoding endpoint using OpenCage
@app.post("/api/geocode")
async def geocode(request: GeocodeRequest):
    try:
        key = os.getenv("OPENCAGE_API_KEY")
        if not key:
            raise HTTPException(status_code=400, detail="OpenCage API key not configured")
        url = "https://api.opencagedata.com/geocode/v1/json"
        params = {"q": request.query, "key": key, "limit": 5}
        r = requests.get(url, params=params, timeout=10)
        r.raise_for_status()
        data = r.json()
        results = []
        for item in data.get("results", [])[:5]:
            coords = item.get("geometry", {})
            results.append({
                "formatted": item.get("formatted"),
                "lat": coords.get("lat"),
                "lon": coords.get("lng"),
                "components": item.get("components", {})
            })
        return {"results": results}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in geocode endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Routing endpoint using OpenRouteService
@app.post("/api/route")
async def route(request: RouteRequest):
    try:
        key = os.getenv("ORS_API_KEY")
        if not key:
            raise HTTPException(status_code=400, detail="OpenRouteService API key not configured")
        url = "https://api.openrouteservice.org/v2/directions/driving-car"
        params = {
            "api_key": key,
            "start": f"{request.start['lon']},{request.start['lat']}",
            "end": f"{request.end['lon']},{request.end['lat']}"
        }
        r = requests.get(url, params=params, timeout=15)
        r.raise_for_status()
        data = r.json()
        summary = (((data.get("features") or [{}])[0]).get("properties") or {}).get("summary") or {}
        geometry = (((data.get("features") or [{}])[0]).get("geometry") or {})
        return {
            "distance_km": summary.get("distance", 0) / 1000 if isinstance(summary.get("distance"), (int, float)) else None,
            "duration_min": summary.get("duration", 0) / 60 if isinstance(summary.get("duration"), (int, float)) else None,
            "geometry": geometry
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in route endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Timezone endpoint using TimeZoneDB
@app.get("/api/timezone")
async def timezone(lat: float, lon: float):
    try:
        key = os.getenv("TIMEZONEDB_API_KEY")
        if not key:
            raise HTTPException(status_code=400, detail="TimeZoneDB API key not configured")
        url = "http://api.timezonedb.com/v2.1/get-time-zone"
        params = {"key": key, "format": "json", "by": "position", "lat": lat, "lng": lon}
        r = requests.get(url, params=params, timeout=10)
        r.raise_for_status()
        data = r.json()
        return {
            "zoneName": data.get("zoneName"),
            "gmtOffset": data.get("gmtOffset"),
            "abbreviation": data.get("abbreviation"),
            "formatted": data.get("formatted")
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in timezone endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Weather endpoint
@app.post("/api/weather")
async def get_weather(request: WeatherRequest):
    try:
        weather_data = weather_agent.get_weather_forecast(
            port_name=request.port_name,
            coordinates=request.coordinates
        )
        return weather_data
    except Exception as e:
        logger.error(f"Error in weather endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Distance calculation endpoint
@app.post("/api/distance")
async def calculate_distance(request: DistanceRequest):
    try:
        distance_data = navigation_agent.calculate_distance(
            port1=request.port1,
            port2=request.port2
        )
        return distance_data
    except Exception as e:
        logger.error(f"Error in distance endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Document analysis endpoint
@app.post("/api/documents/analyze")
async def analyze_document(
    file: UploadFile = File(...),
    analysis_type: str = Form("general")
):
    try:
        content = await file.read()
        
        if analysis_type == "sof":
            result = sof_parser_agent.parse_sof_document(content, file.filename)
        else:
            result = documents_agent.analyze_document(content, file.filename, file.content_type)
        
        # Save to MongoDB if available
        if mongodb_service:
            try:
                mongodb_service.save_document(
                    filename=file.filename,
                    document_type=analysis_type,
                    analysis_result=result
                )
            except Exception as e:
                logger.warning(f"Failed to save document to MongoDB: {e}")
        else:
            logger.info("MongoDB not available, document not persisted")
        
        return result
    except Exception as e:
        logger.error(f"Error in document analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Port information endpoint
@app.get("/api/ports/{port_name}")
async def get_port_info(port_name: str):
    try:
        port_info = ports_agent.get_port_details(port_name)
        return port_info
    except Exception as e:
        logger.error(f"Error in port info endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Agent capabilities endpoint
@app.get("/api/agents/capabilities")
async def get_agent_capabilities():
    return {
        "agents": {
            "weather": {
                "name": "Weather Agent",
                "description": "Port weather forecasts and maritime conditions",
                "capabilities": ["port_weather", "voyage_weather", "storm_alerts"]
            },
            "navigation": {
                "name": "Navigation Agent", 
                "description": "Distance calculations and route optimization",
                "capabilities": ["port_distance", "route_planning", "eta_calculation"]
            },
            "ports": {
                "name": "Ports Agent",
                "description": "Port information and UN/LOCODE data",
                "capabilities": ["port_details", "facilities", "restrictions"]
            },
            "documents": {
                "name": "Documents Agent",
                "description": "Maritime document parsing and analysis",
                "capabilities": ["pdf_parsing", "docx_parsing", "content_analysis"]
            },
            "sof_parser": {
                "name": "SOF Parser Agent",
                "description": "Statement of Facts parsing and laytime calculations",
                "capabilities": ["sof_extraction", "laytime_calc", "demurrage_analysis"]
            },
            "cp": {
                "name": "Charter Party Agent",
                "description": "CP clause explanations and Q&A",
                "capabilities": ["clause_explanation", "obligation_analysis", "risk_assessment"]
            },
            "checklist": {
                "name": "Checklist Agent",
                "description": "Voyage stage document and action checklists",
                "capabilities": ["pre_fixture", "on_voyage", "post_voyage"]
            },
            "carbon": {
                "name": "Carbon Agent",
                "description": "CO2 emission estimation for voyages",
                "capabilities": ["emission_calculation", "fuel_analysis", "compliance_reporting"]
            },
            "compliance": {
                "name": "Compliance Agent",
                "description": "SOF compliance validation against CP terms",
                "capabilities": ["rule_validation", "issue_detection", "compliance_reporting"]
            }
        }
    }

# Carbon emission estimation endpoint
@app.post("/api/carbon/estimate")
async def estimate_carbon(request: CarbonRequest):
    try:
        result = carbon_agent.estimate(
            distance_nm=request.distance_nm,
            days_at_sea=request.days_at_sea,
            fuel=request.fuel,
            vessel_type=request.vessel_type
        )
        return result
    except Exception as e:
        logger.error(f"Error in carbon estimation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Compliance validation endpoint
@app.post("/api/compliance/validate")
async def validate_compliance(request: ComplianceRequest):
    try:
        result = compliance_agent.validate(
            sof=request.sof_data,
            cp_notes=request.cp_notes
        )
        return result
    except Exception as e:
        logger.error(f"Error in compliance validation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 