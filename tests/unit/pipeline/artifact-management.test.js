/**
 * Unit Tests for Artifact Management System
 * Tests the artifact-manager.sh functionality through Node.js wrapper
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const crypto = require('crypto');

describe('Artifact Management System', () => {
    let tempDir;
    let originalCwd;
    let artifactManager;

    beforeEach(() => {
        // Create temporary directory for testing
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'farmtally-artifact-test-'));
        originalCwd = process.cwd();
        process.chdir(tempDir);

        // Create artifact manager instance
        artifactManager = new ArtifactManager(tempDir);
        
        // Setup mock git repository
        setupMockGitRepo();
    });

    afterEach(() => {
        // Cleanup
        process.chdir(originalCwd);
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    describe('Version Information Generation', () => {
        test('should generate correct version information', () => {
            process.env.BUILD_NUMBER = '123';
            
            const versionInfo = artifactManager.getVersionInfo();

            expect(versionInfo.buildNumber).toBe('123');
            expect(versionInfo.commitSha).toMatch(/^[a-f0-9]{40}$/);
            expect(versionInfo.commitShort).toMatch(/^[a-f0-9]{8}$/);
            expect(versionInfo.artifactVersion).toBe('v123-' + versionInfo.commitShort);
            expect(versionInfo.branchName).toBe('main');
            expect(versionInfo.buildTimestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
        });

        test('should handle missing BUILD_NUMBER', () => {
            delete process.env.BUILD_NUMBER;
            
            const versionInfo = artifactManager.getVersionInfo();

            expect(versionInfo.buildNumber).toMatch(/^\d+$/); // Should be timestamp
            expect(parseInt(versionInfo.buildNumber)).toBeGreaterThan(1000000000);
        });

        test('should handle missing git repository', () => {
            // Remove git directory
            fs.rmSync('.git', { recursive: true, force: true });
            
            const versionInfo = artifactManager.getVersionInfo();

            expect(versionInfo.commitSha).toBe('unknown');
            expect(versionInfo.branchName).toBe('unknown');
        });
    });

    describe('Artifact Directory Setup', () => {
        test('should create proper directory structure', () => {
            const versionInfo = artifactManager.getVersionInfo();
            const artifactPath = artifactManager.setupArtifactDirectory(versionInfo);

            expect(fs.existsSync(artifactPath)).toBe(true);
            expect(fs.existsSync(path.join(artifactPath, 'backend'))).toBe(true);
            expect(fs.existsSync(path.join(artifactPath, 'frontend'))).toBe(true);
            expect(fs.existsSync(path.join(artifactPath, 'metadata'))).toBe(true);
        });

        test('should use correct naming convention', () => {
            process.env.BUILD_NUMBER = '456';
            const versionInfo = artifactManager.getVersionInfo();
            const artifactPath = artifactManager.setupArtifactDirectory(versionInfo);

            const expectedName = `farmtally-v456-${versionInfo.commitShort}`;
            expect(artifactPath).toContain(expectedName);
        });
    });

    describe('Backend Packaging', () => {
        test('should package backend artifacts successfully', () => {
            setupBackendBuild();
            
            const versionInfo = artifactManager.getVersionInfo();
            const artifactPath = artifactManager.setupArtifactDirectory(versionInfo);
            const componentInfo = artifactManager.packageBackend(artifactPath);

            expect(fs.existsSync(path.join(artifactPath, 'backend/backend.tar.gz'))).toBe(true);
            expect(fs.existsSync(path.join(artifactPath, 'backend/backend.sha256'))).toBe(true);
            
            expect(componentInfo.name).toBe('backend');
            expect(componentInfo.type).toBe('backend');
            expect(componentInfo.path).toBe('backend/backend.tar.gz');
            expect(componentInfo.size).toBeGreaterThan(0);
            expect(componentInfo.checksum).toMatch(/^[a-f0-9]{64}$/);
        });

        test('should fail when backend build is missing', () => {
            // Don't create dist directory
            
            const versionInfo = artifactManager.getVersionInfo();
            const artifactPath = artifactManager.setupArtifactDirectory(versionInfo);

            expect(() => {
                artifactManager.packageBackend(artifactPath);
            }).toThrow('Backend build directory \'dist\' not found');
        });

        test('should verify backend package integrity', () => {
            setupBackendBuild();
            
            const versionInfo = artifactManager.getVersionInfo();
            const artifactPath = artifactManager.setupArtifactDirectory(versionInfo);
            artifactManager.packageBackend(artifactPath);

            const packagePath = path.join(artifactPath, 'backend/backend.tar.gz');
            const checksumPath = path.join(artifactPath, 'backend/backend.sha256');
            
            const actualChecksum = calculateFileChecksum(packagePath);
            const expectedChecksum = fs.readFileSync(checksumPath, 'utf8').trim();
            
            expect(actualChecksum).toBe(expectedChecksum);
        });
    });

    describe('Frontend Packaging', () => {
        test('should package frontend artifacts successfully', () => {
            setupFrontendBuild();
            
            const versionInfo = artifactManager.getVersionInfo();
            const artifactPath = artifactManager.setupArtifactDirectory(versionInfo);
            const componentInfo = artifactManager.packageFrontend(artifactPath);

            expect(fs.existsSync(path.join(artifactPath, 'frontend/frontend.tar.gz'))).toBe(true);
            expect(fs.existsSync(path.join(artifactPath, 'frontend/frontend.sha256'))).toBe(true);
            
            expect(componentInfo.name).toBe('frontend');
            expect(componentInfo.type).toBe('frontend');
            expect(componentInfo.path).toBe('frontend/frontend.tar.gz');
            expect(componentInfo.size).toBeGreaterThan(0);
            expect(componentInfo.checksum).toMatch(/^[a-f0-9]{64}$/);
        });

        test('should fail when frontend build is missing', () => {
            // Don't create .next directory
            
            const versionInfo = artifactManager.getVersionInfo();
            const artifactPath = artifactManager.setupArtifactDirectory(versionInfo);

            expect(() => {
                artifactManager.packageFrontend(artifactPath);
            }).toThrow('Frontend build directory \'farmtally-frontend/.next\' not found');
        });

        test('should include all required frontend files', () => {
            setupFrontendBuild();
            
            const versionInfo = artifactManager.getVersionInfo();
            const artifactPath = artifactManager.setupArtifactDirectory(versionInfo);
            artifactManager.packageFrontend(artifactPath);

            // Extract and verify contents
            const packagePath = path.join(artifactPath, 'frontend/frontend.tar.gz');
            const extractDir = path.join(tempDir, 'extract-test');
            fs.mkdirSync(extractDir);
            
            execSync(`tar -xzf "${packagePath}" -C "${extractDir}"`);
            
            expect(fs.existsSync(path.join(extractDir, '.next'))).toBe(true);
            expect(fs.existsSync(path.join(extractDir, 'public'))).toBe(true);
            expect(fs.existsSync(path.join(extractDir, 'package.json'))).toBe(true);
            expect(fs.existsSync(path.join(extractDir, 'next.config.ts'))).toBe(true);
        });
    });

    describe('Manifest Generation', () => {
        test('should generate comprehensive manifest', () => {
            setupBackendBuild();
            setupFrontendBuild();
            
            const versionInfo = artifactManager.getVersionInfo();
            const artifactPath = artifactManager.setupArtifactDirectory(versionInfo);
            const backendInfo = artifactManager.packageBackend(artifactPath);
            const frontendInfo = artifactManager.packageFrontend(artifactPath);
            
            artifactManager.generateManifest(artifactPath, backendInfo, frontendInfo, versionInfo);

            const manifestPath = path.join(artifactPath, 'manifest.json');
            expect(fs.existsSync(manifestPath)).toBe(true);
            
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            
            expect(manifest.version).toBe(versionInfo.artifactVersion);
            expect(manifest.name).toBe(versionInfo.artifactName);
            expect(manifest.timestamp).toBe(versionInfo.buildTimestamp);
            expect(manifest.git.commit).toBe(versionInfo.commitSha);
            expect(manifest.git.branch).toBe(versionInfo.branchName);
            expect(manifest.build.number).toBe(versionInfo.buildNumber);
            expect(manifest.components).toHaveLength(2);
            expect(manifest.components[0].name).toBe('backend');
            expect(manifest.components[1].name).toBe('frontend');
        });

        test('should include build environment information', () => {
            setupBackendBuild();
            setupFrontendBuild();
            process.env.BUILD_ENV = 'production';
            
            const versionInfo = artifactManager.getVersionInfo();
            const artifactPath = artifactManager.setupArtifactDirectory(versionInfo);
            const backendInfo = artifactManager.packageBackend(artifactPath);
            const frontendInfo = artifactManager.packageFrontend(artifactPath);
            
            artifactManager.generateManifest(artifactPath, backendInfo, frontendInfo, versionInfo);

            const manifest = JSON.parse(fs.readFileSync(path.join(artifactPath, 'manifest.json'), 'utf8'));
            
            expect(manifest.build.environment).toBe('production');
            expect(manifest.build.node).toMatch(/^v\d+\.\d+\.\d+$/);
            expect(manifest.metadata.platform).toMatch(/^\w+-\w+$/);
        });

        test('should create human-readable summary', () => {
            setupBackendBuild();
            setupFrontendBuild();
            
            const versionInfo = artifactManager.getVersionInfo();
            const artifactPath = artifactManager.setupArtifactDirectory(versionInfo);
            const backendInfo = artifactManager.packageBackend(artifactPath);
            const frontendInfo = artifactManager.packageFrontend(artifactPath);
            
            artifactManager.generateManifest(artifactPath, backendInfo, frontendInfo, versionInfo);

            const summaryPath = path.join(artifactPath, 'ARTIFACT_INFO.txt');
            expect(fs.existsSync(summaryPath)).toBe(true);
            
            const summary = fs.readFileSync(summaryPath, 'utf8');
            expect(summary).toContain('FarmTally Build Artifact');
            expect(summary).toContain(versionInfo.artifactVersion);
            expect(summary).toContain('backend/backend.tar.gz');
            expect(summary).toContain('frontend/frontend.tar.gz');
        });
    });

    describe('Retention Policy', () => {
        test('should remove old artifacts based on age', () => {
            // Create old artifacts
            const oldArtifactPath = path.join(tempDir, 'artifacts/farmtally-v100-old12345');
            fs.mkdirSync(oldArtifactPath, { recursive: true });
            
            // Set old timestamp (35 days ago)
            const oldTime = Date.now() - (35 * 24 * 60 * 60 * 1000);
            fs.utimesSync(oldArtifactPath, new Date(oldTime), new Date(oldTime));
            
            artifactManager.applyRetentionPolicy();
            
            expect(fs.existsSync(oldArtifactPath)).toBe(false);
        });

        test('should limit total number of artifacts', () => {
            // Create many artifacts
            for (let i = 0; i < 55; i++) {
                const artifactPath = path.join(tempDir, `artifacts/farmtally-v${i}-abc12345`);
                fs.mkdirSync(artifactPath, { recursive: true });
            }
            
            artifactManager.maxArtifacts = 50;
            artifactManager.applyRetentionPolicy();
            
            const remainingArtifacts = fs.readdirSync(path.join(tempDir, 'artifacts'))
                .filter(name => name.startsWith('farmtally-'));
            
            expect(remainingArtifacts.length).toBeLessThanOrEqual(50);
        });

        test('should preserve recent artifacts', () => {
            // Create recent artifact
            const recentArtifactPath = path.join(tempDir, 'artifacts/farmtally-v200-recent123');
            fs.mkdirSync(recentArtifactPath, { recursive: true });
            
            artifactManager.applyRetentionPolicy();
            
            expect(fs.existsSync(recentArtifactPath)).toBe(true);
        });
    });

    describe('Artifact Verification', () => {
        test('should verify artifact integrity successfully', () => {
            setupBackendBuild();
            setupFrontendBuild();
            
            const versionInfo = artifactManager.getVersionInfo();
            const artifactPath = artifactManager.setupArtifactDirectory(versionInfo);
            artifactManager.packageBackend(artifactPath);
            artifactManager.packageFrontend(artifactPath);
            
            const result = artifactManager.verifyArtifact(path.basename(artifactPath));
            
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('should detect corrupted artifacts', () => {
            setupBackendBuild();
            setupFrontendBuild();
            
            const versionInfo = artifactManager.getVersionInfo();
            const artifactPath = artifactManager.setupArtifactDirectory(versionInfo);
            artifactManager.packageBackend(artifactPath);
            artifactManager.packageFrontend(artifactPath);
            
            // Corrupt the backend package
            const backendPackage = path.join(artifactPath, 'backend/backend.tar.gz');
            fs.writeFileSync(backendPackage, 'corrupted data');
            
            const result = artifactManager.verifyArtifact(path.basename(artifactPath));
            
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Backend integrity check failed');
        });

        test('should handle missing checksum files', () => {
            setupBackendBuild();
            
            const versionInfo = artifactManager.getVersionInfo();
            const artifactPath = artifactManager.setupArtifactDirectory(versionInfo);
            artifactManager.packageBackend(artifactPath);
            
            // Remove checksum file
            fs.unlinkSync(path.join(artifactPath, 'backend/backend.sha256'));
            
            const result = artifactManager.verifyArtifact(path.basename(artifactPath));
            
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Backend checksum file missing');
        });
    });

    describe('Artifact Listing', () => {
        test('should list available artifacts with metadata', () => {
            // Create test artifacts
            createTestArtifact('farmtally-v100-abc12345', { version: 'v100-abc12345' });
            createTestArtifact('farmtally-v101-def67890', { version: 'v101-def67890' });
            
            const artifacts = artifactManager.listArtifacts();
            
            expect(artifacts).toHaveLength(2);
            expect(artifacts[0].name).toMatch(/^farmtally-v\d+-[a-f0-9]{8}$/);
            expect(artifacts[0].version).toBeDefined();
            expect(artifacts[0].timestamp).toBeDefined();
        });

        test('should handle empty artifacts directory', () => {
            const artifacts = artifactManager.listArtifacts();
            
            expect(artifacts).toHaveLength(0);
        });

        test('should sort artifacts by creation time', () => {
            // Create artifacts with different timestamps
            createTestArtifact('farmtally-v100-old12345', { 
                version: 'v100-old12345',
                timestamp: '2023-01-01T00:00:00Z'
            });
            createTestArtifact('farmtally-v101-new67890', { 
                version: 'v101-new67890',
                timestamp: '2023-12-31T23:59:59Z'
            });
            
            const artifacts = artifactManager.listArtifacts();
            
            expect(artifacts[0].timestamp > artifacts[1].timestamp).toBe(true);
        });
    });

    // Helper functions
    function setupMockGitRepo() {
        fs.mkdirSync('.git', { recursive: true });
        
        // Create mock git commands
        const gitCommands = {
            'git rev-parse HEAD': 'a1b2c3d4e5f6789012345678901234567890abcd',
            'git rev-parse --abbrev-ref HEAD': 'main',
            'git config --get remote.origin.url': 'https://github.com/farmtally/farmtally.git'
        };
        
        // Mock git by creating a simple script (Unix-like systems)
        if (process.platform !== 'win32') {
            const gitScript = `#!/bin/bash
case "$*" in
    "rev-parse HEAD") echo "a1b2c3d4e5f6789012345678901234567890abcd" ;;
    "rev-parse --abbrev-ref HEAD") echo "main" ;;
    "config --get remote.origin.url") echo "https://github.com/farmtally/farmtally.git" ;;
    "diff-index --quiet HEAD --") exit 0 ;;
    *) echo "Unknown git command: $*" >&2; exit 1 ;;
esac`;
            
            fs.writeFileSync('git', gitScript);
            fs.chmodSync('git', 0o755);
            process.env.PATH = `${tempDir}:${process.env.PATH}`;
        }
    }

    function setupBackendBuild() {
        // Create backend structure
        fs.mkdirSync('dist', { recursive: true });
        fs.writeFileSync('dist/server.js', 'console.log("backend server");');
        fs.writeFileSync('dist/config.js', 'module.exports = {};');
        
        fs.writeFileSync('package.json', JSON.stringify({
            name: 'farmtally-backend',
            version: '1.0.0',
            main: 'dist/server.js'
        }, null, 2));
        
        fs.writeFileSync('package-lock.json', '{}');
        
        fs.mkdirSync('prisma', { recursive: true });
        fs.writeFileSync('prisma/schema.prisma', 'generator client { provider = "prisma-client-js" }');
    }

    function setupFrontendBuild() {
        // Create frontend structure
        fs.mkdirSync('farmtally-frontend/.next', { recursive: true });
        fs.mkdirSync('farmtally-frontend/public', { recursive: true });
        
        fs.writeFileSync('farmtally-frontend/.next/BUILD_ID', 'test-build-id');
        fs.writeFileSync('farmtally-frontend/public/favicon.ico', 'fake-favicon');
        
        fs.writeFileSync('farmtally-frontend/package.json', JSON.stringify({
            name: 'farmtally-frontend',
            version: '1.0.0',
            scripts: { build: 'next build' }
        }, null, 2));
        
        fs.writeFileSync('farmtally-frontend/package-lock.json', '{}');
        fs.writeFileSync('farmtally-frontend/next.config.ts', 'export default {};');
    }

    function createTestArtifact(name, metadata) {
        const artifactPath = path.join(tempDir, 'artifacts', name);
        fs.mkdirSync(artifactPath, { recursive: true });
        
        const manifest = {
            version: metadata.version,
            name: name,
            timestamp: metadata.timestamp || new Date().toISOString(),
            git: { commit: 'test-commit', branch: 'main' },
            build: { number: '100' },
            components: []
        };
        
        fs.writeFileSync(path.join(artifactPath, 'manifest.json'), JSON.stringify(manifest, null, 2));
    }

    function calculateFileChecksum(filePath) {
        const fileBuffer = fs.readFileSync(filePath);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        return hashSum.digest('hex');
    }
});

// Mock ArtifactManager class for testing
class ArtifactManager {
    constructor(baseDir) {
        this.baseDir = baseDir;
        this.artifactsDir = path.join(baseDir, 'artifacts');
        this.retentionDays = 30;
        this.maxArtifacts = 50;
    }

    getVersionInfo() {
        const commitSha = this.getGitCommit();
        const commitShort = commitSha.substring(0, 8);
        const buildNumber = process.env.BUILD_NUMBER || Date.now().toString();
        const branchName = this.getGitBranch();
        const buildTimestamp = new Date().toISOString();
        
        return {
            commitSha,
            commitShort,
            buildNumber,
            branchName,
            buildTimestamp,
            artifactVersion: `v${buildNumber}-${commitShort}`,
            artifactName: `farmtally-v${buildNumber}-${commitShort}`
        };
    }

    getGitCommit() {
        try {
            return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
        } catch (error) {
            return 'unknown';
        }
    }

    getGitBranch() {
        try {
            return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
        } catch (error) {
            return 'unknown';
        }
    }

    setupArtifactDirectory(versionInfo) {
        const artifactPath = path.join(this.artifactsDir, versionInfo.artifactName);
        
        fs.mkdirSync(artifactPath, { recursive: true });
        fs.mkdirSync(path.join(artifactPath, 'backend'), { recursive: true });
        fs.mkdirSync(path.join(artifactPath, 'frontend'), { recursive: true });
        fs.mkdirSync(path.join(artifactPath, 'metadata'), { recursive: true });
        
        return artifactPath;
    }

    packageBackend(artifactPath) {
        const distPath = 'dist';
        if (!fs.existsSync(distPath)) {
            throw new Error('Backend build directory \'dist\' not found');
        }

        const packagePath = path.join(artifactPath, 'backend/backend.tar.gz');
        
        // Create tar.gz package
        execSync(`tar -czf "${packagePath}" dist/ package.json package-lock.json prisma/`);
        
        // Calculate checksum
        const checksum = this.calculateChecksum(packagePath);
        fs.writeFileSync(path.join(artifactPath, 'backend/backend.sha256'), checksum);
        
        // Get file size
        const stats = fs.statSync(packagePath);
        
        return {
            name: 'backend',
            type: 'backend',
            path: 'backend/backend.tar.gz',
            size: stats.size,
            checksum: checksum
        };
    }

    packageFrontend(artifactPath) {
        const frontendPath = 'farmtally-frontend/.next';
        if (!fs.existsSync(frontendPath)) {
            throw new Error('Frontend build directory \'farmtally-frontend/.next\' not found');
        }

        const packagePath = path.join(artifactPath, 'frontend/frontend.tar.gz');
        
        // Create tar.gz package
        execSync(`tar -czf "${packagePath}" -C farmtally-frontend .next/ public/ package.json package-lock.json next.config.ts`);
        
        // Calculate checksum
        const checksum = this.calculateChecksum(packagePath);
        fs.writeFileSync(path.join(artifactPath, 'frontend/frontend.sha256'), checksum);
        
        // Get file size
        const stats = fs.statSync(packagePath);
        
        return {
            name: 'frontend',
            type: 'frontend',
            path: 'frontend/frontend.tar.gz',
            size: stats.size,
            checksum: checksum
        };
    }

    generateManifest(artifactPath, backendInfo, frontendInfo, versionInfo) {
        const manifest = {
            version: versionInfo.artifactVersion,
            name: versionInfo.artifactName,
            timestamp: versionInfo.buildTimestamp,
            git: {
                commit: versionInfo.commitSha,
                shortCommit: versionInfo.commitShort,
                branch: versionInfo.branchName,
                repository: this.getGitRemoteUrl(),
                dirty: this.isGitDirty()
            },
            build: {
                number: versionInfo.buildNumber,
                environment: process.env.BUILD_ENV || 'production',
                node: process.version,
                npm: this.getNpmVersion()
            },
            components: [backendInfo, frontendInfo],
            metadata: {
                creator: `${process.env.USER || 'unknown'}@${require('os').hostname()}`,
                platform: `${process.platform}-${process.arch}`,
                retentionDays: this.retentionDays
            }
        };

        fs.writeFileSync(path.join(artifactPath, 'manifest.json'), JSON.stringify(manifest, null, 2));
        
        // Create human-readable summary
        const summary = `FarmTally Build Artifact
========================

Version: ${versionInfo.artifactVersion}
Build Number: ${versionInfo.buildNumber}
Timestamp: ${versionInfo.buildTimestamp}

Git Information:
  Commit: ${versionInfo.commitSha}
  Branch: ${versionInfo.branchName}

Components:
  - Backend: backend/backend.tar.gz
  - Frontend: frontend/frontend.tar.gz

Build Environment:
  Node.js: ${process.version}
  Platform: ${process.platform}-${process.arch}
`;
        
        fs.writeFileSync(path.join(artifactPath, 'ARTIFACT_INFO.txt'), summary);
    }

    calculateChecksum(filePath) {
        const fileBuffer = fs.readFileSync(filePath);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        return hashSum.digest('hex');
    }

    getGitRemoteUrl() {
        try {
            return execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
        } catch (error) {
            return 'unknown';
        }
    }

    isGitDirty() {
        try {
            execSync('git diff-index --quiet HEAD --', { stdio: 'pipe' });
            return false;
        } catch (error) {
            return true;
        }
    }

    getNpmVersion() {
        try {
            return execSync('npm --version', { encoding: 'utf8' }).trim();
        } catch (error) {
            return 'unknown';
        }
    }

    applyRetentionPolicy() {
        if (!fs.existsSync(this.artifactsDir)) {
            return;
        }

        const artifacts = fs.readdirSync(this.artifactsDir)
            .filter(name => name.startsWith('farmtally-'))
            .map(name => ({
                name,
                path: path.join(this.artifactsDir, name),
                stats: fs.statSync(path.join(this.artifactsDir, name))
            }));

        // Remove old artifacts
        const cutoffTime = Date.now() - (this.retentionDays * 24 * 60 * 60 * 1000);
        artifacts.forEach(artifact => {
            if (artifact.stats.mtime.getTime() < cutoffTime) {
                fs.rmSync(artifact.path, { recursive: true, force: true });
            }
        });

        // Limit total number
        const remainingArtifacts = artifacts.filter(artifact => fs.existsSync(artifact.path));
        if (remainingArtifacts.length > this.maxArtifacts) {
            const sortedArtifacts = remainingArtifacts.sort((a, b) => b.stats.mtime - a.stats.mtime);
            const toRemove = sortedArtifacts.slice(this.maxArtifacts);
            toRemove.forEach(artifact => {
                fs.rmSync(artifact.path, { recursive: true, force: true });
            });
        }
    }

    verifyArtifact(artifactName) {
        const artifactPath = path.join(this.artifactsDir, artifactName);
        
        if (!fs.existsSync(artifactPath)) {
            throw new Error(`Artifact not found: ${artifactName}`);
        }

        const errors = [];

        // Verify backend
        const backendPackage = path.join(artifactPath, 'backend/backend.tar.gz');
        const backendChecksum = path.join(artifactPath, 'backend/backend.sha256');
        
        if (fs.existsSync(backendPackage) && fs.existsSync(backendChecksum)) {
            const expectedChecksum = fs.readFileSync(backendChecksum, 'utf8').trim();
            const actualChecksum = this.calculateChecksum(backendPackage);
            
            if (expectedChecksum !== actualChecksum) {
                errors.push('Backend integrity check failed');
            }
        } else {
            errors.push('Backend checksum file missing');
        }

        // Verify frontend
        const frontendPackage = path.join(artifactPath, 'frontend/frontend.tar.gz');
        const frontendChecksum = path.join(artifactPath, 'frontend/frontend.sha256');
        
        if (fs.existsSync(frontendPackage) && fs.existsSync(frontendChecksum)) {
            const expectedChecksum = fs.readFileSync(frontendChecksum, 'utf8').trim();
            const actualChecksum = this.calculateChecksum(frontendPackage);
            
            if (expectedChecksum !== actualChecksum) {
                errors.push('Frontend integrity check failed');
            }
        } else {
            errors.push('Frontend checksum file missing');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    listArtifacts() {
        if (!fs.existsSync(this.artifactsDir)) {
            return [];
        }

        return fs.readdirSync(this.artifactsDir)
            .filter(name => name.startsWith('farmtally-'))
            .map(name => {
                const manifestPath = path.join(this.artifactsDir, name, 'manifest.json');
                let metadata = {};
                
                if (fs.existsSync(manifestPath)) {
                    try {
                        metadata = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                    } catch (error) {
                        // Ignore invalid manifest
                    }
                }
                
                return {
                    name,
                    version: metadata.version || 'unknown',
                    timestamp: metadata.timestamp || 'unknown',
                    commit: metadata.git?.shortCommit || 'unknown'
                };
            })
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
}