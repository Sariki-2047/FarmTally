# FarmTally Jenkins Pipeline Workspace Path Resolution

This directory contains scripts and configurations for resolving workspace paths in the FarmTally Jenkins CI/CD pipeline. These scripts ensure that all build commands execute from the correct directories and that artifact uploads reference the proper build output locations.

## 📁 Repository Structure

The FarmTally repository follows this structure:

```
FarmTally/
├── package.json                 # Backend package.json (repository root)
├── src/                        # Backend source code
├── dist/                       # Backend build output
├── prisma/                     # Database schema and migrations
├── farmtally-frontend/         # Frontend directory
│   ├── package.json           # Frontend package.json
│   ├── src/                   # Frontend source code
│   ├── .next/                 # Frontend build output
│   └── out/                   # Frontend static export (optional)
└── Jenkinsfile                # CI/CD pipeline configuration
```

## 🔧 Scripts Overview

### 1. `validate-workspace-paths.sh` / `validate-workspace-paths.bat`

**Purpose:** Validates the entire workspace structure before pipeline execution.

**Features:**
- Checks for required directories and files
- Validates package.json scripts
- Detects common path issues
- Generates path configuration file

**Usage:**
```bash
# Linux/Unix
./scripts/validate-workspace-paths.sh

# Windows
scripts\validate-workspace-paths.bat
```

**Output:** Creates `workspace-paths.env` with validated path configuration.

### 2. `check-build-paths.sh` / `check-build-paths.bat`

**Purpose:** Performs stage-specific path validation during pipeline execution.

**Stages:**
- `pre-build`: Validates source paths before building
- `post-build`: Validates build artifacts after compilation
- `pre-deploy`: Validates deployment artifacts before upload

**Usage:**
```bash
# Linux/Unix
./scripts/check-build-paths.sh [stage]

# Windows
scripts\check-build-paths.bat [stage]
```

**Examples:**
```bash
./scripts/check-build-paths.sh pre-build
./scripts/check-build-paths.sh post-build
./scripts/check-build-paths.sh pre-deploy
```

### 3. `configure-artifact-paths.sh` / `configure-artifact-paths.bat`

**Purpose:** Configures and validates artifact upload paths for deployment.

**Features:**
- Validates build artifacts
- Generates SCP upload commands
- Creates artifact manifest
- Displays deployment summary

**Usage:**
```bash
# Linux/Unix
./scripts/configure-artifact-paths.sh [action]

# Windows
scripts\configure-artifact-paths.bat [action]
```

**Actions:**
- `validate`: Only validate artifact paths
- `configure`: Full configuration (default)
- `summary`: Display artifact summary

## 📋 Path Configuration

### Backend Paths (Repository Root)
- **Root Directory:** `.` (repository root)
- **Source Code:** `src/`
- **Build Output:** `dist/`
- **Package File:** `package.json`
- **TypeScript Config:** `tsconfig.json`

### Frontend Paths
- **Root Directory:** `farmtally-frontend/`
- **Source Code:** `farmtally-frontend/src/`
- **Build Output:** `farmtally-frontend/.next/`
- **Static Export:** `farmtally-frontend/out/` (optional)
- **Package File:** `farmtally-frontend/package.json`

### Database Paths
- **Schema Directory:** `prisma/`
- **Schema File:** `prisma/schema.prisma`
- **Migrations:** `prisma/migrations/`

## 🚀 Jenkins Pipeline Integration

### Jenkinsfile Configuration

The updated Jenkinsfile includes workspace path validation:

```groovy
stage('Workspace Validation') {
    steps {
        script {
            // Run workspace validation
            if (isUnix()) {
                sh 'chmod +x scripts/validate-workspace-paths.sh'
                sh './scripts/validate-workspace-paths.sh'
            } else {
                bat 'scripts\\validate-workspace-paths.bat'
            }
            
            // Load validated paths
            def props = readProperties file: 'workspace-paths.env'
            env.BACKEND_ROOT = props.BACKEND_ROOT
            env.FRONTEND_ROOT = props.FRONTEND_ROOT
        }
    }
}
```

### Build Stage Configuration

Backend build (repository root):
```groovy
stage('Build Backend') {
    steps {
        dir("${env.BACKEND_ROOT}") {
            sh 'npm run build'
        }
    }
}
```

Frontend build (farmtally-frontend directory):
```groovy
stage('Build Frontend') {
    steps {
        dir("${env.FRONTEND_ROOT}") {
            sh 'npm run build'
        }
    }
}
```

### Artifact Upload Configuration

Correct artifact paths for deployment:
```groovy
// Backend artifacts
scp -r ${env.BACKEND_DIST}/* ${VPS_USER}@${VPS_HOST}:${APP_DIR}/backend/
scp package.json ${VPS_USER}@${VPS_HOST}:${APP_DIR}/backend/

// Frontend artifacts
scp -r ${env.FRONTEND_ROOT}/.next/* ${VPS_USER}@${VPS_HOST}:${APP_DIR}/frontend/
```

## ✅ Validation Checklist

### Pre-Build Validation
- [ ] `package.json` exists at repository root
- [ ] `src/server.ts` exists for backend
- [ ] `farmtally-frontend/package.json` exists
- [ ] `farmtally-frontend/src/` directory exists
- [ ] `prisma/schema.prisma` exists
- [ ] All required build scripts are present

### Post-Build Validation
- [ ] `dist/` directory created with backend artifacts
- [ ] `dist/server.js` compiled successfully
- [ ] `farmtally-frontend/.next/` directory created
- [ ] Frontend build artifacts are present

### Pre-Deploy Validation
- [ ] All build artifacts exist and are non-empty
- [ ] Package files are available for dependency installation
- [ ] Artifact sizes are reasonable (not corrupted)

## 🔍 Troubleshooting

### Common Issues

#### "No such file or directory" errors
**Cause:** Pipeline referencing incorrect paths
**Solution:** Run workspace validation and update Jenkinsfile paths

#### Build artifacts not found
**Cause:** Build commands executed from wrong directory
**Solution:** Ensure `dir()` blocks use correct environment variables

#### Frontend build fails
**Cause:** Missing environment variables or wrong directory
**Solution:** Verify frontend directory path and environment injection

#### Artifact upload fails
**Cause:** Incorrect artifact paths in SCP commands
**Solution:** Use generated artifact upload commands

### Debugging Steps

1. **Run workspace validation:**
   ```bash
   ./scripts/validate-workspace-paths.sh
   ```

2. **Check specific build stage:**
   ```bash
   ./scripts/check-build-paths.sh pre-build
   ./scripts/check-build-paths.sh post-build
   ```

3. **Validate artifacts:**
   ```bash
   ./scripts/configure-artifact-paths.sh validate
   ```

4. **Review generated configuration:**
   ```bash
   cat workspace-paths.env
   cat artifact-manifest.json
   ```

## 📝 Generated Files

### `workspace-paths.env`
Contains validated path configuration for pipeline use:
```bash
BACKEND_ROOT=.
FRONTEND_ROOT=farmtally-frontend
BACKEND_DIST=dist
FRONTEND_DIST=farmtally-frontend/.next
# ... additional paths
```

### `artifact-manifest.json`
Contains deployment artifact information:
```json
{
  "timestamp": "2025-10-21T12:00:00Z",
  "artifacts": {
    "backend": {
      "root": ".",
      "dist": "dist",
      "files": ["dist/server.js", "package.json"]
    },
    "frontend": {
      "root": "farmtally-frontend",
      "dist": "farmtally-frontend/.next"
    }
  }
}
```

### `artifact-upload-commands.sh`
Contains generated SCP commands for artifact deployment:
```bash
#!/bin/bash
scp -r dist/* ${VPS_USER}@${VPS_HOST}:${APP_DIR}/backend/
scp -r farmtally-frontend/.next/* ${VPS_USER}@${VPS_HOST}:${APP_DIR}/frontend/
```

## 🎯 Best Practices

1. **Always run workspace validation** before pipeline execution
2. **Use environment variables** for paths in Jenkinsfile
3. **Validate artifacts** before deployment
4. **Archive path configurations** for debugging
5. **Test path scripts locally** before committing changes

## 🔄 Maintenance

### Updating Path Configuration

When repository structure changes:

1. Update validation scripts with new paths
2. Test scripts locally
3. Update Jenkinsfile environment variables
4. Run full pipeline test in staging

### Adding New Artifacts

To add new artifact types:

1. Update `validate-workspace-paths.sh` with new paths
2. Add validation to `check-build-paths.sh`
3. Update `configure-artifact-paths.sh` for upload
4. Test end-to-end deployment

This workspace path resolution system ensures reliable, consistent deployments by validating all paths before execution and providing clear error messages when issues are detected.