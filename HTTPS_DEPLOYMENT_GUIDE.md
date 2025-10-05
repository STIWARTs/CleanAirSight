# CleanAirSights HTTPS Deployment Guide

## Complete Step-by-Step Process to Deploy CleanAirSights with HTTPS

This guide will walk you through deploying your CleanAirSights application on Azure VM with full HTTPS support using Let's Encrypt SSL certificates.

---

## 📋 Prerequisites

- ✅ Azure VM (Ubuntu 24.04 LTS recommended)
- ✅ Domain from GoDaddy (cleanairsight.earth)
- ✅ GitHub repository with your code
- ✅ API keys (NASA Earthdata, OpenWeatherMap, etc.)

---

## 🖥️ Step 1: Azure VM Setup

### 1.1 Create Azure VM
```bash
# VM Specifications:
- OS: Ubuntu 24.04 LTS
- Size: Standard B2s (2 vCPUs, 4 GB RAM) minimum
- Public IP: Static
- SSH Key: Generate or use existing
```

### 1.2 Configure Azure Network Security Group
Add these inbound port rules in Azure Portal:

| Priority | Name | Port | Protocol | Source | Destination | Action |
|----------|------|------|----------|--------|-------------|---------|
| 300 | SSH | 22 | TCP | Any | Any | Allow |
| 310 | Allow-HTTP | 80 | TCP | Any | Any | Allow |
| 320 | Allow-HTTPS | 443 | TCP | Any | Any | Allow |

---

## 🌐 Step 2: DNS Configuration (GoDaddy)

### 2.1 Configure DNS Records
1. Login to GoDaddy DNS Management
2. Go to cleanairsight.earth domain settings
3. Add these A records:

```
Type: A
Name: @
Value: YOUR_AZURE_VM_IP (e.g., 4.240.98.203)
TTL: 1 Hour

Type: A
Name: www
Value: YOUR_AZURE_VM_IP (e.g., 4.240.98.203)
TTL: 1 Hour
```

### 2.2 Verify DNS Propagation
```bash
# From your local machine
nslookup cleanairsight.earth
ping cleanairsight.earth
```

---

## 🔧 Step 3: Server Setup on Azure VM

### 3.1 Initial Server Setup
```bash
# SSH into your Azure VM
ssh azureuser@YOUR_VM_IP

# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git htop unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
```

### 3.2 Install Docker and Docker Compose
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER

# Install Docker Compose
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js and Python
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs python3 python3-pip python3-venv

# Log out and back in for Docker permissions
exit
# SSH back in
ssh azureuser@YOUR_VM_IP
```

### 3.3 Install Nginx and Certbot
```bash
sudo apt install -y nginx certbot python3-certbot-nginx

# Configure firewall
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

---

## 📦 Step 4: Clone and Configure Project

### 4.1 Clone Repository
```bash
# Create project directory
sudo mkdir -p /opt/cleanairsights
sudo chown $USER:$USER /opt/cleanairsights

# Clone project
cd /opt/cleanairsights
git clone https://github.com/STIWARTs/CleanAirSights.git .
```

### 4.2 Configure Environment Variables
```bash
# Copy example environment file
cp .env.prod.example .env.prod

# Edit with your actual values
nano .env.prod
```

**Complete .env.prod configuration:**
```env
# Production Environment Variables
DOMAIN=cleanairsight.earth

# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=CleanAir2025SecurePass!

# NASA Earthdata Credentials
NASA_EARTHDATA_USERNAME=your_nasa_username
NASA_EARTHDATA_PASSWORD=your_nasa_password

# OpenAQ API
OPENAQ_API_KEY=your_openaq_key

# EPA AirNow API
AIRNOW_API_KEY=your_airnow_key

# OpenWeatherMap API
OPENWEATHER_API_KEY=your_openweather_key

# Email Service Configuration
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your_gmail_app_password
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587

# Database Configuration
MONGODB_URI=mongodb://admin:CleanAir2025SecurePass!@mongodb:27017/cleanairsight?authSource=admin
REDIS_URL=redis://redis:6379

# Security
SECRET_KEY=CleanAirSights2025_SecureKey_f8d4c9e7b2a1x6m3n5k9p8q4r7t2w6y1z3

# Application Settings
ENVIRONMENT=production
DEBUG=false
API_HOST=0.0.0.0
API_PORT=8000

# CORS Settings (Both HTTP and HTTPS)
ALLOWED_ORIGINS=https://cleanairsight.earth,https://www.cleanairsight.earth,http://cleanairsight.earth,http://www.cleanairsight.earth

# Frontend API URL
VITE_API_URL=https://cleanairsight.earth/api

# SSL/TLS
SSL_CERT_PATH=/etc/nginx/ssl/fullchain.pem
SSL_KEY_PATH=/etc/nginx/ssl/privkey.pem
```

---

## 🚀 Step 5: Deploy HTTP First (Testing)

### 5.1 Deploy Temporary HTTP Version
```bash
# Copy environment file to deploy directory
cp .env.prod deploy/

# Navigate to deploy directory
cd deploy

# Deploy HTTP version first for testing
sudo docker-compose -f docker-compose.temp.yml --env-file .env.prod up -d --build

# Check status
sudo docker-compose -f docker-compose.temp.yml ps

# Test HTTP access
curl -I http://localhost
```

### 5.2 Verify HTTP Access
- Test in browser: `http://cleanairsight.earth`
- Should show your application running

---

## 🔒 Step 6: Enable HTTPS with SSL Certificate

### 6.1 Stop HTTP Services and Get SSL Certificate
```bash
# Stop temporary deployment
cd /opt/cleanairsights/deploy
sudo docker-compose -f docker-compose.temp.yml down

# Stop nginx if running
sudo systemctl stop nginx

# Get SSL certificate from Let's Encrypt
sudo certbot certonly --standalone -d cleanairsight.earth -d www.cleanairsight.earth --email your-email@gmail.com --agree-tos --no-eff-email
```

### 6.2 Copy SSL Certificates for Docker
```bash
# Create SSL directory for Docker containers
sudo mkdir -p /opt/cleanairsights/deploy/nginx/ssl

# Copy certificates
sudo cp /etc/letsencrypt/live/cleanairsight.earth/fullchain.pem /opt/cleanairsights/deploy/nginx/ssl/
sudo cp /etc/letsencrypt/live/cleanairsight.earth/privkey.pem /opt/cleanairsights/deploy/nginx/ssl/

# Set proper ownership
sudo chown -R azureuser:azureuser /opt/cleanairsights/deploy/nginx/ssl
```

---

## 🔧 Step 7: Deploy Full HTTPS Configuration

### 7.1 Deploy with HTTPS
```bash
# Navigate to deploy directory
cd /opt/cleanairsights/deploy

# Update nginx config with your domain
sudo sed -i 's/your-domain.com/cleanairsight.earth/g' nginx/nginx.conf

# Deploy with full HTTPS configuration
sudo docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

### 7.2 Verify HTTPS Deployment
```bash
# Check container status
sudo docker-compose -f docker-compose.prod.yml ps

# Check logs
sudo docker-compose -f docker-compose.prod.yml logs

# Test HTTPS locally
curl -I https://localhost
curl -I http://localhost  # Should redirect to HTTPS
```

---

## ✅ Step 8: Final Verification

### 8.1 Test Your Deployment
Visit these URLs:
- ✅ `http://cleanairsight.earth` → Should redirect to HTTPS
- ✅ `https://cleanairsight.earth` → Should show your application with SSL lock
- ✅ `https://www.cleanairsight.earth` → Should also work with SSL

### 8.2 Check SSL Certificate
```bash
# Verify certificate details
sudo certbot certificates

# Check certificate expiration
openssl x509 -in /etc/letsencrypt/live/cleanairsight.earth/fullchain.pem -text -noout | grep "Not After"
```

---

## 🔄 Step 9: Setup SSL Auto-Renewal

### 9.1 Create Renewal Script
```bash
# Create renewal script
cat > /opt/cleanairsights/renew-ssl.sh << 'EOF'
#!/bin/bash
cd /opt/cleanairsights/deploy

# Stop nginx container
docker-compose -f docker-compose.prod.yml stop nginx

# Renew certificate
certbot renew --standalone

# Copy new certificates
sudo cp /etc/letsencrypt/live/cleanairsight.earth/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/cleanairsight.earth/privkey.pem ./nginx/ssl/
sudo chown -R azureuser:azureuser ./nginx/ssl/

# Restart nginx
docker-compose -f docker-compose.prod.yml start nginx
EOF

chmod +x /opt/cleanairsights/renew-ssl.sh
```

### 9.2 Setup Automatic Renewal
```bash
# Add to crontab for automatic renewal
(crontab -l 2>/dev/null; echo "0 12 * * * /opt/cleanairsights/renew-ssl.sh") | crontab -

# Verify crontab
crontab -l
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. SSL Certificate Generation Fails
```bash
# Check DNS resolution
nslookup cleanairsight.earth

# Ensure ports 80 and 443 are open
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# Check firewall
sudo ufw status
```

#### 2. Container Won't Start
```bash
# Check logs
sudo docker-compose -f docker-compose.prod.yml logs [service-name]

# Check environment variables
sudo docker-compose -f docker-compose.prod.yml config
```

#### 3. Frontend Build Issues
```bash
# Rebuild frontend container
sudo docker-compose -f docker-compose.prod.yml build frontend --no-cache
```

#### 4. API Not Accessible
```bash
# Check backend logs
sudo docker-compose -f docker-compose.prod.yml logs backend

# Test API directly
curl -I http://localhost:8000
```

---

## 📊 Monitoring and Maintenance

### Daily Monitoring Commands
```bash
# Check container status
sudo docker-compose -f /opt/cleanairsights/deploy/docker-compose.prod.yml ps

# Check logs
sudo docker-compose -f /opt/cleanairsights/deploy/docker-compose.prod.yml logs --tail=50

# Check system resources
htop
df -h

# Check SSL certificate expiry
sudo certbot certificates
```

### Regular Maintenance
```bash
# Update system packages (monthly)
sudo apt update && sudo apt upgrade -y

# Clean Docker resources (weekly)
sudo docker system prune -af

# Backup database (daily)
sudo docker exec cleanairsight-mongodb mongodump --out /data/backup/$(date +%Y%m%d)
```

---

## 🎉 Success!

Your CleanAirSights application is now deployed with:
- ✅ **HTTPS SSL Certificate** (Let's Encrypt)
- ✅ **HTTP to HTTPS Redirect**
- ✅ **Production Docker Configuration**
- ✅ **Automatic SSL Renewal**
- ✅ **Secure Environment Variables**
- ✅ **MongoDB with Authentication**
- ✅ **Redis Caching**
- ✅ **Nginx Reverse Proxy**

**Your application is now live at:**
- 🌐 **https://cleanairsight.earth**
- 🌐 **https://www.cleanairsight.earth**

---

## � Advanced Troubleshooting

### Common Nginx Configuration Issues

#### Issue: "proxy_pass cannot have URI part" Error
**Symptoms:**
```
nginx: [emerg] "proxy_pass" cannot have URI part in location given by regular expression, or inside named location, or inside "if" statement, or inside "limit_except" block
```

**Solution:**
1. Check nginx.conf for these patterns:
   - `proxy_pass http://frontend/;` in `@fallback` named locations
   - `proxy_pass http://backend/;` in regex locations `~*`

2. Fix by removing trailing slash:
   ```nginx
   # ❌ Wrong - has URI part (/)
   location @fallback {
       proxy_pass http://frontend/;
   }
   
   # ✅ Correct - no URI part
   location @fallback {
       proxy_pass http://frontend;
   }
   ```

#### Issue: Environment Variables Not Loading
**Symptoms:**
```
WARN[0000] The "MONGO_ROOT_PASSWORD" variable is not set. Defaulting to a blank string.
```

**Solutions:**
1. Verify `.env.prod` file exists and has correct format:
   ```bash
   cd /opt/cleanairsights/deploy
   ls -la .env.prod
   cat .env.prod | head -5
   ```

2. Ensure `env_file` is added to all services that need it:
   ```yaml
   services:
     mongodb:
       # ... other config
       env_file:
         - ../.env.prod
   ```

3. Copy environment file correctly:
   ```bash
   # ❌ Wrong - missing dot
   cp ../env.prod .
   
   # ✅ Correct
   cp ../.env.prod .
   ```

#### Issue: Deprecated HTTP2 Directive
**Symptoms:**
```
nginx: [warn] the "listen ... http2" directive is deprecated
```

**Solution:**
Replace in nginx.conf:
```nginx
# ❌ Old syntax
listen 443 ssl http2;

# ✅ New syntax
listen 443 ssl;
http2 on;
```

### Container Debugging Commands

```bash
# Test nginx configuration syntax
sudo docker run --rm -v "$(pwd)/nginx/nginx.conf:/etc/nginx/nginx.conf:ro" nginx:alpine nginx -t

# Check container logs
sudo docker-compose -f docker-compose.prod.yml logs nginx
sudo docker-compose -f docker-compose.prod.yml logs backend
sudo docker-compose -f docker-compose.prod.yml logs frontend

# Check container status
sudo docker-compose -f docker-compose.prod.yml ps

# Restart specific container
sudo docker-compose -f docker-compose.prod.yml restart nginx

# Force recreate containers
sudo docker-compose -f docker-compose.prod.yml down
sudo docker-compose -f docker-compose.prod.yml up -d --force-recreate

# Check SSL certificate mounting
sudo docker exec cleanairsight-nginx ls -la /etc/nginx/ssl/

# Check environment variables inside container
sudo docker exec cleanairsight-nginx env | grep DOMAIN
```

### SSL Certificate Issues

```bash
# Check SSL certificate status
sudo certbot certificates

# Renew SSL certificate manually
sudo certbot renew --dry-run

# Check certificate expiration
openssl x509 -in /etc/letsencrypt/live/cleanairsight.earth/cert.pem -noout -dates

# Test SSL configuration
openssl s_client -connect cleanairsight.earth:443 -servername cleanairsight.earth
```

### System Nginx Alternative

If Docker nginx keeps failing, use system nginx:

```bash
# Install system nginx
sudo apt update
sudo apt install nginx

# Stop Docker nginx
sudo docker-compose -f docker-compose.prod.yml stop nginx

# Copy nginx config to system
sudo cp nginx/nginx.conf /etc/nginx/sites-available/cleanairsight
sudo ln -s /etc/nginx/sites-available/cleanairsight /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Copy SSL certificates
sudo mkdir -p /etc/nginx/ssl
sudo cp /etc/letsencrypt/live/cleanairsight.earth/fullchain.pem /etc/nginx/ssl/
sudo cp /etc/letsencrypt/live/cleanairsight.earth/privkey.pem /etc/nginx/ssl/

# Test and start nginx
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl start nginx
```

## �📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review container logs: `sudo docker-compose logs`
3. Verify DNS propagation: `nslookup cleanairsight.earth`
4. Check SSL certificate: `sudo certbot certificates`

**Cost Estimation:**
- Azure VM: $20-40/month
- Domain: $12-15/year (already owned)
- SSL Certificate: Free (Let's Encrypt)
- **Total: ~$20-40/month**