#!/usr/bin/env groovy

/**
 * Jenkins Credentials Validation Script
 * 
 * This script validates that all required credentials for FarmTally deployment
 * are properly configured in Jenkins before running the build pipeline.
 */

def requiredCredentials = [
    // Backend credentials
    'farmtally-database-url': 'PostgreSQL database connection URL',
    'farmtally-jwt-secret': 'JWT signing secret for authentication',
    'farmtally-cors-origins': 'Allowed CORS origins for API access',
    
    // SMTP credentials
    'farmtally-smtp-host': 'SMTP server hostname',
    'farmtally-smtp-user': 'SMTP authentication username', 
    'farmtally-smtp-password': 'SMTP authentication password',
    
    // Frontend credentials
    'farmtally-api-url': 'Production backend API URL',
    'farmtally-supabase-url': 'Supabase project URL',
    'farmtally-supabase-anon-key': 'Supabase anonymous access key',
    
    // Additional credentials
    'farmtally-frontend-url': 'Production frontend URL for email links'
]

def optionalCredentials = [
    'farmtally-redis-url': 'Redis connection URL for caching'
]

/**
 * Validates that a credential exists and is accessible
 */
def validateCredential(credentialId, description) {
    try {
        withCredentials([string(credentialsId: credentialId, variable: 'CRED_VALUE')]) {
            if (env.CRED_VALUE == null || env.CRED_VALUE.trim().isEmpty()) {
                return [success: false, error: "Credential '${credentialId}' is empty"]
            }
            return [success: true, length: env.CRED_VALUE.length()]
        }
    } catch (Exception e) {
        return [success: false, error: "Credential '${credentialId}' not found or inaccessible: ${e.message}"]
    }
}

/**
 * Main validation function
 */
def validateAllCredentials() {
    echo "🔐 Validating Jenkins credentials for FarmTally deployment..."
    
    def validationResults = [:]
    def hasErrors = false
    
    // Validate required credentials
    echo "\n📋 Checking required credentials:"
    requiredCredentials.each { credentialId, description ->
        def result = validateCredential(credentialId, description)
        validationResults[credentialId] = result
        
        if (result.success) {
            echo "✅ ${credentialId}: ${description} (${result.length} characters)"
        } else {
            echo "❌ ${credentialId}: ${result.error}"
            hasErrors = true
        }
    }
    
    // Validate optional credentials
    echo "\n📋 Checking optional credentials:"
    optionalCredentials.each { credentialId, description ->
        def result = validateCredential(credentialId, description)
        validationResults[credentialId] = result
        
        if (result.success) {
            echo "✅ ${credentialId}: ${description} (${result.length} characters)"
        } else {
            echo "⚠️  ${credentialId}: ${result.error} (optional)"
        }
    }
    
    // Summary
    def totalRequired = requiredCredentials.size()
    def validRequired = requiredCredentials.count { credentialId, description ->
        validationResults[credentialId]?.success == true
    }
    
    echo "\n📊 Validation Summary:"
    echo "   Required credentials: ${validRequired}/${totalRequired}"
    echo "   Optional credentials: ${optionalCredentials.count { credentialId, description -> validationResults[credentialId]?.success == true }}/${optionalCredentials.size()}"
    
    if (hasErrors) {
        echo "\n❌ Credential validation failed!"
        echo "   Please ensure all required credentials are configured in Jenkins."
        echo "   See scripts/jenkins-credentials-setup.md for setup instructions."
        error("Missing or invalid Jenkins credentials")
    } else {
        echo "\n✅ All required credentials validated successfully!"
    }
    
    return validationResults
}

/**
 * Generate environment validation report
 */
def generateValidationReport(validationResults) {
    def report = [
        timestamp: new Date().format("yyyy-MM-dd'T'HH:mm:ss'Z'"),
        buildNumber: env.BUILD_NUMBER ?: 'unknown',
        gitCommit: env.GIT_COMMIT ?: 'unknown',
        credentials: [:]
    ]
    
    validationResults.each { credentialId, result ->
        report.credentials[credentialId] = [
            valid: result.success,
            length: result.length ?: 0,
            error: result.error ?: null
        ]
    }
    
    writeJSON file: 'credential-validation-report.json', json: report
    echo "📝 Credential validation report saved to credential-validation-report.json"
}

// Export functions for use in Jenkinsfile
return this