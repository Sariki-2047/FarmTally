# FarmTally Developer Handover Document

## Project Overview

**Project Name**: FarmTally  
**Domain**: Corn Procurement Management System  
**Client**: Agricultural Business Operations  
**Handover Date**: January 2025  
**Current Status**: Production-ready with known issues to resolve  

### Business Context
FarmTally is a comprehensive corn procurement management system that streamlines the entire supply chain from farmer to business. The system manages lorry operations, farmer relationships, weight recording, quality assessment, and financial settlements across multiple organizations.

## System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (Express)     │◄──►│ (PostgreSQL)    │
│   VPS Server    │    │   VPS Server    │    │   VPS Server    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│  Email Service  │◄─────────────┘
                        │  (Hostinger)    │
                        └─────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: Next.js 14+ with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand with persistence
- **Forms**: React Hook Form + Zod validation
- **Deployment**: VPS (https://app.farmtally.in)

#### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Authentication**: JWT + Refresh Tokens
- **Email**: Nodemailer + Hostinger SMTP
- **Deployment**: Contabo VPS (147.93.153.247)

## Current Infrastructure

### Production Environment

#### Frontend (VPS)
- **URL**: https://app.farmtally.in
- **Repository**: Connected to GitHub
- **Auto-deployment**: Enabled via CI/CD pipeline
- **Environment Variables**: Configured in VPS environment

#### Backend (VPS)
- **Server**: Contabo VPS (147.93.153.247)
- **OS**: Ubuntu/Linux
- **Process Manager**: PM2
- **Port**: 3000 (production), 9999 (development)
- **SSL**: Not configured (HTTP only)

#### Database
- **Type**: PostgreSQL 14+
- **Location**: Same VPS as backend
- **ORM**: Prisma with migrations
- **Backup**: Manual (needs automation)

### Access Credentials

#### VPS Access
```bash
Host: 147.93.153.247
User: root
Port: 22
# SSH key required (not included in handover)
```

#### Email Service
```env
SMTP_HOST=smtp.hostinger.com
SMTP_USER=noreply@farmtally.in
SMTP_PASS=2t/!P1K]w
```

#### Demo Accounts
```
Farm Admin: admin@farmtally.com / Admin123!
Field Manager: manager@farmtally.com / Manager123!
Farmer: farmer@farmtally.com / Farmer123!
```

## User Roles & Permissions

### 1. System Admin (APPLICATION_ADMIN)
- Approve/reject farm admin registrations
- Manage system-wide settings
- View system analytics and health

### 2. Farm Admin (FARM_ADMIN)
- Manage organization settings
- Invite field managers
- Approve lorry requests
- Process payments and settlements
- Generate business reports

### 3. Field Manager (FIELD_MANAGER)
- Request lorries for operations
- Record farmer deliveries
- Enter bag weights and quality data
- Process advance payments
- Submit lorry data for processing

### 4. Farmer (FARMER)
- View delivery schedules
- Track payment history
- Monitor quality feedback
- Access settlement reports
- Manage multi-organization relationships

## Core Features

### Authentication & User Management
- JWT-based authentication with refresh tokens
- Role-based access control
- Multi-organization support
- User invitation system
- Account approval workflow

### Lorry Management
- Lorry fleet management
- Request and approval workflow
- Assignment to field managers
- Status tracking (AVAILABLE, ASSIGNED, IN_USE, etc.)

### Farmer & Delivery Management
- Farmer registration and profiles
- Delivery recording with individual bag weights
- Quality assessment and moisture content
- Real-time weight calculations

### Financial Management
- Advance payment system
- Automatic settlement calculations
- Payment history tracking
- Multi-currency support preparation

### Reporting & Analytics
- Delivery reports by date range
- Farmer performance analytics
- Payment summaries
- Quality trend analysis

## Current Issues & Technical Debt

### 🚨 Critical Issues (Immediate Attention Required)

#### 1. Database Schema Mismatches
**Problem**: Prisma schema doesn't match actual database structure
**Impact**: Build failures, TypeScript errors
**Files Affected**: 
- All service files in `src/services/`
- Prisma schema file
**Priority**: HIGH

#### 2. API Endpoint Inconsistencies
**Problem**: Some endpoints expect different data structures
**Impact**: Frontend-backend communication failures
**Status**: Partially fixed with `/api/` prefix
**Priority**: MEDIUM

#### 3. Email Template Issues
**Problem**: Some email templates still have placeholder links
**Impact**: Poor user experience in email workflows
**Status**: Mostly fixed, needs verification
**Priority**: MEDIUM

### 🔧 Technical Debt

#### 1. Missing Test Coverage
- No unit tests for services
- No integration tests for APIs
- No end-to-end tests for user workflows
- **Recommendation**: Implement Jest + Supertest for backend, Cypress for frontend

#### 2. Security Hardening Needed
- HTTP instead of HTTPS on backend
- JWT secrets in plain text
- No rate limiting on sensitive endpoints
- **Recommendation**: Implement SSL, use environment secrets, add comprehensive rate limiting

#### 3. Database Optimization
- No connection pooling configuration
- Missing database indexes
- No query optimization
- **Recommendation**: Configure Prisma connection pooling, add strategic indexes

#### 4. Error Handling & Logging
- Inconsistent error response formats
- No structured logging
- No error monitoring
- **Recommendation**: Implement Winston logging, Sentry error tracking

## Development Setup

### Prerequisites
```bash
Node.js 18+
PostgreSQL 14+
npm or yarn
Git
```

### Backend Setup
```bash
# Clone repository
git clone [repository-url]
cd farmtally-backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev:simple  # Simple server (port 9999)
npm run dev         # Full server (port 3000)
```

### Frontend Setup
```bash
cd farmtally-frontend

# Install dependencies
npm install

# Setup environment
cp .env.local.example .env.local
# Edit .env.local with backend URL

# Start development server
npm run dev
```

### Testing
```bash
# Backend tests
npm test

# Integration tests
node test-simple-server.js

# Frontend tests
cd farmtally-frontend
npm test
```

## Deployment Procedures

### Backend Deployment

#### Option 1: Simple Server (Recommended for immediate fixes)
```bash
./deploy-simple-server.sh
```

#### Option 2: Full Server (After fixing schema issues)
```bash
./deploy-critical-fixes.sh
```

#### Manual VPS Deployment
```bash
# SSH to VPS
ssh root@147.93.153.247

# Navigate to project
cd /root/farmtally

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build project (if schema is fixed)
npm run build

# Restart server
pm2 restart farmtally-backend

# Check status
pm2 status
pm2 logs farmtally-backend
```

### Frontend Deployment
- **Automatic**: Push to main branch triggers VPS deployment via CI/CD
- **Manual**: SSH to VPS and run deployment scripts

## Environment Configuration

### Backend Environment Variables (.env)
```env
# Server
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/farmtally

# Authentication
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=noreply@farmtally.in
SMTP_PASS=2t/!P1K]w
SMTP_FROM_NAME=FarmTally
SMTP_FROM_EMAIL=noreply@farmtally.in

# Frontend URL
FRONTEND_URL=https://app.farmtally.in

# Security
BCRYPT_SALT_ROUNDS=12
CORS_ORIGINS=https://app.farmtally.in,http://localhost:3000
```

### Frontend Environment Variables (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://147.93.153.247:3000
NEXT_PUBLIC_SOCKET_URL=http://147.93.153.247:3000

# App Configuration
NEXT_PUBLIC_APP_NAME=FarmTally
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development
NODE_ENV=production
```

## API Documentation

### Authentication Endpoints
```
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/refresh
GET  /api/v1/auth/profile
POST /api/v1/auth/logout
```

### Core Business Endpoints
```
# Farmers
GET    /api/v1/farmers
POST   /api/v1/farmers
PUT    /api/v1/farmers/:id
DELETE /api/v1/farmers/:id

# Lorries
GET    /api/v1/lorries
POST   /api/v1/lorries
PUT    /api/v1/lorries/:id
DELETE /api/v1/lorries/:id

# Lorry Requests
GET    /api/v1/lorry-requests
POST   /api/v1/lorry-requests
PATCH  /api/v1/lorry-requests/:id/status

# Deliveries
GET    /api/v1/deliveries
POST   /api/v1/deliveries
PUT    /api/v1/deliveries/:id

# Advance Payments
GET    /api/v1/advance-payments
POST   /api/v1/advance-payments
GET    /api/v1/advance-payments/farmer/:id
```

### Admin Endpoints
```
GET  /api/v1/system-admin/dashboard
GET  /api/v1/system-admin/users/pending
POST /api/v1/system-admin/users/:id/approve
POST /api/v1/system-admin/users/:id/reject
```

## Database Schema

### Key Tables
- **users**: User accounts and authentication
- **organizations**: Business entities
- **farmers**: Farmer profiles and details
- **lorries**: Vehicle fleet management
- **lorry_requests**: Lorry booking system
- **deliveries**: Delivery records and weights
- **advance_payments**: Financial transactions
- **invitations**: User invitation system

### Relationships
- Users belong to Organizations (multi-tenant)
- Farmers can work with multiple Organizations
- Lorries are assigned to Field Managers
- Deliveries link Farmers, Lorries, and Organizations

## Monitoring & Maintenance

### Health Checks
```bash
# Backend health
curl http://147.93.153.247:3000/health

# Frontend health
curl https://app.farmtally.in

# Database connection
npm run db:check
```

### Log Monitoring
```bash
# PM2 logs
pm2 logs farmtally-backend

# System logs
tail -f /var/log/syslog

# Application logs
tail -f logs/application.log
```

### Backup Procedures
```bash
# Database backup
pg_dump farmtally > backup_$(date +%Y%m%d).sql

# Code backup
git push origin main
```

## Immediate Action Items

### Priority 1 (This Week)
1. **Fix Database Schema Issues**
   - Run `npx prisma db pull` to sync schema with database
   - Fix TypeScript errors in service files
   - Test full server build

2. **Implement HTTPS**
   - Configure SSL certificate on VPS
   - Update frontend API URL to HTTPS
   - Test secure connections

3. **Security Audit**
   - Change default JWT secrets
   - Implement proper environment variable management
   - Add rate limiting to auth endpoints

### Priority 2 (Next 2 Weeks)
1. **Add Comprehensive Testing**
   - Unit tests for all services
   - Integration tests for API endpoints
   - End-to-end tests for critical workflows

2. **Improve Error Handling**
   - Standardize error response format
   - Add structured logging
   - Implement error monitoring

3. **Database Optimization**
   - Add missing indexes
   - Configure connection pooling
   - Implement backup automation

### Priority 3 (Next Month)
1. **Performance Optimization**
   - Frontend code splitting
   - API response caching
   - Database query optimization

2. **Feature Enhancements**
   - Real-time notifications
   - Advanced reporting
   - Mobile app optimization

## Support & Documentation

### Code Documentation
- **Backend**: JSDoc comments in service files
- **Frontend**: Component documentation in Storybook (to be implemented)
- **API**: OpenAPI/Swagger documentation (to be implemented)

### Knowledge Base
- Business logic documented in `docs/` folder
- User workflows in `docs/user-workflows/`
- Technical specifications in `docs/technical/`

### Contact Information
- **Previous Developer**: [Contact details]
- **Business Stakeholder**: [Contact details]
- **Infrastructure Provider**: Contabo Support
- **Domain/Email Provider**: Hostinger Support

## Risk Assessment

### High Risk Areas
1. **Database Schema Mismatches**: Could cause data corruption
2. **Authentication System**: Security vulnerabilities if not properly secured
3. **Payment Calculations**: Financial accuracy is critical
4. **Multi-tenant Data**: Risk of data leakage between organizations

### Mitigation Strategies
1. **Comprehensive Testing**: Before any production deployment
2. **Staged Rollouts**: Use staging environment for all changes
3. **Database Backups**: Before any schema changes
4. **Code Reviews**: For all critical business logic changes

## Success Metrics

### Technical KPIs
- **Uptime**: >99.5%
- **Response Time**: <500ms for API calls
- **Error Rate**: <1% for critical operations
- **Test Coverage**: >80% for backend services

### Business KPIs
- **User Adoption**: Track active users per role
- **Transaction Volume**: Monitor delivery and payment processing
- **System Efficiency**: Measure time from lorry request to completion

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Next Review**: February 2025  

**Handover Checklist**:
- [ ] VPS access provided
- [ ] Environment variables documented
- [ ] Demo accounts tested
- [ ] Critical issues identified
- [ ] Deployment procedures verified
- [ ] Monitoring setup explained
- [ ] Emergency contacts shared