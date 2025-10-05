# CleanAirSights Production Deployment Script for Windows
# Run this script from PowerShell as Administrator

param(
    [Parameter(Mandatory=$true)]
    [string]$Domain,
    
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    
    [Parameter(Mandatory=$true)]
    [string]$Email,
    
    [string]$SSHUser = "root"
)

# Colors for output
$Red = [System.ConsoleColor]::Red
$Green = [System.ConsoleColor]::Green
$Yellow = [System.ConsoleColor]::Yellow
$Blue = [System.ConsoleColor]::Blue

function Write-Status($Message) {
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success($Message) {
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning($Message) {
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error($Message) {
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Check prerequisites
function Test-Prerequisites {
    Write-Status "Checking prerequisites..."
    
    # Check if Docker is installed
    try {
        $dockerVersion = docker --version
        Write-Success "Docker found: $dockerVersion"
    } catch {
        Write-Error "Docker is not installed or not in PATH. Please install Docker Desktop."
        exit 1
    }
    
    # Check if Docker Compose is available
    try {
        $composeVersion = docker-compose --version
        Write-Success "Docker Compose found: $composeVersion"
    } catch {
        Write-Error "Docker Compose is not available. Please ensure Docker Desktop is properly installed."
        exit 1
    }
    
    # Check if SSH client is available (Windows 10/11 has built-in OpenSSH)
    try {
        $sshVersion = ssh -V 2>&1
        Write-Success "SSH client found"
    } catch {
        Write-Warning "SSH client not found. You may need to install OpenSSH or use PuTTY."
    }
}

# Setup production environment file
function Set-ProductionEnvironment {
    Write-Status "Setting up production environment file..."
    
    if (-not (Test-Path ".env.prod")) {
        Copy-Item ".env.prod.example" ".env.prod"
        
        # Update domain in environment file
        (Get-Content ".env.prod") -replace "your-domain.com", $Domain | Set-Content ".env.prod"
        
        Write-Warning "Please edit .env.prod with your actual configuration values!"
        Write-Status "Opening .env.prod for editing..."
        
        # Open in default editor
        Start-Process notepad ".env.prod"
        
        Write-Status "Press Enter after you've finished editing .env.prod..."
        Read-Host
    } else {
        Write-Warning ".env.prod already exists. Please verify its contents."
    }
}

# Update nginx configuration
function Update-NginxConfig {
    Write-Status "Updating nginx configuration with domain..."
    
    # Update nginx config with actual domain
    $nginxConfig = Get-Content "deploy\nginx\nginx.conf" -Raw
    $nginxConfig = $nginxConfig -replace "your-domain.com", $Domain
    Set-Content "deploy\nginx\nginx.conf" $nginxConfig
    
    Write-Success "Nginx configuration updated!"
}

# Build production images locally
function Build-ProductionImages {
    Write-Status "Building production Docker images..."
    
    # Create production Dockerfiles if they don't exist
    if (-not (Test-Path "backend\Dockerfile.prod")) {
        Copy-Item "backend\Dockerfile" "backend\Dockerfile.prod"
        
        # Add production optimizations
        Add-Content "backend\Dockerfile.prod" @"

# Production optimizations
RUN pip install gunicorn
EXPOSE 8000
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
"@
    }
    
    if (-not (Test-Path "frontend\Dockerfile.prod")) {
        Set-Content "frontend\Dockerfile.prod" @"
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
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
"@
    }
    
    # Build images
    Set-Location "deploy"
    docker-compose -f docker-compose.prod.yml build
    Set-Location ".."
    
    Write-Success "Docker images built successfully!"
}

# Deploy to server via SSH
function Deploy-ToServer {
    Write-Status "Deploying application to server..."
    
    $serverConnection = "$SSHUser@$ServerIP"
    
    # Create deployment directory on server
    Write-Status "Creating deployment directory on server..."
    ssh $serverConnection "mkdir -p /opt/cleanairsights"
    
    # Copy files to server
    Write-Status "Copying files to server..."
    scp -r "deploy" "$serverConnection:/opt/cleanairsights/"
    scp ".env.prod" "$serverConnection:/opt/cleanairsights/"
    
    # Run deployment on server
    Write-Status "Running deployment on server..."
    ssh $serverConnection @"
        cd /opt/cleanairsights
        
        # Setup SSL certificates
        mkdir -p deploy/nginx/ssl
        mkdir -p deploy/certbot/www
        
        # Get SSL certificate using certbot
        docker run --rm \
            -p 80:80 \
            -v `$(pwd)/deploy/nginx/ssl:/etc/letsencrypt \
            -v `$(pwd)/deploy/certbot/www:/var/www/certbot \
            certbot/certbot certonly \
            --standalone \
            --email $Email \
            --agree-tos \
            --no-eff-email \
            -d $Domain -d www.$Domain
        
        # Copy certificates
        cp /etc/letsencrypt/live/$Domain/fullchain.pem deploy/nginx/ssl/
        cp /etc/letsencrypt/live/$Domain/privkey.pem deploy/nginx/ssl/
        
        # Start services
        cd deploy
        docker-compose -f docker-compose.prod.yml up -d
"@
    
    Write-Success "Application deployed successfully!"
}

# Setup SSL renewal on server
function Setup-SSLRenewal {
    Write-Status "Setting up SSL renewal on server..."
    
    $serverConnection = "$SSHUser@$ServerIP"
    
    # Create renewal script on server
    ssh $serverConnection @"
        cat > /opt/cleanairsights/renew-ssl.sh << 'EOF'
#!/bin/bash
cd /opt/cleanairsights
docker run --rm \
    -v `$(pwd)/deploy/nginx/ssl:/etc/letsencrypt \
    -v `$(pwd)/deploy/certbot/www:/var/www/certbot \
    certbot/certbot renew

# Reload nginx
cd deploy
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
EOF
        
        chmod +x /opt/cleanairsights/renew-ssl.sh
        
        # Add to crontab
        (crontab -l 2>/dev/null; echo "0 12 * * * /opt/cleanairsights/renew-ssl.sh") | crontab -
"@
    
    Write-Success "SSL renewal configured!"
}

# Main deployment function
function Start-Deployment {
    Write-Status "Starting CleanAirSights deployment..."
    Write-Status "Domain: $Domain"
    Write-Status "Server IP: $ServerIP"
    Write-Status "Email: $Email"
    
    Test-Prerequisites
    Set-ProductionEnvironment
    Update-NginxConfig
    Build-ProductionImages
    Deploy-ToServer
    Setup-SSLRenewal
    
    Write-Success "Deployment completed successfully!"
    Write-Status "Your application should now be available at: https://$Domain"
    Write-Status ""
    Write-Status "Next steps:"
    Write-Status "1. Configure your GoDaddy DNS:"
    Write-Status "   - A record: @ -> $ServerIP"
    Write-Status "   - A record: www -> $ServerIP"
    Write-Status "2. Wait for DNS propagation (5-60 minutes)"
    Write-Status "3. Test your application at https://$Domain"
    Write-Status "4. Monitor logs: ssh $SSHUser@$ServerIP 'cd /opt/cleanairsights/deploy && docker-compose logs'"
}

# Run deployment
Start-Deployment