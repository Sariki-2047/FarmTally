#!/bin/bash

# FarmTally VPS Cleanup Commands
# Copy and paste these commands into your VPS SSH session

echo "🔍 STEP 1: Checking current VPS status..."
echo "=========================================="

echo "📊 PM2 processes:"
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

echo ""
echo "💾 STEP 2: Creating backups..."
echo "=============================="

# Backup application files
echo "📁 Backing up application files..."
tar -czf /tmp/farmtally-app-backup.tar.gz /root/farmtally* 2>/dev/null || echo "No app files to backup"

# Backup database
echo "🗄️ Backing up database..."
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

# Backup PM2 configuration
echo "⚙️ Backing up PM2 configuration..."
pm2 save 2>/dev/null && cp ~/.pm2/dump.pm2 /tmp/pm2-backup.json 2>/dev/null || echo "No PM2 config to backup"

# Backup environment files
echo "🔐 Backing up environment files..."
find /root -name '.env*' -exec cp {} /tmp/ \; 2>/dev/null || echo "No .env files found"

echo ""
echo "📋 Backup files created:"
ls -la /tmp/farmtally* /tmp/pm2-backup.json /tmp/.env* 2>/dev/null || echo "No backup files found"

echo ""
echo "🛑 STEP 3: Stopping FarmTally services..."
echo "========================================="

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

echo ""
echo "🗑️ STEP 4: Removing FarmTally files..."
echo "====================================="

# Remove FarmTally directories
echo "📁 Removing FarmTally directories..."
rm -rf /root/farmtally* 2>/dev/null || echo "No farmtally directories to remove"

# Remove any FarmTally-related files in common locations
echo "🔍 Searching for remaining FarmTally files..."
find /root -name "*farmtally*" -type f -delete 2>/dev/null || echo "No additional farmtally files found"

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

echo ""
echo "🔍 STEP 5: Verifying cleanup..."
echo "==============================="

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

echo ""
echo "📋 Backup files ready for download:"
ls -la /tmp/farmtally* /tmp/pm2-backup.json /tmp/.env* 2>/dev/null || echo "No backup files to download"

echo ""
echo "✅ CLEANUP COMPLETED SUCCESSFULLY!"
echo "=================================="
echo ""
echo "📥 Next: Download backup files to your local machine using:"
echo "scp root@147.93.153.247:/tmp/farmtally-app-backup.tar.gz ./contabo-backup-$(date +%Y%m%d)/"
echo "scp root@147.93.153.247:/tmp/farmtally-db-backup.sql ./contabo-backup-$(date +%Y%m%d)/"
echo "scp root@147.93.153.247:/tmp/pm2-backup.json ./contabo-backup-$(date +%Y%m%d)/"
echo "scp root@147.93.153.247:/tmp/.env* ./contabo-backup-$(date +%Y%m%d)/"
echo ""
echo "🚀 VPS is now ready for Jenkins deployment!"