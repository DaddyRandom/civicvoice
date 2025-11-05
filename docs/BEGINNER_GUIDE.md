# Civic Voice Platform - Simple Setup Guide for Non-Coders

## What You Have Now
You have the complete code for the Civic Voice Platform. Think of it like having the blueprints and materials for a house - now you need to build it and make it live on the internet.

## What You'll Need

### 1. A Server (Your Website's Home)
This is like renting space where your website will live. **Cost: ~$20-40/month**

**Recommended Options:**
- **DigitalOcean** (easiest): https://www.digitalocean.com
- **Linode**: https://www.linode.com
- **Vultr**: https://www.vultr.com

**What to Get:**
- Choose: "Ubuntu 22.04 LTS" (this is the operating system)
- Size: At least 4GB RAM, 2 CPUs
- You'll get an IP address like: `123.45.67.89`

### 2. A Domain Name (Your Website Address)
This is your website's address, like "civicvoice.org"

**Where to Buy:** (~$10-15/year)
- **Namecheap**: https://www.namecheap.com
- **Google Domains**: https://domains.google
- **GoDaddy**: https://www.godaddy.com

**What to Buy:**
- Search for your desired name (e.g., "civicvoice.org")
- Purchase for at least 1 year

### 3. API Keys (Services Your Platform Needs)
These are like passwords that let your platform use other services.

**You Need:**

#### Google Civic Information API (Free)
- What it does: Finds elected officials by address
- Get it at: https://console.cloud.google.com
- Cost: FREE (up to 25,000 requests/day)
- Steps:
  1. Create a Google Cloud account
  2. Create a new project
  3. Enable "Civic Information API"
  4. Create credentials → API key
  5. Copy the key (looks like: `AIzaSyD...`)

#### ProPublica Congress API (Free)
- What it does: Gets information about Congress members
- Get it at: https://www.propublica.org/datastore/api/propublica-congress-api
- Cost: FREE
- Steps:
  1. Fill out the form
  2. Check your email
  3. Copy the API key

#### SendGrid (Email Service)
- What it does: Sends emails from your platform
- Get it at: https://sendgrid.com
- Cost: FREE (up to 100 emails/day)
- Steps:
  1. Sign up for free account
  2. Verify your email
  3. Create an API key
  4. Copy the key

#### Twilio (SMS for 2FA)
- What it does: Sends text messages for security
- Get it at: https://www.twilio.com
- Cost: Pay as you go (~$0.0075 per SMS)
- Steps:
  1. Sign up for account (you'll get $15 free credit)
  2. Get a phone number
  3. Copy your Account SID and Auth Token

---

## Step-by-Step Setup (Complete Guide)

### STEP 1: Set Up Your Server (30 minutes)

#### 1.1 Create Your Server
1. Go to DigitalOcean.com (or your chosen provider)
2. Click "Create" → "Droplets"
3. Choose:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic
   - **Size**: $24/month (4GB RAM, 2 CPUs)
   - **Region**: Choose closest to you
4. Under "Authentication", choose "SSH Key" or "Password"
   - If password: Choose a STRONG password (20+ characters)
5. Click "Create Droplet"
6. **WRITE DOWN** your server's IP address (looks like `123.45.67.89`)

#### 1.2 Connect to Your Server
**On Mac/Linux:**
1. Open Terminal
2. Type: `ssh root@123.45.67.89` (replace with YOUR IP)
3. Enter password when asked
4. You're now connected!

**On Windows:**
1. Download PuTTY: https://www.putty.org
2. Open PuTTY
3. Enter your server IP
4. Click "Open"
5. Login as: `root`
6. Enter your password
7. You're now connected!

---

### STEP 2: Install Required Software (15 minutes)

**Just copy and paste these commands one at a time:**

#### 2.1 Download the Setup Script
```bash
wget https://raw.githubusercontent.com/DaddyRandom/civicvoice/main/scripts/setup-server.sh
```
*What this does: Downloads our automatic setup tool*

#### 2.2 Make It Executable
```bash
chmod +x setup-server.sh
```
*What this does: Makes the setup tool runnable*

#### 2.3 Run the Setup
```bash
./setup-server.sh
```
*What this does: Installs Docker, Git, and security tools (takes 5-10 minutes)*

**You'll see lots of text scrolling by - this is normal! Wait for it to finish.**

#### 2.4 Switch to the App User
```bash
su - civicvoice
```
*What this does: Switches to a special user account for your app*

---

### STEP 3: Get Your Code (5 minutes)

#### 3.1 Create a Folder
```bash
cd /opt/civicvoice
```

#### 3.2 Download Your Code
```bash
git clone https://github.com/DaddyRandom/civicvoice.git .
```
*(Note the period at the end!)*

*What this does: Downloads all your app code to the server*

---

### STEP 4: Configure Your Domain (10 minutes)

#### 4.1 Point Your Domain to Your Server
1. Go to your domain registrar (Namecheap, GoDaddy, etc.)
2. Find "DNS Settings" or "Manage DNS"
3. Add these records:

**Record 1:**
- Type: `A`
- Host: `api` (or `@` for main domain)
- Value: Your server IP (e.g., `123.45.67.89`)
- TTL: `300`

**Example:** If your domain is `civicvoice.org`, this creates `api.civicvoice.org`

4. Save changes
5. **Wait 10-30 minutes** for DNS to update

#### 4.2 Verify DNS is Working
```bash
ping api.civicvoice.org
```
*If you see responses, it's working!*

---

### STEP 5: Configure Your Application (20 minutes)

#### 5.1 Create Your Configuration File
```bash
cp backend/.env.production.example backend/.env.production
```

#### 5.2 Edit the Configuration
```bash
nano backend/.env.production
```

**Now you'll see a text file. Use arrow keys to move around.**

#### 5.3 Fill in YOUR Information

**Find each line and replace the placeholder with YOUR actual values:**

```bash
# Change this:
DB_PASSWORD=CHANGE_THIS_TO_STRONG_PASSWORD
# To something like:
DB_PASSWORD=MySuper$ecure1Pass2024!

# Change this:
REDIS_PASSWORD=CHANGE_THIS_TO_STRONG_PASSWORD
# To something like:
REDIS_PASSWORD=Redis$ecure1Pass2024!

# Add your API keys:
GOOGLE_CIVIC_API_KEY=AIzaSyD... (paste your actual key)
PROPUBLICA_API_KEY=abc123... (paste your actual key)
SENDGRID_API_KEY=SG.abc123... (paste your actual key)

TWILIO_ACCOUNT_SID=AC... (paste your actual SID)
TWILIO_AUTH_TOKEN=abc123... (paste your actual token)
TWILIO_PHONE_NUMBER=+12125551234 (your Twilio number)

# Change domain:
CORS_ORIGIN=https://civicvoice.org (your actual domain)
BACKEND_URL=https://api.civicvoice.org (your actual API domain)
```

#### 5.4 Generate Strong Secrets

**Open a new Terminal window** and run:
```bash
openssl rand -base64 64
```

Copy the result and paste it for `JWT_SECRET`

Run the command again:
```bash
openssl rand -base64 64
```

Copy this result and paste it for `JWT_REFRESH_SECRET`

#### 5.5 Save the File
- Press `Ctrl + X`
- Press `Y` for yes
- Press `Enter`

---

### STEP 6: Set Up SSL Security (10 minutes)

#### 6.1 Edit SSL Script
```bash
nano scripts/init-ssl.sh
```

#### 6.2 Update These Lines:
```bash
# Change:
DOMAIN="api.civicvoice.org"
EMAIL="admin@civicvoice.org"

# To YOUR domain and email:
DOMAIN="api.yourdomain.com"
EMAIL="your-email@gmail.com"
```

#### 6.3 Save (Ctrl + X, Y, Enter)

#### 6.4 Run SSL Setup
```bash
./scripts/init-ssl.sh
```

*What this does: Gets a FREE security certificate so your site has HTTPS*

**This takes 2-3 minutes. You'll see progress messages.**

---

### STEP 7: Deploy Your Platform! (10 minutes)

#### 7.1 Run Deployment
```bash
./scripts/deploy.sh production
```

**This will:**
1. ✓ Check everything is ready
2. ✓ Build your application
3. ✓ Start all services
4. ✓ Set up the database
5. ✓ Run health checks

**Takes 5-10 minutes. You'll see lots of output - this is normal!**

#### 7.2 Wait for Success Message
You should see:
```
========================================
Deployment completed successfully!
========================================
```

---

### STEP 8: Test Your Platform! (5 minutes)

#### 8.1 Test the API
Open your web browser and go to:
```
https://api.yourdomain.com/api/health
```

**You should see:**
```json
{
  "success": true,
  "message": "Civic Voice API is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

✅ **If you see this, YOU'RE LIVE!**

#### 8.2 Test Creating a User

Open a Terminal and try:
```bash
curl -X POST https://api.yourdomain.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**You should get a success response with a user ID and tokens.**

---

## ✅ You're Done! What Now?

### Your Platform is Live At:
- **API:** `https://api.yourdomain.com`
- **Health Check:** `https://api.yourdomain.com/api/health`

### Next Steps:

1. **Build the Frontend**
   - You need a website interface (React app)
   - This requires hiring a developer or learning web development

2. **Test Everything**
   - Try registering users
   - Test creating letters
   - Verify emails are sending

3. **Monitor Your Platform**
   - Check daily: `docker-compose -f docker-compose.prod.yml logs -f backend`

---

## Common Issues & Solutions

### ❌ "Connection refused" when accessing API
**Solution:**
- Wait 5 minutes for services to fully start
- Check if services are running: `docker-compose -f docker-compose.prod.yml ps`

### ❌ "SSL certificate not found"
**Solution:**
- Make sure DNS is working (try: `ping api.yourdomain.com`)
- Re-run: `./scripts/init-ssl.sh`

### ❌ "Database connection failed"
**Solution:**
- Check your password in `backend/.env.production`
- Restart: `docker-compose -f docker-compose.prod.yml restart`

### ❌ Services won't start
**Solution:**
```bash
# View errors:
docker-compose -f docker-compose.prod.yml logs

# Restart everything:
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

---

## Daily Maintenance (5 minutes/day)

### Check Logs
```bash
docker-compose -f docker-compose.prod.yml logs --tail=50 backend
```

### Check Backups
```bash
ls -lh /opt/civicvoice/backups/
```
*Should see daily backups*

### Check Server Health
```bash
docker stats --no-stream
```
*Shows CPU and memory usage*

---

## Getting Help

### View Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Restart Everything
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Stop Everything
```bash
docker-compose -f docker-compose.prod.yml down
```

### Start Everything
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## Cost Breakdown

**Monthly Costs:**
- Server: $20-40
- Domain: ~$1 (paid annually)
- SendGrid: FREE (or $15/month for more emails)
- Twilio: ~$1-5 (pay per SMS)
- Other APIs: FREE

**Total: ~$25-50/month**

---

## Important Notes

1. **Keep Your Passwords Safe:** Write them down securely
2. **Don't Share API Keys:** They're like passwords
3. **Check Backups:** Every week, verify backups exist
4. **Update Regularly:** Run `./scripts/deploy.sh` monthly for security updates
5. **Monitor Costs:** Check your server and Twilio bills

---

## What You've Accomplished! 🎉

✅ Set up a professional-grade server
✅ Installed all required software
✅ Configured security (firewall, SSL)
✅ Deployed the Civic Voice Platform
✅ Made it accessible on the internet
✅ Set up automatic backups

**You now have a live, secure civic engagement platform!**

---

## Need More Help?

**If you get stuck:**
1. Screenshot the error
2. Open an issue: https://github.com/DaddyRandom/civicvoice/issues
3. Include:
   - What step you're on
   - What command you ran
   - The error message
   - Your server OS (Ubuntu 22.04)

**We're here to help!**
