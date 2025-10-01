# 🪟 Windows Setup Guide for CleanAirSight

## ⚠️ Windows Installation Issue

You're experiencing a common Windows issue: many Python packages (NumPy, SciPy, etc.) require C++ compilers that aren't readily available on Windows.

## ✅ **BEST SOLUTION: Use Docker** (Recommended)

Docker already has all the necessary compilers and dependencies. This is the **easiest and most reliable** method:

### Step 1: Make Sure Docker Desktop is Running
- Open Docker Desktop
- Wait for it to fully start (whale icon in system tray)

### Step 2: Build and Run
```powershell
cd "d:/CODEs/HACKATHONS/NASA 2025/BY WINDSURF/CleanAirSight"

# Build and start all services
docker-compose up --build
```

### Step 3: Wait and Access
- Wait 3-5 minutes for first build (downloads images, installs dependencies)
- Frontend: **http://localhost:3000**
- API Docs: **http://localhost:8000/docs**

**That's it! Docker handles everything.**

---

## 🔧 Alternative: Manual Windows Installation

If you really want to run without Docker, follow these steps:

### Option A: Use Prebuilt Wheels (Simplest)

I've already updated your `requirements.txt` with Windows-compatible versions. Try:

```powershell
cd "d:/CODEs/HACKATHONS/NASA 2025/BY WINDSURF/CleanAirSight/backend"

# Create fresh virtual environment
python -m venv venv

# Activate
.\venv\Scripts\Activate.ps1

# Upgrade pip
python -m ensurepip --upgrade
python -m pip install --upgrade pip

# Install dependencies with prebuilt wheels only
pip install --only-binary=:all: -r requirements.txt
```

If some packages fail, install core dependencies manually:

```powershell
# Core packages (guaranteed to have Windows wheels)
pip install fastapi uvicorn pydantic pydantic-settings
pip install pymongo motor python-dotenv
pip install pandas numpy==1.24.3 scipy==1.11.1
pip install scikit-learn==1.3.0 xgboost==1.7.6
pip install httpx aiohttp requests
pip install apscheduler python-dateutil
```

### Option B: Install Microsoft Visual C++ Build Tools

If you want the full experience:

1. Download **Visual Studio Build Tools**: https://visualstudio.microsoft.com/downloads/
2. Install with "Desktop development with C++"
3. Restart computer
4. Then run:
```powershell
pip install -r requirements.txt
```

---

## 🚀 Quick Start (Docker Method)

Since you have Docker installed, here's the **complete working setup**:

```powershell
# Navigate to project
cd "d:/CODEs/HACKATHONS/NASA 2025/BY WINDSURF/CleanAirSight"

# Make sure .env exists with your API keys
# (You mentioned you already added them - great!)

# Start everything
docker-compose up --build

# See logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop everything (when done)
docker-compose down
```

### What Docker Does:
✅ Installs MongoDB
✅ Installs Redis
✅ Builds backend with all dependencies (in Linux container)
✅ Builds frontend with Node.js
✅ Connects everything automatically

### Access URLs:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- MongoDB: localhost:27017

---

## 🐛 Troubleshooting Docker

### "Docker daemon is not running"
**Fix:** Start Docker Desktop application

### "Port already in use"
**Fix:** Stop other services using ports 3000, 8000, 27017:
```powershell
# Check what's using port 8000
netstat -ano | findstr :8000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### "Cannot connect to Docker daemon"
**Fix:** 
1. Open Docker Desktop
2. Go to Settings → Resources
3. Increase Memory to at least 4GB
4. Click "Apply & Restart"

### "docker-compose command not found"
**Fix:**
```powershell
# Use docker compose (no dash)
docker compose up --build
```

---

## 📊 What to Expect

### First Run (3-5 minutes):
1. ⏳ Docker downloads base images (MongoDB, Redis, Python, Node.js)
2. ⏳ Backend builds and installs Python dependencies
3. ⏳ Frontend builds and installs npm packages
4. ✅ All services start
5. ✅ Backend collects first data automatically
6. ✅ Frontend becomes accessible

### Console Output You'll See:
```
[+] Building backend...
[+] Building frontend...
cleanairsight-mongodb-1   | Starting MongoDB...
cleanairsight-backend-1   | INFO:     Uvicorn running on http://0.0.0.0:8000
cleanairsight-frontend-1  | VITE ready in 1234 ms
```

### Success Indicators:
- ✅ All containers show "Running" status
- ✅ No errors in logs
- ✅ You can access http://localhost:3000
- ✅ Dashboard loads with data

---

## 💡 Pro Tips

### View Live Logs:
```powershell
# All services
docker-compose logs -f

# Just backend
docker-compose logs -f backend

# Just frontend
docker-compose logs -f frontend
```

### Restart a Service:
```powershell
docker-compose restart backend
```

### Rebuild After Code Changes:
```powershell
docker-compose up --build backend
```

### Clean Everything:
```powershell
# Stop and remove containers
docker-compose down

# Also remove volumes (database data)
docker-compose down -v
```

---

## 🎯 Recommended Workflow

**For NASA Space Apps Demo:**

1. **Use Docker** - It's reliable and works everywhere
2. **Keep Docker Desktop running** during development
3. **Use logs** to debug: `docker-compose logs -f`
4. **Test locally first** before deploying to cloud

**Benefits:**
- ✅ Same environment on all computers
- ✅ Easy to share with team
- ✅ Production-like setup
- ✅ No Windows dependency headaches

---

## 📞 Still Having Issues?

### Check Docker Status:
```powershell
docker ps
docker-compose ps
```

### Check System Resources:
- Docker needs at least **4GB RAM**
- Check Docker Desktop → Settings → Resources

### Alternative: Cloud Development
If local Docker doesn't work, deploy directly to:
- **Railway**: https://railway.app (free tier)
- **Render**: https://render.com (free tier)
- **Google Cloud Run**: (generous free tier)

See `DEPLOYMENT.md` for cloud setup instructions.

---

**🎉 Bottom Line: Use Docker! It's designed for exactly this situation.**

Your project is 100% ready - Docker will handle all the complex dependencies automatically.

```powershell
docker-compose up --build
```

That's literally all you need! 🚀
