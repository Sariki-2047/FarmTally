#!/bin/bash

# FarmTally Simple Server Deployment
# Deploys the working simple server with critical fixes

echo "🚀 Deploying FarmTally Simple Server with Critical Fixes..."

# VPS Configuration
VPS_HOST="147.93.153.247"
VPS_USER="root"
VPS_PATH="/root/farmtally"

# Step 1: Test locally first
echo "🧪 Testing simple server locally..."
if ! node test-simple-server.js; then
    echo "❌ Local tests failed. Fix issues before deploying."
    exit 1
fi

echo "✅ Local tests passed!"

# Step 2: Create deployment package
echo "📦 Creating deployment package..."
mkdir -p deploy-temp
cp -r src deploy-temp/
cp package.json deploy-temp/
cp .env deploy-temp/
cp -r node_modules deploy-temp/ 2>/dev/null || echo "⚠️  node_modules not found, will install on VPS"

# Step 3: Deploy to VPS
echo "🔄 Deploying to VPS..."
rsync -avz --exclude '.git' --exclude 'dist' \
  deploy-temp/ ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/

# Step 4: Setup and start on VPS
echo "🔧 Setting up on VPS..."
ssh ${VPS_USER}@${VPS_HOST} << 'EOF'
cd /root/farmtally

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Stop existing server
pm2 stop farmtally-backend 2>/dev/null || echo "No existing server to stop"

# Start simple server
echo "🚀 Starting simple server..."
pm2 start src/server-simple.ts --name farmtally-backend --interpreter tsx

# Show status
pm2 status
pm2 logs farmtally-backend --lines 10
EOF

# Step 5: Test deployed server
echo "🧪 Testing deployed server..."
sleep 5

if curl -f http://147.93.153.247:3000/health > /dev/null 2>&1; then
    echo "✅ Deployed server is responding!"
else
    echo "❌ Deployed server is not responding"
    exit 1
fi

# Cleanup
rm -rf deploy-temp

echo "✅ Simple server deployment complete!"
echo ""
echo "🔍 Key fixes applied:"
echo "  ✓ API endpoints use /api/v1/ prefix"
echo "  ✓ Authentication status checks fixed"
echo "  ✓ Email templates have working links"
echo "  ✓ CORS configured for frontend"
echo ""
echo "🌐 Test URLs:"
echo "  Health: http://147.93.153.247:3000/health"
echo "  API Test: http://147.93.153.247:3000/api/v1/test"
echo "  Login: POST http://147.93.153.247:3000/api/v1/auth/login"
echo ""
echo "📋 Next steps:"
echo "  1. Update frontend NEXT_PUBLIC_API_URL to: http://147.93.153.247:3000"
echo "  2. Test frontend login with: admin@farmtally.com / Admin123!"
echo "  3. Gradually add back complex features"