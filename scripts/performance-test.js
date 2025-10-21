#!/usr/bin/env node

/**
 * Performance Testing Script for Pipeline Components
 * Tests build performance, resource usage, and identifies bottlenecks
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class PerformanceTest {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            system: {
                platform: os.platform(),
                arch: os.arch(),
                cpus: os.cpus().length,
                totalMemory: Math.round(os.totalmem() / 1024 / 1024) // MB
            },
            tests: []
        };
    }

    /**
     * Run performance test for a command
     */
    async testCommand(name, command, options = {}) {
        console.log(`\n=== Testing: ${name} ===`);
        
        const startTime = Date.now();
        const startMemory = process.memoryUsage();
        const startCpu = process.cpuUsage();

        try {
            const result = await this.executeCommand(command, options);
            const endTime = Date.now();
            const endMemory = process.memoryUsage();
            const endCpu = process.cpuUsage(startCpu);

            const testResult = {
                name: name,
                command: command,
                status: 'success',
                duration: endTime - startTime,
                durationSeconds: Math.round((endTime - startTime) / 1000 * 100) / 100,
                memory: {
                    heapUsed: Math.round((endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024 * 100) / 100, // MB
                    heapTotal: Math.round(endMemory.heapTotal / 1024 / 1024 * 100) / 100, // MB
                    external: Math.round(endMemory.external / 1024 / 1024 * 100) / 100 // MB
                },
                cpu: {
                    user: Math.round(endCpu.user / 1000), // microseconds to milliseconds
                    system: Math.round(endCpu.system / 1000)
                },
                output: result.stdout ? result.stdout.substring(0, 500) : '', // First 500 chars
                error: result.stderr ? result.stderr.substring(0, 500) : ''
            };

            console.log(`✓ ${name}: ${testResult.durationSeconds}s, Memory: ${testResult.memory.heapUsed}MB`);
            this.results.tests.push(testResult);
            return testResult;

        } catch (error) {
            const endTime = Date.now();
            const testResult = {
                name: name,
                command: command,
                status: 'failed',
                duration: endTime - startTime,
                durationSeconds: Math.round((endTime - startTime) / 1000 * 100) / 100,
                error: error.message,
                output: error.stdout || '',
                stderr: error.stderr || ''
            };

            console.log(`✗ ${name}: FAILED after ${testResult.durationSeconds}s - ${error.message}`);
            this.results.tests.push(testResult);
            return testResult;
        }
    }

    /**
     * Execute a command and return promise
     */
    executeCommand(command, options = {}) {
        return new Promise((resolve, reject) => {
            const isWindows = process.platform === 'win32';
            const shell = isWindows ? 'cmd' : 'bash';
            const shellFlag = isWindows ? '/c' : '-c';

            const child = spawn(shell, [shellFlag, command], {
                cwd: options.cwd || process.cwd(),
                env: { ...process.env, ...options.env },
                stdio: 'pipe'
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve({ stdout, stderr, code });
                } else {
                    const error = new Error(`Command failed with code ${code}`);
                    error.stdout = stdout;
                    error.stderr = stderr;
                    error.code = code;
                    reject(error);
                }
            });

            child.on('error', (error) => {
                reject(error);
            });

            // Set timeout if specified
            if (options.timeout) {
                setTimeout(() => {
                    child.kill();
                    reject(new Error(`Command timed out after ${options.timeout}ms`));
                }, options.timeout);
            }
        });
    }

    /**
     * Test backend build performance
     */
    async testBackendBuild() {
        console.log('\n🔧 Testing Backend Build Performance...');

        // Test npm install
        await this.testCommand(
            'Backend npm install',
            'npm ci',
            { timeout: 300000 } // 5 minutes
        );

        // Test TypeScript compilation
        await this.testCommand(
            'Backend TypeScript build',
            'npm run build',
            { timeout: 180000 } // 3 minutes
        );

        // Test linting (if available)
        try {
            await this.testCommand(
                'Backend linting',
                'npm run lint',
                { timeout: 60000 } // 1 minute
            );
        } catch (error) {
            console.log('Linting not available or failed');
        }
    }

    /**
     * Test frontend build performance
     */
    async testFrontendBuild() {
        console.log('\n🎨 Testing Frontend Build Performance...');

        const frontendDir = 'farmtally-frontend';
        
        if (!fs.existsSync(frontendDir)) {
            console.log('Frontend directory not found, skipping frontend tests');
            return;
        }

        // Test npm install
        await this.testCommand(
            'Frontend npm install',
            'npm ci',
            { cwd: frontendDir, timeout: 300000 } // 5 minutes
        );

        // Test Next.js build
        await this.testCommand(
            'Frontend Next.js build',
            'npm run build',
            { cwd: frontendDir, timeout: 300000 } // 5 minutes
        );
    }

    /**
     * Test database operations
     */
    async testDatabaseOperations() {
        console.log('\n🗄️ Testing Database Operations...');

        // Test Prisma generate
        await this.testCommand(
            'Prisma generate',
            'npx prisma generate',
            { timeout: 60000 } // 1 minute
        );

        // Test database connection (if DATABASE_URL is available)
        if (process.env.DATABASE_URL) {
            await this.testCommand(
                'Database connection test',
                'npx prisma db pull --preview-feature',
                { timeout: 30000 } // 30 seconds
            );
        } else {
            console.log('DATABASE_URL not set, skipping database connection test');
        }
    }

    /**
     * Test pipeline scripts
     */
    async testPipelineScripts() {
        console.log('\n📋 Testing Pipeline Scripts...');

        // Test health check script
        await this.testCommand(
            'Health check script',
            'node scripts/health-check.js',
            { timeout: 30000 } // 30 seconds
        );

        // Test pipeline monitor
        await this.testCommand(
            'Pipeline monitor resource check',
            'node scripts/pipeline-monitor.js resource-check',
            { timeout: 10000 } // 10 seconds
        );

        // Test artifact manager (dry run)
        await this.testCommand(
            'Artifact manager validation',
            'node scripts/artifact-manager.sh --validate',
            { timeout: 30000 } // 30 seconds
        );
    }

    /**
     * Generate performance report
     */
    generateReport() {
        const totalTests = this.results.tests.length;
        const successfulTests = this.results.tests.filter(t => t.status === 'success').length;
        const failedTests = totalTests - successfulTests;
        
        const totalDuration = this.results.tests.reduce((sum, test) => sum + test.duration, 0);
        const averageDuration = totalDuration / totalTests;

        const report = {
            summary: {
                totalTests: totalTests,
                successfulTests: successfulTests,
                failedTests: failedTests,
                successRate: Math.round((successfulTests / totalTests) * 100),
                totalDurationSeconds: Math.round(totalDuration / 1000 * 100) / 100,
                averageDurationSeconds: Math.round(averageDuration / 1000 * 100) / 100
            },
            slowestTests: this.results.tests
                .sort((a, b) => b.duration - a.duration)
                .slice(0, 5),
            failedTests: this.results.tests.filter(t => t.status === 'failed'),
            recommendations: this.generateRecommendations()
        };

        console.log('\n📊 PERFORMANCE TEST REPORT');
        console.log('=' .repeat(50));
        console.log(`Total Tests: ${report.summary.totalTests}`);
        console.log(`Success Rate: ${report.summary.successRate}%`);
        console.log(`Total Duration: ${report.summary.totalDurationSeconds}s`);
        console.log(`Average Duration: ${report.summary.averageDurationSeconds}s`);

        if (report.slowestTests.length > 0) {
            console.log('\n🐌 Slowest Operations:');
            report.slowestTests.forEach((test, index) => {
                console.log(`${index + 1}. ${test.name}: ${test.durationSeconds}s`);
            });
        }

        if (report.failedTests.length > 0) {
            console.log('\n❌ Failed Tests:');
            report.failedTests.forEach(test => {
                console.log(`- ${test.name}: ${test.error}`);
            });
        }

        if (report.recommendations.length > 0) {
            console.log('\n💡 Recommendations:');
            report.recommendations.forEach(rec => {
                console.log(`- ${rec}`);
            });
        }

        // Save detailed report
        const reportFile = 'performance-test-report.json';
        fs.writeFileSync(reportFile, JSON.stringify({
            ...this.results,
            report: report
        }, null, 2));

        console.log(`\n📄 Detailed report saved to: ${reportFile}`);
        return report;
    }

    /**
     * Generate performance recommendations
     */
    generateRecommendations() {
        const recommendations = [];
        const slowThreshold = 60000; // 1 minute
        const memoryThreshold = 500; // 500MB

        // Check for slow operations
        const slowTests = this.results.tests.filter(t => t.duration > slowThreshold);
        if (slowTests.length > 0) {
            recommendations.push(`${slowTests.length} operations took longer than 1 minute. Consider optimizing build processes.`);
        }

        // Check for high memory usage
        const highMemoryTests = this.results.tests.filter(t => 
            t.memory && t.memory.heapUsed > memoryThreshold
        );
        if (highMemoryTests.length > 0) {
            recommendations.push(`${highMemoryTests.length} operations used more than 500MB memory. Consider memory optimization.`);
        }

        // Check for failed tests
        const failedTests = this.results.tests.filter(t => t.status === 'failed');
        if (failedTests.length > 0) {
            recommendations.push(`${failedTests.length} tests failed. Review error messages and fix issues before deployment.`);
        }

        // Check build times
        const buildTests = this.results.tests.filter(t => 
            t.name.toLowerCase().includes('build') && t.status === 'success'
        );
        const totalBuildTime = buildTests.reduce((sum, test) => sum + test.duration, 0);
        if (totalBuildTime > 300000) { // 5 minutes
            recommendations.push('Total build time exceeds 5 minutes. Consider parallel builds or caching strategies.');
        }

        return recommendations;
    }

    /**
     * Run all performance tests
     */
    async runAllTests() {
        console.log('🚀 Starting Pipeline Performance Tests...');
        console.log(`System: ${this.results.system.platform} ${this.results.system.arch}`);
        console.log(`CPUs: ${this.results.system.cpus}, Memory: ${this.results.system.totalMemory}MB`);

        try {
            await this.testBackendBuild();
            await this.testFrontendBuild();
            await this.testDatabaseOperations();
            await this.testPipelineScripts();
        } catch (error) {
            console.error('Error during performance testing:', error);
        }

        return this.generateReport();
    }
}

// CLI interface
if (require.main === module) {
    const perfTest = new PerformanceTest();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'backend':
            perfTest.testBackendBuild().then(() => perfTest.generateReport());
            break;
        case 'frontend':
            perfTest.testFrontendBuild().then(() => perfTest.generateReport());
            break;
        case 'database':
            perfTest.testDatabaseOperations().then(() => perfTest.generateReport());
            break;
        case 'scripts':
            perfTest.testPipelineScripts().then(() => perfTest.generateReport());
            break;
        case 'all':
        default:
            perfTest.runAllTests();
            break;
    }
}

module.exports = PerformanceTest;