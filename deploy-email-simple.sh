#!/bin/bash

# Simple Email Backend Deployment to VPS
set -e

echo "🚀 Deploying FarmTally Email Backend"
echo "===================================="

VPS_HOST="147.93.153.247"
VPS_USER="root"
VPS_PATH="/var/www/farmtally/backend"

# Colors
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

# 1. Create backend directory
print_info "Creating backend directory..."
ssh $VPS_USER@$VPS_HOST "mkdir -p $VPS_PATH"
print_status "Backend directory created"

# 2. Upload files
print_info "Uploading backend files..."
scp simple-supabase-backend.cjs $VPS_USER@$VPS_HOST:$VPS_PATH/
scp package.json $VPS_USER@$VPS_HOST:$VPS_PATH/
print_status "Files uploaded"

# 3. Install dependencies
print_info "Installing dependencies..."
ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && npm install"
print_status "Dependencies installed"

# 4. Stop existing backend
print_info "Stopping existing backend..."
ssh $VPS_USER@$VPS_HOST "pkill -f 'node.*simple-supabase-backend' || true"
print_status "Existing backend stopped"

# 5. Start new backend
print_info "Starting email-enabled backend..."
ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && nohup node simple-supabase-backend.cjs > backend.log 2>&1 &"
print_status "Backend started"

# 6. Wait and test
print_info "Waiting for backend to start..."
sleep 5

print_info "Testing backend..."
if curl -f http://$VPS_HOST:3001/health > /dev/null 2>&1; then
    print_status "✅ Backend health check passed"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
fi

if curl -f http://$VPS_HOST:3001/api/email/status > /dev/null 2>&1; then
    print_status "✅ Email API is working"
else
    echo -e "${RED}❌ Email API check failed${NC}"
fi

echo ""
print_status "🎉 Email Backend Deployment Complete!"
echo ""
print_info "📋 Backend Details:"
echo "  🌐 Backend URL: http://$VPS_HOST:3001"
echo "  📊 Health Check: http://$VPS_HOST:3001/health"
echo "  📧 Email Status: http://$VPS_HOST:3001/api/email/status"
echo ""
print_info "📧 Email Features Active:"
echo "  ✅ User registration notifications"
echo "  ✅ User approval emails"
echo "  ✅ Hostinger SMTP integration"
echo "  ✅ Professional email templates"
echo ""
print_info "🔧 To check backend logs:"
echo "  ssh $VPS_USER@$VPS_HOST 'cd $VPS_PATH && tail -f backend.log'"