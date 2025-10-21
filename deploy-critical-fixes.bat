@echo off
REM FarmTally Critical Fixes Deployment Script
REM This script deploys the critical API and authentication fixes

echo 🚀 Deploying FarmTally Critical Fixes...

REM VPS Configuration
set VPS_HOST=147.93.153.247
set VPS_USER=root
set VPS_PATH=/root/farmtally

echo 📦 Building backend...
call npm run build

echo 🔄 Deploying to VPS...
REM Note: You'll need to use SCP or similar tool to copy files
echo Please manually copy the built files to the VPS or use WSL/Git Bash to run the .sh script

echo ✅ Critical fixes ready for deployment!
echo.
echo 🔍 Key fixes applied:
echo   ✓ Fixed API base URL mismatch (/api prefix)
echo   ✓ Fixed authentication status check (APPROVED vs ACTIVE)
echo   ✓ Fixed admin dashboard endpoint
echo   ✓ Fixed email template placeholder links
echo   ✓ Added invitation email sending
echo.
echo 🌐 Frontend URL: https://app.farmtally.in
echo 🔗 Backend URL: http://147.93.153.247:3001
echo.
echo 📋 Next steps:
echo   1. Deploy files to VPS
echo   2. Test farm admin login and CRUD operations
echo   3. Test field manager invitation flow
echo   4. Verify email delivery
echo   5. Check admin dashboard functionality

pause