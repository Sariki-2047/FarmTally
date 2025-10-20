# 🐘 PostgreSQL Setup for Windows - FarmTally

## 📋 Quick Setup Guide

Follow these steps to install and configure PostgreSQL for your FarmTally development environment.

## 🚀 Step 1: Download PostgreSQL

### Option A: Official PostgreSQL Installer (Recommended)
1. **Go to**: https://www.postgresql.org/download/windows/
2. **Click**: "Download the installer"
3. **Choose**: Latest version (PostgreSQL 16.x)
4. **Download**: The Windows x86-64 installer

### Option B: Using Chocolatey (if you have it)
```powershell
choco install postgresql
```

### Option C: Using Winget
```powershell
winget install PostgreSQL.PostgreSQL
```

## 🔧 Step 2: Install PostgreSQL

1. **Run the installer** as Administrator
2. **Installation Directory**: Keep default (`C:\Program Files\PostgreSQL\16`)
3. **Components**: Select all (PostgreSQL Server, pgAdmin 4, Stack Builder, Command Line Tools)
4. **Data Directory**: Keep default (`C:\Program Files\PostgreSQL\16\data`)
5. **Password**: Set a password for the `postgres` user (remember this!)
   - **Suggestion**: Use `farmtally123` for development
6. **Port**: Keep default `5432`
7. **Locale**: Keep default
8. **Click**: Install and wait for completion

## ⚙️ Step 3: Verify Installation

Open **Command Prompt** or **PowerShell** as Administrator:

```powershell
# Add PostgreSQL to PATH (if not automatically added)
$env:PATH += ";C:\Program Files\PostgreSQL\16\bin"

# Test PostgreSQL
psql --version
```

You should see something like: `psql (PostgreSQL) 16.x`

## 🗄️ Step 4: Create FarmTally Database

### Method A: Using Command Line
```powershell
# Connect to PostgreSQL (enter password when prompted)
psql -U postgres -h localhost

# Create the database
CREATE DATABASE farmtally;

# Create a dedicated user (optional but recommended)
CREATE USER farmtally_user WITH PASSWORD 'farmtally123';
GRANT ALL PRIVILEGES ON DATABASE farmtally TO farmtally_user;

# Exit PostgreSQL
\q
```

### Method B: Using pgAdmin (GUI)
1. **Open pgAdmin 4** (installed with PostgreSQL)
2. **Connect** to PostgreSQL server (localhost)
3. **Right-click** on "Databases" → "Create" → "Database"
4. **Name**: `farmtally`
5. **Click**: Save

## 🔑 Step 5: Update FarmTally Configuration

Update your `.env` file with the correct database URL:

### If using default postgres user:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/farmtally"
```

### If you created farmtally_user:
```env
DATABASE_URL="postgresql://farmtally_user:farmtally123@localhost:5432/farmtally"
```

**Replace `your_password` with the password you set during installation!**

## 🧪 Step 6: Test Database Connection

```powershell
# Test the connection
node test-db-connection.js
```

You should see: ✅ Database connection successful!

## 🚀 Step 7: Initialize FarmTally Database

```powershell
# Generate Prisma client
npm run generate

# Create database tables
npm run migrate

# Add sample data
npm run seed

# Start development server
npm run dev
```

## 🔧 Troubleshooting

### Issue: "psql command not found"
**Solution**: Add PostgreSQL to your PATH
```powershell
# Temporary (current session)
$env:PATH += ";C:\Program Files\PostgreSQL\16\bin"

# Permanent (add to system PATH)
# Go to System Properties → Environment Variables → PATH → Add:
# C:\Program Files\PostgreSQL\16\bin
```

### Issue: "Connection refused"
**Solutions**:
1. **Check if PostgreSQL is running**:
   ```powershell
   # Check service status
   Get-Service postgresql*
   
   # Start service if stopped
   Start-Service postgresql-x64-16
   ```

2. **Check port 5432**:
   ```powershell
   netstat -an | findstr 5432
   ```

### Issue: "Authentication failed"
**Solutions**:
1. **Double-check password** in your DATABASE_URL
2. **Reset postgres password**:
   ```powershell
   # Connect as postgres user
   psql -U postgres
   
   # Change password
   ALTER USER postgres PASSWORD 'new_password';
   ```

### Issue: "Database does not exist"
**Solution**: Create the database
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE farmtally;
```

## 📊 Verify Everything Works

### 1. Database Connection
```powershell
node test-db-connection.js
```
Expected: ✅ Database connection successful!

### 2. API Endpoints
```powershell
node test-current-backend.js
```
Expected: All API tests pass

### 3. Start Development Server
```powershell
npm run dev
```
Expected: Server starts on http://localhost:3000

### 4. Test API Health
Open browser: http://localhost:3000/health
Expected: {"status": "ok", "timestamp": "..."}

## 🎯 Quick Commands Summary

```powershell
# 1. Install PostgreSQL (download from postgresql.org)
# 2. Create database
psql -U postgres
CREATE DATABASE farmtally;
\q

# 3. Update .env file with your password
# DATABASE_URL="postgresql://postgres:your_password@localhost:5432/farmtally"

# 4. Initialize FarmTally
npm run generate
npm run migrate  
npm run seed

# 5. Start development
npm run dev
```

## 🔐 Default Credentials After Setup

### Database Access
- **Host**: localhost
- **Port**: 5432
- **Database**: farmtally
- **Username**: postgres
- **Password**: (what you set during installation)

### FarmTally App (after seeding)
- **Admin**: admin@farmtally.com / Admin123!
- **Manager**: manager@farmtally.com / Manager123!
- **Farmer**: farmer@farmtally.com / Farmer123!

## 🎉 Success!

Once you complete these steps, your FarmTally development environment will be fully operational with:
- ✅ Local PostgreSQL database
- ✅ FarmTally backend API
- ✅ Sample data for testing
- ✅ Ready for frontend development

**Next**: Run `npm run dev` and start developing! 🌾✨

---

**Need help?** Check the troubleshooting section above or use the BUG_REPORT_TEMPLATE.md to report issues.