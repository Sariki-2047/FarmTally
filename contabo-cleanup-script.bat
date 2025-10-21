@echo off
REM FarmTally Contabo Cleanup Script (Windows)
REM This script safely removes FarmTally from Contabo VPS with proper backup

echo 🧹 FarmTally Contabo Cleanup ^& Backup Script
echo ==============================================

REM VPS Configuration
set VPS_HOST=147.93.153.247
set VPS_USER=root
set BACKUP_DIR=contabo-backup-%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%

echo 📋 Pre-cleanup checklist:
echo   - VPS: %VPS_HOST%
echo   - User: %VPS_USER%
echo   - Backup Dir: %BACKUP_DIR%
echo.

REM Create local backup directory
mkdir "%BACKUP_DIR%" 2>nul

echo 🔍 Step 1: Checking current VPS status...
echo Please run the following commands manually on your VPS:
echo.
echo ssh %VPS_USER%@%VPS_HOST%
echo.
echo Then run these commands on the VPS:
echo ================================
echo.
echo # Check PM2 processes
echo pm2 list
echo.
echo # Check Node.js processes  
echo ps aux ^| grep node ^| grep -v grep
echo.
echo # Check ports in use
echo netstat -tlnp ^| grep -E ':^(3000^|3001^|9999^|8000^)'
echo.
echo # Check FarmTally directories
echo find /root -name "*farmtally*" -type d
echo.
echo # Check database status
echo systemctl status postgresql
echo.
echo # Check disk usage
echo df -h /
echo.

pause

echo.
echo 💾 Step 2: Manual backup instructions...
echo Please run these commands on the VPS to create backups:
echo ====================================================
echo.
echo # Backup application files
echo tar -czf /tmp/farmtally-app-backup.tar.gz /root/farmtally* 2^>^/dev^/null
echo.
echo # Backup database ^(if PostgreSQL is running^)
echo sudo -u postgres pg_dump farmtally ^> /tmp/farmtally-db-backup.sql
echo.
echo # Backup PM2 configuration
echo pm2 save ^&^& cp ~/.pm2/dump.pm2 /tmp/pm2-backup.json
echo.
echo # Backup environment files
echo find /root -name '.env*' -exec cp {} /tmp/ \;
echo.

pause

echo.
echo 📥 Step 3: Download backups to local machine...
echo Please run these commands to download backups:
echo ============================================
echo.
echo # Download application backup
echo scp %VPS_USER%@%VPS_HOST%:/tmp/farmtally-app-backup.tar.gz %BACKUP_DIR%/
echo.
echo # Download database backup
echo scp %VPS_USER%@%VPS_HOST%:/tmp/farmtally-db-backup.sql %BACKUP_DIR%/
echo.
echo # Download PM2 backup
echo scp %VPS_USER%@%VPS_HOST%:/tmp/pm2-backup.json %BACKUP_DIR%/
echo.
echo # Download environment files
echo scp %VPS_USER%@%VPS_HOST%:/tmp/.env* %BACKUP_DIR%/
echo.

pause

echo.
echo 🛑 Step 4: Stop FarmTally services...
echo Please run these commands on the VPS:
echo ==================================
echo.
echo # Stop PM2 processes
echo pm2 stop all
echo pm2 delete all
echo pm2 kill
echo.
echo # Kill Node.js processes
echo pkill -f node
echo.
echo # Kill processes on FarmTally ports
echo for port in 3000 3001 8000 9999; do
echo   pid=^$^(lsof -ti:^$port 2^>^/dev^/null^)
echo   if [ ! -z "^$pid" ]; then
echo     kill -9 ^$pid
echo   fi
echo done
echo.

pause

echo.
echo 🗑️ Step 5: Remove FarmTally files...
echo Please run these commands on the VPS:
echo ==================================
echo.
echo # Remove FarmTally directories
echo rm -rf /root/farmtally*
echo.
echo # Remove any remaining FarmTally files
echo find /root -name "*farmtally*" -type f -delete
echo.
echo # Clean temporary files
echo rm -f /tmp/farmtally*
echo rm -f /tmp/pm2-backup.json
echo rm -f /tmp/.env*
echo.
echo # Remove FarmTally database
echo sudo -u postgres dropdb farmtally
echo sudo -u postgres psql -c "DROP USER IF EXISTS farmtally;"
echo.
echo # Clean cron jobs
echo crontab -l ^| grep -v farmtally ^| crontab -
echo.
echo # Clean logs
echo rm -f /var/log/*farmtally*
echo.

pause

echo.
echo 🔍 Step 6: Verify cleanup...
echo Please run these commands on the VPS to verify:
echo ============================================
echo.
echo # Check PM2 processes
echo pm2 list
echo.
echo # Check Node.js processes
echo ps aux ^| grep node ^| grep -v grep
echo.
echo # Check FarmTally ports
echo netstat -tlnp ^| grep -E ':^(3000^|3001^|9999^|8000^)'
echo.
echo # Check FarmTally directories
echo find /root -name "*farmtally*"
echo.
echo # Check database
echo sudo -u postgres psql -l ^| grep farmtally
echo.
echo # Check disk space
echo df -h /
echo.

pause

echo.
echo 📋 Creating cleanup summary...

REM Create cleanup summary
echo # FarmTally Contabo Cleanup Summary > "%BACKUP_DIR%\cleanup-summary.md"
echo. >> "%BACKUP_DIR%\cleanup-summary.md"
echo **Cleanup Date**: %date% %time% >> "%BACKUP_DIR%\cleanup-summary.md"
echo **VPS**: %VPS_HOST% >> "%BACKUP_DIR%\cleanup-summary.md"
echo **Backup Location**: %BACKUP_DIR% >> "%BACKUP_DIR%\cleanup-summary.md"
echo. >> "%BACKUP_DIR%\cleanup-summary.md"
echo ## What Was Removed >> "%BACKUP_DIR%\cleanup-summary.md"
echo - All FarmTally application files ^(/root/farmtally*^) >> "%BACKUP_DIR%\cleanup-summary.md"
echo - FarmTally database and database user >> "%BACKUP_DIR%\cleanup-summary.md"
echo - All PM2 processes related to FarmTally >> "%BACKUP_DIR%\cleanup-summary.md"
echo - All Node.js processes >> "%BACKUP_DIR%\cleanup-summary.md"
echo - Temporary files and logs >> "%BACKUP_DIR%\cleanup-summary.md"
echo - Any FarmTally-related cron jobs >> "%BACKUP_DIR%\cleanup-summary.md"
echo. >> "%BACKUP_DIR%\cleanup-summary.md"
echo ## Backup Contents >> "%BACKUP_DIR%\cleanup-summary.md"
echo - Application files: farmtally-app-backup.tar.gz >> "%BACKUP_DIR%\cleanup-summary.md"
echo - Database dump: farmtally-db-backup.sql >> "%BACKUP_DIR%\cleanup-summary.md"
echo - PM2 configuration: pm2-backup.json >> "%BACKUP_DIR%\cleanup-summary.md"
echo - Environment files: .env* >> "%BACKUP_DIR%\cleanup-summary.md"
echo. >> "%BACKUP_DIR%\cleanup-summary.md"
echo ## Next Steps for Jenkins Deployment >> "%BACKUP_DIR%\cleanup-summary.md"
echo 1. Setup Jenkins pipeline >> "%BACKUP_DIR%\cleanup-summary.md"
echo 2. Configure deployment environment >> "%BACKUP_DIR%\cleanup-summary.md"
echo 3. Deploy fresh FarmTally instance >> "%BACKUP_DIR%\cleanup-summary.md"
echo 4. Restore data if needed from backups >> "%BACKUP_DIR%\cleanup-summary.md"

echo ✅ Cleanup instructions completed!
echo.
echo 📊 Summary:
echo ===========
echo 🗑️ Manual cleanup instructions provided for Contabo VPS
echo 💾 Backup directory created: %BACKUP_DIR%
echo 🔧 VPS will be ready for Jenkins deployment after cleanup
echo.
echo 📁 Backup directory created at: %BACKUP_DIR%
echo.
echo 📋 Next steps:
echo 1. Follow the manual instructions above
echo 2. Verify all backups are downloaded
echo 3. Setup Jenkins pipeline for deployment
echo 4. Configure new deployment environment
echo 5. Deploy fresh FarmTally instance via Jenkins
echo.
echo ⚠️ Important: Keep the backup directory safe until new deployment is verified!

pause