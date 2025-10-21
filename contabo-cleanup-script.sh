#!/bin/bash

# FarmTally Contabo Cleanup Script
# This script safely removes FarmTally from Contabo VPS with proper backup

echo "🧹 FarmTally Contabo Cleanup & Backup Script"
echo "=============================================="

# VPS Configuration
VPS_HOST="147.93.153.247"
VPS_USER="root"
BACKUP_DIR="./contabo-backup-$(date +%Y%m%d-%H%M%S)"

echo "📋 Pre-cleanup checklist:"
echo "  - VPS: ${VPS_HOST}"
echo "  - User: ${VPS_USER}"
echo "  - Backup Dir: ${BACKUP_DIR}"
echo ""

# Create local backup directory
mkdir -p "${BACKUP_DIR}"

echo "🔍 Step 1: Checking current VPS status..."
ssh ${VPS_USER}@${VPS_HOST} << 'EOF'
echo "📊 Current system status:"
echo "========================"

# Check if FarmTally is running
echo "🔍 PM2 processes:"
pm2 list 2>/dev/null || echo "PM2 not installed or no processes"

echo ""
echo "🔍 Node.js processes:"
ps aux | grep node | grep -v grep || echo "No Node.js processes found"

echo ""
echo "🔍 Ports in use:"
netstat -tlnp | grep -E ':(3000|3001|9999|8000)' || echo "No FarmTally ports in use"

echo ""
echo "🔍 FarmTally directories:"
find /root -name "*farmtally*" -type d 2>/dev/null || echo "No FarmTally directories found"

echo ""
echo "🔍 Database status:"
systemctl status postgresql 2>/dev/null || echo "PostgreSQL not running or not installed"

echo ""
echo "🔍 Disk usage:"
df -h /
EOF

echo ""
read -p "📝 Continue with backup and cleanup? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled by user"
    exit 1
fi

echo ""
echo "💾 Step 2: Creating backup of FarmTally data..."

# Backup application files
echo "📁 Backing up application files..."
ssh ${VPS_USER}@${VPS_HOST} "tar -czf /tmp/farmtally-app-backup.tar.gz /root/farmtally* 2>/dev/null || echo 'No app files to backup'"
scp ${VPS_USER}@${VPS_HOST}:/tmp/farmtally-app-backup.tar.gz "${BACKUP_DIR}/" 2>/dev/null || echo "No app backup to download"

# Backup database
echo "🗄️ Backing up database..."
ssh ${VPS_USER}@${VPS_HOST} << 'EOF'
# Check if PostgreSQL is running and farmtally database exists
if systemctl is-active --quiet postgresql; then
    echo "📊 PostgreSQL is running, checking for farmtally database..."
    
    # List databases
    sudo -u postgres psql -l | grep farmtally
    
    if sudo -u postgres psql -l | grep -q farmtally; then
        echo "💾 Creating database backup..."
        sudo -u postgres pg_dump farmtally > /tmp/farmtally-db-backup.sql
        echo "✅ Database backup created: /tmp/farmtally-db-backup.sql"
    else
        echo "ℹ️ No farmtally database found"
    fi
else
    echo "ℹ️ PostgreSQL is not running"
fi
EOF

scp ${VPS_USER}@${VPS_HOST}:/tmp/farmtally-db-backup.sql "${BACKUP_DIR}/" 2>/dev/null || echo "No database backup to download"

# Backup PM2 configuration
echo "⚙️ Backing up PM2 configuration..."
ssh ${VPS_USER}@${VPS_HOST} "pm2 save 2>/dev/null && cp ~/.pm2/dump.pm2 /tmp/pm2-backup.json 2>/dev/null || echo 'No PM2 config to backup'"
scp ${VPS_USER}@${VPS_HOST}:/tmp/pm2-backup.json "${BACKUP_DIR}/" 2>/dev/null || echo "No PM2 backup to download"

# Backup environment files
echo "🔐 Backing up environment files..."
ssh ${VPS_USER}@${VPS_HOST} "find /root -name '.env*' -exec cp {} /tmp/ \; 2>/dev/null || echo 'No .env files found'"
scp ${VPS_USER}@${VPS_HOST}:/tmp/.env* "${BACKUP_DIR}/" 2>/dev/null || echo "No .env files to backup"

echo ""
echo "🛑 Step 3: Stopping FarmTally services..."

ssh ${VPS_USER}@${VPS_HOST} << 'EOF'
echo "🔄 Stopping all FarmTally processes..."

# Stop PM2 processes
if command -v pm2 >/dev/null 2>&1; then
    echo "🛑 Stopping PM2 processes..."
    pm2 stop all 2>/dev/null || echo "No PM2 processes to stop"
    pm2 delete all 2>/dev/null || echo "No PM2 processes to delete"
    pm2 kill 2>/dev/null || echo "PM2 daemon not running"
else
    echo "ℹ️ PM2 not installed"
fi

# Kill any remaining Node.js processes
echo "🔪 Killing remaining Node.js processes..."
pkill -f node 2>/dev/null || echo "No Node.js processes to kill"

# Stop any services on FarmTally ports
echo "🚪 Freeing up FarmTally ports..."
for port in 3000 3001 8000 9999; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo "🔪 Killing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null || echo "Failed to kill process on port $port"
    fi
done

echo "✅ All FarmTally processes stopped"
EOF

echo ""
echo "🗑️ Step 4: Removing FarmTally files and directories..."

ssh ${VPS_USER}@${VPS_HOST} << 'EOF'
echo "🧹 Cleaning up FarmTally files..."

# Remove FarmTally directories
echo "📁 Removing FarmTally directories..."
rm -rf /root/farmtally* 2>/dev/null || echo "No farmtally directories to remove"

# Remove any FarmTally-related files in common locations
echo "🔍 Searching for remaining FarmTally files..."
find /root -name "*farmtally*" -type f -delete 2>/dev/null || echo "No additional farmtally files found"

# Clean up temporary files
echo "🧽 Cleaning temporary files..."
rm -f /tmp/farmtally* 2>/dev/null || echo "No temp files to clean"
rm -f /tmp/pm2-backup.json 2>/dev/null || echo "No PM2 backup to clean"
rm -f /tmp/.env* 2>/dev/null || echo "No .env files to clean"

# Remove FarmTally database
if systemctl is-active --quiet postgresql; then
    echo "🗄️ Removing FarmTally database..."
    sudo -u postgres dropdb farmtally 2>/dev/null || echo "No farmtally database to drop"
    
    # Remove database user if exists
    sudo -u postgres psql -c "DROP USER IF EXISTS farmtally;" 2>/dev/null || echo "No farmtally user to drop"
else
    echo "ℹ️ PostgreSQL not running, skipping database cleanup"
fi

# Clean up any FarmTally-related cron jobs
echo "⏰ Checking for FarmTally cron jobs..."
crontab -l 2>/dev/null | grep -v farmtally | crontab - 2>/dev/null || echo "No cron jobs to clean"

# Clean up logs
echo "📋 Cleaning up logs..."
rm -f /var/log/*farmtally* 2>/dev/null || echo "No farmtally logs to clean"

echo "✅ FarmTally cleanup completed"
EOF

echo ""
echo "🔍 Step 5: Verifying cleanup..."

ssh ${VPS_USER}@${VPS_HOST} << 'EOF'
echo "🔍 Post-cleanup verification:"
echo "============================"

echo "📊 PM2 processes:"
pm2 list 2>/dev/null || echo "PM2 not available"

echo ""
echo "🔍 Node.js processes:"
ps aux | grep node | grep -v grep || echo "✅ No Node.js processes running"

echo ""
echo "🔍 FarmTally ports:"
netstat -tlnp | grep -E ':(3000|3001|9999|8000)' || echo "✅ No FarmTally ports in use"

echo ""
echo "🔍 FarmTally directories:"
find /root -name "*farmtally*" 2>/dev/null || echo "✅ No FarmTally directories found"

echo ""
echo "🔍 FarmTally database:"
if systemctl is-active --quiet postgresql; then
    sudo -u postgres psql -l | grep farmtally || echo "✅ No farmtally database found"
else
    echo "ℹ️ PostgreSQL not running"
fi

echo ""
echo "🔍 Available disk space:"
df -h /
EOF

echo ""
echo "📋 Step 6: Creating cleanup summary..."

# Create cleanup summary
cat > "${BACKUP_DIR}/cleanup-summary.md" << EOF
# FarmTally Contabo Cleanup Summary

**Cleanup Date**: $(date)
**VPS**: ${VPS_HOST}
**Backup Location**: ${BACKUP_DIR}

## What Was Removed
- All FarmTally application files (/root/farmtally*)
- FarmTally database and database user
- All PM2 processes related to FarmTally
- All Node.js processes
- Temporary files and logs
- Any FarmTally-related cron jobs

## Backup Contents
- Application files: farmtally-app-backup.tar.gz
- Database dump: farmtally-db-backup.sql
- PM2 configuration: pm2-backup.json
- Environment files: .env*

## VPS Status After Cleanup
- All FarmTally processes stopped
- All FarmTally files removed
- Database cleaned up
- Ports 3000, 3001, 8000, 9999 freed
- System ready for fresh deployment

## Next Steps for Jenkins Deployment
1. Setup Jenkins pipeline
2. Configure deployment environment
3. Deploy fresh FarmTally instance
4. Restore data if needed from backups

## Restore Instructions (if needed)
\`\`\`bash
# Restore application files
tar -xzf farmtally-app-backup.tar.gz -C /

# Restore database
sudo -u postgres createdb farmtally
sudo -u postgres psql farmtally < farmtally-db-backup.sql

# Restore PM2 configuration
pm2 resurrect pm2-backup.json
\`\`\`
EOF

echo "✅ Cleanup completed successfully!"
echo ""
echo "📊 Summary:"
echo "==========="
echo "🗑️ FarmTally completely removed from Contabo VPS"
echo "💾 Backup created in: ${BACKUP_DIR}"
echo "🔧 VPS ready for Jenkins deployment"
echo ""
echo "📁 Backup contents:"
ls -la "${BACKUP_DIR}"
echo ""
echo "📋 Next steps:"
echo "1. Review backup files in ${BACKUP_DIR}"
echo "2. Setup Jenkins pipeline for deployment"
echo "3. Configure new deployment environment"
echo "4. Deploy fresh FarmTally instance via Jenkins"
echo ""
echo "⚠️ Important: Keep the backup directory safe until new deployment is verified!"