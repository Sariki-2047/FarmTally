# FarmTally Database Migration and Rollback Guide

## Overview

This guide covers the database migration automation and rollback system integrated into the FarmTally Jenkins CI/CD pipeline. The system ensures safe database migrations during deployments and provides rollback capabilities when needed.

## Components

### 1. Migration Handler Scripts

#### `scripts/migration-handler.js` (Primary)
- Cross-platform Node.js script for database migrations
- Comprehensive error handling and logging
- Database connectivity verification
- Migration status reporting
- Rollback-safe execution

#### `scripts/migration-handler.sh` (Linux/Unix)
- Bash script for Unix-like systems
- Timeout handling and retry logic
- Detailed logging and reporting

#### `scripts/migration-handler.bat` (Windows)
- Windows batch script for local development
- Basic migration functionality

### 2. Rollback System

#### `scripts/rollback-deployment.sh`
- Complete deployment rollback functionality
- Artifact restoration from backups
- Service management and health verification
- Comprehensive logging and reporting

#### `jenkins-rollback-job.groovy`
- Jenkins job configuration for rollback operations
- Parameterized rollback with safety confirmations
- Health verification and notification system

## Migration Process

### Automated Migration Flow

1. **Pre-Migration Checks**
   - Database connectivity verification
   - Environment variable validation
   - Migration status assessment

2. **Migration Execution**
   - Schema backup creation
   - Prisma migration deployment
   - Error handling and logging

3. **Post-Migration Verification**
   - Migration completion verification
   - Prisma client generation test
   - Status reporting

### Jenkins Integration

The migration stage is integrated into the main deployment pipeline:

```groovy
stage('Database Migration') {
    steps {
        withCredentials([...]) {
            // Database connectivity check
            // Migration execution
            // Verification and reporting
        }
    }
}
```

## Rollback System

### Automatic Rollback Triggers

- Migration execution failure
- Health check failure after deployment
- Service startup failure

### Manual Rollback Process

1. **Access Jenkins Rollback Job**
   - Navigate to "FarmTally-Rollback" job
   - Set required parameters

2. **Required Parameters**
   - `ROLLBACK_BUILD_NUMBER`: Target build to rollback to
   - `CONFIRMATION`: Must be set to "YES"
   - `SKIP_HEALTH_CHECK`: Optional health check skip
   - `BACKUP_CURRENT`: Create backup before rollback

3. **Rollback Execution**
   - Backup verification
   - Current state backup
   - Service shutdown
   - Artifact restoration
   - Service restart
   - Health verification

## Usage Examples

### Manual Migration Execution

```bash
# Check database connectivity
node scripts/migration-handler.js check-connectivity

# Get migration status
node scripts/migration-handler.js status

# Execute migrations
node scripts/migration-handler.js migrate
```

### Manual Rollback Execution

```bash
# Set target build number
export ROLLBACK_BUILD_NUMBER=123

# Verify backup exists
./scripts/rollback-deployment.sh verify-backup

# Execute rollback
./scripts/rollback-deployment.sh rollback
```

## Error Handling

### Migration Failures

1. **Database Connectivity Issues**
   - Automatic retry with exponential backoff
   - Clear error messages with troubleshooting hints
   - Pipeline abortion to preserve current state

2. **Migration Execution Errors**
   - Detailed error logging
   - Artifact archival for debugging
   - Automatic rollback trigger

3. **Verification Failures**
   - Multiple verification methods
   - Graceful degradation with warnings
   - Manual intervention guidance

### Rollback Failures

1. **Backup Not Found**
   - Clear error messages
   - Available backup listing
   - Manual recovery guidance

2. **Service Startup Issues**
   - Detailed service logs
   - Health check retries
   - Emergency contact procedures

## Monitoring and Alerting

### Migration Monitoring

- **Success Metrics**: Migration completion time, applied migrations count
- **Failure Alerts**: Email notifications with error details
- **Logs**: Comprehensive logging with structured data

### Rollback Monitoring

- **Rollback Events**: Automatic tracking and notification
- **Health Verification**: Post-rollback service validation
- **Audit Trail**: Complete rollback history and reasoning

## Best Practices

### Development

1. **Test Migrations Locally**
   ```bash
   # Test migration in development
   npm run db:migrate:dev
   
   # Verify migration status
   npx prisma migrate status
   ```

2. **Review Migration Scripts**
   - Always review generated migration files
   - Test with sample data
   - Verify rollback compatibility

### Production

1. **Pre-Deployment Checks**
   - Verify database backup availability
   - Confirm migration compatibility
   - Review deployment window

2. **Post-Deployment Monitoring**
   - Monitor application health
   - Verify data integrity
   - Check performance metrics

## Troubleshooting

### Common Issues

#### Migration Timeout
```bash
# Increase timeout in migration handler
MIGRATION_TIMEOUT=600 node scripts/migration-handler.js migrate
```

#### Database Connection Issues
```bash
# Verify database URL
echo $DATABASE_URL

# Test connection manually
npx prisma db pull --preview-feature
```

#### Rollback Backup Missing
```bash
# List available backups
ssh user@vps 'ls -la /opt/farmtally/backups/'

# Create manual backup
ssh user@vps 'cd /opt/farmtally && tar -czf backups/manual-backup.tar.gz backend/ frontend/'
```

### Emergency Procedures

#### Complete System Failure
1. Stop all services immediately
2. Restore from last known good backup
3. Verify database consistency
4. Restart services with health monitoring
5. Notify development team

#### Data Corruption
1. Stop application immediately
2. Restore database from backup
3. Verify data integrity
4. Apply necessary migrations manually
5. Resume operations with monitoring

## Configuration

### Environment Variables

```bash
# Required for migrations
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-jwt-secret

# Optional configuration
MIGRATION_TIMEOUT=300
RETRY_COUNT=3
RETRY_DELAY=10
```

### Jenkins Credentials

- `farmtally-database-url`: Production database connection
- `farmtally-jwt-secret`: JWT signing secret
- `vps-ssh-key`: SSH key for VPS access

## Security Considerations

### Database Access
- Use dedicated migration user with limited privileges
- Rotate database credentials regularly
- Monitor database access logs

### Backup Security
- Encrypt backup files at rest
- Secure backup storage location
- Regular backup integrity verification

### Rollback Security
- Require explicit confirmation for rollbacks
- Audit all rollback operations
- Limit rollback access to authorized personnel

## Maintenance

### Regular Tasks

1. **Backup Cleanup**
   - Automated cleanup of old backups (keeps last 10)
   - Manual verification of backup integrity
   - Storage usage monitoring

2. **Log Rotation**
   - Migration logs archived after 30 days
   - Rollback logs retained for audit purposes
   - Log compression for storage efficiency

3. **Health Monitoring**
   - Regular migration system health checks
   - Rollback system functionality verification
   - Performance metrics review

### Updates and Improvements

1. **Script Updates**
   - Version control for all migration scripts
   - Testing in staging environment
   - Gradual rollout to production

2. **Process Improvements**
   - Regular review of migration procedures
   - Feedback incorporation from operations team
   - Documentation updates

This guide provides comprehensive coverage of the database migration and rollback system. For additional support or questions, contact the development team or refer to the Jenkins job logs for detailed execution information.