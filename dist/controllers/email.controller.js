"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBulkNotifications = exports.getEmailStatus = exports.sendLorryRequestNotification = exports.testEmailConfig = void 0;
const emailService_1 = __importDefault(require("../services/emailService"));
const error_middleware_1 = require("../middleware/error.middleware");
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
const emailService = new emailService_1.default();
exports.testEmailConfig = asyncHandler(async (req, res) => {
    const { testEmail } = req.body;
    if (!testEmail) {
        throw new error_middleware_1.BadRequestError('Test email address is required');
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
exports.sendLorryRequestNotification = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { adminEmail } = req.body;
    if (!adminEmail) {
        throw new error_middleware_1.BadRequestError('Admin email is required');
    }
    const success = await emailService.sendLorryRequestNotification(adminEmail, 'Test Manager', {
        id: requestId,
        requiredDate: new Date().toLocaleDateString(),
        purpose: 'Test lorry request notification',
        priority: 'MEDIUM',
        location: 'Test Location'
    });
    res.json({
        success: true,
        message: success ? 'Lorry request notification sent' : 'Failed to send notification',
        emailSent: success
    });
});
exports.getEmailStatus = asyncHandler(async (req, res) => {
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
exports.sendBulkNotifications = asyncHandler(async (req, res) => {
    const { emails, subject, message } = req.body;
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
        throw new error_middleware_1.BadRequestError('Email list is required');
    }
    if (!subject || !message) {
        throw new error_middleware_1.BadRequestError('Subject and message are required');
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
//# sourceMappingURL=email.controller.js.map