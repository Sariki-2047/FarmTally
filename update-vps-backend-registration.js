#!/usr/bin/env node

/**
 * Update VPS Backend to Support Registration
 */

const fs = require('fs');

const updatedBackendCode = `const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'FarmTally Backend is running',
    timestamp: new Date().toISOString()
  });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', email);

  // Check credentials
  if (email === 'admin@farmtally.in' && password === 'FarmTallyAdmin2024!') {
    // Return format that matches frontend expectations
    res.json({
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
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbi11c2VyLWlkIiwiZW1haWwiOiJhZG1pbkBmYXJtdGFsbHkuaW4iLCJyb2xlIjoiQVBQTElDQVRJT05fQURNSU4iLCJvcmdhbml6YXRpb25JZCI6bnVsbCwiZXhwIjoxNzYxMDY0MzY5fQ.mock-jwt-token-for-testing',
          refreshToken: 'mock-refresh-token-for-testing'
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

// Registration endpoint
app.post('/auth/register', (req, res) => {
  const { email, password, firstName, lastName, role, organizationName } = req.body;
  console.log('Registration attempt:', { email, role, organizationName });

  // Basic validation
  if (!email || !password || !firstName || !lastName || !role) {
    return res.status(400).json({
      success: false,
      error: 'All fields are required'
    });
  }

  // Mock registration success
  res.json({
    success: true,
    message: 'Registration successful. Your account is pending approval.',
    data: {
      user: {
        id: 'new-user-' + Date.now(),
        email: email,
        role: role,
        status: 'PENDING',
        profile: {
          firstName: firstName,
          lastName: lastName
        },
        organization: organizationName ? {
          id: 'org-' + Date.now(),
          name: organizationName
        } : null
      },
      tokens: {
        accessToken: 'pending-approval-token',
        refreshToken: 'pending-approval-refresh-token'
      }
    }
  });
});

// System admin setup endpoint
app.post('/system-admin/setup', (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  console.log('System admin setup attempt:', email);

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      success: false,
      error: 'All fields are required'
    });
  }

  res.json({
    success: true,
    message: 'System admin created successfully',
    data: {
      id: 'system-admin-' + Date.now(),
      email: email,
      role: 'APPLICATION_ADMIN',
      status: 'APPROVED',
      profile: {
        firstName: firstName,
        lastName: lastName
      }
    }
  });
});

// Catch-all for undefined routes
app.get('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
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
  console.log(\`Server running on port \${PORT}\`);
});
`;

// Write the updated backend code
fs.writeFileSync('simple-server-with-registration.cjs', updatedBackendCode);

console.log('✅ Updated backend code generated: simple-server-with-registration.cjs');
console.log('📋 This backend now includes:');
console.log('  - Login endpoint (existing)');
console.log('  - Registration endpoint (new)');
console.log('  - System admin setup endpoint (new)');
console.log('  - Proper error handling for 404s');
console.log('');
console.log('🚀 Next steps:');
console.log('  1. Upload this file to VPS');
console.log('  2. Replace the current simple-server.cjs');
console.log('  3. Restart the backend service');