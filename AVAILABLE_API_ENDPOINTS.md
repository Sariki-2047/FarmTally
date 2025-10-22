# 🔗 Available API Endpoints - FarmTally Microservices

## 📊 **CURRENT FRONTEND vs MICROSERVICES MISMATCH**

### ❌ **Current Frontend Configuration**
```typescript
// farmtally-frontend/src/lib/api.ts
baseURL: 'http://147.93.153.247:8082'  // ❌ This service doesn't exist!
```

### ✅ **Available Microservices**
```
API Gateway:     http://147.93.153.247:8090  ✅ WORKING
Auth Service:    http://147.93.153.247:8081  ✅ WORKING  
Field Manager:   http://147.93.153.247:8088  ✅ WORKING
Farm Admin:      http://147.93.153.247:8089  ✅ WORKING
```

## 🎯 **API GATEWAY ENDPOINTS** (Port 8090)

### **Central Routing Hub**
```json
{
  "message": "FarmTally API Gateway",
  "version": "1.0.0",
  "services": {
    "auth": "/api/auth",
    "organizations": "/api/organizations", 
    "farmers": "/api/farmers",
    "lorries": "/api/lorries",
    "deliveries": "/api/deliveries",
    "payments": "/api/payments",
    "notifications": "/api/notifications",
    "fieldManager": "/api/field-manager",
    "farmAdmin": "/api/farm-admin",
    "reports": "/api/reports"
  }
}
```

## 🔐 **AUTH SERVICE ENDPOINTS** (Port 8081)

### **Working Endpoints**
- ✅ `GET /health` - Service health check
- ✅ `GET /users` - List users

### **Authentication Endpoints** (Need Implementation)
- ⚠️ `POST /register` - User registration
- ⚠️ `POST /login` - User login  
- ⚠️ `POST /verify` - Token verification

## 👨‍🌾 **FIELD MANAGER SERVICE** (Port 8088)

### **Working Endpoints**
- ✅ `GET /health` - Service health
- ✅ `GET /lorry-requests` - Get lorry requests
- ✅ `GET /deliveries` - Get deliveries
- ✅ `GET /advance-payments` - Get advance payments

### **Dashboard Endpoints**
- ⚠️ `GET /dashboard/stats` - Dashboard statistics (needs parameters)

## 🏢 **FARM ADMIN SERVICE** (Port 8089)

### **Working Endpoints**
- ✅ `GET /health` - Service health
- ✅ `GET /lorries` - Fleet management
- ✅ `GET /pricing-rules` - Pricing configuration
- ✅ `GET /settlements/pending` - Pending settlements

### **Approval Endpoints**
- ⚠️ `GET /lorry-requests/pending` - Pending requests (database error)
- 🔧 `POST /lorry-requests/:id/approve` - Approve request
- 🔧 `POST /lorry-requests/:id/reject` - Reject request

## 🚀 **IMMEDIATE FRONTEND FIXES NEEDED**

### **1. Update API Base URL**
```typescript
// Current (WRONG)
baseURL: 'http://147.93.153.247:8082'

// Should be (CORRECT)
baseURL: 'http://147.93.153.247:8090'  // API Gateway
```

### **2. Update Authentication Endpoints**
```typescript
// Current frontend expects
/api/auth/login
/api/auth/register

// Available via API Gateway
http://147.93.153.247:8090/api/auth/login
http://147.93.153.247:8090/api/auth/register
```

### **3. Update Feature Endpoints**
```typescript
// Field Manager Features
GET /api/field-manager/lorry-requests
GET /api/field-manager/deliveries
GET /api/field-manager/advance-payments

// Farm Admin Features  
GET /api/farm-admin/lorry-requests/pending
GET /api/farm-admin/lorries
GET /api/farm-admin/pricing-rules
```

## 🔧 **REQUIRED FRONTEND CHANGES**

### **Environment Variables Update**
```env
# farmtally-frontend/.env.local
NEXT_PUBLIC_API_URL=http://147.93.153.247:8090
NEXT_PUBLIC_AUTH_URL=http://147.93.153.247:8081
NEXT_PUBLIC_FIELD_MANAGER_URL=http://147.93.153.247:8088
NEXT_PUBLIC_FARM_ADMIN_URL=http://147.93.153.247:8089
```

### **API Client Update**
```typescript
// New API structure needed
class FarmTallyAPI {
  private gatewayURL = 'http://147.93.153.247:8090'
  private authURL = 'http://147.93.153.247:8081'
  
  // Authentication via Auth Service
  async login(email: string, password: string) {
    return this.request(`${this.authURL}/login`, { ... })
  }
  
  // Features via API Gateway
  async getLorryRequests() {
    return this.request(`${this.gatewayURL}/api/field-manager/lorry-requests`)
  }
}
```

## 📋 **FRONTEND PAGES THAT NEED API UPDATES**

### **Authentication Pages**
- `/login` → Connect to Auth Service (8081)
- `/register` → Connect to Auth Service (8081)

### **Field Manager Pages**
- `/field-manager/lorries` → Field Manager Service (8088)
- `/field-manager/deliveries` → Field Manager Service (8088)
- `/field-manager/requests` → Field Manager Service (8088)

### **Farm Admin Pages**
- `/farm-admin/requests` → Farm Admin Service (8089)
- `/farm-admin/lorries` → Farm Admin Service (8089)
- `/farm-admin/deliveries` → Farm Admin Service (8089)

## 🎯 **NEXT STEPS**

1. **Update Frontend API URLs** - Point to microservices
2. **Fix Authentication Integration** - Connect to Auth Service
3. **Update Dashboard Data Fetching** - Use correct endpoints
4. **Test Complete Integration** - Verify all features work

**Ready to fix the frontend API integration? This will connect your beautiful UI to your working microservices!** 🚀