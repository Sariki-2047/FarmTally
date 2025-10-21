# FarmTally Incremental Deployment Plan

## Overview
This document outlines the step-by-step approach to deploy FarmTally fixes incrementally, starting with a proven baseline and gradually adding complexity.

## Phase 1: Prove the Baseline Works ✅

### 1.1 Simple Server Deployment
- **Target**: Deploy working simple server with critical fixes
- **Port**: 3000 (matches existing VPS setup)
- **Endpoints**: `/api/v1/*` (matches frontend expectations)
- **Status**: Ready for deployment

### 1.2 Health Check & Integration Tests
- **Health Endpoint**: `GET /health`
- **API Test**: `GET /api/v1/test`
- **Auth Test**: `POST /api/v1/auth/login`
- **Integration Test**: `node test-simple-server.js`

### 1.3 Environment Freeze
```env
# Backend (.env)
PORT=3000
JWT_SECRET=test-jwt-secret-key-for-development-only
FRONTEND_URL=https://app.farmtally.in

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://147.93.153.247:3000
```

## Phase 2: Deploy Simple Server

### 2.1 Pre-deployment Checklist
- [ ] Local tests pass (`node test-simple-server.js`)
- [ ] Health check responds
- [ ] Demo login works (admin@farmtally.com / Admin123!)
- [ ] API endpoints return expected format

### 2.2 Deployment Commands
```bash
# Option 1: Automated (Linux/WSL/Git Bash)
./deploy-simple-server.sh

# Option 2: Manual (Windows)
deploy-simple-server.bat

# Option 3: Manual VPS commands
ssh root@147.93.153.247
cd /root/farmtally
pm2 stop farmtally-backend
pm2 start src/server-simple.ts --name farmtally-backend --interpreter tsx
```

### 2.3 Post-deployment Verification
- [ ] `curl http://147.93.153.247:3000/health` returns 200
- [ ] Frontend can connect to backend
- [ ] Login flow works end-to-end

## Phase 3: Incremental Feature Addition

### 3.1 Batch 1: Core Authentication (Low Risk)
**Add back:**
- JWT refresh tokens
- Password validation
- User profile endpoints

**Test after each:**
- Login still works
- Token refresh works
- Profile updates work

### 3.2 Batch 2: Basic CRUD (Medium Risk)
**Add back:**
- Farmer management
- Lorry management
- Basic validation

**Test after each:**
- Can create farmers
- Can create lorries
- Validation works properly

### 3.3 Batch 3: Business Logic (Higher Risk)
**Add back:**
- Delivery system
- Advance payments
- Reporting

**Test after each:**
- Delivery workflow works
- Payment calculations correct
- Reports generate

### 3.4 Batch 4: Advanced Features (Highest Risk)
**Add back:**
- Email notifications
- File uploads
- WebSocket connections
- Complex reporting

## Phase 4: Database Schema Alignment

### 4.1 Identify Schema Mismatches
Current TypeScript errors indicate:
- Missing fields in Prisma models
- Incorrect field names
- Type mismatches

### 4.2 Schema Migration Strategy
1. **Backup current database**
2. **Generate new migration** for missing fields
3. **Test migration on staging**
4. **Apply to production**

### 4.3 Common Issues to Fix
```typescript
// Fix these field mismatches:
- 'organizations' → 'organization'
- 'assignedAt' → 'assignedTo'
- 'requiredDate' → 'requestedDate'
- 'paymentDate' → 'createdAt'
- 'approvedBy' → 'approverId'
```

## Phase 5: Production Hardening

### 5.1 Security Enhancements
- [ ] Update JWT secrets
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Input validation

### 5.2 Monitoring & Observability
- [ ] Add structured logging
- [ ] Health check endpoints
- [ ] Performance metrics
- [ ] Error tracking

### 5.3 Backup & Recovery
- [ ] Database backups
- [ ] Code deployment rollback
- [ ] Configuration management

## Current Status: Phase 1 Complete ✅

### What's Working Now
- ✅ Simple server with `/api/v1/` endpoints
- ✅ Basic authentication (demo credentials)
- ✅ Health checks and monitoring
- ✅ CORS configured for frontend
- ✅ Integration tests passing

### What's Fixed
- ✅ API base URL mismatch resolved
- ✅ Frontend points to correct port (3000)
- ✅ Authentication endpoints work
- ✅ Mock data returns expected format

### Ready for Deployment
The simple server is now ready for deployment with:
- Working authentication
- Proper API structure
- Health monitoring
- Integration tests

## Next Steps

1. **Deploy Simple Server** using deployment scripts
2. **Test Frontend Integration** with new backend
3. **Gradually Add Features** following the batch approach
4. **Fix Database Schema** issues incrementally
5. **Harden for Production** with security and monitoring

## Risk Mitigation

### Rollback Strategy
- Keep simple server as fallback
- Use PM2 for zero-downtime deployments
- Maintain separate staging environment

### Monitoring
- Watch error rates during each batch
- Monitor response times
- Track user experience metrics

### Testing
- Run integration tests after each batch
- Maintain end-to-end test suite
- User acceptance testing for critical flows

---

**Current Phase**: 1 (Baseline Proven) ✅  
**Next Phase**: 2 (Deploy Simple Server)  
**Risk Level**: 🟢 Low  
**Estimated Time**: 30 minutes deployment + testing