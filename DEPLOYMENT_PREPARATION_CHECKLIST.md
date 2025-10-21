# Deployment Preparation Checklist

## Current Project Status ✅

### Backend Ready
- ✅ Express.js server in `src/`
- ✅ Controllers, services, and routes
- ✅ Supabase integration
- ✅ Authentication system
- ✅ Email integration

### Frontend Ready  
- ✅ Next.js application in `farmtally-frontend/`
- ✅ TypeScript configuration
- ✅ UI components and pages
- ✅ Supabase client integration

## Pre-Deployment Requirements

### 1. Contabo VPS Setup
- [ ] VPS ordered (VPS S SSD recommended)
- [ ] Ubuntu 22.04 LTS selected
- [ ] IP address received
- [ ] SSH access confirmed
- [ ] Domain name ready

### 2. Environment Variables Needed
We'll need these values for production:

**Backend (.env)**
```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=https://yourdomain.com
```

**Frontend (.env.production)**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

### 3. Current Environment Status ✅

**Supabase Configuration Found:**
- ✅ Supabase URL: `https://qvxcbdglyvzohzdefnet.supabase.co`
- ✅ Supabase Anon Key: Available
- ✅ Frontend configured for Supabase Edge Functions

**What We Need to Update for VPS:**
- Change API URL from Supabase Edge Functions to your VPS
- Update CORS origins for your domain
- Set up production JWT secret
- Configure Gmail for email notifications

## Deployment Process Overview

### Phase 1: VPS Initial Setup (30 min)
1. Connect to your VPS via SSH
2. Create non-root user
3. Install basic security (firewall, SSH hardening)
4. Install Node.js, Nginx, PM2, Git

### Phase 2: Application Setup (45 min)
1. Clone your project to VPS
2. Create Express.js backend (convert from Supabase Edge Functions)
3. Configure environment variables
4. Install dependencies

### Phase 3: Build and Deploy (30 min)
1. Build Next.js frontend
2. Configure Nginx reverse proxy
3. Start applications with PM2
4. Test internal connectivity

### Phase 4: Domain and SSL (30 min)
1. Configure DNS records
2. Setup SSL certificates with Let's Encrypt
3. Final testing and monitoring setup

## Ready to Start?

**What I need from you:**
1. ✅ **Order Contabo VPS** (VPS S SSD with Ubuntu 22.04 LTS)
2. ✅ **Get domain name** (either from Contabo or external)
3. ✅ **Share VPS details** when ready:
   - IP address
   - SSH credentials
   - Domain name

**Current Project Status:**
- ✅ Backend code ready
- ✅ Frontend code ready  
- ✅ Supabase database ready
- ✅ Environment variables documented
- ✅ Deployment scripts prepared

**Estimated Total Time:** 2-3 hours for complete deployment

Once you have the VPS ready, we'll start with a simple SSH connection test and then proceed step by step through the deployment process.