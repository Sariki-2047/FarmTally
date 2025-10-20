import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  console.log('📝 Headers:', req.headers);
  console.log('📝 Body:', req.body);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: 'v1'
  });
});

// Test endpoint for Flutter app (before auth middleware)
app.get('/api/v1/test', (req, res) => {
  console.log('🧪 GET /api/v1/test called');
  res.json({
    success: true,
    message: 'Backend connection successful',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/v1/test', (req, res) => {
  console.log('🧪 POST /api/v1/test called with body:', req.body);
  res.json({
    success: true,
    message: 'POST request successful',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// Simple debug endpoint
app.all('/api/v1/debug', (req, res) => {
  console.log('🐛 DEBUG endpoint called:', {
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: req.query
  });
  res.json({
    success: true,
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: req.query,
    timestamp: new Date().toISOString()
  });
});

// Auth middleware
const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Auth routes
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login request received:', req.body);
    const { email, phone, password } = req.body;

    // Validate required fields
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone is required'
      });
    }

    // Determine the identifier (email or phone)
    const identifier = email || phone;
    console.log('🔐 Login attempt for:', identifier);

    // For demo purposes, create a mock user response
    if (identifier === 'admin@farmtally.com' && password === 'Admin123!') {
      const user = {
        id: '26f8a54b-53c3-495d-a357-f3df4866b0e3',
        email: 'admin@farmtally.com',
        phone: null,
        role: 'FARM_ADMIN',
        organizationId: 'f4c9752f-3aa7-4b8c-9c1e-8d5f2a1b3c4d',
        firstName: 'Farm',
        lastName: 'Admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        organization: {
          id: 'f4c9752f-3aa7-4b8c-9c1e-8d5f2a1b3c4d',
          name: 'Demo Farm Organization',
          type: 'FARM',
          status: 'ACTIVE'
        }
      };

      const accessToken = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role, 
          organizationId: user.organizationId 
        },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: 28800 // 8 hours in seconds
          }
        }
      });
    }

    // Field Manager demo user
    if (identifier === 'manager@farmtally.com' && password === 'Manager123!') {
      const user = {
        id: '36f8a54b-53c3-495d-a357-f3df4866b0e4',
        email: 'manager@farmtally.com',
        phone: null,
        role: 'FIELD_MANAGER',
        organizationId: 'f4c9752f-3aa7-4b8c-9c1e-8d5f2a1b3c4d',
        firstName: 'Field',
        lastName: 'Manager',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        organization: {
          id: 'f4c9752f-3aa7-4b8c-9c1e-8d5f2a1b3c4d',
          name: 'Demo Farm Organization',
          type: 'FARM',
          status: 'ACTIVE'
        }
      };

      const accessToken = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role, 
          organizationId: user.organizationId 
        },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: 28800
          }
        }
      });
    }

    // Farmer demo user
    if (identifier === 'farmer@farmtally.com' && password === 'Farmer123!') {
      const user = {
        id: '46f8a54b-53c3-495d-a357-f3df4866b0e5',
        email: 'farmer@farmtally.com',
        phone: null,
        role: 'FARMER',
        organizationId: 'f4c9752f-3aa7-4b8c-9c1e-8d5f2a1b3c4d',
        firstName: 'Demo',
        lastName: 'Farmer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        organization: {
          id: 'f4c9752f-3aa7-4b8c-9c1e-8d5f2a1b3c4d',
          name: 'Demo Farm Organization',
          type: 'FARM',
          status: 'ACTIVE'
        }
      };

      const accessToken = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role, 
          organizationId: user.organizationId 
        },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: 28800
          }
        }
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Logout endpoint
app.post('/api/v1/auth/logout', authMiddleware, (req: any, res: any) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Lorry Request endpoints
app.get('/api/v1/lorry-requests', authMiddleware, (req: any, res: any) => {
  const mockRequests = [
    {
      id: '1',
      fieldManagerId: '36f8a54b-53c3-495d-a357-f3df4866b0e4',
      fieldManagerName: 'Field Manager',
      organizationId: 'f4c9752f-3aa7-4b8c-9c1e-8d5f2a1b3c4d',
      requestedLocation: 'Village A, District B',
      requestedDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      purpose: 'Corn collection from farmers',
      estimatedFarmers: 5,
      estimatedWeight: 2500,
      status: 'pending',
      assignedLorryId: null,
      assignedLorryNumber: null,
      approvedBy: null,
      approvedAt: null,
      rejectionReason: null,
      notes: 'Need early morning pickup',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      fieldManagerId: '36f8a54b-53c3-495d-a357-f3df4866b0e4',
      fieldManagerName: 'Field Manager',
      organizationId: 'f4c9752f-3aa7-4b8c-9c1e-8d5f2a1b3c4d',
      requestedLocation: 'Village C, District D',
      requestedDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      purpose: 'Weekly corn procurement',
      estimatedFarmers: 8,
      estimatedWeight: 4000,
      status: 'approved',
      assignedLorryId: '1',
      assignedLorryNumber: 'ABC-123',
      approvedBy: '26f8a54b-53c3-495d-a357-f3df4866b0e3',
      approvedAt: new Date().toISOString(),
      rejectionReason: null,
      notes: null,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Filter by status if provided
  const { status, fieldManagerId } = req.query;
  let filteredRequests = mockRequests;
  
  if (status && status !== 'all') {
    filteredRequests = filteredRequests.filter(r => r.status === status);
  }
  
  if (fieldManagerId) {
    filteredRequests = filteredRequests.filter(r => r.fieldManagerId === fieldManagerId);
  }

  res.json({
    success: true,
    data: filteredRequests
  });
});

app.post('/api/v1/lorry-requests', authMiddleware, (req: any, res: any) => {
  const { requestedLocation, requestedDate, purpose, estimatedFarmers, estimatedWeight, notes } = req.body;
  
  const newRequest = {
    id: Date.now().toString(),
    fieldManagerId: req.user.id,
    fieldManagerName: `${req.user.firstName || 'Field'} ${req.user.lastName || 'Manager'}`,
    organizationId: req.user.organizationId,
    requestedLocation,
    requestedDate,
    purpose,
    estimatedFarmers,
    estimatedWeight,
    status: 'pending',
    assignedLorryId: null,
    assignedLorryNumber: null,
    approvedBy: null,
    approvedAt: null,
    rejectionReason: null,
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: newRequest,
    message: 'Lorry request created successfully'
  });
});

app.post('/api/v1/lorry-requests/:id/approve', authMiddleware, (req: any, res: any) => {
  const { lorryId } = req.body;
  const requestId = req.params.id;
  
  const updatedRequest = {
    id: requestId,
    fieldManagerId: '36f8a54b-53c3-495d-a357-f3df4866b0e4',
    fieldManagerName: 'Field Manager',
    organizationId: req.user.organizationId,
    requestedLocation: 'Village A, District B',
    requestedDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    purpose: 'Corn collection from farmers',
    estimatedFarmers: 5,
    estimatedWeight: 2500,
    status: 'approved',
    assignedLorryId: lorryId,
    assignedLorryNumber: 'ABC-123',
    approvedBy: req.user.id,
    approvedAt: new Date().toISOString(),
    rejectionReason: null,
    notes: 'Need early morning pickup',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: updatedRequest,
    message: 'Lorry request approved successfully'
  });
});

app.post('/api/v1/lorry-requests/:id/reject', authMiddleware, (req: any, res: any) => {
  const { rejectionReason } = req.body;
  const requestId = req.params.id;
  
  const updatedRequest = {
    id: requestId,
    fieldManagerId: '36f8a54b-53c3-495d-a357-f3df4866b0e4',
    fieldManagerName: 'Field Manager',
    organizationId: req.user.organizationId,
    requestedLocation: 'Village A, District B',
    requestedDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    purpose: 'Corn collection from farmers',
    estimatedFarmers: 5,
    estimatedWeight: 2500,
    status: 'rejected',
    assignedLorryId: null,
    assignedLorryNumber: null,
    approvedBy: null,
    approvedAt: null,
    rejectionReason,
    notes: 'Need early morning pickup',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: updatedRequest,
    message: 'Lorry request rejected'
  });
});

// Mock data endpoints for testing
app.get('/api/v1/organizations/:orgId/farmers', authMiddleware, (req: any, res: any) => {
  const mockFarmers = [
    {
      id: '1',
      name: 'John Doe',
      phone: '+1234567890',
      email: 'john@example.com',
      address: '123 Farm Road',
      idNumber: 'ID123456',
      bankDetails: {
        accountNumber: '1234567890',
        bankName: 'Demo Bank',
        ifscCode: 'DEMO0001',
        accountHolderName: 'John Doe'
      },
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Jane Smith',
      phone: '+1234567891',
      email: 'jane@example.com',
      address: '456 Farm Lane',
      idNumber: 'ID123457',
      bankDetails: {
        accountNumber: '1234567891',
        bankName: 'Demo Bank',
        ifscCode: 'DEMO0001',
        accountHolderName: 'Jane Smith'
      },
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  res.json({
    success: true,
    data: {
      farmers: mockFarmers,
      total: mockFarmers.length,
      page: 1,
      limit: 20
    }
  });
});

app.get('/api/v1/lorries', authMiddleware, (req: any, res: any) => {
  const mockLorries = [
    {
      id: '1',
      organizationId: req.user.organizationId,
      lorryNumber: 'ABC-123',
      driverName: 'Driver One',
      capacity: 5000,
      status: 'AVAILABLE',
      assignedManagerId: null,
      assignedAt: null,
      location: null,
      maintenanceSchedule: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedManager: null
    },
    {
      id: '2',
      organizationId: req.user.organizationId,
      lorryNumber: 'XYZ-789',
      driverName: 'Driver Two',
      capacity: 7000,
      status: 'AVAILABLE',
      assignedManagerId: null,
      assignedAt: null,
      location: null,
      maintenanceSchedule: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedManager: null
    },
    {
      id: '3',
      organizationId: req.user.organizationId,
      lorryNumber: 'DEF-456',
      driverName: 'Driver Three',
      capacity: 6000,
      status: 'ASSIGNED',
      assignedManagerId: req.user.id,
      assignedAt: new Date().toISOString(),
      location: null,
      maintenanceSchedule: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedManager: {
        id: req.user.id,
        name: 'Field Manager',
        email: 'manager@farmtally.com',
        phone: null,
        role: 'FIELD_MANAGER'
      }
    }
  ];

  res.json({
    success: true,
    data: mockLorries
  });
});

app.get('/api/v1/organizations/:orgId/lorries', authMiddleware, (req: any, res: any) => {
  const mockLorries = [
    {
      id: '1',
      organizationId: req.params.orgId,
      name: 'Lorry 1',
      licensePlate: 'ABC-123',
      capacity: 5000,
      status: 'AVAILABLE',
      assignedManagerId: null,
      assignedAt: null,
      location: null,
      maintenanceSchedule: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedManager: null
    },
    {
      id: '2',
      organizationId: req.params.orgId,
      name: 'Lorry 2',
      licensePlate: 'XYZ-789',
      capacity: 7000,
      status: 'ASSIGNED',
      assignedManagerId: req.user.id,
      assignedAt: new Date().toISOString(),
      location: null,
      maintenanceSchedule: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedManager: {
        id: req.user.id,
        name: 'Field Manager',
        email: 'manager@farmtally.com',
        phone: null,
        role: 'FIELD_MANAGER'
      }
    }
  ];

  res.json({
    success: true,
    data: {
      lorries: mockLorries,
      total: mockLorries.length,
      page: 1,
      limit: 20
    }
  });
});

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Demo credentials:`);
  console.log(`   Farm Admin: admin@farmtally.com / Admin123!`);
  console.log(`   Field Manager: manager@farmtally.com / Manager123!`);
  console.log(`   Farmer: farmer@farmtally.com / Farmer123!`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});