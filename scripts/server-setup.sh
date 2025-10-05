#!/bin/bash

# CleanAirSights Server Setup Script for Ubuntu/Debian
# Run this on your fresh server: curl -sSL https://raw.githubusercontent.com/STIWARTs/CleanAirSights/main/scripts/server-setup.sh | bash

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

print_status "Setting up CleanAirSights production server..."

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
apt install -y curl wget git htop unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Docker
print_status "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl enable docker
systemctl start docker

# Install Docker Compose
print_status "Installing Docker Compose..."
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Setup firewall
print_status "Configuring firewall..."
ufw --force enable
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp

# Create deployment user
print_status "Creating deployment user..."
useradd -m -s /bin/bash deploy
usermod -aG docker deploy
usermod -aG sudo deploy

# Setup SSH key for deployment user (optional)
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/ 2>/dev/null || true
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys 2>/dev/null || true

# Install Node.js (for frontend builds)
print_status "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Python (for backend)
print_status "Installing Python..."
apt install -y python3 python3-pip python3-venv

# Setup swap file (if less than 2GB RAM)
MEMORY=$(free -m | awk 'NR==2{printf "%.0f", $2/1024}')
if [ "$MEMORY" -lt 2 ]; then
    print_status "Setting up swap file..."
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Setup log rotation
print_status "Setting up log rotation..."
cat > /etc/logrotate.d/docker << EOF
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

# Setup cron for cleanup
print_status "Setting up system cleanup..."
(crontab -l 2>/dev/null; echo "0 3 * * 0 docker system prune -af") | crontab -

# Install monitoring tools
print_status "Installing monitoring tools..."
apt install -y htop iotop nethogs

# Setup basic security
print_status "Applying security hardening..."
# Disable root SSH login (optional)
# sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
# systemctl restart ssh

# Install fail2ban
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban

print_success "Server setup completed!"
print_status "Next steps:"
print_status "1. Clone your repository: git clone https://github.com/STIWARTs/CleanAirSights.git"
print_status "2. Configure your domain DNS to point to this server"
print_status "3. Run the deployment script: ./deploy/deploy.sh"
print_status "4. Your application will be available at https://yourdomain.com"

print_status "Server Information:"
print_status "- Docker version: $(docker --version)"
print_status "- Docker Compose version: $(docker-compose --version)"
print_status "- Server IP: $(curl -s ifconfig.me)"
print_status "- Available memory: $(free -h | awk 'NR==2{print $2}')"
print_status "- Available disk: $(df -h / | awk 'NR==2{print $4}')"