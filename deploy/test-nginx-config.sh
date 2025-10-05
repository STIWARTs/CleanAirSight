#!/bin/bash

echo "🔧 Testing nginx configuration..."

# Test nginx config syntax
sudo docker run --rm -v "$(pwd)/nginx/nginx.conf:/etc/nginx/nginx.conf:ro" nginx:alpine nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration syntax is valid!"
else
    echo "❌ Nginx configuration has syntax errors!"
    exit 1
fi

echo "🔄 Restarting deployment with fixed configuration..."

# Stop current deployment
sudo docker-compose -f docker-compose.prod.yml down

# Remove nginx container to force recreation
sudo docker container rm cleanairsight-nginx 2>/dev/null || true

# Start deployment again
sudo docker-compose -f docker-compose.prod.yml up -d

echo "📊 Checking container status..."
sudo docker-compose -f docker-compose.prod.yml ps

echo "📋 Checking nginx logs..."
sleep 5
sudo docker-compose -f docker-compose.prod.yml logs --tail=20 nginx

echo "✅ Deployment test complete!"