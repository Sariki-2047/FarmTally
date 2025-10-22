# FarmTally Consolidated Deployment Guide

## Overview

This guide covers the consolidated deployment of FarmTally on port 8080 with all services accessible through the `/farmtally/` subdirectory. This approach provides a single entry point for the entire application while maintaining the microservices architecture internally.

## Architecture

```
Port 8080 (Nginx Reverse Proxy)
├── /farmtally/ → Frontend (Next.js)
├── /farmtally/api-gateway/ → API Gateway Service
├── /farmtally/auth-service/ → Authentication Service
├── /farmtally/field-manager-service/ → Field Manager Service
├── /farmtally/farm-admin-service/ → Farm Admin Service
└── /health → System Health Check
```

## Key Files

### Configuration Files
- `docker-compose.consolidated.yml` - Main Docker Compose configuration
- `nginx-consolidated.conf` - Nginx reverse proxy configuration
- `farmtally-frontend/.env.local` - Frontend environment variables

### Deployment Files
- `deploy-consolidated.sh` - Automated deployment script
- `jenkins-farmtally-consolidated-pipeline.groovy` - Jenkins CI/CD pipeline
- `test-consolidated-deployment.js` - Deployment verification script

## Quick Start

### 1. Deploy Using Script
```bash
./deploy-consolidated.sh
```

### 2. Deploy Using Docker Compose
```bash
# Build and start all services
docker-compose -f docker-compose.consolidated.yml up -d --build

# Check service status
docker-compose -f docker-compose.consolidated.yml ps
```

### 3. Verify Deployment
```bash
# Run automated tests
node test-consolidated-deployment.js

# Manual health check
curl http://147.93.153.247:8080/health
```

## Access URLs

### Main Application
- **FarmTally App**: http://147.93.153.247:8080/farmtally/
- **Health Check**: http://147.93.153.247:8080/health

### API Endpoints
- **API Gateway**: http://147.93.153.247:8080/farmtally/api-gateway/
- **Auth Service**: http://147.93.153.247:8080/farmtally/auth-service/
- **Field Manager**: http://147.93.153.247:8080/farmtally/field-manager-service/
- **Farm Admin**: http://147.93.153.247:8080/farmtally/farm-admin-service/

## Service Configuration

### Frontend Environment Variables
```env
NEXT_PUBLIC_BASE_URL=http://147.93.153.247:8080/farmtally
NEXT_PUBLIC_API_URL=http://147.93.153.247:8080/farmtally/api-gateway
NEXT_PUBLIC_AUTH_URL=http://147.93.153.247:8080/farmtally/auth-service
NEXT_PUBLIC_FIELD_MANAGER_URL=http://147.93.153.247:8080/farmtally/field-manager-service
NEXT_PUBLIC_FARM_ADMIN_URL=http://147.93.153.247:8080/farmtally/farm-admin-service
```

### Docker Services
- **postgres**: PostgreSQL database (port 5432)
- **api-gateway**: API Gateway service (internal port 8090)
- **auth-service**: Authentication service (internal port 8081)
- **field-manager-service**: Field Manager service (internal port 8088)
- **farm-admin-service**: Farm Admin service (internal port 8089)
- **frontend**: Next.js frontend (internal port 3000)
- **nginx**: Reverse proxy (external port 8080)

## Jenkins CI/CD Pipeline

### Setup Jenkins Job
1. Create new Pipeline job in Jenkins
2. Use `jenkins-farmtally-consolidated-pipeline.groovy` as pipeline script
3. Configure SSH access to VPS
4. Run the pipeline

### Pipeline Stages
1. **Checkout** - Get source code
2. **Verify Dependencies** - Check Docker and Node.js
3. **Build Frontend** - Build Next.js application
4. **Deploy Consolidated System** - Deploy all services
5. **Health Check** - Verify deployment

## Troubleshooting

### Common Issues

#### Port 8080 Already in Use
```bash
# Check what's using port 8080
sudo netstat -tulpn | grep :8080

# Stop conflicting services
sudo systemctl stop apache2  # or nginx, or other web server
```

#### Docker Build Failures
```bash
# Clean Docker system
docker system prune -f

# Rebuild without cache
docker-compose -f docker-compose.consolidated.yml build --no-cache
```

#### Frontend Build Issues
```bash
cd farmtally-frontend
rm -rf node_modules .next
npm install
npm run build
```

#### Service Health Check Failures
```bash
# Check service logs
docker-compose -f docker-compose.consolidated.yml logs [service-name]

# Check container status
docker-compose -f docker-compose.consolidated.yml ps
```

### Debugging Commands

#### Check Service Status
```bash
# All services
docker-compose -f docker-compose.consolidated.yml ps

# Specific service logs
docker-compose -f docker-compose.consolidated.yml logs nginx
docker-compose -f docker-compose.consolidated.yml logs frontend
docker-compose -f docker-compose.consolidated.yml logs api-gateway
```

#### Test Individual Services
```bash
# Test Nginx proxy
curl -v http://147.93.153.247:8080/health

# Test frontend
curl -v http://147.93.153.247:8080/farmtally/

# Test API services
curl -v http://147.93.153.247:8080/farmtally/auth-service/health
```

## Maintenance

### Update Deployment
```bash
# Pull latest changes
git pull origin main

# Redeploy
./deploy-consolidated.sh
```

### Backup Database
```bash
# Create database backup
docker exec farmtally-postgres pg_dump -U farmtally_user farmtally > backup.sql

# Restore database backup
docker exec -i farmtally-postgres psql -U farmtally_user farmtally < backup.sql
```

### Monitor Logs
```bash
# Follow all service logs
docker-compose -f docker-compose.consolidated.yml logs -f

# Follow specific service
docker-compose -f docker-compose.consolidated.yml logs -f nginx
```

## Security Considerations

### Network Security
- All services communicate through internal Docker network
- Only port 8080 is exposed externally
- Nginx handles SSL termination (if configured)

### Database Security
- PostgreSQL is only accessible within Docker network
- Strong password configured for database user
- Database data persisted in Docker volume

### API Security
- JWT tokens for authentication
- CORS headers configured in Nginx
- Rate limiting can be added to Nginx configuration

## Performance Optimization

### Nginx Optimization
- Gzip compression enabled for static assets
- Caching headers for frontend assets
- Connection pooling for upstream services

### Docker Optimization
- Multi-stage builds for smaller images
- Resource limits configured for containers
- Health checks for automatic restart

### Database Optimization
- Connection pooling in services
- Proper indexing on frequently queried columns
- Regular database maintenance

## Default Credentials

### System Admin
- **Email**: admin@farmtally.com
- **Password**: Admin123!

### Database
- **Host**: postgres (internal)
- **Database**: farmtally
- **User**: farmtally_user
- **Password**: farmtally_password_2024

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review service logs using Docker Compose commands
3. Run the test script to identify specific failures
4. Check the Jenkins pipeline logs for deployment issues