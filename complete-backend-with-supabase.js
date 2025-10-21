#!/usr/bin/env node

/**
 * Complete Backend with Real Supabase Integration
 */

const fs = require('fs');

const completeBackendCode = `const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3001;

// Supabase configuration
const SUPABASE_URL = 'https://qvxcbdglyvzohzdefnet.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eGNiZGdseXZ6b2h6ZGVmbmV0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY5NDEzOCwiZXhwIjoyMDc2MjcwMTM4fQ.MCCGzB9BPHgfZC72NQGyKKWFFxw4s3LovUgJy14NBk4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Email configuration
const emailTransporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

app.use(cors());
app.use(express.json());

// Simple password hashing (in production, use bcrypt)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'farmtally-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// Send email notification
async function sendEmail(to, subject, html) {
  try {
    await emailTransporter.sendMail({
      from: '"FarmTally" <noreply@farmtally.in>',
      to,
      subject,
      html
    });
    console.log('Email sent to:', to);
  } catch (error) {
    console.error('Email error:', error);
  }
}

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'FarmTally Backend is running',
    timestamp: new Date().toISOString()
  });
});

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
    const isPasswordValid = await verifyPassword(password, user.password_hash);
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
    const passwordHash = await hashPassword(password);

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

    // Send notification email to admin
    const adminEmailHtml = \`
      <h2>New User Registration - FarmTally</h2>
      <p>A new user has registered and is awaiting approval:</p>
      <ul>
        <li><strong>Name:</strong> \${firstName} \${lastName}</li>
        <li><strong>Email:</strong> \${email}</li>
        <li><strong>Role:</strong> \${role}</li>
        <li><strong>Organization:</strong> \${organizationName || 'N/A'}</li>
      </ul>
      <p>Please review and approve this registration in the admin dashboard:</p>
      <p><a href="https://app.farmtally.in/admin/approvals">Review Pending Approvals</a></p>
    \`;

    await sendEmail('admin@farmtally.in', 'New User Registration - Approval Required', adminEmailHtml);

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
        approved_by: 'admin-user-id',
        approved_at: new Date().toISOString(),
        approval_notes: approvalNotes
      })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    // Send approval email to user
    const approvalEmailHtml = \`
      <h2>Account Approved - FarmTally</h2>
      <p>Dear \${user.profile?.firstName || 'User'},</p>
      <p>Great news! Your FarmTally account has been approved and is now active.</p>
      <p>You can now log in to your dashboard:</p>
      <p><a href="https://app.farmtally.in/login">Login to FarmTally</a></p>
      <p>Your login credentials:</p>
      <ul>
        <li><strong>Email:</strong> \${user.email}</li>
        <li><strong>Password:</strong> [The password you used during registration]</li>
      </ul>
      \${approvalNotes ? \`<p><strong>Admin Notes:</strong> \${approvalNotes}</p>\` : ''}
      <p>Welcome to FarmTally!</p>
    \`;

    await sendEmail(user.email, 'Account Approved - Welcome to FarmTally', approvalEmailHtml);

    res.json({
      success: true,
      message: 'User approved successfully and notification email sent'
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

    // Send rejection email to user
    con