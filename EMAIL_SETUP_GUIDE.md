# FarmTally Email Integration Setup Guide

## Overview
FarmTally now includes comprehensive email notifications for key business events including lorry requests, approvals, payments, and delivery completions.

## Email Configuration

### 1. Environment Variables
Add these variables to your `.env` file:

```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=FarmTally
SMTP_FROM_EMAIL=your-email@gmail.com

# Email Features
EMAIL_NOTIFICATIONS_ENABLED=true
EMAIL_QUEUE_ENABLED=true
```

### 2. Gmail Setup (Recommended)
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `SMTP_PASS`

### 3. Alternative Email Providers

#### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

#### Yahoo Mail
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
```

#### Custom SMTP
```bash
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
```

## Email Notifications

### Automatic Notifications

1. **Lorry Request Created**
   - Sent to: Farm Admin
   - Trigger: Field Manager creates lorry request
   - Content: Request details, priority, required date

2. **Lorry Request Approved**
   - Sent to: Field Manager
   - Trigger: Farm Admin approves request
   - Content: Assigned lorry details, approval confirmation

3. **Advance Payment Recorded**
   - Sent to: Farmer (if email available)
   - Trigger: Advance payment created
   - Content: Payment amount, date, reference

4. **Payment Processed**
   - Sent to: Farmer (if email available)
   - Trigger: Delivery payment processed
   - Content: Payment amount, delivery details, reference

5. **Delivery Completed**
   - Sent to: All stakeholders
   - Trigger: Delivery marked as completed
   - Content: Delivery summary, weights, values

### Manual Email Features

1. **Test Email Configuration**
   - Endpoint: `POST /api/email/test`
   - Purpose: Verify email setup works

2. **Bulk Notifications**
   - Endpoint: `POST /api/email/bulk`
   - Purpose: Send announcements to multiple recipients

3. **Manual Notifications**
   - Endpoint: `POST /api/email/lorry-request/:requestId`
   - Purpose: Resend specific notifications

## API Endpoints

### Email Status
```http
GET /api/email/status
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "config": {
    "enabled": true,
    "host": "smtp.gmail.com",
    "port": "587",
    "user": "your-email@gmail.com",
    "fromName": "FarmTally",
    "fromEmail": "your-email@gmail.com"
  },
  "isConfigured": true
}
```

### Test Email
```http
POST /api/email/test
Authorization: Bearer <token>
Content-Type: application/json

{
  "testEmail": "test@example.com"
}
```

### Bulk Notifications
```http
POST /api/email/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "emails": ["farmer1@example.com", "farmer2@example.com"],
  "subject": "Important Announcement",
  "message": "Your message content here"
}
```

## Testing Email Setup

### 1. Check Configuration
```bash
curl -X GET http://localhost:3000/api/email/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Send Test Email
```bash
curl -X POST http://localhost:3000/api/email/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "your-test@email.com"}'
```

### 3. Test Lorry Request Flow
1. Create a lorry request as Field Manager
2. Check Farm Admin email for notification
3. Approve the request as Farm Admin
4. Check Field Manager email for approval notification

## Troubleshooting

### Common Issues

1. **"Authentication failed" Error**
   - Verify SMTP credentials
   - For Gmail, ensure App Password is used (not regular password)
   - Check 2FA is enabled for Gmail

2. **"Connection timeout" Error**
   - Verify SMTP_HOST and SMTP_PORT
   - Check firewall settings
   - Try different port (465 for SSL, 587 for TLS)

3. **Emails not sending**
   - Check EMAIL_NOTIFICATIONS_ENABLED=true
   - Verify recipient email addresses exist
   - Check server logs for detailed errors

4. **Emails going to spam**
   - Set up SPF/DKIM records for your domain
   - Use a dedicated email service (SendGrid, Mailgun)
   - Avoid spam trigger words in content

### Debug Mode
Enable detailed email logging:
```bash
NODE_ENV=development
```

Check logs for email sending attempts and errors.

## Production Recommendations

### 1. Use Professional Email Service
For production, consider using:
- **SendGrid** (recommended)
- **Mailgun**
- **Amazon SES**
- **Postmark**

### 2. SendGrid Setup Example
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=FarmTally
```

### 3. Security Best Practices
- Use environment variables for credentials
- Enable TLS/SSL encryption
- Regularly rotate API keys
- Monitor email delivery rates
- Set up bounce/complaint handling

### 4. Email Templates
All email templates are responsive and include:
- Professional branding
- Clear call-to-action buttons
- Mobile-friendly design
- Proper fallback text content

## Integration with Frontend

### Display Email Status
Add email configuration status to admin dashboard:

```typescript
// Check email configuration
const emailStatus = await fetch('/api/email/status');
const config = await emailStatus.json();

if (!config.isConfigured) {
  // Show setup warning
}
```

### Send Test Emails
Add email testing to admin settings:

```typescript
const testEmail = async (email: string) => {
  const response = await fetch('/api/email/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ testEmail: email })
  });
  
  const result = await response.json();
  return result.emailSent;
};
```

## Monitoring and Analytics

### Email Delivery Tracking
- Monitor successful/failed email attempts
- Track delivery rates by notification type
- Set up alerts for email service failures

### Performance Optimization
- Implement email queuing for bulk operations
- Add retry logic for failed deliveries
- Cache email templates for better performance

## Next Steps

1. **Configure your email provider** using the guide above
2. **Test the configuration** with the test endpoint
3. **Update farmer email addresses** in the database
4. **Monitor email delivery** in production
5. **Set up professional email service** for production use

The email system is now ready for production deployment and will significantly improve communication and user experience in FarmTally!