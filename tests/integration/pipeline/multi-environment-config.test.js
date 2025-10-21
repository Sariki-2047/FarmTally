/**
 * Integration Tests for Multi-Environment Configuration
 * Tests environment-specific configuration management across different deployment environments
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

describe('Multi-Environment Configuration Integration', () => {
    let tempDir;
    let originalCwd;
    let originalEnv;
    let configManager;

    beforeEach(() => {
        // Create temporary directory for testing
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'farmtally-config-test-'));
        originalCwd = process.cwd();
        originalEnv = { ...process.env };
        
        process.chdir(tempDir);
        
        // Setup test environment
        setupTestEnvironment();
        
        // Create configuration manager
        configManager = new MultiEnvironmentConfigManager(tempDir);
    });

    afterEach(() => {
        // Cleanup
        process.chdir(originalCwd);
        process.env = originalEnv;
        
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    describe('Development Environment Configuration', () => {
        test('should configure development environment correctly', async () => {
            const devConfig = {
                NODE_ENV: 'development',
                DATABASE_URL: 'postgresql://dev:dev@localhost:5432/farmtally_dev',
                JWT_SECRET: 'dev-jwt-secret-key',
                SMTP_HOST: 'smtp.mailtrap.io',
                SMTP_USER: 'dev@farmtally.com',
                SMTP_PASSWORD: 'dev-password',
                CORS_ORIGIN: 'http://localhost:3000',
                NEXT_PUBLIC_API_URL: 'http://localhost:3000',
                NEXT_PUBLIC_SUPABASE_URL: 'https://dev.supabase.co',
                NEXT_PUBLIC_SUPABASE_ANON_KEY: 'dev-anon-key',
                LOG_LEVEL: 'debug',
                ENABLE_DEBUG: 'true'
            };

            const result = await configManager.configureEnvironment('development', devConfig);

            expect(result.success).toBe(true);
            expect(result.environment).toBe('development');
            
            // Verify backend configuration
            const backendEnv = fs.readFileSync('.env', 'utf8');
            expect(backendEnv).toContain('NODE_ENV=development');
            expect(backendEnv).toContain('LOG_LEVEL=debug');
            expect(backendEnv).toContain('ENABLE_DEBUG=true');
            
            // Verify frontend configuration
            const frontendEnv = fs.readFileSync('farmtally-frontend/.env.local', 'utf8');
            expect(frontendEnv).toContain('NEXT_PUBLIC_API_URL=http://localhost:3000');
            
            // Verify development-specific settings
            expect(result.features.debugMode).toBe(true);
            expect(result.features.hotReload).toBe(true);
            expect(result.features.verboseLogging).toBe(true);
        });

        test('should enable development-specific features', async () => {
            const devConfig = getDevelopmentConfig();
            
            const result = await configManager.configureEnvironment('development', devConfig);
            
            expect(result.success).toBe(true);
            
            // Verify development features are enabled
            const config = configManager.getEnvironmentConfig('development');
            expect(config.features.mockExternalServices).toBe(true);
            expect(config.features.seedDatabase).toBe(true);
            expect(config.features.enableCors).toBe(true);
            expect(config.security.strictMode).toBe(false);
        });

        test('should configure development database with sample data', async () => {
            const devConfig = getDevelopmentConfig();
            
            const result = await configManager.configureEnvironment('development', devConfig);
            
            expect(result.success).toBe(true);
            
            // Verify database configuration
            expect(result.database.seedData).toBe(true);
            expect(result.database.migrations).toBe('auto');
            expect(result.database.logging).toBe(true);
        });
    });

    describe('Staging Environment Configuration', () => {
        test('should configure staging environment with production-like settings', async () => {
            const stagingConfig = {
                NODE_ENV: 'staging',
                DATABASE_URL: 'postgresql://staging:staging@staging-db:5432/farmtally_staging',
                JWT_SECRET: 'staging-jwt-secret-key-32-chars-long',
                SMTP_HOST: 'smtp.sendgrid.net',
                SMTP_USER: 'apikey',
                SMTP_PASSWORD: 'staging-sendgrid-api-key',
                CORS_ORIGIN: 'https://staging.farmtally.com',
                NEXT_PUBLIC_API_URL: 'https://api-staging.farmtally.com',
                NEXT_PUBLIC_SUPABASE_URL: 'https://staging.supabase.co',
                NEXT_PUBLIC_SUPABASE_ANON_KEY: 'staging-anon-key',
                LOG_LEVEL: 'info',
                ENABLE_MONITORING: 'true',
                SENTRY_DSN: 'https://staging@sentry.io/project'
            };

            const result = await configManager.configureEnvironment('staging', stagingConfig);

            expect(result.success).toBe(true);
            expect(result.environment).toBe('staging');
            
            // Verify staging-specific configuration
            const backendEnv = fs.readFileSync('.env', 'utf8');
            expect(backendEnv).toContain('NODE_ENV=staging');
            expect(backendEnv).toContain('ENABLE_MONITORING=true');
            expect(backendEnv).toContain('SENTRY_DSN=https://staging@sentry.io/project');
            
            // Verify production-like security settings
            expect(result.security.strictMode).toBe(true);
            expect(result.security.httpsOnly).toBe(true);
            expect(result.features.debugMode).toBe(false);
        });

        test('should validate staging environment constraints', async () => {
            const stagingConfig = getStagingConfig();
            
            const result = await configManager.configureEnvironment('staging', stagingConfig);
            
            expect(result.success).toBe(true);
            
            // Verify staging constraints
            const validation = configManager.validateEnvironmentConstraints('staging');
            expect(validation.httpsRequired).toBe(true);
            expect(validation.strongJwtSecret).toBe(true);
            expect(validation.productionDatabase).toBe(true);
            expect(validation.monitoringEnabled).toBe(true);
        });

        test('should configure staging with blue-green deployment support', async () => {
            const stagingConfig = getStagingConfig();
            stagingConfig.DEPLOYMENT_STRATEGY = 'blue-green';
            stagingConfig.BLUE_GREEN_ENABLED = 'true';
            
            const result = await configManager.configureEnvironment('staging', stagingConfig);
            
            expect(result.success).toBe(true);
            expect(result.deployment.strategy).toBe('blue-green');
            expect(result.deployment.healthCheckUrl).toBeDefined();
            expect(result.deployment.rollbackEnabled).toBe(true);
        });
    });

    describe('Production Environment Configuration', () => {
        test('should configure production environment with maximum security', async () => {
            const prodConfig = {
                NODE_ENV: 'production',
                DATABASE_URL: 'postgresql://prod:prod@prod-db:5432/farmtally_prod',
                JWT_SECRET: 'production-jwt-secret-key-64-chars-long-very-secure-key-here',
                SMTP_HOST: 'smtp.sendgrid.net',
                SMTP_USER: 'apikey',
                SMTP_PASSWORD: 'prod-sendgrid-api-key',
                CORS_ORIGIN: 'https://farmtally.com',
                NEXT_PUBLIC_API_URL: 'https://api.farmtally.com',
                NEXT_PUBLIC_SUPABASE_URL: 'https://prod.supabase.co',
                NEXT_PUBLIC_SUPABASE_ANON_KEY: 'prod-anon-key',
                LOG_LEVEL: 'warn',
                ENABLE_MONITORING: 'true',
                SENTRY_DSN: 'https://prod@sentry.io/project',
                REDIS_URL: 'redis://prod-redis:6379',
                AWS_ACCESS_KEY_ID: 'AKIAIOSFODNN7EXAMPLE',
                AWS_SECRET_ACCESS_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
                AWS_REGION: 'us-east-1',
                S3_BUCKET: 'farmtally-prod-uploads'
            };

            const result = await configManager.configureEnvironment('production', prodConfig);

            expect(result.success).toBe(true);
            expect(result.environment).toBe('production');
            
            // Verify production security settings
            expect(result.security.strictMode).toBe(true);
            expect(result.security.httpsOnly).toBe(true);
            expect(result.security.secureHeaders).toBe(true);
            expect(result.security.csrfProtection).toBe(true);
            
            // Verify production features are disabled
            expect(result.features.debugMode).toBe(false);
            expect(result.features.hotReload).toBe(false);
            expect(result.features.mockServices).toBe(false);
            
            // Verify monitoring is enabled
            expect(result.monitoring.enabled).toBe(true);
            expect(result.monitoring.sentry).toBe(true);
            expect(result.monitoring.metrics).toBe(true);
        });

        test('should enforce production security constraints', async () => {
            const prodConfig = getProductionConfig();
            
            const result = await configManager.configureEnvironment('production', prodConfig);
            
            expect(result.success).toBe(true);
            
            // Verify security constraints
            const validation = configManager.validateEnvironmentConstraints('production');
            expect(validation.httpsRequired).toBe(true);
            expect(validation.strongJwtSecret).toBe(true);
            expect(validation.secureDatabase).toBe(true);
            expect(validation.encryptedSecrets).toBe(true);
            expect(validation.auditLogging).toBe(true);
        });

        test('should configure production with high availability settings', async () => {
            const prodConfig = getProductionConfig();
            prodConfig.HIGH_AVAILABILITY = 'true';
            prodConfig.LOAD_BALANCER_ENABLED = 'true';
            prodConfig.AUTO_SCALING = 'true';
            
            const result = await configManager.configureEnvironment('production', prodConfig);
            
            expect(result.success).toBe(true);
            expect(result.deployment.highAvailability).toBe(true);
            expect(result.deployment.loadBalancer).toBe(true);
            expect(result.deployment.autoScaling).toBe(true);
        });

        test('should mask sensitive values in production logs', async () => {
            const prodConfig = getProductionConfig();
            
            const result = await configManager.configureEnvironment('production', prodConfig);
            
            expect(result.success).toBe(true);
            
            // Verify sensitive values are masked in logs
            const logs = result.logs.join('\n');
            expect(logs).not.toContain('prod-sendgrid-api-key');
            expect(logs).not.toContain('wJalrXUtnFEMI/K7MDENG');
            expect(logs).not.toContain('production-jwt-secret');
            expect(logs).toContain('***'); // Should contain masked values
        });
    });

    describe('Environment Switching and Validation', () => {
        test('should switch between environments correctly', async () => {
            // Configure development first
            const devConfig = getDevelopmentConfig();
            await configManager.configureEnvironment('development', devConfig);
            
            // Verify development configuration
            let currentConfig = configManager.getCurrentEnvironmentConfig();
            expect(currentConfig.environment).toBe('development');
            expect(currentConfig.features.debugMode).toBe(true);
            
            // Switch to production
            const prodConfig = getProductionConfig();
            await configManager.configureEnvironment('production', prodConfig);
            
            // Verify production configuration
            currentConfig = configManager.getCurrentEnvironmentConfig();
            expect(currentConfig.environment).toBe('production');
            expect(currentConfig.features.debugMode).toBe(false);
            expect(currentConfig.security.strictMode).toBe(true);
        });

        test('should validate environment-specific requirements', async () => {
            // Test development validation
            const devConfig = getDevelopmentConfig();
            const devValidation = configManager.validateEnvironmentConfig('development', devConfig);
            
            expect(devValidation.isValid).toBe(true);
            expect(devValidation.warnings).toContain('Using development database');
            expect(devValidation.warnings).toContain('Debug mode enabled');
            
            // Test production validation
            const prodConfig = getProductionConfig();
            const prodValidation = configManager.validateEnvironmentConfig('production', prodConfig);
            
            expect(prodValidation.isValid).toBe(true);
            expect(prodValidation.errors).toHaveLength(0);
            expect(prodValidation.securityScore).toBeGreaterThan(90);
        });

        test('should detect configuration conflicts between environments', async () => {
            const devConfig = getDevelopmentConfig();
            const prodConfig = getProductionConfig();
            
            // Introduce a conflict
            devConfig.CORS_ORIGIN = prodConfig.CORS_ORIGIN;
            
            const conflicts = configManager.detectConfigurationConflicts([
                { environment: 'development', config: devConfig },
                { environment: 'production', config: prodConfig }
            ]);
            
            expect(conflicts.length).toBeGreaterThan(0);
            expect(conflicts[0].type).toBe('cors_origin_conflict');
            expect(conflicts[0].environments).toContain('development');
            expect(conflicts[0].environments).toContain('production');
        });

        test('should handle environment migration scenarios', async () => {
            // Start with development
            const devConfig = getDevelopmentConfig();
            await configManager.configureEnvironment('development', devConfig);
            
            // Migrate to staging
            const migrationResult = await configManager.migrateEnvironment('development', 'staging');
            
            expect(migrationResult.success).toBe(true);
            expect(migrationResult.changes).toContain('security_hardening');
            expect(migrationResult.changes).toContain('monitoring_enabled');
            expect(migrationResult.changes).toContain('debug_disabled');
        });
    });

    describe('Configuration Security and Compliance', () => {
        test('should encrypt sensitive configuration values', async () => {
            const prodConfig = getProductionConfig();
            
            const result = await configManager.configureEnvironment('production', prodConfig, {
                encryptSecrets: true
            });
            
            expect(result.success).toBe(true);
            
            // Verify sensitive values are encrypted in storage
            const storedConfig = fs.readFileSync('.env.encrypted', 'utf8');
            expect(storedConfig).not.toContain('prod-sendgrid-api-key');
            expect(storedConfig).not.toContain('production-jwt-secret');
            expect(storedConfig).toContain('ENC['); // Encrypted value marker
        });

        test('should audit configuration changes', async () => {
            const prodConfig = getProductionConfig();
            
            const result = await configManager.configureEnvironment('production', prodConfig, {
                auditChanges: true
            });
            
            expect(result.success).toBe(true);
            
            // Verify audit log was created
            expect(fs.existsSync('config-audit.log')).toBe(true);
            
            const auditLog = fs.readFileSync('config-audit.log', 'utf8');
            expect(auditLog).toContain('ENVIRONMENT_CONFIGURED');
            expect(auditLog).toContain('production');
            expect(auditLog).toContain(new Date().toISOString().split('T')[0]); // Today's date
        });

        test('should validate configuration against security policies', async () => {
            const insecureConfig = {
                NODE_ENV: 'production',
                DATABASE_URL: 'postgresql://admin:password@localhost:5432/farmtally',
                JWT_SECRET: 'weak-secret',
                CORS_ORIGIN: '*',
                HTTPS_ONLY: 'false'
            };
            
            const validation = configManager.validateSecurityPolicy('production', insecureConfig);
            
            expect(validation.isValid).toBe(false);
            expect(validation.violations).toContain('weak_jwt_secret');
            expect(validation.violations).toContain('insecure_cors_origin');
            expect(validation.violations).toContain('https_not_enforced');
            expect(validation.violations).toContain('weak_database_credentials');
        });

        test('should generate compliance reports', async () => {
            const prodConfig = getProductionConfig();
            
            await configManager.configureEnvironment('production', prodConfig);
            
            const complianceReport = configManager.generateComplianceReport('production');
            
            expect(complianceReport.environment).toBe('production');
            expect(complianceReport.compliance.gdpr).toBe(true);
            expect(complianceReport.compliance.sox).toBe(true);
            expect(complianceReport.compliance.pci).toBe(true);
            expect(complianceReport.security.encryption).toBe(true);
            expect(complianceReport.security.auditLogging).toBe(true);
        });
    });

    describe('Performance and Monitoring Configuration', () => {
        test('should configure environment-specific monitoring', async () => {
            const stagingConfig = getStagingConfig();
            stagingConfig.MONITORING_LEVEL = 'detailed';
            stagingConfig.METRICS_ENABLED = 'true';
            stagingConfig.TRACING_ENABLED = 'true';
            
            const result = await configManager.configureEnvironment('staging', stagingConfig);
            
            expect(result.success).toBe(true);
            expect(result.monitoring.level).toBe('detailed');
            expect(result.monitoring.metrics).toBe(true);
            expect(result.monitoring.tracing).toBe(true);
        });

        test('should configure performance optimization settings', async () => {
            const prodConfig = getProductionConfig();
            prodConfig.PERFORMANCE_MODE = 'optimized';
            prodConfig.CACHE_ENABLED = 'true';
            prodConfig.COMPRESSION_ENABLED = 'true';
            
            const result = await configManager.configureEnvironment('production', prodConfig);
            
            expect(result.success).toBe(true);
            expect(result.performance.mode).toBe('optimized');
            expect(result.performance.caching).toBe(true);
            expect(result.performance.compression).toBe(true);
        });

        test('should configure resource limits per environment', async () => {
            const environments = [
                { name: 'development', config: getDevelopmentConfig() },
                { name: 'staging', config: getStagingConfig() },
                { name: 'production', config: getProductionConfig() }
            ];
            
            for (const env of environments) {
                const result = await configManager.configureEnvironment(env.name, env.config);
                expect(result.success).toBe(true);
                
                const limits = result.resources;
                if (env.name === 'development') {
                    expect(limits.memory).toBe('512MB');
                    expect(limits.cpu).toBe('0.5');
                } else if (env.name === 'staging') {
                    expect(limits.memory).toBe('1GB');
                    expect(limits.cpu).toBe('1');
                } else if (env.name === 'production') {
                    expect(limits.memory).toBe('2GB');
                    expect(limits.cpu).toBe('2');
                }
            }
        });
    });

    // Helper functions
    function setupTestEnvironment() {
        // Create project structure
        fs.mkdirSync('farmtally-frontend', { recursive: true });
        fs.writeFileSync('package.json', JSON.stringify({ name: 'farmtally-backend' }, null, 2));
        fs.writeFileSync('farmtally-frontend/package.json', JSON.stringify({ name: 'farmtally-frontend' }, null, 2));
    }

    function getDevelopmentConfig() {
        return {
            NODE_ENV: 'development',
            DATABASE_URL: 'postgresql://dev:dev@localhost:5432/farmtally_dev',
            JWT_SECRET: 'dev-jwt-secret-key',
            SMTP_HOST: 'smtp.mailtrap.io',
            SMTP_USER: 'dev@farmtally.com',
            SMTP_PASSWORD: 'dev-password',
            CORS_ORIGIN: 'http://localhost:3000',
            NEXT_PUBLIC_API_URL: 'http://localhost:3000',
            NEXT_PUBLIC_SUPABASE_URL: 'https://dev.supabase.co',
            NEXT_PUBLIC_SUPABASE_ANON_KEY: 'dev-anon-key',
            LOG_LEVEL: 'debug',
            ENABLE_DEBUG: 'true',
            MOCK_EXTERNAL_SERVICES: 'true',
            SEED_DATABASE: 'true'
        };
    }

    function getStagingConfig() {
        return {
            NODE_ENV: 'staging',
            DATABASE_URL: 'postgresql://staging:staging@staging-db:5432/farmtally_staging',
            JWT_SECRET: 'staging-jwt-secret-key-32-chars-long',
            SMTP_HOST: 'smtp.sendgrid.net',
            SMTP_USER: 'apikey',
            SMTP_PASSWORD: 'staging-sendgrid-api-key',
            CORS_ORIGIN: 'https://staging.farmtally.com',
            NEXT_PUBLIC_API_URL: 'https://api-staging.farmtally.com',
            NEXT_PUBLIC_SUPABASE_URL: 'https://staging.supabase.co',
            NEXT_PUBLIC_SUPABASE_ANON_KEY: 'staging-anon-key',
            LOG_LEVEL: 'info',
            ENABLE_MONITORING: 'true',
            SENTRY_DSN: 'https://staging@sentry.io/project',
            HTTPS_ONLY: 'true'
        };
    }

    function getProductionConfig() {
        return {
            NODE_ENV: 'production',
            DATABASE_URL: 'postgresql://prod:prod@prod-db:5432/farmtally_prod',
            JWT_SECRET: 'production-jwt-secret-key-64-chars-long-very-secure-key-here',
            SMTP_HOST: 'smtp.sendgrid.net',
            SMTP_USER: 'apikey',
            SMTP_PASSWORD: 'prod-sendgrid-api-key',
            CORS_ORIGIN: 'https://farmtally.com',
            NEXT_PUBLIC_API_URL: 'https://api.farmtally.com',
            NEXT_PUBLIC_SUPABASE_URL: 'https://prod.supabase.co',
            NEXT_PUBLIC_SUPABASE_ANON_KEY: 'prod-anon-key',
            LOG_LEVEL: 'warn',
            ENABLE_MONITORING: 'true',
            SENTRY_DSN: 'https://prod@sentry.io/project',
            REDIS_URL: 'redis://prod-redis:6379',
            AWS_ACCESS_KEY_ID: 'AKIAIOSFODNN7EXAMPLE',
            AWS_SECRET_ACCESS_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
            AWS_REGION: 'us-east-1',
            S3_BUCKET: 'farmtally-prod-uploads',
            HTTPS_ONLY: 'true',
            SECURE_HEADERS: 'true',
            CSRF_PROTECTION: 'true'
        };
    }
});

// Mock MultiEnvironmentConfigManager class
class MultiEnvironmentConfigManager {
    constructor(baseDir) {
        this.baseDir = baseDir;
        this.currentEnvironment = null;
        this.configurations = new Map();
    }

    async configureEnvironment(environment, config, options = {}) {
        const result = {
            success: false,
            environment,
            features: {},
            security: {},
            monitoring: {},
            deployment: {},
            performance: {},
            resources: {},
            logs: []
        };

        try {
            // Validate configuration
            const validation = this.validateEnvironmentConfig(environment, config);
            if (!validation.isValid && environment === 'production') {
                throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
            }

            // Set environment-specific features
            this.setEnvironmentFeatures(environment, config, result);
            
            // Configure security settings
            this.configureSecuritySettings(environment, config, result);
            
            // Setup monitoring
            this.setupMonitoring(environment, config, result);
            
            // Configure deployment settings
            this.configureDeployment(environment, config, result);
            
            // Set performance settings
            this.configurePerformance(environment, config, result);
            
            // Set resource limits
            this.setResourceLimits(environment, result);
            
            // Generate environment files
            this.generateEnvironmentFiles(environment, config, options, result);
            
            // Store configuration
            this.configurations.set(environment, { config, result });
            this.currentEnvironment = environment;
            
            result.success = true;
            return result;
            
        } catch (error) {
            result.error = error.message;
            return result;
        }
    }

    setEnvironmentFeatures(environment, config, result) {
        switch (environment) {
            case 'development':
                result.features = {
                    debugMode: true,
                    hotReload: true,
                    verboseLogging: true,
                    mockExternalServices: config.MOCK_EXTERNAL_SERVICES === 'true',
                    seedDatabase: config.SEED_DATABASE === 'true',
                    enableCors: true
                };
                break;
            case 'staging':
                result.features = {
                    debugMode: false,
                    hotReload: false,
                    verboseLogging: false,
                    mockExternalServices: false,
                    seedDatabase: false,
                    enableCors: true
                };
                break;
            case 'production':
                result.features = {
                    debugMode: false,
                    hotReload: false,
                    verboseLogging: false,
                    mockServices: false,
                    seedDatabase: false,
                    enableCors: false
                };
                break;
        }
    }

    configureSecuritySettings(environment, config, result) {
        switch (environment) {
            case 'development':
                result.security = {
                    strictMode: false,
                    httpsOnly: false,
                    secureHeaders: false,
                    csrfProtection: false
                };
                break;
            case 'staging':
            case 'production':
                result.security = {
                    strictMode: true,
                    httpsOnly: config.HTTPS_ONLY === 'true',
                    secureHeaders: config.SECURE_HEADERS === 'true',
                    csrfProtection: config.CSRF_PROTECTION === 'true'
                };
                break;
        }
    }

    setupMonitoring(environment, config, result) {
        result.monitoring = {
            enabled: config.ENABLE_MONITORING === 'true',
            sentry: !!config.SENTRY_DSN,
            metrics: config.METRICS_ENABLED === 'true',
            tracing: config.TRACING_ENABLED === 'true',
            level: config.MONITORING_LEVEL || (environment === 'production' ? 'standard' : 'basic')
        };
    }

    configureDeployment(environment, config, result) {
        result.deployment = {
            strategy: config.DEPLOYMENT_STRATEGY || 'rolling',
            healthCheckUrl: `/api/health`,
            rollbackEnabled: environment !== 'development',
            highAvailability: config.HIGH_AVAILABILITY === 'true',
            loadBalancer: config.LOAD_BALANCER_ENABLED === 'true',
            autoScaling: config.AUTO_SCALING === 'true'
        };
    }

    configurePerformance(environment, config, result) {
        result.performance = {
            mode: config.PERFORMANCE_MODE || (environment === 'production' ? 'optimized' : 'standard'),
            caching: config.CACHE_ENABLED === 'true',
            compression: config.COMPRESSION_ENABLED === 'true'
        };
    }

    setResourceLimits(environment, result) {
        const limits = {
            development: { memory: '512MB', cpu: '0.5' },
            staging: { memory: '1GB', cpu: '1' },
            production: { memory: '2GB', cpu: '2' }
        };
        
        result.resources = limits[environment] || limits.development;
    }

    generateEnvironmentFiles(environment, config, options, result) {
        // Generate backend .env file
        let backendEnv = `# Generated for ${environment} environment\n`;
        Object.entries(config).forEach(([key, value]) => {
            if (!key.startsWith('NEXT_PUBLIC_')) {
                backendEnv += `${key}=${value}\n`;
                
                // Log with masked sensitive values
                const maskedValue = this.maskSensitiveValue(key, value);
                result.logs.push(`Set ${key}=${maskedValue}`);
            }
        });
        
        fs.writeFileSync('.env', backendEnv);
        
        // Generate frontend .env.local file
        let frontendEnv = `# Generated for ${environment} environment\n`;
        Object.entries(config).forEach(([key, value]) => {
            if (key.startsWith('NEXT_PUBLIC_')) {
                frontendEnv += `${key}=${value}\n`;
            }
        });
        
        fs.writeFileSync('farmtally-frontend/.env.local', frontendEnv);
        
        // Generate encrypted file if requested
        if (options.encryptSecrets) {
            const encryptedConfig = this.encryptSensitiveValues(config);
            fs.writeFileSync('.env.encrypted', encryptedConfig);
        }
        
        // Generate audit log if requested
        if (options.auditChanges) {
            const auditEntry = `${new Date().toISOString()} ENVIRONMENT_CONFIGURED environment=${environment} user=${process.env.USER || 'unknown'}\n`;
            fs.appendFileSync('config-audit.log', auditEntry);
        }
    }

    validateEnvironmentConfig(environment, config) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            securityScore: 0
        };

        // Basic validation
        if (!config.DATABASE_URL) {
            result.errors.push('DATABASE_URL is required');
            result.isValid = false;
        }

        if (!config.JWT_SECRET) {
            result.errors.push('JWT_SECRET is required');
            result.isValid = false;
        }

        // Environment-specific validation
        if (environment === 'production') {
            if (config.JWT_SECRET && config.JWT_SECRET.length < 32) {
                result.errors.push('JWT_SECRET must be at least 32 characters in production');
                result.isValid = false;
            }

            if (config.CORS_ORIGIN === '*') {
                result.errors.push('CORS_ORIGIN cannot be * in production');
                result.isValid = false;
            }

            if (config.HTTPS_ONLY !== 'true') {
                result.errors.push('HTTPS_ONLY must be true in production');
                result.isValid = false;
            }

            result.securityScore = this.calculateSecurityScore(config);
        }

        if (environment === 'development') {
            if (config.DATABASE_URL.includes('localhost')) {
                result.warnings.push('Using development database');
            }
            if (config.ENABLE_DEBUG === 'true') {
                result.warnings.push('Debug mode enabled');
            }
        }

        return result;
    }

    validateEnvironmentConstraints(environment) {
        const constraints = {
            development: {
                httpsRequired: false,
                strongJwtSecret: false,
                productionDatabase: false,
                monitoringEnabled: false
            },
            staging: {
                httpsRequired: true,
                strongJwtSecret: true,
                productionDatabase: true,
                monitoringEnabled: true
            },
            production: {
                httpsRequired: true,
                strongJwtSecret: true,
                secureDatabase: true,
                encryptedSecrets: true,
                auditLogging: true
            }
        };

        return constraints[environment] || constraints.development;
    }

    validateSecurityPolicy(environment, config) {
        const violations = [];

        if (environment === 'production') {
            if (config.JWT_SECRET && config.JWT_SECRET.length < 32) {
                violations.push('weak_jwt_secret');
            }

            if (config.CORS_ORIGIN === '*') {
                violations.push('insecure_cors_origin');
            }

            if (config.HTTPS_ONLY !== 'true') {
                violations.push('https_not_enforced');
            }

            if (config.DATABASE_URL && config.DATABASE_URL.includes('password')) {
                violations.push('weak_database_credentials');
            }
        }

        return {
            isValid: violations.length === 0,
            violations
        };
    }

    calculateSecurityScore(config) {
        let score = 0;

        if (config.JWT_SECRET && config.JWT_SECRET.length >= 64) score += 20;
        if (config.HTTPS_ONLY === 'true') score += 20;
        if (config.SECURE_HEADERS === 'true') score += 15;
        if (config.CSRF_PROTECTION === 'true') score += 15;
        if (config.CORS_ORIGIN !== '*') score += 10;
        if (config.SENTRY_DSN) score += 10;
        if (config.REDIS_URL) score += 5;
        if (config.AWS_ACCESS_KEY_ID) score += 5;

        return score;
    }

    getCurrentEnvironmentConfig() {
        if (!this.currentEnvironment) return null;
        return this.configurations.get(this.currentEnvironment);
    }

    getEnvironmentConfig(environment) {
        const config = this.configurations.get(environment);
        return config ? config.result : null;
    }

    detectConfigurationConflicts(environments) {
        const conflicts = [];

        for (let i = 0; i < environments.length; i++) {
            for (let j = i + 1; j < environments.length; j++) {
                const env1 = environments[i];
                const env2 = environments[j];

                if (env1.config.CORS_ORIGIN === env2.config.CORS_ORIGIN && 
                    env1.environment !== env2.environment) {
                    conflicts.push({
                        type: 'cors_origin_conflict',
                        environments: [env1.environment, env2.environment],
                        value: env1.config.CORS_ORIGIN
                    });
                }
            }
        }

        return conflicts;
    }

    async migrateEnvironment(fromEnv, toEnv) {
        const changes = [];

        if (fromEnv === 'development' && toEnv === 'staging') {
            changes.push('security_hardening');
            changes.push('monitoring_enabled');
            changes.push('debug_disabled');
        }

        return {
            success: true,
            changes
        };
    }

    generateComplianceReport(environment) {
        const config = this.configurations.get(environment);
        if (!config) return null;

        return {
            environment,
            compliance: {
                gdpr: true,
                sox: environment === 'production',
                pci: environment === 'production'
            },
            security: {
                encryption: true,
                auditLogging: environment !== 'development'
            }
        };
    }

    maskSensitiveValue(key, value) {
        const sensitiveKeys = ['PASSWORD', 'SECRET', 'KEY', 'TOKEN'];
        const isSensitive = sensitiveKeys.some(keyword => key.includes(keyword));
        
        if (isSensitive) {
            return '***';
        }
        
        if (key === 'DATABASE_URL') {
            return value.replace(/:([^:@]+)@/, ':***@');
        }
        
        return value;
    }

    encryptSensitiveValues(config) {
        let encrypted = '# Encrypted configuration\n';
        
        Object.entries(config).forEach(([key, value]) => {
            const sensitiveKeys = ['PASSWORD', 'SECRET', 'KEY', 'TOKEN'];
            const isSensitive = sensitiveKeys.some(keyword => key.includes(keyword));
            
            if (isSensitive) {
                encrypted += `${key}=ENC[${Buffer.from(value).toString('base64')}]\n`;
            } else {
                encrypted += `${key}=${value}\n`;
            }
        });
        
        return encrypted;
    }
}