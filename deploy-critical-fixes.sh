#!/bin/bash

# FarmTally Critical Fixes Deployment Script
# This script deploys the critical API and authentication fixes

echo "🚀 Deploying FarmTally Critical Fixes..."

# VPS Configuration
VPS_HOST="147.93.153.247"
VPS_USER="root"
VPS_PATH="/root/farmtally"

echo "📦 Building backend..."
npm run build

echo "🔄 Deploying to VPS..."
rsync -avz --exclude 'node_modules' --exclude '.git' \
  ./ ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/

echo "🔧 Installing dependencies and restarting services on VPS..."
ssh ${VPS_USER}@${VPS_HOST} << 'EOF'
cd /root/farmtally

# Install/update dependencies
npm install

# Build the project
npm run build

# Restart the backend service
pm2 restart farmtally-backend || pm2 start dist/server.js --name farmtally-backend

# Show status
pm2 status
pm2 logs farmtally-backend --lines 10
EOF

echo "✅ Critical fixes deployed successfully!"
echo ""
echo "🔍 Key fixes applied:"
echo "  ✓ Fixed API base URL mismatch (/api prefix)"
echo "  ✓ Fixed authentication status check (APPROVED vs ACTIVE)"
echo "  ✓ Fixed admin dashboard endpoint"
echo "  ✓ Fixed email template placeholder links"
echo "  ✓ Added invitation email sending"
echo ""
echo "🌐 Frontend URL: https://app.farmtally.in"
echo "🔗 Backend URL: http://147.93.153.247:3001"
echo ""
echo "📋 Next steps:"
echo "  1. Test farm admin login and CRUD operations"
echo "  2. Test field manager invitation flow"
echo "  3. Verify email delivery"
echo "  4. Check admin dashboard functionality"