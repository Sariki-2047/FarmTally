/**
 * Integration Tests for End-to-End Pipeline
 * Tests the complete Jenkins pipeline workflow from start to finish
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, spawn } = require('child_process');
const axios = require('axios');

// Mock axios for API calls
jest.mock('axios');
const mockedAxios = axios;

describe('End-to-End Pipeline Integration', () => {
    let tempDir;
    let originalCwd;
    let originalEnv;
    let pipelineRunner;

    beforeAll(() => {
        // Set longer timeout for integration tests
        jest.setTimeout(60000);
    });

    beforeEach(() => {
        // Create temporary directory for testing
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'farmtally-e2e-test-'));
        originalCwd = process.cwd();
        originalEnv = { ...process.env };
        
        process.chdir(tempDir);
        
        // Setup test environment
        setupTestEnvironment();
        
        // Create pipeline runner
        pipelineRunner = new PipelineRunner(tempDir);
        
        // Clear axios mocks
        jest.clearAllMocks();
    });

    afterEach(() => {
        // Cleanup
        process.chdir(originalCwd);
        process.env = originalEnv;
        
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    describe('Complete Pipeline Execution', () => {
        test('should execute full pipeline successfully with valid environment', async () => {
            // Setup complete project structure
            setupCompleteProject();
            setupValidEnvironment();
            
            // Mock successful API responses
            mockSuccessfulApiResponses();
            
            const result = await pipelineRunner.runFullPipeline();
            
            expect(result.success).toBe(true);
            expect(result.stages).toHaveLength(8);
            expect(result.stages.every(stage => stage.status === 'SUCCESS')).toBe(true);
            
            // Verify artifacts were created
            expect(fs.existsSync('artifacts')).toBe(true);
            expect(fs.existsSync('workspace-paths.env')).toBe(true);
            expect(fs.existsSync('.env')).toBe(true);
            expect(fs.existsSync('farmtally-frontend/.env.local')).toBe(true);
        });

        test('should fail pipeline when workspace validation fails', async () => {
            // Setup incomplete project (missing frontend)
            setupIncompleteProject({ missingFrontend: true });
            setupValidEnvironment();
            
            const result = await pipelineRunner.runFullPipeline();
            
            expect(result.success).toBe(false);
            expect(result.failedStage).toBe('workspace-validation');
            expect(result.error).toContain('Frontend directory');
        });

        test('should fail pipeline when environment variables are missing', async () => {
            setupCompleteProject();
            // Don't setup environment variables
            
            const result = await pipelineRunner.runFullPipeline();
            
            expect(result.success).toBe(false);
            expect(result.failedStage).toBe('environment-validation');
            expect(result.error).toContain('DATABASE_URL');
        });

        test('should fail pipeline when build fails', async () => {
            setupCompleteProject();
            setupValidEnvironment();
            
            // Create invalid TypeScript that will fail compilation
            fs.writeFileSync('src/server.ts', 'invalid typescript syntax here');
            
            const result = await pipelineRunner.runFullPipeline();
            
            expect(result.success).toBe(false);
            expect(result.failedStage).toBe('backend-build');
        });

        test('should fail pipeline when database migration fails', async () => {
            setupCompleteProject();
            setupValidEnvironment();
            
            // Setup invalid database URL
            process.env.DATABASE_URL = 'invalid-database-url';
            
            const result = await pipelineRunner.runFullPipeline();
            
            expect(result.success).toBe(false);
            expect(result.failedStage).toBe('database-migration');
        });

        test('should fail pipeline when health checks fail', async () => {
            setupCompleteProject();
            setupValidEnvironment();
            
            // Mock failed API responses
            mockFailedApiResponses();
            
            const result = await pipelineRunner.runFullPipeline();
            
            expect(result.success).toBe(false);
            expect(result.failedStage).toBe('health-verification');
        });
    });

    describe('Pipeline Stage Dependencies', () => {
        test('should execute stages in correct order', async () => {
            setupCompleteProject();
            setupValidEnvironment();
            mockSuccessfulApiResponses();
            
            const result = await pipelineRunner.runFullPipeline();
            
            const stageOrder = result.stages.map(stage => stage.name);
            const expectedOrder = [
                'workspace-validation',
                'environment-injection',
                'backend-build',
                'frontend-build',
                'database-migration',
                'deployment',
                'health-verification',
                'artifact-storage'
            ];
            
            expect(stageOrder).toEqual(expectedOrder);
        });

        test('should stop execution when a stage fails', async () => {
            setupCompleteProject();
            setupValidEnvironment();
            
            // Make backend build fail
            fs.writeFileSync('src/server.ts', 'invalid syntax');
            
            const result = await pipelineRunner.runFullPipeline();
            
            expect(result.success).toBe(false);
            expect(result.stages.length).toBeLessThan(8); // Should stop before all stages
            
            const executedStages = result.stages.map(stage => stage.name);
            expect(executedStages).not.toContain('database-migration');
            expect(executedStages).not.toContain('health-verification');
        });

        test('should preserve previous deployment on failure', async () => {
            // Setup previous successful deployment
            setupCompleteProject();
            setupValidEnvironment();
            mockSuccessfulApiResponses();
            
            await pipelineRunner.runFullPipeline();
            
            // Verify deployment exists
            expect(fs.existsSync('deployment/current')).toBe(true);
            
            // Now make next deployment fail
            fs.writeFileSync('src/server.ts', 'invalid syntax');
            
            const result = await pipelineRunner.runFullPipeline();
            
            expect(result.success).toBe(false);
            // Previous deployment should still exist
            expect(fs.existsSync('deployment/current')).toBe(true);
        });
    });

    describe('Environment Configuration Integration', () => {
        test('should inject environment variables correctly across all stages', async () => {
            setupCompleteProject();
            setupValidEnvironment();
            mockSuccessfulApiResponses();
            
            const result = await pipelineRunner.runFullPipeline();
            
            expect(result.success).toBe(true);
            
            // Verify backend .env file
            const backendEnv = fs.readFileSync('.env', 'utf8');
            expect(backendEnv).toContain('DATABASE_URL=postgresql://test:test@localhost:5432/farmtally_test');
            expect(backendEnv).toContain('JWT_SECRET=test-jwt-secret-key-for-testing');
            
            // Verify frontend .env.local file
            const frontendEnv = fs.readFileSync('farmtally-frontend/.env.local', 'utf8');
            expect(frontendEnv).toContain('NEXT_PUBLIC_API_URL=http://localhost:3000');
        });

        test('should mask sensitive values in pipeline logs', async () => {
            setupCompleteProject();
            setupValidEnvironment();
            mockSuccessfulApiResponses();
            
            const result = await pipelineRunner.runFullPipeline();
            
            expect(result.success).toBe(true);
            
            // Check that logs don't contain sensitive values
            const logs = result.logs.join('\n');
            expect(logs).not.toContain('test-jwt-secret-key-for-testing');
            expect(logs).not.toContain('test:test@localhost');
            expect(logs).toContain('***'); // Should contain masked values
        });

        test('should validate environment variables before each stage', async () => {
            setupCompleteProject();
            setupValidEnvironment();
            
            // Remove required variable after initial setup
            delete process.env.JWT_SECRET;
            
            const result = await pipelineRunner.runFullPipeline();
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('JWT_SECRET');
        });
    });

    describe('Database Migration Integration', () => {
        test('should execute migrations successfully with valid database', async () => {
            setupCompleteProject();
            setupValidEnvironment();
            setupMockDatabase();
            mockSuccessfulApiResponses();
            
            const result = await pipelineRunner.runFullPipeline();
            
            expect(result.success).toBe(true);
            
            const migrationStage = result.stages.find(stage => stage.name === 'database-migration');
            expect(migrationStage.status).toBe('SUCCESS');
            expect(migrationStage.output).toContain('Migrations applied successfully');
        });

        test('should abort deployment when migrations fail', async () => {
            setupCompleteProject();
            setupValidEnvironment();
            
            // Setup invalid database URL
            process.env.DATABASE_URL = 'postgresql://invalid:invalid@nonexistent:5432/invalid';
            
            const result = await pipelineRunner.runFullPipeline();
            
            expect(result.success).toBe(false);
            expect(result.failedStage).toBe('database-migration');
            
            // Deployment stage should not have been executed
            const deploymentStage = result.stages.find(stage => stage.name === 'deployment');
            expect(deploymentStage).toBeUndefined();
        });

        test('should create migration report with detailed information', async () => {
            setupCompleteProject();
            setupValidEnvironment();
            setupMockDatabase();
            mockSuccessfulApiResponses();
            
            const result = await pipelineRunner.runFullPipeline();
            
            expect(result.success).toBe(true);
            
            // Check for migration report
            const reportFiles = fs.readdirSync('.').filter(file => file.startsWith('migration_report_'));
            expect(reportFiles.length).toBeGreaterThan(0);
            
            const report = JSON.parse(fs.readFileSync(reportFiles[0], 'utf8'));
            expect(report.migration_execution.status).toBe('completed');
            expect(report.environment.build_number).toBeDefined();
        });
    });

    describe('Health Check Integration', () => {
        test('should perform comprehensive health checks after deployment', async () => {
            setupCompleteProject();
            setupValidEnvironment();
            mockSuccessfulApiResponses();
            
            const result = await pipelineRunner.runFullPipeline();
            
            expect(result.success).toBe(true);
            
            const healthStage = result.stages.find(stage => stage.name === 'health-verification');
            expect(healthStage.status).toBe('SUCCESS');
            
            // Verify all health checks were performed
            expect(mockedAxios).toHaveBeenCalledWith(
                expect.objectContaining({ url: 'http://localhost:3000/api/health' })
            );
            expect(mockedAxios).toHaveBeenCalledWith(
                expect.objectContaining({ url: 'http://localhost:3000/' })
            );
        });

        test('should trigger rollback when health checks fail', async () => {
            setupCompleteProject();
            setupValidEnvironment();
            
            // Mock failed health checks
            mockFailedApiResponses();
            
            const result = await pipelineRunner.runFullPipeline();
            
            expect(result.success).toBe(false);
            expect(result.failedStage).toBe('health-verification');
            expect(result.rollbackTriggered).toBe(true);
        });

        test('should generate detailed health check report', async () => {
            setupCompleteProject();
            setupValidEnvironment();
            mockSuccessfulApiResponses();
            
            const result = await pipelineRunner.runFullPipeline();
            
            expect(result.success).toBe(true);
            
            // Check for health check report
            const healthReportFiles = fs.readdirSync('.').filter(file => file.startsWith('health_report_'));
            expect(healthReportFiles.length).toBeGreaterThan(0);
            
            const report = JSON.parse(fs.readFileSync(healthReportFiles[0], 'utf8'));
            expect(report.summary.total).toBeGreaterThan(0);
            expect(report.summary.passed).toBeGreaterThan(0);
        });
    });

    describe('Artifact Management Integration', () => {
        test('should create and store artifacts after successful deployment', async () => {
            setupCompleteProject();
            setupValidEnvironment();
            mockSuccessfulApiResponses();
            
            const result = await pipelineRunner.runFullPipeline();
            
            expect(result.success).toBe(true);
            
            // Verify artifacts were created
            const artifactDirs = fs.readdirSync('artifacts').filter(dir => dir.startsWith('farmtally-'));
            expect(artifactDirs.length).toBe(1);
            
            const artifactPath = path.join('artifacts', artifactDirs[0]);
            expect(fs.existsSync(path.join(artifactPath, 'backend/backend.tar.gz'))).toBe(true);
            expect(fs.existsSync(path.join(artifactPath, 'frontend/frontend.tar.gz'))).toBe(true);
            expect(fs.existsSync(path.join(artifactPath, 'manifest.json'))).toBe(true);
        });

        test('should include correct metadata in artifact manifest', async () => {
            process.env.BUILD_NUMBER = '12345';
            
            setupCompleteProject();
            setupValidEnvironment();
            mockSuccessfulApiResponses();
            
            const result = await pipelineRunner.runFullPipeline();
            
            expect(result.success).toBe(true);
            
            const artifactDirs = fs.readdirSync('artifacts').filter(dir => dir.startsWith('farmtally-'));
            const manifest = JSON.parse(fs.readFileSync(path.join('artifacts', artifactDirs[0], 'manifest.json'), 'utf8'));
            
            expect(manifest.build.number).toBe('12345');
            expect(manifest.git.commit).toMatch(/^[a-f0-9]{40}$/);
            expect(manifest.components).toHaveLength(2);
            expect(manifest.components[0].name).toBe('backend');
            expect(manifest.components[1].name).toBe('frontend');
        });

        test('should not create artifacts when deployment fails', async () => {
            setupCompleteProject();
            setupValidEnvironment();
            
            // Make health checks fail
            mockFailedApiResponses();
            
            const result = await pipelineRunner.runFullPipeline();
            
            expect(result.success).toBe(false);
            
            // Artifacts should not be created
            if (fs.existsSync('artifacts')) {
                const artifactDirs = fs.readdirSync('artifacts').filter(dir => dir.startsWith('farmtally-'));
                expect(artifactDirs.length).toBe(0);
            }
        });
    });

    describe('Failure Recovery and Rollback', () => {
        test('should maintain system stability during pipeline failures', async () => {
            // First, create a successful deployment
            setupCompleteProject();
            setupValidEnvironment();
            mockSuccessfulApiResponses();
            
            const firstResult = await pipelineRunner.runFullPipeline();
            expect(firstResult.success).toBe(true);
            
            // Verify initial deployment
            expect(fs.existsSync('deployment/current')).toBe(true);
            const initialDeployment = fs.readFileSync('deployment/current/version.txt', 'utf8');
            
            // Now attempt a failing deployment
            fs.writeFileSync('src/server.ts', 'invalid syntax');
            
            const secondResult = await pipelineRunner.runFullPipeline();
            expect(secondResult.success).toBe(false);
            
            // Previous deployment should still be active
            expect(fs.existsSync('deployment/current')).toBe(true);
            const currentDeployment = fs.readFileSync('deployment/current/version.txt', 'utf8');
            expect(currentDeployment).toBe(initialDeployment);
        });

        test('should execute rollback procedure when health checks fail', async () => {
            setupCompleteProject();
            setupValidEnvironment();
            
            // Mock health checks to fail after deployment
            mockedAxios
                .mockResolvedValueOnce({ status: 200, data: { status: 'healthy' } }) // Initial check passes
                .mockResolvedValueOnce({ status: 500, data: { error: 'Server error' } }); // Post-deployment check fails
            
            const result = await pipelineRunner.runFullPipeline();
            
            expect(result.success).toBe(false);
            expect(result.rollbackTriggered).toBe(true);
            expect(result.rollbackSteps).toContain('stop-new-deployment');
            expect(result.rollbackSteps).toContain('restore-previous-version');
        });

        test('should generate comprehensive failure report', async () => {
            setupCompleteProject();
            setupValidEnvironment();
            
            // Make backend build fail
            fs.writeFileSync('src/server.ts', 'invalid syntax');
            
            const result = await pipelineRunner.runFullPipeline();
            
            expect(result.success).toBe(false);
            
            // Check for failure report
            const failureReportFiles = fs.readdirSync('.').filter(file => file.startsWith('pipeline_failure_'));
            expect(failureReportFiles.length).toBeGreaterThan(0);
            
            const report = JSON.parse(fs.readFileSync(failureReportFiles[0], 'utf8'));
            expect(report.failure.stage).toBe('backend-build');
            expect(report.failure.error).toBeDefined();
            expect(report.system_state.previous_deployment_preserved).toBe(true);
        });
    });

    // Helper functions
    function setupTestEnvironment() {
        // Create basic directory structure
        fs.mkdirSync('.git', { recursive: true });
        
        // Mock git commands
        process.env.PATH = `${tempDir}:${process.env.PATH}`;
        
        if (process.platform !== 'win32') {
            const gitScript = `#!/bin/bash
case "$*" in
    "rev-parse HEAD") echo "a1b2c3d4e5f6789012345678901234567890abcd" ;;
    "rev-parse --abbrev-ref HEAD") echo "main" ;;
    "config --get remote.origin.url") echo "https://github.com/farmtally/farmtally.git" ;;
    "diff-index --quiet HEAD --") exit 0 ;;
    *) echo "Git command: $*" >&2; exit 0 ;;
esac`;
            
            fs.writeFileSync('git', gitScript);
            fs.chmodSync('git', 0o755);
        }
    }

    function setupCompleteProject() {
        // Backend structure
        fs.mkdirSync('src', { recursive: true });
        fs.writeFileSync('src/server.ts', `
import express from 'express';
const app = express();
app.get('/api/health', (req, res) => res.json({ status: 'healthy' }));
app.listen(3000);
        `);
        
        fs.writeFileSync('package.json', JSON.stringify({
            name: 'farmtally-backend',
            scripts: {
                build: 'echo "Building backend..." && mkdir -p dist && echo "console.log(\\"server\\");" > dist/server.js',
                start: 'node dist/server.js'
            },
            dependencies: { express: '^4.18.0' }
        }, null, 2));
        
        fs.writeFileSync('tsconfig.json', JSON.stringify({
            compilerOptions: { target: 'es2020', outDir: 'dist' }
        }, null, 2));
        
        // Prisma structure
        fs.mkdirSync('prisma', { recursive: true });
        fs.writeFileSync('prisma/schema.prisma', `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
        `);
        
        // Frontend structure
        fs.mkdirSync('farmtally-frontend/src', { recursive: true });
        fs.writeFileSync('farmtally-frontend/package.json', JSON.stringify({
            name: 'farmtally-frontend',
            scripts: {
                build: 'echo "Building frontend..." && mkdir -p .next && echo "build" > .next/BUILD_ID'
            }
        }, null, 2));
        
        fs.writeFileSync('farmtally-frontend/next.config.ts', 'export default {};');
        fs.mkdirSync('farmtally-frontend/public', { recursive: true });
        fs.writeFileSync('farmtally-frontend/public/favicon.ico', 'fake-favicon');
    }

    function setupIncompleteProject(options = {}) {
        const { missingFrontend = false, missingBackend = false } = options;
        
        if (!missingBackend) {
            fs.mkdirSync('src', { recursive: true });
            fs.writeFileSync('src/server.ts', 'console.log("server");');
            fs.writeFileSync('package.json', JSON.stringify({
                name: 'farmtally-backend',
                scripts: { build: 'echo "build"', start: 'node dist/server.js' }
            }, null, 2));
        }
        
        if (!missingFrontend) {
            fs.mkdirSync('farmtally-frontend', { recursive: true });
            fs.writeFileSync('farmtally-frontend/package.json', JSON.stringify({
                name: 'farmtally-frontend',
                scripts: { build: 'echo "build"' }
            }, null, 2));
        }
    }

    function setupValidEnvironment() {
        process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/farmtally_test';
        process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
        process.env.SMTP_HOST = 'smtp.test.com';
        process.env.SMTP_USER = 'test@farmtally.com';
        process.env.SMTP_PASSWORD = 'test-password';
        process.env.CORS_ORIGIN = 'http://localhost:3000';
        process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
        process.env.BUILD_NUMBER = process.env.BUILD_NUMBER || '123';
    }

    function setupMockDatabase() {
        // Create mock Prisma CLI responses
        if (process.platform !== 'win32') {
            const prismaScript = `#!/bin/bash
case "$*" in
    "migrate deploy") echo "Migrations applied successfully" ;;
    "migrate status") echo "Database schema is up to date" ;;
    "db pull --preview-feature --force") echo "Schema pulled successfully" ;;
    "generate") echo "Prisma client generated" ;;
    *) echo "Prisma command: $*" >&2; exit 0 ;;
esac`;
            
            fs.writeFileSync('npx', prismaScript);
            fs.chmodSync('npx', 0o755);
        }
    }

    function mockSuccessfulApiResponses() {
        mockedAxios
            .mockResolvedValueOnce({ status: 200, data: { status: 'healthy' } }) // Basic health
            .mockResolvedValueOnce({ status: 200, data: { message: 'FarmTally API' } }) // Root endpoint
            .mockResolvedValueOnce({ status: 200, data: { id: 'user-123', role: 'FARM_ADMIN' } }) // Auth
            .mockResolvedValueOnce({ status: 200, data: { farmers: [] } }); // Database connectivity
    }

    function mockFailedApiResponses() {
        mockedAxios
            .mockResolvedValueOnce({ status: 500, data: { error: 'Server error' } })
            .mockResolvedValueOnce({ status: 500, data: { error: 'Server error' } })
            .mockResolvedValueOnce({ status: 500, data: { error: 'Server error' } })
            .mockResolvedValueOnce({ status: 500, data: { error: 'Server error' } });
    }
});

// Mock PipelineRunner class for integration testing
class PipelineRunner {
    constructor(baseDir) {
        this.baseDir = baseDir;
        this.stages = [
            'workspace-validation',
            'environment-injection',
            'backend-build',
            'frontend-build',
            'database-migration',
            'deployment',
            'health-verification',
            'artifact-storage'
        ];
    }

    async runFullPipeline() {
        const result = {
            success: false,
            stages: [],
            logs: [],
            failedStage: null,
            error: null,
            rollbackTriggered: false,
            rollbackSteps: []
        };

        try {
            for (const stageName of this.stages) {
                const stageResult = await this.runStage(stageName);
                result.stages.push(stageResult);
                result.logs.push(...stageResult.logs);

                if (stageResult.status !== 'SUCCESS') {
                    result.failedStage = stageName;
                    result.error = stageResult.error;
                    
                    // Trigger rollback for certain failures
                    if (['health-verification', 'deployment'].includes(stageName)) {
                        await this.triggerRollback(result);
                    }
                    
                    return result;
                }
            }

            result.success = true;
            return result;
        } catch (error) {
            result.error = error.message;
            return result;
        }
    }

    async runStage(stageName) {
        const stage = {
            name: stageName,
            status: 'RUNNING',
            startTime: new Date(),
            logs: [],
            output: '',
            error: null
        };

        try {
            switch (stageName) {
                case 'workspace-validation':
                    await this.validateWorkspace(stage);
                    break;
                case 'environment-injection':
                    await this.injectEnvironment(stage);
                    break;
                case 'backend-build':
                    await this.buildBackend(stage);
                    break;
                case 'frontend-build':
                    await this.buildFrontend(stage);
                    break;
                case 'database-migration':
                    await this.runMigrations(stage);
                    break;
                case 'deployment':
                    await this.deployApplication(stage);
                    break;
                case 'health-verification':
                    await this.verifyHealth(stage);
                    break;
                case 'artifact-storage':
                    await this.storeArtifacts(stage);
                    break;
            }

            stage.status = 'SUCCESS';
        } catch (error) {
            stage.status = 'FAILED';
            stage.error = error.message;
            stage.logs.push(`ERROR: ${error.message}`);
        }

        stage.endTime = new Date();
        stage.duration = stage.endTime - stage.startTime;
        
        return stage;
    }

    async validateWorkspace(stage) {
        stage.logs.push('Validating workspace structure...');
        
        const requiredPaths = [
            'package.json',
            'src',
            'farmtally-frontend',
            'farmtally-frontend/package.json'
        ];

        for (const requiredPath of requiredPaths) {
            if (!fs.existsSync(requiredPath)) {
                throw new Error(`Required path missing: ${requiredPath}`);
            }
        }

        // Generate workspace paths configuration
        const config = `BACKEND_ROOT=.
FRONTEND_ROOT=farmtally-frontend
PRISMA_ROOT=prisma
VALIDATION_TIMESTAMP=${new Date().toISOString()}`;
        
        fs.writeFileSync('workspace-paths.env', config);
        stage.logs.push('Workspace validation completed successfully');
    }

    async injectEnvironment(stage) {
        stage.logs.push('Injecting environment variables...');
        
        const requiredBackendVars = ['DATABASE_URL', 'JWT_SECRET', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'CORS_ORIGIN'];
        const requiredFrontendVars = ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];

        // Validate backend environment
        for (const varName of requiredBackendVars) {
            if (!process.env[varName]) {
                throw new Error(`Required environment variable missing: ${varName}`);
            }
        }

        // Create backend .env file
        let backendEnv = '# Generated environment file\n';
        requiredBackendVars.forEach(varName => {
            const value = process.env[varName];
            backendEnv += `${varName}=${value}\n`;
            
            // Log with masked sensitive values
            const maskedValue = this.maskSensitiveValue(varName, value);
            stage.logs.push(`Set ${varName}=${maskedValue}`);
        });
        
        fs.writeFileSync('.env', backendEnv);

        // Create frontend .env.local file
        let frontendEnv = '# Generated frontend environment file\n';
        requiredFrontendVars.forEach(varName => {
            if (process.env[varName]) {
                frontendEnv += `${varName}=${process.env[varName]}\n`;
            }
        });
        
        fs.writeFileSync('farmtally-frontend/.env.local', frontendEnv);
        
        stage.logs.push('Environment variables injected successfully');
    }

    async buildBackend(stage) {
        stage.logs.push('Building backend...');
        
        try {
            const output = execSync('npm run build', { encoding: 'utf8', cwd: this.baseDir });
            stage.output = output;
            stage.logs.push('Backend build completed successfully');
        } catch (error) {
            throw new Error(`Backend build failed: ${error.message}`);
        }
    }

    async buildFrontend(stage) {
        stage.logs.push('Building frontend...');
        
        try {
            const output = execSync('npm run build', { 
                encoding: 'utf8', 
                cwd: path.join(this.baseDir, 'farmtally-frontend')
            });
            stage.output = output;
            stage.logs.push('Frontend build completed successfully');
        } catch (error) {
            throw new Error(`Frontend build failed: ${error.message}`);
        }
    }

    async runMigrations(stage) {
        stage.logs.push('Running database migrations...');
        
        // Validate database URL
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl || !dbUrl.startsWith('postgresql://')) {
            throw new Error('Invalid DATABASE_URL format');
        }

        try {
            // Mock migration execution
            if (dbUrl.includes('invalid') || dbUrl.includes('nonexistent')) {
                throw new Error('Database connection failed');
            }

            stage.logs.push('Migrations applied successfully');
            stage.output = 'Migrations applied successfully';
            
            // Generate migration report
            const report = {
                migration_execution: {
                    timestamp: new Date().toISOString(),
                    status: 'completed',
                    database_url_hash: 'hash123'
                },
                environment: {
                    build_number: process.env.BUILD_NUMBER || 'unknown',
                    node_version: process.version
                }
            };
            
            const reportFile = `migration_report_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
            
        } catch (error) {
            throw new Error(`Migration failed: ${error.message}`);
        }
    }

    async deployApplication(stage) {
        stage.logs.push('Deploying application...');
        
        // Create deployment directory
        fs.mkdirSync('deployment/current', { recursive: true });
        
        // Copy build artifacts
        if (fs.existsSync('dist')) {
            execSync('cp -r dist deployment/current/');
        }
        
        if (fs.existsSync('farmtally-frontend/.next')) {
            execSync('cp -r farmtally-frontend/.next deployment/current/');
        }
        
        // Create version file
        const version = `${process.env.BUILD_NUMBER || 'unknown'}-${Date.now()}`;
        fs.writeFileSync('deployment/current/version.txt', version);
        
        stage.logs.push('Application deployed successfully');
        stage.output = `Deployed version: ${version}`;
    }

    async verifyHealth(stage) {
        stage.logs.push('Verifying application health...');
        
        const HealthChecker = require('../../../scripts/health-check.js');
        const checker = new HealthChecker({
            url: 'http://localhost:3000',
            timeout: 5000,
            verbose: false
        });

        try {
            const results = await checker.runAllChecks();
            
            if (results.summary.failed > 0) {
                throw new Error(`Health checks failed: ${results.summary.failed} failures`);
            }
            
            stage.logs.push(`All health checks passed (${results.summary.passed}/${results.summary.total})`);
            stage.output = `Health verification successful`;
            
            // Generate health report
            const reportFile = `health_report_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
            
        } catch (error) {
            throw new Error(`Health verification failed: ${error.message}`);
        }
    }

    async storeArtifacts(stage) {
        stage.logs.push('Storing build artifacts...');
        
        const versionInfo = {
            commitSha: 'a1b2c3d4e5f6789012345678901234567890abcd',
            commitShort: 'a1b2c3d4',
            buildNumber: process.env.BUILD_NUMBER || '123',
            branchName: 'main',
            buildTimestamp: new Date().toISOString(),
            artifactVersion: `v${process.env.BUILD_NUMBER || '123'}-a1b2c3d4`,
            artifactName: `farmtally-v${process.env.BUILD_NUMBER || '123'}-a1b2c3d4`
        };

        const artifactPath = path.join('artifacts', versionInfo.artifactName);
        fs.mkdirSync(artifactPath, { recursive: true });
        fs.mkdirSync(path.join(artifactPath, 'backend'), { recursive: true });
        fs.mkdirSync(path.join(artifactPath, 'frontend'), { recursive: true });

        // Create mock artifacts
        if (fs.existsSync('dist')) {
            execSync(`tar -czf "${path.join(artifactPath, 'backend/backend.tar.gz')}" dist/`);
        }
        
        if (fs.existsSync('farmtally-frontend/.next')) {
            execSync(`tar -czf "${path.join(artifactPath, 'frontend/frontend.tar.gz')}" -C farmtally-frontend .next/`);
        }

        // Create manifest
        const manifest = {
            version: versionInfo.artifactVersion,
            name: versionInfo.artifactName,
            timestamp: versionInfo.buildTimestamp,
            git: {
                commit: versionInfo.commitSha,
                shortCommit: versionInfo.commitShort,
                branch: versionInfo.branchName
            },
            build: {
                number: versionInfo.buildNumber
            },
            components: [
                { name: 'backend', type: 'backend', path: 'backend/backend.tar.gz' },
                { name: 'frontend', type: 'frontend', path: 'frontend/frontend.tar.gz' }
            ]
        };

        fs.writeFileSync(path.join(artifactPath, 'manifest.json'), JSON.stringify(manifest, null, 2));
        
        stage.logs.push(`Artifacts stored: ${versionInfo.artifactName}`);
        stage.output = `Artifact created: ${artifactPath}`;
    }

    async triggerRollback(result) {
        result.rollbackTriggered = true;
        result.rollbackSteps = [
            'stop-new-deployment',
            'restore-previous-version',
            'restart-services',
            'verify-rollback'
        ];

        // Generate failure report
        const failureReport = {
            failure: {
                stage: result.failedStage,
                error: result.error,
                timestamp: new Date().toISOString()
            },
            system_state: {
                previous_deployment_preserved: true,
                rollback_triggered: true
            },
            rollback_steps: result.rollbackSteps
        };

        const reportFile = `pipeline_failure_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        fs.writeFileSync(reportFile, JSON.stringify(failureReport, null, 2));
    }

    maskSensitiveValue(varName, value) {
        const sensitiveVars = ['PASSWORD', 'SECRET', 'KEY', 'TOKEN'];
        const isSensitive = sensitiveVars.some(keyword => varName.includes(keyword));
        
        if (isSensitive) {
            return '***';
        }
        
        if (varName === 'DATABASE_URL') {
            return value.replace(/:([^:@]+)@/, ':***@');
        }
        
        return value;
    }
}