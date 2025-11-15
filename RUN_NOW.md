# 🚀 RUN YOUR CIVIC VOICE PLATFORM NOW!

## ✅ Everything is Ready!

Your platform is **built, tested, and ready to run**. Here's how to start it on YOUR computer.

---

## 🏃 Option 1: Run with Docker (EASIEST - Recommended)

### Step 1: Install Docker
Download Docker Desktop: https://www.docker.com/products/docker-desktop

### Step 2: Clone and Run
```bash
# Clone your repository
git clone https://github.com/DaddyRandom/civicvoice.git
cd civicvoice

# Start everything with ONE command
docker compose up -d

# Wait 30 seconds for services to start, then check
curl http://localhost:5000/api/health
```

**That's it! Your platform is running!** 🎉

**URLs:**
- API: http://localhost:5000
- Health Check: http://localhost:5000/api/health
- PostgreSQL: localhost:5432
- Redis: localhost:6379

---

## 🏃 Option 2: Run Manually (Without Docker)

### Prerequisites
1. Install Node.js 18+: https://nodejs.org
2. Install PostgreSQL: https://www.postgresql.org/download/
3. Install Redis: https://redis.io/download

### Commands
```bash
# Clone repository
git clone https://github.com/DaddyRandom/civicvoice.git
cd civicvoice

# Start PostgreSQL (in separate terminal)
# Windows: Start from Start Menu
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Start Redis (in separate terminal)
# Windows: redis-server
# Mac: brew services start redis
# Linux: sudo systemctl start redis

# Install and run backend
cd backend
npm install
npm run migrate  # Setup database
npm run dev      # Start server
```

**Your API is now running at:** http://localhost:5000

---

## 🧪 Test It's Working

Once running, open a new terminal and try these:

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Civic Voice API is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. Register a User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@civicvoice.org",
    "password": "SecurePass123!",
    "firstName": "Demo",
    "lastName": "User",
    "phone": "+12125551234"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### 3. Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@civicvoice.org",
    "password": "SecurePass123!"
  }'
```

### 4. Search Officials by Address
```bash
curl "http://localhost:5000/api/v1/officials/search?address=1600+Pennsylvania+Ave+NW,+Washington,+DC"
```

---

## 📊 What's Running?

When you run `docker compose up -d`, you get:

1. **PostgreSQL Database** (Port 5432)
   - Stores all your data
   - 9 tables ready to use
   - Automatic migrations

2. **Redis Cache** (Port 6379)
   - Session management
   - High-performance caching
   - 2FA token storage

3. **Backend API** (Port 5000)
   - 25+ API endpoints
   - JWT authentication
   - Rate limiting
   - Security headers

---

## 🎮 View the Logs

```bash
# See what's happening
docker compose logs -f backend

# Check service status
docker compose ps

# Stop everything
docker compose down
```

---

## 🚨 Troubleshooting

### "Port 5000 already in use"
```bash
# Find what's using port 5000
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill it or change port in backend/.env
PORT=5001
```

### "Cannot connect to database"
```bash
# Check if PostgreSQL is running
docker compose ps postgres

# View database logs
docker compose logs postgres
```

### "Redis connection failed"
```bash
# Check if Redis is running
docker compose ps redis

# Restart Redis
docker compose restart redis
```

---

## 🎯 Next Steps After Running

1. ✅ **Test all API endpoints** - Try the curl commands above
2. 📱 **Build a Frontend** - Create a React app to use the API
3. 🔑 **Get API Keys** - Sign up for Google Civic, ProPublica, etc.
4. 🚀 **Deploy to Production** - Follow `docs/BEGINNER_GUIDE.md`

---

## 💡 Pro Tips

**Auto-start on login:**
```bash
# Add to your startup apps
docker compose up -d
```

**View API in browser:**
- Visit: http://localhost:5000/api/health
- Install Postman: https://www.postman.com/
- Test all endpoints visually

**Use with frontend:**
Your React/Vue/Angular app can now make requests to:
```javascript
const API_URL = 'http://localhost:5000/api/v1';

// Register user
fetch(`${API_URL}/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
    firstName: 'John',
    lastName: 'Doe'
  })
});
```

---

## 🎊 You're Ready!

Your Civic Voice Platform includes:
- ✅ Complete authentication system
- ✅ Voter verification framework
- ✅ Official directory integration
- ✅ Letter creation and PDF generation
- ✅ Community features
- ✅ Petition system
- ✅ Professional security
- ✅ Automatic backups

**Cost to run:** $0 locally, $25-50/month in production

**All code is in your repository:** https://github.com/DaddyRandom/civicvoice

---

## 🆘 Need Help?

1. **Check logs:** `docker compose logs -f backend`
2. **Read guides:** `docs/` folder has everything
3. **Ask for help:** Open issue on GitHub

---

**Your platform is ready to GO! 🚀**

Run `docker compose up -d` and you're live in 30 seconds!
