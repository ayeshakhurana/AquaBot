import google.generativeai as genai
import logging
from typing import Dict, Any, Optional, List
import json

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.model = None
        self.is_configured = False
        
        # Default model configuration
        self.default_model = "gemini-1.5-flash"
        self.fallback_model = "gemini-1.5-pro"
        
        # Model parameters
        self.generation_config = {
            "temperature": 0.7,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 2048,
        }
        
        # Safety settings
        self.safety_settings = [
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            }
        ]
        
        # Initialize if API key is provided
        if self.api_key:
            self.configure(api_key)
    
    def configure(self, api_key: str) -> Dict[str, Any]:
        """Configure Gemini service with API key"""
        try:
            self.api_key = api_key
            genai.configure(api_key=api_key)
            
            # Test configuration with a simple request
            test_result = self._test_configuration()
            if test_result["success"]:
                self.is_configured = True
                logger.info("Gemini service configured successfully")
                return {"success": True, "message": "Gemini service configured successfully"}
            else:
                logger.error(f"Gemini configuration test failed: {test_result['error']}")
                return {"success": False, "error": test_result["error"]}
                
        except Exception as e:
            logger.error(f"Error configuring Gemini service: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def _test_configuration(self) -> Dict[str, Any]:
        """Test Gemini configuration with a simple request"""
        try:
            # Try to initialize the model
            model = genai.GenerativeModel(self.default_model)
            
            # Test with a simple prompt
            response = model.generate_content("Hello")
            
            if response and response.text:
                return {"success": True, "model": self.default_model}
            else:
                return {"success": False, "error": "No response from model"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def generate_response(self, prompt: str, context: Optional[Dict[str, Any]] = None, 
                         model_name: Optional[str] = None) -> str:
        """Generate response using Gemini"""
        try:
            if not self.is_configured:
                return "Gemini service not configured. Please provide an API key."
            
            # Select model
            model_name = model_name or self.default_model
            
            # Create model instance
            model = genai.GenerativeModel(
                model_name,
                generation_config=self.generation_config,
                safety_settings=self.safety_settings
            )
            
            # Prepare prompt with context if provided
            full_prompt = self._prepare_prompt(prompt, context)
            
            # Generate response
            response = model.generate_content(full_prompt)
            
            if response and response.text:
                return response.text
            else:
                return "No response generated from Gemini model."
                
        except Exception as e:
            logger.error(f"Error generating Gemini response: {str(e)}")
            
            # Try fallback model if primary fails
            if model_name != self.fallback_model:
                try:
                    return self.generate_response(prompt, context, self.fallback_model)
                except Exception as fallback_error:
                    logger.error(f"Fallback model also failed: {str(fallback_error)}")
            
            return f"Error generating response: {str(e)}"
    
    def _prepare_prompt(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Prepare prompt with context and maritime expertise"""
        maritime_context = """
You are a maritime industry expert with 20+ years of experience in shipping operations. 
You provide practical, accurate advice on maritime matters including:

- Laytime and demurrage calculations
- Charter party clauses and interpretations
- Port operations and regulations
- Weather and navigation considerations
- Maritime documentation and procedures
- Safety and compliance matters

Always provide:
1. Practical, actionable advice
2. Industry-standard references when applicable
3. Clear explanations of complex maritime concepts
4. Relevant examples and calculations when helpful

Keep responses concise but comprehensive, focusing on what the user actually needs to know.
"""
        
        if context:
            # Add specific context to the prompt
            context_str = f"\n\nContext: {json.dumps(context, indent=2)}\n\n"
            return maritime_context + context_str + f"User Question: {prompt}"
        else:
            return maritime_context + f"\n\nUser Question: {prompt}"
    
    def generate_maritime_response(self, query: str, agent_type: str = "general", 
                                 context: Optional[Dict[str, Any]] = None) -> str:
        """Generate maritime-specific response"""
        try:
            # Create maritime-focused prompt
            maritime_prompt = f"""
As a maritime expert, answer this {agent_type} agent query:

Query: {query}

Provide a practical, maritime-focused response that:
- Addresses the specific maritime context
- Uses industry-standard terminology
- Provides actionable information
- References relevant maritime practices
"""
            
            return self.generate_response(maritime_prompt, context)
            
        except Exception as e:
            logger.error(f"Error generating maritime response: {str(e)}")
            return f"Error generating maritime response: {str(e)}"
    
    def analyze_maritime_document(self, document_text: str, document_type: str = "general") -> str:
        """Analyze maritime document content"""
        try:
            analysis_prompt = f"""
Analyze this maritime document (type: {document_type}):

Document Content:
{document_text}

Provide a structured analysis including:
1. Document type identification
2. Key information extracted
3. Maritime relevance assessment
4. Operational implications
5. Recommendations or next steps

Focus on practical maritime insights and actionable information.
"""
            
            return self.generate_response(analysis_prompt)
            
        except Exception as e:
            logger.error(f"Error analyzing maritime document: {str(e)}")
            return f"Error analyzing document: {str(e)}"
    
    def generate_laytime_calculation(self, laytime_hours: float, notice_period: float = 6) -> str:
        """Generate laytime calculation explanation"""
        try:
            calculation_prompt = f"""
Calculate and explain laytime for {laytime_hours} hours with {notice_period} hours notice period.

Provide:
1. Total time calculation
2. Day/hour breakdown
3. Demurrage/despatch implications
4. Operational considerations
5. Charter party considerations

Include practical examples and industry standards.
"""
            
            return self.generate_response(calculation_prompt)
            
        except Exception as e:
            logger.error(f"Error generating laytime calculation: {str(e)}")
            return f"Error generating calculation: {str(e)}"
    
    def get_service_status(self) -> Dict[str, Any]:
        """Get current service status"""
        return {
            "configured": self.is_configured,
            "default_model": self.default_model,
            "fallback_model": self.fallback_model,
            "generation_config": self.generation_config,
            "api_key_provided": bool(self.api_key)
        }
    
    def update_generation_config(self, new_config: Dict[str, Any]) -> Dict[str, Any]:
        """Update generation configuration"""
        try:
            # Validate new configuration
            valid_keys = ["temperature", "top_p", "top_k", "max_output_tokens"]
            for key, value in new_config.items():
                if key in valid_keys:
                    self.generation_config[key] = value
            
            logger.info("Generation configuration updated")
            return {
                "success": True,
                "message": "Generation configuration updated",
                "current_config": self.generation_config
            }
            
        except Exception as e:
            logger.error(f"Error updating generation config: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def process_query(self, query: str) -> str:
        """Process natural language queries about the Gemini service"""
        query_lower = query.lower()
        
        if "status" in query_lower or "configured" in query_lower:
            status = self.get_service_status()
            return f"""
**🤖 Gemini Service Status:**

**Configuration:** {"✅ Configured" if status['configured'] else "❌ Not Configured"}
**Default Model:** {status['default_model']}
**Fallback Model:** {status['fallback_model']}
**API Key:** {"✅ Provided" if status['api_key_provided'] else "❌ Not Provided"}

**Generation Settings:**
- Temperature: {status['generation_config']['temperature']}
- Top P: {status['generation_config']['top_p']}
- Max Tokens: {status['generation_config']['max_output_tokens']}
"""
        elif "configure" in query_lower or "setup" in query_lower:
            return """
**🤖 Gemini Service Configuration:**

To configure the Gemini service:

```python
gemini_service = GeminiService()
gemini_service.configure("your_api_key_here")
```

**Required:**
- Google Gemini API key
- Internet connection for API access

**Features:**
- Maritime expertise integration
- Multi-model support with fallback
- Configurable generation parameters
- Safety settings enabled
"""
        else:
            return """
**🤖 Gemini AI Service:**

I provide AI-powered responses using Google's Gemini model, specialized for maritime operations.

**Capabilities:**
- Natural language understanding
- Maritime expertise integration
- Document analysis
- Laytime calculations
- Charter party guidance

**Commands:**
- "gemini status" - Check service status
- "configure gemini" - Setup instructions
- "gemini help" - Get assistance
""" 