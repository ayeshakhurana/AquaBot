#!/usr/bin/env python3
"""
Maritime AI Assistant - Startup Script
=====================================

Simple startup script that works on Windows, Mac, and Linux.
"""

import os
import sys
import subprocess
import platform

def main():
    print("🚢 Maritime AI Assistant")
    print("=" * 30)
    print("✅ API key is already configured in the code!")
    
    # Check if required packages are installed
    try:
        import streamlit
        import google.generativeai
        import PyPDF2
        import docx
        print("✅ All required packages are installed")
    except ImportError as e:
        print(f"❌ Missing package: {e}")
        print("Please install requirements: pip install -r requirements.txt")
        return
    
    # Launch Streamlit
    print("\n🚀 Launching Maritime AI Assistant...")
    print("📱 The app will open in your browser at: http://localhost:8501")
    print("⏹️  Press Ctrl+C to stop the application")
    print()
    
    try:
        subprocess.run([
            sys.executable, "-m", "streamlit", "run", "maritime_ai.py",
            "--server.port", "8501",
            "--server.address", "localhost"
        ])
    except KeyboardInterrupt:
        print("\n👋 Maritime AI Assistant stopped")
    except Exception as e:
        print(f"❌ Error launching app: {e}")

if __name__ == "__main__":
    main() 