#!/bin/bash
echo "🚀 Deploying FarmTally Frontend (Safe Subdirectory Mode)..."

# Create FarmTally web directory (won't affect other projects)
mkdir -p /var/www/farmtally

# Copy frontend files
echo "📁 Copying frontend files to /var/www/farmtally/..."
cp -r /root/farmtally-frontend-build/* /var/www/farmtally/

# Set permissions
chown -R www-data:www-data /var/www/farmtally
chmod -R 755 /var/www/farmtally

# Configure Nginx (add to existing configuration, don't replace)
echo "🔧 Adding FarmTally configuration to Nginx..."

# Check if farmtally config already exists
if [ -f /etc/nginx/sites-available/farmtally ]; then
    echo "⚠️  FarmTally config already exists, backing up..."
    cp /etc/nginx/sites-available/farmtally /etc/nginx/sites-available/farmtally.backup.$(date +%Y%m%d_%H%M%S)
fi

# Copy new configuration
cp /root/nginx-farmtally-subdirectory.conf /etc/nginx/sites-available/farmtally

# Enable FarmTally site (won't affect existing sites)
ln -sf /etc/nginx/sites-available/farmtally /etc/nginx/sites-enabled/farmtally

# Test Nginx configuration before applying
echo "🧪 Testing Nginx configuration..."
if nginx -t; then
    echo "✅ Nginx configuration is valid"
    
    # Reload Nginx (safer than restart)
    echo "🔄 Reloading Nginx..."
    systemctl reload nginx
    
    echo "✅ FarmTally deployment completed!"
    echo ""
    echo "🌐 Access your FarmTally app at:"
    echo "   Main App: http://147.93.153.247/farmtally/"
    echo "   API Test: http://147.93.153.247/farmtally/test-api"
    echo ""
    echo "📋 Your existing projects are unaffected:"
    echo "   Root site: http://147.93.153.247/ (unchanged)"
    echo "   Other paths: All existing configurations preserved"
    
else
    echo "❌ Nginx configuration test failed!"
    echo "Please check the configuration manually."
    exit 1
fi