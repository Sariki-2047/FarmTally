# FarmTally Quick Start Guide

## 🚀 Get Up and Running in 15 Minutes

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ running
- Git access to repository
- VPS access (for deployment)

## Step 1: Clone & Setup Backend (5 minutes)

```bash
# Clone the repository
git clone [repository-url]
cd farmtally-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database URL
nano .env
```

**Required .env variables:**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/farmtally
JWT_SECRET=your-secret-key
SMTP_USER=noreply@farmtally.in
SMTP_PASS=2t/!P1K]w
```

## Step 2: Database Setup (3 minutes)

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed demo data
npx prisma db seed
```

## Step 3: Start Development Server (1 minute)

```bash
# Start simple server (recommended)
npm run dev:simple

# Server will start on http://localhost:9999
# Health check: http://localhost:9999/health
```

## Step 4: Setup Frontend (3 minutes)

```bash
# In new terminal
cd farmtally-frontend

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit API URL
echo "NEXT_PUBLIC_API_URL=http://localhost:9999" > .env.local

# Start frontend
npm run dev
```

## Step 5: Test Everything (3 minutes)

```bash
# Test backend
node test-simple-server.js

# Should show:
# ✅ Health check passed
# ✅ API test endpoint passed
# ✅ Login test passed
# ✅ Authenticated request passed
```

**Test in browser:**
1. Open http://localhost:3000
2. Login with: `admin@farmtally.com` / `Admin123!`
3. Should see dashboard

## 🚨 If Something Goes Wrong

### Backend won't start?
```bash
# Check Node version
node --version  # Should be 18+

# Check database connection
npx prisma db pull

# Check environment
cat .env | grep DATABASE_URL
```

### Frontend can't connect?
```bash
# Check API URL
cat farmtally-frontend/.env.local

# Test backend directly
curl http://localhost:9999/health
```

### Database issues?
```bash
# Reset database
npx prisma migrate reset

# Re-seed data
npx prisma db seed
```

## 🚀 Deploy to Production

### Quick VPS Deployment
```bash
# Deploy simple server (safest option)
./deploy-simple-server.sh

# Or manual deployment
ssh root@147.93.153.247
cd /root/farmtally
git pull
npm install
pm2 restart farmtally-backend
```

### Update Frontend
```bash
# Frontend auto-deploys on git push to main
git push origin main
```

## 🧪 Demo Accounts

```
Farm Admin:     admin@farmtally.com / Admin123!
Field Manager:  manager@farmtally.com / Manager123!
Farmer:         farmer@farmtally.com / Farmer123!
```

## 📞 Emergency Contacts

- **VPS**: root@147.93.153.247 (SSH key required)
- **Frontend**: https://app.farmtally.in (Vercel)
- **Email**: noreply@farmtally.in (Hostinger)

## 🔧 Common Commands

```bash
# Backend
npm run dev:simple    # Start simple server
npm run dev          # Start full server (may have issues)
npm run build        # Build for production
npm test             # Run tests

# Frontend
npm run dev          # Start development
npm run build        # Build for production
npm run start        # Start production build

# Database
npx prisma studio    # Database GUI
npx prisma migrate dev  # Run migrations
npx prisma db seed   # Seed demo data

# Deployment
pm2 status           # Check server status
pm2 logs farmtally-backend  # View logs
pm2 restart farmtally-backend  # Restart server
```

## 🎯 What Works Right Now

✅ **Authentication**: Login/logout/registration  
✅ **User Management**: Role-based access  
✅ **Basic CRUD**: Farmers, lorries, deliveries  
✅ **Email System**: SMTP configured and working  
✅ **Frontend**: Next.js app with Tailwind UI  
✅ **Database**: PostgreSQL with Prisma ORM  

## ⚠️ Known Issues

❌ **Full Server Build**: TypeScript errors (use simple server)  
❌ **HTTPS**: Backend uses HTTP only  
❌ **Tests**: Minimal test coverage  
❌ **Schema**: Some Prisma model mismatches  

## 📚 Next Steps

1. **Fix Schema Issues**: Run `npx prisma db pull` and fix TypeScript errors
2. **Add HTTPS**: Configure SSL on VPS
3. **Write Tests**: Add comprehensive test coverage
4. **Monitor**: Set up logging and error tracking
5. **Optimize**: Add caching and performance improvements

---

**Need Help?** Check the full `DEVELOPER_HANDOVER_DOCUMENT.md` for detailed information.