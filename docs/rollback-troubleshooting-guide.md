# FarmTally Rollback System Troubleshooting Guide

## Overview

This guide provides comprehensive troubleshooting procedures for the FarmTally rollback system, covering common issues, diagnostic steps, and recovery procedures.

## Quick Reference

### Emergency Rollback Commands

```bash
# Manual rollback to specific build
ROLLBACK_BUILD_NUMBER=123 ./scripts/rollback-deployment.sh

# Verify backup exists before rollback
ROLLBACK_BUILD_NUMBER=123 ./scripts/rollback-deployment.sh verify-backup

# Health check after rollback
./scripts/rollback-deployment.sh health-check
```

### Jenkins Rollback Job

1. Navigate to Jenkins → FarmTally-Rollback
2. Click "Build with Parameters"
3. Set ROLLBACK_BUILD_NUMBER to target build
4. Set CONFIRMATION to "YES"
5. Click "Build"

## Common Issues and Solutions

### 1. Backup Not Found

**Symptoms:**
- Error: "Backup directory not found"
- Rollback fails at verification stage

**Diagnosis:**
```bash
# Check available backups
ssh root@147.93.153.247 "ls -la /opt/farmtally/backups/"

# Verify specific backup
ssh root@147.93.153.247 "ls -la /opt/farmtally/backups/build-123/"
```

**Solutions:**

**Option A: Use Alternative Backup**
```bash
# List all available backups
ssh root@147.93.153.247 "find /opt/farmtally/backups -name 'build-*' -type d | sort"

# Choose the closest available build number
ROLLBACK_BUILD_NUMBER=122 ./scripts/rollback-deployment.sh
```

**Option B: Manual Recovery**
```bash
# If no backups available, deploy from Git
ssh root@147.93.153.247
cd /opt/farmtally
git checkout <commit-hash>
npm ci --only=production
npm run build
pm2 restart farmtally-backend
```

### 2. Service Start Failure

**Symptoms:**
- PM2 process fails to start
- Health checks fail after rollback
- Application not responding

**Diagnosis:**
```bash
# Check PM2 status
ssh root@147.93.153.247 "pm2 status"

# Check PM2 logs
ssh root@147.93.153.247 "pm2 logs farmtally-backend --lines 50"

# Check system resources
ssh root@147.93.153.247 "free -h && df -h"

# Check port availability
ssh root@147.93.153.247 "netstat -tlnp | grep :3000"
```

**Solutions:**

**Option A: Force Restart**
```bash
ssh root@147.93.153.247 "
    pm2 delete farmtally-backend || true
    pm2 start /opt/farmtally/backend/server.js --name farmtally-backend
    pm2 save
"
```

**Option B: Check Dependencies**
```bash
ssh root@147.93.153.247 "
    cd /opt/farmtally/backend
    npm ci --only=production
    pm2 restart farmtally-backend
"
```

**Option C: Check Environment Variables**
```bash
ssh root@147.93.153.247 "
    cd /opt/farmtally/backend
    cat .env
    # Verify all required variables are present
"
```

### 3. Database State Issues

**Symptoms:**
- Application starts but database errors occur
- Migration state inconsistencies
- Data access failures

**Diagnosis:**
```bash
# Check database connectivity
ssh root@147.93.153.247 "
    cd /opt/farmtally/backend
    npx prisma db pull --preview-feature
"

# Check migration status
ssh root@147.93.153.247 "
    cd /opt/farmtally/backend
    npx prisma migrate status
"
```

**Solutions:**

**Option A: Reset to Known State**
```bash
ssh root@147.93.153.247 "
    cd /opt/farmtally/backend
    npx prisma migrate reset --force
    npx prisma migrate deploy
"
```

**Option B: Manual Migration Rollback**
```bash
# If you have migration rollback scripts
ssh root@147.93.153.247 "
    cd /opt/farmtally/backend
    # Run specific rollback migrations
    npx prisma migrate resolve --rolled-back <migration-name>
"
```

### 4. Health Check Failures

**Symptoms:**
- Rollback completes but health checks fail
- API endpoints not responding
- Timeout errors

**Diagnosis:**
```bash
# Test health endpoint directly
curl -v http://147.93.153.247:3000/api/health

# Check if service is listening
ssh root@147.93.153.247 "netstat -tlnp | grep :3000"

# Check application logs
ssh root@147.93.153.247 "pm2 logs farmtally-backend --lines 100"
```

**Solutions:**

**Option A: Wait and Retry**
```bash
# Sometimes services need more time to initialize
sleep 30
curl http://147.93.153.247:3000/api/health
```

**Option B: Check Firewall**
```bash
ssh root@147.93.153.247 "
    ufw status
    iptables -L
"
```

**Option C: Restart Nginx (if used)**
```bash
ssh root@147.93.153.247 "
    systemctl status nginx
    systemctl restart nginx
"
```

### 5. Permission Issues

**Symptoms:**
- File access denied errors
- Cannot write to directories
- PM2 permission errors

**Diagnosis:**
```bash
# Check file permissions
ssh root@147.93.153.247 "ls -la /opt/farmtally/"

# Check process ownership
ssh root@147.93.153.247 "ps aux | grep node"
```

**Solutions:**
```bash
ssh root@147.93.153.247 "
    chown -R root:root /opt/farmtally/
    chmod -R 755 /opt/farmtally/
    chmod +x /opt/farmtally/backend/server.js
"
```

## Advanced Troubleshooting

### Complete System Recovery

If rollback fails completely and the system is in an inconsistent state:

```bash
# 1. Stop all services
ssh root@147.93.153.247 "pm2 delete all"

# 2. Backup current state (if possible)
ssh root@147.93.153.247 "
    mkdir -p /opt/farmtally/emergency-backup
    cp -r /opt/farmtally/backend /opt/farmtally/emergency-backup/ || true
    cp -r /opt/farmtally/frontend /opt/farmtally/emergency-backup/ || true
"

# 3. Clean deployment directory
ssh root@147.93.153.247 "
    rm -rf /opt/farmtally/backend
    rm -rf /opt/farmtally/frontend
    mkdir -p /opt/farmtally/backend
    mkdir -p /opt/farmtally/frontend
"

# 4. Deploy from known good backup
ssh root@147.93.153.247 "
    cd /opt/farmtally
    # Find the most recent working backup
    LATEST_BACKUP=\$(ls -1 backups/ | grep '^build-' | sort -V | tail -1)
    echo \"Using backup: \$LATEST_BACKUP\"
    
    # Restore from backup
    tar -xzf backups/\$LATEST_BACKUP/backend.tar.gz
    tar -xzf backups/\$LATEST_BACKUP/frontend.tar.gz
    
    # Start services
    cd backend
    npm ci --only=production
    pm2 start server.js --name farmtally-backend
    pm2 save
"
```

### Database Recovery

If database is in an inconsistent state:

```bash
# 1. Create database backup
ssh root@147.93.153.247 "
    pg_dump farmtally > /opt/farmtally/db-backup-\$(date +%Y%m%d-%H%M%S).sql
"

# 2. Reset to clean state (DESTRUCTIVE - use with caution)
ssh root@147.93.153.247 "
    cd /opt/farmtally/backend
    npx prisma migrate reset --force
    npx prisma migrate deploy
    npm run seed  # If you have seed data
"
```

## Monitoring and Prevention

### Regular Health Checks

Create a monitoring script to detect issues early:

```bash
#!/bin/bash
# health-monitor.sh

check_health() {
    if curl -f -s http://147.93.153.247:3000/api/health > /dev/null; then
        echo "$(date): Health check PASSED"
        return 0
    else
        echo "$(date): Health check FAILED"
        return 1
    fi
}

# Run health check every 5 minutes
while true; do
    if ! check_health; then
        # Send alert
        echo "ALERT: FarmTally health check failed" | mail -s "FarmTally Alert" admin@farmtally.in
    fi
    sleep 300
done
```

### Backup Verification

Regularly verify that backups are being created:

```bash
#!/bin/bash
# verify-backups.sh

ssh root@147.93.153.247 "
    # Check recent backups
    find /opt/farmtally/backups -name 'build-*' -mtime -7 -type d
    
    # Verify backup integrity
    for backup in \$(find /opt/farmtally/backups -name 'build-*' -mtime -1 -type d); do
        echo \"Checking \$backup\"
        if [ -f \"\$backup/backend.tar.gz\" ] && [ -f \"\$backup/frontend.tar.gz\" ]; then
            echo \"  ✅ Backup complete\"
        else
            echo \"  ❌ Backup incomplete\"
        fi
    done
"
```

## Emergency Contacts and Procedures

### Escalation Path

1. **Level 1**: DevOps Engineer
   - Attempt automated rollback
   - Check system logs
   - Verify service status

2. **Level 2**: Senior Developer
   - Manual rollback procedures
   - Database state verification
   - Code-level debugging

3. **Level 3**: System Administrator
   - Infrastructure-level issues
   - Server recovery procedures
   - Emergency maintenance

### Emergency Procedures

**Complete Service Outage:**
1. Immediately attempt rollback to last known good build
2. If rollback fails, deploy emergency maintenance page
3. Notify all stakeholders
4. Begin manual recovery procedures

**Data Integrity Issues:**
1. Stop all write operations
2. Create immediate database backup
3. Assess data corruption extent
4. Restore from most recent clean backup
5. Replay transactions if possible

## Rollback Testing

### Regular Testing Schedule

**Weekly**: Test rollback procedure in staging environment
**Monthly**: Verify backup integrity and restoration procedures
**Quarterly**: Full disaster recovery simulation

### Test Procedures

```bash
# Staging rollback test
ROLLBACK_BUILD_NUMBER=<previous-build> ./scripts/rollback-deployment.sh

# Verify all functionality works after rollback
curl http://staging.farmtally.in/api/health
# Run automated test suite
npm run test:e2e
```

This troubleshooting guide should help resolve most rollback-related issues quickly and effectively. Keep this document updated as new issues are discovered and resolved.