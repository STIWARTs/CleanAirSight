#!/bin/bash

# Production Deployment Script for CleanAirSights
# Run this script on your Azure VM to deploy the latest fixes

set -e  # Exit on any error

echo "🚀 Deploying CleanAirSights Backend Fixes to Production"
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
    print_warning "Running as root. This is fine for deployment."
fi

# Navigate to project directory
PROJECT_DIR="/opt/cleanairsights"
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Project directory not found: $PROJECT_DIR"
    print_status "Please ensure CleanAirSights is cloned to $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"
print_status "Changed to project directory: $PROJECT_DIR"

# Stop existing containers
print_step "Stopping existing containers..."
cd deploy
sudo docker-compose -f docker-compose.prod.yml down --remove-orphans || true

# Pull latest changes from GitHub
print_step "Pulling latest changes from GitHub..."
cd "$PROJECT_DIR"
git pull origin main

# Verify environment file exists
if [ ! -f ".env.prod" ]; then
    print_error "Environment file .env.prod not found!"
    print_warning "Please create .env.prod with your production configuration"
    exit 1
fi

print_status "Environment file found: .env.prod"

# Load environment variables
set -a  # automatically export all variables
source .env.prod
set +a

print_status "Environment variables loaded"
print_status "Domain: $DOMAIN"
print_status "Environment: $ENVIRONMENT"

# Navigate to deploy directory
cd deploy

# Remove any existing containers that might conflict
print_step "Cleaning up existing containers..."
sudo docker container prune -f || true

# Build and start containers with the new configuration
print_step "Building and starting containers with fixes..."
sudo docker-compose -f docker-compose.prod.yml build --no-cache
sudo docker-compose -f docker-compose.prod.yml up -d

# Wait for containers to start
print_step "Waiting for containers to initialize..."
sleep 15

# Check container status
print_step "Checking container status..."
sudo docker-compose -f docker-compose.prod.yml ps

# Test backend health
print_step "Testing backend health..."
sleep 5

# Test the backend directly
if sudo docker exec cleanairsight-backend curl -f -s http://localhost:8000/api/current > /dev/null; then
    print_status "✅ Backend is responding correctly!"
else
    print_error "❌ Backend health check failed"
    print_warning "Checking backend logs..."
    sudo docker-compose -f docker-compose.prod.yml logs --tail=20 backend
fi

# Test through nginx
if curl -f -s -H "Host: $DOMAIN" http://localhost/api/current > /dev/null; then
    print_status "✅ API accessible through nginx!"
else
    print_warning "⚠️  API through nginx may have issues"
    print_warning "This might be due to SSL configuration"
fi

# Show logs for debugging
print_step "Recent backend logs:"
sudo docker-compose -f docker-compose.prod.yml logs --tail=10 backend

print_step "Recent nginx logs:"
sudo docker-compose -f docker-compose.prod.yml logs --tail=10 nginx

# Final status
echo ""
echo "================================================================"
print_status "🎉 Deployment completed!"
print_status "🌐 Website: https://$DOMAIN"
print_status "🔍 API Test: https://$DOMAIN/api/current"
echo ""
print_warning "If you see SSL errors, run the SSL restoration:"
print_warning "sudo certbot certonly --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
print_status "To monitor logs: sudo docker-compose -f docker-compose.prod.yml logs -f [service]"
print_status "To stop services: sudo docker-compose -f docker-compose.prod.yml down"
echo "================================================================"