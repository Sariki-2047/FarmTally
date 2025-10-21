# Environment Configuration Management Guide

## Overview

This guide provides comprehensive instructions for managing environment configurations across different deployment stages (development, staging, production) in the FarmTally Jenkins CI/CD pipeline. It covers secure credential management, environment-specific settings, and configuration validation procedures.

## Configuration Architecture

### Environment Hierarchy

```
Development Environment
├── Local developer machines
├── Feature branch deployments
└── Integration testing

Staging Environment
├── Pre-production testing
├── User acceptance testing
└── Performance validation

Production Environment
├── Live application deployment
├── Production database
└── External service integrations
```

### Configuration Sources

1. **Jenkins Credentials Store** - Secure storage for sensitive values
2. **Environment Files** - Non-sensitive configuration templates
3. **Pipeline Parameters** - Runtime configuration overrides
4. **External Services** - Third-party service configurations

## Jenkins Credentials Management

### Credential Types and Usage

#### 1. Database Configuration

**Credential ID**: `farmtally-database-url`
**Type**: Secret text
**Usage**: PostgreSQL connection string
**Format**: `postgresql://username:password@host:port/database`

```groovy
// Jenkinsfile usage
environment {
    DATABASE_URL = credentials('farmtally-database-url')
}
```

**Environment-Specific Values**:
- **Development**: `postgresql://dev_user:dev_pass@localhost:5432/farmtally_dev`
- **Staging**: `postgresql://stage_user:stage_pass@staging-db:5432/farmtally_staging`
- **Production**: `postgresql://prod_user:prod_pass@prod-db:5432/farmtally_production`

#### 2. Authentication Configuration

**Credential ID**: `farmtally-jwt-secret`
**Type**: Secret text
**Usage**: JWT token signing and verification
**Format**: Base64 encoded random string (minimum 256 bits)

```bash
# Generate JWT secret
openssl rand -base64 32
```

**Security Requirements**:
- Unique per environment
- Minimum 32 characters
- Rotated quarterly
- Never logged or exposed

#### 3. Email Service Configuration

**SMTP Host**
- **Credential ID**: `farmtally-smtp-host`
- **Type**: Secret text
- **Values**: `smtp.gmail.com`, `smtp.hostinger.com`, etc.

**SMTP Credentials**
- **Username ID**: `farmtally-smtp-user`
- **Password ID**: `farmtally-smtp-password`
- **Type**: Secret text

```groovy
// Jenkinsfile email configuration
environment {
    SMTP_HOST = credentials('farmtally-smtp-host')
    SMTP_USER = credentials('farmtally-smtp-user')
    SMTP_PASSWORD = credentials('farmtally-smtp-password')
}
```

#### 4. CORS Configuration

**Credential ID**: `farmtally-cors-origin`
**Type**: Secret text
**Usage**: Allowed origins for cross-origin requests

**Environment Values**:
- **Development**: `http://localhost:3000,http://localhost:3001`
- **Staging**: `https://staging.farmtally.com`
- **Production**: `https://farmtally.com,https://www.farmtally.com`

#### 5. Frontend Configuration

**API URL Configuration**
- **Credential ID**: `farmtally-api-url`
- **Type**: Secret text
- **Usage**: Frontend API endpoint configuration

**Supabase Configuration** (if used)
- **URL ID**: `farmtally-supabase-url`
- **Key ID**: `farmtally-supabase-anon-key`

```groovy
// Frontend environment injection
environment {
    NEXT_PUBLIC_API_URL = credentials('farmtally-api-url')
    NEXT_PUBLIC_SUPABASE_URL = credentials('farmtally-supabase-url')
    NEXT_PUBLIC_SUPABASE_ANON_KEY = credentials('farmtally-supabase-anon-key')
}
```

### Credential Management Procedures

#### Adding New Credentials

1. **Access Jenkins Credentials**
   ```
   1. Navigate to Jenkins Dashboard
   2. Click "Manage Jenkins"
   3. Select "Manage Credentials"
   4. Choose "System" → "Global credentials (unrestricted)"
   ```

2. **Create New Credential**
   ```
   1. Click "Add Credentials"
   2. Select "Secret text" for most configurations
   3. Enter credential ID (use consistent naming: farmtally-{service}-{property})
   4. Enter secret value
   5. Add description with usage information
   6. Click "OK"
   ```

3. **Update Jenkinsfile**
   ```groovy
   environment {
       NEW_CONFIG = credentials('farmtally-new-config')
   }
   ```

#### Updating Existing Credentials

1. **Locate Credential**
   ```
   1. Navigate to Jenkins credentials store
   2. Find credential by ID
   3. Click on credential name
   ```

2. **Update Value**
   ```
   1. Click "Update"
   2. Enter new secret value
   3. Update description if needed
   4. Click "Save"
   ```

3. **Trigger New Build**
   ```
   1. Navigate to pipeline job
   2. Click "Build Now" to apply new configuration
   3. Monitor build logs for successful credential injection
   ```

#### Rotating Credentials

**Quarterly Rotation Schedule**:
- **Q1**: JWT secrets and database passwords
- **Q2**: Email service credentials
- **Q3**: API keys and external service tokens
- **Q4**: SSL certificates and SSH keys

**Rotation Procedure**:
```bash
# 1. Generate new credential value
NEW_JWT_SECRET=$(openssl rand -base64 32)

# 2. Update credential in Jenkins
# (Use Jenkins UI or CLI)

# 3. Deploy to staging first
# Trigger staging deployment with new credential

# 4. Verify staging functionality
curl -f https://staging.farmtally.com/api/health

# 5. Deploy to production
# Trigger production deployment

# 6. Verify production functionality
curl -f https://farmtally.com/api/health

# 7. Document rotation in security log
echo "$(date): JWT secret rotated" >> /var/log/credential-rotations.log
```

## Environment-Specific Configuration

### Development Environment

**Purpose**: Local development and feature testing

**Configuration Characteristics**:
- Relaxed security settings
- Debug logging enabled
- Local database connections
- Mock external services

**Environment Variables**:
```bash
NODE_ENV=development
LOG_LEVEL=debug
DATABASE_URL=postgresql://dev_user:dev_pass@localhost:5432/farmtally_dev
JWT_SECRET=dev_jwt_secret_not_for_production
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
SMTP_HOST=smtp.mailtrap.io  # Testing service
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**Setup Instructions**:
```bash
# 1. Copy environment template
cp .env.example .env.development

# 2. Update with development values
# Edit .env.development with appropriate values

# 3. Start development services
npm run dev
```

### Staging Environment

**Purpose**: Pre-production testing and validation

**Configuration Characteristics**:
- Production-like settings
- Enhanced logging
- Staging database
- Real external services (test accounts)

**Environment Variables**:
```bash
NODE_ENV=staging
LOG_LEVEL=info
DATABASE_URL=postgresql://stage_user:stage_pass@staging-db:5432/farmtally_staging
JWT_SECRET=staging_jwt_secret_different_from_prod
CORS_ORIGIN=https://staging.farmtally.com
SMTP_HOST=smtp.gmail.com
SMTP_USER=staging@farmtally.com
NEXT_PUBLIC_API_URL=https://staging-api.farmtally.com
```

**Jenkins Configuration**:
```groovy
pipeline {
    agent any
    
    when {
        branch 'staging'
    }
    
    environment {
        NODE_ENV = 'staging'
        DATABASE_URL = credentials('farmtally-staging-database-url')
        JWT_SECRET = credentials('farmtally-staging-jwt-secret')
        // ... other staging credentials
    }
}
```

### Production Environment

**Purpose**: Live application serving real users

**Configuration Characteristics**:
- Maximum security settings
- Error-only logging
- Production database
- Live external services

**Environment Variables**:
```bash
NODE_ENV=production
LOG_LEVEL=error
DATABASE_URL=postgresql://prod_user:secure_pass@prod-db:5432/farmtally_production
JWT_SECRET=production_jwt_secret_highly_secure
CORS_ORIGIN=https://farmtally.com,https://www.farmtally.com
SMTP_HOST=smtp.hostinger.com
SMTP_USER=noreply@farmtally.com
NEXT_PUBLIC_API_URL=https://api.farmtally.com
```

**Security Requirements**:
- All credentials stored in Jenkins vault
- No hardcoded secrets in code
- Regular credential rotation
- Audit logging enabled

## Configuration Validation

### Pre-Build Validation

**Validation Script**: `scripts/validate-environment-variables.sh`

```bash
#!/bin/bash
# Environment variable validation script

set -e

echo "Validating environment configuration..."

# Required variables
REQUIRED_VARS=(
    "DATABASE_URL"
    "JWT_SECRET"
    "SMTP_HOST"
    "SMTP_USER"
    "SMTP_PASSWORD"
    "CORS_ORIGIN"
    "NEXT_PUBLIC_API_URL"
)

# Validate each required variable
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "ERROR: Required environment variable $var is not set"
        exit 1
    else
        echo "✓ $var is set"
    fi
done

# Validate DATABASE_URL format
if [[ ! $DATABASE_URL =~ ^postgresql:// ]]; then
    echo "ERROR: DATABASE_URL must start with postgresql://"
    exit 1
fi

# Validate JWT_SECRET length
if [ ${#JWT_SECRET} -lt 32 ]; then
    echo "ERROR: JWT_SECRET must be at least 32 characters"
    exit 1
fi

# Validate CORS_ORIGIN format
if [[ ! $CORS_ORIGIN =~ ^https?:// ]]; then
    echo "ERROR: CORS_ORIGIN must be a valid URL"
    exit 1
fi

echo "All environment variables validated successfully"
```

**Jenkins Integration**:
```groovy
stage('Validate Environment') {
    steps {
        sh 'scripts/validate-environment-variables.sh'
    }
}
```

### Runtime Validation

**Application Startup Checks**:

```typescript
// src/config/validation.ts
import { z } from 'zod';

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  SMTP_HOST: z.string(),
  SMTP_USER: z.string().email(),
  SMTP_PASSWORD: z.string(),
  CORS_ORIGIN: z.string(),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()),
});

export function validateConfig() {
  try {
    const config = configSchema.parse(process.env);
    console.log('✓ Configuration validation passed');
    return config;
  } catch (error) {
    console.error('✗ Configuration validation failed:', error.errors);
    process.exit(1);
  }
}
```

### Database Connection Validation

```bash
#!/bin/bash
# Database connectivity validation

echo "Testing database connection..."

# Test basic connectivity
if npx prisma db pull --preview-feature; then
    echo "✓ Database connection successful"
else
    echo "✗ Database connection failed"
    exit 1
fi

# Test migration status
if npx prisma migrate status; then
    echo "✓ Database migrations are up to date"
else
    echo "✗ Database migrations need attention"
    exit 1
fi
```

## Configuration Templates

### Environment File Template

```bash
# .env.template
# Copy this file and update values for your environment

# Application Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_email_password

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Jenkins Pipeline Template

```groovy
pipeline {
    agent any
    
    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['staging', 'production'],
            description: 'Target deployment environment'
        )
    }
    
    environment {
        NODE_ENV = "${params.ENVIRONMENT}"
        DATABASE_URL = credentials("farmtally-${params.ENVIRONMENT}-database-url")
        JWT_SECRET = credentials("farmtally-${params.ENVIRONMENT}-jwt-secret")
        SMTP_HOST = credentials("farmtally-${params.ENVIRONMENT}-smtp-host")
        SMTP_USER = credentials("farmtally-${params.ENVIRONMENT}-smtp-user")
        SMTP_PASSWORD = credentials("farmtally-${params.ENVIRONMENT}-smtp-password")
        CORS_ORIGIN = credentials("farmtally-${params.ENVIRONMENT}-cors-origin")
        NEXT_PUBLIC_API_URL = credentials("farmtally-${params.ENVIRONMENT}-api-url")
    }
    
    stages {
        stage('Validate Configuration') {
            steps {
                sh 'scripts/validate-environment-variables.sh'
            }
        }
        
        stage('Build and Deploy') {
            steps {
                // Build and deployment steps
            }
        }
    }
}
```

## Security Best Practices

### Credential Security

1. **Never commit secrets** to version control
2. **Use Jenkins credentials store** for all sensitive values
3. **Enable credential masking** in pipeline logs
4. **Implement regular rotation** schedule
5. **Audit credential access** regularly

### Access Control

1. **Limit credential access** to necessary personnel only
2. **Use role-based permissions** in Jenkins
3. **Implement approval workflows** for production changes
4. **Log all credential modifications**

### Monitoring and Alerting

1. **Monitor for credential exposure** in logs
2. **Alert on failed authentication** attempts
3. **Track configuration changes** and deployments
4. **Implement security scanning** for exposed secrets

## Troubleshooting

### Common Configuration Issues

1. **Missing Environment Variables**
   - Check Jenkins credentials store
   - Verify credential IDs match Jenkinsfile
   - Ensure all required variables are defined

2. **Invalid Database Connection**
   - Verify DATABASE_URL format
   - Test connectivity from Jenkins server
   - Check database server status

3. **Authentication Failures**
   - Verify JWT_SECRET is consistent
   - Check token expiration settings
   - Validate authentication endpoints

4. **CORS Issues**
   - Verify CORS_ORIGIN includes all required domains
   - Check protocol (http vs https)
   - Validate domain spelling and ports

This configuration management guide should be reviewed and updated whenever new services or environments are added to the system.