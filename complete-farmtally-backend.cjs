const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3001;

// Supabase configuration
const SUPABASE_URL = 'https://qvxcbdglyvzohzdefnet.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eGNiZGdseXZ6b2h6ZGVmbmV0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY5NDEzOCwiZXhwIjoyMDc2MjcwMTM4fQ.MCCGzB9BPHgfZC72NQGyKKWFFxw4s3LovUgJy14NBk4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Email configuration
const emailTransporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 587,
  secure: false,
  auth: {
    user: 'noreply@farmtally.in',
    pass: '2t/!P1K]w'
  }
});

app.use(cors());
app.use(express.json());

// Simple password hashing using Node.js crypto
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'farmtally-salt').digest('hex');
}

function verifyPassword(password, hash) {
  const passwordHash = hashPassword(password);
  return passwordHash === hash;
}

// Email notification functions
async function sendEmail(to, subject, html, text) {
  try {
    const mailOptions = {
      from: {
        name: 'FarmTally',
        address: 'noreply@farmtally.in'
      },
      to: to,
      subject: subject,
      html: html,
      text: text
    };

    const result = await emailTransporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

async function sendRegistrationApprovalNotification(userEmail, userName) {
  const subject = 'Welcome to FarmTally - Account Approved!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #2E7D32; color: white; padding: 20px; text-align: center;">
        <h1>🌾 Welcome to FarmTally!</h1>
      </div>
      <div style="padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 20px; border-radius: 5px;">
          <h2>Account Approved!</h2>
          <p>Dear ${userName},</p>
          <p>Great news! Your FarmTally account has been approved and is now active.</p>
          <p>You can now log in to your account and start using FarmTally to manage your corn procurement operations.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://app.farmtally.in/login" 
               style="background-color: #2E7D32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Login to FarmTally
            </a>
          </div>
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          <p>Welcome aboard!</p>
          <p><strong>The FarmTally Team</strong></p>
        </div>
        <p style="margin-top: 20px; color: #666; font-size: 12px; text-align: center;">
          This is an automated message from FarmTally. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;
  
  const text = `Welcome to FarmTally! Your account has been approved. You can now log in at https://app.farmtally.in/login`;
  
  return await sendEmail(userEmail, subject, html, text);
}

async function sendRegistrationNotificationToAdmin(userEmail, userName, userRole) {
  const subject = 'New User Registration - Approval Required';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1976D2; color: white; padding: 20px; text-align: center;">
        <h1>🔔 New User Registration</h1>
      </div>
      <div style="padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 20px; border-radius: 5px;">
          <h2>Approval Required</h2>
          <p>A new user has registered and requires approval:</p>
          <ul>
            <li><strong>Name:</strong> ${userName}</li>
            <li><strong>Email:</strong> ${userEmail}</li>
            <li><strong>Role:</strong> ${userRole}</li>
            <li><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://app.farmtally.in/admin/approvals" 
               style="background-color: #1976D2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Review Registration
            </a>
          </div>
          <p>Please log in to the admin panel to approve or reject this registration.</p>
        </div>
      </div>
    </div>
  `;
  
  const text = `New user registration: ${userName} (${userEmail}) - Role: ${userRole}. Please review at https://app.farmtally.in/admin/approvals`;
  
  return await sendEmail('admin@farmtally.in', subject, html, text);
}

// Middleware to check authentication
function requireAuth(req, res, next) {
  // For now, we'll skip auth check since we don't have proper JWT implementation
  // In production, you'd verify the JWT token here
  next();
}

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'FarmTally Backend with Supabase is running',
    timestamp: new Date().toISOString()
  });
});

// ==================== AUTHENTICATION ENDPOINTS ====================

// Login endpoint
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', email);

  try {
    // Check if it's the system admin
    if (email === 'admin@farmtally.in' && password === 'FarmTallyAdmin2024!') {
      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: 'admin-user-id',
            email: email,
            role: 'APPLICATION_ADMIN',
            status: 'APPROVED',
            profile: {
              firstName: 'System',
              lastName: 'Administrator'
            },
            organization_id: null
          },
          tokens: {
            accessToken: 'admin-jwt-token-' + Date.now(),
            refreshToken: 'admin-refresh-token-' + Date.now()
          }
        }
      });
    }

    // Check in Supabase database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash, role, status, profile, organization_id')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check user status
    if (user.status === 'PENDING') {
      return res.status(401).json({
        success: false,
        error: 'Account is pending approval. Please wait for admin approval.'
      });
    }

    if (user.status !== 'APPROVED') {
      return res.status(401).json({
        success: false,
        error: 'Account is not active'
      });
    }

    // Verify password
    const isPasswordValid = verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Remove password hash from response
    const { password_hash, ...userResponse } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        tokens: {
          accessToken: 'jwt-token-' + Date.now(),
          refreshToken: 'refresh-token-' + Date.now()
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Registration endpoint
app.post('/auth/register', async (req, res) => {
  const { email, password, firstName, lastName, role, organizationName } = req.body;
  console.log('Registration attempt:', { email, role, organizationName });

  try {
    // Basic validation
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const passwordHash = hashPassword(password);

    // Create organization if provided
    let organizationId = null;
    if (organizationName && role === 'FARM_ADMIN') {
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: organizationName,
          code: organizationName.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10) + Math.floor(Math.random() * 1000),
          is_active: true
        })
        .select('id')
        .single();

      if (!orgError && organization) {
        organizationId = organization.id;
      }
    }

    // Create user
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        role: role,
        status: 'PENDING',
        organization_id: organizationId,
        profile: {
          firstName,
          lastName
        }
      })
      .select('id, email, role, status, profile, organization_id')
      .single();

    if (userError) {
      console.error('User creation error:', userError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create user account'
      });
    }

    console.log('User created successfully:', newUser.id);

    // Send notification to admin about new registration
    try {
      await sendRegistrationNotificationToAdmin(
        newUser.email,
        `${newUser.profile.firstName} ${newUser.profile.lastName}`,
        newUser.role
      );
      console.log('Admin notification sent for new registration');
    } catch (error) {
      console.error('Failed to send admin notification:', error);
    }

    res.json({
      success: true,
      message: 'Registration successful. Your account is pending approval. You will receive an email once approved.',
      data: {
        user: newUser,
        tokens: {
          accessToken: 'pending-approval-token',
          refreshToken: 'pending-approval-refresh-token'
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ==================== FARMER ENDPOINTS ====================

app.get('/farmers', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Mock farmer data for now
    const farmers = [
      {
        id: '1',
        name: 'John Farmer',
        phone: '+1234567890',
        email: 'john@example.com',
        address: '123 Farm Road, Village',
        status: 'ACTIVE',
        totalDeliveries: 15,
        totalEarnings: 45000
      },
      {
        id: '2',
        name: 'Jane Farmer',
        phone: '+1234567891',
        email: 'jane@example.com',
        address: '456 Field Street, Town',
        status: 'ACTIVE',
        totalDeliveries: 8,
        totalEarnings: 24000
      }
    ];

    res.json({
      success: true,
      data: farmers,
      pagination: {
        page,
        limit,
        total: farmers.length,
        totalPages: Math.ceil(farmers.length / limit)
      }
    });
  } catch (error) {
    console.error('Get farmers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch farmers'
    });
  }
});

app.post('/farmers', requireAuth, async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    
    // Mock farmer creation
    const newFarmer = {
      id: Date.now().toString(),
      name,
      phone,
      email,
      address,
      status: 'ACTIVE',
      totalDeliveries: 0,
      totalEarnings: 0,
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: newFarmer,
      message: 'Farmer created successfully'
    });
  } catch (error) {
    console.error('Create farmer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create farmer'
    });
  }
});

// ==================== LORRY ENDPOINTS ====================

app.get('/lorries', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Mock lorry data
    const lorries = [
      {
        id: '1',
        name: 'Lorry 001',
        licensePlate: 'ABC-123',
        capacity: 1000,
        status: 'AVAILABLE',
        driverName: 'Driver One',
        driverPhone: '+1234567890'
      },
      {
        id: '2',
        name: 'Lorry 002',
        licensePlate: 'XYZ-456',
        capacity: 1200,
        status: 'IN_TRANSIT',
        driverName: 'Driver Two',
        driverPhone: '+1234567891'
      }
    ];

    res.json({
      success: true,
      data: lorries,
      pagination: {
        page,
        limit,
        total: lorries.length,
        totalPages: Math.ceil(lorries.length / limit)
      }
    });
  } catch (error) {
    console.error('Get lorries error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lorries'
    });
  }
});

app.post('/lorries', requireAuth, async (req, res) => {
  try {
    const { name, licensePlate, capacity, driverName, driverPhone } = req.body;
    
    const newLorry = {
      id: Date.now().toString(),
      name,
      licensePlate,
      capacity,
      driverName,
      driverPhone,
      status: 'AVAILABLE',
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: newLorry,
      message: 'Lorry created successfully'
    });
  } catch (error) {
    console.error('Create lorry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create lorry'
    });
  }
});

app.get('/lorries/organization', requireAuth, async (req, res) => {
  try {
    // Mock organization lorries
    const lorries = [
      {
        id: '1',
        name: 'Lorry 001',
        licensePlate: 'ABC-123',
        capacity: 1000,
        status: 'AVAILABLE',
        driverName: 'Driver One',
        driverPhone: '+1234567890'
      }
    ];

    res.json({
      success: true,
      data: lorries
    });
  } catch (error) {
    console.error('Get organization lorries error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch organization lorries'
    });
  }
});

// ==================== DELIVERY ENDPOINTS ====================

app.get('/deliveries', requireAuth, async (req, res) => {
  try {
    // Mock delivery data
    const deliveries = [
      {
        id: '1',
        lorryId: '1',
        farmerId: '1',
        farmerName: 'John Farmer',
        lorryName: 'Lorry 001',
        bagsCount: 50,
        grossWeight: 2500,
        netWeight: 2400,
        status: 'COMPLETED',
        deliveryDate: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: deliveries
    });
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch deliveries'
    });
  }
});

// ==================== INVITATION ENDPOINTS ====================

app.post('/invitations/field-manager', requireAuth, async (req, res) => {
  try {
    const { email, firstName, lastName, message } = req.body;
    
    // Mock invitation creation
    const invitation = {
      id: Date.now().toString(),
      email,
      firstName,
      lastName,
      message,
      status: 'SENT',
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: invitation,
      message: 'Field manager invitation sent successfully'
    });
  } catch (error) {
    console.error('Send invitation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send invitation'
    });
  }
});

app.get('/invitations/field-managers', requireAuth, async (req, res) => {
  try {
    // Mock field managers data
    const fieldManagers = [
      {
        id: '1',
        email: 'manager1@example.com',
        firstName: 'Field',
        lastName: 'Manager One',
        status: 'ACTIVE',
        joinedAt: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: fieldManagers
    });
  } catch (error) {
    console.error('Get field managers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch field managers'
    });
  }
});

// ==================== LORRY REQUEST ENDPOINTS ====================

app.post('/lorry-requests', requireAuth, async (req, res) => {
  try {
    const { requestedDate, estimatedGunnyBags, location, notes } = req.body;
    
    const lorryRequest = {
      id: Date.now().toString(),
      requestedDate,
      estimatedGunnyBags,
      location,
      notes,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: lorryRequest,
      message: 'Lorry request created successfully'
    });
  } catch (error) {
    console.error('Create lorry request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create lorry request'
    });
  }
});

app.get('/lorry-requests', requireAuth, async (req, res) => {
  try {
    // Mock lorry requests
    const requests = [
      {
        id: '1',
        requestedDate: new Date().toISOString(),
        estimatedGunnyBags: 100,
        location: 'Farm Location 1',
        notes: 'Urgent request',
        status: 'PENDING',
        createdAt: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Get lorry requests error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lorry requests'
    });
  }
});

// ==================== ADVANCE PAYMENT ENDPOINTS ====================

app.post('/advance-payments', requireAuth, async (req, res) => {
  try {
    const { farmerId, amount, paymentMethod, notes } = req.body;
    
    const payment = {
      id: Date.now().toString(),
      farmerId,
      amount,
      paymentMethod,
      notes,
      status: 'COMPLETED',
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: payment,
      message: 'Advance payment recorded successfully'
    });
  } catch (error) {
    console.error('Create advance payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record advance payment'
    });
  }
});

// ==================== ADMIN ENDPOINTS ====================

app.get('/admin/stats', requireAuth, async (req, res) => {
  try {
    const stats = {
      totalFarmers: 25,
      totalLorries: 5,
      totalDeliveries: 150,
      totalRevenue: 450000,
      pendingRequests: 3,
      activeFieldManagers: 8
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin stats'
    });
  }
});

// Get pending users for admin approval
app.get('/system-admin/users/pending', async (req, res) => {
  try {
    const { data: pendingUsers, error } = await supabase
      .from('users')
      .select('id, email, role, profile, organization_id, created_at')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: pendingUsers || []
    });

  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending users'
    });
  }
});

// Approve user
app.post('/system-admin/users/:userId/approve', async (req, res) => {
  const { userId } = req.params;
  const { approvalNotes } = req.body;

  try {
    // Get user details before approval
    const { data: user, error: getUserError } = await supabase
      .from('users')
      .select('email, profile')
      .eq('id', userId)
      .single();

    if (getUserError || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update user status
    const { error: updateError } = await supabase
      .from('users')
      .update({
        status: 'APPROVED',
        approved_by: null,
        approved_at: new Date().toISOString(),
        approval_notes: approvalNotes
      })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    console.log('User approved:', user.email);

    // Send approval notification to user
    try {
      await sendRegistrationApprovalNotification(
        user.email,
        `${user.profile.firstName} ${user.profile.lastName}`
      );
      console.log('Approval notification sent to user');
    } catch (error) {
      console.error('Failed to send approval notification:', error);
    }

    res.json({
      success: true,
      message: 'User approved successfully'
    });

  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve user'
    });
  }
});

// Reject user
app.post('/system-admin/users/:userId/reject', async (req, res) => {
  const { userId } = req.params;
  const { rejectionReason } = req.body;

  try {
    // Get user details before rejection
    const { data: user, error: getUserError } = await supabase
      .from('users')
      .select('email, profile')
      .eq('id', userId)
      .single();

    if (getUserError || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update user status
    const { error: updateError } = await supabase
      .from('users')
      .update({
        status: 'REJECTED',
        rejection_reason: rejectionReason
      })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    console.log('User rejected:', user.email);

    res.json({
      success: true,
      message: 'User rejected'
    });

  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject user'
    });
  }
});

// ==================== EMAIL ENDPOINTS ====================

// Email status endpoint
app.get('/api/email/status', (req, res) => {
  res.json({
    success: true,
    config: {
      enabled: true,
      host: 'smtp.hostinger.com',
      port: '587',
      user: 'noreply@farmtally.in',
      fromName: 'FarmTally',
      fromEmail: 'noreply@farmtally.in'
    },
    isConfigured: true
  });
});

// Test email endpoint
app.post('/api/email/test', async (req, res) => {
  const { testEmail } = req.body;

  if (!testEmail) {
    return res.status(400).json({
      success: false,
      error: 'Test email address is required'
    });
  }

  const success = await sendEmail(
    testEmail,
    'FarmTally Email Configuration Test',
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2E7D32; color: white; padding: 20px; text-align: center;">
          <h1>🌾 FarmTally Email Test</h1>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 20px; border-radius: 5px;">
            <h2>Email Configuration Test</h2>
            <p>If you receive this email, your FarmTally email configuration is working correctly!</p>
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>Sent at: ${new Date().toLocaleString()}</li>
              <li>From: noreply@farmtally.in</li>
              <li>SMTP Host: smtp.hostinger.com</li>
            </ul>
            <p>✅ Email notifications are now active for FarmTally!</p>
          </div>
        </div>
      </div>
    `,
    'FarmTally email configuration test - if you receive this, your configuration is working!'
  );

  res.json({
    success: true,
    message: success ? 'Test email sent successfully' : 'Failed to send test email',
    emailSent: success
  });
});

// Catch-all for undefined routes
app.get('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'GET /health',
      'POST /auth/login',
      'POST /auth/register',
      'GET /farmers',
      'POST /farmers',
      'GET /lorries',
      'POST /lorries',
      'GET /deliveries',
      'POST /invitations/field-manager',
      'GET /invitations/field-managers',
      'POST /lorry-requests',
      'GET /lorry-requests',
      'POST /advance-payments',
      'GET /admin/stats',
      'GET /system-admin/users/pending',
      'POST /system-admin/users/:id/approve',
      'POST /system-admin/users/:id/reject',
      'GET /api/email/status',
      'POST /api/email/test'
    ]
  });
});

app.post('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

app.listen(PORT, () => {
  console.log(`FarmTally Complete Backend running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('- Authentication: /auth/login, /auth/register');
  console.log('- Farmers: /farmers');
  console.log('- Lorries: /lorries');
  console.log('- Deliveries: /deliveries');
  console.log('- Invitations: /invitations/*');
  console.log('- Lorry Requests: /lorry-requests');
  console.log('- Advance Payments: /advance-payments');
  console.log('- Admin: /admin/stats, /system-admin/*');
  console.log('- Email: /api/email/*');
});