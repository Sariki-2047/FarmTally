#!/usr/bin/env node

/**
 * Backend Service Connectivity Verification Script
 * 
 * This script verifies that the backend can connect to all required external services
 * using the configured environment variables.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

class ConnectivityVerifier {
    constructor() {
        this.errors = 0;
        this.warnings = 0;
        this.results = {
            timestamp: new Date().toISOString(),
            buildNumber: process.env.BUILD_NUMBER || 'unknown',
            gitCommit: process.env.GIT_COMMIT || 'unknown',
            tests: {}
        };
    }

    log(message, color = 'reset') {
        console.log(`${colors[color]}${message}${colors.reset}`);
    }

    async verifyDatabaseConnection() {
        this.log('\n🔍 Verifying database connectivity...', 'blue');
        
        try {
            const databaseUrl = process.env.DATABASE_URL;
            if (!databaseUrl) {
                throw new Error('DATABASE_URL environment variable not set');
            }

            // Try to connect using a simple query
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient({
                datasources: {
                    db: {
                        url: databaseUrl
                    }
                }
            });

            // Test connection with a simple query
            await prisma.$queryRaw`SELECT 1 as test`;
            await prisma.$disconnect();

            this.log('✅ Database connection successful', 'green');
            this.results.tests.database = { status: 'success', message: 'Connection established' };
            return true;

        } catch (error) {
            this.log(`❌ Database connection failed: ${error.message}`, 'red');
            this.results.tests.database = { status: 'error', message: error.message };
            this.errors++;
            return false;
        }
    }

    async verifyRedisConnection() {
        this.log('\n🔍 Verifying Redis connectivity...', 'blue');
        
        try {
            const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
            
            // Try to connect to Redis
            const { createClient } = require('redis');
            const client = createClient({ url: redisUrl });
            
            await client.connect();
            await client.ping();
            await client.disconnect();

            this.log('✅ Redis connection successful', 'green');
            this.results.tests.redis = { status: 'success', message: 'Connection established' };
            return true;

        } catch (error) {
            this.log(`⚠️  Redis connection failed: ${error.message} (optional service)`, 'yellow');
            this.results.tests.redis = { status: 'warning', message: error.message };
            this.warnings++;
            return false;
        }
    }

    async verifyEmailConfiguration() {
        this.log('\n🔍 Verifying email configuration...', 'blue');
        
        try {
            const requiredVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'SMTP_PORT'];
            const missingVars = requiredVars.filter(varName => !process.env[varName]);
            
            if (missingVars.length > 0) {
                throw new Error(`Missing email configuration: ${missingVars.join(', ')}`);
            }

            // Test SMTP connection using nodemailer
            const nodemailer = require('nodemailer');
            const transporter = nodemailer.createTransporter({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });

            // Verify SMTP connection
            await transporter.verify();

            this.log('✅ Email configuration verified', 'green');
            this.results.tests.email = { status: 'success', message: 'SMTP connection verified' };
            return true;

        } catch (error) {
            this.log(`❌ Email configuration failed: ${error.message}`, 'red');
            this.results.tests.email = { status: 'error', message: error.message };
            this.errors++;
            return false;
        }
    }

    async verifyJWTConfiguration() {
        this.log('\n🔍 Verifying JWT configuration...', 'blue');
        
        try {
            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                throw new Error('JWT_SECRET environment variable not set');
            }

            if (jwtSecret.length < 32) {
                throw new Error(`JWT secret too short (${jwtSecret.length} chars, minimum 32 required)`);
            }

            // Test JWT token generation and verification
            const jwt = require('jsonwebtoken');
            const testPayload = { test: true, timestamp: Date.now() };
            
            const token = jwt.sign(testPayload, jwtSecret, { expiresIn: '1m' });
            const decoded = jwt.verify(token, jwtSecret);
            
            if (!decoded.test) {
                throw new Error('JWT token verification failed');
            }

            this.log('✅ JWT configuration verified', 'green');
            this.results.tests.jwt = { status: 'success', message: 'JWT generation and verification successful' };
            return true;

        } catch (error) {
            this.log(`❌ JWT configuration failed: ${error.message}`, 'red');
            this.results.tests.jwt = { status: 'error', message: error.message };
            this.errors++;
            return false;
        }
    }

    async verifyFileSystemPermissions() {
        this.log('\n🔍 Verifying file system permissions...', 'blue');
        
        try {
            // Test write permissions in common directories
            const testDirs = ['./logs', './uploads', './temp'];
            
            for (const dir of testDirs) {
                try {
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }
                    
                    const testFile = path.join(dir, 'test-write.tmp');
                    fs.writeFileSync(testFile, 'test');
                    fs.unlinkSync(testFile);
                    
                } catch (dirError) {
                    this.log(`⚠️  Cannot write to ${dir}: ${dirError.message}`, 'yellow');
                    this.warnings++;
                }
            }

            this.log('✅ File system permissions verified', 'green');
            this.results.tests.filesystem = { status: 'success', message: 'Write permissions verified' };
            return true;

        } catch (error) {
            this.log(`❌ File system verification failed: ${error.message}`, 'red');
            this.results.tests.filesystem = { status: 'error', message: error.message };
            this.errors++;
            return false;
        }
    }

    async verifyEnvironmentConsistency() {
        this.log('\n🔍 Verifying environment consistency...', 'blue');
        
        try {
            const nodeEnv = process.env.NODE_ENV;
            const frontendUrl = process.env.FRONTEND_URL;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            
            // Check NODE_ENV consistency
            if (nodeEnv !== 'production' && nodeEnv !== 'development') {
                throw new Error(`Invalid NODE_ENV: ${nodeEnv} (should be 'production' or 'development')`);
            }

            // Check URL consistency in production
            if (nodeEnv === 'production') {
                if (frontendUrl && frontendUrl.includes('localhost')) {
                    this.log('⚠️  Frontend URL contains localhost in production environment', 'yellow');
                    this.warnings++;
                }
                
                if (apiUrl && apiUrl.includes('localhost')) {
                    this.log('⚠️  API URL contains localhost in production environment', 'yellow');
                    this.warnings++;
                }
            }

            this.log('✅ Environment consistency verified', 'green');
            this.results.tests.environment = { status: 'success', message: 'Environment variables consistent' };
            return true;

        } catch (error) {
            this.log(`❌ Environment consistency check failed: ${error.message}`, 'red');
            this.results.tests.environment = { status: 'error', message: error.message };
            this.errors++;
            return false;
        }
    }

    async runAllVerifications() {
        this.log('🔍 Starting backend service connectivity verification...', 'blue');
        
        const verifications = [
            this.verifyDatabaseConnection(),
            this.verifyRedisConnection(),
            this.verifyEmailConfiguration(),
            this.verifyJWTConfiguration(),
            this.verifyFileSystemPermissions(),
            this.verifyEnvironmentConsistency()
        ];

        await Promise.all(verifications);

        // Generate summary
        this.log('\n📊 Connectivity Verification Summary:', 'blue');
        this.log(`   Errors: ${this.errors}`, this.errors > 0 ? 'red' : 'green');
        this.log(`   Warnings: ${this.warnings}`, this.warnings > 0 ? 'yellow' : 'green');

        // Save results to file
        this.results.summary = {
            errors: this.errors,
            warnings: this.warnings,
            status: this.errors === 0 ? 'passed' : 'failed'
        };

        fs.writeFileSync('backend-connectivity-report.json', JSON.stringify(this.results, null, 2));
        this.log('📝 Connectivity report saved to backend-connectivity-report.json', 'blue');

        // Exit with appropriate code
        if (this.errors > 0) {
            this.log('\n❌ Backend connectivity verification failed!', 'red');
            this.log('   Please fix the above issues before proceeding with deployment.', 'red');
            process.exit(1);
        } else {
            this.log('\n✅ Backend connectivity verification passed!', 'green');
            if (this.warnings > 0) {
                this.log(`   Note: ${this.warnings} warning(s) found - review recommended.`, 'yellow');
            }
            process.exit(0);
        }
    }
}

// Run verification if called directly
if (require.main === module) {
    const verifier = new ConnectivityVerifier();
    verifier.runAllVerifications().catch(error => {
        console.error('❌ Verification script failed:', error);
        process.exit(1);
    });
}

module.exports = ConnectivityVerifier;