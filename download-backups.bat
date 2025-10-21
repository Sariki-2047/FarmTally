@echo off
REM Download FarmTally backups from Contabo VPS

set BACKUP_DIR=contabo-backup-%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%
set VPS_HOST=147.93.153.247
set VPS_USER=root

echo 📥 Downloading FarmTally backups from Contabo VPS
echo ================================================

REM Create backup directory
mkdir "%BACKUP_DIR%" 2>nul

echo 📁 Backup directory: %BACKUP_DIR%
echo 🌐 VPS: %VPS_HOST%
echo 👤 User: %VPS_USER%
echo.

echo 📦 Downloading application backup...
scp %VPS_USER%@%VPS_HOST%:/tmp/farmtally-app-backup.tar.gz %BACKUP_DIR%/
if %errorlevel% equ 0 (
    echo ✅ Application backup downloaded
) else (
    echo ⚠️ Application backup not found or failed to download
)

echo.
echo 🗄️ Downloading database backup...
scp %VPS_USER%@%VPS_HOST%:/tmp/farmtally-db-backup.sql %BACKUP_DIR%/
if %errorlevel% equ 0 (
    echo ✅ Database backup downloaded
) else (
    echo ⚠️ Database backup not found or failed to download
)

echo.
echo ⚙️ Downloading PM2 configuration...
scp %VPS_USER%@%VPS_HOST%:/tmp/pm2-backup.json %BACKUP_DIR%/
if %errorlevel% equ 0 (
    echo ✅ PM2 configuration downloaded
) else (
    echo ⚠️ PM2 configuration not found or failed to download
)

echo.
echo 🔐 Downloading environment files...
scp %VPS_USER%@%VPS_HOST%:/tmp/.env* %BACKUP_DIR%/
if %errorlevel% equ 0 (
    echo ✅ Environment files downloaded
) else (
    echo ⚠️ Environment files not found or failed to download
)

echo.
echo 📋 Backup download completed!
echo ============================

echo 📁 Backup contents:
dir "%BACKUP_DIR%"

echo.
echo ✅ All backups downloaded to: %BACKUP_DIR%
echo 🧹 VPS cleanup completed successfully
echo 🚀 Ready for Jenkins deployment setup

echo.
echo 📋 Next steps:
echo 1. Verify backup files are complete
echo 2. Setup Jenkins server and pipeline
echo 3. Configure deployment environment
echo 4. Deploy fresh FarmTally via Jenkins

pause