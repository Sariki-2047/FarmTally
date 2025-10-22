# FarmTally CI/CD Management Guide

## 🎯 **Where to Manage FarmTally CI/CD**

### **Option 1: Existing Jenkins (Recommended)**

#### **Current Setup:**
- ✅ Jenkins already running on VPS
- ✅ Infrastructure ready
- ✅ No additional setup needed

#### **Access Jenkins:**
```
Current: http://147.93.153.247:8080
After port change: http://147.93.153.247:8082
```

#### **Setup FarmTally Pipeline:**

1. **Access Jenkins Dashboard**
   - Navigate to Jenkins URL
   - Login with admin credentials

2. **Create New Pipeline Job**
   ```
   Dashboard → New Item → Pipeline → Name: "FarmTally-Consolidated"
   ```

3. **Configure Pipeline**
   - Pipeline Definition: "Pipeline script from SCM"
   - SCM: Git
   - Repository URL: Your FarmTally repo
   - Script Path: `Jenkinsfile` or use our `jenkins-farmtally-consolidated-pipeline.groovy`

4. **Set Build Triggers**
   - GitHub webhook (on push)
   - Scheduled builds
   - Manual triggers

#### **Pipeline Features:**
- ✅ Automated builds on git push
- ✅ Frontend compilation
- ✅ Docker image building
- ✅ Deployment to VPS
- ✅ Health checks
- ✅ Rollback capabilities

### **Option 2: GitHub Actions (Cloud-based)**

#### **Setup:**
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy FarmTally
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to VPS
        run: |
          ssh root@147.93.153.247 "
            cd /opt/farmtally &&
            git pull origin main &&
            ./deploy-consolidated.sh
          "
```

#### **Pros:**
- ✅ No server maintenance
- ✅ Free for public repos
- ✅ Integrated with GitHub

#### **Cons:**
- ❌ Requires GitHub repository
- ❌ Limited free minutes for private repos

### **Option 3: GitLab CI/CD**

#### **Setup:**
Create `.gitlab-ci.yml`:
```yaml
stages:
  - build
  - deploy

deploy:
  stage: deploy
  script:
    - ssh root@147.93.153.247 "./deploy-consolidated.sh"
  only:
    - main
```

### **Option 4: Manual Git Deployment**

#### **Simple Approach:**
```bash
# Deploy whenever you want
./git-deploy.ps1
```

#### **Pros:**
- ✅ Full control
- ✅ No CI/CD server needed
- ✅ Simple and reliable

## 🚀 **Recommended Setup: Jenkins Pipeline**

### **Step 1: Move Jenkins to Port 8082**
```bash
ssh root@147.93.153.247 "
  docker stop jenkins
  docker run -d --name jenkins-new \
    -p 8082:8080 -p 50000:50000 \
    -v jenkins_home:/var/jenkins_home \
    --restart unless-stopped \
    jenkins/jenkins:lts
  docker rm jenkins
"
```

### **Step 2: Create FarmTally Pipeline Job**

1. **Access Jenkins**: http://147.93.153.247:8082
2. **New Item** → Pipeline → "FarmTally-Consolidated"
3. **Pipeline Script**: Copy from `jenkins-farmtally-consolidated-pipeline.groovy`

### **Step 3: Configure Webhooks (Optional)**

#### **GitHub Webhook:**
- Repository Settings → Webhooks
- Payload URL: `http://147.93.153.247:8082/github-webhook/`
- Content type: `application/json`
- Events: Push events

#### **Manual Trigger:**
- Just click "Build Now" in Jenkins

### **Step 4: Pipeline Configuration**

```groovy
pipeline {
    agent any
    
    environment {
        VPS_HOST = '147.93.153.247'
        VPS_USER = 'root'
        PROJECT_DIR = '/opt/farmtally'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/yourusername/farmtally.git'
            }
        }
        
        stage('Build Frontend') {
            steps {
                sh '''
                    cd farmtally-frontend
                    npm ci
                    npm run build
                '''
            }
        }
        
        stage('Deploy') {
            steps {
                sh './deploy-consolidated.sh'
            }
        }
        
        stage('Health Check') {
            steps {
                sh 'node test-consolidated-deployment.js'
            }
        }
    }
}
```

## 📋 **Management Dashboard Options**

### **Jenkins Dashboard Features:**
- 📊 Build history and logs
- 🔄 Manual deployment triggers
- 📈 Build success/failure metrics
- 🚨 Email notifications on failures
- 📝 Console output for debugging

### **Access URLs After Setup:**
```
Jenkins CI/CD: http://147.93.153.247:8082
FarmTally App: http://147.93.153.247:8080/farmtally/
Portainer: http://147.93.153.247:9000 (Docker management)
```

## 🎯 **Recommended Workflow**

### **Development Cycle:**
1. **Code Changes** → Commit to git
2. **Push to Repository** → Triggers Jenkins build
3. **Jenkins Pipeline** → Builds and deploys automatically
4. **Health Checks** → Verifies deployment success
5. **Notifications** → Email/Slack on success/failure

### **Manual Deployment:**
```bash
# Quick manual deployment
./git-deploy.ps1

# Or via Jenkins
# Just click "Build Now" in Jenkins dashboard
```

## 🔧 **Quick Setup Commands**

### **Move Jenkins and Deploy FarmTally:**
```bash
# 1. Move Jenkins to port 8082
ssh root@147.93.153.247 "
  docker stop jenkins &&
  docker run -d --name jenkins-new -p 8082:8080 -p 50000:50000 \
    -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts &&
  docker rm jenkins
"

# 2. Deploy FarmTally on port 8080
./deploy-consolidated.ps1

# 3. Access Jenkins at new URL
echo "Jenkins: http://147.93.153.247:8082"
echo "FarmTally: http://147.93.153.247:8080/farmtally/"
```

This gives you professional CI/CD management with the existing Jenkins infrastructure!