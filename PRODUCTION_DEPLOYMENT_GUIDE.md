# 🚀 FarmTally Production Deployment Guide

## 🎯 Deployment Overview

This guide will walk you through deploying FarmTally to production with all authentication, email, and business features ready.

## 📋 Pre-Deployment Checklist

### ✅ Code Ready
- [x] Authentication system implemented
- [x] Email integration complete
- [x] System admin dashboard ready
- [x] All business logic implemented
- [x] Security measures in place
- [x] Error handling implemented

### ✅ Environment Setup
- [ ] Production server provisioned
- [ ] Domain name configured
- [ ] SSL certificate ready
- [ ] Database server setup
- [ ] Email service configured

## 🌐 Deployment Options

### Option 1: Cloud Platform (Recommended)
- **Heroku** - Easy deployment with add-ons
- **Railway** - Modern platform with PostgreSQL
- **Render** - Free tier available
- **DigitalOcean App Platform** - Scalable solution

### Option 2: VPS/Dedicated Server
- **DigitalOcean Droplet**
- **AWS EC2**
- **Google Cloud Compute**
- **Linode**

### Option 3: Serverless
- **Vercel** (Frontend + API routes)
- **Netlify Functions**
- **AWS Lambda**

## 🚀 Quick Deploy to Railway (Recommended)

### Step 1: Prepare for Deployment

1. **Create production environment file:**
```bash
# Copy and edit environment variables
cp .env.example .env.production

# Edit with production values
nano .env.production
```

2. **Update package.json for production:**
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc && npm run copy-assets",
    "postinstall": "npm run build"
  },
  "engines": {
    "node": "18.x"
  }
}
```

### Step 2: Deploy to Railway

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login to Railway:**
```bash
railway login
```

3. **Initialize project:**
```bash
railway init
```

4. **Add PostgreSQL database:**
```bash
railway add postgresql
```

5. **Set environment variables:**
```bash
# Set production environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET="your-super-secure-jwt-secret-key"
railway variables set EMAIL_NOTIFICATIONS_ENABLED=true
railway variables set SMTP_HOST=smtp.gmail.com
railway variables set SMTP_USER=your-email@gmail.com
railway variables set SMTP_PASS=your-app-password
railway variables set SMTP_FROM_NAME=FarmTally
railway variables set SMTP_FROM_EMAIL=your-email@gmail.com
```

6. **Deploy:**
```bash
railway up
```

### Step 3: Database Setup

1. **Run migrations:**
```bash
railway run npx prisma migrate deploy
```

2. **Generate Prisma client:**
```bash
railway run npx prisma generate
```

### Step 4: Get your deployment URL
```bash
railway domain
```

## 🌊 Deploy to Heroku

### Step 1: Prepare Heroku Deployment

1. **Install Heroku CLI:**
```bash
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

2. **Login to Heroku:**
```bash
heroku login
```

3. **Create Heroku app:**
```bash
heroku create farmtally-backend
```

4. **Add PostgreSQL addon:**
```bash
heroku addons:create heroku-postgresql:mini
```

### Step 2: Configure Environment Variables

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET="your-super-secure-jwt-secret-key"
heroku config:set JWT_EXPIRES_IN="24h"
heroku config:set JWT_REFRESH_EXPIRES_IN="7d"
heroku config:set BCRYPT_SALT_ROUNDS=12
heroku config:set EMAIL_NOTIFICATIONS_ENABLED=true
heroku config:set SMTP_HOST=smtp.gmail.com
heroku config:set SMTP_PORT=587
heroku config:set SMTP_SECURE=false
heroku config:set SMTP_USER=your-email@gmail.com
heroku config:set SMTP_PASS=your-app-password
heroku config:set SMTP_FROM_NAME=FarmTally
heroku config:set SMTP_FROM_EMAIL=your-email@gmail.com
heroku config:set CORS_ORIGINS="https://your-frontend-domain.com"
```

### Step 3: Create Procfile

```bash
echo "web: npm start" > Procfile
```

### Step 4: Deploy

```bash
git add .
git commit -m "Deploy to production"
git push heroku main
```

### Step 5: Run Database Migrations

```bash
heroku run npx prisma migrate deploy
heroku run npx prisma generate
```

## 🔧 Manual VPS Deployment

### Step 1: Server Setup

1. **Create Ubuntu 20.04+ server**
2. **Update system:**
```bash
sudo apt update && sudo apt upgrade -y
```

3. **Install Node.js 18:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. **Install PostgreSQL:**
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

5. **Install PM2:**
```bash
sudo npm install -g pm2
```

### Step 2: Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE farmtally;
CREATE USER farmtally_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE farmtally TO farmtally_user;
\q
```

### Step 3: Deploy Application

1. **Clone repository:**
```bash
git clone <your-repo-url>
cd farmtally
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create production environment:**
```bash
cp .env.example .env
nano .env
```

4. **Build application:**
```bash
npm run build
```

5. **Run database migrations:**
```bash
npx prisma migrate deploy
npx prisma generate
```

6. **Start with PM2:**
```bash
pm2 start dist/server.js --name farmtally-backend
pm2 startup
pm2 save
```

### Step 4: Setup Nginx (Optional)

```bash
sudo apt install nginx -y

# Create nginx config
sudo nano /etc/nginx/sites-available/farmtally
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/farmtally /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 SSL Certificate Setup

### Using Certbot (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## 📧 Email Service Setup

### Option 1: Gmail (Development/Small Scale)

1. **Enable 2FA on Gmail account**
2. **Generate App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `SMTP_PASS`

### Option 2: SendGrid (Production Recommended)

1. **Create SendGrid account**
2. **Get API key**
3. **Configure environment:**
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM_EMAIL=noreply@yourdomain.com
```

### Option 3: Mailgun

1. **Create Mailgun account**
2. **Verify domain**
3. **Configure environment:**
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.com
SMTP_PASS=your-mailgun-password
```

## 🎯 Post-Deployment Setup

### Step 1: Create First System Admin

```bash
curl -X POST https://your-domain.com/api/system-admin/setup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "SecureAdminPassword123!",
    "firstName": "System",
    "lastName": "Administrator"
  }'
```

### Step 2: Test System Admin Login

```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "SecureAdminPassword123!"
  }'
```

### Step 3: Test Email Configuration

```bash
curl -X GET https://your-domain.com/api/email/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Step 4: Send Test Email

```bash
curl -X POST https://your-domain.com/api/email/test \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "test@yourdomain.com"}'
```

## 🔍 Health Checks

### API Health Check
```bash
curl https://your-domain.com/api/health
```

### Database Connection Check
```bash
curl https://your-domain.com/api/system-admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Email Service Check
```bash
curl https://your-domain.com/api/email/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Monitoring Setup

### Application Monitoring

1. **Error Logging:**
```javascript
// Add to your production environment
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

2. **Health Monitoring:**
```bash
# Add to crontab for health checks
*/5 * * * * curl -f https://your-domain.com/api/health || echo "API Down" | mail -s "FarmTally API Alert" admin@yourdomain.com
```

### Database Monitoring

```bash
# Monitor database connections
SELECT count(*) FROM pg_stat_activity;

# Monitor database size
SELECT pg_size_pretty(pg_database_size('farmtally'));
```

## 🔄 Backup Strategy

### Database Backup

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump farmtally > /backups/farmtally_$DATE.sql
find /backups -name "farmtally_*.sql" -mtime +7 -delete
```

### Application Backup

```bash
# Backup application files
tar -czf /backups/farmtally_app_$(date +%Y%m%d).tar.gz /path/to/farmtally
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database connectivity
psql -h localhost -U farmtally_user -d farmtally
```

2. **Email Not Sending:**
```bash
# Check SMTP credentials
curl -X GET https://your-domain.com/api/email/status \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test email configuration
curl -X POST https://your-domain.com/api/email/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"testEmail": "test@example.com"}'
```

3. **JWT Token Issues:**
```bash
# Verify JWT secret is set
echo $JWT_SECRET

# Check token expiration settings
echo $JWT_EXPIRES_IN
```

4. **CORS Issues:**
```bash
# Update CORS origins
heroku config:set CORS_ORIGINS="https://your-frontend-domain.com,https://www.your-frontend-domain.com"
```

## 🎉 Deployment Complete!

### Verification Checklist

- [ ] API endpoints responding
- [ ] Database connected and migrated
- [ ] System admin can be created
- [ ] System admin can login
- [ ] Email notifications working
- [ ] Dashboard accessible
- [ ] User registration working
- [ ] User approval workflow working
- [ ] SSL certificate active
- [ ] Domain pointing correctly

### Next Steps

1. **Create system admin account**
2. **Test complete user registration flow**
3. **Configure email templates for your brand**
4. **Set up monitoring and alerts**
5. **Create user documentation**
6. **Train initial users**
7. **Monitor system performance**

## 📞 Support

### Production URLs
- **API Base:** `https://your-domain.com/api`
- **System Admin:** `https://your-domain.com/system-admin`
- **Health Check:** `https://your-domain.com/api/health`

### Important Credentials
- **System Admin Email:** admin@yourdomain.com
- **Database:** farmtally
- **Email Service:** [Your chosen provider]

**🎉 FarmTally is now live in production!** 

Your corn procurement management system is ready to handle:
- ✅ User registrations and approvals
- ✅ Lorry request management
- ✅ Delivery tracking and payments
- ✅ Email notifications
- ✅ Multi-organization support

**Welcome to production! 🌾🚀✨**