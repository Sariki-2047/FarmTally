#!/bin/bash

# Deploy Login Fixes to VPS via Git Pull
# This script pulls the latest code from Git and rebuilds

set -e

echo "🚀 Deploying Login Fixes to VPS via Git"
echo "======================================="

# VPS Configuration
VPS_HOST="147.93.153.247"
VPS_USER="root"  # Update this to your actual VPS username
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

# Deploy via Git
deploy_via_git() {
    print_info "Deploying via Git pull..."
    
    ssh $VPS_USER@$VPS_HOST "
        cd $VPS_PATH
        
        # Pull latest changes
        echo '📥 Pulling latest code from Git...'
        git pull origin main
        
        # Navigate to frontend
        cd farmtally-frontend
        
        # Install any new dependencies
        echo '📦 Installing dependencies...'
        npm install
        
        # Build the application
        echo '🔨 Building application...'
        npm run build
        
        # Restart PM2 process
        echo '🔄 Restarting frontend service...'
        pm2 restart farmtally-frontend || pm2 start npm --name 'farmtally-frontend' -- start
        
        # Save PM2 configuration
        pm2 save
        
        echo '✅ Deployment complete!'
    "
    
    print_status "Git deployment completed"
}

# Test the deployment
test_deployment() {
    print_info "Testing deployment..."
    
    # Wait for service to start
    sleep 10
    
    # Test main site
    if curl -f -s https://app.farmtally.in > /dev/null; then
        print_status "✅ Main site is responding"
    else
        print_error "❌ Main site health check failed"
    fi
    
    # Test login page
    if curl -f -s https://app.farmtally.in/login > /dev/null; then
        print_status "✅ Login page is accessible"
    else
        print_error "❌ Login page not accessible"
    fi
    
    # Test simple login test page
    if curl -f -s https://app.farmtally.in/simple-login-test > /dev/null; then
        print_status "✅ Login test page is accessible"
    else
        print_info "⚠️  Login test page may not be accessible (this is okay)"
    fi
}

# Show deployment status
show_status() {
    print_info "Getting deployment status..."
    
    ssh $VPS_USER@$VPS_HOST "
        echo '📊 PM2 Status:'
        pm2 list
        echo ''
        echo '📝 Recent Git commits:'
        cd $VPS_PATH && git log --oneline -5
    "
}

# Main deployment process
main() {
    echo ""
    print_info "Starting Git-based deployment to VPS..."
    echo ""
    
    # Deploy via Git
    deploy_via_git
    
    # Test deployment
    test_deployment
    
    # Show status
    show_status
    
    echo ""
    print_status "🎉 Login fixes deployed successfully via Git!"
    echo ""
    print_info "🧪 Test the fixes now:"
    echo "  🌐 Main site: https://app.farmtally.in"
    echo "  🔐 Login page: https://app.farmtally.in/login"
    echo "  🧪 Test page: https://app.farmtally.in/simple-login-test"
    echo ""
    print_info "🔑 Login credentials:"
    echo "  📧 Email: admin@farmtally.in"
    echo "  🔑 Password: FarmTallyAdmin2024!"
    echo ""
    print_info "✨ What was fixed:"
    echo "  - Authentication response handling"
    echo "  - Token extraction from backend"
    echo "  - User data transformation"
    echo "  - Role-based redirects"
    echo ""
}

# Run deployment
main "$@"