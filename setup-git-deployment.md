# Git-Based Deployment Setup for FarmTally

## 🚀 Git Deployment Strategy

### Option 1: GitHub Repository + Auto-Deploy (Recommended)
```bash
# 1. Push to GitHub
git add .
git commit -m "Consolidated FarmTally deployment ready"
git push origin main

# 2. VPS pulls from GitHub
ssh root@147.93.153.247 "
  cd /opt/farmtally
  git pull origin main
  docker-compose -f docker-compose.consolidated.yml up -d --build
"
```

### Option 2: Direct Git Push to VPS
```bash
# Set up bare repository on VPS for direct push
ssh root@147.93.153.247 "
  git init --bare /opt/farmtally-git.git
  cd /opt/farmtally-git.git/hooks
  # Create post-receive hook for auto-deployment
"
```

### Option 3: GitHub Actions CI/CD
```yaml
# .github/workflows/deploy.yml
name: Deploy FarmTally
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to VPS
        run: |
          ssh root@147.93.153.247 "
            cd /opt/farmtally &&
            git pull origin main &&
            docker-compose -f docker-compose.consolidated.yml up -d --build
          "
```

## 🔧 Implementation Steps

### Step 1: Initialize Git Repository (if not done)
```bash
git init
git add .
git commit -m "Initial FarmTally consolidated setup"
```

### Step 2: Set up GitHub Repository
```bash
# Create repository on GitHub, then:
git remote add origin https://github.com/yourusername/farmtally.git
git push -u origin main
```

### Step 3: Configure VPS for Git Deployment
```bash
ssh root@147.93.153.247 "
  # Install git if not present
  apt update && apt install -y git
  
  # Clone repository to deployment directory
  cd /opt
  git clone https://github.com/yourusername/farmtally.git
  cd farmtally
  
  # Set up deployment script
  chmod +x deploy-consolidated.sh
"
```

### Step 4: Create Git Deployment Script
```bash
#!/bin/bash
# git-deploy.sh - Deploy via Git

VPS_HOST="147.93.153.247"
VPS_USER="root"
PROJECT_DIR="/opt/farmtally"
REPO_URL="https://github.com/yourusername/farmtally.git"

echo "🚀 Git-based FarmTally Deployment"

# Deploy on VPS via Git
ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "
  cd $PROJECT_DIR
  
  echo 'Pulling latest changes...'
  git pull origin main
  
  echo 'Building frontend...'
  cd farmtally-frontend
  npm ci
  npm run build
  cd ..
  
  echo 'Deploying with Docker Compose...'
  docker-compose -f docker-compose.consolidated.yml down
  docker-compose -f docker-compose.consolidated.yml up -d --build
  
  echo 'Deployment complete!'
"
```

## 📋 Advantages of Each Approach

### GitHub + Manual Pull:
- ✅ Simple and reliable
- ✅ Full version control
- ✅ Easy rollbacks
- ✅ Can review changes before deploy

### Direct Git Push:
- ✅ Instant deployment on push
- ✅ No GitHub dependency
- ✅ Private repository on VPS
- ⚠️ More complex setup

### GitHub Actions:
- ✅ Fully automated CI/CD
- ✅ Can run tests before deploy
- ✅ Deployment history
- ✅ Can deploy to multiple environments

## 🎯 Recommended Workflow

1. **Development**: Work locally, commit changes
2. **Push**: `git push origin main`
3. **Deploy**: Run git deployment script
4. **Verify**: Check deployment status
5. **Rollback**: `git checkout previous-commit` if needed