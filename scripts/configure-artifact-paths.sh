#!/bin/bash

# FarmTally Artifact Path Configuration Script
# This script configures and validates artifact upload paths for Jenkins deployment

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
BACKEND_ROOT="."
FRONTEND_ROOT="farmtally-frontend"
VPS_HOST="${VPS_HOST:-147.93.153.247}"
VPS_USER="${VPS_USER:-root}"
APP_DIR="${APP_DIR:-/opt/farmtally}"

# Function to log messages
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to validate artifact paths
validate_artifact_paths() {
    log_info "Validating artifact paths..."
    
    local validation_failed=false
    
    # Backend artifacts
    if [ ! -d "${BACKEND_ROOT}/dist" ]; then
        log_error "Backend build artifacts not found at ${BACKEND_ROOT}/dist"
        validation_failed=true
    else
        log_success "Backend artifacts found at ${BACKEND_ROOT}/dist"
    fi
    
    if [ ! -f "${BACKEND_ROOT}/dist/server.js" ]; then
        log_error "Backend server.js not found at ${BACKEND_ROOT}/dist/server.js"
        validation_failed=true
    else
        log_success "Backend server.js found"
    fi
    
    # Frontend artifacts
    if [ ! -d "${FRONTEND_ROOT}/.next" ]; then
        log_error "Frontend build artifacts not found at ${FRONTEND_ROOT}/.next"
        validation_failed=true
    else
        log_success "Frontend artifacts found at ${FRONTEND_ROOT}/.next"
    fi
    
    # Package files
    if [ ! -f "${BACKEND_ROOT}/package.json" ]; then
        log_error "Backend package.json not found at ${BACKEND_ROOT}/package.json"
        validation_failed=true
    else
        log_success "Backend package.json found"
    fi
    
    if [ "$validation_failed" = "true" ]; then
        log_error "Artifact validation failed"
        return 1
    fi
    
    log_success "All artifacts validated successfully"
    return 0
}

# Function to generate SCP commands
generate_scp_commands() {
    log_info "Generating SCP upload commands..."
    
    cat > artifact-upload-commands.sh << EOF
#!/bin/bash
# Generated SCP commands for FarmTally artifact upload
# Generated on: $(date -u +%Y-%m-%dT%H:%M:%SZ)

set -e

VPS_HOST="${VPS_HOST}"
VPS_USER="${VPS_USER}"
APP_DIR="${APP_DIR}"

echo "🚀 Starting artifact upload to VPS..."

# Create remote directories
echo "📁 Creating remote directories..."
ssh -o StrictHostKeyChecking=no \${VPS_USER}@\${VPS_HOST} '
    mkdir -p \${APP_DIR}/backend
    mkdir -p \${APP_DIR}/frontend
    mkdir -p \${APP_DIR}/logs
    mkdir -p \${APP_DIR}/backups
'

# Upload backend artifacts
echo "📤 Uploading backend artifacts..."
scp -r ${BACKEND_ROOT}/dist/* \${VPS_USER}@\${VPS_HOST}:\${APP_DIR}/backend/
scp ${BACKEND_ROOT}/package.json \${VPS_USER}@\${VPS_HOST}:\${APP_DIR}/backend/
scp ${BACKEND_ROOT}/package-lock.json \${VPS_USER}@\${VPS_HOST}:\${APP_DIR}/backend/ || echo "⚠️  package-lock.json not found, skipping"

# Upload frontend artifacts
echo "📤 Uploading frontend artifacts..."
scp -r ${FRONTEND_ROOT}/.next/* \${VPS_USER}@\${VPS_HOST}:\${APP_DIR}/frontend/

# Upload static assets if they exist
if [ -d "${FRONTEND_ROOT}/out" ]; then
    echo "📤 Uploading frontend static assets..."
    scp -r ${FRONTEND_ROOT}/out/* \${VPS_USER}@\${VPS_HOST}:\${APP_DIR}/frontend/static/ || true
fi

# Upload Prisma schema for migrations
echo "📤 Uploading database schema..."
scp -r prisma \${VPS_USER}@\${VPS_HOST}:\${APP_DIR}/

echo "✅ All artifacts uploaded successfully"
EOF
    
    chmod +x artifact-upload-commands.sh
    log_success "SCP commands generated in artifact-upload-commands.sh"
}

# Function to generate rsync commands (alternative to SCP)
generate_rsync_commands() {
    log_info "Generating rsync upload commands..."
    
    cat > artifact-rsync-commands.sh << EOF
#!/bin/bash
# Generated rsync commands for FarmTally artifact upload
# Generated on: $(date -u +%Y-%m-%dT%H:%M:%SZ)

set -e

VPS_HOST="${VPS_HOST}"
VPS_USER="${VPS_USER}"
APP_DIR="${APP_DIR}"

echo "🚀 Starting artifact sync to VPS..."

# Create remote directories
echo "📁 Creating remote directories..."
ssh -o StrictHostKeyChecking=no \${VPS_USER}@\${VPS_HOST} '
    mkdir -p \${APP_DIR}/backend
    mkdir -p \${APP_DIR}/frontend
    mkdir -p \${APP_DIR}/logs
    mkdir -p \${APP_DIR}/backups
'

# Sync backend artifacts
echo "📤 Syncing backend artifacts..."
rsync -avz --delete ${BACKEND_ROOT}/dist/ \${VPS_USER}@\${VPS_HOST}:\${APP_DIR}/backend/
rsync -avz ${BACKEND_ROOT}/package.json \${VPS_USER}@\${VPS_HOST}:\${APP_DIR}/backend/
rsync -avz ${BACKEND_ROOT}/package-lock.json \${VPS_USER}@\${VPS_HOST}:\${APP_DIR}/backend/ || echo "⚠️  package-lock.json not found, skipping"

# Sync frontend artifacts
echo "📤 Syncing frontend artifacts..."
rsync -avz --delete ${FRONTEND_ROOT}/.next/ \${VPS_USER}@\${VPS_HOST}:\${APP_DIR}/frontend/

# Sync static assets if they exist
if [ -d "${FRONTEND_ROOT}/out" ]; then
    echo "📤 Syncing frontend static assets..."
    rsync -avz ${FRONTEND_ROOT}/out/ \${VPS_USER}@\${VPS_HOST}:\${APP_DIR}/frontend/static/ || true
fi

# Sync Prisma schema for migrations
echo "📤 Syncing database schema..."
rsync -avz prisma/ \${VPS_USER}@\${VPS_HOST}:\${APP_DIR}/prisma/

echo "✅ All artifacts synced successfully"
EOF
    
    chmod +x artifact-rsync-commands.sh
    log_success "Rsync commands generated in artifact-rsync-commands.sh"
}

# Function to create artifact manifest
create_artifact_manifest() {
    log_info "Creating artifact manifest..."
    
    local backend_size=0
    local frontend_size=0
    
    if [ -d "${BACKEND_ROOT}/dist" ]; then
        backend_size=$(du -sb "${BACKEND_ROOT}/dist" | cut -f1)
    fi
    
    if [ -d "${FRONTEND_ROOT}/.next" ]; then
        frontend_size=$(du -sb "${FRONTEND_ROOT}/.next" | cut -f1)
    fi
    
    cat > artifact-manifest.json << EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "buildNumber": "${BUILD_NUMBER:-unknown}",
    "gitCommit": "${GIT_COMMIT:-unknown}",
    "gitBranch": "${GIT_BRANCH:-unknown}",
    "artifacts": {
        "backend": {
            "root": "${BACKEND_ROOT}",
            "dist": "${BACKEND_ROOT}/dist",
            "size": ${backend_size},
            "files": [
                "${BACKEND_ROOT}/dist/server.js",
                "${BACKEND_ROOT}/package.json",
                "${BACKEND_ROOT}/package-lock.json"
            ]
        },
        "frontend": {
            "root": "${FRONTEND_ROOT}",
            "dist": "${FRONTEND_ROOT}/.next",
            "static": "${FRONTEND_ROOT}/out",
            "size": ${frontend_size}
        },
        "database": {
            "schema": "prisma/schema.prisma",
            "migrations": "prisma/migrations"
        }
    },
    "deployment": {
        "vpsHost": "${VPS_HOST}",
        "vpsUser": "${VPS_USER}",
        "appDir": "${APP_DIR}",
        "uploadMethod": "scp"
    }
}
EOF
    
    log_success "Artifact manifest created: artifact-manifest.json"
}

# Function to display artifact summary
display_artifact_summary() {
    log_info "Artifact Summary:"
    echo "=================="
    
    echo "📦 Backend Artifacts:"
    echo "   Root: ${BACKEND_ROOT}"
    echo "   Build Output: ${BACKEND_ROOT}/dist"
    if [ -d "${BACKEND_ROOT}/dist" ]; then
        echo "   Size: $(du -sh "${BACKEND_ROOT}/dist" | cut -f1)"
        echo "   Files: $(find "${BACKEND_ROOT}/dist" -type f | wc -l)"
    fi
    
    echo ""
    echo "🎨 Frontend Artifacts:"
    echo "   Root: ${FRONTEND_ROOT}"
    echo "   Build Output: ${FRONTEND_ROOT}/.next"
    if [ -d "${FRONTEND_ROOT}/.next" ]; then
        echo "   Size: $(du -sh "${FRONTEND_ROOT}/.next" | cut -f1)"
        echo "   Files: $(find "${FRONTEND_ROOT}/.next" -type f | wc -l)"
    fi
    
    echo ""
    echo "🎯 Deployment Target:"
    echo "   VPS Host: ${VPS_HOST}"
    echo "   VPS User: ${VPS_USER}"
    echo "   App Directory: ${APP_DIR}"
    
    echo "=================="
}

# Main function
main() {
    local action=${1:-"configure"}
    
    echo "🔧 FarmTally Artifact Path Configuration"
    echo "========================================"
    
    case $action in
        "validate")
            validate_artifact_paths
            ;;
        "configure")
            validate_artifact_paths
            generate_scp_commands
            generate_rsync_commands
            create_artifact_manifest
            display_artifact_summary
            log_success "Artifact configuration completed successfully"
            ;;
        "summary")
            display_artifact_summary
            ;;
        *)
            log_error "Unknown action: $action"
            echo "Usage: $0 [validate|configure|summary]"
            exit 1
            ;;
    esac
}

# Run if script is executed directly
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi