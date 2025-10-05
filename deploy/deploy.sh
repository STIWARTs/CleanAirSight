#!/bin/bash

# CleanAirSights Production Deployment Script
# This script helps deploy your application to a production server

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=""
EMAIL=""
SERVER_IP=""
SSH_USER="root"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Prerequisites check passed!"
}

# Get user input
get_user_input() {
    print_status "Getting deployment configuration..."
    
    if [ -z "$DOMAIN" ]; then
        read -p "Enter your domain name (e.g., cleanairsights.com): " DOMAIN
    fi
    
    if [ -z "$EMAIL" ]; then
        read -p "Enter your email for SSL certificate: " EMAIL
    fi
    
    if [ -z "$SERVER_IP" ]; then
        read -p "Enter your server IP address: " SERVER_IP
    fi
    
    print_success "Configuration collected!"
}

# Setup environment file
setup_environment() {
    print_status "Setting up production environment file..."
    
    if [ ! -f ".env.prod" ]; then
        cp .env.prod.example .env.prod
        print_warning "Please edit .env.prod with your actual configuration values!"
        
        # Update domain in environment file
        sed -i "s/your-domain.com/$DOMAIN/g" .env.prod
        
        print_status "Environment file created. Opening for editing..."
        ${EDITOR:-nano} .env.prod
    else
        print_warning ".env.prod already exists. Please verify its contents."
    fi
}

# Setup SSL certificates with Let's Encrypt
setup_ssl() {
    print_status "Setting up SSL certificates..."
    
    # Create directories
    mkdir -p deploy/nginx/ssl
    mkdir -p deploy/certbot/www
    
    # Update nginx config with actual domain
    sed -i "s/your-domain.com/$DOMAIN/g" deploy/nginx/nginx.conf
    
    print_status "Starting temporary nginx for certificate generation..."
    
    # Create temporary nginx config for certificate generation
    cat > deploy/nginx/nginx.temp.conf << EOF
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name $DOMAIN www.$DOMAIN;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        location / {
            return 200 'OK';
            add_header Content-Type text/plain;
        }
    }
}
EOF

    # Start temporary nginx
    docker run -d --name temp-nginx \
        -p 80:80 \
        -v $(pwd)/deploy/certbot/www:/var/www/certbot \
        -v $(pwd)/deploy/nginx/nginx.temp.conf:/etc/nginx/nginx.conf \
        nginx:alpine

    # Get SSL certificate
    docker run --rm \
        -v $(pwd)/deploy/nginx/ssl:/etc/letsencrypt \
        -v $(pwd)/deploy/certbot/www:/var/www/certbot \
        certbot/certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        -d $DOMAIN -d www.$DOMAIN

    # Stop temporary nginx
    docker stop temp-nginx
    docker rm temp-nginx
    
    # Copy certificates to nginx ssl directory
    docker run --rm \
        -v $(pwd)/deploy/nginx/ssl:/etc/letsencrypt \
        -v $(pwd)/deploy/nginx/ssl:/output \
        alpine:latest sh -c "
            cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /output/
            cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /output/
        "
    
    print_success "SSL certificates configured!"
}

# Build production images
build_images() {
    print_status "Building production Docker images..."
    
    # Create production Dockerfiles if they don't exist
    if [ ! -f "backend/Dockerfile.prod" ]; then
        cp backend/Dockerfile backend/Dockerfile.prod
        # Add production optimizations to backend Dockerfile
        cat >> backend/Dockerfile.prod << EOF

# Production optimizations
RUN pip install gunicorn
EXPOSE 8000
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
EOF
    fi
    
    if [ ! -f "frontend/Dockerfile.prod" ]; then
        cat > frontend/Dockerfile.prod << EOF
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
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
EOF
    fi
    
    # Build images
    cd deploy
    docker-compose -f docker-compose.prod.yml build
    cd ..
    
    print_success "Docker images built successfully!"
}

# Deploy application
deploy_application() {
    print_status "Deploying application..."
    
    cd deploy
    
    # Pull latest images and start services
    docker-compose -f docker-compose.prod.yml pull
    docker-compose -f docker-compose.prod.yml up -d
    
    cd ..
    
    print_success "Application deployed successfully!"
}

# Setup SSL renewal
setup_ssl_renewal() {
    print_status "Setting up automatic SSL renewal..."
    
    # Create renewal script
    cat > deploy/renew-ssl.sh << 'EOF'
#!/bin/bash
docker run --rm \
    -v $(pwd)/nginx/ssl:/etc/letsencrypt \
    -v $(pwd)/certbot/www:/var/www/certbot \
    certbot/certbot renew

# Reload nginx to pick up new certificates
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
EOF
    
    chmod +x deploy/renew-ssl.sh
    
    print_status "Add this to your crontab to auto-renew SSL certificates:"
    print_status "0 12 * * * cd $(pwd)/deploy && ./renew-ssl.sh"
    
    print_success "SSL renewal script created!"
}

# Main deployment function
main() {
    print_status "Starting CleanAirSights deployment..."
    
    check_prerequisites
    get_user_input
    setup_environment
    setup_ssl
    build_images
    deploy_application
    setup_ssl_renewal
    
    print_success "Deployment completed successfully!"
    print_status "Your application should now be available at: https://$DOMAIN"
    print_status "Don't forget to:"
    print_status "1. Configure your GoDaddy DNS to point to $SERVER_IP"
    print_status "2. Add SSL renewal to your crontab"
    print_status "3. Configure monitoring and backups"
}

# Run main function
main "$@"