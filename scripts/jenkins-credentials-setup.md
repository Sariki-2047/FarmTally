# Jenkins Credentials Setup Guide

This document provides instructions for setting up all required Jenkins credentials for the FarmTally deployment pipeline.

## Required Credentials

### Backend Environment Variables

#### 1. Database Configuration
- **Credential ID**: `farmtally-database-url`
- **Type**: Secret text
- **Description**: PostgreSQL database connection URL
- **Example Value**: `postgresql://username:password@host:5432/farmtally`
- **Usage**: Backend database connectivity

#### 2. JWT Configuration
- **Credential ID**: `farmtally-jwt-secret`
- **Type**: Secret text
- **Description**: JWT signing secret for authentication
- **Example Value**: `your-super-secret-jwt-key-change-in-production`
- **Usage**: JWT token generation and validation

#### 3. CORS Configuration
- **Credential ID**: `farmtally-cors-origins`
- **Type**: Secret text
- **Description**: Allowed CORS origins for API access
- **Example Value**: `https://app.farmtally.in,https://farmtally.in`
- **Usage**: API CORS policy configuration

### SMTP Email Configuration

#### 4. SMTP Host
- **Credential ID**: `farmtally-smtp-host`
- **Type**: Secret text
- **Description**: SMTP server hostname
- **Example Value**: `smtp.hostinger.com`
- **Usage**: Email service configuration

#### 5. SMTP User
- **Credential ID**: `farmtally-smtp-user`
- **Type**: Secret text
- **Description**: SMTP authentication username
- **Example Value**: `noreply@farmtally.in`
- **Usage**: Email service authentication

#### 6. SMTP Password
- **Credential ID**: `farmtally-smtp-password`
- **Type**: Secret text
- **Description**: SMTP authentication password
- **Example Value**: `your-smtp-password`
- **Usage**: Email service authentication

### Frontend Environment Variables

#### 7. API URL
- **Credential ID**: `farmtally-api-url`
- **Type**: Secret text
- **Description**: Production backend API URL
- **Example Value**: `http://147.93.153.247:3001`
- **Usage**: Frontend API endpoint configuration

#### 8. Supabase URL
- **Credential ID**: `farmtally-supabase-url`
- **Type**: Secret text
- **Description**: Supabase project URL
- **Example Value**: `https://qvxcbdglyvzohzdefnet.supabase.co`
- **Usage**: Frontend Supabase integration

#### 9. Supabase Anonymous Key
- **Credential ID**: `farmtally-supabase-anon-key`
- **Type**: Secret text
- **Description**: Supabase anonymous access key
- **Example Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Usage**: Frontend Supabase authentication

### Additional Configuration

#### 10. Frontend URL
- **Credential ID**: `farmtally-frontend-url`
- **Type**: Secret text
- **Description**: Production frontend URL for email links
- **Example Value**: `https://app.farmtally.in`
- **Usage**: Email template URL generation

#### 11. Redis URL (Optional)
- **Credential ID**: `farmtally-redis-url`
- **Type**: Secret text
- **Description**: Redis connection URL for caching
- **Example Value**: `redis://localhost:6379`
- **Usage**: Backend caching and session storage

## Setup Instructions

### Using Jenkins Web Interface

1. Navigate to Jenkins Dashboard → Manage Jenkins → Manage Credentials
2. Select the appropriate domain (usually "Global")
3. Click "Add Credentials"
4. For each credential above:
   - Select "Secret text" as the kind
   - Enter the Credential ID exactly as specified
   - Enter the secret value
   - Add the description
   - Click "OK"

### Using Jenkins CLI (Alternative)

```bash
# Example for setting up database URL credential
echo "postgresql://username:password@host:5432/farmtally" | jenkins-cli create-credentials-by-xml system::system::jenkins _ <<EOF
<com.cloudbees.plugins.credentials.impl.StringCredentialsImpl>
  <scope>GLOBAL</scope>
  <id>farmtally-database-url</id>
  <description>PostgreSQL database connection URL</description>
  <secret>postgresql://username:password@host:5432/farmtally</secret>
</com.cloudbees.plugins.credentials.impl.StringCredentialsImpl>
EOF
```

### Using Configuration as Code (JCasC)

```yaml
credentials:
  system:
    domainCredentials:
      - credentials:
          - string:
              scope: GLOBAL
              id: farmtally-database-url
              description: PostgreSQL database connection URL
              secret: "${DATABASE_URL}"
          - string:
              scope: GLOBAL
              id: farmtally-jwt-secret
              description: JWT signing secret
              secret: "${JWT_SECRET}"
          # Add other credentials following the same pattern
```

## Validation

After setting up all credentials, verify they are accessible:

1. Go to Jenkins Dashboard → Manage Jenkins → Manage Credentials
2. Confirm all 11 credentials are listed with correct IDs
3. Test credential access in a simple pipeline job:

```groovy
pipeline {
    agent any
    stages {
        stage('Test Credentials') {
            steps {
                withCredentials([
                    string(credentialsId: 'farmtally-database-url', variable: 'DB_URL'),
                    string(credentialsId: 'farmtally-jwt-secret', variable: 'JWT_SECRET')
                ]) {
                    sh 'echo "Database URL length: ${#DB_URL}"'
                    sh 'echo "JWT Secret length: ${#JWT_SECRET}"'
                }
            }
        }
    }
}
```

## Security Notes

- Never log actual credential values
- Use credential masking in pipeline logs
- Rotate credentials regularly
- Limit credential access to necessary jobs only
- Use least privilege principle for credential scopes