import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailData {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.zoho.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false // For development only
      }
    });

    // Verify connection configuration
    this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log('✅ SMTP server connection verified');
    } catch (error) {
      console.error('❌ SMTP server connection failed:', error);
    }
  }

  /**
   * Send a single email
   */
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const mailOptions = {
        from: {
          name: process.env.SMTP_FROM_NAME || 'FarmTally',
          address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER!
        },
        to: emailData.to,
        cc: emailData.cc,
        bcc: emailData.bcc,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        attachments: emailData.attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(emails: EmailData[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const email of emails) {
      const sent = await this.sendEmail(email);
      if (sent) {
        success++;
      } else {
        failed++;
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { success, failed };
  }

  /**
   * Send lorry request notification email
   */
  async sendLorryRequestNotification(
    adminEmail: string,
    managerName: string,
    requestDetails: {
      id: string;
      requiredDate: string;
      purpose: string;
      priority: string;
      location?: string;
    }
  ): Promise<boolean> {
    const emailData: EmailData = {
      to: adminEmail,
      subject: `New Lorry Request - ${requestDetails.priority} Priority`,
      html: this.generateLorryRequestTemplate(managerName, requestDetails),
      text: `New lorry request from ${managerName} for ${requestDetails.requiredDate}. Purpose: ${requestDetails.purpose}`
    };

    return await this.sendEmail(emailData);
  }

  /**
   * Send lorry approval notification email
   */
  async sendLorryApprovalNotification(
    managerEmail: string,
    lorryDetails: {
      requestId: string;
      lorryName: string;
      licensePlate: string;
      approvedBy: string;
    }
  ): Promise<boolean> {
    const emailData: EmailData = {
      to: managerEmail,
      subject: `Lorry Request Approved - ${lorryDetails.lorryName}`,
      html: this.generateLorryApprovalTemplate(lorryDetails),
      text: `Your lorry request has been approved. Assigned lorry: ${lorryDetails.lorryName} (${lorryDetails.licensePlate})`
    };

    return await this.sendEmail(emailData);
  }

  /**
   * Send payment notification email
   */
  async sendPaymentNotification(
    farmerEmail: string,
    paymentDetails: {
      farmerName: string;
      amount: number;
      deliveryDate: string;
      referenceNumber: string;
    }
  ): Promise<boolean> {
    const emailData: EmailData = {
      to: farmerEmail,
      subject: `Payment Processed - ₹${paymentDetails.amount}`,
      html: this.generatePaymentTemplate(paymentDetails),
      text: `Payment of ₹${paymentDetails.amount} has been processed for your delivery on ${paymentDetails.deliveryDate}. Reference: ${paymentDetails.referenceNumber}`
    };

    return await this.sendEmail(emailData);
  }

  /**
   * Send advance payment notification email
   */
  async sendAdvancePaymentNotification(
    farmerEmail: string,
    advanceDetails: {
      farmerName: string;
      amount: number;
      paymentDate: string;
      referenceNumber?: string;
      reason?: string;
    }
  ): Promise<boolean> {
    const emailData: EmailData = {
      to: farmerEmail,
      subject: `Advance Payment Received - ₹${advanceDetails.amount}`,
      html: this.generateAdvancePaymentTemplate(advanceDetails),
      text: `Advance payment of ₹${advanceDetails.amount} has been recorded for ${advanceDetails.paymentDate}.`
    };

    return await this.sendEmail(emailData);
  }

  /**
   * Send delivery completion notification
   */
  async sendDeliveryCompletionNotification(
    emails: string[],
    deliveryDetails: {
      farmerName: string;
      deliveryDate: string;
      netWeight: number;
      totalValue: number;
      lorryName: string;
    }
  ): Promise<boolean> {
    const emailData: EmailData = {
      to: emails,
      subject: `Delivery Completed - ${deliveryDetails.farmerName}`,
      html: this.generateDeliveryCompletionTemplate(deliveryDetails),
      text: `Delivery completed for ${deliveryDetails.farmerName} on ${deliveryDetails.deliveryDate}. Net weight: ${deliveryDetails.netWeight}kg, Value: ₹${deliveryDetails.totalValue}`
    };

    return await this.sendEmail(emailData);
  }

  // Email Templates
  private generateLorryRequestTemplate(managerName: string, requestDetails: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2E7D32; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .details { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .priority-high { border-left: 4px solid #f44336; }
          .priority-medium { border-left: 4px solid #ff9800; }
          .priority-low { border-left: 4px solid #4caf50; }
          .button { display: inline-block; padding: 10px 20px; background-color: #2E7D32; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚛 New Lorry Request</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p><strong>${managerName}</strong> has submitted a new lorry request that requires your approval.</p>
            
            <div class="details priority-${requestDetails.priority.toLowerCase()}">
              <h3>Request Details</h3>
              <p><strong>Request ID:</strong> ${requestDetails.id}</p>
              <p><strong>Required Date:</strong> ${requestDetails.requiredDate}</p>
              <p><strong>Priority:</strong> ${requestDetails.priority}</p>
              <p><strong>Purpose:</strong> ${requestDetails.purpose}</p>
              ${requestDetails.location ? `<p><strong>Location:</strong> ${requestDetails.location}</p>` : ''}
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="#" class="button">Approve Request</a>
              <a href="#" class="button" style="background-color: #f44336;">Reject Request</a>
            </div>
            
            <p>Please review and take action on this request at your earliest convenience.</p>
            
            <p>Best regards,<br>FarmTally Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateLorryApprovalTemplate(lorryDetails: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .details { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #4CAF50; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Lorry Request Approved</h1>
          </div>
          <div class="content">
            <p>Great news! Your lorry request has been approved.</p>
            
            <div class="details">
              <h3>Assigned Lorry Details</h3>
              <p><strong>Lorry Name:</strong> ${lorryDetails.lorryName}</p>
              <p><strong>License Plate:</strong> ${lorryDetails.licensePlate}</p>
              <p><strong>Approved By:</strong> ${lorryDetails.approvedBy}</p>
              <p><strong>Request ID:</strong> ${lorryDetails.requestId}</p>
            </div>
            
            <p>You can now proceed with your planned activities. Please ensure proper coordination with the lorry driver.</p>
            
            <p>Best regards,<br>FarmTally Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generatePaymentTemplate(paymentDetails: any): string {
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
            <h1>💰 Payment Processed</h1>
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
            
            <p>Thank you for your continued partnership with us.</p>
            
            <p>Best regards,<br>FarmTally Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateAdvancePaymentTemplate(advanceDetails: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .details { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #FF9800; }
          .amount { font-size: 24px; font-weight: bold; color: #FF9800; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 Advance Payment Received</h1>
          </div>
          <div class="content">
            <p>Dear ${advanceDetails.farmerName},</p>
            <p>We have recorded your advance payment.</p>
            
            <div class="amount">₹${advanceDetails.amount.toLocaleString()}</div>
            
            <div class="details">
              <h3>Advance Payment Details</h3>
              <p><strong>Payment Date:</strong> ${advanceDetails.paymentDate}</p>
              <p><strong>Amount:</strong> ₹${advanceDetails.amount.toLocaleString()}</p>
              ${advanceDetails.referenceNumber ? `<p><strong>Reference:</strong> ${advanceDetails.referenceNumber}</p>` : ''}
              ${advanceDetails.reason ? `<p><strong>Reason:</strong> ${advanceDetails.reason}</p>` : ''}
            </div>
            
            <p>This amount will be adjusted against your future deliveries.</p>
            
            <p>Best regards,<br>FarmTally Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateDeliveryCompletionTemplate(deliveryDetails: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2E7D32; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .details { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #2E7D32; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Delivery Completed</h1>
          </div>
          <div class="content">
            <p>A delivery has been successfully completed and recorded in the system.</p>
            
            <div class="details">
              <h3>Delivery Summary</h3>
              <p><strong>Farmer:</strong> ${deliveryDetails.farmerName}</p>
              <p><strong>Delivery Date:</strong> ${deliveryDetails.deliveryDate}</p>
              <p><strong>Lorry:</strong> ${deliveryDetails.lorryName}</p>
              <p><strong>Net Weight:</strong> ${deliveryDetails.netWeight}kg</p>
              <p><strong>Total Value:</strong> ₹${deliveryDetails.totalValue.toLocaleString()}</p>
            </div>
            
            <p>All delivery details have been recorded and are available in the system for review.</p>
            
            <p>Best regards,<br>FarmTally Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default EmailService;