# Jenkins Isolated Deployment for FarmTally

## 🎯 Safe Jenkins Deployment Strategy

This approach uses Jenkins to deploy FarmTally in **isolated Docker containers** with **unique ports** to avoid conflicts with existing projects.

## 🏗️ Isolated Architecture

```
VPS Server (147.93.153.247)
├── Existing Projects (untouched)
├── Jenkins (Port 8080) → Controls FarmTally deployment
└── FarmTally Containers (Isolated)
    ├── Frontend: Port 8081 (Nginx)
    ├── Backend: Port 8082 (Node.js API)
    ├── Database: Port 8083 (PostgreSQL)
    └── Network: farmtally-network (isolated)
```

## 🚀 Step-by-Step Jenkins Setup

### Step 1: Create Jenkins Job
1. Go to http://147.93.153.247:8080
2. Navigate to **FarmTally folder**
3. Click **"New Item"**
4. Name: `farmtally-deployment`
5. Type: **Pipeline**

### Step 2: Configure Pipeline
**Pipeline Definition**: Pipeline script from SCM
- **SCM**: Git
- **Repository URL**: `https://github.com/Sariki-2047/FarmTally.git`
- **Branch**: `*/main`
- **Script Path**: `Jenkinsfile`

### Step 3: Environment Variables
Add these in Jenkins job configuration:
```
FARMTALLY_FRONTEND_PORT=8081
FARMTALLY_BACKEND_PORT=8082
FARMTALLY_DB_PORT=8083
FARMTALLY_NETWORK=farmtally-network
PROJECT_NAME=farmtally
```

## 📋 Access URLs After Deployment
- **Frontend**: http://147.93.153.247:8081
- **Backend API**: http://147.93.153.247:8082
- **Health Check**: http://147.93.153.247:8082/health
- **Jenkins**: http://147.93.153.247:8080
- **Portainer**: http://147.93.153.247:9000