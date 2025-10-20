# FarmTally Email Integration - Deployment Checklist

## Pre-Deployment Setup

### ✅ 1. Email Service Configuration
- [ ] Choose email provider (Gmail, SendGrid, Outlook, etc.)
- [ ] Create dedicated email account for FarmTally
- [ ] Generate App Password (for Gmail) or API key (for services)
- [ ] Test email credentials manually

### ✅ 2. Environment Configuration
- [ ] Add email variables to `.env` file:
  ```bash
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_SECURE=false
  SMTP_USER=your-email@gmail.com
  SMTP_PASS=your-app-password
  SMTP_FROM_NAME=FarmTally
  SMTP_FROM_EMAIL=your-email@gmail.com
  EMAIL_NOTIFICATIONS_ENABLED=true
  ```

### ✅ 3. Test Email Integration
- [ ] Run email test: `npm run test:email`
- [ ] Verify test emails are received
- [ ] Check spam folder if emails not in inbox
- [ ] Test all notification templates

## Database Updates

### ✅ 4. Farmer Email Addresses
- [ ] Update farmer records with email addresses
- [ ] Verify email format validation
- [ ] Add email collection to farmer registration

```sql
-- Add email to existing farmers (example)
UPDATE farmers SET email = 'farmer1@example.com' WHERE id = 'farmer-id-1';
UPDATE farmers SET email = 'farmer2@example.com' WHERE id = 'farmer-id-2';
```

### ✅ 5. User Email Verification
- [ ] Ensure all users have valid email addresses
- [ ] Test with real email addresses
- [ ] Verify admin and manager emails

## Production Deployment

### ✅ 6. Server Configuration
- [ ] Deploy updated backend code
- [ ] Set production environment variables
- [ ] Restart server services
- [ ] Verify email routes are accessible

### ✅ 7. Email Service Limits
- [ ] Check daily/hourly sending limits
- [ ] Configure rate limiting if needed
- [ ] Set up monitoring for email failures
- [ ] Plan for high-volume scenarios

### ✅ 8. Security Configuration
- [ ] Use secure SMTP connection (TLS/SSL)
- [ ] Store credentials securely
- [ ] Enable email encryption if available
- [ ] Set up SPF/DKIM records (for custom domains)

## Testing in Production

### ✅ 9. End-to-End Testing
- [ ] Test lorry request notification flow
- [ ] Test lorry approval notification
- [ ] Test advance payment notification
- [ ] Test delivery completion notification
- [ ] Test bulk email functionality

### ✅ 10. User Acceptance Testing
- [ ] Train farm admins on email features
- [ ] Test with real user scenarios
- [ ] Verify email delivery timing
- [ ] Check email content accuracy

## Monitoring and Maintenance

### ✅ 11. Email Monitoring
- [ ] Set up email delivery monitoring
- [ ] Configure alerts for email failures
- [ ] Monitor bounce rates
- [ ] Track email open rates (if needed)

### ✅ 12. Performance Optimization
- [ ] Monitor email sending performance
- [ ] Optimize email templates for mobile
- [ ] Set up email queuing for bulk operations
- [ ] Configure retry logic for failures

## Rollback Plan

### ✅ 13. Fallback Strategy
- [ ] Document rollback procedure
- [ ] Keep previous version ready
- [ ] Plan for email service downtime
- [ ] Alternative notification methods

## Post-Deployment

### ✅ 14. User Training
- [ ] Create user documentation
- [ ] Train farm admins on email settings
- [ ] Provide troubleshooting guide
- [ ] Set up support process

### ✅ 15. Continuous Improvement
- [ ] Collect user feedback on emails
- [ ] Monitor email effectiveness
- [ ] Plan template improvements
- [ ] Consider additional notification types

## Quick Commands

### Test Email Configuration
```bash
# Test email setup
npm run test:email

# Check email status via API
curl -X GET http://localhost:3000/api/email/status \
  -H "Authorization: Bearer YOUR_TOKEN"

# Send test email
curl -X POST http://localhost:3000/api/email/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "test@example.com"}'
```

### Production Health Check
```bash
# Check server status
curl -X GET http://your-domain.com/api/health

# Verify email configuration
curl -X GET http://your-domain.com/api/email/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Common Issues and Solutions

### Email Not Sending
1. Check SMTP credentials
2. Verify network connectivity
3. Check email service limits
4. Review server logs

### Emails Going to Spam
1. Set up SPF records
2. Configure DKIM signing
3. Use reputable email service
4. Avoid spam trigger words

### Performance Issues
1. Implement email queuing
2. Add rate limiting
3. Optimize email templates
4. Monitor server resources

## Success Criteria

- [ ] All automatic notifications working
- [ ] Email delivery rate > 95%
- [ ] No email-related server errors
- [ ] Users receiving emails promptly
- [ ] Email templates display correctly
- [ ] Mobile email compatibility verified

## Sign-off

- [ ] Technical Lead Approval: ________________
- [ ] Product Owner Approval: ________________
- [ ] QA Testing Complete: ________________
- [ ] Production Deployment: ________________

**Deployment Date:** ________________  
**Deployed By:** ________________  
**Version:** ________________