# FarmTally Dependency Analysis & Setup Guide

## Current Backend Status ✅

### ✅ Dependencies Already in Place
The backend has most core dependencies properly configured:

```json
{
  "dependencies": {
    "@prisma/client": "^5.6.0",     // ✅ Database ORM
    "axios": "^1.12.2",             // ✅ HTTP client
    "bcryptjs": "^2.4.3",           // ✅ Password hashing
    "compression": "^1.7.4",        // ✅ Response compression
    "cors": "^2.8.5",               // ✅ Cross-origin requests
    "dotenv": "^16.3.1",            // ✅ Environment variables
    "express": "^4.18.2",           // ✅ Web framework
    "express-rate-limit": "^7.1.5", // ✅ Rate limiting
    "helmet": "^7.1.0",             // ✅ Security headers
    "joi": "^17.11.0",              // ✅ Validation
    "jsonwebtoken": "^9.0.2",       // ✅ JWT authentication
    "multer": "^1.4.5-lts.1"        // ✅ File uploads
  }
}
```

### ✅ Development Environment
- Node.js 18+ ✅
- TypeScript configuration ✅
- Prisma ORM with PostgreSQL ✅
- Jest testing framework ✅
- ESLint for code quality ✅

## ❌ Issues Found in Backend

### 🔴 Critical Issues in Delivery Service
The `src/services/delivery.service.simple.ts` has 33 TypeScript errors that need fixing:

1. **Enum Mismatches**: LorryStatus enum doesn't include all used values
2. **Prisma Schema Misalignment**: Field names don't match between service and schema
3. **Type Conversion Issues**: Decimal to number conversions
4. **Missing Fields**: Response interfaces don't match actual data structure

### 🔴 Missing Backend Dependencies
```bash
npm install --save socket.io                    # Real-time updates
npm install --save @types/socket.io            # TypeScript types
npm install --save nodemailer                  # Email notifications
npm install --save @types/nodemailer           # TypeScript types
npm install --save twilio                      # SMS notifications (optional)
npm install --save redis                       # Caching and sessions
npm install --save @types/redis                # TypeScript types
npm install --save bull                        # Background job queue
npm install --save @types/bull                 # TypeScript types
```

## 🔧 Backend Fixes Required

### 1. Fix Prisma Schema Enum Values
```prisma
enum LorryStatus {
  AVAILABLE
  ASSIGNED
  LOADING
  SUBMITTED      // ❌ Missing in current schema
  SENT_TO_DEALER // ❌ Missing in current schema
}

enum PaymentStatus {
  PENDING
  COMPLETED
  CANCELLED
}
```

### 2. Fix Database Field Mappings
The delivery service references fields that don't exist in the schema:
- `fieldManagerId` should be `managerId`
- `plateNumber` should be `licensePlate`
- `processedAt` field missing in Delivery model

### 3. Add Missing API Endpoints
Several endpoints referenced in the frontend requirements are missing:
```typescript
// Missing farmer-specific endpoints
GET /api/farmer/dashboard
GET /api/farmer/organizations
GET /api/farmer/deliveries
GET /api/farmer/payments
GET /api/farmer/advance-balance
GET /api/farmer/performance-metrics

// Missing lorry request endpoints
POST /api/lorry-requests
GET /api/lorry-requests/my-requests
PUT /api/lorry-requests/:id
```

## 🌐 Frontend Dependencies Required

### Core Frontend Setup
```bash
# Create Next.js project with TypeScript
npx create-next-app@latest farmtally-frontend --typescript --tailwind --eslint --app

# Navigate to frontend directory
cd farmtally-frontend

# Install required dependencies
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install zustand                          # State management
npm install react-hook-form @hookform/resolvers zod  # Forms & validation
npm install recharts                         # Charts and analytics
npm install socket.io-client                 # Real-time updates
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select
npm install @radix-ui/react-toast @radix-ui/react-tabs @radix-ui/react-accordion
npm install lucide-react                     # Icons
npm install date-fns                         # Date utilities
npm install clsx tailwind-merge              # Utility functions
npm install next-themes                      # Theme management

# Development dependencies
npm install --save-dev @types/node
npm install --save-dev eslint-config-next
npm install --save-dev prettier prettier-plugin-tailwindcss
npm install --save-dev @tailwindcss/forms @tailwindcss/typography
```

### UI Component Library (Shadcn/ui)
```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Install required components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add table
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add form
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add pagination
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add switch
```

### PWA & Offline Support
```bash
npm install next-pwa workbox-webpack-plugin
npm install --save-dev webpack
```

### Testing Dependencies
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event
npm install --save-dev jest-environment-jsdom
npm install --save-dev cypress                # E2E testing
npm install --save-dev @types/jest
```

## 📁 Required Project Structure

### Backend Structure (Current ✅)
```
src/
├── config/          ✅ Configuration files
├── controllers/     ✅ Route controllers
├── lib/            ✅ Database connection
├── middleware/     ✅ Express middleware
├── routes/         ✅ API routes
├── services/       ✅ Business logic
├── types/          ✅ TypeScript types
└── utils/          ✅ Utility functions
```

### Frontend Structure (To Create)
```
farmtally-frontend/
├── src/
│   ├── app/                    # Next.js 14 app directory
│   │   ├── (auth)/            # Authentication routes
│   │   ├── admin/             # Application admin dashboard
│   │   ├── farm-admin/        # Farm admin dashboard
│   │   ├── field-manager/     # Field manager dashboard
│   │   ├── farmer/            # Farmer dashboard
│   │   ├── api/               # API routes (if needed)
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Shadcn/ui components
│   │   ├── forms/            # Form components
│   │   ├── charts/           # Chart components
│   │   ├── tables/           # Table components
│   │   └── layout/           # Layout components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   │   ├── api.ts           # API client
│   │   ├── auth.ts          # Authentication utilities
│   │   ├── utils.ts         # General utilities
│   │   └── validations.ts   # Zod schemas
│   ├── store/               # Zustand stores
│   ├── types/               # TypeScript type definitions
│   └── constants/           # Application constants
├── public/                  # Static assets
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── components.json         # Shadcn/ui configuration
└── package.json           # Dependencies
```

## 🔧 Immediate Action Items

### 1. Fix Backend Issues (Priority: HIGH)
```bash
# 1. Update Prisma schema with missing enum values
# 2. Fix field name mismatches in services
# 3. Add missing API endpoints
# 4. Install missing backend dependencies
npm install socket.io nodemailer redis bull
npm install --save-dev @types/socket.io @types/nodemailer @types/redis @types/bull
```

### 2. Create Frontend Project (Priority: HIGH)
```bash
# Create the frontend project
npx create-next-app@latest farmtally-frontend --typescript --tailwind --eslint --app
cd farmtally-frontend

# Install all required dependencies (see above)
# Set up project structure
# Configure authentication and API client
```

### 3. Database Migration (Priority: MEDIUM)
```bash
# After fixing Prisma schema
npx prisma migrate dev --name fix-enums-and-fields
npx prisma generate
```

### 4. Environment Configuration (Priority: MEDIUM)
```bash
# Backend .env additions
REDIS_URL=redis://localhost:6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token

# Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3001
```

## 🚀 Development Workflow

### 1. Backend Development
```bash
# Fix TypeScript errors first
npm run build                    # Should pass without errors
npm run test                     # Run tests
npm run dev:simple              # Start development server
```

### 2. Frontend Development
```bash
cd farmtally-frontend
npm run dev                     # Start Next.js development server
npm run build                   # Test production build
npm run test                    # Run tests
```

### 3. Full Stack Development
```bash
# Terminal 1: Backend
npm run dev:simple

# Terminal 2: Frontend
cd farmtally-frontend && npm run dev

# Terminal 3: Database (if needed)
docker-compose up postgres redis
```

## 📋 Checklist

### Backend Readiness
- [ ] Fix all TypeScript errors in services
- [ ] Update Prisma schema with missing enums
- [ ] Add missing API endpoints
- [ ] Install real-time dependencies (Socket.io)
- [ ] Add email/SMS notification services
- [ ] Set up Redis for caching
- [ ] Configure background job processing

### Frontend Setup
- [ ] Create Next.js project with TypeScript
- [ ] Install all required dependencies
- [ ] Set up project structure
- [ ] Configure Tailwind CSS and Shadcn/ui
- [ ] Set up authentication system
- [ ] Create API client with React Query
- [ ] Set up state management with Zustand
- [ ] Configure PWA capabilities

### Integration
- [ ] Set up CORS for frontend-backend communication
- [ ] Configure WebSocket connections
- [ ] Set up environment variables
- [ ] Test authentication flow
- [ ] Test real-time updates
- [ ] Set up error handling and logging

## 🎯 Success Criteria

### Backend
- ✅ All TypeScript errors resolved
- ✅ All tests passing
- ✅ API endpoints responding correctly
- ✅ Real-time updates working
- ✅ Authentication system functional

### Frontend
- ✅ All four dashboards implemented
- ✅ Responsive design working
- ✅ Authentication flow complete
- ✅ Real-time updates functional
- ✅ Offline capabilities working
- ✅ Performance metrics met

The current backend has a solid foundation but needs the critical fixes mentioned above before frontend development can proceed smoothly. The frontend will be a completely new Next.js project that consumes the backend APIs.