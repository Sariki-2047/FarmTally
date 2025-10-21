#!/usr/bin/env node

/**
 * Test Hostinger Email Configuration for FarmTally
 */

const nodemailer = require('nodemailer');

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

async function testEmailConfiguration() {
  log('\n' + '='.repeat(60), colors.bold);
  log('🌾 FarmTally Hostinger Email Test', colors.bold);
  log('='.repeat(60), colors.bold);

  // Create transporter - trying different Hostinger SMTP hosts
  const smtpHosts = [
    'smtp.hostinger.com',
    'smtp.titan.email',
    'mail.farmtally.in'
  ];

  let transporter = null;
  let workingHost = null;

  for (const host of smtpHosts) {
    try {
      log(`🔍 Trying SMTP host: ${host}`, colors.blue);
      
      transporter = nodemailer.createTransport({
        host: host,
        port: 587,
        secure: false,
        auth: {
          user: 'noreply@farmtally.in',
          pass: '2t/!P1K]w'
        },
        debug: false,
        logger: false
      });

      await transporter.verify();
      workingHost = host;
      log(`✅ Found working SMTP host: ${host}`, colors.green);
      break;
    } catch (error) {
      log(`❌ ${host} failed: ${error.message}`, colors.red);
      continue;
    }
  }

  if (!workingHost) {
    throw new Error('No working SMTP host found. Please check your Hostinger email settings.');
  }

  try {
    log(`\n📧 Using SMTP host: ${workingHost}`, colors.blue);
    log('✅ SMTP connection successful!', colors.green);

    log('\n📤 Sending test email...', colors.blue);

    // Send test email
    const testEmail = {
      from: {
        name: 'FarmTally',
        address: 'noreply@farmtally.in'
      },
      to: 'admin@farmtally.in', // Send to admin email
      subject: '🌾 FarmTally Email Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2E7D32; color: white; padding: 20px; text-align: center;">
            <h1>🌾 FarmTally Email Test</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 20px; border-radius: 5px;">
              <h2>✅ Email Configuration Successful!</h2>
              <p>Congratulations! Your Hostinger email configuration is working perfectly.</p>
              <p><strong>Configuration Details:</strong></p>
              <ul>
                <li><strong>SMTP Host:</strong> ${workingHost}</li>
                <li><strong>Port:</strong> 587 (TLS)</li>
                <li><strong>From Email:</strong> noreply@farmtally.in</li>
                <li><strong>Test Time:</strong> ${new Date().toLocaleString()}</li>
              </ul>
              <p>🎉 FarmTally email notifications are now active!</p>
              <p><strong>What happens next:</strong></p>
              <ul>
                <li>New user registrations will notify admins</li>
                <li>User approvals will send welcome emails</li>
                <li>Lorry requests will trigger notifications</li>
                <li>Payment confirmations will be sent automatically</li>
              </ul>
            </div>
            <p style="margin-top: 20px; color: #666; font-size: 12px; text-align: center;">
              This is an automated test message from FarmTally.
            </p>
          </div>
        </div>
      `,
      text: `FarmTally Email Test - Configuration successful! Email notifications are now active. Test sent at ${new Date().toLocaleString()}`
    };

    const result = await transporter.sendMail(testEmail);
    
    log('✅ Test email sent successfully!', colors.green);
    log(`📧 Message ID: ${result.messageId}`, colors.blue);
    log(`📬 Email sent to: admin@farmtally.in`, colors.blue);

    log('\n' + '='.repeat(60), colors.bold);
    log('🎉 Email Configuration Complete!', colors.green);
    log('='.repeat(60), colors.bold);
    
    log('\n📋 Next Steps:', colors.bold);
    log('1. ✅ Email configuration verified');
    log('2. ✅ Test email sent successfully');
    log('3. 🚀 Deploy backend with email notifications');
    log('4. 📧 Check admin@farmtally.in for test email');
    log('5. 🔔 Email notifications are now active!');

  } catch (error) {
    log('\n❌ Email test failed:', colors.red);
    log(error.message, colors.red);
    
    if (error.code === 'EAUTH') {
      log('\n💡 Authentication failed. Please check:', colors.yellow);
      log('- Email address: noreply@farmtally.in', colors.yellow);
      log('- Password is correct', colors.yellow);
      log('- Email account is active in Hostinger', colors.yellow);
    } else if (error.code === 'ECONNECTION') {
      log('\n💡 Connection failed. Please check:', colors.yellow);
      log('- SMTP host: mail.farmtally.in', colors.yellow);
      log('- Port: 587', colors.yellow);
      log('- Internet connection', colors.yellow);
    }
  }
}

// Run the test
testEmailConfiguration().catch(console.error);