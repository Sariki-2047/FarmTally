/**
 * Jenkins Pipeline for Manual Health Check Execution
 * 
 * This pipeline can be used to manually trigger comprehensive health checks
 * against the deployed FarmTally application without running a full deployment.
 * 
 * Usage:
 * 1. Create a new Jenkins Pipeline job
 * 2. Use this script as the pipeline definition
 * 3. Configure parameters as needed
 * 4. Run manually or schedule as needed
 */

pipeline {
    agent any
    
    parameters {
        string(
            name: 'API_URL',
            defaultValue: 'http://147.93.153.247:3001',
            description: 'Base URL of the FarmTally API to test'
        )
        choice(
            name: 'HEALTH_CHECK_MODE',
            choices: ['comprehensive', 'basic', 'authenticated-only'],
            description: 'Type of health check to perform'
        )
        string(
            name: 'TIMEOUT',
            defaultValue: '30000',
            description: 'Request timeout in milliseconds'
        )
        string(
            name: 'RETRIES',
            defaultValue: '3',
            description: 'Number of retries for failed requests'
        )
        booleanParam(
            name: 'VERBOSE_OUTPUT',
            defaultValue: true,
            description: 'Enable verbose logging'
        )
        booleanParam(
            name: 'SEND_NOTIFICATIONS',
            defaultValue: false,
            description: 'Send email notifications with results'
        )
    }
    
    environment {
        HEALTH_CHECK_TIMESTAMP = "${new Date().format('yyyy-MM-dd_HH-mm-ss')}"
    }
    
    stages {
        stage('Prepare Health Check') {
            steps {
                echo '🏥 Preparing health check execution...'
                script {
                    echo """
                    Health Check Configuration:
                    - API URL: ${params.API_URL}
                    - Mode: ${params.HEALTH_CHECK_MODE}
                    - Timeout: ${params.TIMEOUT}ms
                    - Retries: ${params.RETRIES}
                    - Verbose: ${params.VERBOSE_OUTPUT}
                    - Notifications: ${params.SEND_NOTIFICATIONS}
                    """
                    
                    // Validate API URL format
                    if (!params.API_URL.startsWith('http')) {
                        error('❌ Invalid API URL format. Must start with http:// or https://')
                    }
                    
                    // Validate numeric parameters
                    try {
                        Integer.parseInt(params.TIMEOUT)
                        Integer.parseInt(params.RETRIES)
                    } catch (NumberFormatException e) {
                        error('❌ Invalid numeric parameter. Timeout and Retries must be integers.')
                    }
                }
            }
        }
        
        stage('Execute Health Checks') {
            steps {
                echo '🔍 Executing comprehensive health checks...'
                withCredentials([
                    string(credentialsId: 'farmtally-jwt-secret', variable: 'JWT_SECRET')
                ]) {
                    script {
                        try {
                            // Build health check command based on mode
                            def healthCheckArgs = []
                            healthCheckArgs.add("--url ${params.API_URL}")
                            healthCheckArgs.add("--timeout ${params.TIMEOUT}")
                            healthCheckArgs.add("--retries ${params.RETRIES}")
                            
                            if (params.VERBOSE_OUTPUT) {
                                healthCheckArgs.add("--verbose")
                            }
                            
                            healthCheckArgs.add("--json")
                            
                            def healthCheckCommand = "node scripts/health-check.js ${healthCheckArgs.join(' ')}"
                            
                            echo "🚀 Executing: ${healthCheckCommand}"
                            
                            // Execute health check
                            def healthCheckResult = sh(
                                script: """
                                    export JWT_SECRET="${JWT_SECRET}"
                                    ${healthCheckCommand} > health-check-${env.HEALTH_CHECK_TIMESTAMP}.json
                                """,
                                returnStatus: true
                            )
                            
                            // Process results
                            def resultsFile = "health-check-${env.HEALTH_CHECK_TIMESTAMP}.json"
                            
                            if (fileExists(resultsFile)) {
                                // Archive results
                                archiveArtifacts artifacts: resultsFile, fingerprint: true
                                
                                // Parse and display results
                                def healthResults = readJSON file: resultsFile
                                
                                echo """
                                📊 Health Check Results Summary:
                                   Timestamp: ${healthResults.timestamp}
                                   API URL: ${healthResults.baseUrl}
                                   Total Checks: ${healthResults.summary.total}
                                   Passed: ${healthResults.summary.passed}
                                   Failed: ${healthResults.summary.failed}
                                   Duration: ${healthResults.summary.duration}ms
                                   Success Rate: ${((healthResults.summary.passed / healthResults.summary.total) * 100).round(1)}%
                                """
                                
                                // Log individual check results
                                echo "\n📋 Individual Check Results:"
                                healthResults.checks.each { check ->
                                    def status = check.status == 'PASSED' ? '✅' : check.status == 'FAILED' ? '❌' : '⚠️'
                                    echo "   ${status} ${check.name}: ${check.status} (${check.duration}ms)"
                                    if (check.error) {
                                        echo "      Error: ${check.error}"
                                    }
                                    if (check.responseData) {
                                        echo "      Response: ${check.responseData.toString().take(100)}..."
                                    }
                                }
                                
                                // Store results for post-processing
                                env.HEALTH_CHECK_RESULTS_FILE = resultsFile
                                env.HEALTH_CHECK_PASSED = healthResults.summary.passed.toString()
                                env.HEALTH_CHECK_FAILED = healthResults.summary.failed.toString()
                                env.HEALTH_CHECK_TOTAL = healthResults.summary.total.toString()
                                env.HEALTH_CHECK_SUCCESS_RATE = ((healthResults.summary.passed / healthResults.summary.total) * 100).round(1).toString()
                                env.HEALTH_CHECK_DURATION = healthResults.summary.duration.toString()
                                
                                // Determine overall status
                                if (healthCheckResult == 0 && healthResults.summary.failed == 0) {
                                    echo '✅ All health checks passed successfully!'
                                    env.HEALTH_CHECK_STATUS = 'SUCCESS'
                                } else {
                                    echo '❌ Some health checks failed!'
                                    env.HEALTH_CHECK_STATUS = 'FAILED'
                                    
                                    // Log failed checks
                                    def failedChecks = healthResults.checks.findAll { it.status == 'FAILED' }
                                    if (failedChecks.size() > 0) {
                                        echo "\n❌ Failed Checks Details:"
                                        failedChecks.each { check ->
                                            echo "   - ${check.name}: ${check.error ?: 'Unknown error'}"
                                        }
                                    }
                                }
                                
                            } else {
                                echo '❌ Health check results file not found!'
                                env.HEALTH_CHECK_STATUS = 'ERROR'
                                env.HEALTH_CHECK_PASSED = '0'
                                env.HEALTH_CHECK_FAILED = '0'
                                env.HEALTH_CHECK_TOTAL = '0'
                                env.HEALTH_CHECK_SUCCESS_RATE = '0'
                                env.HEALTH_CHECK_DURATION = '0'
                            }
                            
                        } catch (Exception e) {
                            echo "❌ Health check execution failed: ${e.getMessage()}"
                            env.HEALTH_CHECK_STATUS = 'ERROR'
                            env.HEALTH_CHECK_ERROR = e.getMessage()
                            throw e
                        }
                    }
                }
            }
        }
        
        stage('Generate Health Report') {
            steps {
                echo '📊 Generating health check report...'
                script {
                    // Create a comprehensive health report
                    def reportContent = """
# FarmTally Health Check Report

**Execution Time:** ${new Date().format('yyyy-MM-dd HH:mm:ss UTC')}
**Build Number:** ${BUILD_NUMBER}
**API URL:** ${params.API_URL}
**Check Mode:** ${params.HEALTH_CHECK_MODE}

## Summary

- **Status:** ${env.HEALTH_CHECK_STATUS}
- **Total Checks:** ${env.HEALTH_CHECK_TOTAL}
- **Passed:** ${env.HEALTH_CHECK_PASSED}
- **Failed:** ${env.HEALTH_CHECK_FAILED}
- **Success Rate:** ${env.HEALTH_CHECK_SUCCESS_RATE}%
- **Duration:** ${env.HEALTH_CHECK_DURATION}ms

## Configuration

- **Timeout:** ${params.TIMEOUT}ms
- **Retries:** ${params.RETRIES}
- **Verbose Output:** ${params.VERBOSE_OUTPUT}

## Jenkins Information

- **Job:** ${JOB_NAME}
- **Build URL:** ${BUILD_URL}
- **Workspace:** ${WORKSPACE}

## Next Steps

${env.HEALTH_CHECK_STATUS == 'SUCCESS' ? 
    '✅ All systems are operational. No action required.' : 
    '❌ Issues detected. Review failed checks and investigate underlying causes.'}

---
*Generated by FarmTally Health Check Pipeline*
                    """
                    
                    writeFile file: "health-report-${env.HEALTH_CHECK_TIMESTAMP}.md", text: reportContent
                    archiveArtifacts artifacts: "health-report-${env.HEALTH_CHECK_TIMESTAMP}.md", fingerprint: true
                    
                    echo '📄 Health report generated and archived'
                }
            }
        }
    }
    
    post {
        success {
            script {
                if (params.SEND_NOTIFICATIONS && env.HEALTH_CHECK_STATUS == 'SUCCESS') {
                    emailext (
                        subject: "✅ FarmTally Health Check Passed - ${env.HEALTH_CHECK_TIMESTAMP}",
                        body: """
                            <h2>✅ FarmTally Health Check Successful</h2>
                            <p><strong>Execution Time:</strong> ${new Date().format('yyyy-MM-dd HH:mm:ss UTC')}</p>
                            <p><strong>API URL:</strong> ${params.API_URL}</p>
                            <p><strong>Results:</strong> ${env.HEALTH_CHECK_PASSED}/${env.HEALTH_CHECK_TOTAL} checks passed (${env.HEALTH_CHECK_SUCCESS_RATE}%)</p>
                            <p><strong>Duration:</strong> ${env.HEALTH_CHECK_DURATION}ms</p>
                            <p><strong>Status:</strong> All systems operational</p>
                            <p><strong>Jenkins:</strong> <a href="${BUILD_URL}">${BUILD_URL}</a></p>
                        """,
                        to: "admin@farmtally.in",
                        mimeType: 'text/html'
                    )
                }
            }
        }
        
        failure {
            script {
                if (params.SEND_NOTIFICATIONS) {
                    emailext (
                        subject: "❌ FarmTally Health Check Failed - ${env.HEALTH_CHECK_TIMESTAMP}",
                        body: """
                            <h2>❌ FarmTally Health Check Failed</h2>
                            <p><strong>Execution Time:</strong> ${new Date().format('yyyy-MM-dd HH:mm:ss UTC')}</p>
                            <p><strong>API URL:</strong> ${params.API_URL}</p>
                            <p><strong>Results:</strong> ${env.HEALTH_CHECK_PASSED}/${env.HEALTH_CHECK_TOTAL} checks passed (${env.HEALTH_CHECK_SUCCESS_RATE}%)</p>
                            <p><strong>Failed Checks:</strong> ${env.HEALTH_CHECK_FAILED}</p>
                            <p><strong>Duration:</strong> ${env.HEALTH_CHECK_DURATION}ms</p>
                            <p><strong>Status:</strong> ${env.HEALTH_CHECK_STATUS}</p>
                            ${env.HEALTH_CHECK_ERROR ? "<p><strong>Error:</strong> ${env.HEALTH_CHECK_ERROR}</p>" : ""}
                            <p><strong>Action Required:</strong> Investigate failed health checks and resolve underlying issues.</p>
                            <p><strong>Jenkins:</strong> <a href="${BUILD_URL}">${BUILD_URL}</a></p>
                        """,
                        to: "admin@farmtally.in",
                        mimeType: 'text/html'
                    )
                }
            }
        }
        
        always {
            script {
                // Archive all health check artifacts
                def artifactsToArchive = [
                    "health-check-${env.HEALTH_CHECK_TIMESTAMP}.json",
                    "health-report-${env.HEALTH_CHECK_TIMESTAMP}.md"
                ]
                
                artifactsToArchive.each { artifact ->
                    if (fileExists(artifact)) {
                        archiveArtifacts artifacts: artifact, fingerprint: true
                        echo "📁 Archived: ${artifact}"
                    }
                }
                
                echo """
                📊 Health Check Job Summary:
                   Timestamp: ${env.HEALTH_CHECK_TIMESTAMP}
                   Status: ${env.HEALTH_CHECK_STATUS}
                   API URL: ${params.API_URL}
                   Results: ${env.HEALTH_CHECK_PASSED}/${env.HEALTH_CHECK_TOTAL} passed
                   Duration: ${env.HEALTH_CHECK_DURATION}ms
                """
            }
            cleanWs()
        }
    }
}