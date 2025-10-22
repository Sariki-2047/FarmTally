const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 DEPLOYING FARMTALLY FRONTEND TO VPS');
console.log('=====================================');

const config = {
    vpsIP: '147.93.153.247',
    frontendDir: './farmtally-frontend',
    deployPath: '/var/www/farmtally',
    nginxConfig: '/etc/nginx/sites-available/farmtally'
};

function runCommand(command, description) {
    console.log(`\n📋 ${description}...`);
    try {
        const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
        console.log(`✅ ${description} completed`);
        return output;
    } catch (error) {
        console.log(`❌ ${description} failed:`, error.message);
        throw error;
    }
}

function createNginxConfig() {
    const nginxConfig = `
server {
    listen 80;
    server_name ${config.vpsIP};
    
    # Frontend static files
    location / {
        root ${config.deployPath};
        try_files $uri $uri/ /index.html;
        
        # Enable gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    }
    
    # API Gateway proxy
    location /api/ {
        proxy_pass http://localhost:8090/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
    }
    
    # Auth Service proxy
    location /auth/ {
        proxy_pass http://localhost:8081/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
    }
    
    # Field Manager Service proxy
    location /field-manager/ {
        proxy_pass http://localhost:8088/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Farm Admin Service proxy
    location /farm-admin/ {
        proxy_pass http://localhost:8089/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}`;
    
    fs.writeFileSync('nginx-farmtally.conf', nginxConfig);
    console.log('✅ Nginx configuration created');
}

function deployFrontend() {
    console.log('\n🎯 STARTING FRONTEND DEPLOYMENT');
    console.log('================================');
    
    try {
        // Step 1: Build frontend
        console.log('\n1️⃣ Building Frontend...');
        process.chdir(config.frontendDir);
        runCommand('npm run build', 'Frontend build');
        
        // Step 2: Create deployment package
        console.log('\n2️⃣ Creating Deployment Package...');
        if (!fs.existsSync('out')) {
            runCommand('npx next export', 'Static export');
        }
        
        // Step 3: Create Nginx config
        process.chdir('..');
        createNginxConfig();
        
        // Step 4: Create deployment script
        const deployScript = `#!/bin/bash
echo "🚀 Deploying FarmTally Frontend..."

# Create web directory
mkdir -p ${config.deployPath}

# Copy frontend files
echo "📁 Copying frontend files..."
cp -r farmtally-frontend/out/* ${config.deployPath}/

# Set permissions
chown -R www-data:www-data ${config.deployPath}
chmod -R 755 ${config.deployPath}

# Configure Nginx
echo "🔧 Configuring Nginx..."
cp nginx-farmtally.conf ${config.nginxConfig}
ln -sf ${config.nginxConfig} /etc/nginx/sites-enabled/farmtally

# Remove default site if exists
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx

echo "✅ Frontend deployment completed!"
echo "🌐 Access your FarmTally app at: http://${config.vpsIP}"
echo "🧪 Test API at: http://${config.vpsIP}/test-api"
`;
        
        fs.writeFileSync('deploy-to-vps.sh', deployScript);
        runCommand('chmod +x deploy-to-vps.sh', 'Make deploy script executable');
        
        console.log('\n📦 DEPLOYMENT PACKAGE READY');
        console.log('============================');
        console.log('✅ Frontend built successfully');
        console.log('✅ Nginx configuration created');
        console.log('✅ Deployment script ready');
        
        console.log('\n🚀 NEXT STEPS:');
        console.log('==============');
        console.log('1. Upload files to VPS:');
        console.log(`   scp -r farmtally-frontend/out nginx-farmtally.conf deploy-to-vps.sh root@${config.vpsIP}:/root/`);
        console.log('');
        console.log('2. SSH to VPS and run:');
        console.log(`   ssh root@${config.vpsIP}`);
        console.log('   cd /root && ./deploy-to-vps.sh');
        console.log('');
        console.log('3. Access your app:');
        console.log(`   http://${config.vpsIP}`);
        
        return true;
        
    } catch (error) {
        console.log('\n❌ DEPLOYMENT FAILED');
        console.log('===================');
        console.log('Error:', error.message);
        return false;
    }
}

// Run deployment
deployFrontend();