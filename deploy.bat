@echo off
REM FarmTally Production Deployment Script for Windows
REM This script automates the deployment process

echo 🚀 FarmTally Production Deployment
echo ==================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm
    pause
    exit /b 1
)

echo ✅ Requirements check passed
echo.

REM Setup environment
echo ℹ️  Setting up production environment...
if not exist .env (
    copy .env.example .env
    echo ⚠️  Created .env file from example. Please edit with production values.
    echo Required environment variables:
    echo   - DATABASE_URL
    echo   - JWT_SECRET
    echo   - SMTP_USER
    echo   - SMTP_PASS
    echo.
    pause
)

REM Build application
echo ℹ️  Building application...
call npm install
if errorlevel 1 (
    echo ❌ npm install failed
    pause
    exit /b 1
)

call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Application built successfully
echo.

REM Setup database
echo ℹ️  Setting up database...
call npx prisma generate
if errorlevel 1 (
    echo ❌ Prisma generate failed
    pause
    exit /b 1
)

call npx prisma migrate deploy
if errorlevel 1 (
    echo ❌ Database migration failed
    pause
    exit /b 1
)

echo ✅ Database setup completed
echo.

REM Choose deployment platform
echo ℹ️  Choose deployment platform:
echo 1) Railway (Recommended)
echo 2) Heroku
echo 3) Manual (skip deployment)
set /p DEPLOY_CHOICE="Enter choice (1-3): "

if "%DEPLOY_CHOICE%"=="1" goto railway
if "%DEPLOY_CHOICE%"=="2" goto heroku
if "%DEPLOY_CHOICE%"=="3" goto manual
echo ❌ Invalid choice
pause
exit /b 1

:railway
echo ℹ️  Deploying to Railway...
REM Check if Railway CLI is installed
railway --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Railway CLI not found. Installing...
    call npm install -g @railway/cli
)

REM Login check
railway whoami >nul 2>&1
if errorlevel 1 (
    echo ℹ️  Please login to Railway:
    railway login
)

REM Deploy
railway up
if errorlevel 1 (
    echo ❌ Railway deployment failed
    pause
    exit /b 1
)

echo ✅ Deployed to Railway successfully
goto create_admin

:heroku
echo ℹ️  Deploying to Heroku...
REM Check if Heroku CLI is installed
heroku --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Heroku CLI not found. Please install Heroku CLI
    pause
    exit /b 1
)

REM Login check
heroku whoami >nul 2>&1
if errorlevel 1 (
    echo ℹ️  Please login to Heroku:
    heroku login
)

REM Create Procfile if it doesn't exist
if not exist Procfile (
    echo web: npm start > Procfile
    echo ℹ️  Created Procfile
)

REM Deploy
git add .
git commit -m "Deploy to production"
git push heroku main
if errorlevel 1 (
    echo ❌ Heroku deployment failed
    pause
    exit /b 1
)

echo ✅ Deployed to Heroku successfully
goto create_admin

:manual
echo ℹ️  Skipping deployment. Application is ready for manual deployment.
goto end

:create_admin
echo.
set /p CREATE_ADMIN="Create system admin now? (y/n): "
if /i not "%CREATE_ADMIN%"=="y" goto end

echo ℹ️  Creating system admin...
set /p ADMIN_EMAIL="Enter admin email: "
set /p ADMIN_PASSWORD="Enter admin password: "
set /p ADMIN_FIRST_NAME="Enter admin first name: "
set /p ADMIN_LAST_NAME="Enter admin last name: "
set /p DEPLOY_URL="Enter your deployment URL (e.g., https://your-app.herokuapp.com): "

REM Create system admin using curl (if available) or PowerShell
curl --version >nul 2>&1
if errorlevel 1 (
    echo ℹ️  Using PowerShell to create admin...
    powershell -Command "try { $response = Invoke-RestMethod -Uri '%DEPLOY_URL%/api/system-admin/setup' -Method Post -ContentType 'application/json' -Body ('{\"email\":\"%ADMIN_EMAIL%\",\"password\":\"%ADMIN_PASSWORD%\",\"firstName\":\"%ADMIN_FIRST_NAME%\",\"lastName\":\"%ADMIN_LAST_NAME%\"}'); Write-Host 'System admin created successfully'; Write-Host $response } catch { Write-Host 'Error creating admin:' $_.Exception.Message }"
) else (
    echo ℹ️  Using curl to create admin...
    curl -X POST "%DEPLOY_URL%/api/system-admin/setup" -H "Content-Type: application/json" -d "{\"email\":\"%ADMIN_EMAIL%\",\"password\":\"%ADMIN_PASSWORD%\",\"firstName\":\"%ADMIN_FIRST_NAME%\",\"lastName\":\"%ADMIN_LAST_NAME%\"}"
)

echo ✅ System admin creation attempted
echo ℹ️  Login URL: %DEPLOY_URL%/system-admin/dashboard

:end
echo.
echo ✅ 🎉 FarmTally deployment completed!
echo.
echo ℹ️  Next steps:
echo 1. Test your deployment URL
echo 2. Create system admin (if not done)
echo 3. Configure email settings
echo 4. Test user registration flow
echo 5. Set up monitoring and backups
echo.
echo ℹ️  Documentation available in:
echo - PRODUCTION_DEPLOYMENT_GUIDE.md
echo - AUTHENTICATION_SETUP_GUIDE.md
echo - EMAIL_SETUP_GUIDE.md
echo.
echo ✅ Welcome to production! 🌾🚀
echo.
pause