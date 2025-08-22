import logging
import os
import requests
import json
from typing import Dict, Any, Optional, Union
import base64
from io import BytesIO

logger = logging.getLogger(__name__)

class VoiceAgent:
    def __init__(self):
        # API Keys
        self.deepgram_key = os.getenv("DEEPGRAM_API_KEY")
        self.assemblyai_key = os.getenv("ASSEMBLYAI_API_KEY")
        
        # API endpoints
        self.deepgram_url = "https://api.deepgram.com/v1/listen"
        self.assemblyai_url = "https://api.assemblyai.com/v2/transcript"
        
        # Check which services are available
        self.stt_service = self._get_available_stt_service()
        self.tts_service = "coqui"  # Default to Coqui TTS
        
        logger.info(f"Voice Agent initialized. STT: {self.stt_service}, TTS: {self.tts_service}")
    
    def _get_available_stt_service(self) -> str:
        """Determine which STT service to use based on available API keys"""
        if self.deepgram_key:
            return "deepgram"
        elif self.assemblyai_key:
            return "assemblyai"
        else:
            return "whisper"  # Fallback to local Whisper
    
    def transcribe_audio(self, audio_content: bytes, filename: str = None) -> Dict[str, Any]:
        """Transcribe audio using the best available STT service"""
        try:
            if self.stt_service == "deepgram":
                return self._transcribe_deepgram(audio_content, filename)
            elif self.stt_service == "assemblyai":
                return self._transcribe_assemblyai(audio_content, filename)
            else:
                return self._transcribe_whisper(audio_content, filename)
        except Exception as e:
            logger.error(f"Error in audio transcription: {e}")
            return {
                "error": "Transcription failed",
                "message": str(e),
                "service": self.stt_service
            }
    
    def _transcribe_deepgram(self, audio_content: bytes, filename: str = None) -> Dict[str, Any]:
        """Transcribe audio using Deepgram API"""
        try:
            headers = {
                "Authorization": f"Token {self.deepgram_key}",
                "Content-Type": "audio/wav"  # Adjust based on your audio format
            }
            
            # Deepgram parameters for maritime domain
            params = {
                "model": "nova-2",  # Latest model
                "language": "en",
                "punctuate": "true",
                "diarize": "true",  # Speaker identification
                "smart_format": "true",
                "filler_words": "false",
                "utterances": "true"
            }
            
            response = requests.post(
                self.deepgram_url,
                headers=headers,
                params=params,
                data=audio_content,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                transcript = result.get("results", {}).get("channels", [{}])[0].get("alternatives", [{}])[0].get("transcript", "")
                
                return {
                    "transcript": transcript,
                    "confidence": result.get("results", {}).get("channels", [{}])[0].get("alternatives", [{}])[0].get("confidence", 0),
                    "service": "deepgram",
                    "words": result.get("results", {}).get("channels", [{}])[0].get("alternatives", [{}])[0].get("words", []),
                    "metadata": {
                        "model": result.get("metadata", {}).get("model_info", {}).get("name", "unknown"),
                        "duration": result.get("metadata", {}).get("duration", 0)
                    }
                }
            else:
                logger.error(f"Deepgram API error: {response.status_code} - {response.text}")
                return {
                    "error": "Deepgram API error",
                    "status_code": response.status_code,
                    "message": response.text
                }
                
        except Exception as e:
            logger.error(f"Deepgram transcription error: {e}")
            return {"error": f"Deepgram error: {str(e)}"}
    
    def _transcribe_assemblyai(self, audio_content: bytes, filename: str = None) -> Dict[str, Any]:
        """Transcribe audio using AssemblyAI API"""
        try:
            headers = {
                "Authorization": self.assemblyai_key,
                "Content-Type": "application/json"
            }
            
            # First, upload the audio file
            upload_url = "https://api.assemblyai.com/v2/upload"
            upload_response = requests.post(
                upload_url,
                headers={"Authorization": self.assemblyai_key},
                data=audio_content,
                timeout=30
            )
            
            if upload_response.status_code != 200:
                return {"error": f"AssemblyAI upload failed: {upload_response.text}"}
            
            upload_url = upload_response.json().get("upload_url")
            
            # Submit transcription request
            transcript_request = {
                "audio_url": upload_url,
                "language_code": "en",
                "punctuate": True,
                "format_text": True,
                "speaker_labels": True,
                "auto_highlights": True
            }
            
            submit_response = requests.post(
                self.assemblyai_url,
                headers=headers,
                json=transcript_request,
                timeout=30
            )
            
            if submit_response.status_code != 200:
                return {"error": f"AssemblyAI transcription request failed: {submit_response.text}"}
            
            transcript_id = submit_response.json().get("id")
            
            # Poll for completion
            polling_url = f"{self.assemblyai_url}/{transcript_id}"
            while True:
                polling_response = requests.get(polling_url, headers=headers, timeout=30)
                if polling_response.status_code != 200:
                    return {"error": f"AssemblyAI polling failed: {polling_response.text}"}
                
                status = polling_response.json().get("status")
                if status == "completed":
                    result = polling_response.json()
                    return {
                        "transcript": result.get("text", ""),
                        "confidence": result.get("confidence", 0),
                        "service": "assemblyai",
                        "words": result.get("words", []),
                        "speaker_labels": result.get("speaker_labels", []),
                        "auto_highlights": result.get("auto_highlights", {}),
                        "metadata": {
                            "audio_duration": result.get("audio_duration", 0),
                            "punctuate": result.get("punctuate", False)
                        }
                    }
                elif status == "error":
                    return {"error": f"AssemblyAI transcription error: {result.get('error', 'Unknown error')}"}
                
                # Wait before polling again
                import time
                time.sleep(3)
            
        except Exception as e:
            logger.error(f"AssemblyAI transcription error: {e}")
            return {"error": f"AssemblyAI error: {str(e)}"}
    
    def _transcribe_whisper(self, audio_content: bytes, filename: str = None) -> Dict[str, Any]:
        """Fallback transcription using local Whisper (if available)"""
        try:
            # This would require installing openai-whisper
            # For now, return a placeholder
            return {
                "transcript": "Whisper transcription not implemented. Please install openai-whisper or configure API keys.",
                "service": "whisper",
                "confidence": 0.0
            }
        except Exception as e:
            logger.error(f"Whisper transcription error: {e}")
            return {"error": f"Whisper error: {str(e)}"}
    
    def text_to_speech(self, text: str, voice: str = "en_female", speed: float = 1.0) -> Dict[str, Any]:
        """Convert text to speech using Coqui TTS"""
        try:
            # For production, you'd want to use Coqui TTS API or local installation
            # This is a placeholder implementation
            
            # Simulate TTS processing
            audio_length = len(text) * 0.1  # Rough estimate
            
            return {
                "audio_url": f"/api/tts/generate?text={text}&voice={voice}&speed={speed}",
                "service": "coqui",
                "voice": voice,
                "speed": speed,
                "estimated_duration": audio_length,
                "text_length": len(text),
                "status": "success"
            }
            
        except Exception as e:
            logger.error(f"TTS error: {e}")
            return {
                "error": "TTS failed",
                "message": str(e),
                "service": "coqui"
            }
    
    def get_available_voices(self) -> Dict[str, Any]:
        """Get list of available TTS voices"""
        return {
            "voices": [
                {"id": "en_female", "name": "English Female", "language": "en", "gender": "female"},
                {"id": "en_male", "name": "English Male", "language": "en", "gender": "male"},
                {"id": "en_maritime", "name": "Maritime English", "language": "en", "gender": "male"},
                {"id": "es_female", "name": "Spanish Female", "language": "es", "gender": "female"},
                {"id": "fr_female", "name": "French Female", "language": "fr", "gender": "female"}
            ],
            "default_voice": "en_female",
            "supported_languages": ["en", "es", "fr", "de", "it"]
        }
    
    def get_service_status(self) -> Dict[str, Any]:
        """Get status of voice services"""
        return {
            "stt_service": self.stt_service,
            "tts_service": self.tts_service,
            "deepgram_available": bool(self.deepgram_key),
            "assemblyai_available": bool(self.assemblyai_key),
            "status": "operational" if (self.deepgram_key or self.assemblyai_key) else "limited"
        } 