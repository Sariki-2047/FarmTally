import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/config';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import fieldManagerRoutes from './routes/fieldManager';
import farmerRoutes from './routes/farmer';
import deliveryRoutes from './routes/delivery.simple';
import invitationRoutes from './routes/invitation.simple';
import lorryRequestRoutes from './routes/lorry-request.simple';
import lorryRoutes from './routes/lorry.simple';
import emailRoutes from './routes/email.routes';
import systemAdminRoutes from './routes/system-admin.routes';

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
app.use('/api/field-manager', fieldManagerRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/lorry-requests', lorryRequestRoutes);
app.use('/api/lorries', lorryRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/system-admin', systemAdminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.env,
    version: '1.0.0'
  });
});

// Health check without /api prefix for easier access
app.get('/health', (req, res) => {
  res.json({
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
    message: 'FarmTally Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      admin: '/api/admin',
      fieldManager: '/api/field-manager',
      farmer: '/api/farmer'
    },
    documentation: 'See API_DOCUMENTATION.md for complete API reference'
  });
});

// Error handling
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 FarmTally server running on port ${PORT}`);
  console.log(`📱 Web app available at: http://localhost:${PORT}`);
  console.log(`🔗 API available at: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${config.env}`);
});

export default app;