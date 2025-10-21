/**
 * Jenkins Pipeline Monitoring Integration
 * Groovy functions to integrate pipeline monitoring into Jenkinsfile
 */

def startStageMonitoring(stageName) {
    echo "Starting monitoring for stage: ${stageName}"
    
    // Start the monitoring
    if (isUnix()) {
        sh "chmod +x scripts/pipeline-monitor.sh"
        sh "scripts/pipeline-monitor.sh start '${stageName}'"
    } else {
        bat "scripts\\pipeline-monitor.bat start \"${stageName}\""
    }
}

def endStageMonitoring(stageName, stageStatus = 'success', errorMessage = null) {
    echo "Ending monitoring for stage: ${stageName} with status: ${stageStatus}"
    
    // End the monitoring
    try {
        if (isUnix()) {
            if (errorMessage) {
                sh "scripts/pipeline-monitor.sh end '${stageName}' '${stageStatus}' '${errorMessage}'"
            } else {
                sh "scripts/pipeline-monitor.sh end '${stageName}' '${stageStatus}'"
            }
        } else {
            if (errorMessage) {
                bat "scripts\\pipeline-monitor.bat end \"${stageName}\" \"${stageStatus}\" \"${errorMessage}\""
            } else {
                bat "scripts\\pipeline-monitor.bat end \"${stageName}\" \"${stageStatus}\""
            }
        }
    } catch (Exception e) {
        echo "Warning: Failed to end stage monitoring: ${e.getMessage()}"
    }
}

def generatePerformanceReport() {
    echo "Generating pipeline performance report"
    
    try {
        if (isUnix()) {
            sh "scripts/pipeline-monitor.sh report"
        } else {
            bat "scripts\\pipeline-monitor.bat report"
        }
    } catch (Exception e) {
        echo "Warning: Failed to generate performance report: ${e.getMessage()}"
    }
}

def checkResourceUsage() {
    echo "Checking current resource usage"
    
    try {
        if (isUnix()) {
            sh "scripts/pipeline-monitor.sh resource-check"
        } else {
            bat "scripts\\pipeline-monitor.bat resource-check"
        }
    } catch (Exception e) {
        echo "Warning: Failed to check resource usage: ${e.getMessage()}"
    }
}

def cleanOldMetrics(daysToKeep = 30) {
    echo "Cleaning old pipeline metrics (keeping ${daysToKeep} days)"
    
    try {
        if (isUnix()) {
            sh "scripts/pipeline-monitor.sh clean ${daysToKeep}"
        } else {
            bat "scripts\\pipeline-monitor.bat clean ${daysToKeep}"
        }
    } catch (Exception e) {
        echo "Warning: Failed to clean old metrics: ${e.getMessage()}"
    }
}

def monitoredStage(stageName, closure) {
    /**
     * Wrapper function to automatically monitor a stage
     * Usage: monitoredStage('Build Backend') { ... stage code ... }
     */
    
    startStageMonitoring(stageName)
    
    try {
        closure()
        endStageMonitoring(stageName, 'success')
    } catch (Exception e) {
        endStageMonitoring(stageName, 'failed', e.getMessage())
        throw e
    }
}

def setupPipelineMonitoring() {
    /**
     * Initialize pipeline monitoring
     * Call this at the beginning of your pipeline
     */
    
    echo "Setting up pipeline monitoring"
    
    // Ensure monitoring scripts are executable
    if (isUnix()) {
        sh "chmod +x scripts/pipeline-monitor.sh"
        sh "chmod +x scripts/health-check.sh"
        sh "chmod +x scripts/migration-handler.sh"
    }
    
    // Clean old metrics at the start of each build
    cleanOldMetrics(30)
    
    // Check initial resource usage
    checkResourceUsage()
}

def finalizePipelineMonitoring() {
    /**
     * Finalize pipeline monitoring
     * Call this at the end of your pipeline (in post block)
     */
    
    echo "Finalizing pipeline monitoring"
    
    // Generate performance report
    generatePerformanceReport()
    
    // Archive metrics file
    try {
        archiveArtifacts artifacts: 'pipeline-metrics.json', allowEmptyArchive: true
    } catch (Exception e) {
        echo "Warning: Failed to archive metrics: ${e.getMessage()}"
    }
}

def sendPerformanceAlert(alertType, message, severity = 'warning') {
    /**
     * Send performance alert notification
     */
    
    echo "PERFORMANCE ALERT [${severity.toUpperCase()}]: ${alertType} - ${message}"
    
    // You can integrate with your notification system here
    // Examples:
    // - Send email
    // - Post to Slack
    // - Create JIRA ticket
    // - Send to monitoring system
    
    if (severity == 'critical') {
        // For critical alerts, you might want to fail the build
        // or send immediate notifications
        echo "CRITICAL ALERT: Consider immediate action required"
    }
}

// Example usage in Jenkinsfile:
/*
pipeline {
    agent any
    
    stages {
        stage('Setup') {
            steps {
                setupPipelineMonitoring()
            }
        }
        
        stage('Build Backend') {
            steps {
                monitoredStage('Build Backend') {
                    // Your build steps here
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                monitoredStage('Build Frontend') {
                    dir('farmtally-frontend') {
                        sh 'npm ci'
                        sh 'npm run build'
                    }
                }
            }
        }
    }
    
    post {
        always {
            finalizePipelineMonitoring()
        }
    }
}
*/

return this