# Manual Jenkins Job Setup for FarmTally Isolated Deployment

Since the PowerShell scripts are having syntax issues, let's set up the Jenkins job manually. This is actually simpler and more reliable.

## 🎯 Step-by-Step Manual Setup

### Step 1: Access Jenkins
1. Open your browser
2. Go to: **http://147.93.153.247:8080**
3. Login with your Jenkins credentials

### Step 2: Navigate to FarmTally Folder
1. Look for the **"FarmTally"** folder in Jenkins dashboard
2. Click on it to enter the folder

### Step 3: Create New Pipeline Job
1. Click **"New Item"** (or **"Create a job"** if folder is empty)
2. Enter job name: **`farmtally-isolated-deployment`**
3. Select **"Pipeline"** as the job type
4. Click **"OK"**

### Step 4: Configure Pipeline
In the job configuration page:

**General Section:**
- Description: `FarmTally Isolated Deployment - Safe deployment with unique ports (8081, 8082, 8083)`

**Pipeline Section:**
- Definition: **Pipeline script from SCM**
- SCM: **Git**
- Repository URL: **`https://github.com/Sariki-2047/FarmTally.git`**
- Branch Specifier: **`*/main`**
- Script Path: **`Jenkinsfile.isolated`**

### Step 5: Save and Build
1. Click **"Save"** at the bottom
2. Click **"Build Now"** to start deployment
3. Monitor progress in **"Console Output"**

## 🌐 Access URLs After Deployment

Once the build completes successfully:

- **Frontend**: http://147.93.153.247:8081
- **Backend API**: http://147.93.153.247:8082
- **Health Check**: http://147.93.153.247:8082/health
- **Jenkins Job**: http://147.93.153.247:8080/job/farmtally-isolated-deployment

## 🔧 Required Jenkins Configuration

Before running the job, ensure Jenkins has:

1. **Node.js Tool**: 
   - Go to Manage Jenkins → Global Tool Configuration
   - Add Node.js 18 installation

2. **SSH Credentials** (if needed):
   - Go to Manage Jenkins → Manage Credentials
   - Add SSH private key with ID: `vps-ssh-key`

3. **Docker Access**:
   - Ensure Jenkins can run Docker commands
   - Docker should be installed on Jenkins server

## 🚀 Deployment Process

The pipeline will:
1. **Checkout** code from GitHub
2. **Install** dependencies (backend & frontend)
3. **Build** applications
4. **Create** Docker images with isolated configuration
5. **Deploy** to VPS with unique ports
6. **Health Check** deployment success

## 📊 Monitoring Deployment

### During Build:
- Watch **Console Output** for real-time progress
- Build typically takes 5-10 minutes

### After Build:
- Check **Build History** for success/failure
- View **Workspace** to see build artifacts
- Access application at the URLs above

## 🛠️ Troubleshooting

### If Build Fails:
1. Check **Console Output** for error details
2. Verify GitHub repository is accessible
3. Ensure Docker is running on VPS
4. Check port availability (8081, 8082, 8083)

### Common Issues:
- **Port conflicts**: Change ports in Jenkinsfile.isolated
- **Permission errors**: Check SSH access to VPS
- **Docker errors**: Verify Docker installation

## ✅ Success Indicators

Build is successful when you see:
- ✅ All pipeline stages complete
- ✅ Health checks pass
- ✅ Application accessible at URLs
- ✅ No error messages in console

Ready to proceed with manual setup? Follow the steps above! 🚀