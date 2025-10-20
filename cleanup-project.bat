@echo off
REM FarmTally Project Cleanup Script (Windows)
REM Removes redundant and obsolete files

echo 🧹 Starting FarmTally project cleanup...

REM Remove Supabase-related files
echo Removing Supabase files...
if exist supabase rmdir /s /q supabase
if exist supabase.exe del supabase.exe
if exist supabase_windows.tar.gz del supabase_windows.tar.gz
del SUPABASE_*.md 2>nul
del configure-supabase-cli.bat 2>nul
del setup-supabase-cli.js 2>nul
del install-supabase-cli.js 2>nul
del get-supabase-info.js 2>nul
del test-supabase-*.js 2>nul
del test-farmtally-supabase.bat 2>nul

REM Remove Redis files
echo Removing Redis files...
if exist redis rmdir /s /q redis
if exist redis.zip del redis.zip
if exist dump.rdb del dump.rdb

REM Remove old deployment files
echo Removing old deployment files...
del deploy-railway.bat 2>nul
del deploy-supabase-windows.bat 2>nul
del deploy-supabase.sh 2>nul
del deploy-with-cli.bat 2>nul
del deploy-farmtally-automated.bat 2>nul
del upload-to-supabase.bat 2>nul
del deploy-to-supabase-storage.js 2>nul
del upload-to-farmtally-app-bucket.js 2>nul

REM Remove old test files
echo Removing old test files...
del test-postgres-passwords.js 2>nul
del test-delivery-system.ps1 2>nul
del test-enhanced-delivery-system.ps1 2>nul
del test-farmer-system.ps1 2>nul
del test-lorry-request-system.ps1 2>nul
del test-lorry-system.ps1 2>nul
del test-report-system.ps1 2>nul
del test-reports-simple.ps1 2>nul

REM Remove old setup files
echo Removing old setup files...
del setup-environment.ps1 2>nul
del reset-postgres-password.ps1 2>nul
del install-dependencies-windows.ps1 2>nul

REM Remove duplicate documentation
echo Removing duplicate documentation...
del manual-connection-string.md 2>nul
del manual-test.md 2>nul
del setup-database.md 2>nul
del update-database-url.md 2>nul
del railway-setup.md 2>nul

REM Remove email setup files
echo Removing email setup files...
del EMAIL_SETUP.md 2>nul
del EMAIL_TROUBLESHOOTING.md 2>nul
del GMAIL_SETUP.md 2>nul
del setup-gmail.js 2>nul
del test-email-invitation.js 2>nul

REM Remove development-only files
echo Removing development-only files...
del serve-farmtally-local.js 2>nul
del serve-web.js 2>nul
del clean-server.js 2>nul
del check-system-requirements.js 2>nul

REM Remove duplicate start files
echo Removing duplicate start files...
del start-farmtally.bat 2>nul
del start-server.bat 2>nul
del start-web-app.bat 2>nul

REM Remove old mobile app files
echo Removing old mobile app files...
del farmtally_mobile\run_admin_with_auth.dart 2>nul
del farmtally_mobile\run_admin_working.dart 2>nul
del farmtally_mobile\serve_web_simple.dart 2>nul
del farmtally_mobile\test_integration.dart 2>nul
del farmtally_mobile\web_access.html 2>nul
del farmtally_mobile\cleanup-ports.ps1 2>nul
del farmtally_mobile\dev-start.ps1 2>nul
del farmtally_mobile\run-dev.bat 2>nul
del farmtally_mobile\run-dev.ps1 2>nul
del farmtally_mobile\run-prod.ps1 2>nul
del farmtally_mobile\pubspec_supabase.yaml 2>nul

REM Remove duplicate mobile documentation
echo Removing duplicate mobile documentation...
del farmtally_mobile\ADMIN_*.md 2>nul
del farmtally_mobile\FIELD_MANAGER_*.md 2>nul
del farmtally_mobile\FRONTEND_BACKEND_INTEGRATION_COMPLETE.md 2>nul
del farmtally_mobile\INTEGRATION_GUIDE.md 2>nul
del farmtally_mobile\ENVIRONMENT_SETUP.md 2>nul
del farmtally_mobile\TROUBLESHOOTING.md 2>nul

REM Remove other redundant files
echo Removing other redundant files...
del open-upload-locations.bat 2>nul
del fix-missing-tables.js 2>nul
del check-missing-tables.js 2>nul
del test-supabase-status.js 2>nul

echo ✅ Cleanup complete!
echo.
echo 📊 Project size reduced significantly
echo 🎯 Kept only essential production files
echo 📚 Maintained core documentation
echo.
echo Next steps:
echo 1. Review remaining files
echo 2. Test deployment: deploy.sh local
echo 3. Deploy to production: deploy.sh railway

pause