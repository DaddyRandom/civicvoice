#!/bin/bash

# Server setup script for fresh Ubuntu/Debian server
# Run as root or with sudo

set -e

echo "========================================="
echo "Civic Voice Platform - Server Setup"
echo "========================================="

# Update system
echo ""
echo "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install required packages
echo ""
echo "Installing required packages..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw \
    fail2ban

# Install Docker
echo ""
echo "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
    echo "✓ Docker installed"
else
    echo "✓ Docker already installed"
fi

# Install Docker Compose
echo ""
echo "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION="2.20.2"
    curl -L "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "✓ Docker Compose installed"
else
    echo "✓ Docker Compose already installed"
fi

# Configure firewall
echo ""
echo "Configuring firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
echo "✓ Firewall configured"

# Configure fail2ban
echo ""
echo "Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban
echo "✓ Fail2ban configured"

# Create deployment user
echo ""
echo "Creating deployment user..."
if ! id -u civicvoice > /dev/null 2>&1; then
    useradd -m -s /bin/bash civicvoice
    usermod -aG docker civicvoice
    echo "✓ User 'civicvoice' created"
else
    echo "✓ User 'civicvoice' already exists"
fi

# Setup deployment directory
echo ""
echo "Setting up deployment directory..."
DEPLOY_DIR="/opt/civicvoice"
mkdir -p ${DEPLOY_DIR}
chown civicvoice:civicvoice ${DEPLOY_DIR}
echo "✓ Deployment directory: ${DEPLOY_DIR}"

# Clone repository
echo ""
echo "Repository setup..."
echo "Run as civicvoice user:"
echo "  cd ${DEPLOY_DIR}"
echo "  git clone https://github.com/DaddyRandom/civicvoice.git ."
echo "  cp backend/.env.production.example backend/.env.production"
echo "  # Edit backend/.env.production with production values"

# Setup automatic security updates
echo ""
echo "Configuring automatic security updates..."
apt-get install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

# Display versions
echo ""
echo "Installed versions:"
echo "  Docker: $(docker --version)"
echo "  Docker Compose: $(docker-compose --version)"
echo "  Git: $(git --version)"

echo ""
echo "========================================="
echo "Server setup completed!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Switch to civicvoice user: sudo -u civicvoice -i"
echo "2. Clone repository to ${DEPLOY_DIR}"
echo "3. Configure environment: backend/.env.production"
echo "4. Setup SSH keys for deployment"
echo "5. Initialize SSL: ./scripts/init-ssl.sh"
echo "6. Deploy: ./scripts/deploy.sh"
