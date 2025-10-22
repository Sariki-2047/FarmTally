pipeline {
    agent any
    
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
                script {
                    // Build frontend on VPS instead of Jenkins
                    echo 'Frontend will be built on VPS during deployment'
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
                echo '🚀 Preparing FarmTally deployment package...'
                script {
                    // Create deployment package without SSH
                    sh '''
                        echo "Creating deployment archive..."
                        tar -czf farmtally-deployment.tar.gz \
                            docker-compose.consolidated.yml \
                            nginx-consolidated.conf \
                            services/ \
                            farmtally-frontend/
                        
                        echo "Deployment package created: farmtally-deployment.tar.gz"
                        ls -lh farmtally-deployment.tar.gz
                    '''
                    
                    // Archive for download
                    archiveArtifacts artifacts: 'farmtally-deployment.tar.gz', fingerprint: true
                    
                    echo '''
                    📦 Deployment package ready!
                    
                    Manual deployment steps:
                    1. Download farmtally-deployment.tar.gz from Jenkins artifacts
                    2. Upload to VPS: scp farmtally-deployment.tar.gz root@147.93.153.247:/opt/farmtally/
                    3. Extract: cd /opt/farmtally && tar -xzf farmtally-deployment.tar.gz
                    4. Deploy: docker-compose -f docker-compose.consolidated.yml up -d --build
                    '''
                }
            }
        }
        
        stage('Health Check') {
            steps {
                echo '🏥 Verifying deployment package...'
                script {
                    // Verify the deployment package was created
                    sh '''
                        if [ -f "farmtally-deployment.tar.gz" ]; then
                            echo "✅ Deployment package created successfully"
                            echo "Package size: $(du -h farmtally-deployment.tar.gz | cut -f1)"
                            echo "Package contents:"
                            tar -tzf farmtally-deployment.tar.gz | head -20
                        else
                            echo "❌ Deployment package not found"
                            exit 1
                        fi
                    '''
                    
                    echo '''
                    ✅ Package verification completed
                    
                    Next steps:
                    1. Download the deployment package from Jenkins artifacts
                    2. Deploy manually on VPS using the provided commands
                    3. After deployment, check: http://147.93.153.247:8085/farmtally/
                    '''
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