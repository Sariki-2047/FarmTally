# JWT Configuration Guide for FarmTally

This guide explains how to configure JWT (JSON Web Tokens) for secure authentication in your FarmTally system.

## 🔐 What is JWT?

JWT (JSON Web Token) is a secure way to transmit information between parties. In FarmTally, JWTs are used for:

- **User Authentication** - Verify user identity
- **Session Management** - Maintain user sessions
- **API Security** - Protect API endpoints
- **Role-based Access** - Control access based on user roles (Farm Admin, Field Manager, Farmer)

## 🔑 JWT Configuration Variables

Your `.env` file needs these JWT settings:

```env
# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
JWT_EXPIRES_IN="8h"
JWT_REFRESH_EXPIRES_IN="7d"
```

### Variable Explanations:

1. **JWT_SECRET** - Signs and verifies access tokens
2. **JWT_REFRESH_SECRET** - Signs and verifies refresh tokens (different from access tokens)
3. **JWT_EXPIRES_IN** - How long access tokens are valid (8 hours recommended)
4. **JWT_REFRESH_EXPIRES_IN** - How long refresh tokens are valid (7 days recommended)

## 🛡️ Generating Secure JWT Secrets

### Method 1: Using Node.js (Recommended)
```javascript
// Run this in Node.js console or create a script
const crypto = require('crypto');

// Generate JWT_SECRET (64 bytes = 512 bits)
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('JWT_SECRET:', jwtSecret);

// Generate JWT_REFRESH_SECRET (64 bytes = 512 bits)
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');
console.log('JWT_REFRESH_SECRET:', jwtRefreshSecret);
```

### Method 2: Using OpenSSL
```bash
# Generate JWT_SECRET
openssl rand -hex 64

# Generate JWT_REFRESH_SECRET
openssl rand -hex 64
```

### Method 3: Online Generator (Use with caution)
- Visit: [https://generate-secret.vercel.app/64](https://generate-secret.vercel.app/64)
- Generate two different 64-byte secrets
- **Note**: Only use for development, not production

## 🔧 Recommended JWT Configuration

For FarmTally production environment:

```env
# JWT Configuration (Replace with your generated secrets)
JWT_SECRET="a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678"
JWT_REFRESH_SECRET="9876543210fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba"
JWT_EXPIRES_IN="8h"
JWT_REFRESH_EXPIRES_IN="7d"
```

### Time Format Options:
- **Seconds**: `3600` (1 hour)
- **Minutes**: `60m` (60 minutes)
- **Hours**: `8h` (8 hours)
- **Days**: `7d` (7 days)
- **Weeks**: `2w` (2 weeks)

## 🏗️ How JWT Works in FarmTally

### 1. User Login Process
```
User Login → Verify Credentials → Generate JWT → Return to Client
```

### 2. JWT Token Structure
```
Header.Payload.Signature
```

**Example JWT Payload for FarmTally:**
```json
{
  "userId": "uuid-here",
  "email": "admin@farmtally.in",
  "role": "FARM_ADMIN",
  "organizationId": "org-uuid-here",
  "iat": 1640995200,
  "exp": 1641024000
}
```

### 3. API Request Flow
```
Client Request → JWT in Header → Verify JWT → Allow/Deny Access
```

## 🔒 Security Best Practices

### 1. Secret Management
- ✅ **Use long, random secrets** (64+ bytes)
- ✅ **Different secrets** for access and refresh tokens
- ✅ **Never commit secrets** to version control
- ✅ **Rotate secrets** periodically in production
- ✅ **Use environment variables** only

### 2. Token Expiration
- ✅ **Short access tokens** (1-8 hours)
- ✅ **Longer refresh tokens** (7-30 days)
- ✅ **Automatic refresh** before expiration
- ✅ **Revoke on logout**

### 3. Storage Security
- ✅ **HttpOnly cookies** (web) - prevents XSS
- ✅ **Secure storage** (mobile) - encrypted storage
- ✅ **Never in localStorage** - vulnerable to XSS
- ✅ **HTTPS only** in production

## 🚀 FarmTally JWT Implementation

### Access Token Claims
```json
{
  "userId": "user-uuid",
  "email": "user@farmtally.in",
  "role": "FARM_ADMIN|FIELD_MANAGER|FARMER",
  "organizationId": "org-uuid",
  "permissions": ["read:lorries", "write:deliveries"],
  "iat": 1640995200,
  "exp": 1641024000
}
```

### Refresh Token Claims
```json
{
  "userId": "user-uuid",
  "tokenType": "refresh",
  "iat": 1640995200,
  "exp": 1641600000
}
```

## 🧪 Testing JWT Configuration

Create a test script `test-jwt.js`:

```javascript
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

function testJWTConfiguration() {
  console.log('🔐 Testing JWT Configuration...\n');
  
  // Check if secrets are configured
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
    console.log('❌ JWT_SECRET not configured properly!');
    return;
  }
  
  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET === 'your-super-secret-refresh-key-change-this-in-production') {
    console.log('❌ JWT_REFRESH_SECRET not configured properly!');
    return;
  }
  
  console.log('✅ JWT secrets are configured');
  console.log('✅ JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN);
  console.log('✅ JWT_REFRESH_EXPIRES_IN:', process.env.JWT_REFRESH_EXPIRES_IN);
  
  // Test token generation
  const testPayload = {
    userId: 'test-user-id',
    email: 'test@farmtally.in',
    role: 'FARM_ADMIN',
    organizationId: 'test-org-id'
  };
  
  try {
    // Generate access token
    const accessToken = jwt.sign(testPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    
    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: testPayload.userId, tokenType: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );
    
    console.log('\n✅ Access token generated successfully');
    console.log('✅ Refresh token generated successfully');
    
    // Verify tokens
    const decodedAccess = jwt.verify(accessToken, process.env.JWT_SECRET);
    const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    console.log('\n✅ Access token verified successfully');
    console.log('✅ Refresh token verified successfully');
    
    console.log('\n📋 Access Token Payload:');
    console.log('- User ID:', decodedAccess.userId);
    console.log('- Email:', decodedAccess.email);
    console.log('- Role:', decodedAccess.role);
    console.log('- Organization:', decodedAccess.organizationId);
    console.log('- Expires:', new Date(decodedAccess.exp * 1000).toLocaleString());
    
    console.log('\n🎉 JWT configuration is working perfectly!');
    
  } catch (error) {
    console.error('❌ JWT test failed:', error.message);
  }
}

testJWTConfiguration();
```

## 🌍 Environment-Specific Configuration

### Development Environment
```env
JWT_EXPIRES_IN="24h"        # Longer for development convenience
JWT_REFRESH_EXPIRES_IN="30d" # Longer refresh period
```

### Production Environment
```env
JWT_EXPIRES_IN="8h"         # Shorter for security
JWT_REFRESH_EXPIRES_IN="7d" # Reasonable refresh period
```

### Testing Environment
```env
JWT_EXPIRES_IN="1h"         # Short for testing
JWT_REFRESH_EXPIRES_IN="1d" # Short refresh period
```

## 🔄 Token Refresh Flow

```javascript
// Pseudo-code for token refresh
if (accessTokenExpired) {
  if (refreshTokenValid) {
    newAccessToken = generateAccessToken(user);
    newRefreshToken = generateRefreshToken(user); // Optional rotation
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } else {
    redirectToLogin();
  }
}
```

## 🚨 Security Warnings

### Never Do This:
- ❌ Use weak or predictable secrets
- ❌ Store secrets in code or version control
- ❌ Use the same secret for access and refresh tokens
- ❌ Set very long expiration times
- ❌ Store tokens in localStorage (web)
- ❌ Log tokens in production

### Always Do This:
- ✅ Use cryptographically secure random secrets
- ✅ Use environment variables for secrets
- ✅ Implement proper token refresh logic
- ✅ Use HTTPS in production
- ✅ Implement logout functionality
- ✅ Monitor for suspicious token usage

## 📱 Mobile App Considerations

For Flutter mobile app:
- Store tokens in secure storage (flutter_secure_storage)
- Implement automatic token refresh
- Handle token expiration gracefully
- Clear tokens on app uninstall/logout

## 🔧 Troubleshooting

### Common Issues:

1. **"JsonWebTokenError: invalid signature"**
   - Wrong JWT_SECRET used for verification
   - Secret changed after token generation

2. **"TokenExpiredError: jwt expired"**
   - Token has expired, need to refresh
   - Check JWT_EXPIRES_IN setting

3. **"JsonWebTokenError: jwt malformed"**
   - Token format is incorrect
   - Token was corrupted during transmission

4. **"Authentication failed"**
   - Token not provided in request
   - Token not in correct format (Bearer token)

Your JWT configuration is crucial for FarmTally security. Make sure to use strong, unique secrets and follow security best practices!