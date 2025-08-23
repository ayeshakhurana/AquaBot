# 🚢 AquaBot Deployment Guide

This guide covers all deployment options for the AquaBot Maritime AI Assistant.

## 📋 Prerequisites

- **Docker & Docker Compose** (for local/production deployment)
- **Node.js 18+** (for frontend development)
- **Python 3.11+** (for backend development)
- **MongoDB** (local or cloud)
- **API Keys** for external services

## 🚀 Quick Start (Local Development)

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd AquaBot-1

# Run deployment script
# On Windows:
.\deploy.ps1

# On Linux/Mac:
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Production Deployment

### Backend Deployment Options

#### 1. Railway (Recommended - Easy)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
cd backend
railway login
railway init
railway up
```

**Environment Variables in Railway:**
- `GOOGLE_API_KEY`
- `OPENWEATHER_API_KEY`
- `STORMGLASS_API_KEY`
- `MAPTILER_API_KEY`
- `MONGODB_URI`
- `CORS_ORIGINS`

#### 2. Render

```bash
# Connect your GitHub repo to Render
# Set environment variables in Render dashboard
# Deploy automatically on push
```

#### 3. Heroku

```bash
# Install Heroku CLI
heroku create your-aquabot-app
heroku config:set GOOGLE_API_KEY=your_key
heroku config:set MONGODB_URI=your_mongodb_uri
git push heroku main
```

#### 4. DigitalOcean App Platform

```bash
# Use the Dockerfile
# Connect your GitHub repo
# Set environment variables
# Deploy automatically
```

### Frontend Deployment Options

#### 1. Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

**Environment Variables in Vercel:**
- `VITE_API_URL` (your backend URL)

#### 2. Netlify

```bash
# Connect your GitHub repo
# Build command: npm run build
# Publish directory: dist
# Set environment variables
```

#### 3. GitHub Pages

```bash
# Add to package.json
"homepage": "https://yourusername.github.io/your-repo",
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

## 🐳 Docker Deployment

### Local Docker

```bash
cd backend
docker-compose up --build -d
```

### Production Docker

```bash
# Build image
docker build -t aquabot-backend .

# Run container
docker run -d \
  -p 8000:8000 \
  -e GOOGLE_API_KEY=your_key \
  -e MONGODB_URI=your_uri \
  --name aquabot-backend \
  aquabot-backend
```

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
# API Keys
GOOGLE_API_KEY=your_gemini_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
STORMGLASS_API_KEY=your_stormglass_api_key
MAPTILER_API_KEY=your_maptiler_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key

# Database
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=maritime_ai

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=false

# Security
SECRET_KEY=your_secret_key
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100
```

### Frontend Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL=https://your-backend-url.com
VITE_MAPTILER_API_KEY=your_maptiler_key
```

## 📊 Database Setup

### MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://mongodb.com/atlas)
2. Create cluster (free tier available)
3. Get connection string
4. Set `MONGODB_URI` environment variable

### Local MongoDB

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Or install locally
# Windows: Download from mongodb.com
# Linux: sudo apt install mongodb
# Mac: brew install mongodb-community
```

## 🔒 Security Considerations

### Production Checklist

- [ ] Use HTTPS everywhere
- [ ] Set strong `SECRET_KEY`
- [ ] Configure `CORS_ORIGINS` properly
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting
- [ ] Set up proper logging
- [ ] Use non-root Docker user
- [ ] Regular security updates

### SSL/HTTPS

**Let's Encrypt (Free):**
```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com
```

**Update Gunicorn config:**
```python
keyfile = "/etc/letsencrypt/live/yourdomain.com/privkey.pem"
certfile = "/etc/letsencrypt/live/yourdomain.com/cert.pem"
```

## 📈 Monitoring & Logging

### Health Checks

```bash
# Check backend health
curl https://your-backend.com/health

# Check MongoDB connection
curl https://your-backend.com/api/agents/capabilities
```

### Logs

```bash
# Docker logs
docker-compose logs -f backend

# Application logs
tail -f backend/logs/app.log
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `CORS_ORIGINS` environment variable
   - Ensure frontend URL is included

2. **MongoDB Connection**
   - Verify `MONGODB_URI` is correct
   - Check network connectivity
   - Ensure MongoDB is running

3. **API Key Issues**
   - Verify all required API keys are set
   - Check API key permissions and quotas

4. **Port Conflicts**
   - Ensure ports 8000, 27017, 6379 are available
   - Change ports in docker-compose.yml if needed

### Debug Mode

```bash
# Enable debug logging
export DEBUG=true
export LOG_LEVEL=DEBUG

# Run with verbose output
uvicorn app.main:app --reload --log-level debug
```

## 📚 Additional Resources

- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [React Deployment](https://create-react-app.dev/docs/deployment/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/getting-started/)

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables
3. Check network connectivity
4. Review this deployment guide
5. Open an issue in the repository

---

**Happy Deploying! 🚢⚓** 