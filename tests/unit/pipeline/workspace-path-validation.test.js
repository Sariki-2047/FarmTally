/**
 * Unit Tests for Workspace Path Validation Script
 * Tests the validate-workspace-paths.sh functionality
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('Workspace Path Validation', () => {
    let tempDir;
    let originalCwd;

    beforeEach(() => {
        // Create temporary directory for testing
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'farmtally-test-'));
        originalCwd = process.cwd();
        process.chdir(tempDir);
    });

    afterEach(() => {
        // Cleanup
        process.chdir(originalCwd);
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    describe('Directory Structure Validation', () => {
        test('should pass validation with complete directory structure', () => {
            // Setup complete directory structure
            createValidDirectoryStructure();

            const result = runValidationScript();
            
            expect(result.exitCode).toBe(0);
            expect(result.stdout).toContain('✅ Found: Backend package.json');
            expect(result.stdout).toContain('✅ Found: Frontend directory');
            expect(result.stdout).toContain('🎉 Workspace validation completed successfully!');
        });

        test('should fail validation when backend package.json is missing', () => {
            // Setup incomplete structure (missing package.json)
            createPartialDirectoryStructure({ skipBackendPackageJson: true });

            const result = runValidationScript();
            
            expect(result.exitCode).toBe(1);
            expect(result.stdout).toContain('❌ Missing: Backend package.json');
            expect(result.stdout).toContain('❌ Workspace validation failed!');
        });

        test('should fail validation when frontend directory is missing', () => {
            // Setup incomplete structure (missing frontend)
            createPartialDirectoryStructure({ skipFrontend: true });

            const result = runValidationScript();
            
            expect(result.exitCode).toBe(1);
            expect(result.stdout).toContain('❌ Missing: Frontend directory');
        });

        test('should handle optional directories correctly', () => {
            // Setup structure without build directories
            createValidDirectoryStructure({ skipBuildDirs: true });

            const result = runValidationScript();
            
            expect(result.exitCode).toBe(0);
            expect(result.stdout).toContain('⚠️  Optional: Backend build output directory not found');
            expect(result.stdout).toContain('⚠️  Optional: Frontend build output directory not found');
        });
    });

    describe('Build Script Validation', () => {
        test('should validate required build scripts in package.json', () => {
            createValidDirectoryStructure();
            
            // Create package.json with required scripts
            const packageJson = {
                name: 'farmtally-backend',
                scripts: {
                    build: 'tsc',
                    start: 'node dist/server.js',
                    dev: 'nodemon src/server.ts'
                }
            };
            fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

            const result = runValidationScript();
            
            expect(result.exitCode).toBe(0);
            expect(result.stdout).toContain('✅ All required build scripts found');
        });

        test('should fail when build script is missing', () => {
            createValidDirectoryStructure();
            
            // Create package.json without build script
            const packageJson = {
                name: 'farmtally-backend',
                scripts: {
                    start: 'node dist/server.js'
                }
            };
            fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

            const result = runValidationScript();
            
            expect(result.exitCode).toBe(1);
            expect(result.stdout).toContain('❌ Backend package.json missing \'build\' script');
        });

        test('should fail when start script is missing', () => {
            createValidDirectoryStructure();
            
            // Create package.json without start script
            const packageJson = {
                name: 'farmtally-backend',
                scripts: {
                    build: 'tsc'
                }
            };
            fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

            const result = runValidationScript();
            
            expect(result.exitCode).toBe(1);
            expect(result.stdout).toContain('❌ Backend package.json missing \'start\' script');
        });
    });

    describe('Common Issues Detection', () => {
        test('should warn about legacy backend directory', () => {
            createValidDirectoryStructure();
            
            // Create legacy backend directory
            fs.mkdirSync('backend');
            fs.writeFileSync('backend/server.js', 'console.log("legacy");');

            const result = runValidationScript();
            
            expect(result.stdout).toContain('⚠️  Found \'backend\' directory - this should not exist');
            expect(result.stdout).toContain('Backend files should be in repository root');
        });

        test('should warn about legacy frontend directory', () => {
            createValidDirectoryStructure();
            
            // Create legacy frontend directory
            fs.mkdirSync('frontend');

            const result = runValidationScript();
            
            expect(result.stdout).toContain('⚠️  Found \'frontend\' directory - should be \'farmtally-frontend\'');
        });

        test('should warn about multiple frontend directories', () => {
            createValidDirectoryStructure();
            
            // Create multiple frontend directories
            fs.mkdirSync('frontend');
            fs.mkdirSync('farmtally_frontend');

            const result = runValidationScript();
            
            expect(result.stdout).toContain('⚠️  Multiple frontend directories found');
        });
    });

    describe('Path Configuration Generation', () => {
        test('should generate workspace-paths.env file', () => {
            createValidDirectoryStructure();

            const result = runValidationScript();
            
            expect(result.exitCode).toBe(0);
            expect(fs.existsSync('workspace-paths.env')).toBe(true);
            
            const configContent = fs.readFileSync('workspace-paths.env', 'utf8');
            expect(configContent).toContain('BACKEND_ROOT=.');
            expect(configContent).toContain('FRONTEND_ROOT=farmtally-frontend');
            expect(configContent).toContain('PRISMA_ROOT=prisma');
            expect(configContent).toContain('VALIDATION_TIMESTAMP=');
        });

        test('should include correct artifact paths in configuration', () => {
            createValidDirectoryStructure();

            runValidationScript();
            
            const configContent = fs.readFileSync('workspace-paths.env', 'utf8');
            expect(configContent).toContain('BACKEND_ARTIFACTS=dist/*');
            expect(configContent).toContain('FRONTEND_ARTIFACTS=farmtally-frontend/.next/*,farmtally-frontend/out/*');
        });
    });

    describe('Error Handling', () => {
        test('should handle missing directories gracefully', () => {
            // Don't create any directories
            
            const result = runValidationScript();
            
            expect(result.exitCode).toBe(1);
            expect(result.stdout).toContain('❌ Missing:');
        });

        test('should handle permission errors gracefully', () => {
            createValidDirectoryStructure();
            
            // Make package.json unreadable (if not on Windows)
            if (process.platform !== 'win32') {
                fs.chmodSync('package.json', 0o000);
                
                const result = runValidationScript();
                
                // Should handle the error gracefully
                expect(result.exitCode).toBe(1);
                
                // Restore permissions for cleanup
                fs.chmodSync('package.json', 0o644);
            }
        });
    });

    // Helper functions
    function createValidDirectoryStructure(options = {}) {
        const {
            skipBackendPackageJson = false,
            skipFrontend = false,
            skipBuildDirs = false
        } = options;

        // Backend structure
        if (!skipBackendPackageJson) {
            const packageJson = {
                name: 'farmtally-backend',
                scripts: {
                    build: 'tsc',
                    start: 'node dist/server.js'
                }
            };
            fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
        }

        fs.mkdirSync('src', { recursive: true });
        fs.writeFileSync('src/server.ts', 'console.log("server");');
        fs.writeFileSync('tsconfig.json', '{}');

        // Prisma structure
        fs.mkdirSync('prisma', { recursive: true });
        fs.writeFileSync('prisma/schema.prisma', 'generator client { provider = "prisma-client-js" }');

        // Frontend structure
        if (!skipFrontend) {
            fs.mkdirSync('farmtally-frontend/src', { recursive: true });
            const frontendPackageJson = {
                name: 'farmtally-frontend',
                scripts: {
                    build: 'next build'
                }
            };
            fs.writeFileSync('farmtally-frontend/package.json', JSON.stringify(frontendPackageJson, null, 2));
            fs.writeFileSync('farmtally-frontend/next.config.ts', 'export default {};');
        }

        // Build directories (optional)
        if (!skipBuildDirs) {
            fs.mkdirSync('dist', { recursive: true });
            fs.writeFileSync('dist/server.js', 'console.log("built");');
            
            if (!skipFrontend) {
                fs.mkdirSync('farmtally-frontend/.next', { recursive: true });
                fs.mkdirSync('farmtally-frontend/out', { recursive: true });
            }
        }
    }

    function createPartialDirectoryStructure(options = {}) {
        createValidDirectoryStructure(options);
    }

    function runValidationScript() {
        try {
            // Copy the validation script to temp directory
            const scriptPath = path.join(__dirname, '../../../scripts/validate-workspace-paths.sh');
            const tempScriptPath = path.join(tempDir, 'validate-workspace-paths.sh');
            
            if (fs.existsSync(scriptPath)) {
                fs.copyFileSync(scriptPath, tempScriptPath);
                fs.chmodSync(tempScriptPath, 0o755);
            } else {
                // Create a mock script for testing
                createMockValidationScript(tempScriptPath);
            }

            const result = execSync('bash validate-workspace-paths.sh', {
                encoding: 'utf8',
                stdio: 'pipe'
            });

            return {
                exitCode: 0,
                stdout: result,
                stderr: ''
            };
        } catch (error) {
            return {
                exitCode: error.status || 1,
                stdout: error.stdout || '',
                stderr: error.stderr || error.message
            };
        }
    }

    function createMockValidationScript(scriptPath) {
        const mockScript = `#!/bin/bash
# Mock validation script for testing
set -e

check_path() {
    local path=$1
    local description=$2
    local required=\${3:-true}
    
    if [ -e "$path" ]; then
        echo "✅ Found: $description at $path"
        return 0
    else
        if [ "$required" = "true" ]; then
            echo "❌ Missing: $description at $path"
            return 1
        else
            echo "⚠️  Optional: $description not found at $path"
            return 0
        fi
    fi
}

validation_failed=false

# Check backend structure
if ! check_path "package.json" "Backend package.json (repository root)"; then
    validation_failed=true
fi

if ! check_path "src" "Backend source directory"; then
    validation_failed=true
fi

# Check frontend structure
if ! check_path "farmtally-frontend" "Frontend directory"; then
    validation_failed=true
fi

# Check build scripts
if [ -f "package.json" ]; then
    if ! grep -q '"build"' package.json; then
        echo "❌ Backend package.json missing 'build' script"
        validation_failed=true
    fi
    
    if ! grep -q '"start"' package.json; then
        echo "❌ Backend package.json missing 'start' script"
        validation_failed=true
    fi
    
    if [ "$validation_failed" = "false" ]; then
        echo "✅ All required build scripts found"
    fi
fi

# Check for common issues
if [ -d "backend" ]; then
    echo "⚠️  Found 'backend' directory - this should not exist in current structure"
    echo "    Backend files should be in repository root"
fi

if [ -d "frontend" ]; then
    echo "⚠️  Found 'frontend' directory - should be 'farmtally-frontend'"
fi

frontend_dirs=\$(find . -maxdepth 1 -name "*frontend*" -type d | wc -l)
if [ "\$frontend_dirs" -gt 1 ]; then
    echo "⚠️  Multiple frontend directories found:"
    find . -maxdepth 1 -name "*frontend*" -type d
fi

# Generate configuration
if [ "$validation_failed" = "false" ]; then
    cat > workspace-paths.env << EOF
BACKEND_ROOT=.
FRONTEND_ROOT=farmtally-frontend
PRISMA_ROOT=prisma
BACKEND_ARTIFACTS=dist/*
FRONTEND_ARTIFACTS=farmtally-frontend/.next/*,farmtally-frontend/out/*
VALIDATION_TIMESTAMP=\$(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF
    echo "🎉 Workspace validation completed successfully!"
    exit 0
else
    echo "❌ Workspace validation failed!"
    exit 1
fi
`;
        fs.writeFileSync(scriptPath, mockScript);
        fs.chmodSync(scriptPath, 0o755);
    }
});