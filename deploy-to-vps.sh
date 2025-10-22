#!/bin/bash
echo "🚀 Deploying FarmTally Frontend..."

# Create web directory
mkdir -p /var/www/farmtally

# Copy frontend files
echo "📁 Copying frontend files..."
cp -r farmtally-frontend/out/* /var/www/farmtally/

# Set permissions
chown -R www-data:www-data /var/www/farmtally
chmod -R 755 /var/www/farmtally

# Configure Nginx
echo "🔧 Configuring Nginx..."
cp nginx-farmtally.conf /etc/nginx/sites-available/farmtally
ln -sf /etc/nginx/sites-available/farmtally /etc/nginx/sites-enabled/farmtally

# Remove default site if exists
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx

echo "✅ Frontend deployment completed!"
echo "🌐 Access your FarmTally app at: http://147.93.153.247"
echo "🧪 Test API at: http://147.93.153.247/test-api"
