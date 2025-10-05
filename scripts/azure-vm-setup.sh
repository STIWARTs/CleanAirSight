#!/bin/bash

# CleanAirSights Azure VM Setup Script
# Run this on your Azure VM

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

print_status "Setting up CleanAirSights on Azure VM..."

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
sudo apt install -y curl wget git htop unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Docker
print_status "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER

# Install Docker Compose
print_status "Installing Docker Compose..."
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Setup firewall (Azure NSG handles most of this, but good practice)
print_status "Configuring UFW firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Install Node.js (for frontend builds if needed)
print_status "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python (for backend)
print_status "Installing Python..."
sudo apt install -y python3 python3-pip python3-venv

# Setup directories
print_status "Creating application directories..."
sudo mkdir -p /opt/cleanairsights
sudo chown $USER:$USER /opt/cleanairsights

# Setup log rotation for Docker
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/docker > /dev/null << EOF
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
EOF

# Setup cron for Docker cleanup
print_status "Setting up Docker cleanup..."
(crontab -l 2>/dev/null; echo "0 3 * * 0 docker system prune -af") | crontab -

print_success "Azure VM setup completed!"
print_status "Next steps:"
print_status "1. Log out and log back in for Docker permissions to take effect"
print_status "2. Clone your repository to /opt/cleanairsights"
print_status "3. Run the deployment script"

# Show system info
print_status "System Information:"
print_status "- Docker version: $(docker --version 2>/dev/null || echo 'Please log out and back in')"
print_status "- Docker Compose version: $(docker-compose --version 2>/dev/null || echo 'Please log out and back in')"
print_status "- Available memory: $(free -h | awk 'NR==2{print $2}')"
print_status "- Available disk: $(df -h / | awk 'NR==2{print $4}')"
print_status "- Server IP: 4.240.98.203"