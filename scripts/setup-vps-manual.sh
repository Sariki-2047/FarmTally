#!/bin/bash

# Manual VPS Setup Script for FarmTally
# Run this on the VPS: 147.93.153.247

set -e

echo "🔧 Setting up FarmTally on VPS..."

# Configuration
VPS_HOST="147.93.153.247"
PROJECT_DIR="/opt/farmtally"
USER="farmtally"

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

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run as root (use sudo)"
    exit 1
fi

# Step 1: Update system
log_info "Updating system packages..."
apt update && apt upgrade -y

# Step 2: Install required packages
log_info "Installing required packages..."
apt install -y \
    curl \
    wget \
    git \
    nginx \
    certbot \
    python3-certbot-nginx \
    ufw \
    htop \
    unzip

# Step 3: Install Node.js
log_info "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Step 4: Install Docker (if not already installed)
if ! command -v docker &> /dev/null; then
    log_info "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    
    # Install Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    log_info "Docker already installed"
fi

# Step 5: Create project user
log_info "Creating farmtally user..."
if ! id "$USER" &>/dev/null; then
    useradd -m -s /bin/bash $USER
    usermod -aG docker $USER
    usermod -aG sudo $USER
fi

# Step 6: Create project directory
log_info "Creating project directory..."
mkdir -p $PROJECT_DIR
chown $USER:$USER $PROJECT_DIR

# Step 7: Clone repository
log_info "Cloning FarmTally repository..."
cd $PROJECT_DIR
if [ ! -d ".git" ]; then
    sudo -u $USER git clone https://github.com/Sariki-2047/FarmTally.git .
else
    sudo -u $USER git pull origin main
fi

# Step 8: Set up environment file
log_info "Creating environment configuration..."
cat > $PROJECT_DIR/.env << 'EOF'
# FarmTally Production Environment
NODE_ENV=production
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://farmtally:your_password@localhost:5432/farmtally
DB_USER=farmtally
DB_PASSWORD=your_secure_password
DB_NAME=farmtally

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Supabase Configuration (if using)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Email Configuration
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=your_email@yourdomain.com
SMTP_PASS=your_email_password

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://147.93.153.247:3000
NEXT_PUBLIC_APP_URL=http://147.93.153.247

# Security
CORS_ORIGIN=http://147.93.153.247
ALLOWED_ORIGINS=http://147.93.153.247,http://localhost:3000
EOF

chown $USER:$USER $PROJECT_DIR/.env
chmod 600 $PROJECT_DIR/.env

# Step 9: Install dependencies
log_info "Installing project dependencies..."
cd $PROJECT_DIR
sudo -u $USER npm install

if [ -d "farmtally-frontend" ]; then
    cd farmtally-frontend
    sudo -u $USER npm install
    cd ..
fi

# Step 10: Build applications
log_info "Building applications..."
sudo -u $USER npm run build 2>/dev/null || log_warn "No build script found"

if [ -d "farmtally-frontend" ]; then
    cd farmtally-frontend
    sudo -u $USER npm run build
    cd ..
fi

# Step 11: Set up systemd services
log_info "Creating systemd services..."

# Backend service
cat > /etc/systemd/system/farmtally-backend.service << EOF
[Unit]
Description=FarmTally Backend Service
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR
Environment=NODE_ENV=production
EnvironmentFile=$PROJECT_DIR/.env
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Step 12: Configure Nginx
log_info "Configuring Nginx..."
cat > /etc/nginx/sites-available/farmtally << 'EOF'
server {
    listen 80;
    server_name 147.93.153.247;

    # Frontend
    location / {
        root /opt/farmtally/farmtally-frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/health;
        proxy_set_header Host $host;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/farmtally /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Step 13: Configure firewall
log_info "Configuring firewall..."
ufw --force enable
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 8080/tcp  # Jenkins
ufw allow 9000/tcp  # Portainer

# Step 14: Start services
log_info "Starting services..."
systemctl daemon-reload
systemctl enable farmtally-backend
systemctl start farmtally-backend
systemctl enable nginx
systemctl restart nginx

# Step 15: Create deployment script
log_info "Creating deployment script..."
cat > $PROJECT_DIR/deploy.sh << 'EOF'
#!/bin/bash
cd /opt/farmtally
git pull origin main
npm install
npm run build 2>/dev/null || echo "No build script"
if [ -d "farmtally-frontend" ]; then
    cd farmtally-frontend
    npm install
    npm run build
    cd ..
fi
systemctl restart farmtally-backend
systemctl reload nginx
echo "Deployment completed!"
EOF

chmod +x $PROJECT_DIR/deploy.sh
chown $USER:$USER $PROJECT_DIR/deploy.sh

# Step 16: Final status check
log_info "Checking service status..."
systemctl status farmtally-backend --no-pager
systemctl status nginx --no-pager

log_info "✅ FarmTally VPS setup completed!"
echo ""
echo "🌐 Application URL: http://147.93.153.247"
echo "🔧 Jenkins: http://147.93.153.247:8080"
echo "🐳 Docker: http://147.93.153.247:9000"
echo ""
echo "Next steps:"
echo "1. Update environment variables in $PROJECT_DIR/.env"
echo "2. Set up SSL certificate: certbot --nginx -d yourdomain.com"
echo "3. Configure Jenkins job with the repository"
echo "4. Test the application"
echo ""
echo "To deploy updates: sudo -u $USER $PROJECT_DIR/deploy.sh"