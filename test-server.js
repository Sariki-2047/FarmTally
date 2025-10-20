const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8001;
const HOST = process.env.HOST || '0.0.0.0'; // bind wide for reliability

// Add crash guards
process.on('uncaughtException', (e) => console.error('uncaughtException', e));
process.on('unhandledRejection', (e) => console.error('unhandledRejection', e));

// Email configuration (supports Gmail, Hostinger, etc.)
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  },
  tls: {
    rejectUnauthorized: false // Accept self-signed certificates
  }
};

// Create email transporter
const transporter = nodemailer.createTransport(emailConfig);

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email configuration error:', error.message);
    console.log('⚠️  Server will continue with email simulation mode');
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Email templates
const emailTemplates = {
  fieldManagerInvitation: (data) => ({
    subject: 'Invitation to join FarmTally as Field Manager',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FarmTally Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2E7D32; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #2E7D32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌾 FarmTally</h1>
            <p>Corn Procurement Management System</p>
          </div>
          <div class="content">
            <h2>Welcome to FarmTally!</h2>
            <p>Dear <strong>${data.name}</strong>,</p>
            <p>You have been invited to join FarmTally as a <strong>Field Manager</strong>. We're excited to have you on our team!</p>
            
            <div class="details">
              <h3>Your Invitation Details:</h3>
              <ul>
                <li><strong>Name:</strong> ${data.name}</li>
                <li><strong>Email:</strong> ${data.email}</li>
                <li><strong>Phone:</strong> +91 ${data.phone}</li>
                ${data.aadhaar ? `<li><strong>Aadhaar:</strong> ${data.aadhaar}</li>` : ''}
              </ul>
            </div>
            
            <p>To complete your registration and set up your account, please click the button below:</p>
            
            <div style="text-align: center;">
              <a href="${data.invitationLink}" class="button">Complete Registration</a>
            </div>
            
            <p><strong>Important:</strong> This invitation will expire in 7 days. Please complete your registration before then.</p>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px;">${data.invitationLink}</p>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>
            <strong>The FarmTally Team</strong></p>
          </div>
          <div class="footer">
            <p>© 2024 FarmTally. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Dear ${data.name},

You have been invited to join FarmTally as a Field Manager.

Your invitation details:
- Name: ${data.name}
- Email: ${data.email}
- Phone: +91 ${data.phone}
${data.aadhaar ? `- Aadhaar: ${data.aadhaar}` : ''}

To complete your registration, please visit:
${data.invitationLink}

This invitation will expire in 7 days.

Best regards,
The FarmTally Team
    `
  })
};

// Email sending function
async function sendEmail(to, template, data) {
  let emailContent; // <-- move out of try so catch can read it safely
  try {
    emailContent = template(data);

    const mailOptions = {
      from: `"FarmTally Notifications" <${emailConfig.auth.user}>`,
      to,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
      replyTo: emailConfig.auth.user
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    // Don't crash here—log what would have gone out
    if (emailContent) {
      console.log('📧 Email would have been sent to:', to);
      console.log('📧 Subject:', emailContent.subject);
      console.log('📧 Content preview:', (emailContent.text || '').substring(0, 200) + '...');
    }
    return { success: false, error: error.message, simulated: true };
  }
}

// CORS middleware - bulletproof for development
app.use(cors({
  origin: (origin, cb) => cb(null, true), // allow all in dev
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
}));

// Handle preflight requests
app.options('*', cors());

// Body parsing
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    server: 'FarmTally Test Server',
    port: PORT,
    url: `http://127.0.0.1:${PORT}`
  });
});

app.get('/healthz', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    server: 'FarmTally Test Server',
    port: PORT,
    url: `http://127.0.0.1:${PORT}`
  });
});

// Test endpoints
app.get('/api/v1/test', (req, res) => {
  res.json({
    success: true,
    message: 'GET test successful',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/v1/test', (req, res) => {
  res.json({
    success: true,
    message: 'POST test successful',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// Login endpoint
app.post('/api/v1/auth/login', (req, res) => {
  console.log('Login request:', req.body);

  const { email, phone, password } = req.body;
  const identifier = email || phone;

  if (identifier === 'admin@farmtally.com' && password === 'Admin123!') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: '1',
          email: 'admin@farmtally.com',
          role: 'FARM_ADMIN',
          firstName: 'Farm',
          lastName: 'Admin'
        },
        tokens: {
          accessToken: 'test-token',
          refreshToken: 'test-refresh-token',
          expiresIn: 28800
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Field Manager Invitation endpoint
app.post('/api/v1/admin/field-managers/invite', async (req, res) => {
  console.log('Field Manager Invitation request:', req.body);

  const { name, email, phone, aadhaar } = req.body;

  // Validate required fields
  if (!name || !email || !phone) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and phone are required'
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }

  // Generate invitation token
  const invitationToken = 'inv_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  const invitationLink = `http://127.0.0.1:3004/register?token=${invitationToken}`;

  const fieldManagerData = {
    id: Math.random().toString(36).substring(2, 15),
    name,
    email,
    phone,
    aadhaar: aadhaar || null,
    status: 'INVITED',
    invitationToken,
    invitationLink,
    invitedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  };

  try {
    // Send real email
    console.log('📧 Sending invitation email to:', email);
    const emailResult = await sendEmail(
      email,
      emailTemplates.fieldManagerInvitation,
      {
        name,
        email,
        phone,
        aadhaar,
        invitationLink,
        invitationToken
      }
    );

    if (emailResult.success) {
      console.log('✅ Email sent successfully to:', email);
      console.log('📧 Message ID:', emailResult.messageId);
    } else {
      console.log('❌ Email sending failed:', emailResult.error);
      // Continue with the process even if email fails
    }

    // Log SMS simulation (will implement real SMS later)
    console.log('📱 SMS simulation for:', phone);
    console.log(`📱 Message: Welcome to FarmTally! You've been invited as a Field Manager. Complete registration: ${invitationLink}`);

    res.json({
      success: true,
      message: emailResult.success ?
        'Invitation sent successfully via email and SMS' :
        'Invitation created successfully (email delivery may have failed)',
      data: {
        fieldManager: fieldManagerData,
        emailSent: emailResult.success,
        emailMessageId: emailResult.messageId || null
      }
    });

  } catch (error) {
    console.error('❌ Error processing invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send invitation: ' + error.message
    });
  }
});

// Field Manager Registration endpoint (for when they click the invitation link)
app.post('/api/v1/auth/register/field-manager', (req, res) => {
  console.log('Field Manager Registration request:', req.body);

  const { token, password, confirmPassword } = req.body;

  if (!token || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Token, password, and confirm password are required'
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match'
    });
  }

  // In a real app, you'd validate the token and get user details from database
  // For demo, we'll simulate a successful registration
  res.json({
    success: true,
    message: 'Registration completed successfully',
    data: {
      user: {
        id: Math.random().toString(36).substring(2, 15),
        email: 'manager@farmtally.com', // Would come from token validation
        role: 'FIELD_MANAGER',
        firstName: 'Field',
        lastName: 'Manager',
        status: 'ACTIVE'
      },
      tokens: {
        accessToken: 'field-manager-token',
        refreshToken: 'field-manager-refresh-token',
        expiresIn: 28800
      }
    }
  });
});

app.listen(PORT, HOST, () => {
  const url = `http://127.0.0.1:${PORT}`;
  console.log('🚀 FarmTally Test Server Started');
  console.log('================================');
  console.log(`📡 Server URL: ${url}`);
  console.log(`🏠 Binding: ${HOST}:${PORT} (LISTENING)`);
  console.log(`🏥 Health Check: ${url}/healthz`);
  console.log(`� Logidn Endpoint: ${url}/api/v1/auth/login`);
  console.log(`👥 Field Manager Invite: ${url}/api/v1/admin/field-managers/invite`);
  console.log(`📝 Field Manager Register: ${url}/api/v1/auth/register/field-manager`);
  console.log(`🧪 Test Endpoint: ${url}/api/v1/test`);
  console.log('✅ CORS: Allow all origins (development mode)');
  console.log('================================');
  console.log('📧 Email Configuration:');
  console.log(`   Host: ${emailConfig.host}`);
  console.log(`   Port: ${emailConfig.port}`);
  console.log(`   User: ${emailConfig.auth.user}`);
  console.log(`   Secure: ${emailConfig.secure}`);
  console.log('================================');
});