# 🚀 CleanAirSight - Setup Instructions

**Welcome!** This guide will help you run CleanAirSight on your machine in under 10 minutes.

---

## 📋 Prerequisites

Before you begin, make sure you have:

1. **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
   - Windows: Docker Desktop for Windows
   - Mac: Docker Desktop for Mac
   - Linux: Docker Engine

2. **Git** - [Download here](https://git-scm.com/downloads)

3. **API Keys** (Free):
   - NASA Earthdata account - [Register here](https://urs.earthdata.nasa.gov/)
   - OpenWeatherMap API key - [Get free key](https://openweathermap.org/api)

---

## 🎯 Quick Start (3 Steps)

### **Step 1: Clone the Repository**

```bash
git clone https://github.com/STIWARTs/CleanAirSight.git
cd CleanAirSight
```

### **Step 2: Configure API Keys**

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

Then edit `.env` and add your API keys:

```env
# NASA Earthdata credentials (required)
NASA_EARTHDATA_USERNAME=your_username_here
NASA_EARTHDATA_PASSWORD=your_password_here

# OpenWeatherMap API key (required)
OPENWEATHER_API_KEY=your_api_key_here

# Optional keys
AIRNOW_API_KEY=your_airnow_key_here
OPENAQ_API_KEY=optional

# Database (leave as default)
MONGODB_URI=mongodb://mongodb:27017/cleanairsight
REDIS_URL=redis://redis:6379

# CORS (leave as default)
CORS_ORIGINS=http://localhost:3000
```

### **Step 3: Start the Application**

```bash
# Make sure Docker Desktop is running!

# Start all services
docker-compose up -d

# Wait 2-3 minutes for everything to build and start
```

That's it! 🎉

---

## 🌐 Access the Application

Once everything is running, open your browser:

- **Frontend**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **API Health**: http://localhost:8000/health

### What You'll See:

1. **Dashboard** - Real-time AQI cards for major US cities
2. **Map** - Interactive map with air quality markers
3. **Forecast** - ML-powered air quality predictions
4. **About** - Project information and tech stack

---

## 📝 Detailed Instructions

### For Windows Users:

```powershell
# 1. Clone the repo
git clone https://github.com/STIWARTs/CleanAirSight.git
cd CleanAirSight

# 2. Copy and edit .env file
copy .env.example .env
notepad .env  # Add your API keys

# 3. Start Docker Desktop (wait for it to fully start)

# 4. Run the application
docker-compose up -d

# 5. Check if containers are running
docker-compose ps

# 6. View logs (optional)
docker-compose logs -f
```

### For Mac/Linux Users:

```bash
# 1. Clone the repo
git clone https://github.com/STIWARTs/CleanAirSight.git
cd CleanAirSight

# 2. Copy and edit .env file
cp .env.example .env
nano .env  # or vim, or any text editor

# 3. Start Docker (if not already running)

# 4. Run the application
docker-compose up -d

# 5. Check if containers are running
docker-compose ps

# 6. View logs (optional)
docker-compose logs -f
```

---

## 🔑 Getting API Keys

### 1. NASA Earthdata (Required)

1. Go to https://urs.earthdata.nasa.gov/
2. Click "Register" (top right)
3. Fill out the form (takes 2 minutes)
4. Verify your email
5. Use your username and password in `.env`

### 2. OpenWeatherMap (Required)

1. Go to https://openweathermap.org/api
2. Sign up for a free account
3. Go to "API keys" section
4. Copy your API key
5. Paste it in `.env`

### 3. EPA AirNow (Optional)

1. Go to https://docs.airnowapi.org/
2. Request an API key
3. Wait for approval email (1-2 days)
4. Add to `.env` when received

---

## 🐳 Docker Commands Cheat Sheet

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart a specific service
docker-compose restart backend
docker-compose restart frontend

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check running containers
docker-compose ps

# Rebuild containers (if you make code changes)
docker-compose up --build -d

# Stop and remove everything (fresh start)
docker-compose down -v
docker-compose up --build -d
```

---

## 🔧 Troubleshooting

### Issue: "Docker daemon is not running"

**Solution**: Start Docker Desktop application and wait for it to fully start.

### Issue: "Port already in use"

**Solution**: Stop the service using the port:

```bash
# Check what's using the port
netstat -ano | findstr :3000  # Windows
lsof -i :3000  # Mac/Linux

# Stop Docker services
docker-compose down

# Kill the process if needed
taskkill /PID <PID> /F  # Windows
kill -9 <PID>  # Mac/Linux
```

### Issue: "Permission denied" (Linux/Mac)

**Solution**: Add your user to docker group:

```bash
sudo usermod -aG docker $USER
# Log out and log back in
```

### Issue: Frontend shows "Data Collection in Progress"

**Solution**: This is normal! The app is collecting data. Wait 2-3 minutes, then:

1. Click the "Retry" button on dashboard
2. Or refresh the page

The backend needs time to collect initial data from APIs.

### Issue: Map or Forecast pages not loading

**Solution**: Rebuild the frontend container:

```bash
docker-compose down frontend
docker-compose up --build -d frontend
```

---

## 📊 System Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 2GB for Docker images
- **OS**: Windows 10/11, macOS 10.15+, or Linux
- **Internet**: Required for API calls

---

## 🎓 Project Structure

```
CleanAirSight/
├── backend/          # Python FastAPI application
│   ├── main.py      # API endpoints
│   ├── data_ingestion/  # NASA TEMPO, OpenAQ clients
│   ├── ml/          # XGBoost forecasting
│   └── ...
├── frontend/        # React application
│   ├── src/
│   │   ├── pages/   # Dashboard, Map, Forecast, About
│   │   └── ...
│   └── ...
├── docker-compose.yml  # Docker orchestration
├── .env.example     # Environment variables template
└── README.md        # Full documentation
```

---

## 🚀 Quick Test

After starting the application, test if everything works:

```bash
# 1. Check backend health
curl http://localhost:8000/health

# 2. Check API endpoint
curl "http://localhost:8000/api/current?city=Los Angeles"

# 3. Open frontend in browser
open http://localhost:3000  # Mac
start http://localhost:3000  # Windows
xdg-open http://localhost:3000  # Linux
```

---

## 📚 Additional Resources

- **Full README**: See `README.md` for detailed documentation
- **Quick Start Guide**: See `QUICKSTART.md` for 10-minute setup
- **Deployment Guide**: See `DEPLOYMENT.md` for cloud deployment
- **API Documentation**: http://localhost:8000/docs (when running)

---

## 🤝 Getting Help

If you encounter any issues:

1. Check the troubleshooting section above
2. View Docker logs: `docker-compose logs -f`
3. Open an issue on GitHub
4. Check the README.md for more detailed information

---

## 🎉 Success Checklist

After setup, verify:

- [ ] Docker Desktop is running
- [ ] All 4 containers are up (`docker-compose ps`)
- [ ] Frontend loads at http://localhost:3000
- [ ] Dashboard shows city AQI cards
- [ ] Map page displays interactive map
- [ ] Forecast page shows charts
- [ ] About page has full content
- [ ] No errors in browser console (F12)

---

## 💡 Pro Tips

1. **First Time Running**: Wait 2-3 minutes for initial data collection
2. **Demo Data**: The app shows demo data until real data is collected
3. **Real Data**: Takes ~5 minutes to start seeing real NASA TEMPO data
4. **Logs**: Use `docker-compose logs -f` to watch real-time activity
5. **Updates**: Pull latest code with `git pull` then `docker-compose up --build -d`

---

## 🌟 What This App Does

**CleanAirSight** is a real-time air quality monitoring and forecasting system that:

- ✅ Integrates NASA TEMPO satellite data
- ✅ Combines ground sensor data (OpenAQ, EPA AirNow)
- ✅ Uses machine learning (XGBoost) for forecasting
- ✅ Provides interactive maps and visualizations
- ✅ Offers 6-72 hour air quality predictions

**Built for NASA Space Apps Challenge 2025** 🚀

---

**Ready to go? Run `docker-compose up -d` and visit http://localhost:3000!**

Happy monitoring! 🌍✨
