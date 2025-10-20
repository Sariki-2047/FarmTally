# Technical Architecture
## Complete System Architecture & Implementation

### System Architecture Overview

#### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Flutter App    │    │   Node.js API   │    │  PostgreSQL     │
│  (Cross-Platform)◄──►│   (Backend)     │◄──►│  (Database)     │
│                 │    │                 │    │                 │
│ • Dart/Flutter  │    │ • Express.js    │    │ • Prisma ORM    │
│ • Material 3    │    │ • TypeScript    │    │ • Multi-tenant  │
│ • Riverpod      │    │ • JWT Auth      │    │ • Indexed       │
│ • SQLite/Drift  │    │ • WebSocket     │    │ • Encrypted     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Local DB      │    │     Redis       │    │   File Storage  │
│   (SQLite)      │    │   (Cache)       │    │   (AWS S3)      │
│                 │    │                 │    │                 │
│ • Offline Data  │    │ • Session Store │    │ • Documents     │
│ • Sync Queue    │    │ • Rate Limiting │    │ • Photos        │
│ • Background    │    │ • Queue Jobs    │    │ • Backups       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Frontend Architecture

#### Technology Stack
- **Framework**: Flutter 3.16+ with Dart 3.0+
- **State Management**: Riverpod for reactive state management
- **UI Components**: Material Design 3 with custom theme
- **Navigation**: GoRouter for declarative routing
- **Forms**: Flutter Form Builder with validation
- **Charts**: FL Chart for analytics dashboards
- **HTTP Client**: Dio with interceptors for API calls
- **Local Database**: SQLite with Drift ORM for offline support
- **Platform Support**: iOS, Android, Web, Windows, macOS, Linux

#### Flutter Project Structure
```
lib/
├── main.dart                   # App entry point
├── app/
│   ├── app.dart               # Main app configuration
│   ├── router.dart            # GoRouter configuration
│   └── theme.dart             # Material 3 theme
├── core/
│   ├── constants/             # App constants
│   ├── utils/                 # Utility functions
│   ├── extensions/            # Dart extensions
│   └── exceptions/            # Custom exceptions
├── data/
│   ├── datasources/
│   │   ├── local/             # SQLite/Drift datasources
│   │   └── remote/            # API datasources
│   ├── models/                # Data models
│   ├── repositories/          # Repository implementations
│   └── database/
│       ├── database.dart      # Drift database
│       ├── tables/            # Database tables
│       └── daos/              # Data access objects
├── domain/
│   ├── entities/              # Business entities
│   ├── repositories/          # Repository interfaces
│   └── usecases/              # Business use cases
├── presentation/
│   ├── providers/             # Riverpod providers
│   ├── pages/
│   │   ├── auth/              # Authentication pages
│   │   ├── farm_admin/        # Farm admin pages
│   │   │   ├── dashboard/     # Admin dashboard
│   │   │   ├── lorries/       # Lorry management
│   │   │   ├── requests/      # Request management
│   │   │   ├── managers/      # Manager management
│   │   │   ├── farmers/       # Farmer management
│   │   │   ├── reports/       # Report generation
│   │   │   └── settings/      # Business settings
│   │   ├── field_manager/     # Field manager pages
│   │   │   ├── dashboard/     # Manager dashboard
│   │   │   ├── lorries/       # Lorry operations
│   │   │   ├── farmers/       # Farmer management
│   │   │   ├── weight_entry/  # Weight recording
│   │   │   ├── moisture/      # Moisture recording
│   │   │   ├── advance/       # Advance payments
│   │   │   └── reports/       # Manager reports
│   │   └── farmer/            # Farmer pages
│   │       ├── dashboard/     # Farmer dashboard
│   │       ├── deliveries/    # Delivery history
│   │       ├── payments/      # Payment history
│   │       ├── schedule/      # Delivery schedule
│   │       └── settings/      # Farmer settings
│   ├── widgets/
│   │   ├── common/            # Reusable widgets
│   │   ├── forms/             # Form widgets
│   │   ├── charts/            # Chart widgets
│   │   └── mobile/            # Mobile-optimized widgets
│   └── dialogs/               # Dialog widgets
├── services/
│   ├── api_service.dart       # HTTP API service
│   ├── auth_service.dart      # Authentication service
│   ├── sync_service.dart      # Offline sync service
│   ├── notification_service.dart # Push notifications
│   └── storage_service.dart   # Local storage
└── l10n/                      # Internationalization
    ├── app_en.arb            # English translations
    ├── app_hi.arb            # Hindi translations
    └── app_localizations.dart # Generated localizations
```

#### State Management with Riverpod
```dart
// Authentication providers
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authServiceProvider));
});

final currentUserProvider = Provider<User?>((ref) {
  return ref.watch(authProvider).user;
});

final selectedOrganizationProvider = StateProvider<Organization?>((ref) => null);

// Farm Admin providers
final farmAdminDashboardProvider = FutureProvider.family<DashboardData, String>((ref, orgId) {
  return ref.read(dashboardServiceProvider).getFarmAdminDashboard(orgId);
});

final lorriesProvider = StateNotifierProvider.family<LorriesNotifier, AsyncValue<List<Lorry>>, String>((ref, orgId) {
  return LorriesNotifier(ref.read(lorryServiceProvider), orgId);
});

final lorryRequestsProvider = StateNotifierProvider.family<RequestsNotifier, AsyncValue<List<LorryRequest>>, String>((ref, orgId) {
  return RequestsNotifier(ref.read(requestServiceProvider), orgId);
});

// Field Manager providers
final fieldManagerDashboardProvider = FutureProvider.family<DashboardData, String>((ref, managerId) {
  return ref.read(dashboardServiceProvider).getFieldManagerDashboard(managerId);
});

final assignedLorriesProvider = FutureProvider.family<List<Lorry>, String>((ref, managerId) {
  return ref.read(lorryServiceProvider).getAssignedLorries(managerId);
});

final weightEntryProvider = StateNotifierProvider<WeightEntryNotifier, WeightEntryState>((ref) {
  return WeightEntryNotifier(ref.read(deliveryServiceProvider));
});

final moistureRecordingProvider = StateNotifierProvider<MoistureNotifier, MoistureState>((ref) {
  return MoistureNotifier(ref.read(deliveryServiceProvider));
});

// Farmer providers
final farmerDashboardProvider = FutureProvider.family<FarmerDashboard, String>((ref, farmerId) {
  return ref.read(dashboardServiceProvider).getFarmerDashboard(farmerId);
});

final farmerDeliveriesProvider = FutureProvider.family<List<Delivery>, String>((ref, farmerId) {
  return ref.read(deliveryServiceProvider).getFarmerDeliveries(farmerId);
});

final farmerPaymentsProvider = FutureProvider.family<List<Payment>, String>((ref, farmerId) {
  return ref.read(paymentServiceProvider).getFarmerPayments(farmerId);
});

// Offline sync providers
final syncStatusProvider = StateNotifierProvider<SyncNotifier, SyncState>((ref) {
  return SyncNotifier(ref.read(syncServiceProvider));
});

final offlineQueueProvider = FutureProvider<List<OfflineAction>>((ref) {
  return ref.read(syncServiceProvider).getOfflineQueue();
});

// UI state providers
final themeProvider = StateProvider<ThemeMode>((ref) => ThemeMode.system);
final localeProvider = StateProvider<Locale>((ref) => const Locale('en'));
final connectivityProvider = StreamProvider<ConnectivityResult>((ref) {
  return Connectivity().onConnectivityChanged;
});
```

### Backend Architecture

#### Technology Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Authentication**: JWT + Refresh Tokens
- **Validation**: Joi for request validation
- **File Upload**: Multer + AWS S3
- **Email**: SendGrid for email notifications
- **SMS**: Twilio for SMS notifications
- **Caching**: Redis for session and data caching
- **Queue**: Bull Queue with Redis for background jobs
- **WebSocket**: Socket.io for real-time updates

#### Alternative: Dart Backend (Optional)
- **Framework**: Shelf or Serverpod for Dart backend
- **Benefits**: Single language (Dart) across full stack
- **Database**: PostgreSQL with Stormberry ORM
- **Consideration**: Node.js ecosystem is more mature for this use case

#### API Structure
```
src/
├── controllers/
│   ├── auth/
│   │   ├── auth.controller.ts      # Authentication endpoints
│   │   ├── user.controller.ts      # User management
│   │   └── organization.controller.ts # Organization management
│   ├── farm-admin/
│   │   ├── dashboard.controller.ts # Admin dashboard
│   │   ├── lorry.controller.ts     # Lorry management
│   │   ├── request.controller.ts   # Request management
│   │   ├── manager.controller.ts   # Manager management
│   │   ├── farmer.controller.ts    # Farmer management
│   │   ├── report.controller.ts    # Report generation
│   │   └── settings.controller.ts  # Business settings
│   ├── field-manager/
│   │   ├── dashboard.controller.ts # Manager dashboard
│   │   ├── lorry.controller.ts     # Lorry operations
│   │   ├── request.controller.ts   # Lorry requests
│   │   ├── farmer.controller.ts    # Farmer management
│   │   ├── weight.controller.ts    # Weight entry
│   │   ├── moisture.controller.ts  # Moisture recording
│   │   ├── advance.controller.ts   # Advance payments
│   │   └── report.controller.ts    # Manager reports
│   └── farmer/
│       ├── dashboard.controller.ts # Farmer dashboard
│       ├── delivery.controller.ts  # Delivery history
│       ├── payment.controller.ts   # Payment history
│       ├── schedule.controller.ts  # Delivery schedule
│       └── settings.controller.ts  # Farmer settings
├── middleware/
│   ├── auth.middleware.ts          # Authentication middleware
│   ├── validation.middleware.ts    # Request validation
│   ├── rateLimit.middleware.ts     # Rate limiting
│   ├── audit.middleware.ts         # Audit logging
│   ├── organization.middleware.ts  # Organization scoping
│   └── error.middleware.ts         # Error handling
├── services/
│   ├── auth.service.ts             # Authentication logic
│   ├── user.service.ts             # User management
│   ├── organization.service.ts     # Organization management
│   ├── lorry.service.ts            # Lorry operations
│   ├── farmer.service.ts           # Farmer operations
│   ├── weight.service.ts           # Weight calculations
│   ├── payment.service.ts          # Payment processing
│   ├── notification.service.ts     # Notifications
│   ├── report.service.ts           # Report generation
│   └── audit.service.ts            # Audit logging
├── models/
│   ├── user.model.ts               # User data models
│   ├── organization.model.ts       # Organization models
│   ├── lorry.model.ts              # Lorry models
│   ├── farmer.model.ts             # Farmer models
│   └── transaction.model.ts        # Transaction models
├── routes/
│   ├── auth.routes.ts              # Authentication routes
│   ├── farm-admin.routes.ts        # Admin routes
│   ├── field-manager.routes.ts     # Manager routes
│   └── farmer.routes.ts            # Farmer routes
├── utils/
│   ├── calculations.ts             # Business calculations
│   ├── validation.ts               # Data validation
│   ├── encryption.ts               # Data encryption
│   └── helpers.ts                  # Utility functions
└── types/
    ├── api.types.ts                # API type definitions
    ├── database.types.ts           # Database types
    └── business.types.ts           # Business logic types
```

### Database Architecture

#### PostgreSQL Schema Design
```sql
-- Core Tables
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    owner_id UUID NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    organization_id UUID REFERENCES organizations(id),
    profile JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    status user_status DEFAULT 'ACTIVE',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

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

CREATE TABLE farmers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    id_number VARCHAR(50),
    bank_details JSONB,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

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

-- Transaction Tables
CREATE TABLE lorry_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    manager_id UUID NOT NULL REFERENCES users(id),
    required_date DATE NOT NULL,
    priority request_priority DEFAULT 'MEDIUM',
    purpose TEXT NOT NULL,
    estimated_duration INTEGER,
    location TEXT,
    expected_volume INTEGER,
    status request_status DEFAULT 'PENDING',
    assigned_lorry_id UUID REFERENCES lorries(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

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
    quality_deduction_reason TEXT,
    net_weight DECIMAL(10,2) NOT NULL,
    price_per_kg DECIMAL(8,2) NOT NULL,
    total_value DECIMAL(12,2) NOT NULL,
    advance_amount DECIMAL(12,2) DEFAULT 0,
    interest_charges DECIMAL(12,2) DEFAULT 0,
    final_amount DECIMAL(12,2) NOT NULL,
    status delivery_status DEFAULT 'PENDING',
    photos TEXT[],
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

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
    receipt_photo TEXT,
    recorded_by UUID NOT NULL REFERENCES users(id),
    status advance_status DEFAULT 'ACTIVE',
    adjusted_in_delivery UUID REFERENCES deliveries(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit and Logging
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
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

-- Notification System
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    channels VARCHAR(20)[] DEFAULT ARRAY['IN_APP'],
    priority notification_priority DEFAULT 'MEDIUM',
    read_at TIMESTAMP,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Database Indexes for Performance
```sql
-- User and Organization indexes
CREATE INDEX idx_users_organization_role ON users(organization_id, role);
CREATE INDEX idx_users_email_active ON users(email) WHERE status = 'ACTIVE';
CREATE INDEX idx_users_phone_active ON users(phone) WHERE status = 'ACTIVE';

-- Lorry indexes
CREATE INDEX idx_lorries_organization_status ON lorries(organization_id, status);
CREATE INDEX idx_lorries_assigned_manager ON lorries(assigned_manager_id) WHERE assigned_manager_id IS NOT NULL;

-- Farmer indexes
CREATE INDEX idx_farmers_phone ON farmers(phone);
CREATE INDEX idx_farmer_organizations_farmer ON farmer_organizations(farmer_id);
CREATE INDEX idx_farmer_organizations_org ON farmer_organizations(organization_id);

-- Transaction indexes
CREATE INDEX idx_lorry_requests_org_status ON lorry_requests(organization_id, status);
CREATE INDEX idx_lorry_requests_manager_date ON lorry_requests(manager_id, required_date);
CREATE INDEX idx_deliveries_org_date ON deliveries(organization_id, delivery_date DESC);
CREATE INDEX idx_deliveries_farmer_org ON deliveries(farmer_id, organization_id);
CREATE INDEX idx_deliveries_lorry_date ON deliveries(lorry_id, delivery_date);
CREATE INDEX idx_advance_payments_farmer_org_status ON advance_payments(farmer_id, organization_id, status);

-- Audit and notification indexes
CREATE INDEX idx_audit_logs_org_date ON audit_logs(organization_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE read_at IS NULL;
```

### Security Architecture

#### Authentication & Authorization
```typescript
// JWT Token Structure
interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  organizationId: string;
  permissions: string[];
  iat: number;
  exp: number;
}

// Role-based permissions
const PERMISSIONS = {
  FARM_ADMIN: [
    'lorry:create', 'lorry:read', 'lorry:update', 'lorry:delete',
    'request:read', 'request:approve', 'request:reject',
    'manager:create', 'manager:read', 'manager:update', 'manager:delete',
    'farmer:create', 'farmer:read', 'farmer:update', 'farmer:delete',
    'pricing:update', 'deduction:update', 'advance:create',
    'report:generate', 'settings:update'
  ],
  FIELD_MANAGER: [
    'lorry:read', 'lorry:update',
    'request:create', 'request:read', 'request:update',
    'farmer:create', 'farmer:read', 'farmer:update',
    'weight:create', 'weight:update', 'moisture:create', 'moisture:update',
    'advance:create', 'report:generate'
  ],
  FARMER: [
    'delivery:read', 'payment:read', 'schedule:read',
    'profile:read', 'profile:update', 'report:generate'
  ]
};
```

#### Data Encryption
- **At Rest**: Database encryption using PostgreSQL TDE
- **In Transit**: TLS 1.3 for all API communications
- **Sensitive Fields**: Additional encryption for PII data
- **Key Management**: AWS KMS for encryption key management

### Performance & Scalability

#### Caching Strategy
```typescript
// Redis caching layers
const CACHE_KEYS = {
  USER_SESSION: 'session:user:{userId}',
  ORGANIZATION_DATA: 'org:{orgId}:data',
  FARMER_LIST: 'org:{orgId}:farmers',
  LORRY_LIST: 'org:{orgId}:lorries',
  DASHBOARD_STATS: 'org:{orgId}:dashboard:{date}',
  REPORTS: 'report:{type}:{orgId}:{hash}'
};

// Cache TTL settings
const CACHE_TTL = {
  SESSION: 8 * 60 * 60,      // 8 hours
  ORGANIZATION: 60 * 60,      // 1 hour
  LISTS: 30 * 60,            // 30 minutes
  DASHBOARD: 15 * 60,        // 15 minutes
  REPORTS: 24 * 60 * 60      // 24 hours
};
```

#### Database Optimization
- **Connection Pooling**: Prisma connection pooling
- **Query Optimization**: Indexed queries and query analysis
- **Data Partitioning**: Organization-based table partitioning
- **Read Replicas**: Read-only replicas for reporting queries

### Mobile & Offline Support

#### Flutter Offline-First Architecture
```dart
// Local database with Drift
@DriftDatabase(tables: [
  Users, Organizations, Lorries, Farmers, Deliveries, 
  AdvancePayments, LorryRequests, OfflineActions
])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  // Offline action queue
  Future<void> queueOfflineAction(OfflineAction action) async {
    await into(offlineActions).insert(action);
  }

  Future<List<OfflineAction>> getPendingActions() async {
    return select(offlineActions)
      ..where((a) => a.status.equals(OfflineActionStatus.pending));
  }
}

// Offline sync service
class SyncService {
  final AppDatabase _database;
  final ApiService _apiService;

  Future<void> syncPendingActions() async {
    final pendingActions = await _database.getPendingActions();
    
    for (final action in pendingActions) {
      try {
        await _processOfflineAction(action);
        await _database.markActionCompleted(action.id);
      } catch (e) {
        await _database.incrementActionAttempts(action.id);
      }
    }
  }

  Future<void> _processOfflineAction(OfflineAction action) async {
    switch (action.type) {
      case OfflineActionType.weightEntry:
        await _apiService.submitWeightEntry(action.payload);
        break;
      case OfflineActionType.moistureRecord:
        await _apiService.submitMoistureRecord(action.payload);
        break;
      case OfflineActionType.advancePayment:
        await _apiService.submitAdvancePayment(action.payload);
        break;
    }
  }
}

// Offline data models
class OfflineAction {
  final String id;
  final OfflineActionType type;
  final Map<String, dynamic> payload;
  final DateTime timestamp;
  final int attempts;
  final OfflineActionStatus status;
}

enum OfflineActionType {
  weightEntry,
  moistureRecord,
  advancePayment,
  lorryRequest,
  farmerRegistration
}

enum OfflineActionStatus {
  pending,
  syncing,
  completed,
  failed
}
```

#### Mobile-Specific Features
- **Native Performance**: Compiled to native ARM code for optimal performance
- **Platform Integration**: Native camera, GPS, file system access
- **Offline-First**: SQLite database with automatic sync when online
- **Background Sync**: Background tasks for data synchronization
- **Push Notifications**: Firebase Cloud Messaging integration
- **Biometric Auth**: Fingerprint/Face ID authentication support
- **Large Touch Targets**: Optimized for thumb navigation and data entry
- **Voice Input**: Speech-to-text for rapid data entry

### Monitoring & Observability

#### Application Monitoring
- **Error Tracking**: Sentry for error monitoring
- **Performance Monitoring**: Application performance metrics
- **User Analytics**: User behavior and feature usage
- **Business Metrics**: Procurement volume, success rates

#### Infrastructure Monitoring
- **Server Monitoring**: CPU, memory, disk usage
- **Database Monitoring**: Query performance, connection pools
- **API Monitoring**: Response times, error rates
- **Cache Monitoring**: Redis performance and hit rates

This technical architecture provides a robust, scalable foundation for FarmTally's corn procurement management system with comprehensive security, performance optimization, and mobile support.