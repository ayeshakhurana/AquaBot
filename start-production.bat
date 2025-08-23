@echo off
echo 🚢 AquaBot Production Startup
echo ==============================

REM Check if we're in the right directory
if not exist "backend\app" (
    echo ❌ Please run this script from the AquaBot-1 directory
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist "backend\.env" (
    echo 📝 Creating .env file from template...
    copy "backend\env.example" "backend\.env"
    echo ⚠️  Please edit backend\.env with your actual API keys and configuration
    echo.
    echo Press any key to continue after editing .env file...
    pause
)

REM Start backend
echo 🚀 Starting backend services...
cd backend
docker-compose up --build -d

if %errorlevel% neq 0 (
    echo ❌ Failed to start backend services
    pause
    exit /b 1
)

echo.
echo ✅ Backend services started successfully!
echo 🌐 Backend: http://localhost:8000
echo 📊 MongoDB: http://localhost:27017
echo 🔴 Redis: http://localhost:6379
echo.
echo 📚 API Docs: http://localhost:8000/docs
echo 🔍 Health: http://localhost:8000/health
echo.
echo 🛑 To stop: docker-compose down
echo 📝 To view logs: docker-compose logs -f
echo.
pause 