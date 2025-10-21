# Jenkins Rollback Procedures

## Overview

This document provides comprehensive procedures for rolling back FarmTally deployments when issues are detected in production. The rollback system is designed to quickly restore the previous working version while maintaining data integrity and minimizing downtime.

## Rollback Triggers

### Automatic Rollback Scenarios

The pipeline automatically triggers rollback in these situations:

1. **Health Check Failures**
   - API endpoints returning non-200 status codes
   - Database connectivity failures
   - Authentication service failures

2. **Migration Failures**
   - Prisma migration errors
   - Database schema conflicts
   - Data integrity violations

3. **Service Startup Failures**
   - Application fails to start within timeout period
   - PM2 process crashes immediately after restart
   - Port binding failures

### Manual Rollback Scenarios

Manual rollback should be initiated when:

1. **Performance Degradation**
   - Response times significantly increased
   - High error rates detected
   - Resource utilization spikes

2. **Functional Issues**
   - Critical features not working
   - Data corruption detected
   - Security vulnerabilities discovered

3. **User-Reported Issues**
   - Multiple user complaints
   - Business-critical workflows broken
   - Data loss or inconsistency reports

## Rollback Methods

### Method 1: Jenkins Rollback Job (Recommended)

This is the preferred method for most rollback scenarios.

#### Prerequisites
- Jenkins rollback job configured and tested
- Previous artifact versions available
- Database backup recent and verified

#### Procedure

1. **Access Jenkins Rollback Job**
   ```
   1. Navigate to Jenkins dashboard
   2. Locate "FarmTally-Rollback" job
   3. Click "Build with Parameters"
   ```

2. **Select Rollback Target**
   ```
   Parameters:
   - TARGET_VERSION: Select from dropdown of recent successful builds
   - ROLLBACK_TYPE: Choose "full" or "code-only"
   - SKIP_DB_ROLLBACK: Check if database changes should be preserved
   - NOTIFICATION_CHANNEL: Select alert destination
   ```

3. **Execute Rollback**
   ```
   1. Click "Build"
   2. Monitor console output for progress
   3. Verify each stage completes successfully
   4. Wait for completion confirmation
   ```

4. **Verify Rollback Success**
   ```bash
   # Automated verification (performed by rollback job)
   curl -f https://your-domain.com/api/health
   curl -f https://your-domain.com/api/auth/verify
   
   # Manual verification
   - Test critical user workflows
   - Check application logs for errors
   - Verify database connectivity
   ```

#### Rollback Job Stages

The Jenkins rollback job executes these stages:

```groovy
pipeline {
    agent any
    parameters {
        choice(name: 'TARGET_VERSION', choices: getAvailableVersions())
        choice(name: 'ROLLBACK_TYPE', choices: ['full', 'code-only'])
        booleanParam(name: 'SKIP_DB_ROLLBACK', defaultValue: false)
    }
    
    stages {
        stage('Validate Target Version') {
            steps {
                script {
                    // Verify target artifact exists and is valid
                    sh "test -f /opt/farmtally/artifacts/${params.TARGET_VERSION}/manifest.json"
                }
            }
        }
        
        stage('Backup Current State') {
            steps {
                // Create backup of current deployment
                sh "cp -r /opt/farmtally/current /opt/farmtally/backup-$(date +%Y%m%d_%H%M%S)"
            }
        }
        
        stage('Stop Services') {
            steps {
                sh "pm2 stop farmtally"
            }
        }
        
        stage('Restore Code') {
            steps {
                script {
                    // Extract and deploy target version
                    sh """
                        cd /opt/farmtally
                        rm -rf current/*
                        tar -xzf artifacts/${params.TARGET_VERSION}/backend.tar.gz -C current/
                        tar -xzf artifacts/${params.TARGET_VERSION}/frontend.tar.gz -C current/
                    """
                }
            }
        }
        
        stage('Database Rollback') {
            when {
                not { params.SKIP_DB_ROLLBACK }
            }
            steps {
                // Restore database to previous state if needed
                sh "npx prisma migrate resolve --rolled-back migration_name"
            }
        }
        
        stage('Restart Services') {
            steps {
                sh "pm2 start farmtally"
                sh "sleep 30"  // Allow startup time
            }
        }
        
        stage('Verify Rollback') {
            steps {
                // Run health checks
                sh "curl -f https://your-domain.com/api/health"
                sh "curl -f -H 'Authorization: Bearer $SERVICE_TOKEN' https://your-domain.com/api/auth/verify"
            }
        }
        
        stage('Notify Team') {
            steps {
                // Send rollback completion notification
                sh "scripts/send-rollback-notification.sh ${params.TARGET_VERSION}"
            }
        }
    }
}
```

### Method 2: Manual Server Rollback

Use this method when Jenkins is unavailable or for emergency situations.

#### Prerequisites
- SSH access to production server
- Knowledge of artifact locations
- Database backup available

#### Procedure

1. **Connect to Production Server**
   ```bash
   ssh farmtally@your-production-server
   cd /opt/farmtally
   ```

2. **Identify Target Version**
   ```bash
   # List available artifacts
   ls -la artifacts/
   
   # View artifact details
   cat artifacts/farmtally-123-abc1234/manifest.json
   
   # Choose target version (usually previous successful deployment)
   TARGET_VERSION="farmtally-123-abc1234"
   ```

3. **Create Current State Backup**
   ```bash
   # Backup current deployment
   BACKUP_NAME="backup-$(date +%Y%m%d_%H%M%S)"
   cp -r current/ $BACKUP_NAME
   echo "Current state backed up to: $BACKUP_NAME"
   ```

4. **Stop Application Services**
   ```bash
   # Stop PM2 processes
   pm2 stop farmtally
   pm2 status  # Verify stopped
   
   # Stop Nginx if needed
   sudo systemctl stop nginx
   ```

5. **Restore Previous Version**
   ```bash
   # Clear current deployment
   rm -rf current/*
   
   # Extract target version artifacts
   cd current/
   tar -xzf ../artifacts/$TARGET_VERSION/backend.tar.gz
   tar -xzf ../artifacts/$TARGET_VERSION/frontend.tar.gz
   
   # Verify extraction
   ls -la
   ```

6. **Handle Database Rollback (if needed)**
   ```bash
   # Check if database rollback is required
   # Compare current schema with target version requirements
   
   # If rollback needed:
   cd /opt/farmtally/current
   
   # Option 1: Rollback specific migration
   npx prisma migrate resolve --rolled-back "migration_name"
   
   # Option 2: Restore from backup (CAUTION: Data loss)
   # pg_dump current_db > emergency_backup.sql
   # psql farmtally_production < previous_backup.sql
   ```

7. **Restart Services**
   ```bash
   # Start PM2 processes
   pm2 start farmtally
   pm2 status
   
   # Start Nginx
   sudo systemctl start nginx
   sudo systemctl status nginx
   
   # Wait for application startup
   sleep 30
   ```

8. **Verify Rollback Success**
   ```bash
   # Test health endpoints
   curl -f http://localhost:3000/api/health
   curl -f https://your-domain.com/api/health
   
   # Test authentication
   curl -f -H "Authorization: Bearer $SERVICE_TOKEN" \
     http://localhost:3000/api/auth/verify
   
   # Check application logs
   pm2 logs farmtally --lines 20
   ```

### Method 3: Database-Only Rollback

For issues specifically related to database changes.

#### When to Use
- Database migration caused data corruption
- Schema changes broke application functionality
- Performance degradation due to database changes

#### Procedure

1. **Assess Database State**
   ```bash
   # Connect to database
   psql farmtally_production
   
   # Check migration status
   npx prisma migrate status
   
   # Identify problematic migration
   SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5;
   ```

2. **Create Database Backup**
   ```bash
   # Create full backup before rollback
   pg_dump farmtally_production > pre_rollback_backup_$(date +%Y%m%d_%H%M%S).sql
   ```

3. **Rollback Migration**
   ```bash
   # Option 1: Mark migration as rolled back
   npx prisma migrate resolve --rolled-back "20241020_problematic_migration"
   
   # Option 2: Restore from previous backup
   psql farmtally_production < previous_good_backup.sql
   
   # Option 3: Manual schema correction
   psql farmtally_production -c "DROP TABLE problematic_table;"
   ```

4. **Verify Database State**
   ```bash
   # Test database connectivity
   npx prisma db pull
   
   # Run application tests
   npm run test:db
   
   # Verify critical queries work
   psql farmtally_production -c "SELECT COUNT(*) FROM users;"
   ```

## Rollback Verification Checklist

After any rollback, verify these components:

### Application Health
- [ ] API health endpoint returns 200
- [ ] Authentication service functional
- [ ] Database queries executing successfully
- [ ] Frontend loads without errors
- [ ] Critical user workflows operational

### System Health
- [ ] PM2 processes running stable
- [ ] Nginx serving requests
- [ ] SSL certificates valid
- [ ] Log files show no critical errors
- [ ] Resource usage within normal ranges

### Data Integrity
- [ ] Database schema consistent
- [ ] Critical data tables accessible
- [ ] User authentication working
- [ ] Recent data changes preserved (if intended)
- [ ] No data corruption detected

### Performance
- [ ] Response times within acceptable range
- [ ] Database query performance normal
- [ ] Memory usage stable
- [ ] CPU usage normal
- [ ] No resource leaks detected

## Post-Rollback Actions

### Immediate Actions (0-30 minutes)

1. **Team Notification**
   ```bash
   # Send rollback completion notification
   # Include: Version rolled back to, reason, verification status
   ```

2. **Monitoring Setup**
   ```bash
   # Increase monitoring frequency
   # Watch for any issues with rolled-back version
   # Monitor user activity and error rates
   ```

3. **Documentation**
   ```bash
   # Document rollback reason and process
   # Update incident tracking system
   # Note any lessons learned
   ```

### Short-term Actions (1-24 hours)

1. **Root Cause Analysis**
   - Identify what caused the need for rollback
   - Review deployment process for improvements
   - Check if issue affects other environments

2. **Fix Development**
   - Create fix for the issue that caused rollback
   - Test fix thoroughly in staging environment
   - Plan next deployment with fix

3. **Process Review**
   - Review rollback procedure effectiveness
   - Update documentation if needed
   - Consider process improvements

### Long-term Actions (1-7 days)

1. **Post-Mortem Meeting**
   - Conduct team review of incident
   - Document findings and action items
   - Update procedures based on learnings

2. **Prevention Measures**
   - Implement additional testing if needed
   - Improve monitoring and alerting
   - Update deployment procedures

3. **Training Updates**
   - Update team training materials
   - Share lessons learned with broader team
   - Practice rollback procedures if needed

## Emergency Contacts

### Primary Contacts
- **DevOps Lead**: [Contact Information]
- **Backend Lead**: [Contact Information]
- **Database Administrator**: [Contact Information]

### Escalation Path
1. **Level 1**: Development Team Lead
2. **Level 2**: Technical Director
3. **Level 3**: CTO/VP Engineering

### Communication Channels
- **Immediate**: Slack #farmtally-alerts
- **Updates**: Slack #farmtally-team
- **External**: Status page updates
- **Management**: Email summary

## Rollback Testing

### Regular Testing Schedule
- **Monthly**: Test Jenkins rollback job in staging
- **Quarterly**: Full rollback drill including database
- **Annually**: Disaster recovery simulation

### Test Scenarios
1. **Code-only rollback** (no database changes)
2. **Full rollback** (including database migration rollback)
3. **Emergency manual rollback** (Jenkins unavailable)
4. **Partial rollback** (frontend or backend only)

This rollback procedure should be tested regularly and updated based on operational experience.