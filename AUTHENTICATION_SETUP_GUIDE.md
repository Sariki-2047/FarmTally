# FarmTally Authentication System - Complete Setup Guide

## 🔐 Authentication Flow Overview

FarmTally implements a comprehensive multi-role authentication system with admin approval workflow:

### User Roles & Approval Process

1. **APPLICATION_ADMIN** (System Admin)
   - Auto-approved upon creation
   - Manages all user registrations
   - Has access to system-wide dashboard

2. **FARM_ADMIN** (Business Owner)
   - Requires APPLICATION_ADMIN approval
   - Manages their organization
   - Can approve FIELD_MANAGER registrations

3. **FIELD_MANAGER** (Employee)
   - Requires APPLICATION_ADMIN approval
   - Works under FARM_ADMIN
   - Manages field operations

4. **FARMER** (Supplier)
   - Requires APPLICATION_ADMIN approval
   - Can work with multiple organizations
   - Supplies corn to businesses

## 🚀 Initial System Setup

### Step 1: Create First System Admin

The first system admin must be created through the setup endpoint:

```bash
curl -X POST http://localhost:3000/api/system-admin/setup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@farmtally.com",
    "phone": "+1234567890",
    "password": "SecurePassword123!",
    "firstName": "System",
    "lastName": "Administrator"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "System admin created successfully",
  "data": {
    "id": "admin-id",
    "email": "admin@farmtally.com",
    "role": "APPLICATION_ADMIN",
    "status": "APPROVED"
  }
}
```

### Step 2: System Admin Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@farmtally.com",
    "password": "SecurePassword123!"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "admin-id",
      "email": "admin@farmtally.com",
      "role": "APPLICATION_ADMIN",
      "status": "APPROVED"
    },
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token"
    }
  }
}
```

## 📋 User Registration & Approval Workflow

### Step 3: Farm Admin Registration

Farm admins register but require approval:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmadmin@example.com",
    "phone": "+1234567891",
    "password": "FarmPassword123!",
    "role": "FARM_ADMIN",
    "profile": {
      "firstName": "John",
      "lastName": "Farmer",
      "address": "123 Farm Road, Rural Area"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please wait for admin approval.",
  "data": {
    "user": {
      "id": "farm-admin-id",
      "email": "farmadmin@example.com",
      "role": "FARM_ADMIN",
      "status": "PENDING"
    },
    "tokens": {
      "accessToken": "",
      "refreshToken": ""
    }
  }
}
```

### Step 4: System Admin Approval Process

#### View Pending Registrations
```bash
curl -X GET "http://localhost:3000/api/system-admin/users/pending" \
  -H "Authorization: Bearer SYSTEM_ADMIN_TOKEN"
```

#### Approve User
```bash
curl -X POST http://localhost:3000/api/system-admin/users/FARM_ADMIN_ID/approve \
  -H "Authorization: Bearer SYSTEM_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approvalNotes": "Farm admin approved for corn procurement operations"
  }'
```

#### Reject User (if needed)
```bash
curl -X POST http://localhost:3000/api/system-admin/users/FARM_ADMIN_ID/reject \
  -H "Authorization: Bearer SYSTEM_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rejectionReason": "Incomplete documentation provided"
  }'
```

### Step 5: Approved Farm Admin Login

After approval, farm admin can login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmadmin@example.com",
    "password": "FarmPassword123!"
  }'
```

## 🏢 Organization Setup

### Step 6: Create Organization (Farm Admin)

```bash
curl -X POST http://localhost:3000/api/admin/organization \
  -H "Authorization: Bearer FARM_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Green Valley Farms",
    "code": "GVF001",
    "address": "456 Valley Road, Green County",
    "phone": "+1234567892",
    "email": "info@greenvalleyfarms.com"
  }'
```

## 👥 Team Member Registration

### Step 7: Field Manager Registration

Field managers register under an organization:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@greenvalley.com",
    "phone": "+1234567893",
    "password": "ManagerPassword123!",
    "role": "FIELD_MANAGER",
    "organizationId": "ORGANIZATION_ID",
    "profile": {
      "firstName": "Jane",
      "lastName": "Manager",
      "address": "789 Manager Street"
    }
  }'
```

### Step 8: Farmer Registration

Farmers can work with multiple organizations:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@example.com",
    "phone": "+1234567894",
    "password": "FarmerPassword123!",
    "role": "FARMER",
    "profile": {
      "firstName": "Bob",
      "lastName": "Grower",
      "address": "321 Farm Lane",
      "idNumber": "ID123456789"
    }
  }'
```

## 🎛 System Admin Dashboard

### Dashboard Statistics
```bash
curl -X GET http://localhost:3000/api/system-admin/dashboard \
  -H "Authorization: Bearer SYSTEM_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 25,
    "pendingUsers": 3,
    "approvedUsers": 20,
    "rejectedUsers": 2,
    "totalOrganizations": 5,
    "activeOrganizations": 4,
    "recentRegistrations": 8,
    "usersByRole": {
      "FARM_ADMIN": 5,
      "FIELD_MANAGER": 10,
      "FARMER": 9,
      "APPLICATION_ADMIN": 1
    },
    "recentPendingUsers": [...]
  }
}
```

### Bulk Operations
```bash
# Bulk approve multiple users
curl -X POST http://localhost:3000/api/system-admin/users/bulk-approve \
  -H "Authorization: Bearer SYSTEM_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": ["user1", "user2", "user3"],
    "approvalNotes": "Bulk approval for verified users"
  }'
```

### User Management
```bash
# Suspend a user
curl -X POST http://localhost:3000/api/system-admin/users/USER_ID/toggle-status \
  -H "Authorization: Bearer SYSTEM_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"suspend": true}'

# Reactivate a user
curl -X POST http://localhost:3000/api/system-admin/users/USER_ID/toggle-status \
  -H "Authorization: Bearer SYSTEM_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"suspend": false}'
```

## 📧 Email Notifications

The system automatically sends emails for:

### User Registration
- **To User:** "Registration pending approval" notification
- **To System Admins:** "New registration requires approval" notification

### User Approval
- **To User:** "Account approved - welcome!" notification
- **To System Admins:** Confirmation of approval action

### User Rejection
- **To User:** "Registration requires updates" notification
- **To System Admins:** Confirmation of rejection action

## 🔒 Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Token Management
- JWT access tokens (24h expiry)
- Refresh tokens (7d expiry)
- Token blacklisting on logout
- Automatic token refresh

### Account Security
- Password hashing with bcrypt
- Account status validation
- Role-based access control
- Session management

## 🛠 API Endpoints Summary

### Authentication
```
POST /api/auth/register          # User registration
POST /api/auth/login             # User login
POST /api/auth/refresh           # Token refresh
POST /api/auth/logout            # User logout
POST /api/auth/change-password   # Change password
GET  /api/auth/profile           # Get user profile
PUT  /api/auth/profile           # Update user profile
```

### System Admin
```
POST /api/system-admin/setup                    # Create first admin
GET  /api/system-admin/dashboard                # Dashboard stats
GET  /api/system-admin/users/pending            # Pending users
GET  /api/system-admin/users/:id                # User details
POST /api/system-admin/users/:id/approve        # Approve user
POST /api/system-admin/users/:id/reject         # Reject user
POST /api/system-admin/users/:id/toggle-status  # Suspend/reactivate
POST /api/system-admin/users/bulk-approve       # Bulk approve
GET  /api/system-admin/organizations            # All organizations
```

## 🚀 Production Deployment

### Environment Variables
```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Password Security
BCRYPT_SALT_ROUNDS=12

# Email Notifications
EMAIL_NOTIFICATIONS_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Database Migration
```bash
# Run migrations to add approval fields
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Initial Setup Script
```bash
# Create setup script
node -e "
const axios = require('axios');
const baseURL = 'http://localhost:3000/api';

async function setupSystem() {
  try {
    // Create system admin
    const adminResponse = await axios.post(\`\${baseURL}/system-admin/setup\`, {
      email: 'admin@farmtally.com',
      password: 'AdminPassword123!',
      firstName: 'System',
      lastName: 'Administrator'
    });
    
    console.log('✅ System admin created:', adminResponse.data);
    
    // Login as admin
    const loginResponse = await axios.post(\`\${baseURL}/auth/login\`, {
      email: 'admin@farmtally.com',
      password: 'AdminPassword123!'
    });
    
    console.log('✅ System admin logged in successfully');
    console.log('🔑 Admin Token:', loginResponse.data.data.tokens.accessToken);
    
  } catch (error) {
    console.error('❌ Setup failed:', error.response?.data || error.message);
  }
}

setupSystem();
"
```

## 📱 Frontend Integration

### Login Flow
```typescript
// Check user status after login
const handleLogin = async (credentials) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store tokens
      localStorage.setItem('accessToken', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      
      // Redirect based on role
      switch (data.data.user.role) {
        case 'APPLICATION_ADMIN':
          router.push('/system-admin/dashboard');
          break;
        case 'FARM_ADMIN':
          router.push('/farm-admin/dashboard');
          break;
        case 'FIELD_MANAGER':
          router.push('/field-manager/dashboard');
          break;
        case 'FARMER':
          router.push('/farmer/dashboard');
          break;
      }
    }
  } catch (error) {
    // Handle different error types
    if (error.message.includes('pending approval')) {
      showMessage('Account pending approval. Please wait for admin approval.');
    } else if (error.message.includes('rejected')) {
      showMessage('Account registration was rejected. Please contact support.');
    }
  }
};
```

### System Admin Dashboard
```typescript
// Fetch pending users
const fetchPendingUsers = async () => {
  const response = await fetch('/api/system-admin/users/pending', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Approve user
const approveUser = async (userId, notes) => {
  const response = await fetch(`/api/system-admin/users/${userId}/approve`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ approvalNotes: notes })
  });
  return response.json();
};
```

## 🎯 Success Criteria

- ✅ System admin can be created and login
- ✅ Users register with pending status
- ✅ Email notifications sent for registrations
- ✅ System admin can approve/reject users
- ✅ Approved users can login successfully
- ✅ Role-based access control working
- ✅ Dashboard shows accurate statistics
- ✅ Bulk operations function correctly

## 🔧 Troubleshooting

### Common Issues

1. **"System admin already exists" error**
   - Only one system admin can be created via setup
   - Use regular registration for additional admins

2. **"Account pending approval" on login**
   - User needs system admin approval
   - Check system admin dashboard

3. **Email notifications not sending**
   - Verify EMAIL_NOTIFICATIONS_ENABLED=true
   - Check SMTP configuration
   - Review server logs

4. **Token expired errors**
   - Implement token refresh logic
   - Check JWT_EXPIRES_IN configuration

The authentication system is now complete and production-ready! 🔐✨