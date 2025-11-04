# Quick Deployment Guide

Get Civic Voice Platform running in production in under 30 minutes.

## 🚀 Quick Start

### Step 1: Server Setup (5 minutes)

SSH into your server and run:

```bash
# Download and run setup script
wget https://raw.githubusercontent.com/DaddyRandom/civicvoice/main/scripts/setup-server.sh
chmod +x setup-server.sh
sudo ./setup-server.sh
```

### Step 2: Clone Repository (2 minutes)

```bash
# Switch to deployment user
sudo -u civicvoice -i

# Clone and navigate
cd /opt/civicvoice
git clone https://github.com/DaddyRandom/civicvoice.git .
```

### Step 3: Configure Environment (10 minutes)

```bash
# Copy example file
cp backend/.env.production.example backend/.env.production

# Edit configuration
nano backend/.env.production
```

**Minimal required configuration:**

```env
# Database
DB_PASSWORD=YOUR_STRONG_PASSWORD_HERE

# JWT Secrets (generate with: openssl rand -base64 64)
JWT_SECRET=YOUR_GENERATED_SECRET
JWT_REFRESH_SECRET=YOUR_GENERATED_REFRESH_SECRET

# API Keys (get from respective providers)
GOOGLE_CIVIC_API_KEY=your-key
PROPUBLICA_API_KEY=your-key
SENDGRID_API_KEY=your-key

# Domain
CORS_ORIGIN=https://your-domain.com
BACKEND_URL=https://api.your-domain.com
```

### Step 4: Setup SSL (5 minutes)

```bash
# Update domain in script
nano scripts/init-ssl.sh
# Change DOMAIN and EMAIL

# Run SSL setup
chmod +x scripts/init-ssl.sh
./scripts/init-ssl.sh
```

### Step 5: Deploy (5 minutes)

```bash
# Make deploy script executable
chmod +x scripts/deploy.sh

# Deploy!
./scripts/deploy.sh production
```

### Step 6: Verify (2 minutes)

```bash
# Check health
curl https://api.your-domain.com/api/health

# Should return:
# {"success":true,"message":"Civic Voice API is running","timestamp":"..."}
```

## ✅ You're Live!

Your Civic Voice Platform is now running at:
- **API:** https://api.your-domain.com
- **Health Check:** https://api.your-domain.com/api/health

## 📋 Post-Deployment Checklist

- [ ] Health check returns success
- [ ] SSL certificate is valid (check in browser)
- [ ] Can register a new user via API
- [ ] Database backups are running (check `/opt/civicvoice/backups/`)
- [ ] Logs are clean (run: `docker-compose -f docker-compose.prod.yml logs backend`)

## 🔧 Common Commands

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Update and redeploy
git pull origin main && ./scripts/deploy.sh production

# Backup database
docker-compose -f docker-compose.prod.yml exec backup /backup.sh

# Check running services
docker-compose -f docker-compose.prod.yml ps
```

## 🆘 Troubleshooting

### Services won't start
```bash
docker-compose -f docker-compose.prod.yml logs
```

### SSL issues
```bash
./scripts/init-ssl.sh  # Re-run SSL setup
```

### Database issues
```bash
docker-compose -f docker-compose.prod.yml logs postgres
```

### Can't connect to API
```bash
# Check firewall
sudo ufw status

# Should allow 80, 443
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## 📚 Full Documentation

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🎯 Next Steps

1. **Setup Frontend:** Deploy React frontend application
2. **Configure Monitoring:** Setup Sentry, Datadog, or similar
3. **Enable CI/CD:** Configure GitHub Actions for automated deployments
4. **Scale:** Move to managed database and Redis services
5. **Optimize:** Setup CDN for static assets

---

**Need help?** Open an issue at https://github.com/DaddyRandom/civicvoice/issues
