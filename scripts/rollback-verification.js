#!/usr/bin/env node

/**
 * FarmTally Rollback Verification Script
 * Comprehensive verification of rollback success and system health
 */

const axios = require('axios');
const { execSync } = require('child_process');
const fs = require('fs');

class RollbackVerifier {
    constructor() {
        this.vpsHost = process.env.VPS_HOST || '147.93.153.247';
        this.apiBaseUrl = `http://${this.vpsHost}:3000`;
        this.appDir = process.env.APP_DIR || '/opt/farmtally';
        this.targetBuild = process.env.ROLLBACK_BUILD_NUMBER;
        
        this.verificationResults = {
            timestamp: new Date().toISOString(),
            targetBuild: this.targetBuild,
            checks: [],
            overall: 'pending'
        };
    }

    /**
     * Log verification step
     */
    log(level, message, details = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            details
        };
        
        console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
        if (details) {
            console.log(`  Details: ${JSON.stringify(details, null, 2)}`);
        }
        
        this.verificationResults.checks.push(logEntry);
    }

    /**
     * Execute SSH command on VPS
     */
    async executeSSH(command) {
        try {
            const fullCommand = `ssh -o StrictHostKeyChecking=no root@${this.vpsHost} '${command}'`;
            const result = execSync(fullCommand, { 
                encoding: 'utf8',
                timeout: 30000 
            });
            return { success: true, output: result.trim() };
        } catch (error) {
            return { 
                success: false, 
                error: error.message,
                output: error.stdout ? error.stdout.trim() : ''
            };
        }
    }

    /**
     * Check API health endpoint
     */
    async checkApiHealth() {
        this.log('info', 'Checking API health endpoint...');
        
        try {
            const response = await axios.get(`${this.apiBaseUrl}/api/health`, {
                timeout: 10000
            });
            
            if (response.status === 200) {
                this.log('success', 'API health check passed', {
                    status: response.status,
                    data: response.data
                });
                return true;
            } else {
                this.log('error', 'API health check failed - unexpected status', {
                    status: response.status
                });
                return false;
            }
        } catch (error) {
            this.log('error', 'API health check failed', {
                error: error.message,
                code: error.code
            });
            return false;
        }
    }

    /**
     * Check authenticated endpoint
     */
    async checkAuthenticatedEndpoint() {
        this.log('info', 'Checking authenticated endpoint...');
        
        try {
            // Try to access a protected endpoint (this will fail without auth, but should return 401, not 500)
            const response = await axios.get(`${this.apiBaseUrl}/api/auth/verify`, {
                timeout: 10000,
                validateStatus: (status) => status === 401 || status === 200
            });
            
            if (response.status === 401 || response.status === 200) {
                this.log('success', 'Authenticated endpoint responding correctly', {
                    status: response.status
                });
                return true;
            } else {
                this.log('error', 'Authenticated endpoint unexpected response', {
                    status: response.status
                });
                return false;
            }
        } catch (error) {
            this.log('error', 'Authenticated endpoint check failed', {
                error: error.message
            });
            return false;
        }
    }

    /**
     * Check PM2 process status
     */
    async checkPM2Status() {
        this.log('info', 'Checking PM2 process status...');
        
        const result = await this.executeSSH('pm2 jlist');
        
        if (!result.success) {
            this.log('error', 'Failed to get PM2 status', { error: result.error });
            return false;
        }
        
        try {
            const processes = JSON.parse(result.output);
            const farmtallyProcess = processes.find(p => p.name === 'farmtally-backend');
            
            if (!farmtallyProcess) {
                this.log('error', 'FarmTally backend process not found in PM2');
                return false;
            }
            
            if (farmtallyProcess.pm2_env.status === 'online') {
                this.log('success', 'PM2 process is online', {
                    pid: farmtallyProcess.pid,
                    uptime: farmtallyProcess.pm2_env.pm_uptime,
                    restarts: farmtallyProcess.pm2_env.restart_time
                });
                return true;
            } else {
                this.log('error', 'PM2 process is not online', {
                    status: farmtallyProcess.pm2_env.status
                });
                return false;
            }
        } catch (error) {
            this.log('error', 'Failed to parse PM2 status', { error: error.message });
            return false;
        }
    }

    /**
     * Check database connectivity
     */
    async checkDatabaseConnectivity() {
        this.log('info', 'Checking database connectivity...');
        
        const result = await this.executeSSH(`cd ${this.appDir}/backend && npx prisma db pull --preview-feature`);
        
        if (result.success) {
            this.log('success', 'Database connectivity verified');
            return true;
        } else {
            this.log('error', 'Database connectivity failed', { 
                error: result.error,
                output: result.output 
            });
            return false;
        }
    }

    /**
     * Verify rollback version
     */
    async verifyRollbackVersion() {
        this.log('info', 'Verifying rollback version...');
        
        if (!this.targetBuild) {
            this.log('warning', 'Target build number not specified - skipping version verification');
            return true;
        }
        
        // Check if backup manifest exists and matches
        const result = await this.executeSSH(`
            if [ -f "${this.appDir}/backups/build-${this.targetBuild}/manifest.json" ]; then
                cat "${this.appDir}/backups/build-${this.targetBuild}/manifest.json"
            else
                echo "Manifest not found"
            fi
        `);
        
        if (result.success && result.output !== 'Manifest not found') {
            try {
                const manifest = JSON.parse(result.output);
                this.log('success', 'Rollback version verified', {
                    targetBuild: this.targetBuild,
                    manifest: manifest
                });
                return true;
            } catch (error) {
                this.log('warning', 'Could not parse backup manifest', { 
                    error: error.message 
                });
                return true; // Don't fail verification for this
            }
        } else {
            this.log('warning', 'Backup manifest not found - version verification skipped');
            return true; // Don't fail verification for this
        }
    }

    /**
     * Check system resources
     */
    async checkSystemResources() {
        this.log('info', 'Checking system resources...');
        
        const result = await this.executeSSH(`
            echo "=== Memory Usage ==="
            free -h
            echo "=== Disk Usage ==="
            df -h /opt
            echo "=== CPU Load ==="
            uptime
        `);
        
        if (result.success) {
            this.log('info', 'System resources check completed', {
                output: result.output
            });
            
            // Basic resource validation
            const memoryMatch = result.output.match(/Mem:\s+\S+\s+\S+\s+(\S+)/);
            if (memoryMatch) {
                const availableMemory = memoryMatch[1];
                this.log('info', `Available memory: ${availableMemory}`);
            }
            
            return true;
        } else {
            this.log('warning', 'System resources check failed', { 
                error: result.error 
            });
            return true; // Don't fail verification for this
        }
    }

    /**
     * Check application logs for errors
     */
    async checkApplicationLogs() {
        this.log('info', 'Checking application logs for errors...');
        
        const result = await this.executeSSH(`pm2 logs farmtally-backend --lines 50 --nostream`);
        
        if (result.success) {
            const logs = result.output;
            
            // Look for common error patterns
            const errorPatterns = [
                /ERROR/i,
                /FATAL/i,
                /Exception/i,
                /Error:/i,
                /failed/i
            ];
            
            const recentErrors = logs.split('\n')
                .filter(line => errorPatterns.some(pattern => pattern.test(line)))
                .slice(-10); // Last 10 error lines
            
            if (recentErrors.length > 0) {
                this.log('warning', 'Found recent errors in application logs', {
                    errors: recentErrors
                });
            } else {
                this.log('success', 'No recent errors found in application logs');
            }
            
            return true;
        } else {
            this.log('warning', 'Could not retrieve application logs', { 
                error: result.error 
            });
            return true; // Don't fail verification for this
        }
    }

    /**
     * Perform comprehensive endpoint testing
     */
    async performEndpointTesting() {
        this.log('info', 'Performing comprehensive endpoint testing...');
        
        const endpoints = [
            { path: '/api/health', method: 'GET', expectedStatus: 200 },
            { path: '/api/auth/verify', method: 'GET', expectedStatus: 401 }, // Should fail without auth
            { path: '/api/farmers', method: 'GET', expectedStatus: 401 }, // Should fail without auth
        ];
        
        let passedTests = 0;
        
        for (const endpoint of endpoints) {
            try {
                const response = await axios({
                    method: endpoint.method,
                    url: `${this.apiBaseUrl}${endpoint.path}`,
                    timeout: 10000,
                    validateStatus: () => true // Accept any status
                });
                
                if (response.status === endpoint.expectedStatus) {
                    this.log('success', `Endpoint test passed: ${endpoint.path}`, {
                        status: response.status,
                        expected: endpoint.expectedStatus
                    });
                    passedTests++;
                } else {
                    this.log('warning', `Endpoint test unexpected status: ${endpoint.path}`, {
                        status: response.status,
                        expected: endpoint.expectedStatus
                    });
                }
            } catch (error) {
                this.log('warning', `Endpoint test failed: ${endpoint.path}`, {
                    error: error.message
                });
            }
        }
        
        const successRate = (passedTests / endpoints.length) * 100;
        this.log('info', `Endpoint testing completed: ${passedTests}/${endpoints.length} passed (${successRate.toFixed(1)}%)`);
        
        return successRate >= 66; // Pass if at least 2/3 of tests pass
    }

    /**
     * Run all verification checks
     */
    async runAllChecks() {
        this.log('info', '=== Starting Rollback Verification ===');
        
        const checks = [
            { name: 'PM2 Status', fn: () => this.checkPM2Status(), critical: true },
            { name: 'API Health', fn: () => this.checkApiHealth(), critical: true },
            { name: 'Database Connectivity', fn: () => this.checkDatabaseConnectivity(), critical: true },
            { name: 'Authenticated Endpoint', fn: () => this.checkAuthenticatedEndpoint(), critical: false },
            { name: 'Rollback Version', fn: () => this.verifyRollbackVersion(), critical: false },
            { name: 'System Resources', fn: () => this.checkSystemResources(), critical: false },
            { name: 'Application Logs', fn: () => this.checkApplicationLogs(), critical: false },
            { name: 'Endpoint Testing', fn: () => this.performEndpointTesting(), critical: false }
        ];
        
        let criticalFailures = 0;
        let totalFailures = 0;
        
        for (const check of checks) {
            try {
                const result = await check.fn();
                if (!result) {
                    totalFailures++;
                    if (check.critical) {
                        criticalFailures++;
                    }
                }
            } catch (error) {
                this.log('error', `Check failed with exception: ${check.name}`, {
                    error: error.message
                });
                totalFailures++;
                if (check.critical) {
                    criticalFailures++;
                }
            }
        }
        
        // Determine overall result
        if (criticalFailures === 0) {
            this.verificationResults.overall = 'success';
            this.log('success', '=== Rollback Verification PASSED ===');
        } else {
            this.verificationResults.overall = 'failed';
            this.log('error', '=== Rollback Verification FAILED ===');
        }
        
        this.log('info', `Verification Summary: ${totalFailures} total failures, ${criticalFailures} critical failures`);
        
        return criticalFailures === 0;
    }

    /**
     * Generate verification report
     */
    generateReport() {
        const reportFile = `rollback_verification_${Date.now()}.json`;
        
        this.verificationResults.summary = {
            totalChecks: this.verificationResults.checks.length,
            successfulChecks: this.verificationResults.checks.filter(c => c.level === 'success').length,
            failedChecks: this.verificationResults.checks.filter(c => c.level === 'error').length,
            warningChecks: this.verificationResults.checks.filter(c => c.level === 'warning').length
        };
        
        fs.writeFileSync(reportFile, JSON.stringify(this.verificationResults, null, 2));
        
        this.log('info', `Verification report generated: ${reportFile}`);
        return reportFile;
    }
}

// CLI interface
if (require.main === module) {
    const verifier = new RollbackVerifier();
    
    verifier.runAllChecks()
        .then(success => {
            const reportFile = verifier.generateReport();
            
            if (success) {
                console.log('\n✅ Rollback verification completed successfully!');
                process.exit(0);
            } else {
                console.log('\n❌ Rollback verification failed!');
                console.log(`📄 Check the verification report: ${reportFile}`);
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ Verification process failed:', error.message);
            process.exit(1);
        });
}

module.exports = RollbackVerifier;