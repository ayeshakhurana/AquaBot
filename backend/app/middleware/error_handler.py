import logging
import time
from typing import Callable
from fastapi import Request, Response, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

logger = logging.getLogger(__name__)

class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        try:
            # Process the request
            response = await call_next(request)
            
            # Log successful requests
            process_time = time.time() - start_time
            logger.info(
                f"Request processed successfully: {request.method} {request.url.path} "
                f"- Status: {response.status_code} - Time: {process_time:.3f}s"
            )
            
            return response
            
        except HTTPException as e:
            # Handle known HTTP exceptions
            process_time = time.time() - start_time
            logger.warning(
                f"HTTP Exception: {request.method} {request.url.path} "
                f"- Status: {e.status_code} - Detail: {e.detail} - Time: {process_time:.3f}s"
            )
            
            return JSONResponse(
                status_code=e.status_code,
                content={
                    "error": "HTTP Error",
                    "message": e.detail,
                    "status_code": e.status_code,
                    "path": str(request.url.path),
                    "timestamp": time.time()
                }
            )
            
        except Exception as e:
            # Handle unexpected exceptions
            process_time = time.time() - start_time
            logger.error(
                f"Unexpected error: {request.method} {request.url.path} "
                f"- Error: {str(e)} - Time: {process_time:.3f}s",
                exc_info=True
            )
            
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Internal Server Error",
                    "message": "An unexpected error occurred. Please try again later.",
                    "status_code": 500,
                    "path": str(request.url.path),
                    "timestamp": time.time()
                }
            )

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests = {}  # In production, use Redis or similar
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Get client IP (consider using X-Forwarded-For for proxies)
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        
        # Clean old requests (older than 1 minute)
        self.requests = {
            ip: timestamps for ip, timestamps in self.requests.items()
            if any(timestamp > current_time - 60 for timestamp in timestamps)
        }
        
        # Check rate limit for this client
        if client_ip in self.requests:
            recent_requests = [t for t in self.requests[client_ip] if t > current_time - 60]
            if len(recent_requests) >= self.requests_per_minute:
                logger.warning(f"Rate limit exceeded for IP: {client_ip}")
                return JSONResponse(
                    status_code=429,
                    content={
                        "error": "Rate Limit Exceeded",
                        "message": f"Too many requests. Limit: {self.requests_per_minute} per minute.",
                        "retry_after": 60,
                        "timestamp": current_time
                    }
                )
            self.requests[client_ip] = recent_requests + [current_time]
        else:
            self.requests[client_ip] = [current_time]
        
        # Process the request
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(
            self.requests_per_minute - len(self.requests.get(client_ip, []))
        )
        
        return response

class LoggingMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Log request details
        logger.info(
            f"Request started: {request.method} {request.url.path} "
            f"- Client: {request.client.host if request.client else 'unknown'} "
            f"- User-Agent: {request.headers.get('user-agent', 'unknown')}"
        )
        
        # Process the request
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Log response details
        logger.info(
            f"Request completed: {request.method} {request.url.path} "
            f"- Status: {response.status_code} - Time: {process_time:.3f}s"
        )
        
        return response

class SecurityMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Add security headers
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        return response 