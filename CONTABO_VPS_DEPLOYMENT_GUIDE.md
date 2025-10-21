# Contabo VPS Deployment Guide

## Overview
This guide covers deploying both the FarmTally frontend (Next.js) and backend (Supabase Edge Functions) to a Contabo VPS using Docker and Nginx.

## Prerequisites
- Contabo VPS with Ubuntu 20.04+ or similar
- Domain name pointed to your VPS IP
- SSH access to your VPS

## VPS Setup

### 1. Initial Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

### 2. Setup Application Directory
```bash
# Create application directory
sudo mkdir -p /var/www/farmtally
sudo chown $USER:$USER /var/www/farmtally
cd /var/www/farmtally

# Clone your repository
git clone https://github.com/yourusername/farmtally.git .
```

## Backend Deployment (Supabase Edge Functions Alternative)

Since we can't run Supabase Edge Functions directly on VPS, we'll create a Node.js Express server that mimics the functionality.

### 1. Create Express Server
```bash
mkdir -p /var/www/farmtally/backend
cd /var/www/farmtally/backend
```

### 2. Backend Configuration Files
Create the following files in the backend directory:

**package.json**
```json
{
  "name": "farmtally-backend",
  "version": "1.0.0",
  "description": "FarmTally Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "dotenv": "^16.3.1",
    "@supabase/supabase-js": "^2.38.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "nodemailer": "^6.9.7"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

**server.js**
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Import your existing API routes here
// app.use('/api', require('./routes'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**.env**
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 3. PM2 Configuration
**ecosystem.config.js**
```javascript
module.exports = {
  apps: [{
    name: 'farmtally-backend',
    script: 'server.js',
    cwd: '/var/www/farmtally/backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/pm2/farmtally-backend-error.log',
    out_file: '/var/log/pm2/farmtally-backend-out.log',
    log_file: '/var/log/pm2/farmtally-backend.log'
  }]
};
```

## Frontend Deployment (Next.js)

### 1. Build Configuration
**next.config.js** (update if needed)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  }
}

module.exports = nextConfig
```

### 2. Frontend Environment
**farmtally-frontend/.env.production**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

### 3. Build and Deploy Frontend
```bash
cd /var/www/farmtally/farmtally-frontend
npm install
npm run build
```

## Nginx Configuration

### 1. Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/farmtally
```

**Nginx Config:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration (will be added by Certbot)
    
    # Frontend (Next.js)
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
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

### 2. Enable Site and SSL
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/farmtally /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Deployment Scripts

### 1. Backend Deployment Script
**deploy-backend.sh**
```bash
#!/bin/bash
set -e

echo "Deploying FarmTally Backend..."

# Navigate to backend directory
cd /var/www/farmtally/backend

# Install dependencies
npm install --production

# Restart PM2 process
pm2 restart farmtally-backend || pm2 start ecosystem.config.js

echo "Backend deployment complete!"
```

### 2. Frontend Deployment Script
**deploy-frontend.sh**
```bash
#!/bin/bash
set -e

echo "Deploying FarmTally Frontend..."

# Navigate to frontend directory
cd /var/www/farmtally/farmtally-frontend

# Install dependencies
npm install

# Build the application
npm run build

# Restart PM2 process
pm2 restart farmtally-frontend || pm2 start npm --name "farmtally-frontend" -- start

echo "Frontend deployment complete!"
```

### 3. Full Deployment Script
**deploy.sh**
```bash
#!/bin/bash
set -e

echo "Starting FarmTally deployment..."

# Pull latest code
cd /var/www/farmtally
git pull origin main

# Deploy backend
./deploy-backend.sh

# Deploy frontend
./deploy-frontend.sh

# Save PM2 configuration
pm2 save
pm2 startup

echo "Deployment complete!"
echo "Frontend: https://yourdomain.com"
echo "Backend API: https://yourdomain.com/api"
```

## Monitoring and Maintenance

### 1. PM2 Monitoring
```bash
# View running processes
pm2 list

# View logs
pm2 logs farmtally-backend
pm2 logs farmtally-frontend

# Monitor resources
pm2 monit
```

### 2. Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### 3. System Monitoring
```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check running processes
htop
```

## Security Considerations

### 1. Firewall Setup
```bash
# Install UFW
sudo apt install ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. Regular Updates
```bash
# Create update script
sudo nano /usr/local/bin/update-system.sh
```

**update-system.sh**
```bash
#!/bin/bash
apt update && apt upgrade -y
npm update -g
pm2 update
certbot renew --quiet
```

### 3. Backup Strategy
```bash
# Create backup script
sudo nano /usr/local/bin/backup-farmtally.sh
```

**backup-farmtally.sh**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/farmtally"

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/farmtally_$DATE.tar.gz /var/www/farmtally

# Backup database (if using local PostgreSQL)
# pg_dump farmtally > $BACKUP_DIR/farmtally_db_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "farmtally_*.tar.gz" -mtime +7 -delete
```

## Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure ports 3000 and 3001 are available
2. **Permission issues**: Check file ownership and permissions
3. **SSL certificate issues**: Verify domain DNS settings
4. **Memory issues**: Monitor RAM usage with `htop`

### Useful Commands
```bash
# Check port usage
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :3001

# Check service status
sudo systemctl status nginx
pm2 status

# Restart services
sudo systemctl restart nginx
pm2 restart all
```

This deployment setup gives you full control over your application with proper monitoring, security, and maintenance procedures.