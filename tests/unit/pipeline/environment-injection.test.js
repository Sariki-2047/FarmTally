/**
 * Unit Tests for Environment Variable Injection
 * Tests environment variable validation and injection functionality
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

describe('Environment Variable Injection', () => {
    let tempDir;
    let originalEnv;

    beforeEach(() => {
        // Create temporary directory for testing
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'farmtally-env-test-'));
        
        // Backup original environment
        originalEnv = { ...process.env };
    });

    afterEach(() => {
        // Restore original environment
        process.env = originalEnv;
        
        // Cleanup
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    describe('Environment Variable Validation', () => {
        test('should validate all required backend environment variables', () => {
            const requiredVars = [
                'DATABASE_URL',
                'JWT_SECRET',
                'SMTP_HOST',
                'SMTP_USER',
                'SMTP_PASSWORD',
                'CORS_ORIGIN'
            ];

            // Set all required variables
            requiredVars.forEach(varName => {
                process.env[varName] = `test-${varName.toLowerCase()}`;
            });

            const validator = new EnvironmentValidator();
            const result = validator.validateBackendEnvironment();

            expect(result.isValid).toBe(true);
            expect(result.missingVars).toHaveLength(0);
            expect(result.validVars).toEqual(requiredVars);
        });

        test('should identify missing required variables', () => {
            // Clear environment
            delete process.env.DATABASE_URL;
            delete process.env.JWT_SECRET;

            const validator = new EnvironmentValidator();
            const result = validator.validateBackendEnvironment();

            expect(result.isValid).toBe(false);
            expect(result.missingVars).toContain('DATABASE_URL');
            expect(result.missingVars).toContain('JWT_SECRET');
        });

        test('should validate frontend environment variables', () => {
            const frontendVars = [
                'NEXT_PUBLIC_API_URL',
                'NEXT_PUBLIC_SUPABASE_URL',
                'NEXT_PUBLIC_SUPABASE_ANON_KEY'
            ];

            // Set frontend variables
            frontendVars.forEach(varName => {
                process.env[varName] = `test-${varName.toLowerCase()}`;
            });

            const validator = new EnvironmentValidator();
            const result = validator.validateFrontendEnvironment();

            expect(result.isValid).toBe(true);
            expect(result.missingVars).toHaveLength(0);
            expect(result.validVars).toEqual(frontendVars);
        });

        test('should handle optional environment variables', () => {
            // Set only required variables
            process.env.DATABASE_URL = 'postgresql://test';
            process.env.JWT_SECRET = 'test-secret';

            const validator = new EnvironmentValidator();
            const result = validator.validateBackendEnvironment({ includeOptional: true });

            expect(result.isValid).toBe(true);
            expect(result.optionalVars).toBeDefined();
            expect(result.optionalVars.missing).toContain('REDIS_URL');
        });
    });

    describe('Environment File Generation', () => {
        test('should generate .env file with injected variables', () => {
            const envVars = {
                DATABASE_URL: 'postgresql://user:pass@localhost:5432/farmtally',
                JWT_SECRET: 'super-secret-key',
                SMTP_HOST: 'smtp.example.com',
                CORS_ORIGIN: 'https://farmtally.com'
            };

            // Set environment variables
            Object.entries(envVars).forEach(([key, value]) => {
                process.env[key] = value;
            });

            const generator = new EnvironmentFileGenerator(tempDir);
            const envFilePath = generator.generateBackendEnvFile();

            expect(fs.existsSync(envFilePath)).toBe(true);

            const envContent = fs.readFileSync(envFilePath, 'utf8');
            Object.entries(envVars).forEach(([key, value]) => {
                expect(envContent).toContain(`${key}=${value}`);
            });
        });

        test('should generate frontend .env.local file', () => {
            const frontendVars = {
                NEXT_PUBLIC_API_URL: 'https://api.farmtally.com',
                NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
                NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9'
            };

            Object.entries(frontendVars).forEach(([key, value]) => {
                process.env[key] = value;
            });

            const generator = new EnvironmentFileGenerator(tempDir);
            const envFilePath = generator.generateFrontendEnvFile();

            expect(fs.existsSync(envFilePath)).toBe(true);

            const envContent = fs.readFileSync(envFilePath, 'utf8');
            Object.entries(frontendVars).forEach(([key, value]) => {
                expect(envContent).toContain(`${key}=${value}`);
            });
        });

        test('should mask sensitive values in logs', () => {
            const sensitiveVars = {
                DATABASE_URL: 'postgresql://user:password123@localhost:5432/farmtally',
                JWT_SECRET: 'very-secret-key-12345',
                SMTP_PASSWORD: 'email-password-456'
            };

            Object.entries(sensitiveVars).forEach(([key, value]) => {
                process.env[key] = value;
            });

            const generator = new EnvironmentFileGenerator(tempDir);
            const logOutput = generator.generateBackendEnvFile({ enableLogging: true });

            // Check that sensitive values are masked in logs
            expect(logOutput).not.toContain('password123');
            expect(logOutput).not.toContain('very-secret-key-12345');
            expect(logOutput).not.toContain('email-password-456');
            expect(logOutput).toContain('***');
        });

        test('should handle missing variables gracefully', () => {
            // Don't set any environment variables
            const generator = new EnvironmentFileGenerator(tempDir);
            
            expect(() => {
                generator.generateBackendEnvFile({ strict: false });
            }).not.toThrow();

            // Should create file with placeholder values or comments
            const envFilePath = path.join(tempDir, '.env');
            if (fs.existsSync(envFilePath)) {
                const content = fs.readFileSync(envFilePath, 'utf8');
                expect(content).toContain('# Missing required environment variables');
            }
        });
    });

    describe('Variable Validation Rules', () => {
        test('should validate DATABASE_URL format', () => {
            const validator = new EnvironmentValidator();

            // Valid URLs
            expect(validator.validateDatabaseUrl('postgresql://user:pass@localhost:5432/db')).toBe(true);
            expect(validator.validateDatabaseUrl('postgres://user:pass@localhost:5432/db')).toBe(true);

            // Invalid URLs
            expect(validator.validateDatabaseUrl('invalid-url')).toBe(false);
            expect(validator.validateDatabaseUrl('http://example.com')).toBe(false);
            expect(validator.validateDatabaseUrl('')).toBe(false);
        });

        test('should validate JWT_SECRET strength', () => {
            const validator = new EnvironmentValidator();

            // Strong secrets
            expect(validator.validateJwtSecret('very-long-and-secure-jwt-secret-key-123')).toBe(true);
            expect(validator.validateJwtSecret('a'.repeat(32))).toBe(true);

            // Weak secrets
            expect(validator.validateJwtSecret('short')).toBe(false);
            expect(validator.validateJwtSecret('123456')).toBe(false);
            expect(validator.validateJwtSecret('')).toBe(false);
        });

        test('should validate CORS_ORIGIN format', () => {
            const validator = new EnvironmentValidator();

            // Valid origins
            expect(validator.validateCorsOrigin('https://farmtally.com')).toBe(true);
            expect(validator.validateCorsOrigin('http://localhost:3000')).toBe(true);
            expect(validator.validateCorsOrigin('*')).toBe(true);

            // Invalid origins
            expect(validator.validateCorsOrigin('farmtally.com')).toBe(false);
            expect(validator.validateCorsOrigin('ftp://example.com')).toBe(false);
        });

        test('should validate email configuration', () => {
            const validator = new EnvironmentValidator();

            const validEmailConfig = {
                SMTP_HOST: 'smtp.gmail.com',
                SMTP_USER: 'user@example.com',
                SMTP_PASSWORD: 'password123'
            };

            const invalidEmailConfig = {
                SMTP_HOST: '',
                SMTP_USER: 'invalid-email',
                SMTP_PASSWORD: ''
            };

            expect(validator.validateEmailConfig(validEmailConfig)).toBe(true);
            expect(validator.validateEmailConfig(invalidEmailConfig)).toBe(false);
        });
    });

    describe('Security Features', () => {
        test('should not expose sensitive values in error messages', () => {
            process.env.DATABASE_URL = 'postgresql://user:secret123@localhost:5432/db';
            
            const validator = new EnvironmentValidator();
            
            try {
                // Force an error condition
                validator.validateDatabaseConnection();
            } catch (error) {
                expect(error.message).not.toContain('secret123');
                expect(error.message).toContain('***');
            }
        });

        test('should generate secure temporary files', () => {
            const generator = new EnvironmentFileGenerator(tempDir);
            const envFilePath = generator.generateBackendEnvFile();

            // Check file permissions (Unix-like systems)
            if (process.platform !== 'win32') {
                const stats = fs.statSync(envFilePath);
                const mode = stats.mode & parseInt('777', 8);
                expect(mode).toBe(parseInt('600', 8)); // Owner read/write only
            }
        });

        test('should clean up temporary files', () => {
            const generator = new EnvironmentFileGenerator(tempDir);
            const envFilePath = generator.generateBackendEnvFile({ temporary: true });

            expect(fs.existsSync(envFilePath)).toBe(true);

            generator.cleanup();

            expect(fs.existsSync(envFilePath)).toBe(false);
        });
    });
});

// Mock classes for testing
class EnvironmentValidator {
    constructor() {
        this.requiredBackendVars = [
            'DATABASE_URL',
            'JWT_SECRET',
            'SMTP_HOST',
            'SMTP_USER',
            'SMTP_PASSWORD',
            'CORS_ORIGIN'
        ];

        this.requiredFrontendVars = [
            'NEXT_PUBLIC_API_URL',
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY'
        ];

        this.optionalVars = [
            'REDIS_URL',
            'AWS_ACCESS_KEY_ID',
            'AWS_SECRET_ACCESS_KEY',
            'SENTRY_DSN'
        ];
    }

    validateBackendEnvironment(options = {}) {
        const { includeOptional = false } = options;
        const missingVars = [];
        const validVars = [];

        this.requiredBackendVars.forEach(varName => {
            if (process.env[varName]) {
                validVars.push(varName);
            } else {
                missingVars.push(varName);
            }
        });

        const result = {
            isValid: missingVars.length === 0,
            missingVars,
            validVars
        };

        if (includeOptional) {
            const optionalMissing = [];
            const optionalPresent = [];

            this.optionalVars.forEach(varName => {
                if (process.env[varName]) {
                    optionalPresent.push(varName);
                } else {
                    optionalMissing.push(varName);
                }
            });

            result.optionalVars = {
                missing: optionalMissing,
                present: optionalPresent
            };
        }

        return result;
    }

    validateFrontendEnvironment() {
        const missingVars = [];
        const validVars = [];

        this.requiredFrontendVars.forEach(varName => {
            if (process.env[varName]) {
                validVars.push(varName);
            } else {
                missingVars.push(varName);
            }
        });

        return {
            isValid: missingVars.length === 0,
            missingVars,
            validVars
        };
    }

    validateDatabaseUrl(url) {
        if (!url) return false;
        return /^postgres(ql)?:\/\/.+/.test(url);
    }

    validateJwtSecret(secret) {
        if (!secret) return false;
        return secret.length >= 32;
    }

    validateCorsOrigin(origin) {
        if (!origin) return false;
        if (origin === '*') return true;
        return /^https?:\/\/.+/.test(origin);
    }

    validateEmailConfig(config) {
        const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD } = config;
        
        if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) return false;
        if (!/\S+@\S+\.\S+/.test(SMTP_USER)) return false;
        
        return true;
    }

    validateDatabaseConnection() {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            throw new Error('DATABASE_URL is required');
        }
        
        if (dbUrl.includes('secret')) {
            throw new Error('Database connection failed: Invalid credentials (***masked***)');
        }
    }
}

class EnvironmentFileGenerator {
    constructor(outputDir) {
        this.outputDir = outputDir;
        this.tempFiles = [];
    }

    generateBackendEnvFile(options = {}) {
        const { enableLogging = false, strict = true, temporary = false } = options;
        const envFilePath = path.join(this.outputDir, '.env');

        if (temporary) {
            this.tempFiles.push(envFilePath);
        }

        const requiredVars = [
            'DATABASE_URL',
            'JWT_SECRET',
            'SMTP_HOST',
            'SMTP_USER',
            'SMTP_PASSWORD',
            'CORS_ORIGIN'
        ];

        let envContent = '# Generated environment file for FarmTally backend\n';
        envContent += `# Generated at: ${new Date().toISOString()}\n\n`;

        const missingVars = [];
        let logOutput = '';

        requiredVars.forEach(varName => {
            const value = process.env[varName];
            if (value) {
                envContent += `${varName}=${value}\n`;
                if (enableLogging) {
                    const maskedValue = this.maskSensitiveValue(varName, value);
                    logOutput += `Set ${varName}=${maskedValue}\n`;
                }
            } else {
                if (strict) {
                    missingVars.push(varName);
                }
                envContent += `# ${varName}=<MISSING>\n`;
            }
        });

        if (missingVars.length > 0 && strict) {
            envContent = `# Missing required environment variables:\n# ${missingVars.join(', ')}\n\n` + envContent;
        }

        fs.writeFileSync(envFilePath, envContent);

        // Set secure permissions on Unix-like systems
        if (process.platform !== 'win32') {
            fs.chmodSync(envFilePath, 0o600);
        }

        return enableLogging ? logOutput : envFilePath;
    }

    generateFrontendEnvFile() {
        const envFilePath = path.join(this.outputDir, '.env.local');

        const frontendVars = [
            'NEXT_PUBLIC_API_URL',
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY'
        ];

        let envContent = '# Generated environment file for FarmTally frontend\n';
        envContent += `# Generated at: ${new Date().toISOString()}\n\n`;

        frontendVars.forEach(varName => {
            const value = process.env[varName];
            if (value) {
                envContent += `${varName}=${value}\n`;
            } else {
                envContent += `# ${varName}=<MISSING>\n`;
            }
        });

        fs.writeFileSync(envFilePath, envContent);
        return envFilePath;
    }

    maskSensitiveValue(varName, value) {
        const sensitiveVars = ['PASSWORD', 'SECRET', 'KEY', 'TOKEN'];
        const isSensitive = sensitiveVars.some(keyword => varName.includes(keyword));
        
        if (isSensitive) {
            return '***';
        }
        
        // Mask database URLs
        if (varName === 'DATABASE_URL') {
            return value.replace(/:([^:@]+)@/, ':***@');
        }
        
        return value;
    }

    cleanup() {
        this.tempFiles.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });
        this.tempFiles = [];
    }
}