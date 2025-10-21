# FarmTally Jenkins Isolated Deployment - Complete Setup Guide

## 🎯 Overview

This deployment strategy uses Jenkins to deploy FarmTally in **completely isolated Docker containers** with **unique ports** that won't interfere with your existing projects on the VPS.

## 🏗️ Isolated Architecture

```
VPS Server (147.93.153.247)
├── Your Existing Projects (untouched)
│   ├── Port 80, 3000, 5432 (available for other projects)
│   └── Other services...
│
├── Jenkins (Port 8080)
│   └── Controls FarmTally deployment
│
└── FarmTally Isolated Environment
    ├── Frontend: Port 8081 (Nginx)
    ├── Backend: Port 8082 (Node.js API)
    ├── Database: Port 8083 (PostgreSQL)
    ├── Network: farmtally-network (isolated)
    └── Data: /opt/farmtally-jenkins (separate directory)
```

## 🚀 Quick Setup (3 Steps)

### Step 1: Create Jenkins Job
```powershell
# Run this to automatically create the Jenkins job
.\create-jenkins-isolated-job.ps1
```

### Step 2: Configure SSH Access (One-time setup)
1. Go to Jenkins: http://147.93.153.247:8080
2. Navigate to **Manage Jenkins** → **Manage Credentials**
3. Add SSH key with ID: `vps-ssh-key`

### Step 3: Deploy FarmTally
1. Go to your new job: http://147.93.153.247:8080/job/farmtally-isolated-deployment
2. Click **"Build Now"**
3. Wait for deployment to complete (5-10 minutes)

## 📋 Access URLs After Deployment

| Service | URL | Purpose |
|---------|-----|---------|
| **FarmTally Frontend** | http://147.93.153.247:8081 | Main application |
| **FarmTally API** | http://147.93.153.247:8082 | Backend API |
| **Health Check** | http://147.93.153.247:8082/health | System status |
| **Jenkins** | http://147.93.153.247:8080 | CI/CD Management |
| **Portainer** | http://147.93.153.247:9000 | Docker Management |

## 🔧 Jenkins Job Configuration

The job is configured with these parameters:

```yaml
Job Name: farmtally-isolated-deployment
Pipeline File: Jenkinsfile.isolated
Repository: https://github.com/Sariki-2047/FarmTally.git
Branch: main

Environment Variables:
- FARMTALLY_FRONTEND_PORT: 8081
- FARMTALLY_BACKEND_PORT: 8082
- FARMTALLY_DB_PORT: 8083
- FARMTALLY_NETWORK: farmtally-network
- DEPLOY_DIR: /opt/farmtally-jenkins
```

## 🐳 Docker Container Details

### Isolated Containers Created:
1. **farmtally-frontend-isolated**
   - Image: nginx:alpine with built frontend
   - Port: 8081 → 80
   - Network: farmtally-network

2. **farmtally-backend-isolated**
   - Image: node:18-alpine with backend
   - Port: 8082 → 8082
   - Network: farmtally-network

3. **farmtally-db-isolated**
   - Image: postgres:14-alpine
   - Port: 8083 → 5432
   - Network: farmtally-network
   - Volume: farmtally_db_data

## 🔍 Monitoring & Management

### Check Deployment Status
```bash
# SSH to VPS
ssh root@147.93.153.247

# Check FarmTally containers
cd /opt/farmtally-jenkins
docker-compose -f docker-compose.isolated.yml ps

# View logs
docker-compose -f docker-compose.isolated.yml logs -f
```

### Health Checks
```bash
# Application health
curl http://147.93.153.247:8082/health

# Frontend accessibility
curl http://147.93.153.247:8081

# Database connectivity
docker exec farmtally-db-isolated psql -U farmtally -d farmtally -c "SELECT 1;"
```

### Restart Services
```bash
# Via Jenkins (Recommended)
# Go to Jenkins job and click "Build Now"

# Or manually via SSH
ssh root@147.93.153.247
cd /opt/farmtally-jenkins
docker-compose -f docker-compose.isolated.yml restart
```

## 🔐 Security & Isolation

### Network Isolation
- FarmTally runs in its own Docker network (`farmtally-network`)
- No direct access to other containers or services
- Only exposed ports are accessible externally

### File System Isolation
- All FarmTally files in `/opt/farmtally-jenkins`
- Separate from other projects
- Database data in isolated Docker volume

### Port Isolation
- Uses unique ports (8081, 8082, 8083)
- No conflicts with standard ports (80, 3000, 5432)
- Other projects can use standard ports

## 🚨 Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Check what's using the ports
netstat -tulpn | grep :8081
netstat -tulpn | grep :8082
netstat -tulpn | grep :8083

# If needed, change ports in Jenkins job parameters
```

**2. Jenkins Job Fails**
```bash
# Check Jenkins logs
# Go to Jenkins → Job → Build History → Console Output

# Check Docker on VPS
ssh root@147.93.153.247
docker ps -a
docker logs farmtally-backend-isolated
```

**3. Application Not Accessible**
```bash
# Check container status
docker-compose -f docker-compose.isolated.yml ps

# Check network connectivity
docker network ls | grep farmtally
docker network inspect farmtally-network
```

**4. Database Connection Issues**
```bash
# Check database container
docker logs farmtally-db-isolated

# Test database connection
docker exec farmtally-db-isolated psql -U farmtally -d farmtally -c "\\l"
```

### Debug Commands
```bash
# Enter backend container
docker exec -it farmtally-backend-isolated sh

# Enter database container
docker exec -it farmtally-db-isolated psql -U farmtally -d farmtally

# Check application logs
docker-compose -f docker-compose.isolated.yml logs farmtally-backend
docker-compose -f docker-compose.isolated.yml logs farmtally-frontend
```

## 🔄 CI/CD Workflow

### Automated Deployment Process
1. **Code Push** → GitHub repository
2. **Webhook Trigger** → Jenkins job starts
3. **Build Process** → Checkout, install, build, test
4. **Docker Images** → Create isolated containers
5. **VPS Deployment** → Deploy to isolated environment
6. **Health Checks** → Verify deployment success
7. **Notifications** → Success/failure alerts

### Manual Deployment
1. Go to Jenkins job
2. Click "Build Now"
3. Monitor progress in console output
4. Access application once complete

## 📊 Monitoring Dashboard

### Jenkins Pipeline View
- Build history and status
- Console output and logs
- Artifact management
- Deployment metrics

### Portainer Management
- Container status and resources
- Log viewing and management
- Network and volume management
- Performance monitoring

## 🎯 Benefits of Isolated Deployment

### ✅ Advantages
- **No Conflicts**: Won't interfere with existing projects
- **Safe Testing**: Isolated environment for testing
- **Easy Rollback**: Jenkins manages deployment history
- **Professional CI/CD**: Automated build and deployment
- **Monitoring**: Built-in health checks and logging
- **Scalable**: Easy to add staging environments

### 🔧 Management
- **Updates**: Push to GitHub → Automatic deployment
- **Rollback**: Use Jenkins build history
- **Monitoring**: Jenkins + Portainer dashboards
- **Logs**: Centralized logging via Docker

## 🚀 Ready to Deploy?

### Quick Start Commands:
```powershell
# 1. Create Jenkins job
.\create-jenkins-isolated-job.ps1

# 2. Go to Jenkins and build
# Visit: http://147.93.153.247:8080/job/farmtally-isolated-deployment
# Click: "Build Now"

# 3. Access your application
# Frontend: http://147.93.153.247:8081
# Backend: http://147.93.153.247:8082
```

Your FarmTally application will be deployed in complete isolation, ensuring no interference with your existing projects while providing professional CI/CD capabilities! 🎉