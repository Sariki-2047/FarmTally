# FarmTally API Documentation

## Base URL
```
Development: http://localhost:3000/api/v1
Production: https://api.farmtally.com/api/v1
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@farmtally.com",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "admin@farmtally.com",
      "role": "FARM_ADMIN",
      "firstName": "Farm",
      "lastName": "Admin"
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token",
      "expiresIn": 28800
    }
  }
}
```

## Farm Admin Endpoints

### Field Manager Management

#### Invite Field Manager
```http
POST /admin/field-managers/invite
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "aadhaar": "123456789012"
}
```

#### Get Field Managers
```http
GET /admin/field-managers
Authorization: Bearer <token>
```

### Lorry Management

#### Create Lorry
```http
POST /admin/lorries
Authorization: Bearer <token>
Content-Type: application/json

{
  "registrationNumber": "KA01AB1234",
  "driverName": "Driver Name",
  "driverPhone": "+1234567890",
  "capacity": 1000
}
```

#### Get Lorries
```http
GET /admin/lorries
Authorization: Bearer <token>
```

### Lorry Request Management

#### Get Lorry Requests
```http
GET /admin/lorry-requests
Authorization: Bearer <token>
```

#### Approve Lorry Request
```http
PUT /admin/lorry-requests/{requestId}/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "lorryId": "lorry-id",
  "notes": "Approved for collection"
}
```

## Field Manager Endpoints

### Farmer Management

#### Create Farmer
```http
POST /organizations/{orgId}/farmers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Farmer Name",
  "phone": "+1234567890",
  "email": "farmer@example.com",
  "address": "Farm Address",
  "idNumber": "ID123456",
  "bankDetails": {
    "bankName": "Bank Name",
    "accountNumber": "1234567890",
    "accountName": "Farmer Name",
    "branchCode": "BRANCH001"
  }
}
```

#### Get Farmers
```http
GET /organizations/{orgId}/farmers
Authorization: Bearer <token>
```

#### Search Farmers
```http
GET /organizations/{orgId}/farmers/search?search=farmer-name
Authorization: Bearer <token>
```

### Lorry Request Management

#### Create Lorry Request
```http
POST /field-manager/lorry-requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "requestedDate": "2024-01-15",
  "location": "Collection Location",
  "estimatedQuantity": 500,
  "notes": "Special instructions"
}
```

#### Get My Lorry Requests
```http
GET /field-manager/lorry-requests
Authorization: Bearer <token>
```

### Delivery Management

#### Create Delivery
```http
POST /field-manager/deliveries
Authorization: Bearer <token>
Content-Type: application/json

{
  "lorryId": "lorry-id",
  "farmerId": "farmer-id",
  "bags": [
    {
      "weight": 50.5,
      "moistureContent": 12.5
    }
  ],
  "qualityNotes": "Good quality corn"
}
```

## Farmer Endpoints

### Profile Management

#### Get Profile
```http
GET /farmer/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /farmer/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "address": "Updated Address",
  "bankDetails": {
    "bankName": "New Bank",
    "accountNumber": "9876543210"
  }
}
```

### Delivery History

#### Get Deliveries
```http
GET /farmer/deliveries
Authorization: Bearer <token>
```

#### Get Delivery Details
```http
GET /farmer/deliveries/{deliveryId}
Authorization: Bearer <token>
```

### Payment History

#### Get Payments
```http
GET /farmer/payments
Authorization: Bearer <token>
```

#### Get Advance Payments
```http
GET /farmer/advance-payments
Authorization: Bearer <token>
```

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": {
    // Additional error details
  }
}
```

### Validation Error Response
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "field1": ["Error message 1"],
    "field2": ["Error message 2"]
  }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (e.g., duplicate data)
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

API requests are limited to:
- 100 requests per 15 minutes per IP address
- Higher limits available for authenticated users

## Pagination

List endpoints support pagination:
```http
GET /endpoint?page=1&limit=20&sort=createdAt&order=desc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```