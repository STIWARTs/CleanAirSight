# 🚀 How to Start CleanAirSight

## ✅ All Files Verified Complete

Your project is 100% complete with all files filled in:
- ✅ Backend Python files (10 files)
- ✅ Frontend React components (10 files)
- ✅ Configuration files (package.json, vite.config.js, tailwind.config.js, etc.)
- ✅ Docker files (Dockerfile, docker-compose.yml)
- ✅ Documentation (README, QUICKSTART, DEPLOYMENT)
- ✅ Example data (4 CSV files)

## 🎯 Quick Start Options

### Option 1: Docker (Recommended - One Command!)

```powershell
# Make sure Docker Desktop is running, then:
cd "d:/CODEs/HACKATHONS/NASA 2025/BY WINDSURF/CleanAirSight"
docker-compose up --build
```

Wait 2-3 minutes for all containers to build and start, then open:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000/docs

### Option 2: Manual Start (For Testing/Development)

#### Step 1: Start MongoDB
```powershell
# If you have MongoDB installed:
mongod --dbpath "d:/CODEs/HACKATHONS/NASA 2025/BY WINDSURF/CleanAirSight/data/db"

# OR use Docker for just MongoDB:
docker run -d -p 27017:27017 --name cleanair-mongo mongo:7.0
```

#### Step 2: Start Backend
```powershell
cd "d:/CODEs/HACKATHONS/NASA 2025/BY WINDSURF/CleanAirSight/backend"

# Create virtual environment (first time only)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Run backend
python main.py
```

Backend will start at: **http://localhost:8000**

#### Step 3: Start Frontend (New Terminal)
```powershell
cd "d:/CODEs/HACKATHONS/NASA 2025/BY WINDSURF/CleanAirSight/frontend"

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Frontend will start at: **http://localhost:3000**

## 🔑 API Keys Status

Make sure your `.env` file has these keys filled in:
- ✅ `NASA_EARTHDATA_USERNAME` - Your NASA Earthdata username
- ✅ `NASA_EARTHDATA_PASSWORD` - Your NASA Earthdata password
- ✅ `OPENWEATHER_API_KEY` - Your OpenWeatherMap API key
- ⚠️ `AIRNOW_API_KEY` - Optional, for EPA AirNow data
- ⚠️ `OPENAQ_API_KEY` - Optional, OpenAQ works without key

## 📊 What to Expect

### First Launch (~2-3 minutes)
1. MongoDB starts and creates database
2. Backend starts FastAPI server
3. Backend begins first data collection automatically
4. Frontend builds and starts development server
5. You can access the dashboard!

### Dashboard Features
- **Real-time AQI** for major US cities
- **Interactive Map** with air quality markers
- **Forecast Charts** with ML predictions
- **Health Recommendations** based on AQI

## 🧪 Testing Without API Keys

If you haven't set up API keys yet, you can still test with sample data:

```powershell
# Import sample data into MongoDB
mongoimport --db cleanairsight --collection harmonized_data --type csv --headerline --file "d:/CODEs/HACKATHONS/NASA 2025/BY WINDSURF/CleanAirSight/examples/harmonized_sample.csv"
```

## 🐛 Troubleshooting

### Backend won't start
**Error**: `ModuleNotFoundError`
**Fix**: Make sure you installed dependencies:
```powershell
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend shows "Cannot connect to API"
**Check**: 
1. Backend is running at http://localhost:8000
2. Try: `curl http://localhost:8000/health`
3. Check browser console for errors

### MongoDB connection error
**Fix**: 
```powershell
# Use Docker MongoDB:
docker run -d -p 27017:27017 --name cleanair-mongo mongo:7.0

# Update .env:
MONGODB_URI=mongodb://localhost:27017/cleanairsight
```

### Docker containers not starting
**Fix**:
1. Make sure Docker Desktop is running
2. Check Docker has enough resources (4GB RAM minimum)
3. Try: `docker-compose down` then `docker-compose up --build`

## 📱 Access URLs

Once running:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Main web application |
| API Docs | http://localhost:8000/docs | Interactive API documentation |
| Health Check | http://localhost:8000/health | Backend status |
| Current AQI | http://localhost:8000/api/current?city=Los%20Angeles | Example API call |

## ✨ First Steps

1. **Open the dashboard** at http://localhost:3000
2. **Wait 1-2 minutes** for first data collection
3. **Explore the map** to see air quality markers
4. **Check forecasts** for different cities
5. **Read the About page** to understand the technology

## 🎉 Success Indicators

You'll know it's working when you see:
- ✅ Dashboard loads with AQI data
- ✅ Map shows colored markers for cities
- ✅ Forecast charts display predictions
- ✅ No errors in browser console
- ✅ Backend logs show "Data collection completed"

## 📚 Next Steps

- Add more cities in `backend/scheduler.py`
- Adjust data collection frequency in `backend/config.py`
- Customize the frontend theme in `frontend/tailwind.config.js`
- Deploy to cloud (see DEPLOYMENT.md)

---

**Need help?** Check the detailed guides:
- `README.md` - Full documentation
- `QUICKSTART.md` - 10-minute setup
- `DEPLOYMENT.md` - Cloud deployment

**Your NASA Space Apps 2025 project is ready to go! 🌍✨**
