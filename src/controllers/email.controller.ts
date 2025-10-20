import { Request, Response } from 'express';
import EmailService from '../services/emailService';
import { BadRequestError } from '../middleware/error.middleware';

// Simple async handler
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: Function) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const emailService = new EmailService();

/**
 * Test email configuration
 */
export const testEmailConfig = asyncHandler(async (req: Request, res: Response) => {
  const { testEmail } = req.body;

  if (!testEmail) {
    throw new BadRequestError('Test email address is required');
  }

  const success = await emailService.sendEmail({
    to: testEmail,
    subject: 'FarmTally Email Configuration Test',
    html: `
      <h2>Email Configuration Test</h2>
      <p>If you receive this email, your FarmTally email configuration is working correctly!</p>
      <p>Sent at: ${new Date().toLocaleString()}</p>
    `,
    text: 'FarmTally email configuration test - if you receive this, your configuration is working!'
  });

  res.json({
    success: true,
    message: success ? 'Test email sent successfully' : 'Failed to send test email',
    emailSent: success
  });
});

/**
 * Send lorry request notification manually
 */
export const sendLorryRequestNotification = asyncHandler(async (req: Request, res: Response) => {
  const { requestId } = req.params;
  const { adminEmail } = req.body;

  if (!adminEmail) {
    throw new BadRequestError('Admin email is required');
  }

  // This would typically get request details from database
  // For now, sending a test notification
  const success = await emailService.sendLorryRequestNotification(
    adminEmail,
    'Test Manager',
    {
      id: requestId,
      requiredDate: new Date().toLocaleDateString(),
      purpose: 'Test lorry request notification',
      priority: 'MEDIUM',
      location: 'Test Location'
    }
  );

  res.json({
    success: true,
    message: success ? 'Lorry request notification sent' : 'Failed to send notification',
    emailSent: success
  });
});

/**
 * Get email configuration status
 */
export const getEmailStatus = asyncHandler(async (req: Request, res: Response) => {
  const config = {
    enabled: process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true',
    host: process.env.SMTP_HOST || 'Not configured',
    port: process.env.SMTP_PORT || 'Not configured',
    user: process.env.SMTP_USER || 'Not configured',
    fromName: process.env.SMTP_FROM_NAME || 'FarmTally',
    fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'Not configured'
  };

  res.json({
    success: true,
    config,
    isConfigured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
  });
});

/**
 * Send bulk notification emails
 */
export const sendBulkNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { emails, subject, message } = req.body;

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    throw new BadRequestError('Email list is required');
  }

  if (!subject || !message) {
    throw new BadRequestError('Subject and message are required');
  }

  const emailData = emails.map(email => ({
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2E7D32; color: white; padding: 20px; text-align: center;">
          <h1>FarmTally Notification</h1>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 20px; border-radius: 5px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">
            This is an automated message from FarmTally. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
    text: message
  }));

  const result = await emailService.sendBulkEmails(emailData);

  res.json({
    success: true,
    message: `Bulk email sent to ${result.success} recipients`,
    result
  });
});