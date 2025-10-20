import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config();

// Initialize Firebase
import FirebaseService from './config/firebase';
try {
  FirebaseService.getInstance().initialize();
} catch (error) {
  console.warn('Firebase initialization failed:', error);
}

// Import middleware and routes
import { errorHandler } from './middleware/error.middleware';
import { authMiddleware } from './middleware/auth.middleware';
import { auditMiddleware } from './middleware/audit.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import organizationRoutes from './routes/organization.routes';
import lorryRoutes from './routes/lorry.routes';
import lorryRequestRoutes from './routes/lorry-request.routes';
import deliveryRoutes from './routes/delivery.routes';
// import reportRoutes from './routes/report.routes'; // Temporarily disabled
import farmAdminRoutes from './routes/farm-admin.routes';
import fieldManagerRoutes from './routes/field-manager.routes';
import farmerRoutes from './routes/farmer.routes';
import notificationRoutes from './routes/notifications';
import emailRoutes from './routes/email';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Audit logging middleware
app.use('/api', auditMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1'
  });
});

// API routes
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`/api/${apiVersion}/auth`, authRoutes);
app.use(`/api/${apiVersion}/organizations`, organizationRoutes);
app.use(`/api/${apiVersion}`, lorryRoutes);
app.use(`/api/${apiVersion}`, lorryRequestRoutes);
// Farmer routes are handled by role-specific routes below
app.use(`/api/${apiVersion}`, deliveryRoutes);
// app.use(`/api/${apiVersion}/reports`, reportRoutes); // Temporarily disabled due to TypeScript errors
app.use(`/api/${apiVersion}/farm-admin`, authMiddleware, farmAdminRoutes);
app.use(`/api/${apiVersion}/field-manager`, authMiddleware, fieldManagerRoutes);
app.use(`/api/${apiVersion}/farmer`, authMiddleware, farmerRoutes);
app.use(`/api/${apiVersion}/notifications`, notificationRoutes);
app.use(`/api/${apiVersion}/email`, emailRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-organization', (organizationId: string) => {
    socket.join(`org-${organizationId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

const PORT = parseInt(process.env.PORT || '3000');

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FarmTally Backend Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/${apiVersion}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🌐 Server accessible at: http://0.0.0.0:${PORT}`);
});

export { io };
export default app;