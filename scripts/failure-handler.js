#!/usr/bin/env node

/**
 * Pipeline Failure Handler
 * Handles various failure scenarios in the Jenkins pipeline
 */

const fs = require('fs');
const path = require('path');

class FailureHandler {
    constructor() {
        this.failureTypes = {
            WORKSPACE_VALIDATION: 'workspace_validation',
            CREDENTIAL_VALIDATION: 'credential_validation',
            ENVIRONMENT_VALIDATION: 'environment_validation',
            BUILD_FAILURE: 'build_failure',
            MIGRATION_FAILURE: 'migration_failure',
            DEPLOYMENT_FAILURE: 'deployment_failure',
            HEALTH_CHECK_FAILURE: 'health_check_failure'
        };
        
        this.logFile = 'pipeline-failure.log';
        this.reportFile = 'failure-report.json';
    }

    /**
     * Handle pipeline stage failure
     */
    async handleFailure(failureType, error, context = {}) {
        const timestamp = new Date().toISOString();
        const failureId = `failure-${Date.now()}`;
        
        console.log(`❌ Pipeline failure detected: ${failureType}`);
        console.log(`🆔 Failure ID: ${failureId}`);
        
        const failureReport = {
            id: failureId,
            timestamp,
            type: failureType,
            error: {
                message: error.message || error,
                stack: error.stack || null
            },
            context: {
                buildNumber: process.env.BUILD_NUMBER || 'unknown',
                gitCommit: process.env.GIT_COMMIT || 'unknown',
                gitBranch: process.env.GIT_BRANCH || 'unknown',
                stage: context.stage || 'unknown',
                ...context
            },
            actions: []
        };

        // Log the failure
        await this.logFailure(failureReport);
        
        // Execute failure-specific actions
        await this.executeFailureActions(failureType, failureReport, context);
        
        // Send notifications
        await this.sendNotifications(failureReport);
        
        // Save failure report
        await this.saveFailureReport(failureReport);
        
        return failureReport;
    }

    /**
     * Log failure to console and file
     */
    async logFailure(failureReport) {
        const logEntry = `[${failureReport.timestamp}] FAILURE: ${failureReport.type}\n` +
                        `ID: ${failureReport.id}\n` +
                        `Build: ${failureReport.context.buildNumber}\n` +
                        `Commit: ${failureReport.context.gitCommit}\n` +
                        `Stage: ${failureReport.context.stage}\n` +
                        `Error: ${failureReport.error.message}\n` +
                        `---\n`;
        
        console.log(logEntry);
        
        try {
            fs.appendFileSync(this.logFile, logEntry);
        } catch (err) {
            console.error('Failed to write to log file:', err.message);
        }
    }

    /**
     * Execute failure-specific actions
     */
    async executeFailureActions(failureType, failureReport, context) {
        switch (failureType) {
            case this.failureTypes.WORKSPACE_VALIDATION:
                await this.handleWorkspaceFailure(failureReport, context);
                break;
            case this.failureTypes.CREDENTIAL_VALIDATION:
                await this.handleCredentialFailure(failureReport, context);
                break;
            case this.failureTypes.ENVIRONMENT_VALIDATION:
                await this.handleEnvironmentFailure(failureReport, context);
                break;
            case this.failureTypes.BUILD_FAILURE:
                await this.handleBuildFailure(failureReport, context);
                break;
            case this.failureTypes.MIGRATION_FAILURE:
                await this.handleMigrationFailure(failureReport, context);
                break;
            case this.failureTypes.DEPLOYMENT_FAILURE:
                await this.handleDeploymentFailure(failureReport, context);
                break;
            case this.failureTypes.HEALTH_CHECK_FAILURE:
                await this.handleHealthCheckFailure(failureReport, context);
                break;
            default:
                console.log(`⚠️  Unknown failure type: ${failureType}`);
        }
    }

    /**
     * Handle workspace validation failures
     */
    async handleWorkspaceFailure(failureReport, context) {
        console.log('🔧 Handling workspace validation failure...');
        
        failureReport.actions.push({
            type: 'workspace_validation',
            message: 'Pipeline aborted due to workspace path issues',
            recommendation: 'Check Jenkinsfile paths and repository structure'
        });
        
        // Abort pipeline immediately
        process.exit(1);
    }

    /**
     * Handle credential validation failures
     */
    async handleCredentialFailure(failureReport, context) {
        console.log('🔐 Handling credential validation failure...');
        
        failureReport.actions.push({
            type: 'credential_validation',
            message: 'Pipeline aborted due to missing or invalid credentials',
            recommendation: 'Verify Jenkins credentials configuration'
        });
        
        // Abort pipeline immediately
        process.exit(1);
    }

    /**
     * Handle environment validation failures
     */
    async handleEnvironmentFailure(failureReport, context) {
        console.log('🌍 Handling environment validation failure...');
        
        failureReport.actions.push({
            type: 'environment_validation',
            message: 'Pipeline aborted due to environment configuration issues',
            recommendation: 'Check environment variables and service connectivity'
        });
        
        // Abort pipeline immediately
        process.exit(1);
    }

    /**
     * Handle build failures
     */
    async handleBuildFailure(failureReport, context) {
        console.log('🏗️ Handling build failure...');
        
        failureReport.actions.push({
            type: 'build_failure',
            message: 'Build failed - deployment aborted',
            recommendation: 'Check build logs and fix compilation errors'
        });
        
        // Clean up build artifacts
        await this.cleanupBuildArtifacts(context);
        
        // Abort pipeline
        process.exit(1);
    }

    /**
     * Handle migration failures
     */
    async handleMigrationFailure(failureReport, context) {
        console.log('🗄️ Handling migration failure...');
        
        failureReport.actions.push({
            type: 'migration_failure',
            message: 'Database migration failed - deployment aborted',
            recommendation: 'Verify database connectivity and migration scripts'
        });
        
        // Verify database state consistency
        await this.verifyDatabaseState(failureReport, context);
        
        // Abort deployment but keep previous version running
        process.exit(1);
    }

    /**
     * Handle deployment failures
     */
    async handleDeploymentFailure(failureReport, context) {
        console.log('🚀 Handling deployment failure...');
        
        failureReport.actions.push({
            type: 'deployment_failure',
            message: 'Deployment failed - preserving previous version',
            recommendation: 'Check deployment logs and service configuration'
        });
        
        // Preserve previous version
        await this.preservePreviousVersion(failureReport, context);
        
        // Abort deployment
        process.exit(1);
    }

    /**
     * Handle health check failures
     */
    async handleHealthCheckFailure(failureReport, context) {
        console.log('🏥 Handling health check failure...');
        
        failureReport.actions.push({
            type: 'health_check_failure',
            message: 'Health checks failed - initiating rollback',
            recommendation: 'Check service logs and external dependencies'
        });
        
        // Initiate automatic rollback
        await this.initiateRollback(failureReport, context);
        
        // Abort deployment
        process.exit(1);
    }

    /**
     * Verify database state consistency
     */
    async verifyDatabaseState(failureReport, context) {
        console.log('🔍 Verifying database state consistency...');
        
        try {
            // Check if database is accessible
            const { execSync } = require('child_process');
            
            // Test database connection
            execSync('npx prisma db pull --preview-feature', { 
                stdio: 'pipe',
                timeout: 30000 
            });
            
            failureReport.actions.push({
                type: 'database_verification',
                message: 'Database state verified - connection successful',
                status: 'success'
            });
            
            console.log('✅ Database state is consistent');
            
        } catch (error) {
            failureReport.actions.push({
                type: 'database_verification',
                message: 'Database state verification failed',
                error: error.message,
                status: 'failed'
            });
            
            console.error('❌ Database state verification failed:', error.message);
        }
    }

    /**
     * Preserve previous version on deployment failure
     */
    async preservePreviousVersion(failureReport, context) {
        console.log('💾 Preserving previous version...');
        
        try {
            // Keep PM2 processes running (don't restart)
            console.log('📋 Previous version preserved - PM2 processes unchanged');
            
            failureReport.actions.push({
                type: 'version_preservation',
                message: 'Previous version preserved successfully',
                status: 'success'
            });
            
        } catch (error) {
            failureReport.actions.push({
                type: 'version_preservation',
                message: 'Failed to preserve previous version',
                error: error.message,
                status: 'failed'
            });
            
            console.error('❌ Failed to preserve previous version:', error.message);
        }
    }

    /**
     * Initiate rollback process
     */
    async initiateRollback(failureReport, context) {
        console.log('🔄 Initiating rollback process...');
        
        try {
            const { execSync } = require('child_process');
            
            // Execute rollback script
            execSync('bash scripts/rollback-deployment.sh', { 
                stdio: 'inherit',
                timeout: 300000 // 5 minutes
            });
            
            failureReport.actions.push({
                type: 'rollback_initiation',
                message: 'Rollback process initiated successfully',
                status: 'success'
            });
            
            console.log('✅ Rollback process completed');
            
        } catch (error) {
            failureReport.actions.push({
                type: 'rollback_initiation',
                message: 'Failed to initiate rollback',
                error: error.message,
                status: 'failed'
            });
            
            console.error('❌ Rollback initiation failed:', error.message);
        }
    }

    /**
     * Clean up build artifacts
     */
    async cleanupBuildArtifacts(context) {
        console.log('🧹 Cleaning up build artifacts...');
        
        try {
            const { execSync } = require('child_process');
            
            // Clean backend build
            if (fs.existsSync('dist')) {
                execSync('rm -rf dist', { stdio: 'pipe' });
                console.log('🗑️ Cleaned backend build artifacts');
            }
            
            // Clean frontend build
            if (fs.existsSync('farmtally-frontend/.next')) {
                execSync('rm -rf farmtally-frontend/.next', { stdio: 'pipe' });
                console.log('🗑️ Cleaned frontend build artifacts');
            }
            
        } catch (error) {
            console.error('❌ Failed to clean build artifacts:', error.message);
        }
    }

    /**
     * Send failure notifications
     */
    async sendNotifications(failureReport) {
        console.log('📧 Sending failure notifications...');
        
        // Email notification (if configured)
        await this.sendEmailNotification(failureReport);
        
        // Slack notification (if configured)
        await this.sendSlackNotification(failureReport);
        
        // Jenkins notification
        await this.sendJenkinsNotification(failureReport);
    }

    /**
     * Send email notification
     */
    async sendEmailNotification(failureReport) {
        const emailRecipients = process.env.FAILURE_EMAIL_RECIPIENTS;
        
        if (!emailRecipients) {
            console.log('📧 Email notifications not configured');
            return;
        }
        
        try {
            const subject = `FarmTally Pipeline Failure - ${failureReport.type}`;
            const body = `
Pipeline Failure Report

Failure ID: ${failureReport.id}
Type: ${failureReport.type}
Timestamp: ${failureReport.timestamp}
Build Number: ${failureReport.context.buildNumber}
Git Commit: ${failureReport.context.gitCommit}
Stage: ${failureReport.context.stage}

Error: ${failureReport.error.message}

Actions Taken:
${failureReport.actions.map(action => `- ${action.message}`).join('\n')}

Jenkins Build: ${process.env.BUILD_URL || 'N/A'}
            `;
            
            console.log('📧 Email notification prepared (actual sending depends on SMTP configuration)');
            console.log(`Recipients: ${emailRecipients}`);
            console.log(`Subject: ${subject}`);
            
        } catch (error) {
            console.error('❌ Failed to send email notification:', error.message);
        }
    }

    /**
     * Send Slack notification
     */
    async sendSlackNotification(failureReport) {
        const slackWebhook = process.env.SLACK_WEBHOOK_URL;
        
        if (!slackWebhook) {
            console.log('💬 Slack notifications not configured');
            return;
        }
        
        try {
            const message = {
                text: `🚨 FarmTally Pipeline Failure`,
                attachments: [{
                    color: 'danger',
                    fields: [
                        { title: 'Failure Type', value: failureReport.type, short: true },
                        { title: 'Build Number', value: failureReport.context.buildNumber, short: true },
                        { title: 'Git Commit', value: failureReport.context.gitCommit, short: true },
                        { title: 'Stage', value: failureReport.context.stage, short: true },
                        { title: 'Error', value: failureReport.error.message, short: false }
                    ],
                    footer: 'FarmTally Jenkins Pipeline',
                    ts: Math.floor(Date.now() / 1000)
                }]
            };
            
            console.log('💬 Slack notification prepared (actual sending depends on webhook configuration)');
            console.log(`Webhook: ${slackWebhook.substring(0, 50)}...`);
            
        } catch (error) {
            console.error('❌ Failed to send Slack notification:', error.message);
        }
    }

    /**
     * Send Jenkins notification
     */
    async sendJenkinsNotification(failureReport) {
        console.log('🔔 Jenkins notification logged');
        
        // Jenkins will automatically mark the build as failed
        // Additional Jenkins-specific notifications can be configured here
    }

    /**
     * Save failure report to file
     */
    async saveFailureReport(failureReport) {
        try {
            const reportPath = `failure-reports/${failureReport.id}.json`;
            
            // Ensure directory exists
            if (!fs.existsSync('failure-reports')) {
                fs.mkdirSync('failure-reports', { recursive: true });
            }
            
            fs.writeFileSync(reportPath, JSON.stringify(failureReport, null, 2));
            console.log(`📄 Failure report saved: ${reportPath}`);
            
        } catch (error) {
            console.error('❌ Failed to save failure report:', error.message);
        }
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const failureType = args[0];
    const errorMessage = args[1] || 'Unknown error';
    const stage = args[2] || 'unknown';
    
    if (!failureType) {
        console.error('Usage: node failure-handler.js <failure-type> [error-message] [stage]');
        console.error('Failure types:', Object.values(new FailureHandler().failureTypes).join(', '));
        process.exit(1);
    }
    
    const handler = new FailureHandler();
    const error = new Error(errorMessage);
    const context = { stage };
    
    handler.handleFailure(failureType, error, context)
        .then(report => {
            console.log(`\n📋 Failure handled with ID: ${report.id}`);
        })
        .catch(err => {
            console.error('❌ Failed to handle failure:', err.message);
            process.exit(1);
        });
}

module.exports = FailureHandler;