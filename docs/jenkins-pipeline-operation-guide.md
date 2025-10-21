# Jenkins Pipeline Operation Guide

## Overview

This guide provides comprehensive instructions for operating the FarmTally Jenkins CI/CD pipeline. The pipeline automates the build, test, and deployment process for both backend and frontend components while ensuring secure configuration management and reliable rollback capabilities.

## Pipeline Architecture

The FarmTally pipeline consists of the following stages:

1. **Workspace Setup** - Path validation and environment preparation
2. **Environment Injection** - Secure credential loading from Jenkins vault
3. **Backend Build** - Node.js/TypeScript compilation and packaging
4. **Frontend Build** - Next.js production build with environment configuration
5. **Database Migration** - Prisma schema updates and data migrations
6. **Deployment** - Artifact deployment to production VPS
7. **Health Verification** - Comprehensive API and database connectivity checks
8. **Artifact Storage** - Versioned artifact archival for rollback support

## Daily Operations

### Monitoring Pipeline Status

1. **Access Jenkins Dashboard**
   - Navigate to your Jenkins instance
   - Locate the "FarmTally-Pipeline" job
   - Check the build history for recent executions

2. **Pipeline Status Indicators**
   - 🟢 **Green**: Successful build and deployment
   - 🔴 **Red**: Failed build or deployment (requires attention)
   - 🟡 **Yellow**: Unstable build (warnings present)
   - ⚪ **Gray**: Build not executed or aborted

3. **Build Logs Review**
   - Click on any build number to view details
   - Navigate to "Console Output" for detailed logs
   - Look for stage-specific success/failure messages

### Triggering Manual Builds

1. **Standard Deployment**
   ```
   1. Navigate to FarmTally-Pipeline job
   2. Click "Build Now"
   3. Monitor progress in build queue
   4. Review console output for any issues
   ```

2. **Parameterized Builds**
   - Use "Build with Parameters" for custom deployments
   - Available parameters:
     - `BRANCH`: Git branch to deploy (default: main)
     - `ENVIRONMENT`: Target environment (staging/production)
     - `SKIP_TESTS`: Skip test execution (use cautiously)

### Environment Variable Management

1. **Viewing Current Configuration**
   ```bash
   # Access Jenkins credentials store
   Manage Jenkins → Manage Credentials → System → Global credentials
   ```

2. **Required Credentials**
   - `farmtally-database-url`: PostgreSQL connection string
   - `farmtally-jwt-secret`: JWT signing secret
   - `farmtally-smtp-host`: Email server hostname
   - `farmtally-smtp-user`: Email authentication username
   - `farmtally-smtp-password`: Email authentication password
   - `farmtally-cors-origin`: Allowed CORS origins
   - `farmtally-api-url`: Production API base URL
   - `farmtally-supabase-url`: Supabase project URL (if used)
   - `farmtally-supabase-key`: Supabase anonymous key (if used)

3. **Updating Credentials**
   ```
   1. Navigate to credential in Jenkins
   2. Click "Update" 
   3. Enter new secret value
   4. Save changes
   5. Trigger new build to apply changes
   ```

## Build Artifact Management

### Artifact Naming Convention

Artifacts follow this naming pattern:
```
farmtally-{BUILD_NUMBER}-{COMMIT_SHA}
├── backend.tar.gz      # Backend dist/ directory
├── frontend.tar.gz     # Frontend .next/ and public/ directories
└── manifest.json       # Build metadata and component details
```

### Artifact Storage Locations

- **Jenkins Archive**: Available in build artifacts section
- **VPS Storage**: `/opt/farmtally/artifacts/` directory
- **Retention Policy**: Last 10 successful builds retained

### Viewing Artifact Details

1. **In Jenkins**
   ```
   1. Navigate to successful build
   2. Click "Build Artifacts"
   3. Download or inspect artifact contents
   ```

2. **On VPS**
   ```bash
   # List available artifacts
   ls -la /opt/farmtally/artifacts/
   
   # View artifact manifest
   cat /opt/farmtally/artifacts/farmtally-123-abc1234/manifest.json
   ```

## Health Check Monitoring

### Automated Health Checks

The pipeline performs these health verifications post-deployment:

1. **Basic Health Check**
   - Endpoint: `GET /api/health`
   - Expected: HTTP 200 with system status

2. **Authentication Verification**
   - Endpoint: `GET /api/auth/verify`
   - Expected: HTTP 200 with valid service token

3. **Database Connectivity**
   - Endpoint: `GET /api/farmers`
   - Expected: HTTP 200 with database query results

### Manual Health Verification

```bash
# Basic health check
curl -f https://your-domain.com/api/health

# Authentication check (requires service token)
curl -f -H "Authorization: Bearer YOUR_SERVICE_TOKEN" \
  https://your-domain.com/api/auth/verify

# Database connectivity check
curl -f -H "Authorization: Bearer YOUR_SERVICE_TOKEN" \
  https://your-domain.com/api/farmers
```

## Database Migration Management

### Migration Process

1. **Automatic Execution**
   - Migrations run automatically during deployment
   - Executed after backend build, before application restart
   - Uses production `DATABASE_URL` from Jenkins credentials

2. **Migration Verification**
   ```bash
   # Check migration status on VPS
   cd /opt/farmtally/current
   npx prisma migrate status
   
   # View migration history
   npx prisma migrate status --schema=./prisma/schema.prisma
   ```

3. **Manual Migration (Emergency)**
   ```bash
   # SSH to VPS
   ssh farmtally@your-vps-ip
   
   # Navigate to application directory
   cd /opt/farmtally/current
   
   # Run migrations manually
   npx prisma migrate deploy
   ```

## Performance Monitoring

### Key Metrics to Monitor

1. **Build Performance**
   - Total build time (target: < 10 minutes)
   - Stage execution times
   - Resource usage during builds

2. **Deployment Performance**
   - Deployment duration (target: < 5 minutes)
   - Health check response times
   - Application startup time

3. **System Health**
   - API response times
   - Database query performance
   - Memory and CPU usage

### Performance Optimization

1. **Build Optimization**
   ```bash
   # Enable npm cache in Jenkins
   npm ci --cache /tmp/npm-cache
   
   # Use parallel builds where possible
   npm run build:parallel
   ```

2. **Deployment Optimization**
   - Use incremental deployments for minor changes
   - Optimize artifact compression
   - Implement blue-green deployment for zero downtime

## Security Best Practices

### Credential Security

1. **Never hardcode secrets** in Jenkinsfile or source code
2. **Use Jenkins credentials store** for all sensitive values
3. **Enable credential masking** in pipeline logs
4. **Rotate credentials regularly** (quarterly recommended)
5. **Audit credential access** through Jenkins security logs

### Access Control

1. **Pipeline Permissions**
   - Build: Development team members
   - Deploy: Senior developers and DevOps team
   - Credential management: DevOps team only

2. **VPS Access**
   - SSH key-based authentication only
   - No password authentication
   - Regular key rotation

### Audit and Compliance

1. **Build Logs Retention**
   - Retain build logs for 90 days minimum
   - Archive critical deployment logs
   - Monitor for security-related events

2. **Change Tracking**
   - All deployments linked to Git commits
   - Deployment approval workflow for production
   - Rollback audit trail maintenance

## Integration Points

### External Services

1. **Database (PostgreSQL)**
   - Connection health monitoring
   - Migration status tracking
   - Performance metrics collection

2. **Email Service (SMTP)**
   - Connectivity verification
   - Delivery rate monitoring
   - Error rate tracking

3. **File Storage (if applicable)**
   - Upload/download functionality testing
   - Storage quota monitoring
   - Backup verification

### Monitoring Integration

1. **Jenkins Notifications**
   - Email alerts for build failures
   - Slack integration for team notifications
   - Dashboard widgets for build status

2. **Application Monitoring**
   - Health check endpoint monitoring
   - Performance metrics collection
   - Error rate tracking and alerting

This operational guide should be reviewed and updated quarterly or whenever significant pipeline changes are made.