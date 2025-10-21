// Enhanced Jenkins Rollback Job for FarmTally
// This job provides comprehensive rollback capabilities with artifact management

pipeline {
    agent any
    
    parameters {
        choice(
            name: 'ROLLBACK_TYPE',
            choices: ['PREVIOUS_ARTIFACT', 'SPECIFIC_ARTIFACT', 'BACKUP_RESTORE'],
            description: 'Type of rollback to perform'
        )
        
        string(
            name: 'ARTIFACT_NAME',
            defaultValue: '',
            description: 'Specific artifact name to rollback to (for SPECIFIC_ARTIFACT type)'
        )
        
        string(
            name: 'BACKUP_NAME',
            defaultValue: '',
            description: 'Backup name to restore (for BACKUP_RESTORE type)'
        )
        
        choice(
            name: 'TARGET_ENVIRONMENT',
            choices: ['production', 'staging', 'development'],
            description: 'Target environment for rollback'
        )
        
        booleanParam(
            name: 'SKIP_HEALTH_CHECK',
            defaultValue: false,
            description: 'Skip health check after rollback (use with caution)'
        )
        
        booleanParam(
            name: 'FORCE_ROLLBACK',
            defaultValue: false,
            description: 'Force rollback even if current deployment appears healthy'
        )
    }
    
    environment {
        // Environment-specific configurations
        PRODUCTION_HOST = credentials('farmtally-production-host')
        STAGING_HOST = credentials('farmtally-staging-host')
        DEVELOPMENT_HOST = credentials('farmtally-development-host')
        
        PRODUCTION_PATH = '/opt/farmtally'
        STAGING_PATH = '/opt/farmtally-staging'
        DEVELOPMENT_PATH = '/opt/farmtally-dev'
        
        SERVICE_NAME = 'farmtally'
        HEALTH_CHECK_URL = 'http://localhost:3000/api/health'
        
        // Notification settings
        SLACK_CHANNEL = credentials('farmtally-slack-channel')
        EMAIL_RECIPIENTS = credentials('farmtally-email-recipients')
    }
    
    stages {
        stage('Validate Rollback Request') {
            steps {
                script {
                    echo "Validating rollback request..."
                    echo "Rollback Type: ${params.ROLLBACK_TYPE}"
                    echo "Target Environment: ${params.TARGET_ENVIRONMENT}"
                    
                    // Set environment-specific variables
                    switch(params.TARGET_ENVIRONMENT) {
                        case 'production':
                            env.TARGET_HOST = env.PRODUCTION_HOST
                            env.DEPLOY_PATH = env.PRODUCTION_PATH
                            break
                        case 'staging':
                            env.TARGET_HOST = env.STAGING_HOST
                            env.DEPLOY_PATH = env.STAGING_PATH
                            break
                        case 'development':
                            env.TARGET_HOST = env.DEVELOPMENT_HOST
                            env.DEPLOY_PATH = env.DEVELOPMENT_PATH
                            break
                        default:
                            error "Invalid target environment: ${params.TARGET_ENVIRONMENT}"
                    }
                    
                    // Validate specific parameters based on rollback type
                    if (params.ROLLBACK_TYPE == 'SPECIFIC_ARTIFACT' && !params.ARTIFACT_NAME) {
                        error "Artifact name is required for SPECIFIC_ARTIFACT rollback type"
                    }
                    
                    if (params.ROLLBACK_TYPE == 'BACKUP_RESTORE' && !params.BACKUP_NAME) {
                        error "Backup name is required for BACKUP_RESTORE rollback type"
                    }
                    
                    echo "Validation completed successfully"
                    echo "Target: ${env.TARGET_HOST}:${env.DEPLOY_PATH}"
                }
            }
        }
        
        stage('Pre-Rollback Health Check') {
            when {
                not { params.FORCE_ROLLBACK }
            }
            steps {
                script {
                    echo "Performing pre-rollback health check..."
                    
                    try {
                        // Check current deployment health
                        def healthScript = load 'scripts/jenkins-artifact-integration.groovy'
                        def currentHealth = sh(
                            script: "curl -f -s ${env.HEALTH_CHECK_URL} || echo 'UNHEALTHY'",
                            returnStdout: true
                        ).trim()
                        
                        if (currentHealth != 'UNHEALTHY') {
                            echo "Current deployment appears healthy"
                            
                            // Ask for confirmation if not forced
                            timeout(time: 5, unit: 'MINUTES') {
                                input message: 'Current deployment appears healthy. Continue with rollback?',
                                      ok: 'Yes, proceed with rollback',
                                      submitterParameter: 'ROLLBACK_APPROVER'
                            }
                            
                            echo "Rollback approved by: ${env.ROLLBACK_APPROVER}"
                        } else {
                            echo "Current deployment is unhealthy, proceeding with rollback"
                        }
                    } catch (Exception e) {
                        echo "Health check failed or timed out, proceeding with rollback"
                    }
                }
            }
        }
        
        stage('Identify Rollback Target') {
            steps {
                script {
                    echo "Identifying rollback target..."
                    
                    switch(params.ROLLBACK_TYPE) {
                        case 'PREVIOUS_ARTIFACT':
                            // Find the previous artifact
                            def artifactManager = load 'scripts/jenkins-artifact-integration.groovy'
                            artifactManager.listArtifacts()
                            
                            def artifacts = sh(
                                script: "ls -1t artifacts/ | grep '^farmtally-' | head -5",
                                returnStdout: true
                            ).trim().split('\n')
                            
                            if (artifacts.size() < 2) {
                                error "No previous artifact available for rollback"
                            }
                            
                            env.ROLLBACK_ARTIFACT = artifacts[1] // Second artifact (previous one)
                            echo "Previous artifact identified: ${env.ROLLBACK_ARTIFACT}"
                            break
                            
                        case 'SPECIFIC_ARTIFACT':
                            env.ROLLBACK_ARTIFACT = params.ARTIFACT_NAME
                            
                            // Verify artifact exists
                            if (!fileExists("artifacts/${env.ROLLBACK_ARTIFACT}")) {
                                error "Specified artifact not found: ${env.ROLLBACK_ARTIFACT}"
                            }
                            
                            echo "Specific artifact selected: ${env.ROLLBACK_ARTIFACT}"
                            break
                            
                        case 'BACKUP_RESTORE':
                            env.ROLLBACK_BACKUP = params.BACKUP_NAME
                            
                            // Verify backup exists
                            if (!fileExists("deployment-backups/${env.ROLLBACK_BACKUP}")) {
                                error "Specified backup not found: ${env.ROLLBACK_BACKUP}"
                            }
                            
                            echo "Backup restore selected: ${env.ROLLBACK_BACKUP}"
                            break
                    }
                }
            }
        }
        
        stage('Create Pre-Rollback Backup') {
            steps {
                script {
                    echo "Creating pre-rollback backup..."
                    
                    def backupName = "pre-rollback-${env.BUILD_NUMBER}-${new Date().format('yyyyMMdd-HHmmss')}"
                    
                    if (isUnix()) {
                        sh """
                            ./scripts/artifact-deployer.sh create-backup \\
                                ${env.TARGET_HOST} \\
                                ${env.DEPLOY_PATH} \\
                                ${backupName}
                        """
                    } else {
                        bat """
                            powershell -ExecutionPolicy Bypass -File scripts/artifact-deployer.ps1 \\
                                create-backup \\
                                -TargetHost ${env.TARGET_HOST} \\
                                -DeployPath ${env.DEPLOY_PATH} \\
                                -BackupName ${backupName}
                        """
                    }
                    
                    env.PRE_ROLLBACK_BACKUP = backupName
                    echo "Pre-rollback backup created: ${backupName}"
                }
            }
        }
        
        stage('Execute Rollback') {
            steps {
                script {
                    echo "Executing rollback..."
                    
                    try {
                        if (params.ROLLBACK_TYPE == 'BACKUP_RESTORE') {
                            // Restore from backup
                            if (isUnix()) {
                                sh """
                                    ./scripts/artifact-deployer.sh rollback \\
                                        ${env.TARGET_HOST} \\
                                        ${env.DEPLOY_PATH} \\
                                        ${env.ROLLBACK_BACKUP} \\
                                        ${env.SERVICE_NAME} \\
                                        ${env.HEALTH_CHECK_URL}
                                """
                            } else {
                                bat """
                                    powershell -ExecutionPolicy Bypass -File scripts/artifact-deployer.ps1 rollback \\
                                        -TargetHost ${env.TARGET_HOST} \\
                                        -DeployPath ${env.DEPLOY_PATH} \\
                                        -BackupName ${env.ROLLBACK_BACKUP} \\
                                        -ServiceName ${env.SERVICE_NAME} \\
                                        -HealthUrl ${env.HEALTH_CHECK_URL}
                                """
                            }
                        } else {
                            // Deploy specific artifact
                            def artifactManager = load 'scripts/jenkins-artifact-integration.groovy'
                            artifactManager.deployArtifact(
                                env.ROLLBACK_ARTIFACT,
                                env.TARGET_HOST,
                                env.DEPLOY_PATH
                            )
                        }
                        
                        echo "Rollback execution completed"
                        
                    } catch (Exception e) {
                        echo "Rollback failed: ${e.getMessage()}"
                        
                        // Attempt to restore pre-rollback backup
                        echo "Attempting to restore pre-rollback backup..."
                        try {
                            if (isUnix()) {
                                sh """
                                    ./scripts/artifact-deployer.sh rollback \\
                                        ${env.TARGET_HOST} \\
                                        ${env.DEPLOY_PATH} \\
                                        ${env.PRE_ROLLBACK_BACKUP} \\
                                        ${env.SERVICE_NAME} \\
                                        ${env.HEALTH_CHECK_URL}
                                """
                            } else {
                                bat """
                                    powershell -ExecutionPolicy Bypass -File scripts/artifact-deployer.ps1 rollback \\
                                        -TargetHost ${env.TARGET_HOST} \\
                                        -DeployPath ${env.DEPLOY_PATH} \\
                                        -BackupName ${env.PRE_ROLLBACK_BACKUP} \\
                                        -ServiceName ${env.SERVICE_NAME} \\
                                        -HealthUrl ${env.HEALTH_CHECK_URL}
                                """
                            }
                            echo "Pre-rollback backup restored successfully"
                        } catch (Exception restoreError) {
                            echo "Failed to restore pre-rollback backup: ${restoreError.getMessage()}"
                            echo "CRITICAL: Manual intervention required!"
                        }
                        
                        throw e
                    }
                }
            }
        }
        
        stage('Post-Rollback Health Check') {
            when {
                not { params.SKIP_HEALTH_CHECK }
            }
            steps {
                script {
                    echo "Performing post-rollback health check..."
                    
                    def maxAttempts = 30
                    def attempt = 1
                    def healthCheckPassed = false
                    
                    // Wait for service to start
                    sleep(10)
                    
                    while (attempt <= maxAttempts && !healthCheckPassed) {
                        echo "Health check attempt ${attempt}/${maxAttempts}"
                        
                        try {
                            def response = sh(
                                script: "curl -f -s -w '%{http_code}' ${env.HEALTH_CHECK_URL}",
                                returnStdout: true
                            ).trim()
                            
                            if (response.endsWith('200')) {
                                echo "Health check passed"
                                healthCheckPassed = true
                            } else {
                                echo "Health check failed with response: ${response}"
                            }
                        } catch (Exception e) {
                            echo "Health check failed: ${e.getMessage()}"
                        }
                        
                        if (!healthCheckPassed) {
                            sleep(5)
                            attempt++
                        }
                    }
                    
                    if (!healthCheckPassed) {
                        error "Post-rollback health check failed after ${maxAttempts} attempts"
                    }
                    
                    echo "Post-rollback health check successful"
                }
            }
        }
        
        stage('Verify Rollback Success') {
            steps {
                script {
                    echo "Verifying rollback success..."
                    
                    // Get current deployment information
                    def currentInfo = [:]
                    
                    if (params.ROLLBACK_TYPE != 'BACKUP_RESTORE') {
                        // Verify artifact deployment
                        def manifest = readJSON file: "artifacts/${env.ROLLBACK_ARTIFACT}/manifest.json"
                        currentInfo = [
                            type: 'artifact',
                            name: env.ROLLBACK_ARTIFACT,
                            version: manifest.version,
                            commit: manifest.git.shortCommit,
                            timestamp: manifest.timestamp
                        ]
                    } else {
                        // Verify backup restoration
                        currentInfo = [
                            type: 'backup',
                            name: env.ROLLBACK_BACKUP,
                            timestamp: new Date().format("yyyy-MM-dd'T'HH:mm:ss'Z'")
                        ]
                    }
                    
                    // Update build description
                    currentBuild.description = "ROLLBACK: ${currentInfo.name} (${params.TARGET_ENVIRONMENT})"
                    
                    // Log rollback details
                    def rollbackLog = [
                        rollbackType: params.ROLLBACK_TYPE,
                        target: currentInfo,
                        environment: params.TARGET_ENVIRONMENT,
                        timestamp: new Date().format("yyyy-MM-dd'T'HH:mm:ss'Z'"),
                        buildNumber: env.BUILD_NUMBER,
                        buildUrl: env.BUILD_URL,
                        approver: env.ROLLBACK_APPROVER ?: 'automated'
                    ]
                    
                    writeJSON file: 'rollback-details.json', json: rollbackLog
                    archiveArtifacts artifacts: 'rollback-details.json', fingerprint: true
                    
                    echo "Rollback verification completed"
                    echo "Rolled back to: ${currentInfo.name}"
                }
            }
        }
    }
    
    post {
        success {
            script {
                echo "Rollback completed successfully"
                
                // Send success notifications
                def rollbackTarget = params.ROLLBACK_TYPE == 'BACKUP_RESTORE' ? env.ROLLBACK_BACKUP : env.ROLLBACK_ARTIFACT
                def message = """
                ✅ FarmTally Rollback Successful
                
                Environment: ${params.TARGET_ENVIRONMENT}
                Rollback Type: ${params.ROLLBACK_TYPE}
                Target: ${rollbackTarget}
                Build: ${env.BUILD_URL}
                Approver: ${env.ROLLBACK_APPROVER ?: 'automated'}
                
                The application has been successfully rolled back and health checks are passing.
                """.stripIndent()
                
                // Send Slack notification
                try {
                    slackSend(
                        channel: env.SLACK_CHANNEL,
                        color: 'good',
                        message: message
                    )
                } catch (Exception e) {
                    echo "Failed to send Slack notification: ${e.getMessage()}"
                }
                
                // Send email notification
                try {
                    emailext(
                        to: env.EMAIL_RECIPIENTS,
                        subject: "FarmTally Rollback Successful - ${params.TARGET_ENVIRONMENT}",
                        body: message
                    )
                } catch (Exception e) {
                    echo "Failed to send email notification: ${e.getMessage()}"
                }
            }
        }
        
        failure {
            script {
                echo "Rollback failed"
                
                // Send failure notifications
                def rollbackTarget = params.ROLLBACK_TYPE == 'BACKUP_RESTORE' ? env.ROLLBACK_BACKUP : env.ROLLBACK_ARTIFACT
                def message = """
                ❌ FarmTally Rollback Failed
                
                Environment: ${params.TARGET_ENVIRONMENT}
                Rollback Type: ${params.ROLLBACK_TYPE}
                Target: ${rollbackTarget}
                Build: ${env.BUILD_URL}
                
                The rollback operation failed. Manual intervention may be required.
                Check the build logs for detailed error information.
                
                Pre-rollback backup: ${env.PRE_ROLLBACK_BACKUP}
                """.stripIndent()
                
                // Send Slack notification
                try {
                    slackSend(
                        channel: env.SLACK_CHANNEL,
                        color: 'danger',
                        message: message
                    )
                } catch (Exception e) {
                    echo "Failed to send Slack notification: ${e.getMessage()}"
                }
                
                // Send email notification
                try {
                    emailext(
                        to: env.EMAIL_RECIPIENTS,
                        subject: "FarmTally Rollback Failed - ${params.TARGET_ENVIRONMENT}",
                        body: message
                    )
                } catch (Exception e) {
                    echo "Failed to send email notification: ${e.getMessage()}"
                }
            }
        }
        
        always {
            script {
                // Archive deployment logs
                try {
                    archiveArtifacts artifacts: 'deployment-logs/**/*', allowEmptyArchive: true
                } catch (Exception e) {
                    echo "Failed to archive deployment logs: ${e.getMessage()}"
                }
                
                // Clean up temporary files
                try {
                    sh 'rm -f /tmp/rollback-*'
                } catch (Exception e) {
                    echo "Failed to clean up temporary files: ${e.getMessage()}"
                }
            }
        }
    }
}