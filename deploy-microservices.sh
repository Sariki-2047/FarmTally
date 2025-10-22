#!/bin/bash

# FarmTally Microservices Deployment Script
# Deploy individual services to VPS with Docker Compose

set -e

echo "🚀 Starting FarmTally Microservices Deployment..."

# Configuration
VPS_HOST="147.93.153.247"
VPS_USER="root"
PROJECT_DIR="/opt/farmtally"
BACKUP_DIR="/opt/farmtally-backup-$(date +%Y%m%d-%H%M%S)"

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

# Function to deploy individual service
deploy_service() {
    local service_name=$1
    local port=$2
    
    print_status "Deploying $service_name on port $port..."
    
    # Build and start the specific service
    ssh $VPS_USER@$VPS_HOST "cd $PROJECT_DIR && docker-compose -f docker-compose.microservices.yml up -d --build $service_name"
    
    # Wait for service to be ready
    sleep 10
    
    # Health check
    if ssh $VPS_USER@$VPS_HOST "curl -f http://localhost:$port/health > /dev/null 2>&1"; then
        print_success "$service_name is running and healthy on port $port"
    else
        print_error "$service_name health check failed on port $port"
        return 1
    fi
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if we can connect to VPS
    if ! ssh -o ConnectTimeout=10 $VPS_USER@$VPS_HOST "echo 'Connection successful'" > /dev/null 2>&1; then
        print_error "Cannot connect to VPS at $VPS_HOST"
        exit 1
    fi
    
    # Check if Docker is installed
    if ! ssh $VPS_USER@$VPS_HOST "docker --version" > /dev/null 2>&1; then
        print_error "Docker is not installed on VPS"
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! ssh $VPS_USER@$VPS_HOST "docker-compose --version" > /dev/null 2>&1; then
        print_error "Docker Compose is not installed on VPS"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to backup existing deployment
backup_existing() {
    print_status "Creating backup of existing deployment..."
    
    ssh $VPS_USER@$VPS_HOST "
        if [ -d '$PROJECT_DIR' ]; then
            cp -r $PROJECT_DIR $BACKUP_DIR
            echo 'Backup created at $BACKUP_DIR'
        else
            echo 'No existing deployment to backup'
        fi
    "
}

# Function to upload files
upload_files() {
    print_status "Uploading microservices configuration..."
    
    # Create project directory
    ssh $VPS_USER@$VPS_HOST "mkdir -p $PROJECT_DIR"
    
    # Upload Docker Compose file
    scp docker-compose.microservices.yml $VPS_USER@$VPS_HOST:$PROJECT_DIR/
    
    # Upload service directories
    scp -r services/ $VPS_USER@$VPS_HOST:$PROJECT_DIR/
    
    # Upload database initialization
    scp -r database/ $VPS_USER@$VPS_HOST:$PROJECT_DIR/ 2>/dev/null || echo "No database directory found"
    
    print_success "Files uploaded successfully"
}

# Function to setup database
setup_database() {
    print_status "Setting up PostgreSQL database..."
    
    ssh $VPS_USER@$VPS_HOST "cd $PROJECT_DIR && docker-compose -f docker-compose.microservices.yml up -d postgres"
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 30
    
    # Check database health
    if ssh $VPS_USER@$VPS_HOST "docker exec farmtally-postgres pg_isready -U farmtally_user" > /dev/null 2>&1; then
        print_success "Database is ready"
    else
        print_error "Database setup failed"
        return 1
    fi
}

# Function to deploy all services
deploy_all_services() {
    print_status "Deploying all microservices..."
    
    # Deploy services in dependency order
    deploy_service "auth-service" 8081
    deploy_service "organization-service" 8082
    deploy_service "farmer-service" 8083
    deploy_service "lorry-service" 8084
    deploy_service "delivery-service" 8085
    deploy_service "payment-service" 8086
    deploy_service "notification-service" 8087
    deploy_service "field-manager-service" 8088
    deploy_service "farm-admin-service" 8089
    deploy_service "report-service" 8090
    deploy_service "api-gateway" 8080
    
    print_success "All services deployed successfully"
}

# Function to setup Nginx reverse proxy
setup_nginx() {
    print_status "Setting up Nginx reverse proxy..."
    
    ssh $VPS_USER@$VPS_HOST "
        # Install Nginx if not present
        if ! command -v nginx &> /dev/null; then
            apt update && apt install -y nginx
        fi
        
        # Create Nginx configuration
        cat > /etc/nginx/sites-available/farmtally << 'EOF'
server {
    listen 80;
    server_name 147.93.153.247 farmtally.in www.farmtally.in;
    
    # API Gateway
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health checks
    location /health {
        proxy_pass http://localhost:8080/health;
    }
}
EOF
        
        # Enable site
        ln -sf /etc/nginx/sites-available/farmtally /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        
        # Test and reload Nginx
        nginx -t && systemctl reload nginx
    "
    
    print_success "Nginx configured successfully"
}

# Function to run health checks
run_health_checks() {
    print_status "Running comprehensive health checks..."
    
    local services=(
        "postgres:5432"
        "auth-service:8081"
        "organization-service:8082"
        "farmer-service:8083"
        "lorry-service:8084"
        "delivery-service:8085"
        "payment-service:8086"
        "notification-service:8087"
        "field-manager-service:8088"
        "farm-admin-service:8089"
        "report-service:8090"
        "api-gateway:8080"
    )
    
    for service in "${services[@]}"; do
        IFS=':' read -r name port <<< "$service"
        
        if [ "$name" = "postgres" ]; then
            # Database health check
            if ssh $VPS_USER@$VPS_HOST "docker exec farmtally-postgres pg_isready -U farmtally_user" > /dev/null 2>&1; then
                print_success "$name is healthy"
            else
                print_error "$name health check failed"
            fi
        else
            # Service health check
            if ssh $VPS_USER@$VPS_HOST "curl -f http://localhost:$port/health" > /dev/null 2>&1; then
                print_success "$name is healthy on port $port"
            else
                print_error "$name health check failed on port $port"
            fi
        fi
    done
}

# Function to show service status
show_service_status() {
    print_status "Service Status Summary:"
    
    ssh $VPS_USER@$VPS_HOST "cd $PROJECT_DIR && docker-compose -f docker-compose.microservices.yml ps"
    
    echo ""
    print_status "Service URLs:"
    echo "🌐 Frontend: http://147.93.153.247"
    echo "🚪 API Gateway: http://147.93.153.247:8080"
    echo "🔐 Auth Service: http://147.93.153.247:8081"
    echo "🏢 Organization Service: http://147.93.153.247:8082"
    echo "👨‍🌾 Farmer Service: http://147.93.153.247:8083"
    echo "🚛 Lorry Service: http://147.93.153.247:8084"
    echo "📦 Delivery Service: http://147.93.153.247:8085"
    echo "💰 Payment Service: http://147.93.153.247:8086"
    echo "📧 Notification Service: http://147.93.153.247:8087"
    echo "👨‍🌾 Field Manager Service: http://147.93.153.247:8088"
    echo "🏢 Farm Admin Service: http://147.93.153.247:8089"
    echo "📊 Report Service: http://147.93.153.247:8090"
}

# Main deployment flow
main() {
    echo "🌾 FarmTally Microservices Deployment"
    echo "======================================"
    
    check_prerequisites
    backup_existing
    upload_files
    setup_database
    deploy_all_services
    setup_nginx
    run_health_checks
    show_service_status
    
    print_success "🎉 FarmTally microservices deployment completed successfully!"
    print_status "You can now access the application at: http://147.93.153.247"
}

# Handle command line arguments
case "${1:-}" in
    "auth")
        deploy_service "auth-service" 8081
        ;;
    "organization")
        deploy_service "organization-service" 8082
        ;;
    "farmer")
        deploy_service "farmer-service" 8083
        ;;
    "lorry")
        deploy_service "lorry-service" 8084
        ;;
    "delivery")
        deploy_service "delivery-service" 8085
        ;;
    "payment")
        deploy_service "payment-service" 8086
        ;;
    "notification")
        deploy_service "notification-service" 8087
        ;;
    "field-manager")
        deploy_service "field-manager-service" 8088
        ;;
    "farm-admin")
        deploy_service "farm-admin-service" 8089
        ;;
    "report")
        deploy_service "report-service" 8090
        ;;
    "gateway")
        deploy_service "api-gateway" 8080
        ;;
    "health")
        run_health_checks
        ;;
    "status")
        show_service_status
        ;;
    *)
        main
        ;;
esac