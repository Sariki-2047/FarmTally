#!/bin/bash

# FarmTally Artifact Management System
# Handles versioning, packaging, and storage of build artifacts

set -e

# Configuration
ARTIFACTS_DIR="artifacts"
RETENTION_DAYS=30
MAX_ARTIFACTS=50

# Get version information
get_version_info() {
    COMMIT_SHA=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    COMMIT_SHORT=$(echo "$COMMIT_SHA" | cut -c1-8)
    BUILD_NUMBER=${BUILD_NUMBER:-$(date +%s)}
    BUILD_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    
    ARTIFACT_VERSION="v${BUILD_NUMBER}-${COMMIT_SHORT}"
    ARTIFACT_NAME="farmtally-${ARTIFACT_VERSION}"
    
    echo "Version Info:"
    echo "  Commit SHA: $COMMIT_SHA"
    echo "  Build Number: $BUILD_NUMBER"
    echo "  Artifact Version: $ARTIFACT_VERSION"
    echo "  Branch: $BRANCH_NAME"
    echo "  Timestamp: $BUILD_TIMESTAMP"
}

# Create artifact directory structure
setup_artifact_directory() {
    local artifact_path="$ARTIFACTS_DIR/$ARTIFACT_NAME"
    
    echo "Setting up artifact directory: $artifact_path"
    mkdir -p "$artifact_path"
    
    # Create subdirectories for components
    mkdir -p "$artifact_path/backend"
    mkdir -p "$artifact_path/frontend"
    mkdir -p "$artifact_path/metadata"
    
    echo "$artifact_path"
}

# Package backend artifacts
package_backend() {
    local artifact_path="$1"
    local backend_package="$artifact_path/backend/backend.tar.gz"
    
    echo "Packaging backend artifacts..."
    
    # Verify backend build exists
    if [ ! -d "dist" ]; then
        echo "ERROR: Backend build directory 'dist' not found"
        echo "Please run 'npm run build' first"
        exit 1
    fi
    
    # Create backend package
    tar -czf "$backend_package" \
        --exclude='node_modules' \
        --exclude='.env*' \
        --exclude='*.log' \
        dist/ \
        package.json \
        package-lock.json \
        prisma/ \
        || {
            echo "ERROR: Failed to create backend package"
            exit 1
        }
    
    # Calculate checksum
    local checksum=$(sha256sum "$backend_package" | cut -d' ' -f1)
    echo "$checksum" > "$artifact_path/backend/backend.sha256"
    
    # Get package size
    local size=$(stat -f%z "$backend_package" 2>/dev/null || stat -c%s "$backend_package" 2>/dev/null || echo "0")
    
    echo "Backend package created:"
    echo "  File: $backend_package"
    echo "  Size: $size bytes"
    echo "  Checksum: $checksum"
    
    # Return component info for manifest
    echo "{\"name\":\"backend\",\"type\":\"backend\",\"path\":\"backend/backend.tar.gz\",\"size\":$size,\"checksum\":\"$checksum\"}"
}

# Package frontend artifacts
package_frontend() {
    local artifact_path="$1"
    local frontend_package="$artifact_path/frontend/frontend.tar.gz"
    
    echo "Packaging frontend artifacts..."
    
    # Verify frontend build exists
    if [ ! -d "farmtally-frontend/.next" ]; then
        echo "ERROR: Frontend build directory 'farmtally-frontend/.next' not found"
        echo "Please run 'npm run build' in farmtally-frontend directory first"
        exit 1
    fi
    
    # Create frontend package
    tar -czf "$frontend_package" \
        -C farmtally-frontend \
        --exclude='node_modules' \
        --exclude='.env*' \
        --exclude='*.log' \
        .next/ \
        public/ \
        package.json \
        package-lock.json \
        next.config.ts \
        || {
            echo "ERROR: Failed to create frontend package"
            exit 1
        }
    
    # Calculate checksum
    local checksum=$(sha256sum "$frontend_package" | cut -d' ' -f1)
    echo "$checksum" > "$artifact_path/frontend/frontend.sha256"
    
    # Get package size
    local size=$(stat -f%z "$frontend_package" 2>/dev/null || stat -c%s "$frontend_package" 2>/dev/null || echo "0")
    
    echo "Frontend package created:"
    echo "  File: $frontend_package"
    echo "  Size: $size bytes"
    echo "  Checksum: $checksum"
    
    # Return component info for manifest
    echo "{\"name\":\"frontend\",\"type\":\"frontend\",\"path\":\"frontend/frontend.tar.gz\",\"size\":$size,\"checksum\":\"$checksum\"}"
}

# Generate artifact manifest
generate_manifest() {
    local artifact_path="$1"
    local backend_info="$2"
    local frontend_info="$3"
    local manifest_file="$artifact_path/manifest.json"
    
    echo "Generating artifact manifest..."
    
    # Get repository information
    local repo_url=$(git config --get remote.origin.url 2>/dev/null || echo "unknown")
    local dirty_flag=""
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        dirty_flag="-dirty"
    fi
    
    # Create manifest JSON
    cat > "$manifest_file" << EOF
{
  "version": "$ARTIFACT_VERSION",
  "name": "$ARTIFACT_NAME",
  "timestamp": "$BUILD_TIMESTAMP",
  "git": {
    "commit": "$COMMIT_SHA",
    "shortCommit": "$COMMIT_SHORT",
    "branch": "$BRANCH_NAME",
    "repository": "$repo_url",
    "dirty": $([ -n "$dirty_flag" ] && echo "true" || echo "false")
  },
  "build": {
    "number": "$BUILD_NUMBER",
    "environment": "${BUILD_ENV:-production}",
    "node": "$(node --version 2>/dev/null || echo "unknown")",
    "npm": "$(npm --version 2>/dev/null || echo "unknown")"
  },
  "components": [
    $backend_info,
    $frontend_info
  ],
  "metadata": {
    "creator": "$(whoami)@$(hostname)",
    "platform": "$(uname -s)-$(uname -m)",
    "retentionDays": $RETENTION_DAYS
  }
}
EOF
    
    echo "Manifest created: $manifest_file"
    
    # Create human-readable summary
    local summary_file="$artifact_path/ARTIFACT_INFO.txt"
    cat > "$summary_file" << EOF
FarmTally Build Artifact
========================

Version: $ARTIFACT_VERSION
Build Number: $BUILD_NUMBER
Timestamp: $BUILD_TIMESTAMP

Git Information:
  Commit: $COMMIT_SHA
  Branch: $BRANCH_NAME
  Repository: $repo_url

Components:
  - Backend: backend/backend.tar.gz
  - Frontend: frontend/frontend.tar.gz

Build Environment:
  Node.js: $(node --version 2>/dev/null || echo "unknown")
  NPM: $(npm --version 2>/dev/null || echo "unknown")
  Platform: $(uname -s)-$(uname -m)

Created by: $(whoami)@$(hostname)
EOF
    
    echo "Summary created: $summary_file"
}

# Apply retention policy
apply_retention_policy() {
    echo "Applying retention policy..."
    
    if [ ! -d "$ARTIFACTS_DIR" ]; then
        echo "No artifacts directory found, skipping retention policy"
        return
    fi
    
    # Remove artifacts older than retention period
    if command -v find >/dev/null 2>&1; then
        local deleted_count=0
        while IFS= read -r -d '' old_artifact; do
            echo "Removing old artifact: $(basename "$old_artifact")"
            rm -rf "$old_artifact"
            ((deleted_count++))
        done < <(find "$ARTIFACTS_DIR" -maxdepth 1 -type d -name "farmtally-*" -mtime +$RETENTION_DAYS -print0 2>/dev/null)
        
        if [ $deleted_count -gt 0 ]; then
            echo "Removed $deleted_count old artifacts (older than $RETENTION_DAYS days)"
        fi
    fi
    
    # Limit total number of artifacts
    local artifact_count=$(ls -1 "$ARTIFACTS_DIR" | grep "^farmtally-" | wc -l)
    if [ "$artifact_count" -gt "$MAX_ARTIFACTS" ]; then
        local excess=$((artifact_count - MAX_ARTIFACTS))
        echo "Too many artifacts ($artifact_count), removing $excess oldest artifacts"
        
        ls -1t "$ARTIFACTS_DIR" | grep "^farmtally-" | tail -n "$excess" | while read -r old_artifact; do
            echo "Removing excess artifact: $old_artifact"
            rm -rf "$ARTIFACTS_DIR/$old_artifact"
        done
    fi
}

# List available artifacts
list_artifacts() {
    echo "Available artifacts:"
    echo "==================="
    
    if [ ! -d "$ARTIFACTS_DIR" ]; then
        echo "No artifacts directory found"
        return
    fi
    
    local count=0
    for artifact_dir in "$ARTIFACTS_DIR"/farmtally-*; do
        if [ -d "$artifact_dir" ]; then
            local artifact_name=$(basename "$artifact_dir")
            local manifest_file="$artifact_dir/manifest.json"
            
            if [ -f "$manifest_file" ]; then
                local version=$(grep '"version"' "$manifest_file" | cut -d'"' -f4)
                local timestamp=$(grep '"timestamp"' "$manifest_file" | cut -d'"' -f4)
                local commit=$(grep '"shortCommit"' "$manifest_file" | cut -d'"' -f4)
                echo "  $artifact_name (commit: $commit, created: $timestamp)"
            else
                echo "  $artifact_name (no manifest)"
            fi
            ((count++))
        fi
    done
    
    if [ $count -eq 0 ]; then
        echo "No artifacts found"
    else
        echo ""
        echo "Total: $count artifacts"
    fi
}

# Verify artifact integrity
verify_artifact() {
    local artifact_name="$1"
    local artifact_path="$ARTIFACTS_DIR/$artifact_name"
    
    if [ ! -d "$artifact_path" ]; then
        echo "ERROR: Artifact not found: $artifact_name"
        exit 1
    fi
    
    echo "Verifying artifact: $artifact_name"
    
    local errors=0
    
    # Check backend integrity
    if [ -f "$artifact_path/backend/backend.tar.gz" ] && [ -f "$artifact_path/backend/backend.sha256" ]; then
        local expected_checksum=$(cat "$artifact_path/backend/backend.sha256")
        local actual_checksum=$(sha256sum "$artifact_path/backend/backend.tar.gz" | cut -d' ' -f1)
        
        if [ "$expected_checksum" = "$actual_checksum" ]; then
            echo "  ✓ Backend integrity verified"
        else
            echo "  ✗ Backend integrity check failed"
            echo "    Expected: $expected_checksum"
            echo "    Actual:   $actual_checksum"
            ((errors++))
        fi
    else
        echo "  ✗ Backend checksum file missing"
        ((errors++))
    fi
    
    # Check frontend integrity
    if [ -f "$artifact_path/frontend/frontend.tar.gz" ] && [ -f "$artifact_path/frontend/frontend.sha256" ]; then
        local expected_checksum=$(cat "$artifact_path/frontend/frontend.sha256")
        local actual_checksum=$(sha256sum "$artifact_path/frontend/frontend.tar.gz" | cut -d' ' -f1)
        
        if [ "$expected_checksum" = "$actual_checksum" ]; then
            echo "  ✓ Frontend integrity verified"
        else
            echo "  ✗ Frontend integrity check failed"
            echo "    Expected: $expected_checksum"
            echo "    Actual:   $actual_checksum"
            ((errors++))
        fi
    else
        echo "  ✗ Frontend checksum file missing"
        ((errors++))
    fi
    
    # Check manifest
    if [ -f "$artifact_path/manifest.json" ]; then
        if command -v jq >/dev/null 2>&1; then
            if jq empty "$artifact_path/manifest.json" 2>/dev/null; then
                echo "  ✓ Manifest is valid JSON"
            else
                echo "  ✗ Manifest is invalid JSON"
                ((errors++))
            fi
        else
            echo "  ? Manifest exists (jq not available for validation)"
        fi
    else
        echo "  ✗ Manifest file missing"
        ((errors++))
    fi
    
    if [ $errors -eq 0 ]; then
        echo "Artifact verification successful"
        return 0
    else
        echo "Artifact verification failed with $errors errors"
        return 1
    fi
}

# Main function
main() {
    local command="${1:-create}"
    
    case "$command" in
        "create")
            echo "Creating new artifact..."
            get_version_info
            
            local artifact_path=$(setup_artifact_directory)
            local backend_info=$(package_backend "$artifact_path")
            local frontend_info=$(package_frontend "$artifact_path")
            
            generate_manifest "$artifact_path" "$backend_info" "$frontend_info"
            apply_retention_policy
            
            echo ""
            echo "Artifact created successfully: $ARTIFACT_NAME"
            echo "Location: $artifact_path"
            ;;
        
        "list")
            list_artifacts
            ;;
        
        "verify")
            if [ -z "$2" ]; then
                echo "Usage: $0 verify <artifact-name>"
                exit 1
            fi
            verify_artifact "$2"
            ;;
        
        "clean")
            apply_retention_policy
            ;;
        
        "help"|"-h"|"--help")
            echo "FarmTally Artifact Manager"
            echo ""
            echo "Usage: $0 [command] [options]"
            echo ""
            echo "Commands:"
            echo "  create    Create new artifact from current build (default)"
            echo "  list      List all available artifacts"
            echo "  verify    Verify artifact integrity"
            echo "  clean     Apply retention policy and clean old artifacts"
            echo "  help      Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  BUILD_NUMBER    Build number (default: timestamp)"
            echo "  BUILD_ENV       Build environment (default: production)"
            echo ""
            echo "Examples:"
            echo "  $0 create                    # Create new artifact"
            echo "  $0 list                      # List artifacts"
            echo "  $0 verify farmtally-v123-abc12345  # Verify specific artifact"
            echo "  $0 clean                     # Clean old artifacts"
            ;;
        
        *)
            echo "Unknown command: $command"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"