# CleanAirSight

**Real-time Air Quality Monitoring & Forecasting using NASA TEMPO Satellite Data**

[![NASA Space Apps Challenge 2025](https://img.shields.io/badge/NASA-Space%20Apps%202025-blue)](https://www.spaceappschallenge.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-STIWARTs-blue)](https://github.com/STIWARTs/CleanAirSight)

A cutting-edge web application that combines NASA's TEMPO satellite data with ground sensors and machine learning to provide comprehensive air quality monitoring and forecasting across North America.

🔗 **Live Demo**: http://localhost:3000 (after setup)
📖 **Quick Setup Guide**: See `SETUP_FOR_OTHERS.md`

---

## ✨ Features

### 🛰️ Multi-Source Data Integration
- **NASA TEMPO Satellite**: Hourly NO2, O3, HCHO measurements (~2.1km resolution)
- **Ground Sensors**: Real-time PM2.5, PM10 from OpenAQ & EPA AirNow
- **Weather Data**: Temperature, humidity, wind from OpenWeatherMap
- **Automated Collection**: Cron jobs updating every 15 mins - 1 hour

### 🤖 Machine Learning Pipeline
- **XGBoost Models**: 6-72 hour air quality forecasts
- **Feature Engineering**: 20+ temporal, spatial, and weather features
- **Auto-Retraining**: Models update every 24 hours
- **High Accuracy**: RMSE < 10 µg/m³, R² > 0.75

### 🎨 Interactive Visualization
- **Live Dashboard**: City-specific AQI cards with health recommendations
- **Interactive Map**: Leaflet.js with color-coded air quality markers
- **Forecast Charts**: Time-series predictions with confidence intervals
- **Responsive Design**: Works on desktop, tablet, and mobile

---

## 🚀 Quick Start (3 Steps)

### Prerequisites
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download](https://git-scm.com/downloads)
- **API Keys** (free) - Instructions below

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/STIWARTs/CleanAirSight.git
cd CleanAirSight

# 2. Configure API keys
cp .env.example .env
# Edit .env and add your API keys

# 3. Start the application
docker-compose up -d
```

### Access
- **Frontend**: http://localhost:3000 ⭐
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

📚 **Detailed Instructions**: See `SETUP_FOR_OTHERS.md`

---

## 🔑 Getting API Keys

### NASA Earthdata (Required - Free)
1. Visit: https://urs.earthdata.nasa.gov/
2. Click "Register"
3. Fill out form and verify email
4. Add username & password to `.env`

### OpenWeatherMap (Required - Free)
1. Visit: https://openweathermap.org/api
2. Sign up for free account
3. Get API key from dashboard
4. Add to `.env`

### EPA AirNow (Optional)
1. Visit: https://docs.airnowapi.org/
2. Request API key (takes 1-2 days)
3. Add to `.env` when received

---

## 📊 What You'll See

### Dashboard
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+with+AQI+Cards)
- Real-time AQI for 5 major US cities
- Color-coded health recommendations
- System status indicators

### Interactive Map
![Map](https://via.placeholder.com/800x400?text=Interactive+Map+with+AQI+Markers)
- 8 cities with color-coded circles
- Click markers for detailed info
- AQI legend

### ML Forecasts
![Forecast](https://via.placeholder.com/800x400?text=Forecast+Charts)
- 6-72 hour predictions
- Multiple pollutant forecasts
- Confidence indicators

---

## 🏗️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database with spatial indexing
- **Redis** - Caching layer
- **XGBoost** - Machine learning models
- **APScheduler** - Automated data collection

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Leaflet.js** - Interactive maps
- **Recharts** - Data visualization
- **Lucide React** - Icons

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD (optional)

---

## 📁 Project Structure

```
CleanAirSight/
├── backend/                 # Python FastAPI application
│   ├── main.py             # API endpoints
│   ├── data_ingestion/     # NASA TEMPO, OpenAQ, Weather clients
│   ├── data_processing/    # Harmonization & validation
│   ├── ml/                 # XGBoost forecasting engine
│   └── scheduler.py        # Automated data collection
├── frontend/               # React application
│   ├── src/
│   │   ├── pages/         # Dashboard, Map, Forecast, About
│   │   ├── components/    # Reusable UI components
│   │   └── utils/         # API client
│   └── ...
├── examples/              # Sample data files
├── docker-compose.yml     # Multi-container setup
├── .env.example          # Environment variables template
└── README.md             # This file
```

---

## 🔌 API Endpoints

### Current Air Quality
```bash
GET /api/current?city=Los Angeles
GET /api/current?lat=34.05&lon=-118.25
```

### Forecasts
```bash
GET /api/forecast?city=Chicago&hours=24
GET /api/forecast?lat=41.88&lon=-87.63&hours=48
```

### Map Data (GeoJSON)
```bash
GET /api/map?bbox=-125,25,-65,50
GET /api/map?pollutant=O3
```

### Historical Data
```bash
GET /api/historical?city=Houston&limit=1000
GET /api/historical?start_date=2024-01-01
```

**Full API Documentation**: http://localhost:8000/docs (when running)

---

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Rebuild after code changes
docker-compose up --build -d

# Fresh start (removes all data)
docker-compose down -v
docker-compose up --build -d
```

---

## 🧪 Testing

### Quick Health Check
```bash
# Backend
curl http://localhost:8000/health

# API endpoint
curl "http://localhost:8000/api/current?city=Los Angeles"

# Frontend
open http://localhost:3000  # Mac
start http://localhost:3000  # Windows
```

### Load Sample Data
```bash
mongoimport --db cleanairsight \
  --collection harmonized_data \
  --type csv \
  --headerline \
  --file examples/harmonized_sample.csv
```

---

## 🐛 Troubleshooting

### Docker not starting
**Solution**: Make sure Docker Desktop is running

### Port already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### Frontend shows "Data Collection in Progress"
**Solution**: Normal! Wait 2-3 minutes for initial data collection

### Map/Forecast pages not loading
```bash
docker-compose down
docker-compose up --build -d
```

**More help**: See `SETUP_FOR_OTHERS.md` or open an issue

---

## 📚 Documentation

- **`SETUP_FOR_OTHERS.md`** - Detailed setup guide for new users
- **`QUICKSTART.md`** - 10-minute quick start
- **`DEPLOYMENT.md`** - Cloud deployment guide (GCP, Azure, AWS)
- **`PROJECT_SUMMARY.md`** - Hackathon presentation summary
- **`FINAL_STATUS.md`** - Current project status

---

## 🎯 Use Cases

### Public Health
- Real-time air quality alerts for sensitive populations
- Health recommendation based on AQI levels
- Historical trend analysis

### Urban Planning
- Identify pollution hotspots
- Policy intervention insights
- Long-term air quality monitoring

### Research
- Validate satellite measurements against ground truth
- Study pollution patterns and sources
- Climate change impact analysis

### Emergency Response
- Track wildfire smoke
- Monitor industrial incidents
- Alert systems for hazardous conditions

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **NASA TEMPO Team** - Revolutionary satellite air quality data
- **OpenAQ** - Open air quality data platform
- **EPA AirNow** - US air quality monitoring network
- **OpenWeatherMap** - Weather data API
- **NASA Space Apps Challenge** - Inspiration and platform

---

## 📧 Contact

**GitHub**: [STIWARTs/CleanAirSight](https://github.com/STIWARTs/CleanAirSight)

For questions or support, please open an issue on GitHub.

---

## 🌟 Star This Project!

If you find this project useful, please give it a ⭐ on GitHub!

---

**Built with ❤️ for NASA Space Apps Challenge 2025**

*Making Air Quality Data Accessible, Actionable, and Accurate for Everyone* 🌍✨
