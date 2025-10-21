# FarmTally VPS Deployment - Complete Guide

## 🎯 Quick Start (Choose One Method)

### Method 1: Automated PowerShell Deployment (Recommended for Windows)
```powershell
# Run this in PowerShell as Administrator
.\deploy-to-vps-now.ps1
```

### Method 2: Automated Bash Deployment (Linux/WSL)
```bash
# Run this in terminal
chmod +x deploy-to-vps-now.sh
./deploy-to-vps-now.sh
```

### Method 3: Manual Jenkins Setup
```powershell
# Create Jenkins job automatically
.\create-jenkins-job.ps1
```

## 🏗️ Infrastructure Overview

| Service | URL | Purpose |
|---------|-----|---------|
| **Application** | http://147.93.153.247 | Main FarmTally app |
| **Jenkins** | http://147.93.153.247:8080 | CI/CD Pipeline |
| **Portainer** | http://147.93.153.247:9000 | Docker Management |
| **API** | http://147.93.153.247:3000 | Backend API |
| **Database** | localhost:5432 | PostgreSQL |

## 📋 Pre-Deployment Checklist

- [ ] VPS accessible via SSH
- [ ] Jenkins running on port 8080
- [ ] Docker/Portainer running on port 9000
- [ ] Ports 80, 3000, 5432 available
- [ ] Git repository accessible
- [ ] SSH keys configured (optional)

## 🚀 Deployment Process

### Step 1: Run Deployment Script
Choose your platform and run the appropriate script:

**Windows PowerShell:**
```powershell
.\deploy-to-vps-now.ps1
```

**Linux/WSL:**
```bash
./deploy-to-vps-now.sh
```

### Step 2: Verify Deployment
After deployment, check these URLs:

1. **Application Health**: http://147.93.153.247/health
2. **Frontend**: http://147.93.153.247
3. **API**: http://147.93.153.247/api/health

### Step 3: Configure Jenkins (Optional)
```powershell
# Automatically create Jenkins job
.\create-jenkins-job.ps1
```

Or manually:
1. Go to http://147.93.153.247:8080
2. Navigate to FarmTally folder
3. Create new Pipeline job
4. Use repository: https://github.com/Sariki-2047/FarmTally.git
5. Script path: Jenkinsfile

## 🔧 What Gets Deployed

### Docker Services
- **farmtally-backend**: Node.js API server (port 3000)
- **farmtally-frontend**: Nginx web server (port 80)
- **farmtally-db**: PostgreSQL database (port 5432)

### File Structure on VPS
```
/opt/farmtally/
├── package.json              # Backend dependencies
├── Dockerfile               # Backend container config
├── docker-compose.yml       # Service orchestration
├── nginx.conf              # Frontend web server config
├── .env                    # Environment variables
├── farmtally-frontend/     # Frontend application
│   ├── dist/              # Built frontend files
│   └── package.json       # Frontend dependencies
└── scripts/               # Deployment scripts
```

### Environment Configuration
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://farmtally:farmtally123@farmtally-db:5432/farmtally
JWT_SECRET=farmtally_jwt_secret_key_2024
NEXT_PUBLIC_API_URL=http://147.93.153.247:3000
NEXT_PUBLIC_APP_URL=http://147.93.153.247
```

## 🔍 Verification Commands

### Check Service Status
```bash
# SSH to VPS
ssh root@147.93.153.247

# Check Docker containers
docker-compose ps

# View logs
docker-compose logs -f

# Check individual services
docker logs farmtally-backend
docker logs farmtally-frontend
docker logs farmtally-db
```

### Health Checks
```bash
# Application health
curl http://147.93.153.247/health

# API health
curl http://147.93.153.247/api/health

# Database connection
docker exec farmtally-db psql -U farmtally -d farmtally -c "SELECT 1;"
```

## 🛠️ Management Commands

### Restart Services
```bash
ssh root@147.93.153.247 "cd /opt/farmtally && docker-compose restart"
```

### Update Application
```bash
ssh root@147.93.153.247 "cd /opt/farmtally && git pull && docker-compose up -d --build"
```

### View Real-time Logs
```bash
ssh root@147.93.153.247 "cd /opt/farmtally && docker-compose logs -f"
```

### Backup Database
```bash
ssh root@147.93.153.247 "docker exec farmtally-db pg_dump -U farmtally farmtally > backup.sql"
```

## 🔐 Security Configuration

### Firewall Rules
```bash
# Allow required ports
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS (for SSL)
ufw allow 8080/tcp  # Jenkins
ufw allow 9000/tcp  # Portainer
ufw enable
```

### SSL Certificate (Optional)
```bash
# Install Certbot
apt install certbot python3-certbot-nginx

# Get certificate (replace with your domain)
certbot --nginx -d yourdomain.com
```

## 📊 Monitoring & Logs

### Application Logs
```bash
# Backend logs
docker logs farmtally-backend -f

# Frontend logs (Nginx)
docker logs farmtally-frontend -f

# Database logs
docker logs farmtally-db -f
```

### System Monitoring
```bash
# Resource usage
htop

# Disk usage
df -h

# Docker stats
docker stats
```

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Check what's using the port
netstat -tulpn | grep :80
# Kill the process or change port
```

**Database Connection Failed:**
```bash
# Check database status
docker logs farmtally-db
# Restart database
docker-compose restart farmtally-db
```

**Frontend Not Loading:**
```bash
# Check Nginx config
docker exec farmtally-frontend nginx -t
# Restart frontend
docker-compose restart farmtally-frontend
```

**Build Failures:**
```bash
# Check build logs
docker-compose logs farmtally-backend
# Rebuild with no cache
docker-compose build --no-cache
```

### Debug Commands
```bash
# Enter backend container
docker exec -it farmtally-backend sh

# Enter database container
docker exec -it farmtally-db psql -U farmtally -d farmtally

# Check network connectivity
docker network ls
docker network inspect farmtally_default
```

## 🔄 CI/CD Pipeline

### Jenkins Pipeline Features
- Automated builds on Git push
- Multi-stage deployment (staging → production)
- Automated testing
- Rollback capabilities
- Health checks and notifications

### Manual Pipeline Trigger
```bash
# Trigger Jenkins build
curl -X POST http://147.93.153.247:8080/job/FarmTally/job/farmtally-pipeline/build \
  --user admin:your_jenkins_token
```

## 📈 Next Steps

### Production Readiness
1. **Domain Setup**: Point domain to VPS IP
2. **SSL Certificate**: Enable HTTPS
3. **Environment Variables**: Update with production values
4. **Database**: Configure production database
5. **Monitoring**: Set up application monitoring
6. **Backups**: Configure automated backups
7. **Scaling**: Set up load balancing if needed

### Development Workflow
1. **Local Development**: Use development environment
2. **Git Push**: Triggers Jenkins pipeline
3. **Automated Testing**: Runs test suite
4. **Deployment**: Automatic deployment to VPS
5. **Monitoring**: Check application health

## 📞 Support

### Quick Commands Reference
```bash
# Deployment status
curl http://147.93.153.247/health

# Restart all services
ssh root@147.93.153.247 "cd /opt/farmtally && docker-compose restart"

# View logs
ssh root@147.93.153.247 "cd /opt/farmtally && docker-compose logs -f"

# Update application
ssh root@147.93.153.247 "cd /opt/farmtally && git pull && docker-compose up -d --build"
```

### Access URLs
- 🌐 **Application**: http://147.93.153.247
- 🔧 **Jenkins**: http://147.93.153.247:8080
- 🐳 **Docker**: http://147.93.153.247:9000
- 📊 **API Health**: http://147.93.153.247/api/health

---

**Ready to deploy? Run the deployment script and your FarmTally application will be live in minutes!** 🚀