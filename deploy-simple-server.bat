@echo off
REM FarmTally Simple Server Deployment (Windows)

echo 🚀 Deploying FarmTally Simple Server with Critical Fixes...

REM Test locally first
echo 🧪 Testing simple server locally...
node test-simple-server.js
if %errorlevel% neq 0 (
    echo ❌ Local tests failed. Fix issues before deploying.
    exit /b 1
)

echo ✅ Local tests passed!

echo 📦 Creating deployment package...
if exist deploy-temp rmdir /s /q deploy-temp
mkdir deploy-temp
xcopy /s /e src deploy-temp\src\
copy package.json deploy-temp\
copy .env deploy-temp\

echo 🔄 Ready for deployment to VPS...
echo Please use SCP or similar tool to copy deploy-temp\ to root@147.93.153.247:/root/farmtally/

echo 📋 Manual VPS setup commands:
echo   cd /root/farmtally
echo   npm install
echo   pm2 stop farmtally-backend
echo   pm2 start src/server-simple.ts --name farmtally-backend --interpreter tsx

echo ✅ Deployment package ready!
pause