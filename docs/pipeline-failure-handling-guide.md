# FarmTally Pipeline Failure Handling Guide

## Overview

This guide documents the comprehensive failure handling and notification system implemented in the FarmTally Jenkins pipeline. The system provides automatic error detection, failure recovery, notification alerts, and detailed logging for all pipeline stages.

## Failure Handling Components

### 1. Failure Handler Script (`scripts/failure-handler.js`)

The central failure handling component that processes different types of pipeline failures:

**Supported Failure Types:**
- `workspace_validation` - Workspace path and structure issues
- `credential_validation` - Missing or invalid Jenkins credentials
- `environment_validation` - Environment variable or service connectivity issues
- `build_failure` - Backend or frontend build failures
- `migration_failure` - Database migration failures
- `deployment_failure` - Deployment process failures
- `health_check_failure` - Post-deployment health check failures

**Key Features:**
- Automatic failure detection and classification
- Detailed error logging and reporting
- Failure-specific recovery actions
- Notification system integration
- Artifact cleanup and preservation

### 2. Pipeline Integration

The Jenkinsfile has been enhanced with comprehensive failure handling:

```groovy
// Example failure handling in pipeline stage
try {
    // Stage execution logic
    sh 'npm run build'
} catch (Exception e) {
    echo "❌ Build failed: ${e.getMessage()}"
    sh "node scripts/failure-handler.js build_failure '${e.getMessage()}' 'Build Stage'"
    throw e
}
```

### 3. Notification System

Multi-channel notification system for different pipeline events:

**Notification Types:**
- **Success**: Deployment completed successfully
- **Failure**: Pipeline stage failed or deployment issues
- **Warning**: Pipeline completed with non-critical issues
- **Abort**: Pipeline was manually cancelled

**Notification Channels:**
- Email notifications (configurable recipients)
- Slack notifications (webhook integration)
- Jenkins build status updates

## Failure Scenarios and Responses

### Workspace Validation Failures

**Triggers:**
- Missing package.json files
- Incorrect directory structure
- Invalid path references in Jenkinsfile

**Response:**
- Immediate pipeline abortion
- Clear error messages indicating path issues
- Recommendations for fixing workspace structure

**Recovery:**
- Manual correction of Jenkinsfile paths
- Repository structure verification

### Credential Validation Failures

**Triggers:**
- Missing Jenkins credentials
- Invalid credential references
- Credential access permissions

**Response:**
- Pipeline abortion before sensitive operations
- Detailed credential validation report
- Security-focused error messages

**Recovery:**
- Add missing credentials to Jenkins
- Verify credential IDs in Jenkinsfile
- Check Jenkins user permissions

### Environment Validation Failures

**Triggers:**
- Missing environment variables
- Service connectivity issues
- Invalid configuration values

**Response:**
- Pre-build validation failure
- Service connectivity verification
- Environment-specific error reporting

**Recovery:**
- Configure missing environment variables
- Verify external service availability
- Update configuration values

### Build Failures

**Triggers:**
- Compilation errors
- Missing dependencies
- Build script failures

**Response:**
- Build artifact cleanup
- Detailed build error logging
- Previous version preservation

**Recovery:**
- Fix compilation errors
- Update dependencies
- Verify build scripts

### Migration Failures

**Triggers:**
- Database connectivity issues
- Migration script errors
- Schema conflicts

**Response:**
- Database state consistency verification
- Migration rollback if needed
- Deployment abortion to preserve previous version

**Recovery:**
- Verify database connectivity
- Fix migration scripts
- Resolve schema conflicts

### Deployment Failures

**Triggers:**
- File transfer errors
- Service restart failures
- Configuration issues

**Response:**
- Previous version preservation
- Service continuity maintenance
- Detailed deployment logging

**Recovery:**
- Verify VPS connectivity
- Check service configuration
- Review deployment logs

### Health Check Failures

**Triggers:**
- API endpoint failures
- Service unavailability
- Authentication issues

**Response:**
- Automatic rollback initiation
- Service restoration to previous version
- Health status monitoring

**Recovery:**
- Investigate service logs
- Verify external dependencies
- Check authentication configuration

## Configuration

### Email Notifications

Configure email notifications using Jenkins credentials:

```groovy
environment {
    SUCCESS_EMAIL_RECIPIENTS = credentials('success-email-recipients')
    FAILURE_EMAIL_RECIPIENTS = credentials('failure-email-recipients')
    WARNING_EMAIL_RECIPIENTS = credentials('warning-email-recipients')
}
```

**Required Jenkins Credentials:**
- `success-email-recipients` - Comma-separated email list for success notifications
- `failure-email-recipients` - Comma-separated email list for failure notifications
- `warning-email-recipients` - Comma-separated email list for warning notifications

### Slack Notifications

Configure Slack notifications using webhook URL:

```groovy
environment {
    SLACK_WEBHOOK_URL = credentials('slack-webhook-url')
}
```

**Required Jenkins Credential:**
- `slack-webhook-url` - Slack webhook URL for channel notifications

### Notification Setup Script

Use the notification configuration script to set up email and Slack notifications:

```bash
# Linux/Mac
./scripts/configure-notifications.sh

# Windows
scripts\configure-notifications.bat
```

## Monitoring and Logging

### Failure Reports

The system generates detailed failure reports stored in `failure-reports/` directory:

```json
{
  "id": "failure-1634567890123",
  "timestamp": "2024-01-15T10:30:00Z",
  "type": "build_failure",
  "error": {
    "message": "npm run build failed",
    "stack": "..."
  },
  "context": {
    "buildNumber": "42",
    "gitCommit": "abc123",
    "gitBranch": "main",
    "stage": "Build Backend"
  },
  "actions": [
    {
      "type": "build_failure",
      "message": "Build failed - deployment aborted",
      "recommendation": "Check build logs and fix compilation errors"
    }
  ]
}
```

### Log Files

**Pipeline Failure Log** (`pipeline-failure.log`):
- Chronological failure events
- Error messages and context
- Action summaries

**Migration Logs** (`migration.log`):
- Database migration execution details
- Success/failure status
- Schema change summaries

### Jenkins Artifacts

The pipeline automatically archives relevant artifacts:
- Failure reports (JSON format)
- Migration logs
- Build validation reports
- Environment configuration reports

## Troubleshooting

### Common Issues

**1. Failure Handler Not Executing**
- Verify Node.js is available in Jenkins environment
- Check script permissions and paths
- Review Jenkins console output for errors

**2. Notifications Not Sending**
- Verify Jenkins credentials configuration
- Check email server settings
- Test Slack webhook URL

**3. Database State Issues After Migration Failure**
- Review migration logs for specific errors
- Check database connectivity
- Verify Prisma schema consistency

**4. Previous Version Not Preserved**
- Check PM2 process status
- Verify backup creation in deployment logs
- Review VPS file system permissions

### Debug Commands

**Test Failure Handler:**
```bash
node scripts/failure-handler.js build_failure "Test error message" "Test Stage"
```

**Check Database State:**
```bash
npx prisma migrate status
npx prisma db pull --preview-feature
```

**Verify Service Status:**
```bash
pm2 status
pm2 logs farmtally-backend
```

## Best Practices

### Pipeline Development

1. **Test Failure Scenarios**: Regularly test failure handling in staging environment
2. **Monitor Notifications**: Ensure notification channels are actively monitored
3. **Review Failure Reports**: Analyze failure patterns to improve pipeline reliability
4. **Update Documentation**: Keep failure handling documentation current with changes

### Incident Response

1. **Immediate Assessment**: Check notification alerts and Jenkins console
2. **Service Status**: Verify that previous version is still running
3. **Log Analysis**: Review failure reports and relevant log files
4. **Recovery Planning**: Determine if rollback or forward fix is appropriate
5. **Post-Incident Review**: Document lessons learned and improve processes

### Maintenance

1. **Regular Testing**: Test notification systems monthly
2. **Credential Rotation**: Update notification credentials as needed
3. **Log Cleanup**: Archive old failure reports and logs
4. **Performance Monitoring**: Track failure handling execution times

## Integration with Rollback System

The failure handling system integrates with the rollback capabilities:

- **Automatic Rollback**: Health check failures trigger automatic rollback
- **Manual Rollback**: Failure reports include rollback recommendations
- **State Preservation**: Failed deployments preserve previous working version
- **Verification**: Rollback success is verified through health checks

For detailed rollback procedures, see the [Rollback System Documentation](rollback-system-guide.md).

## Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly**: Review failure reports and notification delivery
2. **Monthly**: Test notification systems and update recipient lists
3. **Quarterly**: Review and update failure handling procedures
4. **Annually**: Comprehensive failure handling system audit

### Emergency Contacts

Ensure the following contacts are configured for critical failures:
- DevOps team lead
- System administrators
- On-call engineers
- Business stakeholders (for critical production issues)

This comprehensive failure handling system ensures that FarmTally deployments are reliable, failures are quickly detected and handled, and the team is promptly notified of any issues while maintaining service continuity.