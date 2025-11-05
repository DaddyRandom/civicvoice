# Civic Voice Platform - Setup Checklist

Print this page and check off each item as you complete it!

---

## PREPARATION PHASE

### Get a Server
- [ ] Sign up at DigitalOcean, Linode, or Vultr
- [ ] Create Ubuntu 22.04 server (4GB RAM, 2 CPUs)
- [ ] Write down server IP: `___________________`
- [ ] Write down server password: `___________________`
- [ ] Test connection: Can you SSH into the server?

### Get a Domain Name
- [ ] Buy domain from Namecheap, Google Domains, or GoDaddy
- [ ] Domain name: `___________________`
- [ ] Login saved: Username `___________________`

### Get API Keys

#### Google Civic Information API
- [ ] Sign up at https://console.cloud.google.com
- [ ] Create project
- [ ] Enable Civic Information API
- [ ] Create API key
- [ ] API Key: `___________________`

#### ProPublica Congress API
- [ ] Request at https://www.propublica.org/datastore/api/propublica-congress-api
- [ ] Check email for API key
- [ ] API Key: `___________________`

#### SendGrid (Email)
- [ ] Sign up at https://sendgrid.com
- [ ] Verify email address
- [ ] Create API key
- [ ] API Key: `___________________`

#### Twilio (SMS)
- [ ] Sign up at https://www.twilio.com
- [ ] Get a phone number
- [ ] Account SID: `___________________`
- [ ] Auth Token: `___________________`
- [ ] Phone Number: `___________________`

### Generate Passwords
- [ ] Database Password (20+ characters): `___________________`
- [ ] Redis Password (20+ characters): `___________________`
- [ ] Run `openssl rand -base64 64` for JWT Secret
- [ ] JWT Secret saved
- [ ] Run again for JWT Refresh Secret
- [ ] JWT Refresh Secret saved

---

## SETUP PHASE

### Step 1: Connect to Server
- [ ] Open Terminal (Mac/Linux) or PuTTY (Windows)
- [ ] Connect: `ssh root@YOUR_SERVER_IP`
- [ ] Successfully logged in

### Step 2: Install Software
- [ ] Run: `wget https://raw.githubusercontent.com/DaddyRandom/civicvoice/main/scripts/setup-server.sh`
- [ ] Run: `chmod +x setup-server.sh`
- [ ] Run: `./setup-server.sh`
- [ ] Wait for completion (5-10 minutes)
- [ ] Run: `su - civicvoice`
- [ ] Now logged in as civicvoice user

### Step 3: Download Code
- [ ] Run: `cd /opt/civicvoice`
- [ ] Run: `git clone https://github.com/DaddyRandom/civicvoice.git .`
- [ ] Wait for download to complete
- [ ] Run: `ls` - you should see folders like `backend`, `docs`, `scripts`

### Step 4: Configure Domain
- [ ] Go to domain registrar (Namecheap, etc.)
- [ ] Find DNS settings
- [ ] Add A record: `api` pointing to server IP
- [ ] Save changes
- [ ] Wait 10-30 minutes
- [ ] Test: `ping api.yourdomain.com` - should work

### Step 5: Configure Application
- [ ] Run: `cp backend/.env.production.example backend/.env.production`
- [ ] Run: `nano backend/.env.production`
- [ ] Update `DB_PASSWORD` with your database password
- [ ] Update `REDIS_PASSWORD` with your Redis password
- [ ] Update `JWT_SECRET` with generated secret
- [ ] Update `JWT_REFRESH_SECRET` with generated secret
- [ ] Add `GOOGLE_CIVIC_API_KEY`
- [ ] Add `PROPUBLICA_API_KEY`
- [ ] Add `SENDGRID_API_KEY`
- [ ] Add `TWILIO_ACCOUNT_SID`
- [ ] Add `TWILIO_AUTH_TOKEN`
- [ ] Add `TWILIO_PHONE_NUMBER`
- [ ] Update `CORS_ORIGIN` with your domain
- [ ] Update `BACKEND_URL` with your API domain
- [ ] Save file (Ctrl + X, Y, Enter)

### Step 6: Setup SSL
- [ ] Run: `nano scripts/init-ssl.sh`
- [ ] Change `DOMAIN` to your API domain
- [ ] Change `EMAIL` to your email
- [ ] Save file (Ctrl + X, Y, Enter)
- [ ] Run: `./scripts/init-ssl.sh`
- [ ] Wait 2-3 minutes
- [ ] See success message about certificate

### Step 7: Deploy
- [ ] Run: `./scripts/deploy.sh production`
- [ ] Wait 5-10 minutes
- [ ] See "Deployment completed successfully!" message
- [ ] No error messages

---

## VERIFICATION PHASE

### Test Your Platform
- [ ] Open browser: `https://api.yourdomain.com/api/health`
- [ ] See: `{"success":true,"message":"Civic Voice API is running"...}`
- [ ] Try creating test user (see guide for curl command)
- [ ] Receive success response

### Check Services
- [ ] Run: `docker-compose -f docker-compose.prod.yml ps`
- [ ] All services show "Up" status
- [ ] No services show "Exit" or "Restarting"

### Check Logs
- [ ] Run: `docker-compose -f docker-compose.prod.yml logs backend --tail=50`
- [ ] No error messages (ignore warnings)
- [ ] See "Server running" message

### Check Backups
- [ ] Run: `ls -lh /opt/civicvoice/backups/`
- [ ] See backup files (may take 24 hours for first backup)

---

## POST-SETUP

### Document Everything
- [ ] Server IP saved in safe place
- [ ] All passwords saved securely
- [ ] All API keys saved
- [ ] Domain login info saved

### Set Reminders
- [ ] Calendar: Check logs weekly
- [ ] Calendar: Verify backups monthly
- [ ] Calendar: Update platform monthly
- [ ] Calendar: Renew domain before expiration

### Next Steps
- [ ] Read full documentation
- [ ] Plan frontend development
- [ ] Set up monitoring (optional)
- [ ] Test all features

---

## EMERGENCY CONTACTS

**If Something Goes Wrong:**

Server Provider: `___________________`
Support Number: `___________________`

Domain Provider: `___________________`
Support Number: `___________________`

Developer Contact: `___________________`
Phone/Email: `___________________`

---

## QUICK REFERENCE COMMANDS

**View logs:**
```bash
docker-compose -f docker-compose.prod.yml logs -f backend
```

**Restart services:**
```bash
docker-compose -f docker-compose.prod.yml restart
```

**Check status:**
```bash
docker-compose -f docker-compose.prod.yml ps
```

**Update platform:**
```bash
cd /opt/civicvoice
git pull origin main
./scripts/deploy.sh production
```

**Manual backup:**
```bash
docker-compose -f docker-compose.prod.yml exec backup /backup.sh
```

---

## COMPLETION

### ✅ Setup Complete!

Date Completed: `___________________`

Time Spent: `___________________`

Your Platform URL: `___________________`

Notes:
```
_________________________________________________
_________________________________________________
_________________________________________________
_________________________________________________
```

---

**🎉 Congratulations! Your Civic Voice Platform is Live! 🎉**

Keep this checklist for reference and future updates.
