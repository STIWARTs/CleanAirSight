# 🚀 Production Deployment Instructions

## Quick Fix for Your Production Server

Your local fixes are now ready to deploy! Follow these steps on your **Azure VM**:

### 1. Connect to Your Azure VM
```bash
ssh azureuser@cleanairsight.earth
# or
ssh azureuser@4.240.98.203
```

### 2. Navigate to Project and Pull Latest Changes
```bash
cd /home/azureuser/CleanAirSights
git pull origin main
```

### 3. Make Deployment Script Executable
```bash
chmod +x deploy/deploy-production.sh
```

### 4. Run the Deployment Script
```bash
cd deploy
sudo ./deploy-production.sh
```

### 5. Monitor the Deployment
The script will:
- ✅ Stop existing containers
- ✅ Pull latest code with all fixes
- ✅ Rebuild containers with new configuration
- ✅ Start services with error handling
- ✅ Test API endpoints
- ✅ Show status and logs

---

## Alternative Manual Deployment (if script fails)

If the automated script has issues, run these commands manually:

```bash
# Navigate to project
cd /home/azureuser/CleanAirSights

# Pull latest changes
git pull origin main

# Stop existing containers
cd deploy
sudo docker-compose -f docker-compose.prod.yml down --remove-orphans

# Clean up
sudo docker container prune -f

# Build and start with fixes
sudo docker-compose -f docker-compose.prod.yml build --no-cache
sudo docker-compose -f docker-compose.prod.yml up -d

# Wait and check status
sleep 15
sudo docker-compose -f docker-compose.prod.yml ps
```

---

## Testing After Deployment

After deployment, test these endpoints:

1. **Health Check:**
   ```bash
   curl https://cleanairsight.earth/health
   ```

2. **API Current Data:**
   ```bash
   curl https://cleanairsight.earth/api/current
   ```

3. **Direct Backend Test:**
   ```bash
   sudo docker exec cleanairsight-backend curl http://localhost:8000/api/current
   ```

---

## If SSL Issues Persist

If you still see SSL certificate errors after deployment:

```bash
# Restore SSL certificates
sudo certbot certonly --nginx -d cleanairsight.earth -d www.cleanairsight.earth

# Copy certificates to nginx directory
sudo mkdir -p /home/azureuser/CleanAirSights/deploy/nginx/ssl
sudo cp /etc/letsencrypt/live/cleanairsight.earth/fullchain.pem /home/azureuser/CleanAirSights/deploy/nginx/ssl/
sudo cp /etc/letsencrypt/live/cleanairsight.earth/privkey.pem /home/azureuser/CleanAirSights/deploy/nginx/ssl/

# Update docker-compose to use SSL config
cd /home/azureuser/CleanAirSights/deploy
sudo sed -i 's/nginx-http-only.conf/nginx.conf/' docker-compose.prod.yml
sudo sed -i '/nginx_logs:\/var\/log\/nginx/i\      - ./nginx/ssl:/etc/nginx/ssl' docker-compose.prod.yml

# Restart with SSL
sudo docker-compose -f docker-compose.prod.yml down
sudo docker-compose -f docker-compose.prod.yml up -d
```

---

## Monitoring Commands

```bash
# Check all container status
sudo docker-compose -f docker-compose.prod.yml ps

# View backend logs
sudo docker-compose -f docker-compose.prod.yml logs -f backend

# View nginx logs
sudo docker-compose -f docker-compose.prod.yml logs -f nginx

# View all logs
sudo docker-compose -f docker-compose.prod.yml logs -f
```

---

## Expected Results

After successful deployment, you should see:
- ✅ All containers running (not restarting)
- ✅ Backend returning JSON data instead of 502 errors
- ✅ Frontend loading data successfully
- ✅ No more "Failed to load resource" errors in browser console

The fixes include:
- 🔧 Proper error handling to prevent crashes
- 🔧 Fixed environment variable loading
- 🔧 Added missing system dependencies
- 🔧 Fixed port conflicts
- 🔧 Improved CORS configuration
- 🔧 Stable container networking