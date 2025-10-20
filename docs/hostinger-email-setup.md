# Hostinger Email Configuration Guide

This guide will help you set up email service using Hostinger's built-in email system instead of Zoho.

## 🎯 Why Use Hostinger Email?

- ✅ **Simpler setup** - No app passwords needed
- ✅ **Included with hosting** - Usually free with your hosting plan
- ✅ **Direct integration** - Works immediately with your domain
- ✅ **No external dependencies** - Everything managed in one place

## 📋 Step-by-Step Setup

### Step 1: Access Hostinger Email Management

1. **Log into Hostinger**
   - Go to [hostinger.com](https://www.hostinger.com)
   - Click "Login" and enter your credentials

2. **Navigate to Email**
   - In your Hostinger dashboard, look for **"Email"** or **"Email Accounts"**
   - This might be under "Hosting" → "Manage" → "Email Accounts"

### Step 2: Create Email Account

1. **Create New Email Account**
   - Click **"Create Email Account"** or **"Add Email"**
   - Fill in the details:
     - **Email**: `noreply@yourdomain.com`
     - **Password**: Create a strong password (save this!)
     - **Storage**: Set appropriate storage limit

2. **Additional Recommended Accounts**
   - `admin@yourdomain.com` - For admin notifications
   - `support@yourdomain.com` - For customer support
   - `alerts@yourdomain.com` - For system alerts

### Step 3: Get SMTP Settings

In Hostinger email settings, find your SMTP configuration:

**Common Hostinger SMTP Settings:**
- **SMTP Host**: `smtp.hostinger.com` or `mail.yourdomain.com`
- **SMTP Port**: `587` (TLS) or `465` (SSL)
- **Security**: TLS or SSL
- **Authentication**: Yes (use email and password)

### Step 4: Update Environment Variables

Update your `.env` file with Hostinger SMTP settings:

```env
# Email Configuration (Hostinger SMTP)
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="noreply@yourdomain.com"
SMTP_PASS="your-email-password"
SMTP_FROM_NAME="FarmTally"
SMTP_FROM_EMAIL="noreply@yourdomain.com"
```

**Replace:**
- `yourdomain.com` with your actual domain
- `your-email-password` with the password you set for the email account

## 🔧 Alternative SMTP Settings

If the above doesn't work, try these alternatives:

### Option 1: Domain-based SMTP
```env
SMTP_HOST="mail.yourdomain.com"
SMTP_PORT=587
SMTP_SECURE=false
```

### Option 2: SSL Configuration
```env
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT=465
SMTP_SECURE=true
```

### Option 3: Check Hostinger Documentation
1. In Hostinger panel, go to your email account
2. Look for "Mail Client Settings" or "SMTP Settings"
3. Copy the exact settings provided

## 🧪 Test Your Configuration

Create a test file `test-hostinger-email.js`:

```javascript
const dotenv = require('dotenv');
dotenv.config();

const nodemailer = require('nodemailer');

async function testHostingerEmail() {
  console.log('🔧 Testing Hostinger Email Configuration...\n');
  
  console.log('📋 Current Configuration:');
  console.log('- SMTP Host:', process.env.SMTP_HOST);
  console.log('- SMTP Port:', process.env.SMTP_PORT);
  console.log('- SMTP User:', process.env.SMTP_USER);
  console.log('- SMTP Pass:', process.env.SMTP_PASS ? '✅ CONFIGURED' : '❌ NOT SET');
  console.log('');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔍 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');

    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: process.env.SMTP_USER,
      subject: '🎉 Hostinger Email Test - SUCCESS!',
      text: 'Your Hostinger email configuration is working correctly!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">🎉 SUCCESS!</h1>
            <p style="margin: 10px 0 0 0;">Hostinger Email is Working</p>
          </div>
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #2E7D32;">Congratulations! 🎊</h2>
            <p>Your FarmTally system can now send emails using Hostinger SMTP.</p>
            
            <div style="background-color: #E8F5E8; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #2E7D32; margin-top: 0;">Configuration Details:</h3>
              <p><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</p>
              <p><strong>SMTP Port:</strong> ${process.env.SMTP_PORT}</p>
              <p><strong>From Email:</strong> ${process.env.SMTP_FROM_EMAIL}</p>
            </div>
            
            <p style="text-align: center; margin-top: 30px;">
              <strong>Ready for production! 🚀</strong><br>
              <em>FarmTally Team</em>
            </p>
          </div>
        </div>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📧 Check your inbox at:', process.env.SMTP_USER);
    console.log('\n🎉 Hostinger email configuration is working perfectly!');
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Authentication Error:');
      console.log('1. ❌ Verify email address and password are correct');
      console.log('2. ❌ Make sure the email account exists in Hostinger');
      console.log('3. ❌ Check if the email account is active');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.log('\n🔧 Connection Error:');
      console.log('1. ❌ Try different SMTP host: mail.yourdomain.com');
      console.log('2. ❌ Try port 465 with SMTP_SECURE=true');
      console.log('3. ❌ Check Hostinger email settings in your panel');
    }
    
    console.log('\n💡 Check your Hostinger email settings for exact SMTP configuration');
  }
}

testHostingerEmail();
```

## 📱 Finding Your Hostinger SMTP Settings

### Method 1: Hostinger Panel
1. Login to Hostinger
2. Go to "Hosting" → "Manage"
3. Find "Email Accounts"
4. Click on your email account
5. Look for "Mail Client Settings" or "SMTP Configuration"

### Method 2: Common Hostinger Settings
Most Hostinger accounts use:
```
Incoming (IMAP):
- Server: mail.yourdomain.com
- Port: 993 (SSL) or 143 (TLS)

Outgoing (SMTP):
- Server: mail.yourdomain.com or smtp.hostinger.com
- Port: 465 (SSL) or 587 (TLS)
```

### Method 3: Contact Hostinger Support
If you can't find the settings:
1. Open a support ticket in Hostinger
2. Ask for "SMTP settings for my domain"
3. They'll provide exact configuration

## 🔒 Security Considerations

### Email Account Security
1. **Use strong passwords** for email accounts
2. **Enable spam protection** in Hostinger panel
3. **Set up email forwarding** if needed
4. **Monitor email usage** regularly

### SMTP Security
1. **Use TLS/SSL encryption** (port 587 or 465)
2. **Don't share email credentials** in code repositories
3. **Use environment variables** for all sensitive data
4. **Rotate passwords** periodically

## 📊 Hostinger Email Limits

Check your Hostinger plan for:
- **Daily sending limits** (usually 100-500 emails/day)
- **Storage limits** per email account
- **Number of email accounts** allowed
- **Attachment size limits**

## 🚀 Production Setup

### Recommended Email Accounts:
```
noreply@yourdomain.com    - System notifications
admin@yourdomain.com      - Admin communications  
support@yourdomain.com    - Customer support
alerts@yourdomain.com     - System alerts
```

### DNS Records (Usually automatic with Hostinger):
- **MX Records** - Point to Hostinger mail servers
- **SPF Record** - `v=spf1 include:hostinger.com ~all`
- **DKIM** - Usually handled automatically

## 🔧 Troubleshooting

### Issue 1: Authentication Failed
- ✅ Verify email account exists in Hostinger
- ✅ Check email password is correct
- ✅ Ensure email account is active

### Issue 2: Connection Timeout
- ✅ Try different SMTP host (mail.yourdomain.com)
- ✅ Try different ports (587, 465, 25)
- ✅ Check firewall settings

### Issue 3: Emails Not Sending
- ✅ Check daily sending limits
- ✅ Verify domain DNS settings
- ✅ Check spam folder

### Issue 4: Wrong SMTP Settings
- ✅ Check Hostinger documentation
- ✅ Contact Hostinger support
- ✅ Try webmail to verify account works

## 💰 Cost Comparison

**Hostinger Email:**
- ✅ Usually included with hosting
- ✅ No additional monthly fees
- ✅ Simple setup and management

**vs Zoho Mail:**
- ❌ $1-4/month additional cost
- ❌ Complex app password setup
- ❌ External service dependency

## 📞 Support Resources

- **Hostinger Help Center**: Available in your panel
- **Live Chat**: 24/7 support available
- **Knowledge Base**: Extensive documentation
- **Community Forum**: User discussions and solutions

## ✅ Success Checklist

- [ ] Email account created in Hostinger
- [ ] SMTP settings identified
- [ ] Environment variables updated
- [ ] Test script runs successfully
- [ ] Test email received
- [ ] No authentication errors
- [ ] Ready for production use

Once configured, your FarmTally system will send professional emails using your Hostinger email service!