# FarmTally Artifact Management Guide

## Overview

The FarmTally Artifact Management System provides comprehensive versioning, packaging, storage, and deployment capabilities for build artifacts. It ensures reproducible deployments and enables reliable rollback functionality.

## Architecture

### Components

1. **Artifact Manager Scripts**
   - `scripts/artifact-manager.sh` - Unix/Linux version
   - `scripts/artifact-manager.bat` - Windows batch version
   - `scripts/artifact-manager.ps1` - PowerShell version (recommended for Windows)

2. **Jenkins Integration**
   - `scripts/jenkins-artifact-integration.groovy` - Jenkins pipeline functions

3. **Storage Structure**
   ```
   artifacts/
   └── farmtally-v{build-number}-{commit-hash}/
       ├── backend/
       │   ├── backend.tar.gz (or .zip on Windows)
       │   └── backend.sha256
       ├── frontend/
       │   ├── frontend.tar.gz (or .zip on Windows)
       │   └── frontend.sha256
       ├── metadata/
       ├── manifest.json
       └── ARTIFACT_INFO.txt
   ```

## Artifact Versioning

### Version Format
Artifacts are versioned using the format: `v{BUILD_NUMBER}-{COMMIT_SHORT}`

Example: `v1234-abc12345`

### Naming Convention
Complete artifact names follow the pattern: `farmtally-v{BUILD_NUMBER}-{COMMIT_SHORT}`

Example: `farmtally-v1234-abc12345`

### Version Information
Each artifact contains:
- Git commit SHA (full and short)
- Build number (from Jenkins or timestamp)
- Build timestamp (ISO 8601 UTC)
- Branch name
- Repository URL
- Dirty flag (uncommitted changes)

## Artifact Contents

### Backend Package
Contains:
- `dist/` - Compiled TypeScript output
- `package.json` - Node.js dependencies
- `package-lock.json` - Locked dependency versions
- `prisma/` - Database schema and migrations

### Frontend Package
Contains:
- `.next/` - Next.js build output
- `public/` - Static assets
- `package.json` - Frontend dependencies
- `package-lock.json` - Locked dependency versions
- `next.config.ts` - Next.js configuration

### Manifest File
The `manifest.json` contains:
```json
{
  "version": "v1234-abc12345",
  "name": "farmtally-v1234-abc12345",
  "timestamp": "2024-01-15T10:30:00Z",
  "git": {
    "commit": "abc1234567890...",
    "shortCommit": "abc12345",
    "branch": "main",
    "repository": "https://github.com/org/farmtally.git",
    "dirty": false
  },
  "build": {
    "number": "1234",
    "environment": "production",
    "node": "v18.17.0",
    "npm": "9.6.7"
  },
  "components": [
    {
      "name": "backend",
      "type": "backend",
      "path": "backend/backend.tar.gz",
      "size": 1048576,
      "checksum": "sha256:abc123..."
    },
    {
      "name": "frontend",
      "type": "frontend",
      "path": "frontend/frontend.tar.gz",
      "size": 2097152,
      "checksum": "sha256:def456..."
    }
  ],
  "metadata": {
    "creator": "jenkins@build-server",
    "platform": "Linux-x86_64",
    "retentionDays": 30
  }
}
```

## Usage

### Command Line Usage

#### Create Artifact
```bash
# Unix/Linux
./scripts/artifact-manager.sh create

# Windows (PowerShell)
.\scripts\artifact-manager.ps1 create

# Windows (Batch)
scripts\artifact-manager.bat create
```

#### List Artifacts
```bash
# Unix/Linux
./scripts/artifact-manager.sh list

# Windows (PowerShell)
.\scripts\artifact-manager.ps1 list
```

#### Verify Artifact
```bash
# Unix/Linux
./scripts/artifact-manager.sh verify farmtally-v1234-abc12345

# Windows (PowerShell)
.\scripts\artifact-manager.ps1 verify -ArtifactName farmtally-v1234-abc12345
```

#### Clean Old Artifacts
```bash
# Unix/Linux
./scripts/artifact-manager.sh clean

# Windows (PowerShell)
.\scripts\artifact-manager.ps1 clean
```

### Jenkins Integration

#### In Jenkinsfile
```groovy
@Library('farmtally-pipeline') _

pipeline {
    agent any
    
    stages {
        stage('Build') {
            steps {
                // Build backend and frontend
                sh 'npm run build'
                dir('farmtally-frontend') {
                    sh 'npm run build'
                }
            }
        }
        
        stage('Create Artifact') {
            steps {
                script {
                    def artifactManager = load 'scripts/jenkins-artifact-integration.groovy'
                    def artifactInfo = artifactManager.createArtifact()
                    env.ARTIFACT_NAME = artifactInfo.name
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    def artifactManager = load 'scripts/jenkins-artifact-integration.groovy'
                    artifactManager.deployArtifact(
                        env.ARTIFACT_NAME,
                        'production-server',
                        '/opt/farmtally'
                    )
                }
            }
        }
    }
    
    post {
        failure {
            script {
                def artifactManager = load 'scripts/jenkins-artifact-integration.groovy'
                artifactManager.rollbackToPreviousArtifact(
                    'production-server',
                    '/opt/farmtally'
                )
            }
        }
    }
}
```

## Configuration

### Environment Variables

#### Build Configuration
- `BUILD_NUMBER` - Build number (default: timestamp)
- `BUILD_ENV` - Build environment (default: production)

#### Retention Policy
- Default retention: 30 days
- Maximum artifacts: 50
- Configurable via script parameters

### Retention Policy

The system automatically:
1. Removes artifacts older than the retention period (default: 30 days)
2. Limits total artifacts to maximum count (default: 50)
3. Keeps the most recent artifacts when over the limit

## Security

### Integrity Verification
- SHA256 checksums for all packages
- Automatic verification during deployment
- Tamper detection capabilities

### Access Control
- Artifacts stored in controlled directory
- Jenkins workspace isolation
- Secure transfer protocols for deployment

## Deployment Integration

### Deployment Process
1. Verify artifact integrity
2. Extract packages to temporary location
3. Stop existing services
4. Replace application files
5. Start services
6. Verify deployment health
7. Log deployment details

### Rollback Process
1. Identify previous artifact version
2. Stop current services
3. Deploy previous artifact
4. Start services with previous version
5. Verify rollback success
6. Update deployment logs

## Monitoring and Logging

### Artifact Metrics
- Creation timestamp
- Package sizes
- Checksum verification status
- Deployment history

### Deployment Logging
- Deployment timestamp
- Artifact version deployed
- Target environment
- Success/failure status
- Rollback events

## Troubleshooting

### Common Issues

#### Build Directory Not Found
```
ERROR: Backend build directory 'dist' not found
```
**Solution**: Run `npm run build` before creating artifact

#### Frontend Build Missing
```
ERROR: Frontend build directory 'farmtally-frontend/.next' not found
```
**Solution**: Run `npm run build` in `farmtally-frontend/` directory

#### Checksum Verification Failed
```
✗ Backend integrity check failed
```
**Solution**: Recreate the artifact or check for file corruption

#### Insufficient Permissions
```
ERROR: Failed to create artifact package
```
**Solution**: Check file permissions and disk space

### Debug Mode
Enable verbose logging by setting environment variables:
```bash
export DEBUG=1
export VERBOSE=1
```

## Best Practices

### Development Workflow
1. Always build before creating artifacts
2. Verify artifacts before deployment
3. Test rollback procedures regularly
4. Monitor artifact storage usage

### Production Deployment
1. Use Jenkins for automated artifact creation
2. Implement health checks after deployment
3. Maintain deployment logs
4. Have rollback procedures ready

### Maintenance
1. Regular cleanup of old artifacts
2. Monitor storage usage
3. Verify backup procedures
4. Update retention policies as needed

## API Reference

### Artifact Manager Functions

#### createArtifact()
Creates a new artifact from current build output.

**Returns**: Artifact information object

#### verifyArtifact(artifactName)
Verifies the integrity of an existing artifact.

**Parameters**:
- `artifactName`: Name of artifact to verify

**Returns**: Boolean success status

#### deployArtifact(artifactName, targetHost, deployPath)
Deploys an artifact to target environment.

**Parameters**:
- `artifactName`: Name of artifact to deploy
- `targetHost`: Target server hostname
- `deployPath`: Deployment directory path

#### rollbackToPreviousArtifact(targetHost, deployPath)
Rolls back to the previous artifact version.

**Parameters**:
- `targetHost`: Target server hostname
- `deployPath`: Deployment directory path

## Support

For issues with the artifact management system:
1. Check the troubleshooting section
2. Verify build prerequisites
3. Check Jenkins logs for detailed error messages
4. Contact the development team for assistance