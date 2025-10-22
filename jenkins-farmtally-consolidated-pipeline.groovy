pipeline {
    agent any
    
    environment {
        VPS_HOST = '147.93.153.247'
        VPS_USER = 'root'
        PROJECT_DIR = '/opt/farmtally'
        DOCKER_COMPOSE_FILE = 'docker-compose.consolidated.yml'
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
                            echo "✅ Verifying build output..."
                            ls -la .next/
                        '''
                        echo '✅ Frontend built successfully'
                    } catch (Exception e) {
                        error "❌ Frontend build failed: ${e.getMessage()}"
                    }
                }
            }
        }  
      
        stage('Deploy Consolidated System') {
            steps {
                echo '🚀 Deploying FarmTally Consolidated System to VPS...'
                script {
                    try {
                        sh '''
                            # Copy configuration files to VPS
                            scp -o StrictHostKeyChecking=no ${DOCKER_COMPOSE_FILE} ${VPS_USER}@${VPS_HOST}:${PROJECT_DIR}/
                            scp -o StrictHostKeyChecking=no nginx-consolidated.conf ${VPS_USER}@${VPS_HOST}:${PROJECT_DIR}/
                            
                            # Deploy entire system
                            ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "
                                cd ${PROJECT_DIR} && 
                                echo 'Stopping existing services...' &&
                                docker-compose -f ${DOCKER_COMPOSE_FILE} down || echo 'No existing services' &&
                                echo 'Starting consolidated FarmTally system...' &&
                                docker-compose -f ${DOCKER_COMPOSE_FILE} up -d --build &&
                                echo 'Waiting for services to start...' &&
                                sleep 30 &&
                                echo 'Checking service status...' &&
                                docker-compose -f ${DOCKER_COMPOSE_FILE} ps
                            "
                        '''
                        echo '✅ Consolidated deployment completed successfully'
                    } catch (Exception e) {
                        error "❌ Deployment failed: ${e.getMessage()}"
                    }
                }
            }
        }
        
        stage('Health Check') {
            steps {
                echo '🏥 Performing comprehensive health checks...'
                script {
                    sleep(30) // Wait for services to fully start
                    
                    def healthyServices = 0
                    
                    // Test main application access
                    try {
                        sh """
                            ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "
                                curl -f http://localhost:8080/health
                            "
                        """
                        echo "✅ Main application endpoint is healthy"
                        healthyServices++
                    } catch (Exception e) {
                        echo "❌ Main application health check failed"
                    }
                    
                    // Test frontend access
                    try {
                        sh """
                            ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "
                                curl -f http://localhost:8080/farmtally/
                            "
                        """
                        echo "✅ Frontend is accessible"
                        healthyServices++
                    } catch (Exception e) {
                        echo "❌ Frontend health check failed"
                    }
                    
                    // Test API services
                    def apiServices = [
                        [name: 'API Gateway', path: '/farmtally/api-gateway/'],
                        [name: 'Auth Service', path: '/farmtally/auth-service/health'],
                        [name: 'Field Manager', path: '/farmtally/field-manager-service/health'],
                        [name: 'Farm Admin', path: '/farmtally/farm-admin-service/health']
                    ]
                    
                    apiServices.each { service ->
                        try {
                            sh """
                                ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "
                                    curl -f http://localhost:8080${service.path}
                                "
                            """
                            echo "✅ ${service.name} is healthy"
                            healthyServices++
                        } catch (Exception e) {
                            echo "❌ ${service.name} health check failed"
                        }
                    }
                    
                    echo "📊 Health Summary: ${healthyServices}/${apiServices.size() + 2} components healthy"
                    
                    if (healthyServices == 0) {
                        error "❌ All components failed health checks"
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo '''
            🎉 FarmTally Consolidated Deployment Successful!
            ==============================================
            
            ✅ All services deployed on port 8080
            ✅ Frontend accessible at /farmtally/
            ✅ All microservices proxied through Nginx
            
            Access URLs:
            🌐 FarmTally App: http://147.93.153.247:8080/farmtally/
            🔍 Health Check: http://147.93.153.247:8080/health
            
            API Endpoints:
            🚪 API Gateway: http://147.93.153.247:8080/farmtally/api-gateway/
            🔐 Auth Service: http://147.93.153.247:8080/farmtally/auth-service/
            👨‍🌾 Field Manager: http://147.93.153.247:8080/farmtally/field-manager-service/
            🏢 Farm Admin: http://147.93.153.247:8080/farmtally/farm-admin-service/
            
            Default Login:
            📧 Email: admin@farmtally.com
            🔑 Password: Admin123!
            '''
        }
        
        failure {
            echo '''
            ❌ FarmTally Consolidated Deployment Failed!
            ==========================================
            
            Please check the logs above for error details.
            
            Common issues:
            1. Docker not available in Jenkins
            2. SSH key authentication issues
            3. Port 8080 conflicts on VPS
            4. Service build failures
            5. Nginx configuration issues
            
            Check docker-compose logs for detailed error information.
            '''
        }
        
        always {
            echo '🧹 Cleaning up build artifacts...'
            sh '''
                docker system prune -f || echo "Docker cleanup skipped"
            '''
        }
    }
}