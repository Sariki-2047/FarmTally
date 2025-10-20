# Farm Admin - Complete Technical Specification

## Overview
This document provides comprehensive technical specifications for the Farm Admin role, covering frontend, backend, database, approvals, notifications, and all development aspects.

## Frontend Architecture

### Technology Stack
- **Framework**: Flutter 3.16+ with Dart 3.0+
- **State Management**: Riverpod for reactive state management
- **UI Library**: Material Design 3 with custom theme
- **Navigation**: GoRouter for declarative routing
- **Forms**: Flutter Form Builder with validation
- **Charts**: FL Chart for analytics dashboards
- **Date Handling**: intl package for date formatting
- **HTTP Client**: Dio with interceptors for API calls
- **Local Database**: SQLite with Drift ORM for offline support

### Flutter Project Structure
```
lib/
├── presentation/
│   ├── pages/
│   │   ├── farm_admin/
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard_page.dart
│   │   │   │   ├── dashboard_widgets.dart
│   │   │   │   └── dashboard_provider.dart
│   │   │   ├── lorries/
│   │   │   │   ├── lorry_list_page.dart
│   │   │   │   ├── lorry_detail_page.dart
│   │   │   │   ├── lorry_form_page.dart
│   │   │   │   └── lorry_providers.dart
│   │   │   ├── requests/
│   │   │   │   ├── request_list_page.dart
│   │   │   │   ├── request_approval_page.dart
│   │   │   │   └── request_providers.dart
│   │   │   ├── managers/
│   │   │   ├── farmers/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   └── common/
│   │       ├── data_table/
│   │       ├── forms/
│   │       ├── charts/
│   │       └── layout/
│   ├── widgets/
│   └── providers/
├── domain/
├── data/
└── core/
```

### Key Frontend Components

#### Dashboard Component
```typescript
interface DashboardProps {
  organizationId: string;
}

interface DashboardData {
  lorryStats: {
    total: number;
    available: number;
    assigned: number;
    maintenance: number;
  };
  managerStats: {
    active: number;
    pendingRequests: number;
    todayActive: number;
  };
  procurementStats: {
    lorries: number;
    farmers: number;
    volume: number;
    revenue: number;
  };
  pendingActions: {
    lorryRequests: number;
    completedLorries: number;
    paymentApprovals: number;
  };
}
```

#### DataTable Component
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading: boolean;
  pagination: PaginationConfig;
  sorting: SortingConfig;
  filtering: FilterConfig;
  selection: SelectionConfig;
  bulkActions: BulkAction<T>[];
  onRowClick?: (row: T) => void;
  onBulkAction?: (action: string, rows: T[]) => void;
}
```

### State Management

#### Redux Store Structure
```typescript
interface RootState {
  auth: AuthState;
  farmAdmin: {
    dashboard: DashboardState;
    lorries: LorryState;
    requests: RequestState;
    managers: ManagerState;
    farmers: FarmerState;
    reports: ReportState;
    settings: SettingsState;
  };
  ui: UIState;
  notifications: NotificationState;
}
```

#### API Integration
```typescript
// RTK Query API definitions
export const farmAdminApi = createApi({
  reducerPath: 'farmAdminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/farm-admin/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Lorry', 'Request', 'Manager', 'Farmer', 'Report'],
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardData, string>({
      query: (orgId) => `dashboard/${orgId}`,
    }),
    getLorries: builder.query<Lorry[], void>({
      query: () => 'lorries',
      providesTags: ['Lorry'],
    }),
    // ... more endpoints
  }),
});
```

## Backend Architecture

### Technology Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 14+
- **ORM**: Prisma
- **Authentication**: JWT + Refresh Tokens
- **Validation**: Joi
- **File Upload**: Multer + AWS S3
- **Email**: SendGrid
- **SMS**: Twilio
- **Caching**: Redis
- **Queue**: Bull Queue with Redis

### API Structure
```
src/
├── controllers/
│   ├── auth.controller.ts
│   ├── dashboard.controller.ts
│   ├── lorry.controller.ts
│   ├── request.controller.ts
│   ├── manager.controller.ts
│   ├── farmer.controller.ts
│   ├── report.controller.ts
│   └── settings.controller.ts
├── middleware/
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   ├── rateLimit.middleware.ts
│   └── audit.middleware.ts
├── services/
│   ├── lorry.service.ts
│   ├── notification.service.ts
│   ├── report.service.ts
│   └── payment.service.ts
├── models/
├── routes/
├── utils/
└── types/
```

### API Endpoints

#### Lorry Management
```typescript
// GET /api/farm-admin/lorries
interface GetLorriesResponse {
  lorries: Lorry[];
  pagination: PaginationMeta;
}

// POST /api/farm-admin/lorries
interface CreateLorryRequest {
  name: string;
  licensePlate: string;
  capacity: number;
  status: LorryStatus;
}

// PUT /api/farm-admin/lorries/:id/assign
interface AssignLorryRequest {
  managerId: string;
  assignmentDate: string;
  notes?: string;
}
```

#### Request Management
```typescript
// GET /api/farm-admin/requests
interface GetRequestsResponse {
  requests: LorryRequest[];
  pagination: PaginationMeta;
}

// PUT /api/farm-admin/requests/:id/approve
interface ApproveRequestRequest {
  lorryId: string;
  approvalNotes?: string;
  conditions?: string[];
}

// PUT /api/farm-admin/requests/:id/reject
interface RejectRequestRequest {
  reason: string;
  alternativeSuggestion?: string;
}
```

### Service Layer

#### Lorry Service
```typescript
class LorryService {
  async createLorry(data: CreateLorryData): Promise<Lorry> {
    // Validation
    const validatedData = await lorrySchema.validateAsync(data);
    
    // Create lorry
    const lorry = await prisma.lorry.create({
      data: {
        ...validatedData,
        organizationId: data.organizationId,
      },
    });
    
    // Audit log
    await this.auditService.log({
      action: 'LORRY_CREATED',
      entityId: lorry.id,
      userId: data.createdBy,
    });
    
    return lorry;
  }
  
  async assignLorry(lorryId: string, managerId: string): Promise<void> {
    // Check availability
    const lorry = await this.getLorryById(lorryId);
    if (lorry.status !== 'AVAILABLE') {
      throw new Error('Lorry not available for assignment');
    }
    
    // Update assignment
    await prisma.lorry.update({
      where: { id: lorryId },
      data: {
        assignedManagerId: managerId,
        status: 'ASSIGNED',
        assignedAt: new Date(),
      },
    });
    
    // Notify manager
    await this.notificationService.sendLorryAssignment(managerId, lorryId);
  }
}
```

## Database Schema

### Core Tables
```sql
-- Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    owner_id UUID NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Users (Farm Admins, Field Managers, Farmers)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    organization_id UUID REFERENCES organizations(id),
    profile JSONB,
    status user_status DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Lorries
CREATE TABLE lorries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    license_plate VARCHAR(50) NOT NULL,
    capacity INTEGER NOT NULL,
    status lorry_status DEFAULT 'AVAILABLE',
    assigned_manager_id UUID REFERENCES users(id),
    assigned_at TIMESTAMP,
    location JSONB,
    maintenance_schedule JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Lorry Requests
CREATE TABLE lorry_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    manager_id UUID NOT NULL REFERENCES users(id),
    required_date DATE NOT NULL,
    priority request_priority DEFAULT 'MEDIUM',
    purpose TEXT NOT NULL,
    estimated_duration INTEGER,
    status request_status DEFAULT 'PENDING',
    assigned_lorry_id UUID REFERENCES lorries(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Farmers
CREATE TABLE farmers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    aadhar_number VARCHAR(20),
    bank_details JSONB,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Farmer Organizations (Many-to-Many)
CREATE TABLE farmer_organizations (
    farmer_id UUID REFERENCES farmers(id),
    organization_id UUID REFERENCES organizations(id),
    join_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    quality_rating DECIMAL(3,2),
    total_deliveries INTEGER DEFAULT 0,
    total_earnings DECIMAL(12,2) DEFAULT 0,
    PRIMARY KEY (farmer_id, organization_id)
);
```--
 Deliveries/Transactions
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    lorry_id UUID NOT NULL REFERENCES lorries(id),
    farmer_id UUID NOT NULL REFERENCES farmers(id),
    manager_id UUID NOT NULL REFERENCES users(id),
    delivery_date DATE NOT NULL,
    bags_count INTEGER NOT NULL,
    individual_weights DECIMAL[] NOT NULL,
    gross_weight DECIMAL(10,2) NOT NULL,
    moisture_content DECIMAL(5,2),
    standard_deduction DECIMAL(10,2) NOT NULL,
    quality_deduction DECIMAL(10,2) DEFAULT 0,
    net_weight DECIMAL(10,2) NOT NULL,
    price_per_kg DECIMAL(8,2) NOT NULL,
    total_value DECIMAL(12,2) NOT NULL,
    advance_amount DECIMAL(12,2) DEFAULT 0,
    interest_charges DECIMAL(12,2) DEFAULT 0,
    final_amount DECIMAL(12,2) NOT NULL,
    status delivery_status DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Advance Payments
CREATE TABLE advance_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    farmer_id UUID NOT NULL REFERENCES farmers(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method payment_method NOT NULL,
    payment_date DATE NOT NULL,
    reference_number VARCHAR(100),
    reason TEXT,
    notes TEXT,
    recorded_by UUID NOT NULL REFERENCES users(id),
    status advance_status DEFAULT 'ACTIVE',
    adjusted_in_delivery UUID REFERENCES deliveries(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Database Indexes
```sql
-- Performance indexes
CREATE INDEX idx_lorries_organization_status ON lorries(organization_id, status);
CREATE INDEX idx_requests_organization_status ON lorry_requests(organization_id, status);
CREATE INDEX idx_deliveries_organization_date ON deliveries(organization_id, delivery_date);
CREATE INDEX idx_farmers_phone ON farmers(phone);
CREATE INDEX idx_advance_payments_farmer_status ON advance_payments(farmer_id, status);
CREATE INDEX idx_audit_logs_organization_date ON audit_logs(organization_id, created_at);

-- Unique constraints
ALTER TABLE lorries ADD CONSTRAINT uk_lorries_license_org UNIQUE(license_plate, organization_id);
ALTER TABLE users ADD CONSTRAINT uk_users_email_org UNIQUE(email, organization_id);
```

## Approval Workflows

### Lorry Request Approval
```typescript
interface ApprovalWorkflow {
  requestId: string;
  currentStage: ApprovalStage;
  approvers: Approver[];
  conditions: ApprovalCondition[];
}

enum ApprovalStage {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ASSIGNED = 'ASSIGNED'
}

class ApprovalService {
  async processLorryRequest(requestId: string, action: ApprovalAction): Promise<void> {
    const request = await this.getRequest(requestId);
    
    switch (action.type) {
      case 'APPROVE':
        await this.approveRequest(request, action.data);
        break;
      case 'REJECT':
        await this.rejectRequest(request, action.reason);
        break;
      case 'REQUEST_INFO':
        await this.requestMoreInfo(request, action.questions);
        break;
    }
    
    // Update audit trail
    await this.auditService.logApproval(requestId, action);
    
    // Send notifications
    await this.notificationService.sendApprovalUpdate(request.managerId, action);
  }
}
```

### Multi-Level Approval Rules
```typescript
interface ApprovalRules {
  lorryRequest: {
    autoApprove: {
      maxDuration: number; // hours
      trustedManagers: string[];
    };
    requireApproval: {
      minDuration: number;
      highPriorityRequests: boolean;
      newManagers: boolean;
    };
  };
  advancePayments: {
    autoApprove: {
      maxAmount: number;
      trustedManagers: string[];
    };
    requireApproval: {
      minAmount: number;
      dailyLimit: number;
    };
  };
}
```

## Notification System

### Notification Types
```typescript
enum NotificationType {
  LORRY_REQUEST_RECEIVED = 'LORRY_REQUEST_RECEIVED',
  LORRY_REQUEST_APPROVED = 'LORRY_REQUEST_APPROVED',
  LORRY_REQUEST_REJECTED = 'LORRY_REQUEST_REJECTED',
  LORRY_ASSIGNED = 'LORRY_ASSIGNED',
  LORRY_SUBMITTED = 'LORRY_SUBMITTED',
  PAYMENT_DUE = 'PAYMENT_DUE',
  ADVANCE_RECORDED = 'ADVANCE_RECORDED',
  SYSTEM_ALERT = 'SYSTEM_ALERT'
}

interface NotificationTemplate {
  type: NotificationType;
  channels: NotificationChannel[];
  template: {
    email?: EmailTemplate;
    sms?: SMSTemplate;
    push?: PushTemplate;
    inApp?: InAppTemplate;
  };
  triggers: NotificationTrigger[];
}
```

### Notification Service
```typescript
class NotificationService {
  async sendLorryRequestNotification(adminId: string, request: LorryRequest): Promise<void> {
    const admin = await this.userService.getById(adminId);
    
    // In-app notification
    await this.createInAppNotification({
      userId: adminId,
      type: NotificationType.LORRY_REQUEST_RECEIVED,
      title: 'New Lorry Request',
      message: `${request.manager.name} requested a lorry for ${request.requiredDate}`,
      data: { requestId: request.id },
    });
    
    // Email notification
    if (admin.preferences.emailNotifications) {
      await this.emailService.send({
        to: admin.email,
        template: 'lorry-request-received',
        data: {
          managerName: request.manager.name,
          requiredDate: request.requiredDate,
          purpose: request.purpose,
          requestUrl: `${process.env.APP_URL}/admin/requests/${request.id}`,
        },
      });
    }
    
    // SMS notification for urgent requests
    if (request.priority === 'HIGH' && admin.preferences.smsNotifications) {
      await this.smsService.send({
        to: admin.phone,
        message: `Urgent: ${request.manager.name} needs lorry for ${request.requiredDate}. Check app for details.`,
      });
    }
  }
  
  async sendBulkNotifications(notifications: BulkNotification[]): Promise<void> {
    // Queue bulk notifications for processing
    await this.queueService.addBulk('notifications', notifications);
  }
}
```

### Real-time Notifications
```typescript
// WebSocket implementation
class WebSocketService {
  private io: Server;
  
  constructor(server: http.Server) {
    this.io = new Server(server, {
      cors: { origin: process.env.FRONTEND_URL },
    });
    
    this.io.use(this.authenticateSocket);
    this.setupEventHandlers();
  }
  
  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      socket.on('join-organization', (orgId) => {
        socket.join(`org-${orgId}`);
      });
      
      socket.on('join-user', (userId) => {
        socket.join(`user-${userId}`);
      });
    });
  }
  
  async notifyOrganization(orgId: string, event: string, data: any): Promise<void> {
    this.io.to(`org-${orgId}`).emit(event, data);
  }
  
  async notifyUser(userId: string, event: string, data: any): Promise<void> {
    this.io.to(`user-${userId}`).emit(event, data);
  }
}
```

## Security Implementation

### Authentication & Authorization
```typescript
// JWT middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user as JWTPayload;
    next();
  });
};

// Role-based authorization
export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Organization access control
export const requireOrganizationAccess = async (req: Request, res: Response, next: NextFunction) => {
  const orgId = req.params.organizationId || req.body.organizationId;
  
  if (req.user.role === 'FARM_ADMIN' && req.user.organizationId !== orgId) {
    return res.status(403).json({ error: 'Access denied to organization' });
  }
  
  next();
};
```

### Data Validation
```typescript
// Joi schemas
export const lorrySchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  licensePlate: Joi.string().required().pattern(/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/),
  capacity: Joi.number().required().min(100).max(10000),
  status: Joi.string().valid('AVAILABLE', 'ASSIGNED', 'MAINTENANCE'),
});

export const requestSchema = Joi.object({
  requiredDate: Joi.date().required().min('now'),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').default('MEDIUM'),
  purpose: Joi.string().required().min(10).max(500),
  estimatedDuration: Joi.number().min(1).max(168), // max 1 week
});

// Validation middleware
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message),
      });
    }
    
    req.body = value;
    next();
  };
};
```

## Performance Optimization

### Caching Strategy
```typescript
// Redis caching
class CacheService {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
  }
  
  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
  
  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

// Cache implementation in services
class LorryService {
  async getLorries(orgId: string): Promise<Lorry[]> {
    const cacheKey = `lorries:${orgId}`;
    
    // Try cache first
    let lorries = await this.cacheService.get<Lorry[]>(cacheKey);
    
    if (!lorries) {
      // Fetch from database
      lorries = await prisma.lorry.findMany({
        where: { organizationId: orgId },
        include: { assignedManager: true },
      });
      
      // Cache for 5 minutes
      await this.cacheService.set(cacheKey, lorries, 300);
    }
    
    return lorries;
  }
}
```

### Database Optimization
```typescript
// Connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'info', 'warn', 'error'],
});

// Query optimization
class ReportService {
  async getDashboardStats(orgId: string): Promise<DashboardStats> {
    // Use raw SQL for complex aggregations
    const stats = await prisma.$queryRaw`
      SELECT 
        COUNT(CASE WHEN l.status = 'AVAILABLE' THEN 1 END) as available_lorries,
        COUNT(CASE WHEN l.status = 'ASSIGNED' THEN 1 END) as assigned_lorries,
        COUNT(CASE WHEN l.status = 'MAINTENANCE' THEN 1 END) as maintenance_lorries,
        COUNT(DISTINCT fm.id) as active_managers,
        COUNT(CASE WHEN lr.status = 'PENDING' THEN 1 END) as pending_requests,
        COALESCE(SUM(d.final_amount), 0) as total_revenue
      FROM lorries l
      LEFT JOIN users fm ON l.assigned_manager_id = fm.id
      LEFT JOIN lorry_requests lr ON lr.organization_id = l.organization_id AND lr.status = 'PENDING'
      LEFT JOIN deliveries d ON d.organization_id = l.organization_id AND d.delivery_date = CURRENT_DATE
      WHERE l.organization_id = ${orgId}
    `;
    
    return stats[0];
  }
}
```

## Testing Strategy

### Unit Tests
```typescript
// Jest + Supertest
describe('LorryController', () => {
  let app: Express;
  let prisma: PrismaClient;
  
  beforeAll(async () => {
    app = createTestApp();
    prisma = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });
  });
  
  beforeEach(async () => {
    await cleanDatabase(prisma);
    await seedTestData(prisma);
  });
  
  describe('POST /api/farm-admin/lorries', () => {
    it('should create a new lorry', async () => {
      const lorryData = {
        name: 'Test Lorry',
        licensePlate: 'KA01AB1234',
        capacity: 5000,
      };
      
      const response = await request(app)
        .post('/api/farm-admin/lorries')
        .set('Authorization', `Bearer ${getTestToken('FARM_ADMIN')}`)
        .send(lorryData)
        .expect(201);
      
      expect(response.body.name).toBe(lorryData.name);
      expect(response.body.licensePlate).toBe(lorryData.licensePlate);
    });
    
    it('should validate license plate format', async () => {
      const lorryData = {
        name: 'Test Lorry',
        licensePlate: 'INVALID',
        capacity: 5000,
      };
      
      await request(app)
        .post('/api/farm-admin/lorries')
        .set('Authorization', `Bearer ${getTestToken('FARM_ADMIN')}`)
        .send(lorryData)
        .expect(400);
    });
  });
});
```

### Integration Tests
```typescript
describe('Lorry Request Workflow', () => {
  it('should complete full request approval workflow', async () => {
    // 1. Field Manager creates request
    const requestResponse = await request(app)
      .post('/api/field-manager/requests')
      .set('Authorization', `Bearer ${getFieldManagerToken()}`)
      .send({
        requiredDate: '2024-02-01',
        purpose: 'Corn procurement',
        estimatedDuration: 8,
      })
      .expect(201);
    
    const requestId = requestResponse.body.id;
    
    // 2. Farm Admin approves request
    await request(app)
      .put(`/api/farm-admin/requests/${requestId}/approve`)
      .set('Authorization', `Bearer ${getFarmAdminToken()}`)
      .send({
        lorryId: testLorryId,
        approvalNotes: 'Approved for procurement',
      })
      .expect(200);
    
    // 3. Verify lorry assignment
    const lorryResponse = await request(app)
      .get(`/api/farm-admin/lorries/${testLorryId}`)
      .set('Authorization', `Bearer ${getFarmAdminToken()}`)
      .expect(200);
    
    expect(lorryResponse.body.status).toBe('ASSIGNED');
    expect(lorryResponse.body.assignedManagerId).toBe(testManagerId);
  });
});
```

## Deployment & DevOps

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Configuration
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/cornprocurement
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=cornprocurement
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to AWS
        run: |
          # Deploy using AWS CLI or other deployment tools
          aws ecs update-service --cluster prod --service corn-procurement --force-new-deployment
```

This completes the comprehensive Farm Admin technical specification covering all aspects of development and deployment.