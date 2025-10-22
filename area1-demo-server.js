// Area 1 Local Demonstration Server
// Run this locally to see what Area 1 endpoints will look like

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001; // Different port to avoid conflicts

app.use(cors());
app.use(express.json());

// Enhanced API endpoint - Area 1 version
app.get('/api', (req, res) => {
  res.json({
    message: 'FarmTally API is working',
    status: 'success',
    database: 'PostgreSQL',
    version: 'Area 1 - Database Ready',
    deployment: 'Area 1 endpoints active',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      dbHealth: '/api/health/db',
      users: '/api/users',
      organizations: '/api/organizations'
    }
  });
});

// Area 1 Database health endpoint
app.get('/api/health/db', (req, res) => {
  res.json({
    status: 'ready',
    message: 'PostgreSQL connection configured',
    database: 'PostgreSQL',
    timestamp: new Date().toISOString(),
    note: 'Area 1 endpoint - database integration ready'
  });
});

// Area 1 Users endpoints
app.get('/api/users', (req, res) => {
  res.json({
    status: 'success',
    data: [
      {
        id: 'area1-user-1',
        email: 'admin@farmtally.com',
        role: 'FARM_ADMIN',
        status: 'APPROVED',
        created_at: new Date().toISOString()
      },
      {
        id: 'area1-user-2',
        email: 'manager@farmtally.com',
        role: 'FIELD_MANAGER', 
        status: 'APPROVED',
        created_at: new Date().toISOString()
      }
    ],
    count: 2,
    message: 'Area 1 users endpoint working'
  });
});

app.post('/api/users', (req, res) => {
  const { email, role, name, phone } = req.body;
  
  if (!email || !role) {
    return res.status(400).json({
      status: 'error',
      error: 'Email and role are required'
    });
  }

  res.status(201).json({
    status: 'success',
    data: {
      id: 'new-user-' + Date.now(),
      email: email,
      role: role,
      status: 'PENDING',
      profile: { name, phone },
      created_at: new Date().toISOString()
    },
    message: 'User created successfully (Area 1 demo)'
  });
});

// Area 1 Organizations endpoints
app.get('/api/organizations', (req, res) => {
  res.json({
    status: 'success',
    data: [
      {
        id: 'area1-org-1',
        name: 'FarmTally Demo Farm',
        code: 'FDF001',
        address: '123 Farm Road, Agricultural District',
        phone: '+1-555-0123',
        email: 'contact@demofarm.com',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'area1-org-2',
        name: 'Area 1 Success Organization',
        code: 'A1SO001',
        address: '456 Success Avenue',
        phone: '+1-555-SUCCESS',
        email: 'success@area1.com',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ],
    count: 2,
    message: 'Area 1 organizations endpoint working'
  });
});

app.post('/api/organizations', (req, res) => {
  const { name, code, address, phone, email } = req.body;
  
  if (!name || !code) {
    return res.status(400).json({
      status: 'error',
      error: 'Name and code are required'
    });
  }

  res.status(201).json({
    status: 'success',
    data: {
      id: 'new-org-' + Date.now(),
      name: name,
      code: code,
      address: address,
      phone: phone,
      email: email,
      is_active: true,
      created_at: new Date().toISOString()
    },
    message: 'Organization created successfully (Area 1 demo)'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Area 1 Demo Server is running',
    timestamp: new Date().toISOString(),
    version: 'Area 1 - Local Demo',
    environment: 'development'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Area 1 Demo Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('🎯 Test these Area 1 endpoints in your browser:');
  console.log(`   http://localhost:${PORT}/api`);
  console.log(`   http://localhost:${PORT}/api/health/db`);
  console.log(`   http://localhost:${PORT}/api/users`);
  console.log(`   http://localhost:${PORT}/api/organizations`);
  console.log('');
  console.log('🎉 This shows exactly what Area 1 will look like when deployed!');
});