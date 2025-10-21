// Jenkins Rollback Job Configuration for FarmTally
// This creates a parameterized job for rolling back deployments

pipelineJob('FarmTally-Rollback') {
    description('Rollback FarmTally deployment to a previous build version')
    
    parameters {
        stringParam('ROLLBACK_BUILD_NUMBER', '', 'Build number to rollback to (required)')
        choiceParam('CONFIRMATION', ['NO', 'YES'], 'Confirm rollback execution (must select YES)')
        booleanParam('SKIP_HEALTH_CHECK', false, 'Skip post-rollback health verification')
        booleanParam('BACKUP_CURRENT', true, 'Create backup of current state before rollback')
    }
    
    definition {
        cps {
            script('''
pipeline {
    agent any
    
    tools {
        nodejs 'Node 18'
    }
    
    environment {
        VPS_HOST = '147.93.153.247'
        VPS_USER = 'root'
        APP_DIR = '/opt/farmtally'
        BACKUP_DIR = '/opt/farmtally/backups'
    }
    
    stages {
        stage('Validation') {
            steps {
                script {
                    // Validate parameters
                    if (!params.ROLLBACK_BUILD_NUMBER) {
                        error('❌ ROLLBACK_BUILD_NUMBER parameter is required')
                    }
                    
                    if (params.CONFIRMATION != 'YES') {
                        error('❌ Rollback confirmation required - set CONFIRMATION to YES')
                    }
                    
                    // Validate build number format
                    if (!params.ROLLBACK_BUILD_NUMBER.matches(/^\\d+$/)) {
                        error('❌ ROLLBACK_BUILD_NUMBER must be a valid build number')
                    }
                    
                    echo "✅ Rollback validation passed"
                    echo "🎯 Target build: #${params.ROLLBACK_BUILD_NUMBER}"
                    echo "📦 Backup current state: ${params.BACKUP_CURRENT}"
                    echo "🏥 Skip health check: ${params.SKIP_HEALTH_CHECK}"
                }
            }
        }
        
        stage('Pre-Rollback Verification') {
            steps {
                echo '🔍 Verifying rollback prerequisites...'
                sshagent(['vps-ssh-key']) {
                    script {
                        // Check if backup exists
                        def backupCheck = sh(
                            script: """
                                ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} '
                                    if [ -d "${BACKUP_DIR}/build-${params.ROLLBACK_BUILD_NUMBER}" ]; then
                                        echo "Backup found"
                                        ls -la "${BACKUP_DIR}/build-${params.ROLLBACK_BUILD_NUMBER}/"
                                        exit 0
                                    else
                                        echo "Backup not found: ${BACKUP_DIR}/build-${params.ROLLBACK_BUILD_NUMBER}"
                                        exit 1
                                    fi
                                '
                            """,
                            returnStatus: true
                        )
                        
                        if (backupCheck != 0) {
                            error("❌ Backup for build #${params.ROLLBACK_BUILD_NUMBER} not found")
                        }
                        
                        echo "✅ Backup verification passed"
                        
                        // Get current application status
                        sh """
                            ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} '
                                echo "Current PM2 status:"
                                pm2 status || true
                                echo "Current application health:"
                                curl -f http://localhost:3000/api/health || echo "Health check failed"
                            '
                        """
                    }
                }
            }
        }
        
        stage('Execute Rollback') {
            steps {
                echo "🔄 Executing rollback to build #${params.ROLLBACK_BUILD_NUMBER}..."
                sshagent(['vps-ssh-key']) {
                    script {
                        // Set environment variables for rollback script
                        env.ROLLBACK_BUILD_NUMBER = params.ROLLBACK_BUILD_NUMBER
                        
                        // Copy rollback script to VPS
                        sh """
                            scp scripts/rollback-deployment.sh ${VPS_USER}@${VPS_HOST}:/tmp/
                            ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} 'chmod +x /tmp/rollback-deployment.sh'
                        """
                        
                        // Execute rollback
                        def rollbackResult = sh(
                            script: """
                                ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} '
                                    export ROLLBACK_BUILD_NUMBER="${params.ROLLBACK_BUILD_NUMBER}"
                                    export VPS_HOST="${VPS_HOST}"
                                    export VPS_USER="${VPS_USER}"
                                    export APP_DIR="${APP_DIR}"
                                    export BUILD_NUMBER="${BUILD_NUMBER}"
                                    
                                    /tmp/rollback-deployment.sh rollback
                                '
                            """,
                            returnStatus: true
                        )
                        
                        if (rollbackResult != 0) {
                            error("❌ Rollback execution failed")
                        }
                        
                        echo "✅ Rollback execution completed"
                    }
                }
            }
        }
        
        stage('Post-Rollback Verification') {
            when {
                not { params.SKIP_HEALTH_CHECK }
            }
            steps {
                echo '🏥 Performing post-rollback verification...'
                script {
                    // Wait for services to stabilize
                    sleep(15)
                    
                    // Health check with retries
                    def healthCheckPassed = false
                    def maxAttempts = 5
                    
                    for (int attempt = 1; attempt <= maxAttempts; attempt++) {
                        echo "🔍 Health check attempt ${attempt}/${maxAttempts}..."
                        
                        def healthResult = sh(
                            script: "curl -f -s http://${VPS_HOST}:3000/api/health",
                            returnStatus: true
                        )
                        
                        if (healthResult == 0) {
                            echo "✅ Health check passed on attempt ${attempt}"
                            healthCheckPassed = true
                            break
                        } else {
                            echo "⚠️ Health check failed on attempt ${attempt}"
                            if (attempt < maxAttempts) {
                                sleep(10)
                            }
                        }
                    }
                    
                    if (!healthCheckPassed) {
                        error("❌ Post-rollback health verification failed after ${maxAttempts} attempts")
                    }
                    
                    // Additional service verification
                    sshagent(['vps-ssh-key']) {
                        sh """
                            ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} '
                                echo "Final PM2 status:"
                                pm2 status
                                
                                echo "Process verification:"
                                if pm2 list | grep -q "farmtally-backend.*online"; then
                                    echo "✅ Backend process is running"
                                else
                                    echo "❌ Backend process is not running properly"
                                    pm2 logs farmtally-backend --lines 10
                                    exit 1
                                fi
                            '
                        """
                    }
                    
                    echo "✅ Post-rollback verification completed successfully"
                }
            }
        }
        
        stage('Cleanup and Reporting') {
            steps {
                echo '📊 Generating rollback report and cleanup...'
                sshagent(['vps-ssh-key']) {
                    script {
                        // Retrieve rollback logs and reports
                        sh """
                            ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} '
                                # Copy rollback logs
                                if [ -f "/tmp/rollback.log" ]; then
                                    cp /tmp/rollback.log ${APP_DIR}/logs/rollback-${BUILD_NUMBER}.log
                                fi
                                
                                # Copy rollback reports
                                if ls /tmp/rollback_report_*.json 1> /dev/null 2>&1; then
                                    cp /tmp/rollback_report_*.json ${APP_DIR}/logs/
                                fi
                                
                                # Cleanup temporary files
                                rm -f /tmp/rollback-deployment.sh
                                rm -f /tmp/rollback.log
                                rm -f /tmp/rollback_report_*.json
                                
                                echo "Cleanup completed"
                            '
                        """
                        
                        // Archive rollback artifacts
                        def rollbackManifest = [
                            rollback_execution: [
                                timestamp: new Date().format("yyyy-MM-dd'T'HH:mm:ss'Z'"),
                                jenkins_build: env.BUILD_NUMBER,
                                target_build: params.ROLLBACK_BUILD_NUMBER,
                                initiated_by: env.BUILD_USER ?: 'unknown',
                                status: 'completed'
                            ],
                            parameters: [
                                rollback_build_number: params.ROLLBACK_BUILD_NUMBER,
                                confirmation: params.CONFIRMATION,
                                skip_health_check: params.SKIP_HEALTH_CHECK,
                                backup_current: params.BACKUP_CURRENT
                            ]
                        ]
                        
                        writeJSON file: 'rollback-manifest.json', json: rollbackManifest
                        archiveArtifacts artifacts: 'rollback-manifest.json', fingerprint: true
                        
                        echo "📝 Rollback manifest created and archived"
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo "✅ Rollback completed successfully!"
            emailext (
                subject: "✅ FarmTally Rollback Successful - Build #${BUILD_NUMBER}",
                body: """
                    <h2>🔄 FarmTally Rollback Completed Successfully!</h2>
                    <p><strong>Rollback Job:</strong> #${BUILD_NUMBER}</p>
                    <p><strong>Target Build:</strong> #${params.ROLLBACK_BUILD_NUMBER}</p>
                    <p><strong>Initiated By:</strong> ${BUILD_USER ?: 'Unknown'}</p>
                    <p><strong>Timestamp:</strong> ${new Date()}</p>
                    <p><strong>Application URL:</strong> <a href="http://147.93.153.247:3000">http://147.93.153.247:3000</a></p>
                    <p><strong>Jenkins Job:</strong> <a href="${BUILD_URL}">${BUILD_URL}</a></p>
                    <hr>
                    <p><em>The application has been successfully rolled back to build #${params.ROLLBACK_BUILD_NUMBER}</em></p>
                """,
                to: "admin@farmtally.in",
                mimeType: 'text/html'
            )
        }
        
        failure {
            echo "❌ Rollback failed!"
            emailext (
                subject: "❌ FarmTally Rollback Failed - Build #${BUILD_NUMBER}",
                body: """
                    <h2>💥 FarmTally Rollback Failed!</h2>
                    <p><strong>Rollback Job:</strong> #${BUILD_NUMBER}</p>
                    <p><strong>Target Build:</strong> #${params.ROLLBACK_BUILD_NUMBER}</p>
                    <p><strong>Initiated By:</strong> ${BUILD_USER ?: 'Unknown'}</p>
                    <p><strong>Timestamp:</strong> ${new Date()}</p>
                    <p><strong>Jenkins Job:</strong> <a href="${BUILD_URL}">${BUILD_URL}</a></p>
                    <hr>
                    <p><strong>⚠️ URGENT:</strong> Rollback failed - manual intervention required!</p>
                    <p>Please check the Jenkins logs and VPS status immediately.</p>
                """,
                to: "admin@farmtally.in",
                mimeType: 'text/html'
            )
        }
        
        always {
            echo '🧹 Final cleanup...'
            // Archive any remaining artifacts
            script {
                if (fileExists('rollback-manifest.json')) {
                    archiveArtifacts artifacts: 'rollback-manifest.json', fingerprint: true
                }
            }
            cleanWs()
        }
    }
}
            ''')
        }
    }
}