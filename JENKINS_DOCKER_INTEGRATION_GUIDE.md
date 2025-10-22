# Jenkins Docker Integration Guide

## 🐳 How to Check Docker in Jenkins

### Method 1: Jenkins Web Interface

1. **Access Jenkins Dashboard**
   - URL: http://147.93.153.247:8080
   - Login with your Jenkins credentials

2. **Check Docker Plugin**
   - Go to: `Manage Jenkins` → `Manage Plugins`
   - Click on `Installed` tab
   - Search for "Docker" plugins
   - Look for:
     - Docker Plugin
     - Docker Pipeline Plugin
     - Docker Commons Plugin

3. **Verify Docker in System Configuration**
   - Go to: `Manage Jenkins` → `Global Tool Configuration`
   - Look for "Docker" section
   - Check if Docker is configured

### Method 2: Jenkins Pipeline Test

Create a test pipeline to verify Docker availability:

```groovy
pipeline {
    agent any
    
    stages {
        stage('Check Docker') {
            steps {
                script {
                    // Check Docker version
                    sh 'docker --version'
                    
                    // Check Docker info
                    sh 'docker info'
                    
                    // List running containers
                    sh 'docker ps'
                    
                    // Check Docker Compose
                    sh 'docker-compose --version'
                }
            }
        }
    }
}
```

### Method 3: Jenkins Console Commands

1. **Access Jenkins Console**
   - Go to: `Manage Jenkins` → `Script Console`
   - Run these Groovy scripts:

```groovy
// Check if Docker is available
def proc = "docker --version".execute()
proc.waitFor()
println "Docker version: ${proc.text}"

// Check Docker info
def info = "docker info".execute()
info.waitFor()
println "Docker info: ${info.text}"
```

### Method 4: SSH to Jenkins Container

If Jenkins is running in Docker:

```bash
# SSH to your VPS
ssh root@147.93.153.247

# Access Jenkins container
docker exec -it jenkins bash

# Inside Jenkins container, check Docker
docker --version
docker ps
```

## 🔧 Docker Integration Setup

### Install Docker Plugin in Jenkins

1. **Via Web Interface:**
   - `Manage Jenkins` → `Manage Plugins`
   - Go to `Available` tab
   - Search for "Docker Pipeline"
   - Install without restart

2. **Required Plugins:**
   - Docker Plugin
   - Docker Pipeline Plugin
   - Docker Commons Plugin
   - Pipeline Plugin

### Configure Docker in Jenkins

1. **Global Tool Configuration:**
   ```
   Manage Jenkins → Global Tool Configuration → Docker
   Name: docker
   Installation root: /usr/bin/docker
   ```

2. **System Configuration:**
   ```
   Manage Jenkins → Configure System → Docker
   Docker Host URI: unix:///var/run/docker.sock
   ```

## 🚀 FarmTally Jenkins Pipeline

Here's a complete Jenkins pipeline for FarmTally microservices:

```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-registry'
        VPS_HOST = '147.93.153.247'
        VPS_USER = 'root'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/your-repo/farmtally.git'
            }
        }
        
        stage('Build Services') {
            parallel {
                stage('Auth Service') {
                    steps {
                        script {
                            docker.build("farmtally-auth:${BUILD_NUMBER}", "-f services/auth-service/Dockerfile .")
                        }
                    }
                }
                stage('API Gateway') {
                    steps {
                        script {
                            docker.build("farmtally-gateway:${BUILD_NUMBER}", "-f services/api-gateway/Dockerfile .")
                        }
                    }
                }
                stage('Field Manager') {
                    steps {
                        script {
                            docker.build("farmtally-field-manager:${BUILD_NUMBER}", "-f services/field-manager-service/Dockerfile .")
                        }
                    }
                }
                stage('Farm Admin') {
                    steps {
                        script {
                            docker.build("farmtally-farm-admin:${BUILD_NUMBER}", "-f services/farm-admin-service/Dockerfile .")
                        }
                    }
                }
            }
        }
        
        stage('Test Services') {
            steps {
                script {
                    // Run health checks
                    sh 'node test-microservices-deployment.js'
                }
            }
        }
        
        stage('Deploy to VPS') {
            steps {
                script {
                    // Deploy using Docker Compose
                    sh """
                        scp docker-compose.backend-only.yml ${VPS_USER}@${VPS_HOST}:/opt/farmtally/
                        ssh ${VPS_USER}@${VPS_HOST} 'cd /opt/farmtally && docker-compose -f docker-compose.backend-only.yml up -d'
                    """
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    // Verify deployment
                    sh """
                        ssh ${VPS_USER}@${VPS_HOST} 'curl -f http://localhost:8090/health'
                        ssh ${VPS_USER}@${VPS_HOST} 'curl -f http://localhost:8081/health'
                        ssh ${VPS_USER}@${VPS_HOST} 'curl -f http://localhost:8088/health'
                        ssh ${VPS_USER}@${VPS_HOST} 'curl -f http://localhost:8089/health'
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo 'FarmTally microservices deployed successfully!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}
```

## 🛠️ Troubleshooting Docker in Jenkins

### Common Issues:

1. **Docker not found:**
   ```bash
   # Install Docker in Jenkins container
   docker exec -u root jenkins apt-get update
   docker exec -u root jenkins apt-get install -y docker.io
   ```

2. **Permission denied:**
   ```bash
   # Add Jenkins user to docker group
   docker exec -u root jenkins usermod -aG docker jenkins
   docker restart jenkins
   ```

3. **Docker socket not accessible:**
   ```bash
   # Mount Docker socket when starting Jenkins
   docker run -v /var/run/docker.sock:/var/run/docker.sock jenkins/jenkins:lts
   ```

### Verify Docker Integration:

```bash
# Check if Jenkins can access Docker
ssh root@147.93.153.247 "docker exec jenkins docker --version"

# Check Docker socket permissions
ssh root@147.93.153.247 "ls -la /var/run/docker.sock"

# Test Docker from Jenkins
ssh root@147.93.153.247 "docker exec jenkins docker ps"
```

## 📋 Quick Docker Check Commands

Run these commands in Jenkins to verify Docker:

```bash
# Basic Docker check
docker --version && docker info

# Check running containers
docker ps -a

# Check Docker Compose
docker-compose --version

# Check available images
docker images

# Check Docker networks
docker network ls

# Check Docker volumes
docker volume ls
```

## 🎯 Next Steps

1. **Verify Docker Plugin Installation**
2. **Test Docker Commands in Jenkins**
3. **Create FarmTally Pipeline**
4. **Set up Automated Deployment**
5. **Configure Health Monitoring**

This setup will allow Jenkins to build, test, and deploy your FarmTally microservices automatically!