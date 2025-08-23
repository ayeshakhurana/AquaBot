# AquaBot Deployment Script for Windows
Write-Host "🚢 AquaBot Deployment Script" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green

# Check if Docker is installed
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is installed
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Compose first." -ForegroundColor Red
    exit 1
}

# Create .env file if it doesn't exist
if (-not (Test-Path "backend\.env")) {
    Write-Host "📝 Creating backend .env file from template..." -ForegroundColor Yellow
    Copy-Item "backend\env.example" "backend\.env"
    Write-Host "⚠️  Please edit backend\.env with your actual API keys and configuration" -ForegroundColor Yellow
}

# Build and start services
Write-Host "🔨 Building and starting services..." -ForegroundColor Yellow
Set-Location backend
docker-compose up --build -d

Write-Host "✅ Services are starting up..." -ForegroundColor Green
Write-Host "🌐 Backend will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📊 MongoDB will be available at: http://localhost:27017" -ForegroundColor Cyan
Write-Host "🔴 Redis will be available at: http://localhost:6379" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "🔍 Health Check: http://localhost:8000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "🛑 To stop services: docker-compose down" -ForegroundColor Yellow
Write-Host "📝 To view logs: docker-compose logs -f" -ForegroundColor Yellow

Set-Location .. 