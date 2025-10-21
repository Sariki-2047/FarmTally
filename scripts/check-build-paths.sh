#!/bin/bash

# FarmTally Build Path Existence Check Script
# This script checks if all required paths exist before executing build commands

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if path exists and exit on failure
check_required_path() {
    local path=$1
    local description=$2
    
    if [ -e "$path" ]; then
        echo -e "${GREEN}✅ $description: $path${NC}"
        return 0
    else
        echo -e "${RED}❌ MISSING: $description at $path${NC}"
        echo -e "${RED}Build cannot continue without this path${NC}"
        exit 1
    fi
}

# Function to check optional path
check_optional_path() {
    local path=$1
    local description=$2
    
    if [ -e "$path" ]; then
        echo -e "${GREEN}✅ $description: $path${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  OPTIONAL: $description not found at $path${NC}"
        return 0
    fi
}

# Main function
main() {
    local stage=${1:-"pre-build"}
    
    echo "🔍 Checking build paths for stage: $stage"
    echo "============================================"
    
    case $stage in
        "pre-build")
            echo "📋 Pre-build path validation..."
            
            # Backend source paths
            check_required_path "package.json" "Backend package.json"
            check_required_path "src" "Backend source directory"
            check_required_path "src/server.ts" "Backend main server file"
            check_required_path "tsconfig.json" "TypeScript configuration"
            
            # Frontend source paths
            check_required_path "farmtally-frontend" "Frontend directory"
            check_required_path "farmtally-frontend/package.json" "Frontend package.json"
            check_required_path "farmtally-frontend/src" "Frontend source directory"
            
            # Database paths
            check_required_path "prisma" "Prisma directory"
            check_required_path "prisma/schema.prisma" "Prisma schema"
            
            echo -e "${GREEN}✅ All pre-build paths verified${NC}"
            ;;
            
        "post-build")
            echo "📦 Post-build artifact validation..."
            
            # Backend build artifacts
            check_required_path "dist" "Backend build output"
            check_required_path "dist/server.js" "Backend compiled server"
            
            # Frontend build artifacts
            check_required_path "farmtally-frontend/.next" "Frontend build output"
            
            # Optional static export
            check_optional_path "farmtally-frontend/out" "Frontend static export"
            
            echo -e "${GREEN}✅ All build artifacts verified${NC}"
            ;;
            
        "pre-deploy")
            echo "🚀 Pre-deployment artifact validation..."
            
            # Verify all deployment artifacts exist
            check_required_path "dist" "Backend deployment artifacts"
            check_required_path "dist/server.js" "Backend server executable"
            check_required_path "package.json" "Backend package.json for dependencies"
            check_required_path "farmtally-frontend/.next" "Frontend deployment artifacts"
            
            # Check artifact sizes (basic validation)
            if [ -f "dist/server.js" ]; then
                local size=$(stat -f%z "dist/server.js" 2>/dev/null || stat -c%s "dist/server.js" 2>/dev/null || echo "0")
                if [ "$size" -gt 1000 ]; then
                    echo -e "${GREEN}✅ Backend server.js size: $size bytes${NC}"
                else
                    echo -e "${RED}❌ Backend server.js too small: $size bytes${NC}"
                    exit 1
                fi
            fi
            
            echo -e "${GREEN}✅ All deployment artifacts verified${NC}"
            ;;
            
        *)
            echo -e "${RED}❌ Unknown stage: $stage${NC}"
            echo "Usage: $0 [pre-build|post-build|pre-deploy]"
            exit 1
            ;;
    esac
    
    echo "============================================"
    echo -e "${GREEN}🎉 Path validation completed for stage: $stage${NC}"
}

# Run if script is executed directly
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi