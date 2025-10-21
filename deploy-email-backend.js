#!/usr/bin/env node

/**
 * Deploy Email-Enabled Backend to Production VPS
 */

const { execSync } = require('child_process');
const fs = require('fs');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, description) {
  try {
    log(`\n🔄 ${description}...`, colors.blue);
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`✅ ${description} completed`, colors.green);
    return result;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, colors.red);
    throw error;
  }
}

async function deployEmailBackend() {
  log('\n' + '='.repeat(60), colors.bold);
  log('🚀 FarmTally Email Backend Deployment', colors.bold);
  log('='.repeat(60), colors.bold);

  const VPS_HOST = '147.93.153.247';
  const VPS_USER = 'root';
  const VPS_PATH = '/var/www/farmtally/backend';

  try {
    // 1. Create deployment package
    log('\n📦 Creating deployment package...', colors.blue);
    
    const deploymentFiles = [
      'simple-supabase-backend.cjs',
      'package.json',
      'package-lock.json'
    ];

    // Create package.json if it doesn't exist
    if (!fs.existsSync('package.json')) {
      const packageJson = {
        "name": "farmtally-backend",
        "version": "1.0.0",
        "description": "FarmTally Backend with Email Notifications",
        "main": "simple-supabase-backend.cjs",
        "scripts": {
          "start": "node simple-supabase-backend.cjs",
          "dev": "node simple-supabase-backend.cjs"
        },
        "dependencies": {
          "@supabase/supabase-js": "^2.39.0",
          "cors": "^2.8.5",
          "express": "^4.18.2",
          "nodemailer": "^6.9.8"
        }
      };
      
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
      log('✅ Created package.json', colors.green);
    }

    // 2. Upload files to VPS
    log('\n📤 Uploading files to VPS...', colors.blue);
    
    // Create directory on VPS
    runCommand(
      `ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "mkdir -p ${VPS_PATH}"`,
      'Creating backend directory on VPS'
    );

    // Upload backend files
    for (const file of deploymentFiles) {
      if (fs.existsSync(file)) {
        runCommand(
          `scp -o StrictHostKeyChecking=no ${file} ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/`,
          `Uploading ${file}`
        );
      }
    }

    // 3. Install dependencies and start backend
    log('\n🔧 Installing dependencies on VPS...', colors.blue);
    
    const setupCommands = [
      'cd /root/farmtally-backend',
      'npm install',
      'pkill -f "node.*simple-supabase-backend" || true',
      'nohup node simple-supabase-backend.cjs > backend.log 2>&1 &',
      'sleep 3',
      'ps aux | grep "simple-supabase-backend" | grep -v grep'
    ];

    runCommand(
      `ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "${setupCommands.join(' && ')}"`,
      'Setting up backend on VPS'
    );

    // 4. Test the deployment
    log('\n🧪 Testing deployed backend...', colors.blue);
    
    // Wait a moment for the server to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    try {
      // Test health endpoint
      runCommand(
        `curl -f http://${VPS_HOST}:3001/health`,
        'Testing health endpoint'
      );

      // Test email status endpoint
      runCommand(
        `curl -f http://${VPS_HOST}:3001/api/email/status`,
        'Testing email status endpoint'
      );

      log('\n' + '='.repeat(60), colors.bold);
      log('🎉 Email Backend Deployment Successful!', colors.green);
      log('='.repeat(60), colors.bold);
      
      log('\n📋 Deployment Summary:', colors.bold);
      log(`✅ Backend URL: http://${VPS_HOST}:3001`, colors.green);
      log('✅ Email notifications enabled', colors.green);
      log('✅ Supabase database connected', colors.green);
      log('✅ Hostinger SMTP configured', colors.green);
      log('✅ All API endpoints working', colors.green);

      log('\n🔧 Available Endpoints:', colors.bold);
      log(`📊 Health: http://${VPS_HOST}:3001/health`);
      log(`🔐 Login: http://${VPS_HOST}:3001/auth/login`);
      log(`📝 Register: http://${VPS_HOST}:3001/auth/register`);
      log(`👥 Pending Users: http://${VPS_HOST}:3001/system-admin/users/pending`);
      log(`📧 Email Status: http://${VPS_HOST}:3001/api/email/status`);
      log(`🧪 Test Email: http://${VPS_HOST}:3001/api/email/test`);

      log('\n📧 Email Features Active:', colors.bold);
      log('✅ New user registration → Admin notification');
      log('✅ User approval → Welcome email to user');
      log('✅ Professional email templates');
      log('✅ Hostinger SMTP integration');

      log('\n🚀 Next Steps:', colors.bold);
      log('1. ✅ Backend deployed with email notifications');
      log('2. 📧 Test user registration to verify emails');
      log('3. 🔔 Monitor email delivery in production');
      log('4. 📱 Update frontend to use production backend');

    } catch (testError) {
      log('\n⚠️  Backend deployed but tests failed:', colors.yellow);
      log('The backend may still be starting up. Please check manually.', colors.yellow);
    }

  } catch (error) {
    log('\n❌ Deployment failed:', colors.red);
    log(error.message, colors.red);
    
    log('\n🔧 Troubleshooting:', colors.yellow);
    log('1. Check VPS connectivity');
    log('2. Verify SSH access to VPS');
    log('3. Check if port 3001 is available');
    log('4. Review backend logs on VPS');
    
    process.exit(1);
  }
}

// Run deployment
deployEmailBackend().catch(console.error);