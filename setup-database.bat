@echo off
echo 🐘 FarmTally PostgreSQL Setup
echo =============================

echo.
echo This script will help you set up PostgreSQL for FarmTally development.
echo.

echo 📋 Prerequisites:
echo 1. PostgreSQL must be installed on your system
echo 2. You need to know your PostgreSQL password
echo.

set /p pgPassword="Enter your PostgreSQL password (default: postgres): "
if "%pgPassword%"=="" set pgPassword=postgres

echo.
echo 🔍 Testing PostgreSQL connection...

set PGPASSWORD=%pgPassword%
psql -U postgres -h localhost -c "SELECT version();" >nul 2>&1

if %errorlevel% neq 0 (
    echo ❌ Could not connect to PostgreSQL.
    echo 💡 Please check:
    echo    - PostgreSQL is installed and running
    echo    - Your password is correct
    echo    - PostgreSQL service is started
    echo.
    echo 📥 Download PostgreSQL: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo ✅ PostgreSQL connection successful!

echo.
echo 🗄️ Creating FarmTally database...
psql -U postgres -h localhost -c "CREATE DATABASE farmtally;" >nul 2>&1

if %errorlevel% equ 0 (
    echo ✅ Database 'farmtally' created successfully
) else (
    echo ℹ️ Database 'farmtally' might already exist
)

echo.
echo ⚙️ Updating .env configuration...

REM Update DATABASE_URL in .env file
powershell -Command "(Get-Content .env) -replace 'DATABASE_URL=\"[^\"]*\"', 'DATABASE_URL=\"postgresql://postgres:%pgPassword%@localhost:5432/farmtally\"' | Set-Content .env"

echo ✅ .env file updated

echo.
echo 🧪 Testing FarmTally database connection...
node test-db-connection.js

echo.
echo 🚀 Initializing FarmTally database...

echo    📦 Generating Prisma client...
call npm run generate >nul 2>&1

echo    🏗️ Running database migrations...
call npm run migrate >nul 2>&1

echo    🌱 Seeding sample data...
call npm run seed >nul 2>&1

echo.
echo 🎉 Setup Complete!
echo ==================
echo.
echo 🚀 Next Steps:
echo 1. Run: npm run dev
echo 2. Open: http://localhost:3000/health
echo 3. Test with credentials:
echo    - Admin: admin@farmtally.com / Admin123!
echo    - Manager: manager@farmtally.com / Manager123!
echo    - Farmer: farmer@farmtally.com / Farmer123!
echo.
echo 📚 Documentation:
echo    - API: API_DOCUMENTATION.md
echo    - Testing: TESTING_CHECKLIST.md
echo    - Deployment: FARMTALLY_DEPLOYMENT_GUIDE.md
echo.

set PGPASSWORD=
pause