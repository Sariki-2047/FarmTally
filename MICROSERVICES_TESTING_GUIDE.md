# FarmTally Microservices Testing Guide

## Overview
This guide explains how to test individual FarmTally microservices and their interactions after deployment.

## Service Architecture

### Individual Services
```
🚪 API Gateway (8080)        - Entry point and request routing
🔐 Auth Service (8081)       - Authentication and user management
🏢 Organization (8082)       - Multi-tenant organization management
👨‍🌾 Farmer Service (8083)     - Farmer profile and relationships
🚛 Lorry Service (8084)      - Fleet and lorry management
📦 Delivery Service (8085)    - Delivery processing and weights
💰 Payment Service (8086)     - Advance payments and settlements
📧 Notification (8087)       - Email and SMS notifications
👨‍🌾 Field Manager (8088)     - Field manager operations and workflows
🏢 Farm Admin (8089)         - Farm admin dashboard and management
📊 Report Service (8090)     - Analytics and reporting
```

## Deployment Commands

### Deploy All Services
```bash
# Deploy complete microservices stack
./deploy-microservices.sh

# Check deployment status
./deploy-microservices.sh status
```

### Deploy Individual Services
```bash
# Deploy specific service
./deploy-microservices.sh auth          # Auth service only
./deploy-microservices.sh farmer        # Farmer service only
./deploy-microservices.sh delivery      # Delivery service only
./deploy-microservices.sh gateway       # API Gateway only
```

### Health Checks
```bash
# Check all services health
./deploy-microservices.sh health

# Run comprehensive tests
node test-microservices.js

# Test specific functionality
node test-microservices.js health       # Health checks only
node test-microservices.js auth         # Authentication flow
node test-microservices.js routing      # Gateway routing
node test-microservices.js interactions # Service interactions
```

## Individual Service Testing

### 1. API Gateway (Port 8080)
```bash
# Health check
curl http://147.93.153.247:8080/health

# Service routing test
curl http://147.93.153.247:8080/api/auth/health
curl http://147.93.153.247:8080/api/farmers/health

# Gateway service status
curl http://147.93.153.247:8080/api/health/services
```

### 2. Auth Service (Port 8081)
```bash
# Health check
curl http://147.93.153.247:8081/health

# Register new user
curl -X POST http://147.93.153.247:8081/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@farmtally.com",
    "password": "TestPassword123!",
    "role": "APPLICATION_ADMIN",
    "profile": {"firstName": "Test", "lastName": "User"}
  }'

# Login user
curl -X POST http://147.93.153.247:8081/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@farmtally.com",
    "password": "TestPassword123!"
  }'

# Get all users
curl http://147.93.153.247:8081/users
```

### 3. Organization Service (Port 8082)
```bash
# Health check
curl http://147.93.153.247:8082/health

# Create organization
curl -X POST http://147.93.153.247:8082/organizations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Test Farm Organization",
    "code": "TFO001",
    "address": "Test Address",
    "phone": "+1234567890"
  }'

# Get organizations
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://147.93.153.247:8082/organizations
```

### 4. Farmer Service (Port 8083)
```bash
# Health check
curl http://147.93.153.247:8083/health

# Create farmer
curl -X POST http://147.93.153.247:8083/farmers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "John Farmer",
    "phone": "+1234567890",
    "email": "john@example.com",
    "address": "Farm Address"
  }'

# Get farmers
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://147.93.153.247:8083/farmers
```

### 5. Lorry Service (Port 8084)
```bash
# Health check
curl http://147.93.153.247:8084/health

# Create lorry
curl -X POST http://147.93.153.247:8084/lorries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Lorry 001",
    "licensePlate": "KA01AB1234",
    "capacity": 1000,
    "driverName": "Driver Name",
    "driverPhone": "+1234567890"
  }'
```

### 6. Delivery Service (Port 8085)
```bash
# Health check
curl http://147.93.153.247:8085/health

# Create delivery
curl -X POST http://147.93.153.247:8085/deliveries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "farmerId": "farmer-id",
    "lorryId": "lorry-id",
    "bags": [
      {"weight": 50.5, "moistureContent": 12.5}
    ]
  }'
```

## Docker Commands

### View Running Services
```bash
# SSH to VPS
ssh root@147.93.153.247

# Check running containers
docker ps

# View specific service logs
docker logs farmtally-auth-service
docker logs farmtally-api-gateway
docker logs farmtally-farmer-service

# View all service logs
docker-compose -f docker-compose.microservices.yml logs

# Follow logs in real-time
docker-compose -f docker-compose.microservices.yml logs -f
```

### Service Management
```bash
# Restart specific service
docker-compose -f docker-compose.microservices.yml restart auth-service

# Stop specific service
docker-compose -f docker-compose.microservices.yml stop farmer-service

# Start specific service
docker-compose -f docker-compose.microservices.yml start farmer-service

# Rebuild and restart service
docker-compose -f docker-compose.microservices.yml up -d --build auth-service
```

### Database Management
```bash
# Connect to PostgreSQL
docker exec -it farmtally-postgres psql -U farmtally_user -d farmtally

# View database tables
docker exec farmtally-postgres psql -U farmtally_user -d farmtally -c "\dt"

# Check user table
docker exec farmtally-postgres psql -U farmtally_user -d farmtally -c "SELECT id, email, role, status FROM users;"
```

## Monitoring and Debugging

### Service Health Monitoring
```bash
# Automated health check script
#!/bin/bash
services=(8080 8081 8082 8083 8084 8085 8086 8087 8088)
for port in "${services[@]}"; do
  if curl -f http://147.93.153.247:$port/health > /dev/null 2>&1; then
    echo "✅ Service on port $port is healthy"
  else
    echo "❌ Service on port $port is down"
  fi
done
```

### Performance Testing
```bash
# Load test API Gateway
ab -n 1000 -c 10 http://147.93.153.247:8080/health

# Load test Auth Service
ab -n 500 -c 5 http://147.93.153.247:8081/health
```

### Network Testing
```bash
# Test service-to-service communication
docker exec farmtally-api-gateway curl http://auth-service:8081/health
docker exec farmtally-farmer-service curl http://auth-service:8081/health
```

## Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check service logs
docker logs farmtally-auth-service

# Check resource usage
docker stats

# Verify environment variables
docker exec farmtally-auth-service env | grep DATABASE_URL
```

#### Database Connection Issues
```bash
# Test database connectivity
docker exec farmtally-postgres pg_isready -U farmtally_user

# Check database logs
docker logs farmtally-postgres

# Verify database schema
docker exec farmtally-postgres psql -U farmtally_user -d farmtally -c "\dt"
```

#### Service Communication Issues
```bash
# Check Docker network
docker network ls
docker network inspect farmtally_farmtally-network

# Test internal DNS resolution
docker exec farmtally-api-gateway nslookup auth-service
```

### Recovery Procedures

#### Restart All Services
```bash
cd /opt/farmtally
docker-compose -f docker-compose.microservices.yml down
docker-compose -f docker-compose.microservices.yml up -d
```

#### Rebuild Specific Service
```bash
# Rebuild and restart auth service
docker-compose -f docker-compose.microservices.yml stop auth-service
docker-compose -f docker-compose.microservices.yml build auth-service
docker-compose -f docker-compose.microservices.yml up -d auth-service
```

#### Database Recovery
```bash
# Backup database
docker exec farmtally-postgres pg_dump -U farmtally_user farmtally > backup.sql

# Restore database
docker exec -i farmtally-postgres psql -U farmtally_user farmtally < backup.sql
```

## Testing Checklist

### Pre-Deployment
- [ ] All service Dockerfiles are valid
- [ ] Environment variables are configured
- [ ] Database schema is ready
- [ ] Network configuration is correct

### Post-Deployment
- [ ] All services are running
- [ ] Health checks pass for all services
- [ ] API Gateway routing works
- [ ] Authentication flow works
- [ ] Database connectivity is established
- [ ] Service-to-service communication works
- [ ] Frontend can connect to API Gateway

### Performance Testing
- [ ] Load testing completed
- [ ] Response times are acceptable
- [ ] Memory usage is within limits
- [ ] CPU usage is reasonable
- [ ] Database performance is good

This microservices architecture allows you to:
1. **Deploy services independently**
2. **Scale services based on demand**
3. **Test services in isolation**
4. **Debug issues more easily**
5. **Update services without downtime**