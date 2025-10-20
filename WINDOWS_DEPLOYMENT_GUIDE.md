# 🚀 FarmTally Windows Deployment Guide

## Overview

Since the Supabase CLI installation failed on Windows, we have multiple deployment options that work perfectly on Windows systems.

## 🎯 Deployment Options

### Option 1: Supabase (Manual Setup) ⭐ Recommended
### Option 2: Railway (Automated)
### Option 3: Heroku (Traditional)
### Option 4: Vercel (Frontend + Serverless)

---

## 🌟 Option 1: Supabase Manual Deployment

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/login to your account
3. Click "New Project"
4. Choose your organization
5. Enter project name: `farmtally`
6. Set a strong database password
7. Select region closest to your users
8. Click "Create new project"

### Step 2: Setup Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `supabase/migrations/20241018000001_initial_schema.sql`
3. Paste it in the SQL Editor
4. Click **Run** to create the database schema

### Step 3: Seed Sample Data (Optional)
1. In the SQL Editor, copy contents of `supabase/seed.sql`
2. Paste and run to create sample data
3. This creates test accounts and sample organizations

### Step 4: Configure Flutter App
1. In Supabase dashboard, go to **Settings > API**
2. Copy your **Project URL** and **anon public key**
3. Open `farmtally_mobile/lib/core/config/supabase_config.dart`
4. Replace:
   ```dart
   static const String supabaseUrl = 'YOUR_PROJECT_URL_HERE';
   static const String supabaseAnonKey = 'YOUR_ANON_KEY_HERE';
   ```

### Step 5: Build Flutter Web App
```cmd
cd farmtally_mobile
flutter pub get
flutter build web --release
```

### Step 6: Deploy Frontend
Deploy the `farmtally_mobile/build/web` folder to:
- **Vercel**: `npx vercel --prod build/web`
- **Netlify**: `npx netlify-cli deploy --prod --dir build/web`
- **Firebase**: `firebase deploy --only hosting`

### Step 7: Configure CORS
1. In Supabase dashboard, go to **Authentication > Settings**
2. Add your frontend URL to **Site URL**
3. Add to **Redirect URLs** if needed

---

## 🚂 Option 2: Railway Deployment

### Quick Railway Deployment
```cmd
deploy-railway.bat
```

This will:
1. Install Railway CLI
2. Create new project with PostgreSQL
3. Deploy backend automatically
4. Setup database with migrations
5. Build Flutter web app

### Manual Railway Steps
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Add database: `railway add postgresql`
5. Deploy: `railway up`
6. Run migrations: `railway run npm run migrate`

---

## 🌐 Option 3: Heroku Deployment

### Prerequisites
1. Install Heroku CLI from [devcenter.heroku.com](https://devcenter.heroku.com/articles/heroku-cli)
2. Create Heroku account

### Deployment Steps
```cmd
heroku login
heroku create farmtally-your-name
heroku addons:create heroku-postgresql:hobby-dev
git add .
git commit -m "Deploy to Heroku"
git push heroku main
heroku run npm run migrate
heroku run npm run seed
```

---

## ⚡ Option 4: Vercel (Serverless)

### Backend as Serverless Functions
1. Create `api/` folder in project root
2. Convert Express routes to Vercel functions
3. Deploy with: `vercel --prod`

### Frontend Deployment
```cmd
cd farmtally_mobile
flutter build web --release
cd build/web
vercel --prod
```

---

## 🔧 Windows-Specific Commands

### Build Production Version
```cmd
build-production.bat
```

### Start Production Server
```cmd
start-production.bat
```

### Deploy to Supabase (Manual)
```cmd
deploy-supabase-windows.bat
```

### Deploy to Railway
```cmd
deploy-railway.bat
```

---

## 📊 Database Configuration

### Supabase Database Features
- ✅ **PostgreSQL 15** with full SQL support
- ✅ **Row Level Security** for multi-tenant isolation
- ✅ **Real-time subscriptions** for live updates
- ✅ **Automatic backups** and point-in-time recovery
- ✅ **Built-in authentication** with JWT tokens

### Sample Data Included
- 2 Organizations (Green Valley Farms, Sunrise Agriculture)
- 5 Users (Admins and Field Managers)
- 5 Farmers with contact information
- 5 Lorries with different statuses
- Sample deliveries and payments

---

## 🔐 Authentication Setup

### Test Accounts (After Seeding)
```
Farm Admin: admin@greenvalley.com / password123
Field Manager: manager1@greenvalley.com / password123
```

### Authentication Flow
1. **Login** with email/password
2. **JWT token** returned from Supabase
3. **Role-based access** (Farm Admin, Field Manager, Farmer)
4. **Organization isolation** via Row Level Security

---

## 🌐 Frontend Deployment Options

### Vercel (Recommended)
```cmd
cd farmtally_mobile/build/web
npx vercel --prod
```

### Netlify
```cmd
npm install -g netlify-cli
cd farmtally_mobile/build/web
netlify deploy --prod --dir .
```

### Firebase Hosting
```cmd
npm install -g firebase-tools
firebase init hosting
firebase deploy --only hosting
```

### GitHub Pages
1. Push `build/web` contents to `gh-pages` branch
2. Enable GitHub Pages in repository settings

---

## 🔧 Configuration Files

### Environment Variables (.env)
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
CORS_ORIGINS=https://your-frontend-domain.com
```

### Supabase Configuration
```dart
// farmtally_mobile/lib/core/config/supabase_config.dart
class SupabaseConfig {
  static const String supabaseUrl = 'https://your-project.supabase.co';
  static const String supabaseAnonKey = 'your-anon-key';
}
```

---

## 🐛 Troubleshooting

### Common Windows Issues

1. **PowerShell Execution Policy**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **Node.js Path Issues**
   - Restart command prompt after Node.js installation
   - Verify with: `node --version` and `npm --version`

3. **Flutter Not Found**
   - Add Flutter to PATH environment variable
   - Restart command prompt
   - Verify with: `flutter --version`

4. **Git Not Found**
   - Install Git for Windows
   - Add to PATH during installation

### Database Connection Issues
1. Check DATABASE_URL format
2. Verify firewall settings
3. Ensure SSL is enabled for production

### CORS Issues
1. Add your frontend domain to allowed origins
2. Include both HTTP and HTTPS versions
3. Check for trailing slashes

---

## 📈 Performance Optimization

### Database Optimization
- ✅ Proper indexing on frequently queried columns
- ✅ Connection pooling for high concurrency
- ✅ Query optimization with EXPLAIN ANALYZE

### Frontend Optimization
- ✅ Code splitting with lazy loading
- ✅ Image optimization and compression
- ✅ Service worker for offline functionality
- ✅ Gzip compression for assets

---

## 🎯 Production Checklist

### Pre-deployment
- [ ] Database schema deployed
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] SSL certificates ready
- [ ] Domain name configured

### Post-deployment
- [ ] Test all user flows
- [ ] Verify authentication works
- [ ] Check real-time updates
- [ ] Monitor performance
- [ ] Set up error tracking

---

## 🆘 Support Resources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Flutter Web Docs](https://flutter.dev/web)

### Community Support
- [Supabase Discord](https://discord.supabase.com)
- [Railway Discord](https://discord.gg/railway)
- [Flutter Community](https://flutter.dev/community)

---

## 🎉 Success Metrics

After successful deployment, you'll have:
- ✅ **Scalable database** with automatic backups
- ✅ **Real-time API** with global edge deployment
- ✅ **Responsive web app** that works on all devices
- ✅ **Multi-tenant security** with data isolation
- ✅ **Production monitoring** and error tracking

Your FarmTally system is now ready for production use! 🌽✨

---

## 📞 Next Steps

1. **Test the deployment** with sample accounts
2. **Configure your domain** and SSL
3. **Set up monitoring** and alerts
4. **Train your users** on the system
5. **Plan for scaling** as usage grows

**Congratulations!** Your corn procurement management system is now live and ready to streamline your agricultural operations! 🚀