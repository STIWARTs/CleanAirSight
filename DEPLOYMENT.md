# CleanAirSights Deployment Guide

This guide will help you deploy CleanAirSights to a production server using your GoDaddy domain.

## Prerequisites

1. **VPS/Cloud Server** (recommended providers):
   - DigitalOcean Droplet ($6-12/month)
   - AWS EC2 t3.micro/small
   - Vultr Cloud Compute
   - Linode Nanode
   - Minimum specs: 2GB RAM, 1 CPU, 25GB SSD

2. **Domain from GoDaddy**
3. **Server with Docker installed**

## Quick Deployment Steps

### 1. Server Setup

```bash
# Connect to your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Git
apt install git -y
```

### 2. Clone and Deploy

```bash
# Clone your repository
git clone https://github.com/STIWARTs/CleanAirSights.git
cd CleanAirSights

# Make deployment script executable
chmod +x deploy/deploy.sh

# Run deployment script
./deploy/deploy.sh
```

### 3. Configure GoDaddy DNS

1. **Login to GoDaddy DNS Management**
   - Go to https://dcc.godaddy.com/
   - Select your domain
   - Click "DNS" tab

2. **Add/Update DNS Records**:
   ```
   Type: A
   Name: @
   Value: your-server-ip-address
   TTL: 1 Hour

   Type: A  
   Name: www
   Value: your-server-ip-address
   TTL: 1 Hour
   ```

3. **Wait for DNS Propagation** (5-60 minutes)

## Manual Deployment Steps

### 1. Prepare Environment

```bash
# Copy and configure environment
cp .env.prod.example .env.prod

# Edit with your actual values
nano .env.prod
```

Key variables to update:
```env
DOMAIN=yourdomain.com
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password
NASA_EARTHDATA_USERNAME=your_nasa_username
NASA_EARTHDATA_PASSWORD=your_nasa_password
OPENWEATHER_API_KEY=your_openweather_key
```

### 2. Configure SSL Certificates

The deployment script will automatically:
- Install Let's Encrypt certificates
- Configure HTTPS redirection
- Set up auto-renewal

### 3. Deploy Services

```bash
cd deploy
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Check Service Status
```bash
docker-compose -f deploy/docker-compose.prod.yml ps
docker-compose -f deploy/docker-compose.prod.yml logs
```

### SSL Issues
```bash
# Check certificate status
docker-compose -f deploy/docker-compose.prod.yml exec nginx ls -la /etc/nginx/ssl/

# Manually renew certificates
cd deploy && ./renew-ssl.sh
```

### DNS Propagation Check
```bash
# Check if DNS is pointing to your server
nslookup yourdomain.com
dig yourdomain.com
```

## Monitoring and Maintenance

### 1. Setup Automatic Backups
```bash
# Add to crontab
crontab -e

# Add these lines:
0 2 * * * docker exec cleanairsight-mongodb mongodump --out /data/backup/$(date +\%Y\%m\%d)
0 12 * * * cd /path/to/CleanAirSights/deploy && ./renew-ssl.sh
```

### 2. Monitor Resources
```bash
# Check system resources
htop
df -h
docker stats
```

### 3. Update Application
```bash
cd CleanAirSights
git pull origin main
cd deploy
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

## Security Considerations

1. **Firewall Configuration**:
   ```bash
   ufw enable
   ufw allow ssh
   ufw allow 80/tcp
   ufw allow 443/tcp
   ```

2. **Database Security**:
   - MongoDB and Redis are only accessible within Docker network
   - Strong passwords in production
   - Regular backups

3. **API Rate Limiting**:
   - Nginx configured with rate limiting
   - API endpoints protected

## Cost Estimation

- **VPS Server**: $6-12/month
- **Domain**: $12-15/year (already owned)
- **SSL Certificate**: Free (Let's Encrypt)
- **Total**: ~$6-12/month

## Support

If you encounter issues:
1. Check the logs: `docker-compose logs`
2. Verify DNS propagation
3. Ensure all environment variables are set
4. Check firewall settings

Your application will be available at:
- https://yourdomain.com
- https://www.yourdomain.com