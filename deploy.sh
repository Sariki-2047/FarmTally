#!/bin/bash

# FarmTally Production Deployment Script
# This script automates the deployment process

set -e  # Exit on any error

echo "🚀 FarmTally Production Deployment"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if required tools are installed
check_requirements() {
    print_info "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm"
        exit 1
    fi
    
    print_status "Requirements check passed"
}

# Build the application
build_application() {
    print_info "Building application..."
    
    # Install dependencies
    npm install
    
    # Build TypeScript
    npm run build
    
    print_status "Application built successfully"
}

# Setup database
setup_database() {
    print_info "Setting up database..."
    
    # Generate Prisma client
    npx prisma generate
    
    # Run migrations
    npx prisma migrate deploy
    
    print_status "Database setup completed"
}

# Test deployment
test_deployment() {
    print_info "Testing deployment..."
    
    # Start server in background for testing
    npm start &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 5
    
    # Test health endpoint
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_status "Health check passed"
    else
        print_error "Health check failed"
        kill $SERVER_PID
        exit 1
    fi
    
    # Stop test server
    kill $SERVER_PID
    
    print_status "Deployment test passed"
}

# Deploy to Railway
deploy_railway() {
    print_info "Deploying to Railway..."
    
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not found. Installing..."
        npm install -g @railway/cli
    fi
    
    # Check if already logged in
    if ! railway whoami &> /dev/null; then
        print_info "Please login to Railway:"
        railway login
    fi
    
    # Deploy
    railway up
    
    print_status "Deployed to Railway successfully"
}

# Deploy to Heroku
deploy_heroku() {
    print_info "Deploying to Heroku..."
    
    if ! command -v heroku &> /dev/null; then
        print_error "Heroku CLI not found. Please install Heroku CLI"
        exit 1
    fi
    
    # Check if already logged in
    if ! heroku whoami &> /dev/null; then
        print_info "Please login to Heroku:"
        heroku login
    fi
    
    # Create Procfile if it doesn't exist
    if [ ! -f Procfile ]; then
        echo "web: npm start" > Procfile
        print_info "Created Procfile"
    fi
    
    # Deploy
    git add .
    git commit -m "Deploy to production" || true
    git push heroku main
    
    print_status "Deployed to Heroku successfully"
}

# Setup production environment
setup_environment() {
    print_info "Setting up production environment..."
    
    if [ ! -f .env ]; then
        cp .env.example .env
        print_warning "Created .env file from example. Please edit with production values."
        print_info "Required environment variables:"
        echo "  - DATABASE_URL"
        echo "  - JWT_SECRET"
        echo "  - SMTP_USER"
        echo "  - SMTP_PASS"
        echo ""
        read -p "Press Enter after editing .env file..."
    fi
    
    print_status "Environment setup completed"
}

# Create system admin
create_system_admin() {
    print_info "Creating system admin..."
    
    read -p "Enter admin email: " ADMIN_EMAIL
    read -s -p "Enter admin password: " ADMIN_PASSWORD
    echo ""
    read -p "Enter admin first name: " ADMIN_FIRST_NAME
    read -p "Enter admin last name: " ADMIN_LAST_NAME
    
    # Get deployment URL
    if command -v railway &> /dev/null && railway status &> /dev/null; then
        DEPLOY_URL=$(railway domain)
    elif command -v heroku &> /dev/null; then
        DEPLOY_URL=$(heroku info -s | grep web_url | cut -d= -f2)
    else
        read -p "Enter your deployment URL (e.g., https://your-app.herokuapp.com): " DEPLOY_URL
    fi
    
    # Remove trailing slash
    DEPLOY_URL=${DEPLOY_URL%/}
    
    # Create system admin
    curl -X POST "$DEPLOY_URL/api/system-admin/setup" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$ADMIN_EMAIL\",
            \"password\": \"$ADMIN_PASSWORD\",
            \"firstName\": \"$ADMIN_FIRST_NAME\",
            \"lastName\": \"$ADMIN_LAST_NAME\"
        }" \
        -w "\nHTTP Status: %{http_code}\n"
    
    print_status "System admin creation attempted"
    print_info "Login URL: $DEPLOY_URL/system-admin/dashboard"
}

# Main deployment flow
main() {
    echo ""
    print_info "Starting FarmTally deployment process..."
    echo ""
    
    # Check requirements
    check_requirements
    
    # Setup environment
    setup_environment
    
    # Build application
    build_application
    
    # Setup database (for local testing)
    if [ -f .env ] && grep -q "localhost" .env; then
        setup_database
        test_deployment
    fi
    
    # Choose deployment platform
    echo ""
    print_info "Choose deployment platform:"
    echo "1) Railway (Recommended)"
    echo "2) Heroku"
    echo "3) Manual (skip deployment)"
    read -p "Enter choice (1-3): " DEPLOY_CHOICE
    
    case $DEPLOY_CHOICE in
        1)
            deploy_railway
            ;;
        2)
            deploy_heroku
            ;;
        3)
            print_info "Skipping deployment. Application is ready for manual deployment."
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    # Create system admin
    if [ "$DEPLOY_CHOICE" != "3" ]; then
        echo ""
        read -p "Create system admin now? (y/n): " CREATE_ADMIN
        if [ "$CREATE_ADMIN" = "y" ] || [ "$CREATE_ADMIN" = "Y" ]; then
            create_system_admin
        fi
    fi
    
    echo ""
    print_status "🎉 FarmTally deployment completed!"
    echo ""
    print_info "Next steps:"
    echo "1. Test your deployment URL"
    echo "2. Create system admin (if not done)"
    echo "3. Configure email settings"
    echo "4. Test user registration flow"
    echo "5. Set up monitoring and backups"
    echo ""
    print_info "Documentation available in:"
    echo "- PRODUCTION_DEPLOYMENT_GUIDE.md"
    echo "- AUTHENTICATION_SETUP_GUIDE.md"
    echo "- EMAIL_SETUP_GUIDE.md"
    echo ""
    print_status "Welcome to production! 🌾🚀"
}

# Run main function
main "$@"