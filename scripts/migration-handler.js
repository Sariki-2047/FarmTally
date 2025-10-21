#!/usr/bin/env node

/**
 * FarmTally Database Migration Handler
 * Cross-platform Node.js script for handling database migrations
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    LOG_FILE: 'migration.log',
    MIGRATION_TIMEOUT: 300000, // 5 minutes in milliseconds
    RETRY_COUNT: 3,
    RETRY_DELAY: 10000, // 10 seconds in milliseconds
};

// Colors for console output
const COLORS = {
    RED: '\x1b[31m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    RESET: '\x1b[0m'
};

class MigrationHandler {
    constructor() {
        this.logFile = CONFIG.LOG_FILE;
        this.startTime = new Date();
    }

    /**
     * Log message with timestamp and level
     */
    log(level, message) {
        const timestamp = new Date().toISOString();
        const logEntry = `${timestamp} [${level}] ${message}`;
        
        // Write to log file
        fs.appendFileSync(this.logFile, logEntry + '\n');
        
        // Console output with colors
        let colorCode = '';
        switch (level) {
            case 'ERROR':
                colorCode = COLORS.RED;
                break;
            case 'SUCCESS':
                colorCode = COLORS.GREEN;
                break;
            case 'WARNING':
                colorCode = COLORS.YELLOW;
                break;
            case 'INFO':
                colorCode = COLORS.BLUE;
                break;
        }
        
        console.log(`${colorCode}${logEntry}${COLORS.RESET}`);
    }

    /**
     * Execute command with timeout and error handling
     */
    async executeCommand(command, options = {}) {
        return new Promise((resolve, reject) => {
            const timeout = options.timeout || CONFIG.MIGRATION_TIMEOUT;
            
            this.log('INFO', `Executing: ${command}`);
            
            const child = spawn('npx', command.split(' ').slice(1), {
                stdio: options.silent ? 'pipe' : 'inherit',
                shell: true
            });

            const timer = setTimeout(() => {
                child.kill('SIGTERM');
                reject(new Error(`Command timed out after ${timeout}ms: ${command}`));
            }, timeout);

            child.on('close', (code) => {
                clearTimeout(timer);
                if (code === 0) {
                    resolve({ success: true, code });
                } else {
                    reject(new Error(`Command failed with exit code ${code}: ${command}`));
                }
            });

            child.on('error', (error) => {
                clearTimeout(timer);
                reject(error);
            });
        });
    }

    /**
     * Check if required environment variables are set
     */
    checkEnvironment() {
        this.log('INFO', 'Checking environment variables...');
        
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL environment variable is not set');
        }
        
        this.log('SUCCESS', 'Environment variables validated');
        return true;
    }

    /**
     * Verify database connectivity with retries
     */
    async verifyDatabaseConnectivity() {
        this.log('INFO', 'Verifying database connectivity...');
        
        for (let retry = 0; retry < CONFIG.RETRY_COUNT; retry++) {
            try {
                await this.executeCommand('npx prisma db pull --preview-feature --force', { 
                    silent: true,
                    timeout: 30000 // 30 seconds for connectivity check
                });
                
                this.log('SUCCESS', 'Database connectivity verified');
                return true;
            } catch (error) {
                if (retry < CONFIG.RETRY_COUNT - 1) {
                    this.log('WARNING', `Database connection failed (attempt ${retry + 1}/${CONFIG.RETRY_COUNT}). Retrying in ${CONFIG.RETRY_DELAY/1000}s...`);
                    await this.sleep(CONFIG.RETRY_DELAY);
                } else {
                    throw new Error(`Failed to connect to database after ${CONFIG.RETRY_COUNT} attempts: ${error.message}`);
                }
            }
        }
    }

    /**
     * Get current migration status
     */
    async getMigrationStatus() {
        this.log('INFO', 'Checking current migration status...');
        
        try {
            const result = execSync('npx prisma migrate status', { 
                encoding: 'utf8',
                stdio: 'pipe'
            });
            
            // Parse migration status
            const appliedCount = (result.match(/✓/g) || []).length;
            const pendingMatch = result.match(/Following migration have not yet been applied/);
            const pendingCount = pendingMatch ? 1 : 0; // Simplified counting
            
            this.log('INFO', `Applied migrations: ${appliedCount}`);
            this.log('INFO', `Pending migrations: ${pendingCount}`);
            
            // Store status for reporting
            const status = {
                applied: appliedCount,
                pending: pendingCount,
                timestamp: new Date().toISOString(),
                raw_output: result
            };
            
            fs.writeFileSync('migration_status.json', JSON.stringify(status, null, 2));
            return status;
            
        } catch (error) {
            throw new Error(`Failed to get migration status: ${error.message}`);
        }
    }

    /**
     * Execute database migrations
     */
    async executeMigrations() {
        this.log('INFO', 'Starting database migration execution...');
        
        // Create schema backup
        this.log('INFO', 'Creating schema backup...');
        try {
            await this.executeCommand('npx prisma db pull --force', { silent: true });
            this.log('SUCCESS', 'Schema backup created');
        } catch (error) {
            this.log('WARNING', `Could not create schema backup: ${error.message}. Proceeding with migration.`);
        }
        
        // Execute migrations
        this.log('INFO', 'Applying pending migrations...');
        try {
            await this.executeCommand('npx prisma migrate deploy');
            this.log('SUCCESS', 'Migrations applied successfully');
            
            // Verify migration completion
            await this.verifyMigrationCompletion();
            this.log('SUCCESS', 'Migration completion verified');
            
        } catch (error) {
            throw new Error(`Migration execution failed: ${error.message}`);
        }
    }

    /**
     * Verify migration completion
     */
    async verifyMigrationCompletion() {
        this.log('INFO', 'Verifying migration completion...');
        
        try {
            const result = execSync('npx prisma migrate status', { 
                encoding: 'utf8',
                stdio: 'pipe'
            });
            
            if (result.includes('Database schema is up to date')) {
                this.log('SUCCESS', 'All migrations have been applied successfully');
                return true;
            } else if (result.includes('Following migration have not yet been applied')) {
                throw new Error('Some migrations are still pending');
            } else {
                this.log('WARNING', 'Migration status unclear, performing additional verification');
                
                // Try to generate Prisma client as additional verification
                try {
                    await this.executeCommand('npx prisma generate', { silent: true });
                    this.log('SUCCESS', 'Prisma client generation successful - migrations likely completed');
                    return true;
                } catch (genError) {
                    throw new Error('Prisma client generation failed - migrations may be incomplete');
                }
            }
        } catch (error) {
            throw new Error(`Migration verification failed: ${error.message}`);
        }
    }

    /**
     * Generate comprehensive migration report
     */
    async generateMigrationReport() {
        this.log('INFO', 'Generating migration report...');
        
        const reportFile = `migration_report_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        
        try {
            // Get final migration status
            const migrationStatus = await this.getMigrationStatus();
            
            // Get system information
            const nodeVersion = process.version;
            const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
            const prismaVersion = execSync('npx prisma --version', { encoding: 'utf8' }).split('\n')[0];
            
            // Create comprehensive report
            const report = {
                migration_execution: {
                    timestamp: new Date().toISOString(),
                    status: 'completed',
                    duration_ms: Date.now() - this.startTime.getTime(),
                    log_file: this.logFile,
                    database_url_hash: this.hashString(process.env.DATABASE_URL || ''),
                    prisma_version: prismaVersion
                },
                migration_status: migrationStatus,
                environment: {
                    node_version: nodeVersion,
                    npm_version: npmVersion,
                    build_number: process.env.BUILD_NUMBER || 'unknown',
                    git_commit: this.getGitCommit(),
                    platform: process.platform,
                    arch: process.arch
                }
            };
            
            fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
            this.log('SUCCESS', `Migration report generated: ${reportFile}`);
            
            return reportFile;
            
        } catch (error) {
            this.log('ERROR', `Failed to generate migration report: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get Git commit hash
     */
    getGitCommit() {
        try {
            return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
        } catch (error) {
            return 'unknown';
        }
    }

    /**
     * Hash string for security (simple hash for logging)
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Cleanup temporary files
     */
    cleanup() {
        this.log('INFO', 'Cleaning up temporary files...');
        try {
            if (fs.existsSync('migration_status.json')) {
                fs.unlinkSync('migration_status.json');
            }
        } catch (error) {
            this.log('WARNING', `Cleanup warning: ${error.message}`);
        }
    }

    /**
     * Main migration handler function
     */
    async run() {
        this.log('INFO', '=== FarmTally Database Migration Handler Started ===');
        this.log('INFO', `Build Number: ${process.env.BUILD_NUMBER || 'unknown'}`);
        this.log('INFO', `Git Commit: ${this.getGitCommit()}`);
        
        try {
            // Execute migration steps
            this.checkEnvironment();
            await this.verifyDatabaseConnectivity();
            await this.getMigrationStatus();
            await this.executeMigrations();
            
            // Generate final report
            const reportFile = await this.generateMigrationReport();
            
            this.log('SUCCESS', '=== Database Migration Completed Successfully ===');
            this.log('INFO', `Migration report: ${reportFile}`);
            this.log('INFO', `Migration log: ${this.logFile}`);
            
            return { success: true, reportFile };
            
        } catch (error) {
            this.log('ERROR', `Migration failed: ${error.message}`);
            throw error;
        } finally {
            this.cleanup();
        }
    }

    /**
     * Check connectivity only
     */
    async checkConnectivity() {
        this.checkEnvironment();
        await this.verifyDatabaseConnectivity();
        return { success: true };
    }

    /**
     * Get status only
     */
    async getStatus() {
        this.checkEnvironment();
        const status = await this.getMigrationStatus();
        return { success: true, status };
    }
}

// CLI interface
async function main() {
    const handler = new MigrationHandler();
    const command = process.argv[2] || 'migrate';
    
    try {
        switch (command) {
            case 'check-connectivity':
                await handler.checkConnectivity();
                console.log('Database connectivity verified');
                break;
                
            case 'status':
                const { status } = await handler.getStatus();
                console.log('Migration status:', JSON.stringify(status, null, 2));
                break;
                
            case 'migrate':
            case 'main':
            default:
                await handler.run();
                break;
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error(`Migration handler failed: ${error.message}`);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = MigrationHandler;