# 🚀 Quick Start Guide

## Option 1: Run Locally (For Testing)

### Prerequisites
- Node.js 18+ installed
- PostgreSQL installed and running
- Redis installed and running

### Quick Start
```bash
# Clone the repository
git clone https://github.com/DaddyRandom/civicvoice.git
cd civicvoice

# Run the start script
./start.sh
```

The API will be available at: http://localhost:5000

---

## Option 2: Run with Docker (Recommended)

### Prerequisites
- Docker installed
- Docker Compose installed

### Development Mode
```bash
# Start all services (PostgreSQL, Redis, Backend)
docker-compose up -d

# Check if services are running
docker-compose ps

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

The API will be available at: http://localhost:5000

### Production Mode
```bash
# Configure environment
cp backend/.env.production.example backend/.env.production
# Edit backend/.env.production with your values

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Check health
curl http://localhost/api/health
```

---

## Option 3: Deploy to Production Server

Follow the comprehensive guides:

1. **Complete Beginner?** → Read `docs/BEGINNER_GUIDE.md`
2. **Quick Deploy (30 min)** → Read `docs/QUICK_DEPLOY.md`
3. **Full Production** → Read `docs/DEPLOYMENT.md`

### One-Command Deploy
```bash
# On your production server
./scripts/deploy.sh production
```

---

## Testing the API

### Health Check
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Civic Voice API is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Register a User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+12125551234"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

---

## Troubleshooting

### "Cannot connect to database"
Make sure PostgreSQL is running:
```bash
# With Docker
docker-compose up -d postgres

# Check if it's running
docker-compose ps postgres
```

### "Redis connection failed"
Make sure Redis is running:
```bash
# With Docker
docker-compose up -d redis

# Check if it's running
docker-compose ps redis
```

### "Port 5000 already in use"
Change the port in `backend/.env`:
```env
PORT=5001
```

### View detailed logs
```bash
# With Docker
docker-compose logs -f backend

# Without Docker
cd backend && npm run dev
```

---

## What's Next?

1. ✅ **Platform is running** - Test the API endpoints
2. 📱 **Build Frontend** - Create React web app
3. 🚀 **Deploy to Production** - Follow deployment guides
4. 👥 **Invite Beta Users** - Test with real users
5. 📊 **Monitor** - Set up monitoring stack

---

## Need Help?

- **Documentation:** Check `docs/` folder
- **Issues:** https://github.com/DaddyRandom/civicvoice/issues
- **Beginner Guide:** `docs/BEGINNER_GUIDE.md`
- **Full Deployment:** `docs/DEPLOYMENT.md`

---

## All Available Commands

```bash
# Development
npm run dev              # Start dev server with hot-reload
npm run build           # Build TypeScript to JavaScript
npm run start           # Start production server
npm test                # Run tests
npm run lint            # Check code style

# Database
npm run migrate         # Run database migrations
npm run migrate:rollback # Rollback last migration
npm run seed            # Seed database with test data

# Docker
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f backend    # View logs
docker-compose ps                 # Check service status

# Production
./scripts/deploy.sh production    # Deploy to production
./scripts/backup.sh               # Backup database
./scripts/init-ssl.sh             # Setup SSL certificates
```

---

**Your Civic Voice Platform is ready to run! 🎉**
