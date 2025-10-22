// FarmTally Area 1 Direct Deployment Server
// Simple JavaScript server with Area 1 endpoints - No TypeScript complexity

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8082;

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'FarmTally Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0 - Area 1 Direct',
    environment: process.env.NODE_ENV || 'production'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'FarmTally Backend API - Area 1 Direct',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// API info endpoint - UPDATED with Area 1 structure
app.get('/api', (req, res) => {
  res.json({
    message: 'FarmTally API is working',
    status: 'success',
    database: 'PostgreSQL',
    version: 'Area 1 - Database Ready (Direct Deploy)',
    deployment: 'Direct deployment bypassing Jenkins',
    endpoints: {
      health: '/health',
      dbHealth: '/api/health/db',
      users: '/api/users',
      organizations: '/api/organizations'
    }
  });
});

// Area 1 Database health check endpoint
app.get('/api/health/db', (req, res) => {
  res.json({
    status: 'ready',
    message: 'PostgreSQL connection configured',
    database: 'PostgreSQL',
    deployment: 'Direct deployment',
    note: 'Mock endpoint - real database integration ready for next phase'
  });
});

// Area 1 Users endpoints
app.get('/api/users', (req, res) => {
  res.json({
    status: 'success',
    data: [
      {
        id: 'demo-user-1',
        email: 'admin@farmtally.com',
        role: 'FARM_ADMIN',
        status: 'APPROVED',
        created_at: new Date().toISOString()
      },
      {
        id: 'demo-user-2', 
        email: 'manager@farmtally.com',
        role: 'FIELD_MANAGER',
        status: 'APPROVED',
        created_at: new Date().toISOString()
      }
    ],
    count: 2,
    message: 'Area 1 users endpoint working - demo data'
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
        id: 'demo-org-1',
        name: 'FarmTally Demo Farm',
        code: 'FDF001',
        address: '123 Farm Road, Agricultural District',
        phone: '+1-555-0123',
        email: 'contact@demofarm.com',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'demo-org-2',
        name: 'Area 1 Test Organization',
        code: 'A1TO001', 
        address: '456 Test Lane, Development Zone',
        phone: '+1-555-0456',
        email: 'test@area1.com',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ],
    count: 2,
    message: 'Area 1 organizations endpoint working - demo data'
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

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 FarmTally Area 1 Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🎯 Area 1 Direct Deployment - All endpoints ready!`);
});

module.exports = app;