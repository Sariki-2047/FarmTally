#!/usr/bin/env node

/**
 * Comprehensive Health Check Script for FarmTally Backend
 * 
 * This script performs comprehensive health verification including:
 * - Basic /api/health endpoint verification
 * - Authenticated endpoint testing with service token
 * - Database connectivity verification through API
 * - Response time and status code logging
 * 
 * Usage:
 *   node scripts/health-check.js [options]
 * 
 * Options:
 *   --url <url>          Base URL of the API (default: http://localhost:3000)
 *   --token <token>      Service token for authenticated requests
 *   --timeout <ms>       Request timeout in milliseconds (default: 10000)
 *   --retries <count>    Number of retries for failed requests (default: 3)
 *   --verbose            Enable verbose logging
 *   --json               Output results in JSON format
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');

class HealthChecker {
    constructor(options = {}) {
        this.baseUrl = options.url || process.env.API_URL || 'http://localhost:3000';
        this.serviceToken = options.token || process.env.SERVICE_TOKEN;
        this.timeout = options.timeout || 10000;
        this.retries = options.retries || 3;
        this.verbose = options.verbose || false;
        this.jsonOutput = options.json || false;
        
        // Remove trailing slash from baseUrl
        this.baseUrl = this.baseUrl.replace(/\/$/, '');
        
        this.results = {
            timestamp: new Date().toISOString(),
            baseUrl: this.baseUrl,
            checks: [],
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                duration: 0
            }
        };
    }

    log(message, level = 'info') {
        if (this.jsonOutput && level !== 'error') return;
        
        const timestamp = new Date().toISOString();
        const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'success' ? '✅' : 'ℹ️';
        
        if (this.verbose || level === 'error' || level === 'success') {
            console.log(`${prefix} [${timestamp}] ${message}`);
        }
    }

    async makeRequest(url, options = {}) {
        const startTime = Date.now();
        let attempt = 0;
        
        while (attempt < this.retries) {
            try {
                const response = await axios({
                    url,
                    timeout: this.timeout,
                    validateStatus: () => true, // Don't throw on non-2xx status codes
                    ...options
                });
                
                const duration = Date.now() - startTime;
                return { response, duration, attempt: attempt + 1 };
            } catch (error) {
                attempt++;
                const duration = Date.now() - startTime;
                
                if (attempt >= this.retries) {
                    return { 
                        error: error.message, 
                        duration, 
                        attempt,
                        code: error.code 
                    };
                }
                
                this.log(`Request failed (attempt ${attempt}/${this.retries}): ${error.message}`, 'warn');
                await this.sleep(1000 * attempt); // Exponential backoff
            }
        }
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async checkBasicHealth() {
        this.log('Checking basic health endpoint...');
        
        const result = await this.makeRequest(`${this.baseUrl}/api/health`);
        
        const check = {
            name: 'Basic Health Check',
            endpoint: '/api/health',
            method: 'GET',
            timestamp: new Date().toISOString(),
            duration: result.duration,
            attempts: result.attempt || 0
        };

        if (result.error) {
            check.status = 'FAILED';
            check.error = result.error;
            check.errorCode = result.code;
            this.log(`Basic health check failed: ${result.error}`, 'error');
        } else {
            const { response } = result;
            check.status = response.status === 200 ? 'PASSED' : 'FAILED';
            check.statusCode = response.status;
            check.responseSize = JSON.stringify(response.data).length;
            
            if (response.status === 200) {
                check.responseData = response.data;
                this.log(`Basic health check passed (${result.duration}ms)`, 'success');
            } else {
                check.error = `Unexpected status code: ${response.status}`;
                this.log(`Basic health check failed: HTTP ${response.status}`, 'error');
            }
        }

        this.results.checks.push(check);
        return check.status === 'PASSED';
    }

    async checkRootEndpoint() {
        this.log('Checking root endpoint...');
        
        const result = await this.makeRequest(`${this.baseUrl}/`);
        
        const check = {
            name: 'Root Endpoint Check',
            endpoint: '/',
            method: 'GET',
            timestamp: new Date().toISOString(),
            duration: result.duration,
            attempts: result.attempt || 0
        };

        if (result.error) {
            check.status = 'FAILED';
            check.error = result.error;
            check.errorCode = result.code;
            this.log(`Root endpoint check failed: ${result.error}`, 'error');
        } else {
            const { response } = result;
            check.status = response.status === 200 ? 'PASSED' : 'FAILED';
            check.statusCode = response.status;
            check.responseSize = JSON.stringify(response.data).length;
            
            if (response.status === 200) {
                check.responseData = response.data;
                this.log(`Root endpoint check passed (${result.duration}ms)`, 'success');
            } else {
                check.error = `Unexpected status code: ${response.status}`;
                this.log(`Root endpoint check failed: HTTP ${response.status}`, 'error');
            }
        }

        this.results.checks.push(check);
        return check.status === 'PASSED';
    }

    async checkAuthEndpoint() {
        this.log('Checking authenticated endpoint...');
        
        if (!this.serviceToken) {
            const check = {
                name: 'Authentication Check',
                endpoint: '/api/auth/profile',
                method: 'GET',
                timestamp: new Date().toISOString(),
                status: 'SKIPPED',
                error: 'No service token provided',
                duration: 0,
                attempts: 0
            };
            
            this.results.checks.push(check);
            this.log('Authentication check skipped: No service token provided', 'warn');
            return false;
        }

        const result = await this.makeRequest(`${this.baseUrl}/api/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${this.serviceToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const check = {
            name: 'Authentication Check',
            endpoint: '/api/auth/profile',
            method: 'GET',
            timestamp: new Date().toISOString(),
            duration: result.duration,
            attempts: result.attempt || 0
        };

        if (result.error) {
            check.status = 'FAILED';
            check.error = result.error;
            check.errorCode = result.code;
            this.log(`Authentication check failed: ${result.error}`, 'error');
        } else {
            const { response } = result;
            check.statusCode = response.status;
            check.responseSize = JSON.stringify(response.data).length;
            
            if (response.status === 200) {
                check.status = 'PASSED';
                check.responseData = {
                    hasUser: !!response.data.id,
                    userRole: response.data.role,
                    hasOrganization: !!response.data.organization
                };
                this.log(`Authentication check passed (${result.duration}ms)`, 'success');
            } else if (response.status === 401) {
                check.status = 'FAILED';
                check.error = 'Invalid or expired service token';
                this.log('Authentication check failed: Invalid token', 'error');
            } else {
                check.status = 'FAILED';
                check.error = `Unexpected status code: ${response.status}`;
                this.log(`Authentication check failed: HTTP ${response.status}`, 'error');
            }
        }

        this.results.checks.push(check);
        return check.status === 'PASSED';
    }

    async checkDatabaseConnectivity() {
        this.log('Checking database connectivity...');
        
        if (!this.serviceToken) {
            const check = {
                name: 'Database Connectivity Check',
                endpoint: '/api/farmer/statistics',
                method: 'GET',
                timestamp: new Date().toISOString(),
                status: 'SKIPPED',
                error: 'No service token provided',
                duration: 0,
                attempts: 0
            };
            
            this.results.checks.push(check);
            this.log('Database connectivity check skipped: No service token provided', 'warn');
            return false;
        }

        // Try to access an endpoint that requires database connectivity
        // We'll use a simple query that should work with any valid token
        const result = await this.makeRequest(`${this.baseUrl}/api/farmer/statistics?farmerId=test`, {
            headers: {
                'Authorization': `Bearer ${this.serviceToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const check = {
            name: 'Database Connectivity Check',
            endpoint: '/api/farmer/statistics',
            method: 'GET',
            timestamp: new Date().toISOString(),
            duration: result.duration,
            attempts: result.attempt || 0
        };

        if (result.error) {
            check.status = 'FAILED';
            check.error = result.error;
            check.errorCode = result.code;
            this.log(`Database connectivity check failed: ${result.error}`, 'error');
        } else {
            const { response } = result;
            check.statusCode = response.status;
            check.responseSize = JSON.stringify(response.data).length;
            
            // Accept both 200 (success) and 400/404 (valid response indicating DB is accessible)
            if ([200, 400, 404].includes(response.status)) {
                check.status = 'PASSED';
                check.responseData = {
                    statusCode: response.status,
                    databaseAccessible: true
                };
                this.log(`Database connectivity check passed (${result.duration}ms)`, 'success');
            } else if (response.status === 401) {
                check.status = 'FAILED';
                check.error = 'Authentication failed - token may be invalid';
                this.log('Database connectivity check failed: Authentication error', 'error');
            } else if (response.status >= 500) {
                check.status = 'FAILED';
                check.error = `Server error: ${response.status} - possible database connection issue`;
                this.log(`Database connectivity check failed: Server error ${response.status}`, 'error');
            } else {
                check.status = 'PASSED';
                check.responseData = {
                    statusCode: response.status,
                    databaseAccessible: true
                };
                this.log(`Database connectivity check passed with status ${response.status} (${result.duration}ms)`, 'success');
            }
        }

        this.results.checks.push(check);
        return check.status === 'PASSED';
    }

    async generateServiceToken() {
        this.log('Generating temporary service token for testing...');
        
        const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
        
        // Create a service token with minimal claims for health checking
        const token = jwt.sign(
            { 
                userId: 'health-check-service',
                email: 'health-check@farmtally.com',
                role: 'FARM_ADMIN',
                organizationId: 'health-check-org',
                service: true
            },
            jwtSecret,
            { expiresIn: '5m' }
        );
        
        this.serviceToken = token;
        this.log('Temporary service token generated');
        return token;
    }

    async runAllChecks() {
        const startTime = Date.now();
        this.log('Starting comprehensive health checks...');
        
        // Generate service token if not provided
        if (!this.serviceToken && process.env.JWT_SECRET) {
            await this.generateServiceToken();
        }
        
        const checks = [
            this.checkBasicHealth(),
            this.checkRootEndpoint(),
            this.checkAuthEndpoint(),
            this.checkDatabaseConnectivity()
        ];

        const results = await Promise.allSettled(checks);
        
        // Calculate summary
        this.results.summary.total = results.length;
        this.results.summary.passed = results.filter((r, i) => 
            r.status === 'fulfilled' && r.value === true
        ).length;
        this.results.summary.failed = this.results.summary.total - this.results.summary.passed;
        this.results.summary.duration = Date.now() - startTime;

        // Log summary
        const passRate = ((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1);
        
        if (this.results.summary.failed === 0) {
            this.log(`All health checks passed! (${this.results.summary.passed}/${this.results.summary.total}) - ${passRate}%`, 'success');
        } else {
            this.log(`Health checks completed with ${this.results.summary.failed} failures (${this.results.summary.passed}/${this.results.summary.total}) - ${passRate}%`, 'error');
        }

        return this.results;
    }

    outputResults() {
        if (this.jsonOutput) {
            console.log(JSON.stringify(this.results, null, 2));
        } else {
            console.log('\n📊 Health Check Summary:');
            console.log(`   Total Checks: ${this.results.summary.total}`);
            console.log(`   Passed: ${this.results.summary.passed}`);
            console.log(`   Failed: ${this.results.summary.failed}`);
            console.log(`   Duration: ${this.results.summary.duration}ms`);
            console.log(`   Success Rate: ${((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1)}%`);
            
            if (this.results.summary.failed > 0) {
                console.log('\n❌ Failed Checks:');
                this.results.checks
                    .filter(check => check.status === 'FAILED')
                    .forEach(check => {
                        console.log(`   - ${check.name}: ${check.error}`);
                    });
            }
        }
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    const options = {};
    
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--url':
                options.url = args[++i];
                break;
            case '--token':
                options.token = args[++i];
                break;
            case '--timeout':
                options.timeout = parseInt(args[++i], 10);
                break;
            case '--retries':
                options.retries = parseInt(args[++i], 10);
                break;
            case '--verbose':
                options.verbose = true;
                break;
            case '--json':
                options.json = true;
                break;
            case '--help':
                console.log(`
FarmTally Health Check Script

Usage: node scripts/health-check.js [options]

Options:
  --url <url>          Base URL of the API (default: http://localhost:3000)
  --token <token>      Service token for authenticated requests
  --timeout <ms>       Request timeout in milliseconds (default: 10000)
  --retries <count>    Number of retries for failed requests (default: 3)
  --verbose            Enable verbose logging
  --json               Output results in JSON format
  --help               Show this help message

Environment Variables:
  API_URL              Base URL of the API
  SERVICE_TOKEN        Service token for authenticated requests
  JWT_SECRET           JWT secret for generating temporary tokens

Examples:
  node scripts/health-check.js
  node scripts/health-check.js --url https://api.farmtally.com --verbose
  node scripts/health-check.js --token eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
  node scripts/health-check.js --json > health-report.json
                `);
                process.exit(0);
        }
    }
    
    try {
        const checker = new HealthChecker(options);
        const results = await checker.runAllChecks();
        checker.outputResults();
        
        // Exit with error code if any checks failed
        process.exit(results.summary.failed > 0 ? 1 : 0);
    } catch (error) {
        console.error('❌ Health check script failed:', error.message);
        if (options.verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// Export for use as module
module.exports = HealthChecker;

// Run if called directly
if (require.main === module) {
    main();
}