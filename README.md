# CleanAirSight 🌍

**Real-time Air Quality Monitoring & Forecasting using NASA TEMPO Satellite Data**

[![NASA Space Apps Challenge 2025](https://img.shields.io/badge/NASA-Space%20Apps%202025-blue)](https://www.spaceappschallenge.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-STIWARTs-blue)](https://github.com/STIWARTs/CleanAirSight)

A cutting-edge web application that combines NASA's TEMPO satellite data with ground sensors and machine learning to provide comprehensive air quality monitoring and forecasting across North America.

**Deployed Site**: https://www.cleanairsight.earth
**Live Demo**: https://youtu.be/Jr91ayrpamA
**SAC Project Page Link**: https://www.spaceappschallenge.org/2025/find-a-team/omega7/?tab=project

CleanAirSight is an innovative air quality monitoring platform that leverages NASA’s TEMPO satellite data and AI-powered forecasting to provide real-time, location-specific air quality information. By integrating NASA’s satellite measurements with Microsoft’s environmental intelligence and Azure Machine Learning, it offers comprehensive assessments of air quality, including AQI readings, pollutant concentrations (NO2, O3, HCHO, PM2.5, PM10), health impacts, and personalized recommendations. The platform empowers individuals, communities, and organizations to make informed decisions about outdoor activities and health precautions, offering 24-48 hour forecasts and environmental context. It’s especially crucial for vulnerable populations, urban planners, and researchers needing accurate data to protect public health and guide policy in an increasingly polluted world.

**Team OMEGA** is back again this year to the NASA SAC 2025 after qualifying for National Round once already in 2024. 
### Team Members:  
- **Stiwart Stance Saxena** [[GitHub](https://github.com/STIWARTs)] [[LinkedIn](https://linkedin.com/in/stiwartsaxena)] 
- **Piyush Verma** [[GitHub](https://github.com/piyerx)] [[LinkedIn](https://linkedin.com/in/piyerx)]
- **Priyanshu Agrawal** [[GitHub](https://github.com/Priyanshugrawal)] [[LinkedIn](https://www.linkedin.com/in/priyanshu-agrawal-83b268291)]
- **Bandana Das** [[GitHub](https://github.com/bandana-web)] [[LinkedIn](https://www.linkedin.com/in/bandana-das-64b232291)]
- **Neha Soni** [[GitHub](https://github.com/NehaSoni25)] [[LinkedIn](https://www.linkedin.com/in/neha-soni-b47115290)]
- **Yash Singh** [[GitHub](https://github.com/yash-singh12)] [[LinkedIn](https://www.linkedin.com/in/yash-singh-8b079b2b3)]
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

## 🔑 API Keys Used

- NASA Earthdata (https://urs.earthdata.nasa.gov/
- OpenWeatherMap (https://openweathermap.org/api)
- EPA AirNow (https://docs.airnowapi.org/)
- NASA TEMPO (https://www-air.larc.nasa.gov/missions/tempo/index.html)
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

**Programming Languages**
* Python 3.11Backend API development, NASA data integration, machine learning.
* JavaScript (Node.js 18+): NASA service integrations, real-time data processing.
* JavaScript (React): Frontend user interface, interactive visualizations.
* SQL: Database queries and data management.

**Frameworks and Libraries**
* FastAPI: High-performance Python web framework for REST API
* React 18: Modern frontend framework with hooks and context
* Tailwind CSS: Utility-first CSS framework for responsive design
* Axios: HTTP client for API communications
* Pandas/NumPy: Data analysis and scientific computing
* Scikit-learn: Machine learning algorithms and model training

**Databases and Storage**
* MongoDB: Primary database for air quality data and user preferences
* Redis: High-performance caching for real-time data access
* Azure Storage: Satellite imagery and historical data archival

**Cloud and Infrastructure**
* Docker: Containerization for consistent deployment
* Azure Container Instances: Scalable cloud hosting
* Azure Machine Learning: AI model training and deployment
* GitHub Actions: CI/CD pipeline for automated testing and deployment

**APIs and Services**
* NASA TEMPO API: Real-time satellite air quality measurements
* Microsoft Planetary Computer: Environmental and satellite imagery data
* Azure Cognitive Services: Advanced AI capabilities
* Meteomatics Weather API: Professional meteorological data

**Development Tools**
* Git/GitHub: Version control and collaboration
* VS Code: Integrated development environment
* Postman: API testing and documentation
* Jest: JavaScript testing framework
* Pytest: Python testing framework
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

---

## 🌟 Star This Project!

If you find this project useful, please give it a ⭐ on GitHub!

---

**Built with ❤️ for NASA Space Apps Challenge 2025**

*Making Air Quality Data Accessible, Actionable, and Accurate for Everyone* 🌍✨
