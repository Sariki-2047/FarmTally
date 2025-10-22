#!/bin/bash

# FarmTally Git-Based Deployment Script
# Deploys FarmTally using Git for version control

set -e

# Configuration
VPS_HOST="147.93.153.247"
VPS_USER="root"
PROJECT_DIR="/opt/farmtally"
COMPOSE_FILE="docker-compose.consolidated.yml"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🚀 FarmTally Git-Based Deployment Starting..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a git repository. Please initialize git first:"
    echo "  git init"
    echo "  git add ."
    echo "  git commit -m 'Initial commit'"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes. Commit them first:"
    echo "  git add ."
    echo "  git commit -m 'Your commit message'"
    exit 1
fi

# Get current commit hash
COMMIT_HASH=$(git rev-parse --short HEAD)
BRANCH=$(git branch --show-current)

print_status "Deploying commit $COMMIT_HASH from branch $BRANCH"

# Check if VPS has git repository
print_status "Checking VPS repository status..."
ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" "
    if [ ! -d '$PROJECT_DIR/.git' ]; then
        echo 'Git repository not found on VPS. Setting up...'
        
        # Create project directory
        mkdir -p $PROJECT_DIR
        cd $PROJECT_DIR
        
        # Initialize git repository
        git init
        
        # Add this machine as remote (if using local git)
        # For GitHub, we'll clone instead
        echo 'Git repository initialized on VPS'
    else
        echo 'Git repository found on VPS'
    fi
"

# Deploy via Git
print_status "Deploying to VPS via Git..."
ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" << EOF
    cd $PROJECT_DIR
    
    echo "📥 Pulling latest changes..."
    
    # If using GitHub (recommended)
    if git remote get-url origin 2>/dev/null | grep -q github; then
        git pull origin $BRANCH
    else
        # For direct push setup, we'd receive the push here
        echo "Direct git push deployment"
    fi
    
    echo "📦 Installing frontend dependencies..."
    cd farmtally-frontend
    npm ci --production
    
    echo "🏗️ Building frontend..."
    npm run build
    cd ..
    
    echo "🐳 Stopping existing services..."
    docker-compose -f $COMPOSE_FILE down || echo "No existing services"
    
    echo "🚀 Starting consolidated FarmTally system..."
    docker-compose -f $COMPOSE_FILE up -d --build
    
    echo "⏳ Waiting for services to start..."
    sleep 30
    
    echo "📊 Checking service status..."
    docker-compose -f $COMPOSE_FILE ps
    
    echo "✅ Git deployment completed!"
EOF

if [ $? -eq 0 ]; then
    print_success "Git deployment completed successfully!"
    
    # Run health checks
    print_status "Running health checks..."
    sleep 10
    
    # Test main endpoint
    if curl -f "http://$VPS_HOST:8080/health" > /dev/null 2>&1; then
        print_success "Health endpoint is responding"
    else
        print_warning "Health endpoint check failed"
    fi
    
    # Test frontend
    if curl -f "http://$VPS_HOST:8080/farmtally/" > /dev/null 2>&1; then
        print_success "Frontend is accessible"
    else
        print_warning "Frontend check failed"
    fi
    
    echo ""
    print_success "🎉 FarmTally Git Deployment Complete!"
    echo ""
    echo "📋 Deployment Details:"
    echo "   Commit: $COMMIT_HASH"
    echo "   Branch: $BRANCH"
    echo "   Time: $(date)"
    echo ""
    echo "🌐 Access URLs:"
    echo "   App: http://$VPS_HOST:8080/farmtally/"
    echo "   Health: http://$VPS_HOST:8080/health"
    
else
    print_error "Git deployment failed!"
    exit 1
fi