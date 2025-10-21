import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

// Basic API endpoint - UPDATED to show PostgreSQL readiness
app.get('/api', (req, res) => {
  res.json({
    message: 'FarmTally API is working',
    status: 'success',
    database: 'PostgreSQL',
    version: 'Area 1 - Database Ready',
    endpoints: {
      health: '/health',
      dbHealth: '/api/health/db',
      users: '/api/users',
      organizations: '/api/organizations'
    }
  });
});

// Mock database health check (without actual PostgreSQL connection)
app.get('/api/health/db', (req, res) => {
  res.json({
    status: 'ready',
    message: 'PostgreSQL connection configured',
    database: 'PostgreSQL',
    note: 'Schema will be applied after successful deployment'
  });
});

// Mock users endpoint
app.get('/api/users', (req, res) => {
  res.json({
    status: 'success',
    data: [],
    count: 0,
    message: 'Users endpoint ready - schema pending'
  });
});

// Mock organizations endpoint
app.get('/api/organizations', (req, res) => {
  res.json({
    status: 'success',
    data: [],
    count: 0,
    message: 'Organizations endpoint ready - schema pending'
  });
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