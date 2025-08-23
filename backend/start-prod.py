#!/usr/bin/env python3
"""
Maritime AI Assistant - Production Startup Script
================================================

Production startup script using Gunicorn with Uvicorn workers.
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    print("🚢 Maritime AI Assistant - Production Mode")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path("app").exists():
        print("❌ Please run this script from the backend directory")
        sys.exit(1)
    
    # Load environment variables
    env_file = Path(".env")
    if env_file.exists():
        print("✅ Environment file found")
        from dotenv import load_dotenv
        load_dotenv()
    else:
        print("⚠️  No .env file found. Using system environment variables.")
    
    # Check required environment variables
    required_vars = ["GOOGLE_API_KEY", "MONGODB_URI"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        print("Please create a .env file or set these environment variables.")
        sys.exit(1)
    
    # Get configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = os.getenv("PORT", "8000")
    workers = os.getenv("WORKERS", "auto")
    
    print(f"🌐 Starting server on {host}:{port}")
    print(f"👥 Workers: {workers}")
    print("📚 API Documentation will be available at /docs")
    print("🔍 Health check available at /health")
    print()
    
    # Start Gunicorn
    try:
        cmd = [
            "gunicorn",
            "app.main:app",
            "--config", "gunicorn.conf.py",
            "--bind", f"{host}:{port}",
            "--worker-class", "uvicorn.workers.UvicornWorker",
            "--workers", str(workers),
            "--access-logfile", "-",
            "--error-logfile", "-",
            "--log-level", "info"
        ]
        
        print("🚀 Starting Gunicorn server...")
        print(f"Command: {' '.join(cmd)}")
        print()
        
        subprocess.run(cmd)
        
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except FileNotFoundError:
        print("❌ Gunicorn not found. Please install it:")
        print("   pip install gunicorn")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 