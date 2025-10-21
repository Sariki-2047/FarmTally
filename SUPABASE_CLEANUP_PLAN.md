# 🧹 Supabase Cleanup Plan - Remove All Supabase Dependencies

## 🎯 **Current Supabase References Found**

### **✅ Active Supabase Dependencies:**

#### **1. Package Dependencies**
```json
// Backend package.json
"@supabase/supabase-js": "^2.75.1"

// Frontend package.json  
"@supabase/supabase-js": "^2.75.1"
```

#### **2. Frontend Supabase Client**
```typescript
// farmtally-frontend/src/lib/supabase.ts
- createClient from '@supabase/supabase-js'
- FarmTallyAPI class (configured for Supabase Edge Functions)
- Environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### **3. Configuration Files**
- Multiple test files expecting Supabase environment variables
- Jenkins pipeline configurations mentioning Supabase
- Documentation files with Supabase setup instructions

#### **4. Database Schema**
```sql
// supabase/migrations/20241020_create_farmtally_tables.sql
- Complete FarmTally schema (this is GOOD - we'll reuse it!)
```

---

## 🚀 **Cleanup Strategy**

### **Phase 1: Remove Dependencies (5 minutes)**
```bash
# Backend cleanup
npm uninstall @supabase/supabase-js

# Frontend cleanup  
cd farmtally-frontend
npm uninstall @supabase/supabase-js
```

### **Phase 2: Replace Frontend API Client (10 minutes)**
Replace `farmtally-frontend/src/lib/supabase.ts` with PostgreSQL-compatible API client:

```typescript
// farmtally-frontend/src/lib/api.ts
export class FarmTallyAPI {
  private baseURL: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://147.93.153.247:8082'
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    const response = await fetch(url, config)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`)
    }
    
    return data
  }

  // Health check
  async health() {
    return this.request('/health')
  }

  // Database health
  async healthDb() {
    return this.request('/api/health/db')
  }

  // Users
  async getUsers() {
    return this.request('/api/users')
  }

  async createUser(userData: any) {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  // Organizations
  async getOrganizations() {
    return this.request('/api/organizations')
  }

  async createOrganization(orgData: any) {
    return this.request('/api/organizations', {
      method: 'POST',
      body: JSON.stringify(orgData),
    })
  }
}

export const farmTallyAPI = new FarmTallyAPI()
```

### **Phase 3: Update Environment Variables (2 minutes)**
Remove Supabase environment variables and keep only PostgreSQL ones:

```env
# Remove these Supabase variables:
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=

# Keep these PostgreSQL variables:
DATABASE_URL=postgresql://farmtally:farmtally123@farmtally-db:5432/farmtally
NEXT_PUBLIC_API_URL=http://147.93.153.247:8082
```

### **Phase 4: Update Frontend Components (5 minutes)**
Find and update any components using the old Supabase client:

```typescript
// Replace imports like:
// import { farmTallyAPI } from '@/lib/supabase'

// With:
import { farmTallyAPI } from '@/lib/api'
```

---

## 🔧 **Implementation Steps**

### **Step 1: Clean Dependencies**
```bash
# Backend
npm uninstall @supabase/supabase-js

# Frontend
cd farmtally-frontend
npm uninstall @supabase/supabase-js
cd ..
```

### **Step 2: Replace API Client**
```bash
# Remove old Supabase client
rm farmtally-frontend/src/lib/supabase.ts

# Create new PostgreSQL API client
# (I'll create this file for you)
```

### **Step 3: Update Package.json Scripts**
```json
// Remove any Supabase-related scripts
// Keep only PostgreSQL/Express related scripts
```

### **Step 4: Clean Environment Files**
```bash
# Update .env to remove Supabase variables
# Update any .env.example files
```

---

## ✅ **Expected Results After Cleanup**

### **No More Supabase Errors:**
- ❌ No "@supabase/supabase-js module not found" errors
- ❌ No "NEXT_PUBLIC_SUPABASE_URL is required" errors  
- ❌ No Supabase connection timeouts
- ❌ No Edge Function deployment issues

### **Clean PostgreSQL Setup:**
- ✅ Frontend connects directly to VPS backend
- ✅ Backend connects to VPS PostgreSQL
- ✅ No external dependencies
- ✅ Faster local development

### **Simplified Architecture:**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │◄──►│   Backend       │◄──►│   Database      │
│   (Next.js)     │    │   (Express)     │    │   (PostgreSQL)  │
│   Port 8081     │    │   Port 8082     │    │   Port 8083     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        VPS                    VPS                    VPS
```

---

## 🎯 **Files to Update**

### **Delete:**
- `farmtally-frontend/src/lib/supabase.ts`
- `supabase/functions/` (if exists)
- Any Supabase configuration files

### **Update:**
- `package.json` (both backend and frontend)
- `farmtally-frontend/package.json`
- `.env` files
- Any components importing from `@/lib/supabase`

### **Create:**
- `farmtally-frontend/src/lib/api.ts` (new PostgreSQL API client)

---

## 🚀 **Ready to Clean Up?**

**This cleanup will:**
1. **Remove all Supabase dependencies** (5 min)
2. **Create clean PostgreSQL API client** (10 min)  
3. **Update environment variables** (2 min)
4. **Test the clean setup** (5 min)

**Total Time:** ~20 minutes
**Risk:** Very low (we're removing unused code)
**Benefit:** Clean, simple, no external dependencies

**Would you like me to start the cleanup process?** This will ensure no Supabase conflicts when we implement Area 1 with PostgreSQL! 🎯