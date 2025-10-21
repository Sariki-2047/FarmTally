# Pipeline Monitoring and Validation Guide

This guide covers the comprehensive monitoring and validation system for the FarmTally Jenkins pipeline, including performance tracking, staging environment validation, and production readiness assessment.

## Overview

The monitoring and validation system provides:

- **Pipeline Execution Monitoring**: Real-time tracking of build performance, resource usage, and failure rates
- **Staging Environment Validation**: Comprehensive testing of the complete deployment pipeline in staging
- **Production Readiness Assessment**: Automated checklist to ensure production deployment readiness
- **Performance Analysis**: Detailed performance metrics and bottleneck identification
- **Alerting System**: Configurable alerts for pipeline performance issues

## Components

### 1. Pipeline Execution Monitor

**Location**: `scripts/pipeline-monitor.js`

Tracks build times, resource usage, and failure rates for Jenkins pipeline stages.

#### Features:
- Stage-level performance tracking
- Resource usage monitoring (CPU, memory)
- Failure rate analysis
- Performance trend reporting
- Automated alerting for performance issues

#### Usage:

```bash
# Start monitoring a stage
node scripts/pipeline-monitor.js start "Backend Build"

# End monitoring a stage
node scripts/pipeline-monitor.js end "Backend Build" success

# Generate performance report
node scripts/pipeline-monitor.js report

# Check current resource usage
node scripts/pipeline-monitor.js resource-check

# Clean old metrics (keep 30 days)
node scripts/pipeline-monitor.js clean 30
```

#### Jenkins Integration:

```groovy
// In your Jenkinsfile
@Library('jenkins-monitoring-integration') _

pipeline {
    stages {
        stage('Backend Build') {
            steps {
                monitoredStage('Backend Build') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }
    }
    
    post {
        always {
            finalizePipelineMonitoring()
        }
    }
}
```

### 2. Staging Environment Validator

**Location**: `scripts/staging-validation.js`

Comprehensive validation of the complete pipeline in staging environment.

#### Validation Categories:
- **Workspace Path Validation**: Ensures all required files and directories exist
- **Environment Configuration**: Validates all required environment variables
- **Backend Build Validation**: Checks backend compilation and artifacts
- **Frontend Build Validation**: Verifies frontend build output
- **Database Migration**: Tests database connectivity and migration process
- **Deployment Process**: Validates artifact management and deployment steps
- **End-to-End Pipeline**: Tests complete pipeline execution

#### Usage:

```bash
# Run all validations
./scripts/staging-validation.sh all

# Run specific validation
./scripts/staging-validation.sh backend
./scripts/staging-validation.sh frontend
./scripts/staging-validation.sh database

# Windows
scripts\staging-validation.bat all
```

#### Configuration:

Set environment variables for staging validation:

```bash
export STAGING_URL="http://staging.farmtally.com"
export STAGING_DATABASE_URL="postgresql://user:pass@staging-db:5432/farmtally"
```

### 3. Production Readiness Checker

**Location**: `scripts/production-readiness-checklist.js`

Automated assessment of production deployment readiness.

#### Assessment Categories:
- **Infrastructure & Environment** (25% weight)
- **Security & Authentication** (30% weight)
- **Performance & Monitoring** (20% weight)
- **Deployment & Operations** (15% weight)
- **Testing & Quality Assurance** (10% weight)

#### Usage:

```bash
# Run production readiness assessment
node scripts/production-readiness-checklist.js
```

#### Sample Output:

```
🎯 PRODUCTION READINESS REPORT
==============================
Overall Score: 87%
Readiness Level: MOSTLY-READY
Assessment Date: 2024-01-15T10:30:00.000Z

📊 Category Breakdown:
  Infrastructure & Environment: 95% [████████████████████]
  Security & Authentication: 80% [████████████████░░░░]
  Performance & Monitoring: 90% [██████████████████░░]
  Deployment & Operations: 85% [█████████████████░░░]
  Testing & Quality Assurance: 70% [██████████████░░░░░░]

🚨 Critical Issues (Must Fix Before Production):
  ❌ JWT secret configured
     💡 JWT_SECRET must be set to a secure random string

⚠️  High Priority Issues (Recommended to Fix):
  ⚠️  SMTP credentials configured
```

### 4. Performance Testing

**Location**: `scripts/performance-test.js`

Comprehensive performance testing of pipeline components.

#### Test Categories:
- Backend build performance
- Frontend build performance
- Database operations
- Pipeline scripts execution

#### Usage:

```bash
# Run all performance tests
node scripts/performance-test.js all

# Run specific tests
node scripts/performance-test.js backend
node scripts/performance-test.js frontend
node scripts/performance-test.js database
node scripts/performance-test.js scripts
```

### 5. Alerting System

**Location**: `scripts/configure-pipeline-alerts.js`

Configurable alerting system for pipeline performance issues.

#### Alert Types:
- **SLOW_BUILD**: Build taking longer than expected
- **HIGH_MEMORY**: High memory usage detected
- **HIGH_CPU**: High CPU usage detected
- **HIGH_FAILURE_RATE**: High failure rate detected
- **CONSECUTIVE_FAILURES**: Multiple consecutive failures
- **STAGE_TIMEOUT**: Stage execution timeout

#### Configuration:

```bash
# Initialize alert configuration
node scripts/configure-pipeline-alerts.js init

# Test alert notifications
node scripts/configure-pipeline-alerts.js test

# Check metrics and send alerts
node scripts/configure-pipeline-alerts.js check

# Send manual alert
node scripts/configure-pipeline-alerts.js send SLOW_BUILD "Build taking too long" warning
```

#### Alert Configuration File:

Edit `pipeline-alerts-config.json`:

```json
{
  "enabled": true,
  "thresholds": {
    "buildTimeMinutes": 15,
    "stageTimeMinutes": 10,
    "failureRatePercent": 20,
    "memoryUsagePercent": 80,
    "cpuUsagePercent": 85,
    "consecutiveFailures": 3
  },
  "notifications": {
    "email": {
      "enabled": true,
      "recipients": ["devops@farmtally.com"],
      "smtpConfig": { ... }
    },
    "slack": {
      "enabled": true,
      "webhookUrl": "https://hooks.slack.com/...",
      "channel": "#deployments"
    }
  }
}
```

## Jenkins Integration

### 1. Main Pipeline Integration

Add monitoring to your main Jenkinsfile:

```groovy
@Library('jenkins-monitoring-integration') _

pipeline {
    agent any
    
    stages {
        stage('Setup') {
            steps {
                setupPipelineMonitoring()
            }
        }
        
        stage('Backend Build') {
            steps {
                monitoredStage('Backend Build') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }
        
        stage('Frontend Build') {
            steps {
                monitoredStage('Frontend Build') {
                    dir('farmtally-frontend') {
                        sh 'npm ci'
                        sh 'npm run build'
                    }
                }
            }
        }
        
        stage('Database Migration') {
            steps {
                monitoredStage('Database Migration') {
                    sh 'scripts/migration-handler.sh'
                }
            }
        }
        
        stage('Health Verification') {
            steps {
                monitoredStage('Health Verification') {
                    sh 'scripts/health-check.sh'
                }
            }
        }
    }
    
    post {
        always {
            finalizePipelineMonitoring()
        }
    }
}
```

### 2. Staging Validation Job

Create a separate Jenkins job for staging validation using `scripts/jenkins-staging-validation-job.groovy`.

#### Job Parameters:
- **VALIDATION_TYPE**: Type of validation to run (all, workspace, environment, etc.)
- **STAGING_URL**: Staging environment URL
- **GENERATE_PRODUCTION_CHECKLIST**: Generate production readiness checklist
- **FAIL_ON_WARNINGS**: Fail build on validation warnings

### 3. Scheduled Monitoring

Set up scheduled jobs for continuous monitoring:

```groovy
// Daily performance report
pipeline {
    triggers {
        cron('0 9 * * *') // 9 AM daily
    }
    
    stages {
        stage('Generate Performance Report') {
            steps {
                sh 'node scripts/pipeline-monitor.js report'
                sh 'node scripts/performance-test.js all'
            }
        }
    }
}
```

## Metrics and Reports

### 1. Pipeline Metrics

Stored in `pipeline-metrics.json`:

```json
{
  "builds": {
    "123": {
      "buildNumber": "123",
      "commitSha": "abc123",
      "startTime": "2024-01-15T10:00:00.000Z",
      "stages": {
        "Backend Build": {
          "name": "Backend Build",
          "startTime": "2024-01-15T10:00:00.000Z",
          "endTime": "2024-01-15T10:02:30.000Z",
          "durationMs": 150000,
          "durationMinutes": 2.5,
          "status": "success",
          "resourceUsage": {
            "memoryUsagePercent": 45,
            "memoryUsedMB": 512,
            "cpuCount": 4
          }
        }
      }
    }
  }
}
```

### 2. Validation Reports

Generated reports include:
- `staging-validation-report.json`: Detailed staging validation results
- `production-readiness-report.json`: Production readiness assessment
- `performance-test-report.json`: Performance test results

### 3. Dashboard Integration

Metrics can be integrated with monitoring dashboards:

- **Grafana**: Import metrics for visualization
- **Jenkins Blue Ocean**: Enhanced pipeline visualization
- **Custom Dashboard**: Use metrics API for custom dashboards

## Best Practices

### 1. Monitoring Configuration

- Set appropriate thresholds for your environment
- Configure notifications for critical alerts only
- Regular review and adjustment of alert thresholds
- Archive old metrics to manage storage

### 2. Staging Validation

- Run staging validation before production deployments
- Include staging validation in your CI/CD pipeline
- Test rollback procedures regularly
- Validate environment-specific configurations

### 3. Performance Optimization

- Monitor build times and identify bottlenecks
- Use parallel builds where possible
- Implement caching strategies for dependencies
- Regular performance testing and optimization

### 4. Production Readiness

- Run production readiness checks before each release
- Address critical issues before deployment
- Maintain high readiness scores (>90%)
- Regular security and configuration audits

## Troubleshooting

### Common Issues

1. **High Memory Usage**
   - Check for memory leaks in build processes
   - Increase available memory for Jenkins agents
   - Optimize build scripts and dependencies

2. **Slow Build Times**
   - Identify bottleneck stages
   - Implement parallel execution
   - Use build caching
   - Optimize dependency installation

3. **High Failure Rates**
   - Review error logs and patterns
   - Improve error handling in scripts
   - Address environment-specific issues
   - Enhance test coverage

4. **Alert Fatigue**
   - Adjust alert thresholds
   - Implement alert escalation
   - Focus on actionable alerts
   - Regular alert configuration review

### Debug Commands

```bash
# Check pipeline monitor status
node scripts/pipeline-monitor.js resource-check

# Validate staging environment
./scripts/staging-validation.sh all

# Test alert configuration
node scripts/configure-pipeline-alerts.js test

# Generate performance report
node scripts/performance-test.js all
```

## Integration Examples

### Slack Integration

```javascript
// In configure-pipeline-alerts.js
async sendSlackAlert(alert, slackConfig) {
    const axios = require('axios');
    
    const payload = {
        channel: slackConfig.channel,
        username: slackConfig.username,
        text: `🚨 Pipeline Alert: ${alert.type}`,
        attachments: [{
            color: this.getSeverityColor(alert.severity),
            fields: [
                { title: 'Message', value: alert.message, short: false },
                { title: 'Build', value: alert.buildNumber, short: true },
                { title: 'Time', value: alert.timestamp, short: true }
            ]
        }]
    };
    
    return axios.post(slackConfig.webhookUrl, payload);
}
```

### Email Integration

```javascript
// In configure-pipeline-alerts.js
async sendEmailAlert(alert, emailConfig) {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter(emailConfig.smtpConfig);
    
    const mailOptions = {
        from: emailConfig.smtpConfig.auth.user,
        to: emailConfig.recipients.join(','),
        subject: `Pipeline Alert: ${alert.type}`,
        html: this.formatAlertMessage(alert, 'html')
    };
    
    return transporter.sendMail(mailOptions);
}
```

This comprehensive monitoring and validation system ensures reliable, performant, and production-ready deployments for the FarmTally application.