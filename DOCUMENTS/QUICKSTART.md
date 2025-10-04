# CleanAirSight Quick Start Guide

Get CleanAirSight up and running in 10 minutes!

## 🚀 Fastest Setup (Docker)

### Prerequisites
- Docker Desktop installed and running
- 4GB free RAM

### Steps

1. **Clone and navigate**
```bash
git clone <repo-url>
cd CleanAirSight
```

2. **Configure API keys**
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your text editor and add:
# - NASA_EARTHDATA_USERNAME (get from https://urs.earthdata.nasa.gov/)
# - OPENWEATHER_API_KEY (get from https://openweathermap.org/api)
```

3. **Start everything**
```bash
docker-compose up -d
```

4. **Access the app**
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

That's it! 🎉

## 📱 What You'll See

### Dashboard
- Real-time AQI for major US cities
- Individual pollutant cards (PM2.5, PM10, O3, NO2)
- Health recommendations based on air quality
- Last updated timestamp

### Map View
- Interactive map with color-coded air quality markers
- Click markers for detailed pollutant information
- Filter by specific pollutants
- AQI legend

### Forecast
- 6-72 hour predictions
- ML-powered forecasts using XGBoost
- Multiple pollutant forecasts
- Confidence indicators

## 🔧 Local Development Setup

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run
python main.py
```

Backend will be available at http://localhost:8000

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at http://localhost:3000

### Database

**Option 1: MongoDB with Docker**
```bash
docker-compose up -d mongodb
```

**Option 2: MongoDB Atlas (Cloud)**
1. Sign up at https://cloud.mongodb.com
2. Create free M0 cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

**Option 3: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Then run:
mongod --dbpath ./data/db
```

## 🧪 Testing with Sample Data

Load example data to test without waiting for API data collection:

```bash
# Start MongoDB
docker-compose up -d mongodb

# Import sample data
mongoimport --db cleanairsight \
  --collection harmonized_data \
  --type csv \
  --headerline \
  --file examples/harmonized_sample.csv
```

## 🔑 Getting API Keys

### Required: NASA Earthdata (Free)
1. Visit https://urs.earthdata.nasa.gov/
2. Click "Register"
3. Fill out form
4. Verify email
5. Username and password go in `.env`

### Required: OpenWeatherMap (Free tier available)
1. Visit https://openweathermap.org/api
2. Sign up for free account
3. Navigate to API keys
4. Copy your key
5. Add to `.env` as `OPENWEATHER_API_KEY`

### Optional: EPA AirNow (Free)
1. Visit https://docs.airnowapi.org/
2. Request API key
3. Wait for approval email (usually 1-2 days)
4. Add to `.env` as `AIRNOW_API_KEY`

## 📊 Data Collection Schedule

Once running, data is automatically collected:

- **TEMPO Satellite**: Every hour
- **Ground Sensors**: Every 15 minutes  
- **Weather Data**: Every hour
- **Data Processing**: Every 30 minutes
- **ML Model Training**: Every 24 hours

First data collection happens immediately on startup!

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check MongoDB is running
docker ps

# Check logs
docker-compose logs backend

# Common fix: Restart MongoDB
docker-compose restart mongodb
```

### Frontend can't reach backend
```bash
# Check backend is running
curl http://localhost:8000/health

# Check CORS settings in backend/.env
# Should include: CORS_ORIGINS=http://localhost:3000
```

### No data showing
```bash
# Check if data collection ran
curl http://localhost:8000/api/current?city=Los%20Angeles

# Manually trigger data collection
curl -X POST http://localhost:8000/api/trigger-update

# Check backend logs
docker-compose logs -f backend
```

### MongoDB connection error
```bash
# Verify MongoDB URI in .env
# Default: mongodb://localhost:27017/cleanairsight

# For Docker: mongodb://mongodb:27017/cleanairsight
# For Atlas: mongodb+srv://user:pass@cluster.mongodb.net/cleanairsight
```

## 📱 Mobile/Tablet Access

Access from other devices on your network:

1. Find your computer's IP address:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig`

2. Access from mobile:
   - http://YOUR_IP:3000

3. Update backend CORS if needed:
   ```bash
   # In .env add your IP
   CORS_ORIGINS=http://localhost:3000,http://YOUR_IP:3000
   ```

## 🎯 Next Steps

1. **Explore the API**: Visit http://localhost:8000/docs for interactive API documentation

2. **Customize Cities**: Edit `backend/scheduler.py` to add more cities

3. **Adjust Collection Frequency**: Modify intervals in `backend/config.py`

4. **Train Models**: Once you have data, models train automatically every 24 hours

5. **Deploy to Production**: See `DEPLOYMENT.md` for cloud deployment guides

## 📚 Learn More

- **Full Documentation**: See `README.md`
- **Deployment Guide**: See `DEPLOYMENT.md`
- **API Reference**: http://localhost:8000/docs (when running)
- **Example Data**: See `examples/` directory

## 💡 Tips

- Start with a few cities to test before scaling up
- Use sample data (in `examples/`) for immediate testing
- Monitor backend logs for data collection progress
- Check `/health` endpoint to verify service status
- First ML forecast available after ~1000 data points collected

## 🆘 Need Help?

- Check logs: `docker-compose logs -f`
- Review README.md for detailed setup
- Check GitHub issues
- Verify all API keys are correctly configured

---

**Happy monitoring! 🌍✨**
