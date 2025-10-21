# Jenkins Pipeline Troubleshooting Guide

## Overview

This guide provides solutions for common issues encountered in the FarmTally Jenkins CI/CD pipeline. Issues are organized by pipeline stage and include symptoms, root causes, and step-by-step resolution procedures.

## Quick Diagnosis Checklist

When a pipeline fails, follow this quick diagnosis process:

1. **Check Build Status**: Review the failed stage in Jenkins console output
2. **Verify Credentials**: Ensure all required environment variables are available
3. **Check Workspace Paths**: Confirm all file paths exist in the repository
4. **Review Recent Changes**: Check if recent commits introduced breaking changes
5. **Validate External Services**: Verify database, email, and other service connectivity

## Stage-Specific Troubleshooting

### 1. Workspace Setup Issues

#### Issue: "No such file or directory" Errors

**Symptoms:**
```
/bin/sh: line 1: cd: backend/: No such file or directory
npm: command not found in backend directory
```

**Root Cause:** Jenkinsfile references incorrect directory paths

**Resolution:**
```bash
# 1. Verify repository structure
git ls-tree -r HEAD --name-only | grep -E "(package\.json|src/)"

# 2. Update Jenkinsfile paths
# Backend commands should run from repository root
# Frontend commands should run from farmtally-frontend/

# 3. Correct Jenkinsfile example:
stage('Backend Build') {
    steps {
        // Run from repository root (where package.json exists)
        sh 'npm ci'
        sh 'npm run build'
    }
}

stage('Frontend Build') {
    steps {
        dir('farmtally-frontend') {
            sh 'npm ci'
            sh 'npm run build'
        }
    }
}
```

#### Issue: Permission Denied on Workspace

**Symptoms:**
```
Permission denied: cannot create directory
mkdir: cannot create directory '/var/jenkins_home/workspace'
```

**Root Cause:** Jenkins user lacks write permissions

**Resolution:**
```bash
# 1. Check Jenkins workspace permissions
sudo ls -la /var/jenkins_home/workspace/

# 2. Fix permissions if needed
sudo chown -R jenkins:jenkins /var/jenkins_home/workspace/
sudo chmod -R 755 /var/jenkins_home/workspace/

# 3. Restart Jenkins service
sudo systemctl restart jenkins
```

### 2. Environment Configuration Issues

#### Issue: Missing Environment Variables

**Symptoms:**
```
Error: DATABASE_URL is not defined
JWT_SECRET environment variable is required
```

**Root Cause:** Jenkins credentials not properly configured or injected

**Resolution:**
```bash
# 1. Verify credentials exist in Jenkins
# Navigate to: Manage Jenkins → Manage Credentials → System → Global

# 2. Check credential IDs match Jenkinsfile
# Jenkinsfile should reference exact credential ID:
environment {
    DATABASE_URL = credentials('farmtally-database-url')
    JWT_SECRET = credentials('farmtally-jwt-secret')
}

# 3. Add missing credentials
# In Jenkins UI: Add Credentials → Secret text → Enter ID and value

# 4. Verify credential injection in build logs
# Look for: "Masking supported pattern matches of $DATABASE_URL"
```

#### Issue: Invalid Database Connection

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
Database connection failed during migration
```

**Root Cause:** Incorrect DATABASE_URL or database server unavailable

**Resolution:**
```bash
# 1. Verify database server status
sudo systemctl status postgresql

# 2. Test database connectivity from Jenkins server
psql "postgresql://username:password@host:port/database" -c "SELECT 1;"

# 3. Check DATABASE_URL format
# Correct format: postgresql://username:password@host:port/database
# Verify: host, port, username, password, database name

# 4. Update Jenkins credential with correct URL
# Navigate to credential → Update → Enter correct DATABASE_URL

# 5. Test connection in pipeline
# Add temporary stage to verify connectivity before migration
```

### 3. Build Process Issues

#### Issue: Backend Build Failures

**Symptoms:**
```
npm ERR! code ELIFECYCLE
TypeScript compilation failed
Module not found errors
```

**Root Cause:** Missing dependencies, TypeScript errors, or outdated packages

**Resolution:**
```bash
# 1. Clear npm cache and reinstall dependencies
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# 2. Check TypeScript compilation locally
npm run build
npx tsc --noEmit

# 3. Verify all imports and dependencies
# Check for missing packages in package.json
# Ensure all import paths are correct

# 4. Update Jenkinsfile to use clean install
stage('Backend Build') {
    steps {
        sh 'rm -rf node_modules'
        sh 'npm ci'  // Use ci instead of install for reproducible builds
        sh 'npm run build'
    }
}
```

#### Issue: Frontend Build Failures

**Symptoms:**
```
Error: NEXT_PUBLIC_API_URL is not defined
Build failed: Module not found
Out of memory during build
```

**Root Cause:** Missing environment variables, dependency issues, or resource constraints

**Resolution:**
```bash
# 1. Verify frontend environment variables
# Check that all NEXT_PUBLIC_* variables are set in Jenkins credentials

# 2. Increase Node.js memory for build
stage('Frontend Build') {
    steps {
        dir('farmtally-frontend') {
            sh 'export NODE_OPTIONS="--max-old-space-size=4096"'
            sh 'npm ci'
            sh 'npm run build'
        }
    }
}

# 3. Clear Next.js cache if build issues persist
sh 'rm -rf farmtally-frontend/.next'
sh 'rm -rf farmtally-frontend/node_modules'

# 4. Verify all required environment variables are injected
# Add validation step before build:
sh 'echo "API URL: $NEXT_PUBLIC_API_URL"'
sh 'test -n "$NEXT_PUBLIC_API_URL" || exit 1'
```

### 4. Database Migration Issues

#### Issue: Migration Failures

**Symptoms:**
```
Migration failed: relation "users" already exists
Prisma migrate deploy failed
Database schema drift detected
```

**Root Cause:** Schema conflicts, incomplete migrations, or database state issues

**Resolution:**
```bash
# 1. Check current migration status
npx prisma migrate status

# 2. Resolve schema drift
npx prisma db pull  # Pull current database schema
npx prisma migrate resolve --applied "migration_name"  # Mark as applied if needed

# 3. Reset database (CAUTION: Only for development/staging)
npx prisma migrate reset  # This will delete all data

# 4. For production issues, create corrective migration
npx prisma migrate dev --name fix_schema_conflict

# 5. Update pipeline to handle migration failures gracefully
stage('Database Migration') {
    steps {
        script {
            def migrationResult = sh(
                script: 'npx prisma migrate deploy',
                returnStatus: true
            )
            if (migrationResult != 0) {
                error("Database migration failed. Aborting deployment.")
            }
        }
    }
}
```

#### Issue: Database Connection Timeout

**Symptoms:**
```
Error: Connection timeout
Could not connect to database within 30 seconds
```

**Root Cause:** Network issues, database overload, or incorrect connection parameters

**Resolution:**
```bash
# 1. Increase connection timeout in Prisma
# Update schema.prisma:
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["connectionTimeout"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# 2. Add connection retry logic
stage('Database Migration') {
    steps {
        retry(3) {
            sh 'npx prisma migrate deploy'
        }
    }
}

# 3. Verify database server resources
# Check CPU, memory, and connection limits on database server
```

### 5. Deployment Issues

#### Issue: Artifact Upload Failures

**Symptoms:**
```
SCP failed: No such file or directory
rsync: failed to connect to remote host
Permission denied (publickey)
```

**Root Cause:** Missing build artifacts, SSH key issues, or incorrect paths

**Resolution:**
```bash
# 1. Verify artifacts exist before upload
stage('Deploy') {
    steps {
        // Verify artifacts exist
        sh 'ls -la dist/'
        sh 'ls -la farmtally-frontend/.next/'
        
        // Upload with error handling
        sh '''
            scp -r dist/ user@server:/opt/farmtally/backend/ || exit 1
            scp -r farmtally-frontend/.next/ user@server:/opt/farmtally/frontend/ || exit 1
        '''
    }
}

# 2. Fix SSH key authentication
# Ensure Jenkins has SSH private key configured
# Test SSH connection: ssh -i /path/to/key user@server

# 3. Verify target directories exist on server
ssh user@server 'mkdir -p /opt/farmtally/{backend,frontend}'
```

#### Issue: Service Restart Failures

**Symptoms:**
```
PM2 restart failed
systemctl restart failed
Application not responding after restart
```

**Root Cause:** Service configuration issues, port conflicts, or application errors

**Resolution:**
```bash
# 1. Check service status
ssh user@server 'pm2 status'
ssh user@server 'systemctl status farmtally'

# 2. Review application logs
ssh user@server 'pm2 logs farmtally'
ssh user@server 'journalctl -u farmtally -f'

# 3. Verify port availability
ssh user@server 'netstat -tlnp | grep :3000'

# 4. Restart with proper error handling
stage('Restart Services') {
    steps {
        sh '''
            ssh user@server "pm2 restart farmtally || pm2 start ecosystem.config.js"
            sleep 10  # Allow time for startup
            ssh user@server "pm2 status farmtally"
        '''
    }
}
```

### 6. Health Check Issues

#### Issue: Health Check Failures

**Symptoms:**
```
Health check failed: HTTP 500
Connection refused on health endpoint
Authentication failed for health check
```

**Root Cause:** Application startup issues, configuration problems, or service dependencies

**Resolution:**
```bash
# 1. Verify application is running
curl -f http://localhost:3000/api/health

# 2. Check application logs for startup errors
pm2 logs farmtally --lines 50

# 3. Verify all environment variables are loaded
# Add debug endpoint to show configuration (without secrets)

# 4. Test health check components individually
# Database connectivity:
curl -f http://localhost:3000/api/health/db

# Authentication service:
curl -f -H "Authorization: Bearer $SERVICE_TOKEN" \
  http://localhost:3000/api/auth/verify

# 5. Increase health check timeout and retries
stage('Health Check') {
    steps {
        retry(5) {
            sh 'sleep 30'  # Wait for application startup
            sh 'curl -f --max-time 60 http://localhost:3000/api/health'
        }
    }
}
```

## Emergency Procedures

### Immediate Rollback

When a deployment fails and production is affected:

```bash
# 1. Trigger rollback job in Jenkins
# Navigate to "FarmTally-Rollback" job → Build with Parameters

# 2. Manual rollback if Jenkins is unavailable
ssh user@server
cd /opt/farmtally
cp -r previous/ current/
pm2 restart farmtally

# 3. Verify rollback success
curl -f https://your-domain.com/api/health
```

### Database Recovery

For database-related emergencies:

```bash
# 1. Stop application to prevent further damage
pm2 stop farmtally

# 2. Create database backup
pg_dump farmtally_production > emergency_backup_$(date +%Y%m%d_%H%M%S).sql

# 3. Restore from last known good backup
psql farmtally_production < backup_file.sql

# 4. Reset migrations to match restored state
npx prisma migrate resolve --applied "last_good_migration"

# 5. Restart application
pm2 start farmtally
```

### Communication During Incidents

1. **Immediate Notification**
   - Post in team Slack channel: #farmtally-alerts
   - Include: Issue description, affected services, ETA for resolution

2. **Status Updates**
   - Provide updates every 15 minutes during active incidents
   - Include: Current status, actions taken, next steps

3. **Post-Incident**
   - Document root cause and resolution steps
   - Update this troubleshooting guide with new solutions
   - Schedule post-mortem meeting if needed

## Prevention Strategies

### Regular Maintenance

1. **Weekly Tasks**
   - Review build performance metrics
   - Check disk space on Jenkins and VPS servers
   - Verify backup integrity

2. **Monthly Tasks**
   - Update dependencies and security patches
   - Review and rotate credentials
   - Test rollback procedures

3. **Quarterly Tasks**
   - Performance optimization review
   - Disaster recovery testing
   - Documentation updates

### Monitoring Setup

1. **Pipeline Monitoring**
   - Set up alerts for build failures
   - Monitor build duration trends
   - Track deployment frequency and success rates

2. **Application Monitoring**
   - Health check endpoint monitoring
   - Database performance monitoring
   - Error rate and response time tracking

This troubleshooting guide should be updated whenever new issues are encountered and resolved.