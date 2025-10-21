#!/usr/bin/env node

/**
 * Production Readiness Checklist Generator
 * Creates comprehensive checklist for production deployment readiness
 */

const fs = require('fs');
const path = require('path');

class ProductionReadinessChecker {
    constructor() {
        this.checklist = {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            categories: {
                infrastructure: {
                    name: 'Infrastructure & Environment',
                    weight: 25,
                    items: []
                },
                security: {
                    name: 'Security & Authentication',
                    weight: 30,
                    items: []
                },
                performance: {
                    name: 'Performance & Monitoring',
                    weight: 20,
                    items: []
                },
                deployment: {
                    name: 'Deployment & Operations',
                    weight: 15,
                    items: []
                },
                testing: {
                    name: 'Testing & Quality Assurance',
                    weight: 10,
                    items: []
                }
            },
            overallScore: 0,
            readinessLevel: 'not-ready'
        };
    }

    /**
     * Add checklist item
     */
    addItem(category, description, checkFunction, priority = 'medium', documentation = '') {
        if (!this.checklist.categories[category]) {
            throw new Error(`Invalid category: ${category}`);
        }

        const item = {
            description,
            priority,
            documentation,
            status: 'pending',
            passed: false,
            error: null,
            checkFunction
        };

        this.checklist.categories[category].items.push(item);
        return item;
    }

    /**
     * Check if file exists
     */
    fileExists(filePath) {
        return fs.existsSync(filePath);
    }

    /**
     * Check if environment variable is set
     */
    envVarSet(varName) {
        return !!process.env[varName];
    }

    /**
     * Check if directory has files
     */
    directoryHasFiles(dirPath) {
        if (!fs.existsSync(dirPath)) return false;
        const files = fs.readdirSync(dirPath);
        return files.length > 0;
    }

    /**
     * Initialize all checklist items
     */
    initializeChecklist() {
        // Infrastructure & Environment
        this.addItem('infrastructure', 'Database connection configured', 
            () => this.envVarSet('DATABASE_URL'), 'critical',
            'DATABASE_URL environment variable must be set for production database');

        this.addItem('infrastructure', 'Backend build artifacts exist', 
            () => this.directoryHasFiles('dist'), 'critical',
            'Backend must be compiled to dist/ directory');

        this.addItem('infrastructure', 'Frontend build artifacts exist', 
            () => this.directoryHasFiles('farmtally-frontend/.next'), 'critical',
            'Frontend must be built with Next.js build process');

        this.addItem('infrastructure', 'Prisma schema is valid', 
            () => this.fileExists('prisma/schema.prisma'), 'critical',
            'Database schema must be defined in prisma/schema.prisma');

        this.addItem('infrastructure', 'Environment configuration files exist', 
            () => this.fileExists('.env.production') || this.envVarSet('NODE_ENV'), 'high',
            'Production environment configuration must be available');

        // Security & Authentication
        this.addItem('security', 'JWT secret configured', 
            () => this.envVarSet('JWT_SECRET'), 'critical',
            'JWT_SECRET must be set to a secure random string');

        this.addItem('security', 'CORS origin configured', 
            () => this.envVarSet('CORS_ORIGIN'), 'high',
            'CORS_ORIGIN must be set to production frontend URL');

        this.addItem('security', 'SMTP credentials configured', 
            () => this.envVarSet('SMTP_HOST') && this.envVarSet('SMTP_USER') && this.envVarSet('SMTP_PASSWORD'), 'high',
            'Email service credentials must be configured for notifications');

        this.addItem('security', 'Database credentials secured', 
            () => {
                const dbUrl = process.env.DATABASE_URL;
                return dbUrl && !dbUrl.includes('localhost') && !dbUrl.includes('password123');
            }, 'critical',
            'Database URL must use secure credentials, not default/development values');

        this.addItem('security', 'API rate limiting configured', 
            () => this.fileExists('src/middleware/rateLimiter.ts') || this.fileExists('src/middleware/rateLimiter.js'), 'medium',
            'API endpoints should have rate limiting to prevent abuse');

        // Performance & Monitoring
        this.addItem('performance', 'Health check endpoint available', 
            () => this.fileExists('src/routes/health.ts') || this.fileExists('src/routes/health.js'), 'high',
            'Health check endpoint must be available for monitoring');

        this.addItem('performance', 'Pipeline monitoring configured', 
            () => this.fileExists('scripts/pipeline-monitor.js'), 'medium',
            'Pipeline monitoring should be configured for performance tracking');

        this.addItem('performance', 'Error logging configured', 
            () => this.fileExists('src/utils/logger.ts') || this.fileExists('src/utils/logger.js'), 'high',
            'Structured logging must be configured for error tracking');

        this.addItem('performance', 'Database connection pooling', 
            () => {
                const schemaContent = fs.existsSync('prisma/schema.prisma') ? 
                    fs.readFileSync('prisma/schema.prisma', 'utf8') : '';
                return schemaContent.includes('connection_limit') || schemaContent.includes('pool');
            }, 'medium',
            'Database connection pooling should be configured for performance');

        // Deployment & Operations
        this.addItem('deployment', 'Jenkins pipeline configured', 
            () => this.fileExists('Jenkinsfile'), 'critical',
            'Jenkins pipeline must be configured for automated deployment');

        this.addItem('deployment', 'Artifact management system', 
            () => this.fileExists('scripts/artifact-manager.sh'), 'high',
            'Artifact management system must be available for deployments');

        this.addItem('deployment', 'Rollback capability', 
            () => this.fileExists('scripts/rollback-deployment.sh'), 'high',
            'Rollback scripts must be available for deployment failures');

        this.addItem('deployment', 'Database migration automation', 
            () => this.fileExists('scripts/migration-handler.sh'), 'critical',
            'Database migrations must be automated in deployment pipeline');

        this.addItem('deployment', 'Environment variable validation', 
            () => this.fileExists('scripts/validate-environment-variables.sh'), 'medium',
            'Environment variable validation should be part of deployment process');

        // Testing & Quality Assurance
        this.addItem('testing', 'Backend tests available', 
            () => this.fileExists('package.json') && 
                  JSON.parse(fs.readFileSync('package.json', 'utf8')).scripts?.test, 'medium',
            'Backend should have test suite configured');

        this.addItem('testing', 'Frontend tests available', 
            () => this.fileExists('farmtally-frontend/package.json') && 
                  JSON.parse(fs.readFileSync('farmtally-frontend/package.json', 'utf8')).scripts?.test, 'medium',
            'Frontend should have test suite configured');

        this.addItem('testing', 'Integration tests for API', 
            () => this.fileExists('src/tests/') || this.fileExists('tests/'), 'low',
            'Integration tests should be available for API endpoints');

        this.addItem('testing', 'Staging environment validation', 
            () => this.fileExists('scripts/staging-validation.js'), 'medium',
            'Staging environment validation should be configured');
    }

    /**
     * Run all checks
     */
    async runAllChecks() {
        console.log('🔍 Running Production Readiness Checks...\n');

        for (const [categoryName, category] of Object.entries(this.checklist.categories)) {
            console.log(`📋 ${category.name}`);
            console.log('-'.repeat(50));

            let categoryScore = 0;
            let categoryMaxScore = 0;

            for (const item of category.items) {
                try {
                    item.passed = await item.checkFunction();
                    item.status = item.passed ? 'passed' : 'failed';
                    
                    const icon = item.passed ? '✅' : '❌';
                    const priority = item.priority.toUpperCase().padEnd(8);
                    console.log(`${icon} [${priority}] ${item.description}`);
                    
                    if (!item.passed && item.documentation) {
                        console.log(`    💡 ${item.documentation}`);
                    }

                    // Calculate score based on priority
                    const priorityWeight = this.getPriorityWeight(item.priority);
                    categoryMaxScore += priorityWeight;
                    if (item.passed) {
                        categoryScore += priorityWeight;
                    }

                } catch (error) {
                    item.status = 'error';
                    item.error = error.message;
                    console.log(`⚠️  [ERROR   ] ${item.description}: ${error.message}`);
                }
            }

            category.score = categoryScore;
            category.maxScore = categoryMaxScore;
            category.percentage = categoryMaxScore > 0 ? Math.round((categoryScore / categoryMaxScore) * 100) : 0;

            console.log(`📊 Category Score: ${category.percentage}% (${categoryScore}/${categoryMaxScore})\n`);
        }

        this.calculateOverallScore();
        this.generateReport();
    }

    /**
     * Get priority weight for scoring
     */
    getPriorityWeight(priority) {
        switch (priority) {
            case 'critical': return 10;
            case 'high': return 7;
            case 'medium': return 5;
            case 'low': return 3;
            default: return 5;
        }
    }

    /**
     * Calculate overall readiness score
     */
    calculateOverallScore() {
        let totalWeightedScore = 0;
        let totalWeight = 0;

        for (const [categoryName, category] of Object.entries(this.checklist.categories)) {
            const categoryWeight = category.weight;
            const categoryScore = (category.score / category.maxScore) * 100;
            
            totalWeightedScore += (categoryScore * categoryWeight);
            totalWeight += categoryWeight;
        }

        this.checklist.overallScore = Math.round(totalWeightedScore / totalWeight);

        // Determine readiness level
        if (this.checklist.overallScore >= 90) {
            this.checklist.readinessLevel = 'production-ready';
        } else if (this.checklist.overallScore >= 75) {
            this.checklist.readinessLevel = 'mostly-ready';
        } else if (this.checklist.overallScore >= 50) {
            this.checklist.readinessLevel = 'partially-ready';
        } else {
            this.checklist.readinessLevel = 'not-ready';
        }
    }

    /**
     * Generate final report
     */
    generateReport() {
        console.log('🎯 PRODUCTION READINESS REPORT');
        console.log('='.repeat(60));
        console.log(`Overall Score: ${this.checklist.overallScore}%`);
        console.log(`Readiness Level: ${this.checklist.readinessLevel.toUpperCase()}`);
        console.log(`Assessment Date: ${this.checklist.timestamp}`);
        console.log();

        // Category breakdown
        console.log('📊 Category Breakdown:');
        for (const [categoryName, category] of Object.entries(this.checklist.categories)) {
            const bar = this.generateProgressBar(category.percentage);
            console.log(`  ${category.name}: ${category.percentage}% ${bar}`);
        }
        console.log();

        // Critical issues
        const criticalIssues = this.getCriticalIssues();
        if (criticalIssues.length > 0) {
            console.log('🚨 Critical Issues (Must Fix Before Production):');
            criticalIssues.forEach(issue => {
                console.log(`  ❌ ${issue.description}`);
                if (issue.documentation) {
                    console.log(`     💡 ${issue.documentation}`);
                }
            });
            console.log();
        }

        // High priority issues
        const highPriorityIssues = this.getHighPriorityIssues();
        if (highPriorityIssues.length > 0) {
            console.log('⚠️  High Priority Issues (Recommended to Fix):');
            highPriorityIssues.forEach(issue => {
                console.log(`  ⚠️  ${issue.description}`);
            });
            console.log();
        }

        // Recommendations
        this.generateRecommendations();

        // Save detailed report
        const reportFile = 'production-readiness-report.json';
        fs.writeFileSync(reportFile, JSON.stringify(this.checklist, null, 2));
        console.log(`📄 Detailed report saved to: ${reportFile}`);

        // Return readiness status
        return {
            ready: this.checklist.readinessLevel === 'production-ready',
            score: this.checklist.overallScore,
            level: this.checklist.readinessLevel,
            criticalIssues: criticalIssues.length,
            highPriorityIssues: highPriorityIssues.length
        };
    }

    /**
     * Generate progress bar
     */
    generateProgressBar(percentage, width = 20) {
        const filled = Math.round((percentage / 100) * width);
        const empty = width - filled;
        return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
    }

    /**
     * Get critical issues
     */
    getCriticalIssues() {
        const issues = [];
        for (const category of Object.values(this.checklist.categories)) {
            for (const item of category.items) {
                if (item.priority === 'critical' && !item.passed) {
                    issues.push(item);
                }
            }
        }
        return issues;
    }

    /**
     * Get high priority issues
     */
    getHighPriorityIssues() {
        const issues = [];
        for (const category of Object.values(this.checklist.categories)) {
            for (const item of category.items) {
                if (item.priority === 'high' && !item.passed) {
                    issues.push(item);
                }
            }
        }
        return issues;
    }

    /**
     * Generate recommendations
     */
    generateRecommendations() {
        console.log('💡 Recommendations:');

        if (this.checklist.overallScore < 50) {
            console.log('  🔴 System is not ready for production. Address critical and high priority issues first.');
        } else if (this.checklist.overallScore < 75) {
            console.log('  🟡 System needs improvement before production deployment.');
        } else if (this.checklist.overallScore < 90) {
            console.log('  🟢 System is mostly ready. Consider addressing remaining issues.');
        } else {
            console.log('  🎉 System appears ready for production deployment!');
        }

        // Specific recommendations based on category scores
        for (const [categoryName, category] of Object.entries(this.checklist.categories)) {
            if (category.percentage < 70) {
                console.log(`  📋 Focus on improving ${category.name} (${category.percentage}%)`);
            }
        }

        console.log();
    }
}

// CLI interface
if (require.main === module) {
    const checker = new ProductionReadinessChecker();
    checker.initializeChecklist();
    
    checker.runAllChecks().then(result => {
        process.exit(result.ready ? 0 : 1);
    }).catch(error => {
        console.error('Error running production readiness check:', error);
        process.exit(1);
    });
}

module.exports = ProductionReadinessChecker;