#!/usr/bin/env node

/**
 * FarmTally Production Email Setup Script
 * 
 * This script helps configure email settings for production deployment.
 * Run with: node setup-email-production.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEmailConfiguration() {
  log('\n' + '='.repeat(60), colors.bold);
  log('🌾 FarmTally Production Email Setup', colors.bold);
  log('='.repeat(60), colors.bold);

  log('\nThis script will help you configure email settings for production deployment.', colors.blue);
  log('You can choose from popular email providers or configure custom SMTP settings.\n');

  // Choose email provider
  log('Available Email Providers:', colors.bold);
  log('1. Gmail (Recommended for small-medium scale)');
  log('2. SendGrid (Recommended for production)');
  log('3. Outlook/Hotmail');
  log('4. Yahoo Mail');
  log('5. Custom SMTP Server');

  const providerChoice = await question('\nSelect email provider (1-5): ');
  
  let config = {};

  switch (providerChoice) {
    case '1':
      config = await setupGmail();
      break;
    case '2':
      config = await setupSendGrid();
      break;
    case '3':
      config = await setupOutlook();
      break;
    case '4':
      config = await setupYahoo();
      break;
    case '5':
      config = await setupCustomSMTP();
      break;
    default:
      log('Invalid choice. Defaulting to Gmail setup.', colors.yellow);
      config = await setupGmail();
  }

  // Common settings
  config.SMTP_FROM_NAME = await question('From Name (e.g., "FarmTally"): ') || 'FarmTally';
  config.EMAIL_NOTIFICATIONS_ENABLED = 'true';
  config.EMAIL_QUEUE_ENABLED = 'true';

  // Generate .env content
  const envContent = generateEnvContent(config);
  
  log('\n' + '='.repeat(60), colors.bold);
  log('📝 Generated Email Configuration', colors.bold);
  log('='.repeat(60), colors.bold);
  
  console.log(envContent);
  
  const saveToFile = await question('\nSave this configuration to .env.email file? (y/n): ');
  
  if (saveToFile.toLowerCase() === 'y' || saveToFile.toLowerCase() === 'yes') {
    fs.writeFileSync('.env.email', envContent);
    log('\n✅ Configuration saved to .env.email', colors.green);
    log('📋 Next steps:', colors.bold);
    log('1. Copy the content to your production .env file');
    log('2. Test the configuration: npm run test:email');
    log('3. Deploy to production');
    log('4. Verify email notifications are working');
  }

  log('\n🎉 Email setup complete!', colors.green);
  rl.close();
}

async function setupGmail() {
  log('\n📧 Gmail Configuration', colors.bold);
  log('Note: You need to enable 2FA and generate an App Password for Gmail.', colors.yellow);
  log('Guide: https://support.google.com/accounts/answer/185833\n');

  const email = await question('Gmail address: ');
  const password = await question('App Password (not your regular password): ');

  return {
    SMTP_HOST: 'smtp.gmail.com',
    SMTP_PORT: '587',
    SMTP_SECURE: 'false',
    SMTP_USER: email,
    SMTP_PASS: password,
    SMTP_FROM_EMAIL: email
  };
}

async function setupSendGrid() {
  log('\n📧 SendGrid Configuration', colors.bold);
  log('Note: You need a SendGrid account and API key.', colors.yellow);
  log('Sign up at: https://sendgrid.com\n');

  const apiKey = await question('SendGrid API Key: ');
  const fromEmail = await question('From Email (verified in SendGrid): ');

  return {
    SMTP_HOST: 'smtp.sendgrid.net',
    SMTP_PORT: '587',
    SMTP_SECURE: 'false',
    SMTP_USER: 'apikey',
    SMTP_PASS: apiKey,
    SMTP_FROM_EMAIL: fromEmail
  };
}

async function setupOutlook() {
  log('\n📧 Outlook/Hotmail Configuration', colors.bold);

  const email = await question('Outlook/Hotmail address: ');
  const password = await question('Password: ');

  return {
    SMTP_HOST: 'smtp-mail.outlook.com',
    SMTP_PORT: '587',
    SMTP_SECURE: 'false',
    SMTP_USER: email,
    SMTP_PASS: password,
    SMTP_FROM_EMAIL: email
  };
}

async function setupYahoo() {
  log('\n📧 Yahoo Mail Configuration', colors.bold);
  log('Note: You may need to enable "Less secure app access" or use App Password.', colors.yellow);

  const email = await question('Yahoo email address: ');
  const password = await question('Password or App Password: ');

  return {
    SMTP_HOST: 'smtp.mail.yahoo.com',
    SMTP_PORT: '587',
    SMTP_SECURE: 'false',
    SMTP_USER: email,
    SMTP_PASS: password,
    SMTP_FROM_EMAIL: email
  };
}

async function setupCustomSMTP() {
  log('\n📧 Custom SMTP Configuration', colors.bold);

  const host = await question('SMTP Host: ');
  const port = await question('SMTP Port (usually 587 or 465): ');
  const secure = await question('Use SSL/TLS? (y/n): ');
  const user = await question('SMTP Username: ');
  const pass = await question('SMTP Password: ');
  const fromEmail = await question('From Email Address: ');

  return {
    SMTP_HOST: host,
    SMTP_PORT: port,
    SMTP_SECURE: secure.toLowerCase() === 'y' ? 'true' : 'false',
    SMTP_USER: user,
    SMTP_PASS: pass,
    SMTP_FROM_EMAIL: fromEmail
  };
}

function generateEnvContent(config) {
  return `# FarmTally Email Configuration
# Generated on ${new Date().toISOString()}

# Email Configuration
SMTP_HOST=${config.SMTP_HOST}
SMTP_PORT=${config.SMTP_PORT}
SMTP_SECURE=${config.SMTP_SECURE}
SMTP_USER=${config.SMTP_USER}
SMTP_PASS=${config.SMTP_PASS}
SMTP_FROM_NAME=${config.SMTP_FROM_NAME}
SMTP_FROM_EMAIL=${config.SMTP_FROM_EMAIL}

# Email Features
EMAIL_NOTIFICATIONS_ENABLED=${config.EMAIL_NOTIFICATIONS_ENABLED}
EMAIL_QUEUE_ENABLED=${config.EMAIL_QUEUE_ENABLED}

# Add these lines to your existing .env file
# Make sure to keep your existing DATABASE_URL, JWT_SECRET, etc.
`;
}

// Handle process termination
process.on('SIGINT', () => {
  log('\n\n👋 Setup cancelled by user.', colors.yellow);
  rl.close();
  process.exit(0);
});

// Run the setup
if (require.main === module) {
  setupEmailConfiguration().catch((error) => {
    log(`\n❌ Setup failed: ${error.message}`, colors.red);
    rl.close();
    process.exit(1);
  });
}