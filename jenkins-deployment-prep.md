# FarmTally Jenkins Deployment Preparation

## Overview
This document outlines the preparation steps for deploying FarmTally via Jenkins after removing it from Contabo.

## Phase 1: Contabo Cleanup ✅

### Cleanup Scripts Available
- **Linux/WSL/Git Bash**: `./contabo-cleanup-script.sh`
- **Windows**: `contabo-cleanup-script.bat`

### What Gets Removed
- All FarmTally application files
- Database and database users
- PM2 processes and configurations
- Node.js processes on FarmTally ports
- Temporary files and logs
- Cron jobs related to FarmTally

### What Gets Backed Up
- Application source code (`farmtally-app-backup.tar.gz`)
- Database dump (`farmtally-db-backup.sql`)
- PM2 configuration (`pm2-backup.json`)
- Environment variables (`.env*` files)

## Phase 2: Jenkins Setup Requirements

### Jenkins Server Requirements
```yaml
Minimum Specifications:
  CPU: 2 cores
  RAM: 4GB
  Storage: 50GB SSD
  OS: Ubuntu 20.04+ or CentOS 8+
  
Network:
  - Internet access for Git repositories
  - SSH access to deployment targets
  - Port 8080 for Jenkins UI (or custom port)
```

### Required Jenkins Plugins
```
Essential Plugins:
- Git Plugin
- SSH Agent Plugin
- NodeJS Plugin
- Pipeline Plugin
- Docker Pipeline (if using containers)
- Email Extension Plugin
- Build Timeout Plugin
- Workspace Cleanup Plugin
```

### Jenkins Global Tools Configuration
```yaml
NodeJS:
  - Name: "Node 18"
  - Version: "18.x"
  - Global npm packages: "pm2"

Git:
  - Default Git installation

SSH:
  - SSH credentials for VPS access
  - Private key for root@147.93.153.247
```

## Phase 3: Repository Preparation

### Git Repository Structure
```
farmtally-jenkins/
├── 📁 backend/                    # Backend source code
├── 📁 frontend/                   # Frontend source code  
├── 📁 deployment/                 # Deployment scripts
│   ├── Jenkinsfile               # Jenkins pipeline definition
│   ├── deploy-backend.sh         # Backend deployment script
│   ├── deploy-frontend.sh        # Frontend deployment script
│   └── docker-compose.yml        # Container orchestration (optional)
├── 📁 infrastructure/             # Infrastructure as code
│   ├── terraform/                # Terraform configs (optional)
│   └── ansible/                  # Ansible playbooks (optional)
└── 📄 README.md                  # Deployment documentation
```

### Environment Configuration
```yaml
Development:
  Backend: http://dev.api.farmtally.in
  Frontend: http://dev.farmtally.in
  Database: dev-farmtally-db

Staging:
  Backend: http://staging.api.farmtally.in  
  Frontend: http://staging.farmtally.in
  Database: staging-farmtally-db

Production:
  Backend: http://api.farmtally.in
  Frontend: http://app.farmtally.in
  Database: prod-farmtally-db
```

## Phase 4: Jenkins Pipeline Design

### Pipeline Stages
```groovy
pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
        VPS_HOST = '147.93.153.247'
        VPS_USER = 'root'
    }
    
    stages {
        stage('Checkout') {
            // Git checkout
        }
        
        stage('Install Dependencies') {
            // npm install for backend and frontend
        }
        
        stage('Run Tests') {
            // Unit tests, integration tests
        }
        
        stage('Build') {
            // Build backend and frontend
        }
        
        stage('Deploy Backend') {
            // Deploy to VPS via SSH
        }
        
        stage('Deploy Frontend') {
            // Deploy to Vercel or VPS
        }
        
        stage('Health Check') {
            // Verify deployment success
        }
        
        stage('Notify') {
            // Send deployment notifications
        }
    }
}
```

### Deployment Strategies

#### Option 1: Direct VPS Deployment
```yaml
Pros:
  - Simple setup
  - Direct control over server
  - Cost effective

Cons:
  - Manual server management
  - Limited scalability
  - Single point of failure

Process:
  1. SSH to VPS
  2. Pull latest code
  3. Install dependencies
  4. Build application
  5. Restart services
  6. Health check
```

#### Option 2: Docker Container Deployment
```yaml
Pros:
  - Consistent environments
  - Easy rollbacks
  - Better isolation
  - Scalable

Cons:
  - Additional complexity
  - Resource overhead
  - Docker knowledge required

Process:
  1. Build Docker images
  2. Push to registry
  3. Deploy containers
  4. Update load balancer
  5. Health check
```

#### Option 3: Kubernetes Deployment
```yaml
Pros:
  - Auto-scaling
  - High availability
  - Rolling updates
  - Service discovery

Cons:
  - High complexity
  - Resource intensive
  - Steep learning curve

Process:
  1. Build and push images
  2. Update K8s manifests
  3. Apply deployments
  4. Monitor rollout
  5. Health check
```

## Phase 5: Infrastructure Setup

### VPS Preparation (Post-Cleanup)
```bash
# Update system
apt update && apt upgrade -y

# Install required software
apt install -y nodejs npm postgresql nginx certbot

# Install PM2 globally
npm install -g pm2

# Setup PostgreSQL
systemctl enable postgresql
systemctl start postgresql

# Create database and user
sudo -u postgres createdb farmtally
sudo -u postgres createuser farmtally

# Setup Nginx (if not using Vercel for frontend)
systemctl enable nginx
systemctl start nginx

# Setup SSL certificates
certbot --nginx -d api.farmtally.in
```

### Database Setup
```sql
-- Create database
CREATE DATABASE farmtally;

-- Create user with permissions
CREATE USER farmtally WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE farmtally TO farmtally;

-- Enable required extensions
\c farmtally;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Environment Variables
```env
# Production Backend (.env)
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://farmtally:password@localhost:5432/farmtally
JWT_SECRET=super-secure-jwt-secret-for-production
FRONTEND_URL=https://app.farmtally.in
SMTP_HOST=smtp.hostinger.com
SMTP_USER=noreply@farmtally.in
SMTP_PASS=secure_email_password
```

## Phase 6: Jenkins Job Configuration

### Freestyle Job Setup
```yaml
Source Code Management:
  - Git Repository URL
  - Credentials for private repos
  - Branch to build (main/master)

Build Triggers:
  - GitHub webhook (recommended)
  - Poll SCM (fallback)
  - Manual trigger

Build Environment:
  - Delete workspace before build
  - Set build timeout (30 minutes)
  - Use Node.js 18

Build Steps:
  1. Execute shell script for backend
  2. Execute shell script for frontend
  3. Execute deployment script

Post-build Actions:
  - Archive artifacts
  - Send email notifications
  - Slack notifications (optional)
```

### Pipeline Job Setup (Recommended)
```groovy
// Jenkinsfile example
pipeline {
    agent any
    
    tools {
        nodejs 'Node 18'
    }
    
    environment {
        VPS_CREDENTIALS = credentials('vps-ssh-key')
        DATABASE_URL = credentials('database-url')
        JWT_SECRET = credentials('jwt-secret')
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/your-org/farmtally.git'
            }
        }
        
        stage('Backend Build') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                    sh 'npm run build'
                    sh 'npm test'
                }
            }
        }
        
        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }
        
        stage('Deploy') {
            steps {
                sshagent(['vps-ssh-key']) {
                    sh './deployment/deploy.sh'
                }
            }
        }
        
        stage('Health Check') {
            steps {
                sh 'curl -f http://147.93.153.247:3000/health'
            }
        }
    }
    
    post {
        success {
            emailext (
                subject: "✅ FarmTally Deployment Successful",
                body: "Deployment completed successfully at ${env.BUILD_URL}",
                to: "admin@farmtally.in"
            )
        }
        failure {
            emailext (
                subject: "❌ FarmTally Deployment Failed",
                body: "Deployment failed. Check logs at ${env.BUILD_URL}",
                to: "admin@farmtally.in"
            )
        }
    }
}
```

## Phase 7: Monitoring & Rollback

### Health Checks
```bash
# Backend health
curl -f http://147.93.153.247:3000/health

# Frontend health  
curl -f https://app.farmtally.in

# Database connectivity
npm run db:check

# Service status
pm2 status
systemctl status nginx
systemctl status postgresql
```

### Rollback Strategy
```bash
# Quick rollback script
#!/bin/bash
BACKUP_VERSION=$1

if [ -z "$BACKUP_VERSION" ]; then
    echo "Usage: ./rollback.sh <backup_version>"
    exit 1
fi

# Stop current services
pm2 stop all

# Restore previous version
cp -r /opt/farmtally-backups/$BACKUP_VERSION/* /opt/farmtally/

# Restart services
pm2 start ecosystem.config.js

# Health check
sleep 10
curl -f http://localhost:3000/health || echo "Rollback failed!"
```

## Phase 8: Security Considerations

### VPS Security
```bash
# Firewall setup
ufw enable
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3000

# SSH hardening
# Disable root login (after setting up deploy user)
# Use SSH keys only
# Change default SSH port

# Regular updates
apt update && apt upgrade -y
```

### Application Security
```yaml
Environment Variables:
  - Use Jenkins credentials store
  - Never commit secrets to Git
  - Rotate secrets regularly

Database:
  - Use strong passwords
  - Enable SSL connections
  - Regular backups
  - Limit network access

API Security:
  - Rate limiting
  - Input validation
  - HTTPS only
  - JWT token expiration
```

## Phase 9: Next Steps Checklist

### Pre-Deployment
- [ ] Run Contabo cleanup script
- [ ] Verify backups are complete
- [ ] Setup Jenkins server
- [ ] Install required plugins
- [ ] Configure global tools
- [ ] Setup Git repository
- [ ] Create Jenkinsfile
- [ ] Configure VPS post-cleanup

### Deployment Setup
- [ ] Create Jenkins job
- [ ] Configure SSH credentials
- [ ] Setup environment variables
- [ ] Test pipeline on staging
- [ ] Configure notifications
- [ ] Setup monitoring
- [ ] Create rollback procedures

### Go-Live
- [ ] Run deployment pipeline
- [ ] Verify health checks
- [ ] Test critical workflows
- [ ] Monitor for issues
- [ ] Update DNS if needed
- [ ] Notify stakeholders

---

**Ready for Jenkins Deployment**: After completing Contabo cleanup and following this preparation guide, FarmTally will be ready for automated Jenkins deployment with proper CI/CD practices.