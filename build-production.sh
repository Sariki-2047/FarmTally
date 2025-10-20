#!/bin/bash

# FarmTally Production Build Script
set -e

echo "🚀 Starting FarmTally Production Build..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    if ! command -v flutter &> /dev/null; then
        print_error "Flutter is not installed. Please install Flutter and try again."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. Docker build will be skipped."
    fi
    
    print_success "All dependencies are available"
}

# Build backend
build_backend() {
    print_status "Building backend..."
    
    # Install dependencies
    npm ci --only=production
    
    # Generate Prisma client
    npx prisma generate
    
    # Build TypeScript
    npm run build
    
    print_success "Backend build completed"
}

# Build Flutter web app
build_frontend() {
    print_status "Building Flutter web app..."
    
    cd farmtally_mobile
    
    # Get Flutter dependencies
    flutter pub get
    
    # Build for web with production configuration
    flutter build web --release --web-renderer html --base-href /
    
    # Copy build to backend public directory
    rm -rf ../src/public
    cp -r build/web ../src/public
    
    cd ..
    
    print_success "Flutter web build completed"
}

# Create production environment file
create_env_file() {
    print_status "Creating production environment file..."
    
    if [ ! -f .env ]; then
        cp .env.example .env
        print_warning "Created .env file from example. Please update with production values."
    else
        print_success "Environment file already exists"
    fi
}

# Build Docker image
build_docker() {
    if command -v docker &> /dev/null; then
        print_status "Building Docker image..."
        
        docker build -t farmtally:latest .
        
        print_success "Docker image built successfully"
        print_status "To run: docker-compose up -d"
    else
        print_warning "Docker not available, skipping Docker build"
    fi
}

# Create deployment package
create_deployment_package() {
    print_status "Creating deployment package..."
    
    # Create deployment directory
    mkdir -p deployment
    
    # Copy necessary files
    cp -r dist deployment/
    cp -r node_modules deployment/
    cp -r prisma deployment/
    cp package*.json deployment/
    cp .env.example deployment/
    cp Dockerfile deployment/
    cp docker-compose.yml deployment/
    cp nginx.conf deployment/
    
    # Create deployment archive
    tar -czf farmtally-production.tar.gz deployment/
    
    # Cleanup
    rm -rf deployment
    
    print_success "Deployment package created: farmtally-production.tar.gz"
}

# Main build process
main() {
    print_status "FarmTally Production Build Started"
    echo "=================================="
    
    check_dependencies
    create_env_file
    build_backend
    build_frontend
    build_docker
    create_deployment_package
    
    echo "=================================="
    print_success "🎉 Production build completed successfully!"
    echo ""
    print_status "Next steps:"
    echo "1. Update .env file with production values"
    echo "2. Deploy using: docker-compose up -d"
    echo "3. Or extract farmtally-production.tar.gz on your server"
    echo "4. Run database migrations: npm run migrate"
    echo "5. Seed initial data: npm run seed"
    echo ""
    print_status "Access your application at: http://localhost:3000"
}

# Run main function
main "$@"