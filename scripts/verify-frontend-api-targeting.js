#!/usr/bin/env node

/**
 * Frontend API Endpoint Targeting Verification Script
 * 
 * This script verifies that the frontend is correctly configured to target
 * the production API endpoints and validates the build output.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class FrontendApiTargetingVerifier {
    constructor(frontendDir = 'farmtally-frontend') {
        this.frontendDir = frontendDir;
        this.errors = [];
        this.warnings = [];
        this.verificationResults = {};
    }

    /**
     * Verify environment variables are correctly embedded in build
     */
    verifyBuildEnvironmentEmbedding() {
        console.log('🔍 Verifying environment variables are embedded in build...');
        
        const buildDir = path.join(this.frontendDir, '.next');
        
        if (!fs.existsSync(buildDir)) {
            this.errors.push('❌ Frontend build directory (.next) not found');
            return;
        }

        try {
            // Check for environment variables in Next.js build manifest
            const buildManifestPath = path.join(buildDir, 'build-manifest.json');
            if (fs.existsSync(buildManifestPath)) {
                console.log('✅ Build manifest found');
            }

            // Look for environment variables in static files
            this.searchForApiUrlInBuild(buildDir);
            
        } catch (error) {
            this.errors.push(`❌ Error verifying build embedding: ${error.message}`);
        }
    }

    /**
     * Search for API URL references in build output
     */
    searchForApiUrlInBuild(buildDir) {
        const expectedApiUrl = process.env.NEXT_PUBLIC_API_URL;
        
        if (!expectedApiUrl) {
            this.errors.push('❌ NEXT_PUBLIC_API_URL not available for verification');
            return;
        }

        console.log(`🔍 Searching for API URL references: ${expectedApiUrl}`);
        
        try {
            // Search in JavaScript chunks
            const staticDir = path.join(buildDir, 'static');
            if (fs.existsSync(staticDir)) {
                this.searchInDirectory(staticDir, expectedApiUrl);
            }

            // Search in server-side files
            const serverDir = path.join(buildDir, 'server');
            if (fs.existsSync(serverDir)) {
                this.searchInDirectory(serverDir, expectedApiUrl);
            }

        } catch (error) {
            this.warnings.push(`⚠️ Could not search build files: ${error.message}`);
        }
    }

    /**
     * Search for API URL in directory files
     */
    searchInDirectory(directory, searchTerm) {
        try {
            const files = this.getAllFiles(directory);
            let foundReferences = 0;

            for (const file of files) {
                if (file.endsWith('.js') || file.endsWith('.json')) {
                    try {
                        const content = fs.readFileSync(file, 'utf8');
                        if (content.includes(searchTerm)) {
                            foundReferences++;
                            console.log(`✅ Found API URL reference in: ${path.relative(this.frontendDir, file)}`);
                        }
                    } catch (error) {
                        // Skip files that can't be read
                    }
                }
            }

            if (foundReferences > 0) {
                this.verificationResults.apiUrlReferences = foundReferences;
                console.log(`✅ Found ${foundReferences} API URL references in build`);
            } else {
                this.warnings.push('⚠️ No API URL references found in build files - this may indicate environment variables are not being embedded');
            }

        } catch (error) {
            this.warnings.push(`⚠️ Error searching directory ${directory}: ${error.message}`);
        }
    }

    /**
     * Get all files recursively from directory
     */
    getAllFiles(directory) {
        const files = [];
        
        function traverse(dir) {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    traverse(fullPath);
                } else {
                    files.push(fullPath);
                }
            }
        }
        
        traverse(directory);
        return files;
    }

    /**
     * Verify API endpoint accessibility
     */
    async verifyApiEndpointAccessibility() {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        
        if (!apiUrl) {
            this.errors.push('❌ Cannot verify API accessibility - NEXT_PUBLIC_API_URL not set');
            return;
        }

        console.log(`🔍 Verifying API endpoint accessibility: ${apiUrl}`);
        
        try {
            // Use curl to test basic connectivity
            const healthEndpoint = `${apiUrl}/api/health`;
            
            console.log(`🔍 Testing health endpoint: ${healthEndpoint}`);
            
            const curlCommand = `curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 30 "${healthEndpoint}"`;
            const statusCode = execSync(curlCommand, { encoding: 'utf8' }).trim();
            
            if (statusCode === '200') {
                console.log('✅ API health endpoint accessible');
                this.verificationResults.apiAccessible = true;
            } else if (statusCode === '000') {
                this.warnings.push('⚠️ API endpoint not accessible - connection failed (this may be expected during build)');
                this.verificationResults.apiAccessible = false;
            } else {
                this.warnings.push(`⚠️ API health endpoint returned status: ${statusCode}`);
                this.verificationResults.apiAccessible = false;
            }
            
        } catch (error) {
            this.warnings.push(`⚠️ Could not verify API accessibility: ${error.message}`);
            this.verificationResults.apiAccessible = false;
        }
    }

    /**
     * Create API targeting test file
     */
    createApiTargetingTest() {
        console.log('📝 Creating API targeting test file...');
        
        const testContent = `
// API Targeting Verification Test
// This file is generated during build to verify correct API targeting

const API_CONFIG = {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '${process.env.NEXT_PUBLIC_API_URL}',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '${process.env.NEXT_PUBLIC_SUPABASE_URL}',
    socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || '${process.env.NEXT_PUBLIC_SOCKET_URL}',
    buildTime: '${new Date().toISOString()}',
    buildNumber: '${process.env.BUILD_NUMBER || 'local'}',
    gitCommit: '${process.env.GIT_COMMIT || 'unknown'}'
};

// Verify API configuration
export function verifyApiConfiguration() {
    const results = {
        baseUrl: {
            configured: !!API_CONFIG.baseUrl,
            value: API_CONFIG.baseUrl,
            isProduction: API_CONFIG.baseUrl && !API_CONFIG.baseUrl.includes('localhost')
        },
        supabaseUrl: {
            configured: !!API_CONFIG.supabaseUrl,
            value: API_CONFIG.supabaseUrl,
            isSupabase: API_CONFIG.supabaseUrl && API_CONFIG.supabaseUrl.includes('supabase.co')
        },
        socketUrl: {
            configured: !!API_CONFIG.socketUrl,
            value: API_CONFIG.socketUrl
        },
        buildInfo: {
            buildTime: API_CONFIG.buildTime,
            buildNumber: API_CONFIG.buildNumber,
            gitCommit: API_CONFIG.gitCommit
        }
    };
    
    return results;
}

// Log configuration for debugging
if (typeof window !== 'undefined') {
    console.log('🔧 FarmTally API Configuration:', API_CONFIG);
}

export default API_CONFIG;
`;

        const testFilePath = path.join(this.frontendDir, 'src', 'lib', 'api-config-verification.ts');
        
        try {
            // Ensure directory exists
            const testDir = path.dirname(testFilePath);
            if (!fs.existsSync(testDir)) {
                fs.mkdirSync(testDir, { recursive: true });
            }
            
            fs.writeFileSync(testFilePath, testContent);
            console.log(`✅ Created API targeting test file: ${testFilePath}`);
            
            return testFilePath;
            
        } catch (error) {
            this.errors.push(`❌ Failed to create API targeting test file: ${error.message}`);
            return null;
        }
    }

    /**
     * Verify Supabase configuration consistency
     */
    verifySupabaseConfiguration() {
        console.log('🔍 Verifying Supabase configuration consistency...');
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            this.warnings.push('⚠️ Supabase configuration incomplete - some features may not work');
            return;
        }

        try {
            // Check if Supabase client configuration exists
            const supabaseClientPath = path.join(this.frontendDir, 'src', 'lib', 'supabase.ts');
            
            if (fs.existsSync(supabaseClientPath)) {
                const clientContent = fs.readFileSync(supabaseClientPath, 'utf8');
                
                // Check if it uses environment variables
                if (clientContent.includes('NEXT_PUBLIC_SUPABASE_URL') && 
                    clientContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
                    console.log('✅ Supabase client uses environment variables');
                    this.verificationResults.supabaseConfigured = true;
                } else {
                    this.warnings.push('⚠️ Supabase client may not be using environment variables');
                    this.verificationResults.supabaseConfigured = false;
                }
            } else {
                this.warnings.push('⚠️ Supabase client configuration file not found');
                this.verificationResults.supabaseConfigured = false;
            }
            
        } catch (error) {
            this.warnings.push(`⚠️ Error verifying Supabase configuration: ${error.message}`);
        }
    }

    /**
     * Generate verification report
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            status: this.errors.length === 0 ? 'PASSED' : 'FAILED',
            errors: this.errors,
            warnings: this.warnings,
            verificationResults: this.verificationResults,
            environment: {
                apiUrl: process.env.NEXT_PUBLIC_API_URL,
                supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
                nodeEnv: process.env.NODE_ENV,
                buildNumber: process.env.BUILD_NUMBER || 'local'
            },
            summary: {
                errorCount: this.errors.length,
                warningCount: this.warnings.length,
                apiAccessible: this.verificationResults.apiAccessible,
                supabaseConfigured: this.verificationResults.supabaseConfigured,
                apiUrlReferences: this.verificationResults.apiUrlReferences || 0
            }
        };
        
        // Write report to file
        fs.writeFileSync('frontend-api-targeting-report.json', JSON.stringify(report, null, 2));
        
        return report;
    }

    /**
     * Run complete verification
     */
    async verify() {
        console.log('🚀 Starting frontend API targeting verification...\n');
        
        this.verifyBuildEnvironmentEmbedding();
        await this.verifyApiEndpointAccessibility();
        this.verifySupabaseConfiguration();
        this.createApiTargetingTest();
        
        const report = this.generateReport();
        
        console.log('\n📊 Verification Summary:');
        console.log(`   Status: ${report.status}`);
        console.log(`   API URL: ${report.environment.apiUrl || 'NOT SET'}`);
        console.log(`   API Accessible: ${report.summary.apiAccessible ? 'Yes' : 'No/Unknown'}`);
        console.log(`   Supabase Configured: ${report.summary.supabaseConfigured ? 'Yes' : 'No/Unknown'}`);
        console.log(`   API References Found: ${report.summary.apiUrlReferences}`);
        console.log(`   Errors: ${report.summary.errorCount}`);
        console.log(`   Warnings: ${report.summary.warningCount}`);
        
        if (this.warnings.length > 0) {
            console.log('\n⚠️ Warnings:');
            this.warnings.forEach(warning => console.log(`   ${warning}`));
        }
        
        if (this.errors.length > 0) {
            console.log('\n❌ Errors:');
            this.errors.forEach(error => console.log(`   ${error}`));
            console.log('\n💡 Please check frontend build configuration and environment variables.');
            process.exit(1);
        }
        
        console.log('\n✅ Frontend API targeting verification completed successfully!');
        return report;
    }
}

// CLI execution
if (require.main === module) {
    const frontendDir = process.argv[2] || 'farmtally-frontend';
    const verifier = new FrontendApiTargetingVerifier(frontendDir);
    
    verifier.verify().catch(error => {
        console.error('❌ Verification failed:', error.message);
        process.exit(1);
    });
}

module.exports = FrontendApiTargetingVerifier;