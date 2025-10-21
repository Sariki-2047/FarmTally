import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false // VPS local connection
});

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
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'FarmTally Backend API',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// Basic API endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'FarmTally API is working',
    status: 'success',
    database: 'PostgreSQL',
    endpoints: {
      health: '/health',
      dbHealth: '/api/health/db',
      users: '/api/users',
      organizations: '/api/organizations'
    }
  });
});

// Database health check
app.get('/api/health/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as timestamp, version() as version');
    res.json({
      status: 'connected',
      timestamp: result.rows[0].timestamp,
      version: result.rows[0].version,
      database: 'PostgreSQL'
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Database connection failed',
      database: 'PostgreSQL'
    });
  }
});

// Users endpoints
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, role, status, created_at FROM users ORDER BY created_at DESC');
    res.json({
      status: 'success',
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Get users failed:', error);
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to fetch users'
    });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { email, role, name, phone } = req.body;
    
    if (!email || !role) {
      return res.status(400).json({
        status: 'error',
        error: 'Email and role are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO users (email, role, password_hash, profile) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, role, status, created_at`,
      [email, role, 'temp_hash_' + Date.now(), JSON.stringify({ name, phone })]
    );

    res.status(201).json({
      status: 'success',
      data: result.rows[0],
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Create user failed:', error);
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to create user'
    });
  }
});

// Organizations endpoints
app.get('/api/organizations', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, code, address, phone, email, is_active, created_at FROM organizations ORDER BY created_at DESC');
    res.json({
      status: 'success',
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Get organizations failed:', error);
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to fetch organizations'
    });
  }
});

app.post('/api/organizations', async (req, res) => {
  try {
    const { name, code, address, phone, email } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({
        status: 'error',
        error: 'Name and code are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO organizations (name, code, address, phone, email) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, code, address, phone, email, is_active, created_at`,
      [name, code, address, phone, email]
    );

    res.status(201).json({
      status: 'success',
      data: result.rows[0],
      message: 'Organization created successfully'
    });
  } catch (error) {
    console.error('Create organization failed:', error);
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to create organization'
    });
  }
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
  console.log(`🚀 FarmTally Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;