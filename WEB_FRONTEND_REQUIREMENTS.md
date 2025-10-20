# FarmTally Web Frontend Requirements

## Overview
Comprehensive requirements for four role-based web dashboards: Application Admin, Farm Admin, Field Manager, and Farmer. Each dashboard provides role-specific functionality with responsive design and real-time updates.

## Technology Stack Requirements

### Frontend Framework
- **React 18+** with TypeScript for type safety
- **Next.js 14+** for SSR, routing, and API integration
- **Tailwind CSS** for responsive design and Material Design 3 components
- **Shadcn/ui** for consistent UI components
- **React Query (TanStack Query)** for server state management
- **Zustand** for client state management
- **React Hook Form** with Zod validation
- **Recharts** for analytics and reporting
- **Socket.io Client** for real-time updates

### Authentication & Security
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Protected routes with middleware
- Session management with automatic logout
- HTTPS enforcement in production

### Performance & UX
- Progressive Web App (PWA) capabilities
- Offline support for critical operations
- Responsive design (mobile-first approach)
- Loading states and skeleton screens
- Error boundaries and graceful error handling
- Optimistic updates for better UX

## 1. Application Admin Dashboard

### Purpose
System-wide administration and Farm Admin approval management.

### Core Features

#### 1.1 Dashboard Overview
```typescript
interface AdminDashboardStats {
  totalOrganizations: number;
  totalFarmAdmins: number;
  pendingApprovals: number;
  totalFieldManagers: number;
  totalFarmers: number;
  totalDeliveries: number;
  totalAdvancePayments: number;
}
```

**Components:**
- System statistics cards with trend indicators
- Pending approvals alert banner
- Recent activity feed
- System health monitoring
- Quick action buttons

#### 1.2 Farm Admin Management
**Pending Approvals:**
- List of pending Farm Admin registrations
- Detailed review modal with organization information
- Bulk approval/rejection actions
- Approval history and audit trail

**All Farm Admins:**
- Searchable and filterable table
- Status indicators (Pending, Approved, Rejected, Suspended)
- Organization details and contact information
- Action buttons (Approve, Reject, Suspend, View Details)

#### 1.3 System Analytics
- Organization growth metrics
- User registration trends
- System usage statistics
- Performance monitoring dashboard

#### 1.4 System Configuration
- Global settings management
- Email template configuration
- System maintenance mode
- Backup and restore operations

### API Endpoints Used
```typescript
// Admin Service Endpoints
GET /api/admin/stats
GET /api/admin/pending-farm-admins
POST /api/admin/review-farm-admin
GET /api/admin/all-farm-admins
POST /api/admin/create-application-admin
```

## 2. Farm Admin Dashboard

### Purpose
Organization management, lorry operations, and business oversight.

### Core Features

#### 2.1 Dashboard Overview
```typescript
interface FarmAdminDashboardData {
  organizationStats: {
    totalLorries: number;
    activeLorries: number;
    totalFieldManagers: number;
    totalFarmers: number;
    totalDeliveries: number;
    pendingDeliveries: number;
    totalAdvancePayments: number;
  };
  recentActivity: Activity[];
  pendingApprovals: LorryRequest[];
}
```

**Components:**
- Organization overview cards
- Lorry status distribution chart
- Recent deliveries timeline
- Financial summary widgets
- Quick action dashboard

#### 2.2 Lorry Management
**Lorry Fleet:**
- Lorry inventory with status tracking
- Add/edit/delete lorry operations
- Assign lorries to field managers
- Lorry utilization analytics

**Lorry Requests:**
- Pending requests from field managers
- Request approval/rejection workflow
- Request details and justification
- Assignment to available lorries

#### 2.3 Delivery Management
**Submitted Lorries:**
- List of lorries submitted by field managers
- Delivery details review and processing
- Quality assessment and deduction setting
- Pricing configuration per delivery

**Delivery Processing:**
- Individual delivery review interface
- Weight verification and adjustment
- Quality grading system
- Financial calculation preview

#### 2.4 Financial Management
**Advance Payments:**
- Create advance payments for farmers
- Advance payment history and tracking
- Interest calculation and management
- Payment reconciliation

**Settlement Processing:**
- Final payment calculations
- Settlement report generation
- Payment status tracking
- Financial analytics and reporting

#### 2.5 Farmer Management
- Farmer database management
- Multi-organization farmer relationships
- Farmer performance analytics
- Communication and notification management

#### 2.6 Field Manager Management
- Field manager invitation system
- Performance monitoring
- Assignment and territory management
- Activity tracking and reporting

#### 2.7 Reports & Analytics
- Comprehensive reporting dashboard
- Custom report builder
- Export functionality (PDF, Excel, CSV)
- Scheduled report delivery

### API Endpoints Used
```typescript
// Lorry Management
GET /api/lorries
POST /api/lorries
PUT /api/lorries/:id
DELETE /api/lorries/:id
PUT /api/lorries/:id/status

// Delivery Management
GET /api/deliveries/lorry/:lorryId
PUT /api/deliveries/:id/quality-deduction
PUT /api/deliveries/:id/pricing
POST /api/deliveries/mark-sent-to-dealer/:lorryId

// Advance Payments
POST /api/advance-payments
GET /api/advance-payments/farmer/:farmerId
GET /api/advance-payments/summary

// Farmer Management
GET /api/farmers
POST /api/farmers
PUT /api/farmers/:id
DELETE /api/farmers/:id

// Invitations
POST /api/invitations
GET /api/invitations
```

## 3. Field Manager Dashboard

### Purpose
Field operations, farmer coordination, and delivery data entry.

### Core Features

#### 3.1 Dashboard Overview
```typescript
interface FieldManagerDashboardData {
  assignedLorries: Lorry[];
  todayDeliveries: Delivery[];
  pendingRequests: LorryRequest[];
  farmerStats: {
    totalFarmers: number;
    activeToday: number;
    pendingDeliveries: number;
  };
}
```

**Components:**
- Assigned lorries status cards
- Today's delivery schedule
- Farmer activity summary
- Weather and field conditions
- Quick delivery entry form

#### 3.2 Lorry Operations
**Lorry Requests:**
- Request lorry for procurement operations
- Specify location, date, and estimated volume
- Track request status and approvals
- Modify or cancel pending requests

**Assigned Lorries:**
- View assigned lorries and their status
- Lorry capacity and current load tracking
- Submit completed lorries for processing
- Lorry operation history

#### 3.3 Delivery Management
**Add Farmers to Lorry:**
- Search and select farmers
- Record delivery details:
  - Individual bag weights
  - Total bags count
  - Moisture content measurement
  - Quality assessment
  - Photos and notes
- Real-time weight calculations
- Delivery validation and submission

**Delivery Tracking:**
- View all deliveries for assigned lorries
- Edit pending deliveries
- Track delivery status progression
- Delivery history and analytics

#### 3.4 Farmer Coordination
**Farmer Database:**
- Search farmers by name, phone, or location
- Add new farmers to the system
- View farmer delivery history
- Farmer contact management

**Communication:**
- Send notifications to farmers
- Schedule pickup appointments
- Coordinate delivery logistics
- Farmer feedback collection

#### 3.5 Advance Payment Recording
- Record advance payments given to farmers
- Track advance payment history
- Calculate outstanding balances
- Generate advance payment receipts

#### 3.6 Mobile-Optimized Interface
- Touch-friendly data entry forms
- Offline capability for field operations
- GPS location tracking
- Camera integration for photos
- Voice notes and dictation

### API Endpoints Used
```typescript
// Lorry Requests
POST /api/lorry-requests
GET /api/lorry-requests/my-requests
PUT /api/lorry-requests/:id

// Deliveries
POST /api/deliveries/add-farmer-to-lorry
GET /api/deliveries/lorry/:lorryId
PUT /api/deliveries/:id
DELETE /api/deliveries/:id
POST /api/deliveries/submit-lorry/:lorryId

// Farmers
GET /api/farmers
POST /api/farmers
GET /api/farmers/search

// Advance Payments
POST /api/advance-payments
GET /api/advance-payments/farmer/:farmerId
```

## 4. Farmer Dashboard

### Purpose
Multi-organization delivery tracking, payment history, and performance monitoring.

### Core Features

#### 4.1 Dashboard Overview
```typescript
interface FarmerDashboardData {
  organizations: Organization[];
  upcomingDeliveries: Delivery[];
  recentPayments: Payment[];
  totalAdvanceBalance: number;
  performanceMetrics: {
    totalDeliveries: number;
    averageQuality: string;
    totalEarnings: number;
    thisMonthDeliveries: number;
  };
}
```

**Components:**
- Multi-organization selector
- Upcoming delivery schedule
- Payment summary cards
- Quality performance indicators
- Recent activity timeline

#### 4.2 Multi-Organization Management
**Organization Switching:**
- Dropdown selector for different organizations
- Organization-specific data filtering
- Separate dashboards per organization
- Unified view across all organizations

**Organization Relationships:**
- View all connected organizations
- Organization contact information
- Relationship status and history
- Performance comparison across organizations

#### 4.3 Delivery Tracking
**Delivery History:**
- Comprehensive delivery records
- Delivery details and documentation
- Quality assessments and feedback
- Weight and pricing information

**Upcoming Deliveries:**
- Scheduled pickup appointments
- Lorry assignment notifications
- Delivery preparation checklists
- Location and timing details

#### 4.4 Financial Management
**Payment History:**
- Complete payment transaction history
- Settlement details and breakdowns
- Advance payment tracking
- Payment status and dates

**Advance Balance Tracking:**
- Current advance balance per organization
- Advance payment history
- Interest calculations and charges
- Balance reconciliation

#### 4.5 Performance Analytics
**Quality Metrics:**
- Quality grade distribution
- Moisture content trends
- Rejection rate analysis
- Improvement recommendations

**Earnings Analytics:**
- Monthly and yearly earnings
- Price trend analysis
- Comparative performance
- Earnings projections

#### 4.6 Communication Center
**Notifications:**
- Delivery schedule updates
- Payment notifications
- Quality feedback messages
- System announcements

**Support:**
- Contact organization administrators
- Submit feedback and complaints
- Access help documentation
- Request assistance

### API Endpoints Used
```typescript
// Farmer-specific endpoints (to be implemented)
GET /api/farmer/dashboard
GET /api/farmer/organizations
GET /api/farmer/deliveries
GET /api/farmer/payments
GET /api/farmer/advance-balance
GET /api/farmer/performance-metrics
```

## Shared Components & Features

### 1. Authentication System
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: UserRole;
  organization: Organization;
}
```

**Components:**
- Login/Register forms with role selection
- Password reset functionality
- Account verification system
- Role-based route protection
- Session management

### 2. Navigation & Layout
**Responsive Navigation:**
- Role-based menu items
- Collapsible sidebar for mobile
- Breadcrumb navigation
- Quick search functionality
- User profile dropdown

**Layout Components:**
- Header with notifications and user menu
- Sidebar with role-specific navigation
- Main content area with proper spacing
- Footer with system information
- Loading states and error boundaries

### 3. Data Tables & Lists
**Reusable Table Component:**
- Sorting and filtering capabilities
- Pagination with configurable page sizes
- Column visibility controls
- Export functionality
- Bulk actions support

**Search & Filter:**
- Global search functionality
- Advanced filter panels
- Saved filter presets
- Real-time search results
- Filter state persistence

### 4. Forms & Validation
**Form Components:**
- Consistent form styling
- Real-time validation with Zod
- Error message display
- Loading states during submission
- Success/error notifications

**Input Components:**
- Text inputs with validation
- Number inputs with formatting
- Date/time pickers
- File upload with preview
- Multi-select dropdowns

### 5. Notifications & Alerts
**Notification System:**
- Toast notifications for actions
- Alert banners for important messages
- Real-time notifications via WebSocket
- Notification history and management
- Email/SMS notification preferences

### 6. Reporting & Analytics
**Chart Components:**
- Line charts for trends
- Bar charts for comparisons
- Pie charts for distributions
- Data tables with export
- Interactive dashboards

**Report Generation:**
- Custom report builder
- Scheduled report delivery
- Multiple export formats
- Report sharing capabilities
- Report template management

## Technical Implementation Requirements

### 1. State Management
```typescript
// Global State Structure
interface AppState {
  auth: AuthState;
  ui: UIState;
  data: {
    lorries: Lorry[];
    farmers: Farmer[];
    deliveries: Delivery[];
    payments: Payment[];
  };
  cache: CacheState;
}
```

### 2. API Integration
```typescript
// API Client Configuration
interface ApiClient {
  baseURL: string;
  timeout: number;
  retries: number;
  interceptors: {
    request: RequestInterceptor[];
    response: ResponseInterceptor[];
  };
}
```

### 3. Real-time Updates
```typescript
// WebSocket Event Types
type SocketEvents = 
  | 'lorry-status-updated'
  | 'delivery-submitted'
  | 'payment-processed'
  | 'notification-received'
  | 'user-approved';
```

### 4. Offline Support
- Service Worker for caching
- IndexedDB for local storage
- Sync queue for offline actions
- Conflict resolution strategies
- Network status detection

### 5. Performance Optimization
- Code splitting by routes and roles
- Lazy loading of components
- Image optimization and lazy loading
- Bundle size monitoring
- Performance metrics tracking

### 6. Security Implementation
- XSS protection
- CSRF token validation
- Content Security Policy
- Input sanitization
- Secure cookie handling

### 7. Testing Requirements
- Unit tests for components
- Integration tests for workflows
- E2E tests for critical paths
- Performance testing
- Accessibility testing

### 8. Deployment & DevOps
- Docker containerization
- CI/CD pipeline setup
- Environment configuration
- Monitoring and logging
- Error tracking and reporting

## Development Phases

### Phase 1: Core Infrastructure (2-3 weeks)
- Authentication system
- Basic layout and navigation
- API client setup
- State management implementation
- Basic UI components

### Phase 2: Application Admin Dashboard (1-2 weeks)
- System statistics dashboard
- Farm Admin approval workflow
- User management interface
- System configuration

### Phase 3: Farm Admin Dashboard (3-4 weeks)
- Lorry management system
- Delivery processing workflow
- Financial management
- Reporting and analytics

### Phase 4: Field Manager Dashboard (2-3 weeks)
- Lorry request system
- Delivery data entry
- Farmer management
- Mobile optimization

### Phase 5: Farmer Dashboard (2-3 weeks)
- Multi-organization support
- Delivery tracking
- Payment history
- Performance analytics

### Phase 6: Advanced Features (2-3 weeks)
- Real-time notifications
- Advanced reporting
- Offline support
- Performance optimization

### Phase 7: Testing & Deployment (1-2 weeks)
- Comprehensive testing
- Performance optimization
- Security audit
- Production deployment

## Success Metrics

### User Experience
- Page load time < 2 seconds
- 99.9% uptime availability
- Mobile responsiveness score > 95
- Accessibility compliance (WCAG 2.1 AA)

### Business Metrics
- User adoption rate > 90%
- Task completion rate > 95%
- Error rate < 1%
- User satisfaction score > 4.5/5

### Technical Metrics
- Bundle size < 500KB (gzipped)
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1

This comprehensive frontend specification provides a complete roadmap for building a production-ready web application that serves all four user roles with optimal user experience and robust functionality.