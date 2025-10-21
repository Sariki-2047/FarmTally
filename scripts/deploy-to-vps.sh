#!/bin/bash

# FarmTally VPS Deployment Script
# Target: 147.93.153.247 with Jenkins and Docker

set -e

echo "🚀 Starting FarmTally VPS Deployment..."

# Configuration
VPS_HOST="147.93.153.247"
JENKINS_URL="http://147.93.153.247:8080"
DOCKER_URL="http://147.93.153.247:9000"
PROJECT_NAME="farmtally"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running in Jenkins
if [ -n "$JENKINS_URL" ]; then
    log_info "Running in Jenkins environment"
    WORKSPACE=${WORKSPACE:-$(pwd)}
else
    log_info "Running in local environment"
    WORKSPACE=$(pwd)
fi

# Step 1: Environment Setup
log_info "Setting up environment variables..."
export NODE_ENV=production
export VPS_HOST=$VPS_HOST
export PROJECT_ROOT=$WORKSPACE

# Step 2: Install Dependencies
log_info "Installing backend dependencies..."
if [ -f "package.json" ]; then
    npm ci --production
else
    log_warn "No package.json found in root, skipping backend dependencies"
fi

log_info "Installing frontend dependencies..."
if [ -d "farmtally-frontend" ]; then
    cd farmtally-frontend
    npm ci
    cd ..
else
    log_warn "Frontend directory not found, skipping frontend dependencies"
fi

# Step 3: Build Applications
log_info "Building backend application..."
if [ -f "package.json" ]; then
    npm run build 2>/dev/null || log_warn "No build script found for backend"
fi

log_info "Building frontend application..."
if [ -d "farmtally-frontend" ]; then
    cd farmtally-frontend
    npm run build
    cd ..
fi

# Step 4: Create Docker Images
log_info "Creating Docker images..."

# Backend Dockerfile
cat > Dockerfile.backend << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
EOF

# Frontend Dockerfile
cat > farmtally-frontend/Dockerfile << 'EOF'
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# Nginx configuration for frontend
cat > farmtally-frontend/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api {
            proxy_pass http://farmtally-backend:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
EOF

# Step 5: Build Docker Images
log_info "Building Docker images..."
docker build -t farmtally-backend:latest -f Dockerfile.backend .
docker build -t farmtally-frontend:latest farmtally-frontend/

# Step 6: Create Docker Compose
log_info "Creating Docker Compose configuration..."
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  farmtally-backend:
    image: farmtally-backend:latest
    container_name: farmtally-backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    restart: unless-stopped
    networks:
      - farmtally-network

  farmtally-frontend:
    image: farmtally-frontend:latest
    container_name: farmtally-frontend
    ports:
      - "80:80"
    depends_on:
      - farmtally-backend
    restart: unless-stopped
    networks:
      - farmtally-network

  farmtally-db:
    image: postgres:14-alpine
    container_name: farmtally-db
    environment:
      - POSTGRES_DB=farmtally
      - POSTGRES_USER=${DB_USER:-farmtally}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - farmtally-db-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - farmtally-network

volumes:
  farmtally-db-data:

networks:
  farmtally-network:
    driver: bridge
EOF

# Step 7: Deploy to VPS
log_info "Deploying to VPS..."

# Save images to tar files for transfer
docker save farmtally-backend:latest | gzip > farmtally-backend.tar.gz
docker save farmtally-frontend:latest | gzip > farmtally-frontend.tar.gz

# Create deployment package
tar -czf farmtally-deployment.tar.gz \
    docker-compose.yml \
    farmtally-backend.tar.gz \
    farmtally-frontend.tar.gz \
    scripts/

log_info "Deployment package created: farmtally-deployment.tar.gz"

# Step 8: Health Check
log_info "Performing health checks..."
./scripts/health-check.sh || log_warn "Health check script not found"

# Step 9: Cleanup
log_info "Cleaning up temporary files..."
rm -f Dockerfile.backend farmtally-frontend/Dockerfile farmtally-frontend/nginx.conf
rm -f farmtally-backend.tar.gz farmtally-frontend.tar.gz

log_info "✅ FarmTally deployment completed successfully!"
log_info "📊 Access Jenkins: $JENKINS_URL"
log_info "🐳 Access Docker: $DOCKER_URL"
log_info "🌐 Application will be available at: http://$VPS_HOST"

echo ""
echo "Next steps:"
echo "1. Upload farmtally-deployment.tar.gz to VPS"
echo "2. Extract and run: docker-compose up -d"
echo "3. Configure environment variables"
echo "4. Set up SSL certificates"
echo "5. Configure domain routing"