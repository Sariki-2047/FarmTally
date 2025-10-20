# 📧 Gmail Configuration for FarmTally

## 🎯 Quick Gmail Setup Guide

Follow these steps to configure Gmail for FarmTally email notifications:

### Step 1: Enable 2-Factor Authentication

1. **Go to Google Account Settings:**
   - Visit: https://myaccount.google.com/
   - Click on "Security" in the left sidebar

2. **Enable 2-Step Verification:**
   - Find "2-Step Verification" section
   - Click "Get started"
   - Follow the setup process with your phone number
   - Complete the verification

### Step 2: Generate App Password

1. **Access App Passwords:**
   - Go back to Security settings
   - Under "2-Step Verification", click "App passwords"
   - You may need to sign in again

2. **Create App Password:**
   - Select app: "Mail"
   - Select device: "Other (custom name)"
   - Enter: "FarmTally"
   - Click "Generate"

3. **Copy the Password:**
   - Google will show a 16-character password
   - **Copy this password immediately** (you won't see it again)
   - Example: `abcd efgh ijkl mnop`

### Step 3: Configure Environment Variables

Add these to your `.env` file:

```bash
# Email Configuration
EMAIL_NOTIFICATIONS_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM_NAME=FarmTally
SMTP_FROM_EMAIL=your-email@gmail.com
```

### Step 4: Test Configuration

Run the email test:
```bash
npm run test:email
```

## 🔧 Production Deployment

For Railway:
```bash
railway variables set EMAIL_NOTIFICATIONS_ENABLED=true
railway variables set SMTP_HOST=smtp.gmail.com
railway variables set SMTP_PORT=587
railway variables set SMTP_SECURE=false
railway variables set SMTP_USER=your-email@gmail.com
railway variables set SMTP_PASS="abcd efgh ijkl mnop"
railway variables set SMTP_FROM_NAME=FarmTally
railway variables set SMTP_FROM_EMAIL=your-email@gmail.com
```

For Heroku:
```bash
heroku config:set EMAIL_NOTIFICATIONS_ENABLED=true
heroku config:set SMTP_HOST=smtp.gmail.com
heroku config:set SMTP_PORT=587
heroku config:set SMTP_SECURE=false
heroku config:set SMTP_USER=your-email@gmail.com
heroku config:set SMTP_PASS="abcd efgh ijkl mnop"
heroku config:set SMTP_FROM_NAME=FarmTally
heroku config:set SMTP_FROM_EMAIL=your-email@gmail.com
```

## ✅ Verification

After setup, test with:
```bash
curl -X POST https://your-app.com/api/email/test \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "test@example.com"}'
```

You're all set! 🎉