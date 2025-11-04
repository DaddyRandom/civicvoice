# Deployment Guide

This guide covers deploying the Civic Voice Platform to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Server Setup](#server-setup)
- [SSL Certificate Setup](#ssl-certificate-setup)
- [Environment Configuration](#environment-configuration)
- [Deployment Methods](#deployment-methods)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Backup & Recovery](#backup--recovery)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Server Requirements

- **OS:** Ubuntu 22.04 LTS or Debian 11+ (recommended)
- **CPU:** 2+ cores
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 50GB+ SSD
- **Network:** Public IP with ports 80, 443 accessible

### Required Software

- Docker 20.10+
- Docker Compose 2.0+
- Git 2.0+
- Domain name pointing to server IP

### API Keys Needed

- Google Civic Information API key
- ProPublica Congress API key
- USPS API key (optional)
- Twilio account (for SMS 2FA)
- SendGrid account (for email)
- AWS account (for S3 storage, optional)

## Server Setup

### 1. Automated Setup (Recommended)

Run the automated server setup script:

```bash
# As root or with sudo
wget https://raw.githubusercontent.com/DaddyRandom/civicvoice/main/scripts/setup-server.sh
chmod +x setup-server.sh
sudo ./setup-server.sh
```

This script will:
- Update system packages
- Install Docker and Docker Compose
- Configure firewall (UFW)
- Setup fail2ban
- Create deployment user
- Configure automatic security updates

### 2. Manual Setup

If you prefer manual setup:

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl enable docker
sudo systemctl start docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install other dependencies
sudo apt-get install -y git ufw fail2ban

# Configure firewall
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Create deployment user
sudo useradd -m -s /bin/bash civicvoice
sudo usermod -aG docker civicvoice
```

### 3. Clone Repository

```bash
# Switch to deployment user
sudo -u civicvoice -i

# Clone repository
cd /opt
sudo mkdir -p civicvoice
sudo chown civicvoice:civicvoice civicvoice
cd civicvoice
git clone https://github.com/DaddyRandom/civicvoice.git .
```

## SSL Certificate Setup

### Using Let's Encrypt (Recommended)

1. **Update domain configuration:**

Edit `scripts/init-ssl.sh` and set your domain and email:

```bash
DOMAIN="api.civicvoice.org"
EMAIL="admin@civicvoice.org"
```

2. **Run SSL initialization:**

```bash
chmod +x scripts/init-ssl.sh
./scripts/init-ssl.sh
```

3. **Verify certificate:**

```bash
sudo ls -la certbot/conf/live/api.civicvoice.org/
```

### Manual SSL Setup

If you have your own SSL certificate:

1. Place certificate files in `certbot/conf/live/api.civicvoice.org/`:
   - `fullchain.pem`
   - `privkey.pem`

2. Update nginx configuration if needed.

## Environment Configuration

### 1. Create Production Environment File

```bash
cp backend/.env.production.example backend/.env.production
```

### 2. Configure Environment Variables

Edit `backend/.env.production`:

```bash
nano backend/.env.production
```

**Critical settings to update:**

```env
# Database (use managed database recommended)
DB_HOST=your-production-db-host
DB_NAME=civicvoice_production
DB_USER=civicvoice_user
DB_PASSWORD=CHANGE_THIS_STRONG_PASSWORD

# Redis
REDIS_HOST=your-redis-host
REDIS_PASSWORD=CHANGE_THIS_STRONG_PASSWORD

# JWT Secrets (generate with: openssl rand -base64 64)
JWT_SECRET=your-generated-secret-here
JWT_REFRESH_SECRET=your-generated-refresh-secret-here

# API Keys
GOOGLE_CIVIC_API_KEY=your-key-here
PROPUBLICA_API_KEY=your-key-here
SENDGRID_API_KEY=your-key-here
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890

# CORS (your frontend domain)
CORS_ORIGIN=https://civicvoice.org

# Application URLs
FRONTEND_URL=https://civicvoice.org
BACKEND_URL=https://api.civicvoice.org
```

### 3. Generate Strong Secrets

```bash
# Generate JWT secrets
openssl rand -base64 64  # For JWT_SECRET
openssl rand -base64 64  # For JWT_REFRESH_SECRET

# Generate database password
openssl rand -base64 32
```

## Deployment Methods

### Method 1: Automated Deployment Script

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh production
```

The script will:
1. Check prerequisites
2. Backup database
3. Pull latest code
4. Build Docker images
5. Run database migrations
6. Start services
7. Perform health checks

### Method 2: Manual Deployment

```bash
# Pull latest changes
git pull origin main

# Build services
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run migrate

# Check health
curl https://api.civicvoice.org/api/health
```

### Method 3: CI/CD with GitHub Actions

GitHub Actions will automatically deploy when you push to `main` branch.

**Setup required secrets in GitHub:**

Go to: Repository → Settings → Secrets and variables → Actions

Add these secrets:
- `SSH_PRIVATE_KEY` - SSH key for server access
- `SERVER_HOST` - Your server IP/domain
- `SERVER_USER` - Deployment user (civicvoice)
- `DEPLOY_PATH` - Deployment directory (/opt/civicvoice)
- `SLACK_WEBHOOK` - (Optional) For deployment notifications

## Post-Deployment

### 1. Verify Deployment

```bash
# Check running containers
docker-compose -f docker-compose.prod.yml ps

# Check health endpoint
curl https://api.civicvoice.org/api/health

# Check logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

### 2. Test API Endpoints

```bash
# Test authentication
curl -X POST https://api.civicvoice.org/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#","firstName":"Test","lastName":"User"}'

# Test health
curl https://api.civicvoice.org/api/health
```

### 3. Initialize Data (Optional)

```bash
# Sync federal officials
curl -X POST https://api.civicvoice.org/api/v1/officials/sync/federal \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Monitoring

### Application Logs

```bash
# View real-time logs
docker-compose -f docker-compose.prod.yml logs -f backend

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f postgres
docker-compose -f docker-compose.prod.yml logs -f redis
docker-compose -f docker-compose.prod.yml logs -f nginx

# View last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 backend
```

### System Monitoring

```bash
# Container stats
docker stats

# Disk usage
df -h

# Database size
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U civicvoice_user -d civicvoice_production \
  -c "SELECT pg_size_pretty(pg_database_size('civicvoice_production'));"
```

### Setup Monitoring Tools (Recommended)

**Option 1: Prometheus + Grafana**

```bash
# Add to docker-compose.prod.yml
# See infrastructure/monitoring/docker-compose.monitoring.yml
```

**Option 2: External Monitoring**

- **Uptime:** UptimeRobot, Pingdom
- **APM:** New Relic, Datadog
- **Errors:** Sentry
- **Logs:** Papertrail, Loggly

## Backup & Recovery

### Automated Daily Backups

Backups run automatically every 24 hours via Docker container.

**Backup location:** `/opt/civicvoice/backups/`

**Retention:** 30 days (configurable in `scripts/backup.sh`)

### Manual Backup

```bash
# Run backup manually
docker-compose -f docker-compose.prod.yml exec backup /backup.sh

# Download backup
scp civicvoice@your-server:/opt/civicvoice/backups/civicvoice_20240101_120000.sql.gz ./
```

### Restore from Backup

```bash
# Copy backup to server (if not already there)
scp civicvoice_20240101_120000.sql.gz civicvoice@your-server:/opt/civicvoice/backups/

# Restore
docker-compose -f docker-compose.prod.yml exec -T backup \
  /restore.sh /backups/civicvoice_20240101_120000.sql.gz
```

### Backup to Cloud Storage

Add to `scripts/backup.sh`:

```bash
# AWS S3
aws s3 cp "${BACKUP_FILE}" "s3://your-backup-bucket/database/"

# Or Google Cloud Storage
gsutil cp "${BACKUP_FILE}" "gs://your-backup-bucket/database/"
```

## Scaling

### Horizontal Scaling

Use Docker Swarm or Kubernetes for horizontal scaling:

```bash
# Example with Docker Swarm
docker swarm init
docker stack deploy -c docker-compose.prod.yml civicvoice
docker service scale civicvoice_backend=3
```

### Vertical Scaling

Increase container resources in `docker-compose.prod.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
```

### Database Optimization

For production, use managed database services:

- **AWS RDS** (PostgreSQL)
- **Google Cloud SQL**
- **Azure Database for PostgreSQL**
- **DigitalOcean Managed Databases**

Update `backend/.env.production`:

```env
DB_HOST=your-managed-db.region.rds.amazonaws.com
DB_PORT=5432
DB_NAME=civicvoice_production
DB_USER=civicvoice
DB_PASSWORD=strong_password
```

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check container status
docker-compose -f docker-compose.prod.yml ps

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

### Database Connection Issues

```bash
# Test database connection
docker-compose -f docker-compose.prod.yml exec backend \
  node -e "const {db} = require('./dist/config/database'); db.raw('SELECT 1').then(() => console.log('Connected')).catch(console.error)"

# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres
```

### SSL Certificate Issues

```bash
# Check certificate expiration
openssl x509 -in certbot/conf/live/api.civicvoice.org/fullchain.pem -noout -dates

# Renew certificate manually
docker-compose -f docker-compose.prod.yml run --rm certbot renew

# Reload nginx
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

### High Memory Usage

```bash
# Check memory usage
docker stats --no-stream

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend

# Clear Redis cache
docker-compose -f docker-compose.prod.yml exec redis redis-cli FLUSHALL
```

### Performance Issues

```bash
# Check database queries
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U civicvoice_user -d civicvoice_production \
  -c "SELECT pid, now() - pg_stat_activity.query_start AS duration, query FROM pg_stat_activity WHERE state = 'active' ORDER BY duration DESC;"

# Check API response times
docker-compose -f docker-compose.prod.yml logs backend | grep "ms"
```

## Security Checklist

- [ ] Strong passwords for all services
- [ ] JWT secrets are random and secure
- [ ] SSL/TLS enabled and configured
- [ ] Firewall configured (UFW)
- [ ] Fail2ban enabled
- [ ] Regular security updates enabled
- [ ] Database not exposed to public internet
- [ ] Redis password protected
- [ ] Environment files not committed to git
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Regular backups configured
- [ ] Monitoring and alerting setup

## Maintenance

### Regular Tasks

**Daily:**
- Monitor logs for errors
- Check automated backups

**Weekly:**
- Review system resources
- Update dependencies (if needed)

**Monthly:**
- Review and update security patches
- Test backup restoration
- Review and optimize database

### Updates

```bash
# Pull latest code
git pull origin main

# Deploy updates
./scripts/deploy.sh production
```

## Support

For deployment issues:
- **Documentation:** https://github.com/DaddyRandom/civicvoice/docs
- **Issues:** https://github.com/DaddyRandom/civicvoice/issues
- **Email:** support@civicvoice.org

---

**Last Updated:** 2024-01-01
