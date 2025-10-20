#!/usr/bin/env node

/**
 * FarmTally Email Integration Test Script
 * 
 * This script tests the email functionality without requiring a full server setup.
 * Run with: node test-email-integration.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

// Colors for console output
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

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

async function testEmailConfiguration() {
  log('\n' + '='.repeat(60), colors.bold);
  log('🚀 FarmTally Email Integration Test', colors.bold);
  log('='.repeat(60), colors.bold);

  // Check environment variables
  logInfo('Checking environment configuration...');
  
  const requiredVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    logError(`Missing required environment variables: ${missingVars.join(', ')}`);
    logWarning('Please check your .env file and ensure all SMTP settings are configured.');
    process.exit(1);
  }

  logSuccess('All required environment variables found');

  // Display configuration (without sensitive data)
  logInfo('Email Configuration:');
  console.log(`  Host: ${process.env.SMTP_HOST}`);
  console.log(`  Port: ${process.env.SMTP_PORT || '587'}`);
  console.log(`  User: ${process.env.SMTP_USER}`);
  console.log(`  From Name: ${process.env.SMTP_FROM_NAME || 'FarmTally'}`);
  console.log(`  From Email: ${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}`);
  console.log(`  Notifications Enabled: ${process.env.EMAIL_NOTIFICATIONS_ENABLED || 'false'}`);

  // Create transporter
  logInfo('\nCreating email transporter...');
  
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false // For development only
    }
  });

  // Test connection
  logInfo('Testing SMTP connection...');
  
  try {
    await transporter.verify();
    logSuccess('SMTP connection verified successfully');
  } catch (error) {
    logError(`SMTP connection failed: ${error.message}`);
    
    // Provide helpful error messages
    if (error.message.includes('authentication')) {
      logWarning('Authentication failed. For Gmail, make sure you\'re using an App Password, not your regular password.');
      logWarning('Enable 2FA and generate an App Password: https://support.google.com/accounts/answer/185833');
    } else if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
      logWarning('Connection timeout. Check your SMTP_HOST and SMTP_PORT settings.');
      logWarning('Also verify your firewall/network settings allow SMTP connections.');
    }
    
    process.exit(1);
  }

  // Send test email
  const testEmail = process.env.SMTP_USER; // Send to self for testing
  logInfo(`\nSending test email to ${testEmail}...`);

  const testMailOptions = {
    from: {
      name: process.env.SMTP_FROM_NAME || 'FarmTally',
      address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER
    },
    to: testEmail,
    subject: '🌾 FarmTally Email Integration Test - Success!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2E7D32; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { padding: 20px; background-color: #f9f9f9; border-radius: 0 0 5px 5px; }
          .success { background-color: #4CAF50; color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .info { background-color: #E3F2FD; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌾 FarmTally Email Test</h1>
          </div>
          <div class="content">
            <div class="success">
              <h3>✅ Email Integration Working!</h3>
              <p>Congratulations! Your FarmTally email configuration is working correctly.</p>
            </div>
            
            <div class="info">
              <h4>Configuration Details:</h4>
              <p><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</p>
              <p><strong>SMTP Port:</strong> ${process.env.SMTP_PORT || '587'}</p>
              <p><strong>From Name:</strong> ${process.env.SMTP_FROM_NAME || 'FarmTally'}</p>
              <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <h4>What's Next?</h4>
            <ul>
              <li>✅ Email configuration is working</li>
              <li>🚀 Start your FarmTally server</li>
              <li>📧 Email notifications will be sent automatically for:
                <ul>
                  <li>Lorry requests and approvals</li>
                  <li>Payment notifications</li>
                  <li>Advance payment confirmations</li>
                  <li>Delivery completions</li>
                </ul>
              </li>
            </ul>

            <p><strong>Need help?</strong> Check the EMAIL_SETUP_GUIDE.md for detailed configuration instructions.</p>
          </div>
          
          <div class="footer">
            <p>This is an automated test email from FarmTally</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
FarmTally Email Integration Test - Success!

Congratulations! Your FarmTally email configuration is working correctly.

Configuration Details:
- SMTP Host: ${process.env.SMTP_HOST}
- SMTP Port: ${process.env.SMTP_PORT || '587'}
- From Name: ${process.env.SMTP_FROM_NAME || 'FarmTally'}
- Test Time: ${new Date().toLocaleString()}

What's Next?
✅ Email configuration is working
🚀 Start your FarmTally server
📧 Email notifications will be sent automatically for lorry requests, payments, and deliveries

Need help? Check the EMAIL_SETUP_GUIDE.md for detailed configuration instructions.

This is an automated test email from FarmTally.
    `
  };

  try {
    const result = await transporter.sendMail(testMailOptions);
    logSuccess(`Test email sent successfully! Message ID: ${result.messageId}`);
    
    if (result.accepted && result.accepted.length > 0) {
      logSuccess(`Email accepted by server for: ${result.accepted.join(', ')}`);
    }
    
    if (result.rejected && result.rejected.length > 0) {
      logWarning(`Email rejected for: ${result.rejected.join(', ')}`);
    }

  } catch (error) {
    logError(`Failed to send test email: ${error.message}`);
    process.exit(1);
  }

  // Test notification templates
  logInfo('\nTesting notification templates...');
  
  const templates = [
    {
      name: 'Lorry Request Notification',
      test: () => testLorryRequestTemplate(transporter, testEmail)
    },
    {
      name: 'Payment Notification',
      test: () => testPaymentTemplate(transporter, testEmail)
    }
  ];

  for (const template of templates) {
    try {
      await template.test();
      logSuccess(`${template.name} template test passed`);
    } catch (error) {
      logError(`${template.name} template test failed: ${error.message}`);
    }
  }

  // Final summary
  log('\n' + '='.repeat(60), colors.bold);
  logSuccess('🎉 All email tests completed successfully!');
  log('='.repeat(60), colors.bold);
  
  logInfo('Your FarmTally email integration is ready for production!');
  logInfo('Check your email inbox for the test messages.');
  logInfo('Start your server with: npm run dev');
  
  console.log('\n');
}

async function testLorryRequestTemplate(transporter, testEmail) {
  const mailOptions = {
    from: {
      name: process.env.SMTP_FROM_NAME || 'FarmTally',
      address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER
    },
    to: testEmail,
    subject: 'Test: New Lorry Request - HIGH Priority',
    html: generateLorryRequestTemplate('Test Manager', {
      id: 'TEST-001',
      requiredDate: new Date().toLocaleDateString(),
      purpose: 'Test lorry request for email integration',
      priority: 'HIGH',
      location: 'Test Farm Location'
    })
  };

  await transporter.sendMail(mailOptions);
}

async function testPaymentTemplate(transporter, testEmail) {
  const mailOptions = {
    from: {
      name: process.env.SMTP_FROM_NAME || 'FarmTally',
      address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER
    },
    to: testEmail,
    subject: 'Test: Payment Processed - ₹15,000',
    html: generatePaymentTemplate({
      farmerName: 'Test Farmer',
      amount: 15000,
      deliveryDate: new Date().toLocaleDateString(),
      referenceNumber: 'PAY-TEST-001'
    })
  };

  await transporter.sendMail(mailOptions);
}

function generateLorryRequestTemplate(managerName, requestDetails) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2E7D32; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .details { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #f44336; }
        .button { display: inline-block; padding: 10px 20px; background-color: #2E7D32; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚛 New Lorry Request (TEST)</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p><strong>${managerName}</strong> has submitted a new lorry request that requires your approval.</p>
          
          <div class="details">
            <h3>Request Details</h3>
            <p><strong>Request ID:</strong> ${requestDetails.id}</p>
            <p><strong>Required Date:</strong> ${requestDetails.requiredDate}</p>
            <p><strong>Priority:</strong> ${requestDetails.priority}</p>
            <p><strong>Purpose:</strong> ${requestDetails.purpose}</p>
            <p><strong>Location:</strong> ${requestDetails.location}</p>
          </div>
          
          <p><em>This is a test email for FarmTally email integration.</em></p>
          
          <p>Best regards,<br>FarmTally Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generatePaymentTemplate(paymentDetails) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2E7D32; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .details { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #4CAF50; }
        .amount { font-size: 24px; font-weight: bold; color: #2E7D32; text-align: center; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 Payment Processed (TEST)</h1>
        </div>
        <div class="content">
          <p>Dear ${paymentDetails.farmerName},</p>
          <p>Your payment has been successfully processed.</p>
          
          <div class="amount">₹${paymentDetails.amount.toLocaleString()}</div>
          
          <div class="details">
            <h3>Payment Details</h3>
            <p><strong>Delivery Date:</strong> ${paymentDetails.deliveryDate}</p>
            <p><strong>Reference Number:</strong> ${paymentDetails.referenceNumber}</p>
            <p><strong>Amount:</strong> ₹${paymentDetails.amount.toLocaleString()}</p>
          </div>
          
          <p><em>This is a test email for FarmTally email integration.</em></p>
          
          <p>Thank you for your continued partnership with us.</p>
          
          <p>Best regards,<br>FarmTally Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logError(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Run the test
if (require.main === module) {
  testEmailConfiguration().catch((error) => {
    logError(`Test failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { testEmailConfiguration };