# Quick Hostinger Email Setup

Simple steps to configure email using your Hostinger hosting account.

## 🚀 Quick Steps

### 1. Create Email Account in Hostinger
1. **Login to Hostinger** → [hostinger.com](https://www.hostinger.com)
2. **Go to Email** → "Hosting" → "Manage" → "Email Accounts"
3. **Create Account**:
   - Email: `noreply@yourdomain.com`
   - Password: Create strong password (save it!)
   - Storage: 1GB+ recommended

### 2. Find SMTP Settings
In your email account settings, look for:
- **SMTP Server**: Usually `smtp.hostinger.com` or `mail.yourdomain.com`
- **Port**: `587` (TLS) or `465` (SSL)
- **Authentication**: Required

### 3. Update .env File
```env
# Replace with your actual values:
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="noreply@yourdomain.com"        # Your email
SMTP_PASS="your-email-password"           # Email password
SMTP_FROM_NAME="FarmTally"
SMTP_FROM_EMAIL="noreply@yourdomain.com"  # Same as SMTP_USER
```

### 4. Test Configuration
```bash
node test-hostinger-email.js
```

## 🔧 Common Hostinger SMTP Settings

### Option 1: Hostinger SMTP
```env
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT=587
SMTP_SECURE=false
```

### Option 2: Domain Mail Server
```env
SMTP_HOST="mail.yourdomain.com"
SMTP_PORT=587
SMTP_SECURE=false
```

### Option 3: SSL Configuration
```env
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT=465
SMTP_SECURE=true
```

## ✅ Success Indicators

You'll know it's working when:
- ✅ Test script shows "connection successful!"
- ✅ Test email arrives in your inbox
- ✅ No authentication errors
- ✅ Email service ready for production

## 🚨 If It Doesn't Work

1. **Check email account** - Verify it exists and is active
2. **Try different SMTP host** - Use `mail.yourdomain.com`
3. **Check Hostinger panel** - Look for exact SMTP settings
4. **Contact Hostinger support** - They can provide exact configuration

## 💰 Benefits

- ✅ **Free** - Usually included with hosting
- ✅ **Simple** - No app passwords needed
- ✅ **Fast setup** - Works in minutes
- ✅ **Reliable** - Integrated with your hosting

Much easier than Zoho! 🎉