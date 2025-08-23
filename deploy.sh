#!/bin/bash

echo "🚢 AquaBot Deployment Script"
echo "=============================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are available"

# Create .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env file from template..."
    cp backend/env.example backend/.env
    echo "⚠️  Please edit backend/.env with your actual API keys and configuration"
fi

# Build and start services
echo "🔨 Building and starting services..."
cd backend
docker-compose up --build -d

echo "✅ Services are starting up..."
echo "🌐 Backend will be available at: http://localhost:8000"
echo "📊 MongoDB will be available at: http://localhost:27017"
echo "🔴 Redis will be available at: http://localhost:6379"
echo ""
echo "📚 API Documentation: http://localhost:8000/docs"
echo "🔍 Health Check: http://localhost:8000/health"
echo ""
echo "🛑 To stop services: docker-compose down"
echo "📝 To view logs: docker-compose logs -f" 