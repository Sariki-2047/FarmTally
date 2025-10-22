const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 8081;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

// Middleware
app.use(cors());
app.use(express.json());

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-2024';

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'FarmTally Authentication Service',
    service: 'auth-service',
    version: '1.0.0',
    status: 'running',
    port: PORT,
    endpoints: {
      health: '/health',
      register: '/register',
      login: '/login',
      verify: '/verify',
      users: '/users'
    },
    features: [
      'user-registration',
      'user-authentication',
      'jwt-tokens',
      'role-management'
    ]
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// Register endpoint
app.post('/register', async (req, res) => {
  try {
    const { email, password, role, profile } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email, password, and role are required'
      });
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'A user with this email already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, profile, status) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, role, status, created_at`,
      [email.toLowerCase(), passwordHash, role, JSON.stringify(profile || {}), 'PENDING']
    );

    const user = result.rows[0];

    // Generate tokens (only for approved users)
    let tokens = null;
    if (role === 'APPLICATION_ADMIN') {
      // Auto-approve system admins
      await pool.query('UPDATE users SET status = $1 WHERE id = $2', ['APPROVED', user.id]);
      user.status = 'APPROVED';
      
      tokens = {
        accessToken: jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: '8h' }
        ),
        refreshToken: jwt.sign(
          { userId: user.id },
          JWT_REFRESH_SECRET,
          { expiresIn: '7d' }
        )
      };
    }

    res.status(201).json({
      success: true,
      message: user.status === 'PENDING' ? 'Registration successful. Awaiting admin approval.' : 'Registration successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          createdAt: user.created_at
        },
        tokens
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, email, password_hash, role, status, profile FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check user status
    if (user.status !== 'APPROVED') {
      return res.status(401).json({
        error: 'Account not approved',
        message: `Account status: ${user.status}. Please contact administrator.`
      });
    }

    // Generate tokens
    const tokens = {
      accessToken: jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '8h' }
      ),
      refreshToken: jwt.sign(
        { userId: user.id },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      )
    };

    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          profile: user.profile
        },
        tokens
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
});

// Verify token endpoint
app.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token required',
        message: 'JWT token is required'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user details
    const result = await pool.query(
      'SELECT id, email, role, status FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'User not found',
        message: 'User associated with token not found'
      });
    }

    const user = result.rows[0];

    if (user.status !== 'APPROVED') {
      return res.status(401).json({
        error: 'Account not approved',
        message: 'User account is not approved'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status
        }
      }
    });

  } catch (error) {
    res.status(401).json({
      error: 'Invalid token',
      message: error.message
    });
  }
});

// Get users (admin only)
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, role, status, profile, created_at, last_login FROM users ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: {
        users: result.rows,
        count: result.rows.length
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: error.message
    });
  }
});

// Update user status (admin only)
app.put('/users/:userId/status', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Status must be PENDING, APPROVED, REJECTED, or SUSPENDED'
      });
    }

    const result = await pool.query(
      'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, role, status',
      [status, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User with specified ID not found'
      });
    }

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: {
        user: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      error: 'Failed to update user status',
      message: error.message
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Auth service error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found in auth service`
  });
});

app.listen(PORT, () => {
  console.log(`🔐 FarmTally Auth Service running on port ${PORT}`);
});

module.exports = app;