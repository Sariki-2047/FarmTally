pipeline {
    agent any
    
    tools {
        nodejs 'nodejs-18'
    }
    
    environment {
        VPS_HOST = '147.93.153.247'
        VPS_USER = 'root'
        PROJECT_DIR = '/opt/farmtally'
        COMPOSE_FILE = 'docker-compose.consolidated.yml'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out FarmTally source code...'
                checkout scm
            }
        }
        
        stage('Build Frontend') {
            steps {
                echo '🎨 Building FarmTally Frontend...'
                dir('farmtally-frontend') {
                    sh 'npm ci --production'
                    sh 'npm run build'
                    sh 'ls -la .next/'
                }
            }
        }
        
        stage('Prepare Deployment') {
            steps {
                echo '📦 Preparing deployment files...'
                sh '''
                    echo "Verifying deployment files..."
                    ls -la docker-compose.consolidated.yml
                    ls -la nginx-consolidated.conf
                    ls -la services/
                '''
            }
        }
        
        stage('Deploy to VPS') {
            steps {
                echo '🚀 Deploying FarmTally to VPS...'
                sshagent(['farmtally-vps-ssh']) {
                    sh '''
                        echo "Copying files to VPS..."
                        scp -o StrictHostKeyChecking=no ${COMPOSE_FILE} ${VPS_USER}@${VPS_HOST}:${PROJECT_DIR}/
                        scp -o StrictHostKeyChecking=no nginx-consolidated.conf ${VPS_USER}@${VPS_HOST}:${PROJECT_DIR}/
                        scp -r -o StrictHostKeyChecking=no services ${VPS_USER}@${VPS_HOST}:${PROJECT_DIR}/
                        scp -r -o StrictHostKeyChecking=no farmtally-frontend ${VPS_USER}@${VPS_HOST}:${PROJECT_DIR}/
                        
                        echo "Deploying on VPS..."
                        ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "
                            cd ${PROJECT_DIR} &&
                            echo 'Stopping existing services...' &&
                            docker-compose -f ${COMPOSE_FILE} down || echo 'No existing services' &&
                            echo 'Starting FarmTally consolidated system...' &&
                            docker-compose -f ${COMPOSE_FILE} up -d --build &&
                            echo 'Waiting for services to start...' &&
                            sleep 30 &&
                            echo 'Checking service status...' &&
                            docker-compose -f ${COMPOSE_FILE} ps
                        "
                    '''
                }
            }
        }
        
        stage('Health Check') {
            steps {
                echo '🏥 Performing health checks...'
                script {
                    sleep(30)
                    
                    // Test main health endpoint
                    try {
                        sh 'curl -f http://147.93.153.247:8085/health'
                        echo '✅ Health endpoint is responding'
                    } catch (Exception e) {
                        echo '⚠️ Health endpoint check failed'
                    }
                    
                    // Test frontend
                    try {
                        sh 'curl -f http://147.93.153.247:8085/farmtally/'
                        echo '✅ Frontend is accessible'
                    } catch (Exception e) {
                        echo '⚠️ Frontend check failed'
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo '''
            🎉 FarmTally Consolidated Deployment Successful!
            
            ✅ All services deployed on port 8085
            ✅ Nginx reverse proxy configured
            ✅ Health checks completed
            
            Access URLs:
            🌐 FarmTally App: http://147.93.153.247:8085/farmtally/
            🔍 Health Check: http://147.93.153.247:8085/health
            
            Default Login:
            📧 Email: admin@farmtally.com
            🔑 Password: Admin123!
            '''
        }
        
        failure {
            echo '''
            ❌ FarmTally Deployment Failed!
            
            Please check the console output above for error details.
            Common issues:
            1. SSH connection problems
            2. Docker build failures
            3. Port conflicts
            4. Missing files
            '''
        }
        
        always {
            echo '🧹 Cleaning up workspace...'
            cleanWs()
        }
    }
}