# FarmTally Health Check System

This document describes the comprehensive health check system implemented for the FarmTally application, including usage instructions, configuration options, and integration with the Jenkins CI/CD pipeline.

## Overview

The health check system provides comprehensive verification of the FarmTally backend API, including:

- **Basic Health Checks**: Verify core API endpoints are responding
- **Authentication Testing**: Test JWT-based authentication with service tokens
- **Database Connectivity**: Verify database access through API endpoints
- **Response Time Monitoring**: Track API response times and performance
- **Automated Rollback**: Trigger rollback on health check failures during deployment

## Components

### 1. Core Health Check Script (`scripts/health-check.js`)

The main Node.js script that performs comprehensive health verification.

**Features:**
- Multiple endpoint testing (health, auth, database)
- Configurable timeouts and retry logic
- Service token generation for authentication testing
- JSON and verbose output formats
- Detailed error reporting and logging

**Usage:**
```bash
# Basic usage
node scripts/health-check.js

# With custom API URL
node scripts/health-check.js --url https://api.farmtally.com

# With service token
node scripts/health-check.js --token eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

# Verbose output
node scripts/health-check.js --verbose

# JSON output for automation
node scripts/health-check.js --json > health-report.json
```

### 2. Shell Script Wrapper (`scripts/health-check.sh`)

Unix/Linux wrapper script for easier integration with Jenkins and shell environments.

**Usage:**
```bash
# Make executable (Linux/Mac)
chmod +x scripts/health-check.sh

# Run with default settings
./scripts/health-check.sh

# Run with custom configuration
./scripts/health-check.sh --url https://api.farmtally.com --verbose
```

### 3. Windows Batch Script (`scripts/health-check.bat`)

Windows-compatible wrapper for local development and testing.

**Usage:**
```cmd
REM Run with default settings
scripts\health-check.bat

REM Run with custom configuration
scripts\health-check.bat --url https://api.farmtally.com --verbose
```

### 4. Jenkins Pipeline Integration

The health check system is integrated into the main Jenkins pipeline (`Jenkinsfile`) as the "Health Verification" stage.

**Pipeline Features:**
- Automatic execution after deployment
- Comprehensive result logging and archiving
- Automatic rollback on health check failure
- Email notifications with health check results
- Artifact archiving for troubleshooting

### 5. Standalone Jenkins Job (`scripts/jenkins-health-check-job.groovy`)

A separate Jenkins pipeline for manual health check execution without deployment.

**Features:**
- Parameterized execution (URL, timeout, retries)
- Scheduled or manual execution
- Comprehensive reporting
- Email notifications
- Result archiving

## Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_URL` | Base URL of the FarmTally API | `http://localhost:3000` |
| `SERVICE_TOKEN` | JWT token for authenticated requests | None |
| `JWT_SECRET` | JWT secret for generating service tokens | None |
| `TIMEOUT` | Request timeout in milliseconds | `10000` |
| `RETRIES` | Number of retries for failed requests | `3` |
| `VERBOSE` | Enable verbose logging | `false` |
| `JSON_OUTPUT` | Output results in JSON format | `false` |

### Command Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `--url <url>` | API base URL | `--url https://api.farmtally.com` |
| `--token <token>` | Service token | `--token eyJ0eXAi...` |
| `--timeout <ms>` | Request timeout | `--timeout 30000` |
| `--retries <count>` | Retry attempts | `--retries 5` |
| `--verbose` | Verbose logging | `--verbose` |
| `--json` | JSON output | `--json` |
| `--help` | Show help | `--help` |

## Health Check Types

### 1. Basic Health Check
- **Endpoint**: `/api/health`
- **Method**: GET
- **Purpose**: Verify API is responding
- **Expected**: HTTP 200 with status information

### 2. Root Endpoint Check
- **Endpoint**: `/`
- **Method**: GET
- **Purpose**: Verify root endpoint accessibility
- **Expected**: HTTP 200 with API information

### 3. Authentication Check
- **Endpoint**: `/api/auth/profile`
- **Method**: GET
- **Purpose**: Verify JWT authentication system
- **Requirements**: Valid service token
- **Expected**: HTTP 200 with user profile data

### 4. Database Connectivity Check
- **Endpoint**: `/api/farmer/statistics`
- **Method**: GET
- **Purpose**: Verify database connectivity through API
- **Requirements**: Valid service token
- **Expected**: HTTP 200/400/404 (indicating database is accessible)

## Jenkins Integration

### Main Pipeline Integration

The health check system is integrated into the main deployment pipeline:

```groovy
stage('Health Verification') {
    steps {
        // Comprehensive health checks with automatic rollback
        // Results archived and included in notifications
    }
}
```

**Key Features:**
- Executes after successful deployment
- Uses production API URL and credentials
- Archives results as JSON artifacts
- Triggers automatic rollback on failure
- Includes results in email notifications

### Standalone Health Check Job

Create a separate Jenkins job using `scripts/jenkins-health-check-job.groovy`:

1. **Create New Pipeline Job**
   - New Item → Pipeline
   - Name: "FarmTally-Health-Check"

2. **Configure Pipeline**
   - Definition: Pipeline script
   - Copy content from `scripts/jenkins-health-check-job.groovy`

3. **Configure Parameters**
   - API_URL: Target API URL
   - HEALTH_CHECK_MODE: comprehensive/basic/authenticated-only
   - TIMEOUT: Request timeout
   - RETRIES: Retry attempts
   - VERBOSE_OUTPUT: Enable verbose logging
   - SEND_NOTIFICATIONS: Email notifications

## NPM Scripts

The health check system is integrated into the project's `package.json`:

```json
{
  "scripts": {
    "health-check": "node scripts/health-check.js",
    "health-check:verbose": "node scripts/health-check.js --verbose",
    "health-check:json": "node scripts/health-check.js --json"
  }
}
```

**Usage:**
```bash
# Run basic health check
npm run health-check

# Run with verbose output
npm run health-check:verbose

# Generate JSON report
npm run health-check:json > health-report.json
```

## Output Formats

### Console Output (Default)
```
🏥 Starting FarmTally health checks...
📍 API URL: http://localhost:3000
✅ Basic health check passed (245ms)
✅ Root endpoint check passed (123ms)
⚠️ Authentication check skipped: No service token provided
⚠️ Database connectivity check skipped: No service token provided
✅ All health checks passed successfully!

📊 Health Check Summary:
   Total Checks: 4
   Passed: 2
   Failed: 0
   Duration: 1234ms
   Success Rate: 100.0%
```

### JSON Output
```json
{
  "timestamp": "2025-10-21T12:00:00.000Z",
  "baseUrl": "http://localhost:3000",
  "checks": [
    {
      "name": "Basic Health Check",
      "endpoint": "/api/health",
      "method": "GET",
      "status": "PASSED",
      "statusCode": 200,
      "duration": 245,
      "attempts": 1,
      "responseData": {
        "status": "ok",
        "timestamp": "2025-10-21T12:00:00.000Z"
      }
    }
  ],
  "summary": {
    "total": 4,
    "passed": 2,
    "failed": 0,
    "duration": 1234
  }
}
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if the API server is running
   - Verify the API URL is correct
   - Check firewall and network connectivity

2. **Authentication Failures**
   - Verify JWT_SECRET is correctly set
   - Check service token validity
   - Ensure authentication endpoints are working

3. **Database Connectivity Issues**
   - Check database server status
   - Verify DATABASE_URL configuration
   - Test database connection independently

4. **Timeout Errors**
   - Increase timeout value with `--timeout`
   - Check server performance and load
   - Verify network latency

### Debug Mode

Enable verbose logging for detailed troubleshooting:

```bash
# Enable verbose output
node scripts/health-check.js --verbose

# Or set environment variable
export VERBOSE=true
node scripts/health-check.js
```

### Log Analysis

Health check results are archived in Jenkins and can be analyzed:

1. **Jenkins Artifacts**
   - `health-check-results.json`: Detailed results
   - `health-report-*.md`: Human-readable report
   - `system-debug.log`: System status on failure

2. **Local Files**
   - Results saved to timestamped JSON files
   - Can be imported into monitoring systems
   - Used for trend analysis and alerting

## Monitoring and Alerting

### Jenkins Notifications

The system automatically sends email notifications:

- **Success**: Summary of passed health checks
- **Failure**: Details of failed checks and required actions
- **Error**: System errors and troubleshooting information

### Integration with Monitoring Systems

The JSON output format allows integration with external monitoring:

```bash
# Send results to monitoring system
node scripts/health-check.js --json | curl -X POST \
  -H "Content-Type: application/json" \
  -d @- \
  https://monitoring.example.com/api/health-checks
```

### Scheduled Health Checks

Set up regular health monitoring using Jenkins cron:

```groovy
// Run health checks every 15 minutes
triggers {
    cron('H/15 * * * *')
}
```

## Best Practices

1. **Regular Monitoring**
   - Schedule health checks every 15-30 minutes
   - Monitor trends and performance over time
   - Set up alerting for consecutive failures

2. **Service Token Management**
   - Use dedicated service accounts for health checks
   - Rotate tokens regularly
   - Store tokens securely in Jenkins credentials

3. **Timeout Configuration**
   - Set appropriate timeouts for your environment
   - Consider network latency and server load
   - Use longer timeouts for production systems

4. **Error Handling**
   - Review failed health check logs regularly
   - Implement automated remediation where possible
   - Document common issues and solutions

5. **Performance Monitoring**
   - Track response times over time
   - Set performance baselines and alerts
   - Optimize slow endpoints identified by health checks

## Security Considerations

1. **Service Tokens**
   - Use minimal required permissions
   - Implement token expiration
   - Monitor token usage and access

2. **Network Security**
   - Use HTTPS for production health checks
   - Implement IP whitelisting if needed
   - Monitor for unauthorized access attempts

3. **Credential Management**
   - Store all secrets in Jenkins credentials store
   - Use credential masking in logs
   - Implement credential rotation procedures

## Future Enhancements

1. **Advanced Monitoring**
   - Database query performance testing
   - Email service connectivity checks
   - File upload/download testing

2. **Integration Improvements**
   - Slack notifications
   - Grafana dashboard integration
   - PagerDuty alerting

3. **Performance Testing**
   - Load testing capabilities
   - Stress testing scenarios
   - Performance regression detection

---

For additional support or questions about the health check system, refer to the main project documentation or contact the development team.