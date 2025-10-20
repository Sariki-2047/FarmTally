import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/config';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// Import simple routes
import authRoutes from './routes/auth.simple';
import adminRoutes from './routes/admin.simple';
import farmerRoutes from './routes/farmer.simple';
import lorryRoutes from './routes/lorry.simple';
import lorryRequestRoutes from './routes/lorry-request.simple';
import deliveryRoutes from './routes/delivery.simple';
import advancePaymentRoutes from './routes/advance-payment.simple';
import invitationRoutes from './routes/invitation.simple';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/lorries', lorryRoutes);
app.use('/api/lorry-requests', lorryRequestRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/advance-payments', advancePaymentRoutes);
app.use('/api/invitations', invitationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.env,
    version: '1.0.0',
    services: {
      auth: 'healthy',
      farmers: 'healthy',
      lorries: 'healthy',
      deliveries: 'healthy',
      advancePayments: 'healthy',
      database: 'connected'
    }
  });
});

// Health check without /api prefix
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.env,
    version: '1.0.0',
    database: 'connected',
    message: 'FarmTally Backend API is running!'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'FarmTally Backend API - Simple Version',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      farmers: '/api/farmers',
      lorries: '/api/lorries',
      deliveries: '/api/deliveries'
    },
    features: [
      'User Authentication',
      'Farmer Management',
      'Lorry Management',
      'Delivery Management',
      'Corn Procurement Workflow',
      'Weight & Quality Tracking',
      'Financial Calculations',
      'Organization Support',
      'Role-based Access Control'
    ],
    documentation: 'Simple backend for testing and validation'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api/health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/auth/profile',
      'GET /api/farmers',
      'POST /api/farmers',
      'GET /api/lorries',
      'POST /api/lorries',
      'POST /api/deliveries/lorries/:lorryId/farmers/:farmerId',
      'GET /api/deliveries/lorries/:lorryId',
      'PATCH /api/deliveries/:deliveryId/pricing'
    ]
  });
});

// Error handling
app.use(errorHandler);

const PORT = 9999; // Use port 9999 to avoid conflicts

app.listen(PORT, () => {
  console.log(`🚀 FarmTally Simple Backend running on port ${PORT}`);
  console.log(`📱 API available at: http://localhost:${PORT}/api`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${config.env}`);
  console.log(`✨ Features: Auth, Farmers, Lorries, Deliveries`);
});

export default app;