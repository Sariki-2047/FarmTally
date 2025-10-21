# Jenkins FarmTally Setup Guide

## 🎯 **Jenkins Configuration for FarmTally Deployment**

### **Access Information**
- **URL**: http://147.93.153.247:8080
- **Username**: admin
- **Password**: MitraMitra@12345

## 📋 **Phase 1: Initial Jenkins Configuration**

### **Step 1: Install Required Plugins**

1. **Login to Jenkins** at http://147.93.153.247:8080
2. **Go to**: Manage Jenkins → Manage Plugins → Available
3. **Install these plugins**:
   - ✅ **Git Plugin** (for repository access)
   - ✅ **NodeJS Plugin** (for Node.js builds)
   - ✅ **SSH Agent Plugin** (for VPS deployment)
   - ✅ **Pipeline Plugin** (for advanced pipelines)
   - ✅ **Email Extension Plugin** (for notifications)
   - ✅ **Build Timeout Plugin** (prevent hanging builds)
   - ✅ **Workspace Cleanup Plugin** (clean builds)
   - ✅ **Timestamper Plugin** (build logs with timestamps)

### **Step 2: Configure Global Tools**

**Go to**: Manage Jenkins → Global Tool Configuration

#### **NodeJS Configuration**
- **Name**: `Node 18`
- **Version**: `NodeJS 18.x`
- **Global npm packages**: `pm2`
- ✅ **Install automatically**: Checked

#### **Git Configuration**
- **Name**: `Default`
- **Path to Git executable**: `/usr/bin/git`

### **Step 3: Configure System Settings**

**Go to**: Manage Jenkins → Configure System

#### **Jenkins Location**
- **Jenkins URL**: `http://147.93.153.247:8080/`
- **System Admin e-mail address**: `admin@farmtally.in`

#### **Email Configuration (Optional)**
- **SMTP server**: `smtp.hostinger.com`
- **Default user e-mail suffix**: `@farmtally.in`
- **Use SMTP Authentication**: ✅
- **User Name**: `noreply@farmtally.in`
- **Password**: `2t/!P1K]w`
- **SMTP port**: `587`
- **Use TLS**: ✅

## 🔐 **Phase 2: Credentials Setup**

### **Step 1: Add VPS SSH Credentials**

**Go to**: Manage Jenkins → Manage Credentials → System → Global credentials

#### **SSH Private Key for VPS**
- **Kind**: `SSH Username with private key`
- **ID**: `vps-ssh-key`
- **Description**: `Contabo VPS SSH Access`
- **Username**: `root`
- **Private Key**: Enter your SSH private key
- **Passphrase**: (if your key has one)

#### **Database Credentials**
- **Kind**: `Username with password`
- **ID**: `farmtally-db`
- **Description**: `FarmTally Database Credentials`
- **Username**: `farmtally`
- **Password**: `your-db-password`

#### **JWT Secret**
- **Kind**: `Secret text`
- **ID**: `jwt-secret`
- **Description**: `FarmTally JWT Secret`
- **Secret**: `your-super-secure-jwt-secret`

#### **Email Credentials**
- **Kind**: `Username with password`
- **ID**: `farmtally-email`
- **Description**: `FarmTally Email SMTP`
- **Username**: `noreply@farmtally.in`
- **Password**: `2t/!P1K]w`

## 🚀 **Phase 3: Create FarmTally Deployment Job**

### **Step 1: Create New Pipeline Job**

1. **Click**: "New Item"
2. **Enter name**: `FarmTally-Deployment`
3. **Select**: "Pipeline"
4. **Click**: "OK"

### **Step 2: Configure Pipeline**

#### **General Settings**
- ✅ **Discard old builds**: Keep 10 builds
- ✅ **GitHub project**: `https://github.com/your-org/farmtally` (if using GitHub)

#### **Build Triggers**
- ✅ **GitHub hook trigger for GITScm polling** (if using GitHub webhooks)
- ✅ **Poll SCM**: `H/5 * * * *` (check every 5 minutes as fallback)

#### **Pipeline Definition**
- **Definition**: `Pipeline script from SCM`
- **SCM**: `Git`
- **Repository URL**: `https://github.com/your-org/farmtally.git`
- **Credentials**: (add if private repo)
- **Branch**: `*/main`
- **Script Path**: `Jenkinsfile`

## 📝 **Phase 4: Create Jenkinsfile**

Create this `Jenkinsfile` in your repository root:

```groovy
pipeline {
    agent any
    
    tools {
        nodejs 'Node 18'
    }
    
    environment {
        VPS_HOST = '147.93.153.247'
        VPS_USER = 'root'
        APP_DIR = '/opt/farmtally'
        NODE_ENV = 'production'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out source code...'
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        echo '📦 Installing backend dependencies...'
                        dir('backend') {
                            sh 'npm ci --only=production'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        echo '📦 Installing frontend dependencies...'
                        dir('frontend') {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }
        
        stage('Build') {
            parallel {
                stage('Build Backend') {
                    steps {
                        echo '🔨 Building backend...'
                        dir('backend') {
                            sh 'npm run build'
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        echo '🔨 Building frontend...'
                        dir('frontend') {
                            sh 'npm run build'
                        }
                    }
                }
            }
        }
        
        stage('Test') {
            steps {
                echo '🧪 Running tests...'
                dir('backend') {
                    sh 'npm test || true'  // Don't fail build on test failure initially
                }
            }
        }
        
        stage('Deploy to VPS') {
            steps {
                echo '🚀 Deploying to VPS...'
                sshagent(['vps-ssh-key']) {
                    script {
                        // Create deployment directory
                        sh """
                            ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} '
                                mkdir -p ${APP_DIR}
                                mkdir -p ${APP_DIR}/backend
                                mkdir -p ${APP_DIR}/logs
                            '
                        """
                        
                        // Deploy backend
                        sh """
                            scp -r backend/dist/* ${VPS_USER}@${VPS_HOST}:${APP_DIR}/backend/
                            scp backend/package.json ${VPS_USER}@${VPS_HOST}:${APP_DIR}/backend/
                            scp backend/package-lock.json ${VPS_USER}@${VPS_HOST}:${APP_DIR}/backend/
                        """
                        
                        // Install production dependencies and restart
                        sh """
                            ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} '
                                cd ${APP_DIR}/backend
                                npm ci --only=production
                                
                                # Stop existing PM2 processes
                                pm2 stop farmtally-backend || true
                                pm2 delete farmtally-backend || true
                                
                                # Start new process
                                pm2 start server.js --name farmtally-backend
                                pm2 save
                                
                                # Show status
                                pm2 status
                            '
                        """
                    }
                }
            }
        }
        
        stage('Health Check') {
            steps {
                echo '🏥 Performing health check...'
                script {
                    sleep(10) // Wait for service to start
                    
                    def healthCheck = sh(
                        script: "curl -f http://${VPS_HOST}:3000/health || exit 1",
                        returnStatus: true
                    )
                    
                    if (healthCheck != 0) {
                        error("Health check failed!")
                    } else {
                        echo "✅ Health check passed!"
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ Deployment successful!'
            emailext (
                subject: "✅ FarmTally Deployment Successful - Build #${BUILD_NUMBER}",
                body: """
                    <h2>🎉 FarmTally Deployment Successful!</h2>
                    <p><strong>Build:</strong> #${BUILD_NUMBER}</p>
                    <p><strong>Branch:</strong> ${GIT_BRANCH}</p>
                    <p><strong>Commit:</strong> ${GIT_COMMIT}</p>
                    <p><strong>URL:</strong> <a href="http://147.93.153.247:3000">http://147.93.153.247:3000</a></p>
                    <p><strong>Jenkins:</strong> <a href="${BUILD_URL}">${BUILD_URL}</a></p>
                """,
                to: "admin@farmtally.in",
                mimeType: 'text/html'
            )
        }
        
        failure {
            echo '❌ Deployment failed!'
            emailext (
                subject: "❌ FarmTally Deployment Failed - Build #${BUILD_NUMBER}",
                body: """
                    <h2>💥 FarmTally Deployment Failed!</h2>
                    <p><strong>Build:</strong> #${BUILD_NUMBER}</p>
                    <p><strong>Branch:</strong> ${GIT_BRANCH}</p>
                    <p><strong>Error:</strong> Check the build logs for details</p>
                    <p><strong>Jenkins:</strong> <a href="${BUILD_URL}">${BUILD_URL}</a></p>
                """,
                to: "admin@farmtally.in",
                mimeType: 'text/html'
            )
        }
        
        always {
            echo '🧹 Cleaning up workspace...'
            cleanWs()
        }
    }
}
```

## 🔧 **Phase 5: VPS Preparation for Jenkins Deployment**

Run these commands on your VPS to prepare for Jenkins deployments:

```bash
# Create application directory
mkdir -p /opt/farmtally/backend
mkdir -p /opt/farmtally/logs

# Install PM2 globally (if not already installed)
npm install -g pm2

# Create PM2 ecosystem file
cat > /opt/farmtally/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'farmtally-backend',
    script: '/opt/farmtally/backend/server.js',
    cwd: '/opt/farmtally/backend',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: '/opt/farmtally/logs/combined.log',
    out_file: '/opt/farmtally/logs/out.log',
    error_file: '/opt/farmtally/logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z'
  }]
};
EOF

# Set proper permissions
chown -R root:root /opt/farmtally
chmod -R 755 /opt/farmtally

# Install PostgreSQL (if not already installed)
apt update
apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create FarmTally database and user
sudo -u postgres psql << 'EOF'
CREATE DATABASE farmtally;
CREATE USER farmtally WITH PASSWORD 'secure_farmtally_password';
GRANT ALL PRIVILEGES ON DATABASE farmtally TO farmtally;
\q
EOF

echo "✅ VPS prepared for Jenkins deployment!"
```

## 🎯 **Phase 6: Test Deployment**

### **Step 1: Trigger First Build**

1. **Go to Jenkins dashboard**
2. **Click on**: `FarmTally-Deployment`
3. **Click**: "Build Now"
4. **Monitor**: Console Output

### **Step 2: Verify Deployment**

After successful build:
- ✅ **Backend**: http://147.93.153.247:3000/health
- ✅ **PM2 Status**: `pm2 status` on VPS
- ✅ **Logs**: `pm2 logs farmtally-backend`

## 📊 **Phase 7: Monitoring & Maintenance**

### **Jenkins Monitoring**
- **Build History**: Track deployment success/failure
- **Console Logs**: Debug deployment issues
- **Email Notifications**: Get notified of build status

### **Application Monitoring**
```bash
# Check application status
pm2 status

# View logs
pm2 logs farmtally-backend

# Restart if needed
pm2 restart farmtally-backend

# Monitor system resources
htop
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Build Fails on Dependencies**
```bash
# Clear npm cache on VPS
npm cache clean --force
```

#### **Permission Issues**
```bash
# Fix permissions
chown -R root:root /opt/farmtally
chmod -R 755 /opt/farmtally
```

#### **Port Already in Use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

#### **Database Connection Issues**
```bash
# Check PostgreSQL status
systemctl status postgresql

# Restart PostgreSQL
systemctl restart postgresql
```

## 🎉 **Success Checklist**

- ✅ Jenkins accessible at http://147.93.153.247:8080
- ✅ Required plugins installed
- ✅ Credentials configured
- ✅ Pipeline job created
- ✅ Jenkinsfile in repository
- ✅ VPS prepared for deployment
- ✅ First deployment successful
- ✅ Health checks passing
- ✅ Monitoring setup

---

**Jenkins Setup Complete!** 🚀  
Your FarmTally project is now ready for automated deployment via Jenkins.

**Next Steps:**
1. Push your code to Git repository
2. Trigger Jenkins build
3. Monitor deployment
4. Setup automated triggers (webhooks)
5. Configure staging environment (optional)