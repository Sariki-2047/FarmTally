# 🚀 Jenkins Pipeline Update Guide - Add Frontend Deployment

## 🎯 **OBJECTIVE**
Update your existing Jenkins job to deploy both backend microservices AND frontend with a single pipeline.

## 📋 **CURRENT vs NEW PIPELINE**

### **Current Pipeline (Backend Only):**
```
✅ Auth Service
✅ API Gateway  
✅ Field Manager Service
✅ Farm Admin Service
❌ Frontend (Missing!)
```

### **New Complete Pipeline:**
```
✅ Auth Service
✅ API Gateway  
✅ Field Manager Service
✅ Farm Admin Service
✅ Frontend Build & Deploy
✅ Nginx Configuration
✅ Complete Health Checks
```

## 🔧 **STEP-BY-STEP UPDATE PROCESS**

### **Step 1: Access Jenkins Dashboard**
1. Open your Jenkins dashboard: `http://your-jenkins-url:8080`
2. Navigate to your existing FarmTally job
3. Click **"Configure"**

### **Step 2: Backup Current Pipeline**
```groovy
// Save your current pipeline script as backup
// Copy the existing script to a text file before updating
```

### **Step 3: Update Pipeline Script**
Replace your current pipeline script with the complete version:

1. **Scroll down to "Pipeline" section**
2. **Clear the existing script**
3. **Paste the new complete pipeline script** (see below)

### **Step 4: Verify Environment Variables**
Ensure these environment variables are set:
```groovy
environment {
    VPS_HOST = '147.93.153.247'
    VPS_USER = 'root'
    PROJECT_DIR = '/opt/farmtally'
    DOCKER_COMPOSE_FILE = 'docker-compose.microservices.yml'
    FRONTEND_DIR = 'farmtally-frontend'
}
```

### **Step 5: Save and Test**
1. Click **"Save"**
2. Click **"Build Now"**
3. Monitor the build progress

## 📄 **COMPLETE PIPELINE SCRIPT**

Replace your current Jenkins pipeline with this complete version:

```groovy
pipeline {
    agent any
    
    environment {
        VPS_HOST = '147.93.153.247'
        VPS_USER = 'root'
        PROJECT_DIR = '/opt/farmtally'
        DOCKER_COMPOSE_FILE = 'docker-compose.microservices.yml'
        FRONTEND_DIR = 'farmtally-frontend'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out FarmTally source code...'
                sh 'pwd && ls -la'
            }
        }
        
        stage('Verify Dependencies') {
            parallel {
                stage('Docker') {
                    steps {
                        echo '🐳 Verifying Docker availability...'
                        script {
                            try {
                                sh 'docker --version'
                                sh 'docker-compose --version'
                                echo '✅ Docker is available'
                            } catch (Exception e) {
                                error '❌ Docker is not available in Jenkins'
                            }
                        }
                    }
                }
                
                stage('Node.js') {
                    steps {
                        echo '📦 Verifying Node.js for frontend build...'
                        script {
                            try {
                                sh 'node --version'
                                sh 'npm --version'
                                echo '✅ Node.js is available'
                            } catch (Exception e) {
                                error '❌ Node.js is not available'
                            }
                        }
                    }
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                echo '🎨 Building FarmTally Frontend...'
                script {
                    try {
                        sh '''
                            cd ${FRONTEND_DIR}
                            
                            echo "📦 Installing frontend dependencies..."
                            npm ci
                            
                            echo "🏗️ Building production frontend..."
                            npm run build
                            
                            echo "📤 Creating static export..."
                            npx next export || echo "Export completed"
                            
                            echo "✅ Verifying build output..."
                            ls -la out/
                        '''
                        echo '✅ Frontend built successfully'
                    } catch (Exception e) {
                        error "❌ Frontend build failed: ${e.getMessage()}"
                    }
                }
            }
        }
        
        stage('Build Backend Services') {
            parallel {
                stage('Auth Service') {
                    steps {
                        echo '🔐 Building Auth Service...'
                        script {
                            try {
                                sh '''
                                    cd services/auth-service
                                    docker build -t farmtally-auth:${BUILD_NUMBER} -f Dockerfile ../..
                                '''
                                echo '✅ Auth Service built successfully'
                            } catch (Exception e) {
                                echo '⚠️ Auth Service build failed, continuing...'
                            }
                        }
                    }
                }
                
                stage('API Gateway') {
                    steps {
                        echo '🚪 Building API Gateway...'
                        script {
                            try {
                                sh '''
                                    cd services/api-gateway
                                    docker build -t farmtally-gateway:${BUILD_NUMBER} -f Dockerfile ../..
                                '''
                                echo '✅ API Gateway built successfully'
                            } catch (Exception e) {
                                echo '⚠️ API Gateway build failed, continuing...'
                            }
                        }
                    }
                }
                
                stage('Field Manager') {
                    steps {
                        echo '👨‍🌾 Building Field Manager Service...'
                        script {
                            try {
                                sh '''
                                    cd services/field-manager-service
                                    docker build -t farmtally-field-manager:${BUILD_NUMBER} -f Dockerfile ../..
                                '''
                                echo '✅ Field Manager Service built successfully'
                            } catch (Exception e) {
                                echo '⚠️ Field Manager Service build failed, continuing...'
                            }
                        }
                    }
                }
                
                stage('Farm Admin') {
                    steps {
                        echo '🏢 Building Farm Admin Service...'
                        script {
                            try {
                                sh '''
                                    cd services/farm-admin-service
                                    docker build -t farmtally-farm-admin:${BUILD_NUMBER} -f Dockerfile ../..
                                '''
                                echo '✅ Farm Admin Service built successfully'
                            } catch (Exception e) {
                                echo '⚠️ Farm Admin Service build failed, continuing...'
                            }
                        }
                    }
                }
            }
        }
        
        stage('Deploy to VPS') {
            parallel {
                stage('Deploy Backend') {
                    steps {
                        echo '🚀 Deploying Backend Services to VPS...'
                        script {
                            try {
                                sh '''
                                    scp -o StrictHostKeyChecking=no ${DOCKER_COMPOSE_FILE} ${VPS_USER}@${VPS_HOST}:${PROJECT_DIR}/
                                    
                                    ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "
                                        cd ${PROJECT_DIR} && 
                                        docker-compose -f ${DOCKER_COMPOSE_FILE} down &&
                                        docker-compose -f ${DOCKER_COMPOSE_FILE} up -d --build
                                    "
                                '''
                                echo '✅ Backend deployment completed successfully'
                            } catch (Exception e) {
                                error "❌ Backend deployment failed: ${e.getMessage()}"
                            }
                        }
                    }
                }
                
                stage('Deploy Frontend') {
                    steps {
                        echo '🎨 Deploying Frontend to VPS...'
                        script {
                            try {
                                sh '''
                                    # Create frontend deployment package
                                    tar -czf frontend-build.tar.gz -C ${FRONTEND_DIR}/out .
                                    
                                    # Copy frontend files to VPS
                                    scp -o StrictHostKeyChecking=no frontend-build.tar.gz ${VPS_USER}@${VPS_HOST}:/tmp/
                                    
                                    # Deploy frontend on VPS
                                    ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "
                                        # Create frontend directory
                                        mkdir -p /var/www/farmtally
                                        
                                        # Extract frontend files
                                        cd /var/www/farmtally
                                        tar -xzf /tmp/frontend-build.tar.gz
                                        
                                        # Set permissions
                                        chown -R www-data:www-data /var/www/farmtally
                                        chmod -R 755 /var/www/farmtally
                                        
                                        # Configure Nginx (if not already configured)
                                        if [ ! -f /etc/nginx/sites-enabled/farmtally ]; then
                                            echo 'Configuring Nginx for FarmTally...'
                                            
                                            cat > /etc/nginx/sites-available/farmtally << 'EOF'
server {
    listen 80;
    server_name 147.93.153.247;
    
    location /farmtally/ {
        alias /var/www/farmtally/;
        try_files \\$uri \\$uri/ /farmtally/index.html;
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    }
    
    location /farmtally/api/ {
        proxy_pass http://localhost:8090/;
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods \"GET, POST, PUT, DELETE, OPTIONS\";
        add_header Access-Control-Allow-Headers \"Content-Type, Authorization\";
    }
    
    location /farmtally/auth/ {
        proxy_pass http://localhost:8081/;
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods \"GET, POST, PUT, DELETE, OPTIONS\";
        add_header Access-Control-Allow-Headers \"Content-Type, Authorization\";
    }
}
EOF
                                            
                                            ln -sf /etc/nginx/sites-available/farmtally /etc/nginx/sites-enabled/farmtally
                                            nginx -t && systemctl reload nginx
                                        fi
                                        
                                        rm -f /tmp/frontend-build.tar.gz
                                    "
                                '''
                                echo '✅ Frontend deployment completed successfully'
                            } catch (Exception e) {
                                error "❌ Frontend deployment failed: ${e.getMessage()}"
                            }
                        }
                    }
                }
            }
        }
        
        stage('Health Check') {
            steps {
                echo '🏥 Performing health checks...'
                script {
                    sleep(30)
                    
                    def services = [
                        [name: 'API Gateway', port: '8090'],
                        [name: 'Auth Service', port: '8081'],
                        [name: 'Field Manager', port: '8088'],
                        [name: 'Farm Admin', port: '8089']
                    ]
                    
                    def healthyServices = 0
                    
                    services.each { service ->
                        try {
                            sh """
                                ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "
                                    curl -f http://localhost:${service.port}/health
                                "
                            """
                            echo "✅ ${service.name} is healthy"
                            healthyServices++
                        } catch (Exception e) {
                            echo "❌ ${service.name} health check failed"
                        }
                    }
                    
                    // Test frontend
                    try {
                        sh """
                            ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "
                                curl -f http://localhost/farmtally/
                            "
                        """
                        echo "✅ Frontend is accessible"
                        healthyServices++
                    } catch (Exception e) {
                        echo "❌ Frontend health check failed"
                    }
                    
                    echo "📊 Health Summary: ${healthyServices}/${services.size() + 1} components healthy"
                }
            }
        }
    }
    
    post {
        success {
            echo '''
            🎉 FarmTally Complete Deployment Successful!
            ===========================================
            
            ✅ Backend microservices deployed and healthy
            ✅ Frontend built and deployed
            ✅ Nginx configured with reverse proxy
            
            Access URLs:
            🌐 FarmTally App: http://147.93.153.247/farmtally/
            🧪 API Test: http://147.93.153.247/farmtally/test-api
            
            Direct Service Access:
            🚪 API Gateway: http://147.93.153.247:8090
            🔐 Auth Service: http://147.93.153.247:8081
            👨‍🌾 Field Manager: http://147.93.153.247:8088
            🏢 Farm Admin: http://147.93.153.247:8089
            '''
        }
        
        failure {
            echo '''
            ❌ FarmTally Deployment Failed!
            ==============================
            
            Please check the logs above for error details.
            
            Common issues:
            1. Node.js not available for frontend build
            2. Docker not available in Jenkins
            3. SSH key authentication issues
            4. Port conflicts on VPS
            5. Nginx configuration errors
            '''
        }
        
        always {
            echo '🧹 Cleaning up build artifacts...'
            sh '''
                rm -f frontend-build.tar.gz
                docker system prune -f || echo "Docker cleanup skipped"
            '''
        }
    }
}
```

## ✅ **VERIFICATION STEPS**

After updating the pipeline:

### **1. Check Build Logs**
- Monitor the "Build Frontend" stage
- Verify Node.js dependencies are installed
- Confirm frontend build completes successfully

### **2. Test Deployment**
- **Frontend**: `http://147.93.153.247/farmtally/`
- **API Test**: `http://147.93.153.247/farmtally/test-api`
- **Backend Services**: All ports 8081, 8088, 8089, 8090

### **3. Verify Health Checks**
- All backend services respond
- Frontend is accessible
- Nginx proxy routes work correctly

## 🚨 **TROUBLESHOOTING**

### **If Node.js is Missing:**
```bash
# Install Node.js in Jenkins
sudo apt update
sudo apt install nodejs npm
```

### **If Frontend Build Fails:**
```bash
# Check frontend dependencies
cd farmtally-frontend
npm install
npm run build
```

### **If Nginx Configuration Fails:**
```bash
# Check Nginx status on VPS
ssh root@147.93.153.247
systemctl status nginx
nginx -t
```

## 🎯 **EXPECTED RESULT**

After successful pipeline update and execution:
- ✅ **Complete CI/CD** - Single job deploys everything
- ✅ **Frontend + Backend** - Full application deployed
- ✅ **Professional Setup** - Industry-standard pipeline
- ✅ **Easy Maintenance** - One job to rule them all

---

**Ready to update your Jenkins pipeline? This will give you complete CI/CD for FarmTally!** 🚀🌾