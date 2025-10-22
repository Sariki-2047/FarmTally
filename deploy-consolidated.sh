#!/bin/bash

# FarmTally Consolidated Deployment Script
# Deploys all services on port 8080 with /farmtally/ subdirectory

set -e

echo "🚀 Starting FarmTally Consolidated Deployment..."

# Configuration
VPS_HOST="147.93.153.247"
VPS_USER="root"
PROJECT_DIR="/opt/farmtally"
COMPOSE_FILE="docker-compose.consolidated.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if required files exist
print_status "Checking required files..."
if [ ! -f "$COMPOSE_FILE" ]; then
    print_error "Docker Compose file not found: $COMPOSE_FILE"
    exit 1
fi

if [ ! -f "nginx-consolidated.conf" ]; then
    print_error "Nginx configuration file not found: nginx-consolidated.conf"
    exit 1
fi

if [ ! -d "farmtally-frontend" ]; then
    print_error "Frontend directory not found: farmtally-frontend"
    exit 1
fi

print_success "All required files found"

# Build frontend
print_status "Building frontend..."
cd farmtally-frontend
npm ci
npm run build
cd ..
print_success "Frontend built successfully"

# Copy files to VPS
print_status "Copying files to VPS..."
scp -o StrictHostKeyChecking=no "$COMPOSE_FILE" "$VPS_USER@$VPS_HOST:$PROJECT_DIR/"
scp -o StrictHostKeyChecking=no "nginx-consolidated.conf" "$VPS_USER@$VPS_HOST:$PROJECT_DIR/"

# Copy entire project directory
print_status "Syncing project files..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'farmtally_frontend' \
    ./ "$VPS_USER@$VPS_HOST:$PROJECT_DIR/"

print_success "Files copied to VPS"

# Deploy on VPS
print_status "Deploying on VPS..."
ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" << EOF
    cd $PROJECT_DIR
    
    echo "Stopping existing services..."
    docker-compose -f $COMPOSE_FILE down || echo "No existing services to stop"
    
    echo "Cleaning up old containers and images..."
    docker system prune -f
    
    echo "Starting FarmTally consolidated system..."
    docker-compose -f $COMPOSE_FILE up -d --build
    
    echo "Waiting for services to start..."
    sleep 30
    
    echo "Checking service status..."
    docker-compose -f $COMPOSE_FILE ps
EOF

print_success "Deployment completed"

# Health checks
print_status "Performing health checks..."
sleep 10

# Test main endpoint
if curl -f "http://$VPS_HOST:8080/health" > /dev/null 2>&1; then
    print_success "Main endpoint is healthy"
else
    print_warning "Main endpoint health check failed"
fi

# Test frontend
if curl -f "http://$VPS_HOST:8080/farmtally/" > /dev/null 2>&1; then
    print_success "Frontend is accessible"
else
    print_warning "Frontend health check failed"
fi

# Test API services
services=("api-gateway" "auth-service" "field-manager-service" "farm-admin-service")
for service in "${services[@]}"; do
    if curl -f "http://$VPS_HOST:8080/farmtally/$service/health" > /dev/null 2>&1; then
        print_success "$service is healthy"
    else
        print_warning "$service health check failed"
    fi
done

echo ""
print_success "🎉 FarmTally Consolidated Deployment Complete!"
echo ""
echo "Access URLs:"
echo "🌐 FarmTally App: http://$VPS_HOST:8080/farmtally/"
echo "🔍 Health Check: http://$VPS_HOST:8080/health"
echo ""
echo "API Endpoints:"
echo "🚪 API Gateway: http://$VPS_HOST:8080/farmtally/api-gateway/"
echo "🔐 Auth Service: http://$VPS_HOST:8080/farmtally/auth-service/"
echo "👨‍🌾 Field Manager: http://$VPS_HOST:8080/farmtally/field-manager-service/"
echo "🏢 Farm Admin: http://$VPS_HOST:8080/farmtally/farm-admin-service/"
echo ""
echo "Default Login:"
echo "📧 Email: admin@farmtally.com"
echo "🔑 Password: Admin123!"