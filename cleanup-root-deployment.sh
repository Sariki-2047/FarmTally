#!/bin/bash
echo "🧹 Cleaning up FarmTally root deployment..."

# First, let's check what's currently deployed
echo "📋 Checking current deployment status..."

# Check if FarmTally was deployed to root
if [ -d "/var/www/farmtally" ]; then
    echo "✅ Found FarmTally in /var/www/farmtally (good, already in subdirectory)"
    FARMTALLY_IN_SUBDIR=true
else
    FARMTALLY_IN_SUBDIR=false
fi

# Check if there's a root deployment that might be FarmTally
if [ -f "/var/www/html/index.html" ] || [ -f "/var/www/html/_next/static" ]; then
    echo "⚠️  Found potential FarmTally files in web root"
    
    # Backup existing root content first
    echo "💾 Creating backup of current web root..."
    mkdir -p /root/web-root-backup-$(date +%Y%m%d_%H%M%S)
    cp -r /var/www/html/* /root/web-root-backup-$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true
    
    echo "📋 Contents of /var/www/html:"
    ls -la /var/www/html/
    
    echo ""
    echo "❓ Do you want to remove FarmTally files from the web root? (y/n)"
    read -r REMOVE_ROOT
    
    if [ "$REMOVE_ROOT" = "y" ] || [ "$REMOVE_ROOT" = "Y" ]; then
        echo "🗑️  Removing FarmTally files from web root..."
        
        # Remove Next.js specific files/folders (FarmTally indicators)
        rm -rf /var/www/html/_next 2>/dev/null || true
        rm -rf /var/www/html/static 2>/dev/null || true
        rm -f /var/www/html/favicon.ico 2>/dev/null || true
        
        # Remove FarmTally specific files
        find /var/www/html -name "*.js" -delete 2>/dev/null || true
        find /var/www/html -name "*.css" -delete 2>/dev/null || true
        find /var/www/html -name "*.html" -delete 2>/dev/null || true
        
        echo "✅ FarmTally files removed from web root"
    else
        echo "⏭️  Skipping root cleanup"
    fi
fi

# Check and clean up Nginx configuration
echo "🔧 Checking Nginx configuration..."

# Remove the root-taking FarmTally configuration if it exists
if [ -f "/etc/nginx/sites-enabled/farmtally" ]; then
    echo "🗑️  Removing old FarmTally Nginx configuration..."
    rm -f /etc/nginx/sites-enabled/farmtally
fi

if [ -f "/etc/nginx/sites-available/farmtally" ]; then
    echo "💾 Backing up old FarmTally Nginx config..."
    mv /etc/nginx/sites-available/farmtally /etc/nginx/sites-available/farmtally.old.$(date +%Y%m%d_%H%M%S)
fi

# Restore default site if it was removed
if [ ! -f "/etc/nginx/sites-enabled/default" ] && [ -f "/etc/nginx/sites-available/default" ]; then
    echo "🔄 Restoring default Nginx site..."
    ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default
fi

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
if nginx -t; then
    echo "✅ Nginx configuration is valid"
    systemctl reload nginx
    echo "🔄 Nginx reloaded"
else
    echo "❌ Nginx configuration has issues"
    echo "Please check manually: nginx -t"
fi

echo ""
echo "✅ Cleanup completed!"
echo ""
echo "📋 Summary:"
echo "- Web root cleaned of FarmTally files"
echo "- Old FarmTally Nginx config removed"
echo "- Default site restored (if needed)"
echo "- Backups created in /root/"
echo ""
echo "🎯 Next step: Run the safe subdirectory deployment"
echo "   ./deploy-to-vps-safe.sh"