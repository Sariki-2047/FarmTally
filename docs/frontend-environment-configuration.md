# Frontend Environment Configuration Guide

This document provides comprehensive guidance for configuring the FarmTally frontend across different environments (development, staging, production).

## Overview

The FarmTally frontend uses Next.js environment variables to configure API endpoints, Supabase integration, and application settings. This configuration is critical for ensuring the frontend connects to the correct backend services in each environment.

## Environment Variables

### Required Variables

#### API Configuration
- **NEXT_PUBLIC_API_URL**: The base URL for the FarmTally backend API
  - Development: `http://localhost:3000`
  - Production: `http://147.93.153.247:3001`
  - Format: `http://[host]:[port]` or `https://[domain]`

- **NEXT_PUBLIC_SOCKET_URL**: WebSocket connection URL for real-time features
  - Usually same as API URL
  - Format: `http://[host]:[port]` or `https://[domain]`

#### Supabase Configuration
- **NEXT_PUBLIC_SUPABASE_URL**: Supabase project URL
  - Format: `https://[project-id].supabase.co`
  - Example: `https://qvxcbdglyvzohzdefnet.supabase.co`

- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Supabase anonymous/public key
  - Format: JWT token starting with `eyJ`
  - Used for client-side Supabase operations

#### Application Configuration
- **NEXT_PUBLIC_APP_NAME**: Application display name
  - Default: `FarmTally`

- **NEXT_PUBLIC_APP_VERSION**: Application version
  - Format: Semantic versioning (e.g., `1.0.0`)

### Optional Variables
- **NODE_ENV**: Environment mode (`development`, `production`)
- **NEXT_PUBLIC_DEBUG**: Enable debug mode (`true`, `false`)

## Environment Files

### Development (.env.local)
```bash
# FarmTally Frontend Development Environment

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://qvxcbdglyvzohzdefnet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API Configuration - Local Development
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# App Configuration
NEXT_PUBLIC_APP_NAME=FarmTally
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development
NODE_ENV=development
```

### Production (.env.production)
```bash
# FarmTally Frontend Production Environment

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://qvxcbdglyvzohzdefnet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API Configuration - Production Backend
NEXT_PUBLIC_API_URL=http://147.93.153.247:3001
NEXT_PUBLIC_SOCKET_URL=http://147.93.153.247:3001

# App Configuration
NEXT_PUBLIC_APP_NAME=FarmTally
NEXT_PUBLIC_APP_VERSION=1.0.0

# Production
NODE_ENV=production
```

## Jenkins Pipeline Configuration

### Credential Management

The Jenkins pipeline manages environment variables through the Jenkins credentials store:

#### Required Jenkins Credentials
1. **farmtally-api-url**: Production API URL
2. **farmtally-supabase-url**: Supabase project URL
3. **farmtally-supabase-anon-key**: Supabase anonymous key

#### Pipeline Integration
```groovy
withCredentials([
    string(credentialsId: 'farmtally-api-url', variable: 'NEXT_PUBLIC_API_URL'),
    string(credentialsId: 'farmtally-supabase-url', variable: 'NEXT_PUBLIC_SUPABASE_URL'),
    string(credentialsId: 'farmtally-supabase-anon-key', variable: 'NEXT_PUBLIC_SUPABASE_ANON_KEY')
]) {
    // Build process with injected credentials
}
```

### Build Process

1. **Environment Validation**: Verify all required variables are set
2. **Environment File Creation**: Generate `.env.production` with validated values
3. **Build Execution**: Run `npm run build` with production configuration
4. **API Targeting Verification**: Confirm build targets correct endpoints
5. **Cleanup**: Remove temporary environment files

## Validation and Testing

### Automated Validation

The pipeline includes automated validation scripts:

#### Environment Variable Validation
- **Script**: `scripts/validate-frontend-environment.js`
- **Purpose**: Validates all required environment variables are set and properly formatted
- **Output**: Validation report with errors and warnings

#### API Targeting Verification
- **Script**: `scripts/verify-frontend-api-targeting.js`
- **Purpose**: Verifies the build output targets the correct API endpoints
- **Output**: Targeting report with configuration analysis

### Manual Testing

#### Development Environment
```bash
# Start development server
cd farmtally-frontend
npm run dev

# Verify API calls in browser network tab
# Should show requests to localhost:3000
```

#### Production Build Testing
```bash
# Build for production
cd farmtally-frontend
npm run build
npm start

# Verify API calls in browser network tab
# Should show requests to production server
```

## Troubleshooting

### Common Issues

#### 1. API Calls Going to Wrong Endpoint
**Symptoms**: Frontend makes API calls to localhost in production
**Causes**: 
- Environment variables not properly injected during build
- `.env.local` overriding production values
- Build cache containing old values

**Solutions**:
- Verify Jenkins credentials are set correctly
- Clear Next.js build cache: `rm -rf .next`
- Check environment variable injection in pipeline logs

#### 2. Supabase Connection Errors
**Symptoms**: Authentication or database operations fail
**Causes**:
- Incorrect Supabase URL or key
- Network connectivity issues
- CORS configuration problems

**Solutions**:
- Verify Supabase credentials in Jenkins
- Check Supabase project settings
- Validate CORS configuration in Supabase dashboard

#### 3. Environment Variables Not Available
**Symptoms**: `process.env.NEXT_PUBLIC_*` returns undefined
**Causes**:
- Variables not prefixed with `NEXT_PUBLIC_`
- Environment file not loaded during build
- Typos in variable names

**Solutions**:
- Ensure all client-side variables use `NEXT_PUBLIC_` prefix
- Verify environment file creation in pipeline
- Check variable names match exactly

### Debugging Steps

1. **Check Pipeline Logs**: Review Jenkins build logs for environment validation
2. **Verify Credentials**: Ensure all required credentials are set in Jenkins
3. **Inspect Build Output**: Check build artifacts for embedded environment values
4. **Test API Connectivity**: Manually test API endpoints from production environment
5. **Browser Network Tab**: Verify API calls are going to correct endpoints

## Security Considerations

### Public Variables
- All `NEXT_PUBLIC_*` variables are embedded in the client-side bundle
- Never include sensitive information in public variables
- Supabase anonymous key is safe to expose (designed for client-side use)

### Credential Rotation
- Regularly rotate Supabase keys
- Update Jenkins credentials when rotating keys
- Test deployment after credential updates

### Environment Isolation
- Use different Supabase projects for different environments
- Ensure production credentials are never used in development
- Implement proper access controls in Jenkins

## Best Practices

### Development
1. Use `.env.local` for local development configuration
2. Never commit environment files to version control
3. Document all required environment variables
4. Test with production-like configuration before deployment

### Production
1. Always use Jenkins credentials for production values
2. Validate environment configuration in pipeline
3. Monitor API endpoint targeting in build output
4. Implement automated testing for environment configuration

### Maintenance
1. Regularly review and update environment variables
2. Keep documentation synchronized with actual configuration
3. Monitor for deprecated or unused variables
4. Implement alerts for configuration validation failures

## Related Documentation

- [Jenkins Pipeline Setup](../JENKINS_FARMTALLY_SETUP.md)
- [API Documentation](../API_DOCUMENTATION.md)
- [Deployment Guide](../PRODUCTION_DEPLOYMENT_GUIDE.md)
- [Troubleshooting Guide](../DEVELOPER_HANDOVER_DOCUMENT.md)