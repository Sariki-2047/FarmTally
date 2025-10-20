# 🚀 FarmTally Quick Start Guide

## ✅ Project Status After Cleanup

Your FarmTally project has been successfully cleaned up and is ready to run! However, you need to set up a database connection first.

## 🗄️ Database Setup Options

### Option 1: Railway PostgreSQL (Recommended - Free & Fast)

1. **Go to Railway**: https://railway.app
2. **Sign up** with GitHub
3. **Create New Project** → **Provision PostgreSQL**
4. **Copy Database URL** from Railway dashboard
5. **Update your .env file**:
   ```env
   DATABASE_URL="postgresql://postgres:password@host:port/database"
   ```

### Option 2: Neon PostgreSQL (Free Tier)

1. **Go to Neon**: https://neon.tech
2. **Sign up** and create a new project
3. **Copy connection string**
4. **Update your .env file**

### Option 3: Local PostgreSQL

1. **Install PostgreSQL**: https://www.postgresql.org/download/
2. **Create database**: `createdb farmtally`
3. **Update .env**:
   ```env
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/farmtally"
   ```

## 🚀 Quick Start Commands

Once you have your database URL set up:

### 1. Install Dependencies (if not done)
```bash
npm install
```

### 2. Generate Prisma Client
```bash
npm run generate
```

### 3. Run Database Migrations
```bash
npm run migrate
```

### 4. Seed Sample Data
```bash
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```

### 6. Test the API
Open another terminal and run:
```bash
node test-current-backend.js
```

## 🌐 Access Your Application

### Backend API
- **URL**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **API Docs**: See API_DOCUMENTATION.md

### Frontend (Flutter Web)
```bash
cd farmtally_mobile
flutter pub get
flutter run -d chrome --web-port 3001
```
- **URL**: http://localhost:3001

## 🔐 Test Credentials

After seeding the database, use these credentials:

### Farm Admin
- **Email**: `admin@farmtally.com`
- **Password**: `Admin123!`

### Field Manager
- **Email**: `manager@farmtally.com`
- **Password**: `Manager123!`

### Farmer
- **Email**: `farmer@farmtally.com`
- **Password**: `Farmer123!`

## 🧪 Testing Your Setup

### 1. Quick Backend Test
```bash
# Test database connection
node test-db-connection.js

# Test API endpoints
node test-current-backend.js
```

### 2. Full System Test
Use the **TESTING_CHECKLIST.md** for comprehensive testing

### 3. User Acceptance Testing
Use **USER_ACCEPTANCE_TESTING.md** for detailed validation

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Check if your DATABASE_URL is correct
echo $DATABASE_URL

# Test connection manually
node test-db-connection.js
```

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

### Prisma Issues
```bash
# Reset Prisma
npm run generate
npx prisma db push
npm run seed
```

## 📁 Current Project Structure

```
FarmTally/
├── src/                    # Backend API (Node.js + Express)
├── farmtally_mobile/       # Frontend App (Flutter)
├── prisma/                 # Database Schema & Migrations
├── docs/                   # Project Documentation
├── deploy.sh              # Production Deployment
├── package.json           # Dependencies & Scripts
└── .env                   # Environment Configuration
```

## 🎯 Next Steps

1. **Set up database** using one of the options above
2. **Run the quick start commands**
3. **Test the system** using the testing documentation
4. **Deploy to production** using `./deploy.sh railway`

## 📞 Need Help?

- **Check**: API_DOCUMENTATION.md for API reference
- **Use**: BUG_REPORT_TEMPLATE.md to report issues
- **Request**: FEATURE_REQUEST_TEMPLATE.md for enhancements
- **Test**: TESTING_CHECKLIST.md for validation

---

**Your FarmTally system is ready to go! Just set up the database and you're all set.** 🌾✨