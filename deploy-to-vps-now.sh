#!/bin/bash

# Quick FarmTally VPS Deployment Script
# Run this locally to deploy to VPS: 147.93.153.247

set -e

VPS_HOST="147.93.153.247"
VPS_USER="root"  # Change if using different user
PROJECT_NAME="farmtally"

echo "🚀 Quick deploying FarmTally to VPS: $VPS_HOST"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if SSH key exists or prompt for password
check_ssh() {
    log_info "Testing SSH connection to $VPS_HOST..."
    if ssh -o ConnectTimeout=5 -o BatchMode=yes $VPS_USER@$VPS_HOST exit 2>/dev/null; then
        log_info "SSH key authentication successful"
        return 0
    else
        log_warn "SSH key not found, will prompt for password"
        return 1
    fi
}

# Step 1: Test connection
if ! check_ssh; then
    log_info "You'll be prompted for the VPS password during deployment"
fi

# Step 2: Create deployment package
log_info "Creating deployment package..."
tar -czf farmtally-deploy.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=farmtally-frontend/node_modules \
    --exclude=farmtally-frontend/.next \
    --exclude=farmtally-frontend/dist \
    .

# Step 3: Upload to VPS
log_info "Uploading to VPS..."
scp farmtally-deploy.tar.gz $VPS_USER@$VPS_HOST:/tmp/

# Step 4: Execute deployment on VPS
log_info "Executing deployment on VPS..."
ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
set -e

echo "📦 Setting up FarmTally on VPS..."

# Create project directory
mkdir -p /opt/farmtally
cd /opt/farmtally

# Extract deployment package
tar -xzf /tmp/farmtally-deploy.tar.gz
rm /tmp/farmtally-deploy.tar.gz

# Make scripts executable
chmod +x scripts/*.sh

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Create environment file
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://farmtally:farmtally123@localhost:5432/farmtally
JWT_SECRET=farmtally_jwt_secret_key_2024
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://147.93.153.247:3000
NEXT_PUBLIC_APP_URL=http://147.93.153.247
CORS_ORIGIN=http://147.93.153.247
EOF

# Install dependencies
echo "Installing dependencies..."
npm install --production

if [ -d "farmtally-frontend" ]; then
    cd farmtally-frontend
    npm install
    npm run build
    cd ..
fi

# Create Docker Compose file
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  farmtally-db:
    image: postgres:14-alpine
    container_name: farmtally-db
    environment:
      POSTGRES_DB: farmtally
      POSTGRES_USER: farmtally
      POSTGRES_PASSWORD: farmtally123
    volumes:
      - farmtally_db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  farmtally-backend:
    build: .
    container_name: farmtally-backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://farmtally:farmtally123@farmtally-db:5432/farmtally
      - JWT_SECRET=farmtally_jwt_secret_key_2024
    depends_on:
      - farmtally-db
    restart: unless-stopped

  farmtally-frontend:
    image: nginx:alpine
    container_name: farmtally-frontend
    ports:
      - "80:80"
    volumes:
      - ./farmtally-frontend/dist:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - farmtally-backend
    restart: unless-stopped

volumes:
  farmtally_db_data:
EOF

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"]
EOF

# Create Nginx config
cat > nginx.conf << 'EOF'
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
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        location /health {
            proxy_pass http://farmtally-backend:3000/health;
        }
    }
}
EOF

# Start services
echo "Starting FarmTally services..."
docker-compose up -d --build

# Wait for services to start
sleep 30

# Check status
echo "Checking service status..."
docker-compose ps

echo "✅ FarmTally deployment completed!"
echo "🌐 Application: http://147.93.153.247"
echo "🔧 Jenkins: http://147.93.153.247:8080"
echo "🐳 Docker: http://147.93.153.247:9000"

ENDSSH

# Step 5: Cleanup local files
log_info "Cleaning up local files..."
rm farmtally-deploy.tar.gz

# Step 6: Test deployment
log_info "Testing deployment..."
sleep 5
if curl -f http://$VPS_HOST/health 2>/dev/null; then
    log_info "✅ Deployment successful! Application is running."
else
    log_warn "⚠️  Application may still be starting. Check in a few minutes."
fi

echo ""
echo "🎉 FarmTally deployment completed!"
echo ""
echo "Access your application:"
echo "🌐 Frontend: http://$VPS_HOST"
echo "🔧 Jenkins: http://$VPS_HOST:8080"
echo "🐳 Docker: http://$VPS_HOST:9000"
echo ""
echo "To check status:"
echo "ssh $VPS_USER@$VPS_HOST 'cd /opt/farmtally && docker-compose ps'"
echo ""
echo "To view logs:"
echo "ssh $VPS_USER@$VPS_HOST 'cd /opt/farmtally && docker-compose logs -f'"