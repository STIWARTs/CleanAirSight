# 🔧 Technical Architecture & Implementation

## Overview

This document covers the technical architecture, implementation details, and engineering decisions made throughout the CleanAirSight project development. It serves as a comprehensive guide for developers and technical stakeholders.

## 🏗️ System Architecture

### **Overall Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React/Vite)  │◄──►│   (FastAPI)     │◄──►│   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static Files  │    │   External APIs │    │   File Storage  │
│   (Nginx)       │    │   (NASA/Weather)│    │   (Local/CSV)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Technology Stack**

#### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **Maps**: Leaflet with React-Leaflet
- **Icons**: Lucide React
- **HTTP Client**: Fetch API

#### Backend  
- **Framework**: FastAPI (Python 3.11+)
- **Database**: MongoDB with Motor (async driver)
- **Scheduling**: APScheduler
- **Email**: SMTP with HTML templates
- **Validation**: Pydantic v2
- **CORS**: FastAPI CORS middleware

#### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx (production)
- **Process Management**: Uvicorn
- **Data Storage**: CSV files + MongoDB

## 📁 Project Structure

```
CleanAirSight/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── EmailSubscription.jsx
│   │   │   ├── AirQualityMap.jsx
│   │   │   └── NotificationCenter.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MapView.jsx
│   │   │   ├── ForecastPage.jsx
│   │   │   └── SubscriptionPage.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   └── App.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── scheduler.py
│   ├── services/
│   │   └── email_service.py
│   ├── data_ingestion/
│   │   ├── tempo_client.py
│   │   ├── weather_client.py
│   │   └── ground_client.py
│   ├── data_processing/
│   │   ├── harmonizer.py
│   │   └── validator.py
│   ├── ml/
│   │   └── forecasting_engine.py
│   ├── requirements.txt
│   └── Dockerfile
├── data/
│   └── raw/
└── docker-compose.yml
```

## 🔌 API Architecture

### **FastAPI Backend Design**

#### Core Application Setup
```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

# Lifespan management for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await database.connect()
    scheduler.start_scheduler()
    yield
    # Shutdown
    scheduler.shutdown_scheduler()
    await database.disconnect()

app = FastAPI(
    title="CleanAirSight API",
    description="Air Quality Monitoring and Forecasting API",
    version="1.0.0",
    lifespan=lifespan
)
```

#### CORS Configuration
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### **API Endpoints**

#### Core Endpoints
```python
# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# AQI data
@app.get("/api/aqi/{location}")
async def get_aqi_data(location: str):
    return await aqi_service.get_location_data(location)

# Forecast data  
@app.get("/api/forecast/{location}")
async def get_forecast(location: str, days: int = 7):
    return await forecast_service.get_forecast(location, days)
```

#### Subscription Endpoints
```python
# Email subscription
@app.post("/api/subscribe")
async def subscribe_email(subscription: EmailSubscription):
    result = await database.create_subscriber(subscription)
    return {"message": "Subscription successful", "id": str(result.inserted_id)}

# Unsubscribe
@app.delete("/api/unsubscribe/{email}")
async def unsubscribe_email(email: str):
    await database.remove_subscriber(email)
    return {"message": "Unsubscribed successfully"}

# Email preview
@app.get("/api/subscribers/preview/{email}")
async def preview_email(email: str):
    return await email_service.generate_preview(email)
```

## 🗄️ Database Design

### **MongoDB Collections**

#### Subscribers Collection
```javascript
{
  "_id": ObjectId("..."),
  "email": "user@example.com",
  "location": {
    "city": "New York",
    "lat": 40.7128,
    "lon": -74.0060
  },
  "preferences": {
    "alert_threshold": 100,
    "send_time": "08:00",
    "frequency": "daily"
  },
  "subscription_status": "active",
  "created_at": ISODate("2025-01-01T00:00:00Z"),
  "last_sent": ISODate("2025-01-01T08:00:00Z")
}
```

#### AQI Data Collection
```javascript
{
  "_id": ObjectId("..."),
  "location": {
    "city": "Los Angeles",
    "lat": 34.0522,
    "lon": -118.2437
  },
  "timestamp": ISODate("2025-01-01T12:00:00Z"),
  "aqi": 85,
  "pollutants": {
    "pm25": 18.5,
    "pm10": 45.2,
    "no2": 32.1,
    "o3": 78.9,
    "co": 1.2,
    "so2": 5.8
  },
  "source": "NASA TEMPO",
  "confidence": 94
}
```

### **Database Indexes**
```python
# Performance optimization indexes
await db.subscribers.create_index([("email", 1)], unique=True)
await db.subscribers.create_index([("subscription_status", 1)])
await db.subscribers.create_index([("location.city", 1)])
await db.aqi_data.create_index([("location.city", 1), ("timestamp", -1)])
await db.aqi_data.create_index([("timestamp", -1)])
```

## 📧 Email Service Architecture

### **SMTP Configuration**
```python
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

class EmailService:
    def __init__(self):
        self.smtp_server = config.SMTP_SERVER
        self.smtp_port = config.SMTP_PORT
        self.sender_email = config.SENDER_EMAIL
        self.sender_password = config.SENDER_PASSWORD
    
    async def send_email(self, to_email: str, subject: str, html_content: str):
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.sender_email
            msg['To'] = to_email
            
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.send_message(msg)
                
            return True
        except Exception as e:
            logger.error(f"Email sending failed: {e}")
            return False
```

### **Email Template System**
```python
def generate_email_template(aqi_data: dict, subscriber: dict) -> str:
    template = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Daily AQI Alert</title>
        <style>
            .aqi-card { 
                background-color: {aqi_color}; 
                border-radius: 8px; 
                padding: 20px; 
                color: white; 
            }
            .health-advice { 
                background-color: #f8f9fa; 
                border-left: 4px solid {aqi_color}; 
                padding: 15px; 
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <h1>🌤️ Daily Air Quality Report</h1>
            <div class="aqi-card">
                <h2>AQI {aqi_value}</h2>
                <p>{aqi_level}</p>
                <p>{location}</p>
            </div>
            <div class="health-advice">
                <h3>Health Recommendations</h3>
                <p>{health_advice}</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return template.format(
        aqi_color=get_aqi_color(aqi_data['aqi']),
        aqi_value=aqi_data['aqi'],
        aqi_level=get_aqi_level(aqi_data['aqi']),
        location=subscriber['location']['city'],
        health_advice=get_health_advice(aqi_data['aqi'])
    )
```

## ⏰ Scheduling System

### **APScheduler Implementation**
```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

class DataScheduler:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        
    def start_scheduler(self):
        # Daily AQI alerts at 8:00 AM
        self.scheduler.add_job(
            send_daily_aqi_alerts,
            CronTrigger(hour=8, minute=0),
            id='daily_aqi_alerts',
            name='Send Daily AQI Alerts'
        )
        
        # Data ingestion every 4 hours
        self.scheduler.add_job(
            ingest_aqi_data,
            CronTrigger(minute=0, hour='*/4'),
            id='data_ingestion',
            name='Ingest AQI Data'
        )
        
        # Forecast updates twice daily
        self.scheduler.add_job(
            update_forecasts,
            CronTrigger(hour='6,18', minute=0),
            id='forecast_updates',
            name='Update Forecasts'
        )
        
        self.scheduler.start()
        logger.info("Scheduler started successfully")
```

### **Background Job Processing**
```python
async def send_daily_aqi_alerts():
    """Send daily AQI alerts to all active subscribers"""
    try:
        # Get all active subscribers
        subscribers = await db.subscribers.find(
            {"subscription_status": "active"}
        ).to_list(None)
        
        for subscriber in subscribers:
            # Get current AQI for subscriber's location
            aqi_data = await get_current_aqi(
                subscriber['location']['lat'],
                subscriber['location']['lon']
            )
            
            # Check if alert threshold is met
            if aqi_data['aqi'] >= subscriber['preferences']['alert_threshold']:
                # Generate and send email
                html_content = generate_email_template(aqi_data, subscriber)
                await email_service.send_email(
                    subscriber['email'],
                    f"AQI Alert: {aqi_data['aqi']} in {subscriber['location']['city']}",
                    html_content
                )
                
                # Update last_sent timestamp
                await db.subscribers.update_one(
                    {"email": subscriber['email']},
                    {"$set": {"last_sent": datetime.utcnow()}}
                )
        
        logger.info(f"Daily alerts sent to {len(subscribers)} subscribers")
        
    except Exception as e:
        logger.error(f"Error sending daily alerts: {e}")
```

## 🗺️ Frontend Architecture

### **React Component Structure**
```jsx
// Main App Component
function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="map" element={<MapView />} />
            <Route path="forecast" element={<ForecastPage />} />
            <Route path="subscribe" element={<SubscriptionPage />} />
            <Route path="about" element={<AboutPage />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}
```

### **State Management Pattern**
```jsx
// Custom hooks for state management
export function useAQIData(location) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await api.getAQIData(location);
        setData(response);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    if (location) {
      fetchData();
    }
  }, [location]);

  return { data, loading, error };
}
```

### **API Integration Layer**
```javascript
// utils/api.js
const API_BASE_URL = 'http://localhost:8000';

export const api = {
  async getAQIData(location) {
    const response = await fetch(`${API_BASE_URL}/api/aqi/${location}`);
    if (!response.ok) throw new Error('Failed to fetch AQI data');
    return response.json();
  },

  async subscribeEmail(subscription) {
    const response = await fetch(`${API_BASE_URL}/api/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });
    if (!response.ok) throw new Error('Subscription failed');
    return response.json();
  },

  async getForecast(location, days = 7) {
    const response = await fetch(`${API_BASE_URL}/api/forecast/${location}?days=${days}`);
    if (!response.ok) throw new Error('Failed to fetch forecast');
    return response.json();
  }
};
```

## 🐳 Docker Configuration

### **Multi-Stage Dockerfile (Frontend)**
```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### **Python Backend Dockerfile**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

### **Docker Compose Configuration**
```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      - REACT_APP_API_URL=http://localhost:8000

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - mongodb
      - redis
    environment:
      - MONGODB_URL=mongodb://mongodb:27017/cleanairsight
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./data:/app/data
      - ./backend:/app
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

  mongodb:
    image: mongo:7-jammy
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=cleanairsight

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mongodb_data:
  redis_data:
```

## 🔒 Security Implementation

### **Input Validation**
```python
from pydantic import BaseModel, EmailStr, validator

class EmailSubscription(BaseModel):
    email: EmailStr
    city: str
    lat: float
    lon: float
    alert_threshold: int

    @validator('lat')
    def validate_latitude(cls, v):
        if not -90 <= v <= 90:
            raise ValueError('Latitude must be between -90 and 90')
        return v

    @validator('lon')
    def validate_longitude(cls, v):
        if not -180 <= v <= 180:
            raise ValueError('Longitude must be between -180 and 180')
        return v

    @validator('alert_threshold')
    def validate_threshold(cls, v):
        if not 0 <= v <= 500:
            raise ValueError('Alert threshold must be between 0 and 500')
        return v
```

### **Environment Configuration**
```python
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    mongodb_url: str = "mongodb://localhost:27017/cleanairsight"
    
    # Email
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    sender_email: str
    sender_password: str
    
    # API Keys
    tempo_api_key: str = ""
    weather_api_key: str = ""
    
    # Security
    secret_key: str
    allowed_origins: list = ["http://localhost:3000", "http://localhost:5173"]

    class Config:
        env_file = ".env"

settings = Settings()
```

## 📊 Performance Optimization

### **Database Query Optimization**
```python
# Efficient aggregation pipeline
async def get_location_aqi_stats(location: str):
    pipeline = [
        {"$match": {"location.city": location}},
        {"$sort": {"timestamp": -1}},
        {"$limit": 1000},
        {"$group": {
            "_id": None,
            "avg_aqi": {"$avg": "$aqi"},
            "max_aqi": {"$max": "$aqi"},
            "min_aqi": {"$min": "$aqi"},
            "latest": {"$first": "$$ROOT"}
        }}
    ]
    
    result = await db.aqi_data.aggregate(pipeline).to_list(1)
    return result[0] if result else None
```

### **Frontend Performance**
```jsx
// Lazy loading and code splitting
const MapView = lazy(() => import('./pages/MapView'));
const ForecastPage = lazy(() => import('./pages/ForecastPage'));

// Memoization for expensive calculations
const AQIDisplay = memo(({ aqi }) => {
  const color = useMemo(() => getAQIColor(aqi), [aqi]);
  const level = useMemo(() => getAQILevel(aqi), [aqi]);
  
  return (
    <div style={{ backgroundColor: color }}>
      AQI {aqi} - {level}
    </div>
  );
});
```

## 🔮 Future Architecture Considerations

### **Microservices Migration**
- **API Gateway**: Kong or AWS API Gateway
- **Service Mesh**: Istio for service communication
- **Message Queue**: RabbitMQ or Apache Kafka
- **Monitoring**: Prometheus + Grafana

### **Scalability Improvements**
- **Database Sharding**: MongoDB sharded clusters
- **Caching Layer**: Redis cluster for session data
- **CDN Integration**: CloudFlare for static assets
- **Load Balancing**: Nginx or HAProxy

### **Cloud-Native Deployment**
- **Kubernetes**: Container orchestration
- **Helm Charts**: Application packaging
- **CI/CD Pipeline**: GitHub Actions or GitLab CI
- **Infrastructure as Code**: Terraform

---

## 🏗️ **Solid Technical Foundation Built!**

CleanAirSight now has:
- **Scalable architecture** ready for production
- **Robust backend** with proper error handling
- **Efficient database** design with optimized queries
- **Modern frontend** with best practices
- **Professional deployment** setup with Docker

**The technical foundation is enterprise-ready and built for scale! 🚀**