# 🚀 AquaBot Quick Start Guide

Get your AquaBot Maritime AI Assistant running in minutes!

## ⚡ Quick Start (Windows)

### 1. **One-Click Startup**
```cmd
start-production.bat
```

This will:
- ✅ Create environment file from template
- 🐳 Start all services with Docker
- 🌐 Launch backend at http://localhost:8000
- 📊 Start MongoDB and Redis

### 2. **Configure API Keys**
Edit `backend\.env` and add your API keys:
```env
GOOGLE_API_KEY=your_gemini_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
STORMGLASS_API_KEY=your_stormglass_api_key
MAPTILER_API_KEY=your_maptiler_api_key
```

### 3. **Access Your App**
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🐳 Docker Commands

```cmd
# Start services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart
```

## 🌐 Production Deployment

### Backend (Choose one)
1. **Railway** (Easiest): `railway up`
2. **Render**: Connect GitHub repo
3. **Heroku**: `git push heroku main`
4. **DigitalOcean**: Use App Platform

### Frontend (Choose one)
1. **Vercel**: `vercel --prod`
2. **Netlify**: Connect GitHub repo
3. **GitHub Pages**: `npm run deploy`

## 📋 What's Included

- ✅ **FastAPI Backend** with 10 AI agents
- ✅ **React Frontend** with modern UI
- ✅ **MongoDB** database
- ✅ **Redis** caching
- ✅ **Docker** configuration
- ✅ **Production** scripts
- ✅ **Health checks**
- ✅ **API documentation**

## 🆘 Need Help?

1. **Check logs**: `docker-compose logs -f`
2. **Health check**: http://localhost:8000/health
3. **Full guide**: See `DEPLOYMENT.md`
4. **Checklist**: Use `DEPLOYMENT_CHECKLIST.md`

---

**🚢 Your AquaBot is ready to sail! ⚓** 