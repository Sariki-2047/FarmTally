#!/bin/bash

# Deploy Login Fixes to VPS
# This script uploads the fixed files and restarts the frontend

set -e

echo "🚀 Deploying Login Fixes to VPS"
echo "==============================="

# VPS Configuration
VPS_HOST="147.93.153.247"
VPS_USER="root"  # or your VPS username
VPS_PATH="/var/www/farmtally"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we can connect to VPS
check_vps_connection() {
    print_info "Checking VPS connection..."
    if ssh -o ConnectTimeout=10 $VPS_USER@$VPS_HOST "echo 'Connection successful'" > /dev/null 2>&1; then
        print_status "VPS connection verified"
    else
        print_error "Cannot connect to VPS. Please check:"
        echo "  - VPS IP: $VPS_HOST"
        echo "  - Username: $VPS_USER"
        echo "  - SSH key/password authentication"
        exit 1
    fi
}

# Upload fixed files
upload_fixes() {
    print_info "Uploading login fixes..."
    
    # Create backup of current files
    ssh $VPS_USER@$VPS_HOST "
        cd $VPS_PATH/farmtally-frontend/src/lib
        cp auth.ts auth.ts.backup.$(date +%Y%m%d_%H%M%S)
        cp api.ts api.ts.backup.$(date +%Y%m%d_%H%M%S)
    "
    
    # Upload fixed files
    scp farmtally-frontend/src/lib/auth.ts $VPS_USER@$VPS_HOST:$VPS_PATH/farmtally-frontend/src/lib/auth.ts
    scp farmtally-frontend/src/lib/api.ts $VPS_USER@$VPS_HOST:$VPS_PATH/farmtally-frontend/src/lib/api.ts
    
    print_status "Files uploaded successfully"
}

# Rebuild and restart frontend
rebuild_frontend() {
    print_info "Rebuilding frontend with login fixes..."
    
    ssh $VPS_USER@$VPS_HOST "
        cd $VPS_PATH/farmtally-frontend
        
        # Install dependencies (in case of new ones)
        npm install
        
        # Build the application
        npm run build
        
        # Restart PM2 process
        pm2 restart farmtally-frontend || pm2 start npm --name 'farmtally-frontend' -- start
        
        # Save PM2 configuration
        pm2 save
    "
    
    print_status "Frontend rebuilt and restarted"
}

# Test the deployment
test_deployment() {
    print_info "Testing deployment..."
    
    # Wait for service to start
    sleep 10
    
    # Test health check
    if curl -f https://app.farmtally.in > /dev/null 2>&1; then
        print_status "Website is responding"
    else
        print_error "Website health check failed"
        return 1
    fi
    
    # Test login page
    if curl -f https://app.farmtally.in/login > /dev/null 2>&1; then
        print_status "Login page is accessible"
    else
        print_error "Login page not accessible"
        return 1
    fi
    
    print_status "Deployment test passed"
}

# Show deployment status
show_status() {
    print_info "Getting deployment status..."
    
    ssh $VPS_USER@$VPS_HOST "
        echo '📊 PM2 Status:'
        pm2 list
        echo ''
        echo '💾 Disk Usage:'
        df -h | grep -E '(Filesystem|/dev/)'
        echo ''
        echo '🧠 Memory Usage:'
        free -h
    "
}

# Main deployment process
main() {
    echo ""
    print_info "Starting login fix deployment to VPS..."
    echo ""
    
    # Check connection
    check_vps_connection
    
    # Upload fixes
    upload_fixes
    
    # Rebuild and restart
    rebuild_frontend
    
    # Test deployment
    test_deployment
    
    # Show status
    show_status
    
    echo ""
    print_status "🎉 Login fixes deployed successfully!"
    echo ""
    print_info "Test the fixes at:"
    echo "  🌐 Main site: https://app.farmtally.in"
    echo "  🔐 Login page: https://app.farmtally.in/login"
    echo "  🧪 Test page: https://app.farmtally.in/simple-login-test"
    echo ""
    print_info "Login credentials:"
    echo "  📧 Email: admin@farmtally.in"
    echo "  🔑 Password: FarmTallyAdmin2024!"
    echo ""
}

# Run deployment
main "$@"