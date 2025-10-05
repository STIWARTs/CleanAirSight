#!/bin/bash

# CleanAirSight HTTPS Deployment - API Fix Script
# This script fixes the nginx proxy configuration and restarts services

echo "🔧 CleanAirSight API Fix - Starting..."
echo "============================================"

# Check if we're in the right directory
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Error: Must run from /opt/cleanairsights/deploy directory"
    exit 1
fi

echo "📋 Step 1: Backing up current nginx config..."
sudo cp nginx/nginx.conf nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)

echo "📋 Step 2: Testing nginx configuration..."
sudo docker exec cleanairsight-nginx nginx -t

if [ $? -ne 0 ]; then
    echo "❌ nginx configuration test failed! Check the config file"
    exit 1
fi

echo "📋 Step 3: Restarting nginx to apply fixes..."
sudo docker-compose -f docker-compose.prod.yml restart nginx

echo "📋 Step 4: Waiting for services to start..."
sleep 10

echo "📋 Step 5: Testing API endpoints..."
echo "Testing /api/current endpoint:"
curl -s "http://localhost/api/current?city=Los%20Angeles" | head -3

echo ""
echo "Testing external endpoint:"
curl -s "https://cleanairsight.earth/api/current?city=Los%20Angeles" | head -3

echo ""
echo "📋 Step 6: Checking service status..."
sudo docker-compose -f docker-compose.prod.yml ps

echo ""
echo "📋 Step 7: Checking recent nginx logs..."
sudo docker-compose -f docker-compose.prod.yml logs nginx --tail=5

echo ""
echo "✅ API Fix Complete!"
echo "============================================"
echo "🌐 Test your website: https://cleanairsight.earth"
echo "🔧 API endpoint: https://cleanairsight.earth/api/current"
echo ""
echo "If issues persist, check logs with:"
echo "sudo docker-compose -f docker-compose.prod.yml logs backend --tail=20"
echo "sudo docker-compose -f docker-compose.prod.yml logs nginx --tail=20"