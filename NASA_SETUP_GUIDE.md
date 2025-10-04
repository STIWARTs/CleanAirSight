# 🚀 NASA API Keys Setup Guide
## CleanAirSight - Real NASA Data Integration

This guide helps you claim all Global Offers and set up API keys for real NASA data integration.

## 📋 Step-by-Step Setup Checklist

### 🎯 **Phase 1: Claim Global Offers (Do This First!)**

#### 1. Microsoft Azure ($200 Credit) - **PRIORITY 1**
- [ ] Visit: https://azure.microsoft.com/free/
- [ ] Click "Claim Offer" → "Start free"
- [ ] Sign up with phone + credit card (won't be charged)
- [ ] **Copy these values to .env:**
  - `AZURE_SUBSCRIPTION_ID`
  - `AZURE_TENANT_ID` 
  - `AZURE_CLIENT_ID`
  - `AZURE_CLIENT_SECRET`

#### 2. Microsoft Planetary Computer (FREE) - **PRIORITY 1**
- [ ] Visit: https://planetarycomputer.microsoft.com/
- [ ] No signup required for public data!
- [ ] Already configured in .env:
  - `PLANETARY_COMPUTER_BASE_URL=https://planetarycomputer.microsoft.com/api/data/v1`

#### 3. Google Cloud ($300 Credit) - **PRIORITY 2**
- [ ] Visit: https://cloud.google.com/free/
- [ ] Click "Claim Offer" → "Get started for free"
- [ ] Create project: `cleanairsight-nasa-challenge`
- [ ] **Copy these values to .env:**
  - `GOOGLE_CLOUD_PROJECT_ID`
  - `GOOGLE_MAPS_API_KEY` (enable Maps JavaScript API)
  - Download service account JSON

#### 4. Meteomatics Weather API (FREE during NASA Challenge)
- [ ] Visit: https://www.meteomatics.com/en/weather-api/
- [ ] Fill contact form mentioning "NASA Space Apps Challenge 2025"
- [ ] **Copy these values to .env:**
  - `METEOMATICS_USERNAME`
  - `METEOMATICS_PASSWORD`

### 🛰️ **Phase 2: NASA APIs (Real Satellite Data)**

#### 5. NASA Earthdata Login - **REQUIRED**
- [ ] Visit: https://urs.earthdata.nasa.gov/users/new
- [ ] Create free account
- [ ] **Copy these values to .env:**
  - `NASA_EARTHDATA_USERNAME`
  - `NASA_EARTHDATA_PASSWORD`

#### 6. NASA TEMPO API - **NEW SATELLITE**
- [ ] Visit: https://air-quality.gsfc.nasa.gov/
- [ ] Request API access (mention NASA Space Apps Challenge)
- [ ] **Copy these values to .env:**
  - `NASA_TEMPO_API_KEY`

#### 7. EPA AirNow API (US Government Data)
- [ ] Visit: https://docs.airnowapi.org/account/request/
- [ ] Request free API key
- [ ] **Copy these values to .env:**
  - `EPA_AIRNOW_API_KEY`

### 🤖 **Phase 3: AI/ML Services**

#### 8. Azure Machine Learning
- [ ] In Azure Portal: Create ML Workspace
- [ ] Deploy air quality prediction model
- [ ] **Copy these values to .env:**
  - `AZURE_ML_ENDPOINT`
  - `AZURE_ML_API_KEY`

#### 9. Azure Cognitive Services
- [ ] In Azure Portal: Create Cognitive Services resource
- [ ] **Copy these values to .env:**
  - `AZURE_COGNITIVE_SERVICES_KEY`
  - `AZURE_COGNITIVE_SERVICES_ENDPOINT`

### 📧 **Phase 4: Communication Services**

#### 10. SendGrid (Email Alerts)
- [ ] Visit: https://sendgrid.com/free/
- [ ] Create free account (100 emails/day)
- [ ] **Copy these values to .env:**
  - `SENDGRID_API_KEY`

### 🔧 **Phase 5: Setup .env Files**

#### Backend .env Setup:
```bash
# Copy the example file
cp backend/.env.example backend/.env

# Edit with your actual keys
nano backend/.env  # or use VS Code
```

#### Frontend .env Setup:
```bash
# Copy the example file  
cp frontend/.env.example frontend/.env

# Edit with your actual keys
nano frontend/.env  # or use VS Code
```

## ⚡ **Quick Start Commands**

After setting up all API keys:

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start with real NASA data
docker-compose up -d

# Verify real data integration
curl http://localhost:3001/api/current?lat=34.0522&lon=-118.2437
```

## 🎯 **Priority Order for Implementation**

### **Start Today (October 4):**
1. ✅ Azure ($200 credit) - Cloud infrastructure
2. ✅ Planetary Computer - NASA environmental data
3. ✅ NASA Earthdata - Satellite data access
4. ✅ Meteomatics - Weather API

### **Tomorrow (October 5):**
5. Google Cloud ($300 credit) - Additional ML
6. NASA TEMPO API - Latest satellite data
7. Azure ML - AI predictions
8. SendGrid - Email alerts

## 🔒 **Security Notes**

- ❌ **NEVER** commit `.env` files to Git
- ✅ Keep `.env.example` updated for team
- ✅ Use different keys for dev/prod
- ✅ Rotate keys after hackathon

## 🏆 **Expected Results**

After setup, CleanAirSight will have:
- ✅ Real NASA TEMPO satellite data
- ✅ AI-powered 48-hour forecasts  
- ✅ Global air quality coverage
- ✅ Live updates every hour
- ✅ Professional ML predictions

## 🆘 **Support Contacts**

- **Azure**: NASACloudSolutions@microsoft.com
- **Planetary Computer**: planetarycomputer@microsoft.com  
- **Google Cloud**: cloudstartupsupport@google.com
- **Meteomatics**: api@meteomatics.com

---

## 🚀 **Ready to implement real NASA data?**

Once you've added all the API keys to your `.env` files, let me know and I'll start implementing the NASA TEMPO integration!