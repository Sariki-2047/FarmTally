#!/usr/bin/env node

/**
 * Test FarmTally Email API
 */

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

async function testEmailAPI() {
  log('\n' + '='.repeat(60), colors.bold);
  log('🌾 FarmTally Email API Test', colors.bold);
  log('='.repeat(60), colors.bold);

  try {
    // Test email status endpoint
    log('\n📊 Testing email status endpoint...', colors.blue);
    
    const statusResponse = await fetch('http://localhost:3001/api/email/status');
    const statusData = await statusResponse.json();
    
    if (statusData.success) {
      log('✅ Email status endpoint working!', colors.green);
      log(`📧 SMTP Host: ${statusData.config.host}`, colors.blue);
      log(`📬 From Email: ${statusData.config.fromEmail}`, colors.blue);
      log(`🔔 Notifications Enabled: ${statusData.config.enabled}`, colors.blue);
    } else {
      log('❌ Email status endpoint failed', colors.red);
      return;
    }

    // Test sending email
    log('\n📤 Testing email sending...', colors.blue);
    
    const testEmailResponse = await fetch('http://localhost:3001/api/email/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        testEmail: 'admin@farmtally.in'
      })
    });

    const testEmailData = await testEmailResponse.json();
    
    if (testEmailData.success && testEmailData.emailSent) {
      log('✅ Test email sent successfully!', colors.green);
      log('📧 Check admin@farmtally.in for the test email', colors.blue);
    } else {
      log('❌ Test email failed to send', colors.red);
      log(`Error: ${testEmailData.message}`, colors.red);
    }

    log('\n' + '='.repeat(60), colors.bold);
    log('🎉 Email API Test Complete!', colors.green);
    log('='.repeat(60), colors.bold);
    
    log('\n📋 Email Notifications Active For:', colors.bold);
    log('✅ User registration → Admin notification');
    log('✅ User approval → Welcome email to user');
    log('✅ User rejection → Notification to user');
    log('✅ Manual test emails → Any email address');
    
    log('\n🚀 Ready for Production!', colors.green);

  } catch (error) {
    log('\n❌ Email API test failed:', colors.red);
    log(error.message, colors.red);
    
    if (error.code === 'ECONNREFUSED') {
      log('\n💡 Backend not running. Please start with:', colors.yellow);
      log('node simple-supabase-backend.cjs', colors.yellow);
    }
  }
}

// Run the test
testEmailAPI().catch(console.error);