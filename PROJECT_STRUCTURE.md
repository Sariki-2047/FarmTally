# FarmTally Project Structure

## Repository Overview

```
farmtally/
├── 📁 farmtally-backend/          # Node.js/Express API server
├── 📁 farmtally-frontend/         # Next.js React application
├── 📁 docs/                       # Business requirements & specifications
├── 📁 deployment/                 # Deployment scripts and configs
└── 📄 README.md                   # Project overview
```

## Backend Structure (`farmtally-backend/`)

```
farmtally-backend/
├── 📁 src/
│   ├── 📁 controllers/            # API endpoint handlers
│   │   ├── auth.controller.ts     # Authentication endpoints
│   │   ├── farmer.controller.ts   # Farmer management
│   │   ├── lorry.controller.ts    # Lorry management
│   │   ├── delivery.controller.ts # Delivery operations
│   │   └── system-admin.controller.ts # Admin functions
│   │
│   ├── 📁 services/               # Business logic layer
│   │   ├── auth.service.ts        # Authentication logic
│   │   ├── farmer.service.ts      # Farmer operations
│   │   ├── lorry.service.ts       # Lorry operations
│   │   ├── delivery.service.ts    # Delivery processing
│   │   ├── emailService.ts        # Email notifications
│   │   └── system-admin.service.ts # Admin operations
│   │
│   ├── 📁 routes/                 # API route definitions
│   │   ├── auth.routes.ts         # /api/v1/auth/*
│   │   ├── farmer.routes.ts       # /api/v1/farmers/*
│   │   ├── lorry.routes.ts        # /api/v1/lorries/*
│   │   └── delivery.routes.ts     # /api/v1/deliveries/*
│   │
│   ├── 📁 middleware/             # Express middleware
│   │   ├── auth.middleware.ts     # JWT authentication
│   │   ├── validation.middleware.ts # Request validation
│   │   ├── error.middleware.ts    # Error handling
│   │   └── audit.middleware.ts    # Request logging
│   │
│   ├── 📁 lib/                    # Shared utilities
│   │   ├── prisma.ts             # Database client
│   │   ├── jwt.ts                # JWT utilities
│   │   └── validation.ts         # Validation schemas
│   │
│   ├── 📁 types/                  # TypeScript type definitions
│   │   ├── auth.types.ts         # Authentication types
│   │   ├── user.types.ts         # User-related types
│   │   └── api.types.ts          # API response types
│   │
│   ├── 📄 server.ts              # Main server (complex, has issues)
│   ├── 📄 server-simple.ts       # Simple server (working)
│   └── 📄 index.ts               # Application entry point
│
├── 📁 prisma/                     # Database schema & migrations
│   ├── 📄 schema.prisma          # Database schema definition
│   ├── 📁 migrations/            # Database migration files
│   └── 📄 seed.ts                # Demo data seeding
│
├── 📁 dist/                       # Compiled JavaScript (build output)
├── 📄 package.json               # Dependencies & scripts
├── 📄 tsconfig.json              # TypeScript configuration
├── 📄 .env                       # Environment variables
└── 📄 .env.example               # Environment template
```

## Frontend Structure (`farmtally-frontend/`)

```
farmtally-frontend/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📁 (auth)/            # Authentication pages
│   │   │   ├── login/page.tsx    # Login page
│   │   │   └── register/page.tsx # Registration page
│   │   │
│   │   ├── 📁 admin/             # System admin dashboard
│   │   │   ├── dashboard/page.tsx # Admin overview
│   │   │   ├── users/page.tsx    # User management
│   │   │   └── settings/page.tsx # System settings
│   │   │
│   │   ├── 📁 farm-admin/        # Farm admin interface
│   │   │   ├── dashboard/page.tsx # Farm overview
│   │   │   ├── farmers/page.tsx  # Farmer management
│   │   │   ├── lorries/page.tsx  # Lorry management
│   │   │   ├── deliveries/page.tsx # Delivery tracking
│   │   │   └── reports/page.tsx  # Business reports
│   │   │
│   │   ├── 📁 field-manager/     # Field manager interface
│   │   │   ├── dashboard/page.tsx # Manager overview
│   │   │   ├── requests/page.tsx # Lorry requests
│   │   │   ├── deliveries/page.tsx # Delivery entry
│   │   │   └── payments/page.tsx # Advance payments
│   │   │
│   │   ├── 📁 farmer/            # Farmer interface
│   │   │   ├── dashboard/page.tsx # Farmer overview
│   │   │   ├── deliveries/page.tsx # Delivery history
│   │   │   ├── payments/page.tsx # Payment history
│   │   │   └── reports/page.tsx  # Farmer reports
│   │   │
│   │   ├── 📄 layout.tsx         # Root layout
│   │   ├── 📄 page.tsx           # Home page
│   │   └── 📄 globals.css        # Global styles
│   │
│   ├── 📁 components/             # Reusable UI components
│   │   ├── 📁 ui/                # Base UI components (shadcn/ui)
│   │   │   ├── button.tsx        # Button component
│   │   │   ├── input.tsx         # Input component
│   │   │   ├── table.tsx         # Table component
│   │   │   └── dialog.tsx        # Modal dialog
│   │   │
│   │   ├── 📁 forms/             # Form components
│   │   │   ├── LoginForm.tsx     # Login form
│   │   │   ├── FarmerForm.tsx    # Farmer creation form
│   │   │   └── DeliveryForm.tsx  # Delivery entry form
│   │   │
│   │   ├── 📁 layout/            # Layout components
│   │   │   ├── Header.tsx        # Application header
│   │   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   │   └── Footer.tsx        # Application footer
│   │   │
│   │   └── 📁 charts/            # Data visualization
│   │       ├── DeliveryChart.tsx # Delivery analytics
│   │       └── PaymentChart.tsx  # Payment analytics
│   │
│   ├── 📁 lib/                   # Utility libraries
│   │   ├── 📄 api.ts             # API client & HTTP utilities
│   │   ├── 📄 auth.ts            # Authentication state management
│   │   ├── 📄 utils.ts           # General utilities
│   │   └── 📄 validations.ts     # Form validation schemas
│   │
│   └── 📁 hooks/                 # Custom React hooks
│       ├── useAuth.ts            # Authentication hook
│       ├── useFarmers.ts         # Farmer data hook
│       └── useDeliveries.ts      # Delivery data hook
│
├── 📁 public/                    # Static assets
│   ├── 📄 favicon.ico           # Site favicon
│   └── 📁 images/               # Image assets
│
├── 📄 package.json              # Dependencies & scripts
├── 📄 tsconfig.json             # TypeScript configuration
├── 📄 tailwind.config.js        # Tailwind CSS configuration
├── 📄 next.config.js            # Next.js configuration
├── 📄 .env.local                # Environment variables
└── 📄 .env.local.example        # Environment template
```

## Documentation Structure (`docs/`)

```
docs/
├── 📄 01-project-overview.md           # System overview & architecture
├── 📄 02-user-roles-authentication.md  # User management & auth
├── 📄 03-core-workflow-processes.md    # Business workflows
├── 📄 04-technical-architecture.md     # Technical specifications
├── 📄 05-user-interface-specifications.md # UI/UX design
├── 📄 06-advance-payment-system.md     # Payment management
├── 📄 07-reporting-analytics-system.md # Reporting features
├── 📄 08-mobile-offline-support.md     # Mobile & offline features
├── 📄 09-notification-communication-system.md # Notifications
├── 📄 advance-payment-workflow.md      # Payment workflows
├── 📄 auth-flow.md                     # Authentication flows
├── 📄 farm-admin-screens.md            # Admin interface specs
├── 📄 farmer-multi-org-experience.md   # Multi-org farmer experience
├── 📄 farmer-report-template.md        # Farmer reporting
├── 📄 nav-map.md                       # Navigation structure
├── 📄 scope.md                         # Project scope and roles
├── 📄 user-relationships.md            # User relationship patterns
└── 📄 ux-rules.md                      # UX patterns and rules
```

## Deployment Structure

```
deployment/
├── 📄 deploy-simple-server.sh         # Simple server deployment
├── 📄 deploy-critical-fixes.sh        # Full server deployment
├── 📄 test-simple-server.js           # Integration tests
├── 📄 DEPLOYMENT_GUIDE.md             # Deployment instructions
└── 📄 PRODUCTION_CHECKLIST.md         # Pre-deployment checklist
```

## Key Configuration Files

### Backend Configuration
- **`package.json`**: Dependencies, scripts, Node.js version
- **`tsconfig.json`**: TypeScript compiler options
- **`.env`**: Environment variables (database, JWT, email)
- **`prisma/schema.prisma`**: Database schema definition

### Frontend Configuration
- **`package.json`**: Dependencies, scripts, build configuration
- **`next.config.js`**: Next.js build and runtime configuration
- **`tailwind.config.js`**: Tailwind CSS customization
- **`.env.local`**: Environment variables (API URLs, app config)

## Important Files for New Developer

### Must Read First
1. **`DEVELOPER_HANDOVER_DOCUMENT.md`** - Complete project overview
2. **`QUICK_START_GUIDE.md`** - Get running in 15 minutes
3. **`docs/01-project-overview.md`** - Business context
4. **`CRITICAL_FIXES_SUMMARY.md`** - Known issues and fixes

### Key Implementation Files
1. **`src/server-simple.ts`** - Working server (start here)
2. **`farmtally-frontend/src/lib/api.ts`** - API client
3. **`farmtally-frontend/src/lib/auth.ts`** - Authentication state
4. **`prisma/schema.prisma`** - Database structure

### Deployment Files
1. **`deploy-simple-server.sh`** - Safe deployment script
2. **`test-simple-server.js`** - Integration tests
3. **`.env`** and **`.env.local`** - Environment configuration

## File Naming Conventions

### Backend
- **Controllers**: `*.controller.ts` - Handle HTTP requests
- **Services**: `*.service.ts` - Business logic
- **Routes**: `*.routes.ts` - API route definitions
- **Middleware**: `*.middleware.ts` - Express middleware
- **Types**: `*.types.ts` - TypeScript type definitions

### Frontend
- **Pages**: `page.tsx` - Next.js App Router pages
- **Components**: `PascalCase.tsx` - React components
- **Hooks**: `use*.ts` - Custom React hooks
- **Utils**: `*.ts` - Utility functions

### Database
- **Schema**: `schema.prisma` - Prisma schema definition
- **Migrations**: `YYYYMMDD_description.sql` - Database migrations
- **Seeds**: `seed.ts` - Demo data seeding

## Development Workflow

### 1. Local Development
```bash
# Backend
npm run dev:simple    # Start simple server
npm run dev          # Start full server (has issues)

# Frontend
npm run dev          # Start Next.js dev server

# Database
npx prisma studio    # Database GUI
npx prisma migrate dev # Apply migrations
```

### 2. Testing
```bash
# Integration tests
node test-simple-server.js

# Unit tests (minimal coverage)
npm test
```

### 3. Deployment
```bash
# Simple server (recommended)
./deploy-simple-server.sh

# Full server (after fixing issues)
./deploy-critical-fixes.sh
```

This structure provides a clear separation of concerns with the backend handling API and business logic, frontend managing user interface, and comprehensive documentation for business requirements and technical specifications.