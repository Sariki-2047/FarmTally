# ⚡ Quick Database Setup (5 Minutes)

## Option 1: Supabase (Free & Fast)

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub/Google
4. Create new project:
   - Name: "farmtally-db"
   - Password: (choose strong password)
   - Region: (closest to you)

### Step 2: Get Connection String
1. Go to Settings → Database
2. Copy the connection string
3. It looks like: `postgresql://postgres:[password]@[host]:5432/postgres`

### Step 3: Update Environment
```bash
# Create .env file
cp .env.example .env

# Edit .env file and update:
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"
```

### Step 4: Setup Database
```bash
# Run the setup script
node setup-production-db.js

# Or manually:
npm run db:setup
```

## Option 2: Railway (Also Free)

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project
4. Add PostgreSQL service

### Step 2: Get Connection String
1. Click on PostgreSQL service
2. Go to Variables tab
3. Copy DATABASE_URL

### Step 3: Same as above (update .env and run setup)

## Verification

After setup, verify everything works:
```bash
# Check database connection
npx prisma studio

# Start backend with real database
npm run dev

# Start web app
node serve-web.js
```

## What You'll Get

✅ **Complete database** with all tables  
✅ **Sample data** including:
   - 1 Organization (FarmTally Demo)
   - 2 Users (Admin & Field Manager)
   - 3 Lorries (Alpha, Beta, Gamma)
   - 3 Farmers (Rajesh, Sunita, Mohan)
   - Sample deliveries and transactions
   - Notifications and audit logs

✅ **Login credentials:**
   - Admin: admin@farmtally.com / Admin123!
   - Manager: manager@farmtally.com / Manager123!

The app will now work with **real data** instead of simulated responses!