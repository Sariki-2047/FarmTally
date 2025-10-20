@echo off
echo 🐘 FarmTally PostgreSQL Setup
echo =============================

echo.
echo This script will help you set up PostgreSQL for FarmTally development.
echo.

REM Add PostgreSQL to PATH for this session
set PATH=%PATH%;C:\Program Files\PostgreSQL\18\bin;C:\Program Files\PostgreSQL\17\bin;C:\Program Files\PostgreSQL\16\bin

echo 📋 Prerequisites:
echo 1. PostgreSQL must be installed on your system
echo 2. You need to know your PostgreSQL password
echo.

set /p pgPassword="Enter your PostgreSQL password: "

echo.
echo 🔍 Testing PostgreSQL connection...

set PGPASSWORD=%pgPassword%
psql --version >nul 2>&1

if %errorlevel% neq 0 (
    echo ❌ PostgreSQL command line tools not found.
    echo 💡 Please ensure PostgreSQL is installed properly.
    echo 📥 Download PostgreSQL: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo ✅ PostgreSQL found!

psql -U postgres -h localhost -c "SELECT version();" >nul 2>&1

if %errorlevel% neq 0 (
    echo ❌ Could not connect to PostgreSQL.
    echo 💡 Please check:
    echo    - PostgreSQL service is running
    echo    - Your password is correct
    echo    - Username is 'postgres'
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
    echo ℹ️ Database 'farmtally' might already exist (this is OK)
)

echo.
echo ⚙️ Updating .env configuration...

REM Create a temporary PowerShell script to update .env
echo $content = Get-Content '.env' -Raw > temp_update.ps1
echo $content = $content -replace 'DATABASE_URL="[^"]*"', 'DATABASE_URL="postgresql://postgres:%pgPassword%@localhost:5432/farmtally"' >> temp_update.ps1
echo Set-Content '.env' $content >> temp_update.ps1

powershell -ExecutionPolicy Bypass -File temp_update.ps1
del temp_update.ps1

echo ✅ .env file updated

echo.
echo 🧪 Testing FarmTally database connection...
node test-db-connection.js

echo.
echo 🚀 Initializing FarmTally database...

echo    📦 Generating Prisma client...
call npm run generate

echo    🏗️ Running database migrations...
call npm run migrate

echo    🌱 Seeding sample data...
call npm run seed

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