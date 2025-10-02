# 📊 API Rate Limits & Cost Management

**Important**: Free API tiers have limits. Here's how to avoid exceeding them during development.

---

## 🚨 Your Concern: API Limits

### **Current Situation:**
Your backend fetches data every:
- **TEMPO**: 60 minutes (24 calls/day)
- **Ground sensors**: 15 minutes (96 calls/day)
- **Weather**: 60 minutes (24 calls/day)

**Total**: ~144 API calls per day (when running continuously)

---

## 📉 API Rate Limits (Free Tiers)

### 1. NASA Earthdata (TEMPO)
- **Limit**: Varies by endpoint
- **Typical**: 100-1000 requests/hour
- **Current Usage**: 24 requests/day ✅ Safe
- **Notes**: NASA is generally generous with limits

### 2. OpenAQ API
- **Limit**: 10,000 requests/month
- **Current Usage**: ~2,880 requests/month (96/day × 30 days)
- **Status**: ✅ Within limit
- **URL**: https://docs.openaq.org/

### 3. EPA AirNow
- **Limit**: No official limit for registered users
- **Notes**: Request an API key (1-2 days)
- **Current Usage**: ~720 requests/month
- **Status**: ✅ Safe

### 4. OpenWeatherMap
- **Free Tier**: 1,000 calls/day OR 60 calls/minute
- **Current Usage**: 24 calls/day ✅ Plenty of headroom
- **Upgrade**: $0.0015 per call after limit
- **URL**: https://openweathermap.org/price

---

## ✅ Solution: Development vs Production Mode

I just added **two modes** to your config:

### **Development Mode** (Saves API Quota)
```bash
# Add to your .env file
ENVIRONMENT=development
```

**Refresh Intervals:**
- TEMPO: Every **4 hours** (6 calls/day)
- Ground: Every **1 hour** (24 calls/day)  
- Weather: Every **2 hours** (12 calls/day)

**Total**: ~42 calls/day (70% reduction!)

### **Production Mode** (Real-time Updates)
```bash
# Add to your .env file
ENVIRONMENT=production
```

**Refresh Intervals:**
- TEMPO: Every **1 hour** (24 calls/day)
- Ground: Every **15 minutes** (96 calls/day)
- Weather: Every **1 hour** (24 calls/day)

**Total**: ~144 calls/day

---

## 🛠️ How to Enable Development Mode

### **Step 1: Edit .env file**
```bash
# Open .env
notepad .env  # Windows
nano .env     # Linux/Mac
```

### **Step 2: Add this line**
```env
ENVIRONMENT=development
```

### **Step 3: Restart backend**
```bash
docker-compose restart backend
```

### **Step 4: Verify**
Check the logs:
```bash
docker-compose logs backend --tail=10
```

You should see:
```
INFO - Running in DEVELOPMENT mode
INFO - TEMPO refresh: 240 minutes
INFO - Ground refresh: 60 minutes  
INFO - Weather refresh: 120 minutes
```

---

## 💡 Additional Cost-Saving Tips

### 1. **Stop Backend When Not Testing**
```bash
# Stop backend only (keeps DB running)
docker-compose stop backend

# Start when needed
docker-compose start backend
```

### 2. **Use Cached Data**
The backend stores data in MongoDB. Even if you stop the scheduler, the API can serve cached data.

### 3. **Manual Refresh Only**
Comment out scheduler jobs in `backend/scheduler.py`:

```python
def start(self):
    logger.info("Scheduler disabled for testing")
    # Comment out these lines:
    # self.scheduler.add_job(...)
    # self.scheduler.start()
```

### 4. **Test with Demo Data**
The backend returns demo data when database is empty (already implemented).

### 5. **Monitor API Usage**

#### OpenWeatherMap Dashboard:
```
https://home.openweathermap.org/api_keys
```

#### OpenAQ Usage:
```bash
# Check your usage in logs
docker-compose logs backend | grep "OpenAQ"
```

---

## 📊 Cost Breakdown

### Free Tier (All APIs)
- **Cost**: $0/month
- **Limits**: Sufficient for development
- **Usage**: 42-144 calls/day

### If You Exceed (Unlikely)

#### OpenWeatherMap
- **Free**: 1,000 calls/day
- **Paid**: $40/month for 100,000 calls
- **Cost per call**: $0.0004

#### Others
- NASA TEMPO: Free (no limits)
- OpenAQ: Free (generous limits)
- EPA AirNow: Free (government service)

---

## 🎯 Recommended Setup

### During Development (Right Now)
```env
ENVIRONMENT=development
```
- Saves API quota
- Still functional
- Updates every 1-4 hours
- Good for testing UI

### Before Demo/Presentation
```env
ENVIRONMENT=production  
```
- Real-time updates
- Shows fresh data
- Live monitoring experience
- Run 1-2 hours before demo

### For Hackathon Submission
```env
ENVIRONMENT=production
```
- Full functionality
- Impresses judges
- Shows real-time capabilities

---

## 📈 Usage Monitoring

### Backend Logs
```bash
# See all API calls
docker-compose logs backend | grep "Fetching"
```

### MongoDB Data Count
```bash
# Check how much data is stored
docker-compose exec mongodb mongosh cleanairsight
db.harmonized_data.countDocuments()
```

### Redis Cache Stats
```bash
# Check cache usage
docker-compose exec redis redis-cli INFO stats
```

---

## 🚀 Best Practice Workflow

### **Week 1-2: Development**
```bash
ENVIRONMENT=development
# Work on frontend/UI
# Use cached/demo data
# API calls: ~42/day
```

### **Week 3: Testing**
```bash
ENVIRONMENT=production
# Test for 1-2 hours/day
# Let data accumulate
# API calls: ~144/day when running
```

### **Demo Day**
```bash
ENVIRONMENT=production
# Start 2 hours before demo
# Fresh, real-time data
# Stop after demo
```

---

## 🔧 Emergency: Exceeded Limits

### If OpenWeatherMap blocks you:
1. Create new free account (different email)
2. Get new API key
3. Update `.env`
4. Restart backend

### If OpenAQ blocks you:
- Unlikely (10k/month limit)
- Use cached data from MongoDB
- Falls back to demo data

### If NASA TEMPO blocks you:
- Very unlikely (generous limits)
- Use ground sensors only
- Demo data fallback

---

## 📊 Current Configuration

### Your .env should have:
```env
# API Keys
NASA_EARTHDATA_USERNAME=your_username
NASA_EARTHDATA_PASSWORD=your_password
OPENWEATHER_API_KEY=your_key
AIRNOW_API_KEY=optional
OPENAQ_API_KEY=optional

# Environment Mode (ADD THIS!)
ENVIRONMENT=development  # or production

# Database
MONGODB_URI=mongodb://mongodb:27017/cleanairsight
REDIS_URL=redis://redis:6379

# CORS
CORS_ORIGINS=http://localhost:3000
```

---

## ✅ Summary

### **Your Problem**: API limits get exceeded quickly

### **Solution Implemented**:
1. ✅ Development mode (4 hours / 1 hour / 2 hours intervals)
2. ✅ Production mode (1 hour / 15 min / 1 hour intervals)
3. ✅ Easy toggle via `.env` file
4. ✅ 70% reduction in API calls during development

### **Action Required**:
```bash
# 1. Add to .env
echo "ENVIRONMENT=development" >> .env

# 2. Restart backend
docker-compose restart backend

# 3. Verify
docker-compose logs backend --tail=20
```

---

## 📞 Need Help?

- Check OpenWeatherMap dashboard for usage
- Monitor backend logs for API calls
- Switch to development mode during coding
- Switch to production mode for demos

**You're now safe from API limits! 🎉**
