# FarmTally VPS Deployment Plan

## Server Details
- **IP**: 147.93.153.247
- **Domain**: farmtally.in (marketing site already hosted)
- **Application URL**: app.farmtally.in (recommended)
- **SSH Access**: ✅ Available

## Deployment Strategy

### Option 1: Subdomain (Recommended)
- **Marketing Site**: farmtally.in
- **Application**: app.farmtally.in
- **API**: app.farmtally.in/api

### Option 2: Path-based
- **Marketing Site**: farmtally.in
- **Application**: farmtally.in/app
- **API**: farmtally.in/api

**Recommendation**: Use subdomain (app.farmtally.in) for cleaner separation and easier management.

## DNS Configuration Required

### For Subdomain Approach (app.farmtally.in)
Add this A record to your domain DNS:
```
Type: A
Name: app
Value: 147.93.153.247
TTL: 3600
```

### Current Marketing Site
We'll configure Nginx to:
- Serve marketing site on farmtally.in
- Serve FarmTally app on app.farmtally.in
- Both pointing to same VPS with different configurations

## Step-by-Step Deployment

Let's start the deployment process:

### Step 1: Connect and Initial Setup
```bash
ssh root@147.93.153.247
```

### Step 2: System Update and User Setup
```bash
# Update system
apt update && apt upgrade -y

# Create application user
adduser farmtally
usermod -aG sudo farmtally

# Switch to farmtally user
su - farmtally
```

### Step 3: Install Required Software
```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install other essentials
sudo apt install -y nginx git certbot python3-certbot-nginx

# Install PM2
sudo npm install -g pm2

# Verify installations
node --version
npm --version
nginx -v
```

### Step 4: Setup Application Directory
```bash
# Create app directory
sudo mkdir -p /var/www/farmtally
sudo chown farmtally:farmtally /var/www/farmtally
cd /var/www/farmtally

# Clone your repository (we'll do this step by step)
```

## Nginx Configuration Plan

### Marketing Site Configuration
```nginx
server {
    listen 80;
    server_name farmtally.in www.farmtally.in;
    
    # Your existing marketing site configuration
    root /var/www/marketing;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

### Application Configuration
```nginx
server {
    listen 80;
    server_name app.farmtally.in;
    
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
}
```

## Environment Variables for Production

### Backend (.env)
```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://qvxcbdglyvzohzdefnet.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eGNiZGdseXZ6b2h6ZGVmbmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTQxMzgsImV4cCI6MjA3NjI3MDEzOH0.hMzK3q1lQQPy7y0KMURxN-NwlOMO7WN_wFttWMyu9GM
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=production-jwt-secret-key-very-secure
FRONTEND_URL=https://app.farmtally.in
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### Frontend (.env.production)
```env
NEXT_PUBLIC_SUPABASE_URL=https://qvxcbdglyvzohzdefnet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eGNiZGdseXZ6b2h6ZGVmbmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTQxMzgsImV4cCI6MjA3NjI3MDEzOH0.hMzK3q1lQQPy7y0KMURxN-NwlOMO7WN_wFttWMyu9GM
NEXT_PUBLIC_API_URL=https://app.farmtally.in/api
NEXT_PUBLIC_APP_NAME=FarmTally
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=production
```

## Ready to Start?

I'll guide you through each step. Let's begin:

### First, let's connect to your VPS:
```bash
ssh root@147.93.153.247
```

**Questions for you:**
1. Do you prefer **app.farmtally.in** or **farmtally.in/app** for the application?
2. Do you have access to DNS management for farmtally.in?
3. Is there anything currently running on the VPS that we should be aware of?

Once you confirm these details, we'll start with the SSH connection and begin the deployment process step by step!