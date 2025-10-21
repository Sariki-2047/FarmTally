#!/usr/bin/env node

/**
 * Frontend Environment Variable Validation Script
 * 
 * This script validates that all required frontend environment variables
 * are properly set and accessible during the build process.
 */

const fs = require('fs');
const path = require('path');

// Required environment variables for frontend
const REQUIRED_FRONTEND_VARS = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_SUPABASE_URL', 
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_APP_NAME',
    'NEXT_PUBLIC_APP_VERSION'
];

// Optional environment variables with defaults
const OPTIONAL_FRONTEND_VARS = {
    'NODE_ENV': 'production',
    'NEXT_PUBLIC_SOCKET_URL': process.env.NEXT_PUBLIC_API_URL // Defaults to API URL
};

class FrontendEnvironmentValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.validatedVars = {};
    }

    /**
     * Validate all required environment variables
     */
    validateRequiredVariables() {
        console.log('🔍 Validating required frontend environment variables...');
        
        for (const varName of REQUIRED_FRONTEND_VARS) {
            const value = process.env[varName];
            
            if (!value || value.trim() === '') {
                this.errors.push(`❌ Required environment variable ${varName} is missing or empty`);
            } else {
                this.validatedVars[varName] = value;
                console.log(`✅ ${varName}: ${this.maskSensitiveValue(varName, value)}`);
            }
        }
    }

    /**
     * Validate optional environment variables and set defaults
     */
    validateOptionalVariables() {
        console.log('🔍 Validating optional frontend environment variables...');
        
        for (const [varName, defaultValue] of Object.entries(OPTIONAL_FRONTEND_VARS)) {
            const value = process.env[varName] || defaultValue;
            this.validatedVars[varName] = value;
            
            if (!process.env[varName]) {
                this.warnings.push(`⚠️ Optional variable ${varName} not set, using default: ${defaultValue}`);
            } else {
                console.log(`✅ ${varName}: ${this.maskSensitiveValue(varName, value)}`);
            }
        }
    }

    /**
     * Validate API URL format and accessibility
     */
    async validateApiUrl() {
        const apiUrl = this.validatedVars.NEXT_PUBLIC_API_URL;
        
        if (!apiUrl) {
            this.errors.push('❌ Cannot validate API URL - NEXT_PUBLIC_API_URL not set');
            return;
        }

        console.log('🔍 Validating API URL format...');
        
        try {
            const url = new URL(apiUrl);
            
            // Check protocol
            if (!['http:', 'https:'].includes(url.protocol)) {
                this.errors.push(`❌ Invalid API URL protocol: ${url.protocol}. Must be http: or https:`);
            }
            
            // Check if it's a valid host
            if (!url.hostname) {
                this.errors.push('❌ Invalid API URL: missing hostname');
            }
            
            // Warn about localhost in production
            if (process.env.NODE_ENV === 'production' && 
                (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
                this.warnings.push('⚠️ Using localhost API URL in production environment');
            }
            
            console.log(`✅ API URL format valid: ${url.protocol}//${url.host}`);
            
        } catch (error) {
            this.errors.push(`❌ Invalid API URL format: ${error.message}`);
        }
    }

    /**
     * Validate Supabase configuration
     */
    validateSupabaseConfig() {
        console.log('🔍 Validating Supabase configuration...');
        
        const supabaseUrl = this.validatedVars.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = this.validatedVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            this.errors.push('❌ Incomplete Supabase configuration');
            return;
        }

        try {
            const url = new URL(supabaseUrl);
            
            // Check if it's a Supabase URL
            if (!url.hostname.includes('supabase.co')) {
                this.warnings.push('⚠️ Supabase URL does not appear to be a standard Supabase domain');
            }
            
            // Check key format (basic validation)
            if (!supabaseKey.startsWith('eyJ')) {
                this.warnings.push('⚠️ Supabase anonymous key does not appear to be a valid JWT token');
            }
            
            console.log('✅ Supabase configuration appears valid');
            
        } catch (error) {
            this.errors.push(`❌ Invalid Supabase URL format: ${error.message}`);
        }
    }

    /**
     * Create .env.production file for build process
     */
    createProductionEnvFile(frontendDir = 'farmtally-frontend') {
        console.log('📝 Creating .env.production file for frontend build...');
        
        const envFilePath = path.join(frontendDir, '.env.production');
        const envContent = this.generateEnvFileContent();
        
        try {
            // Ensure frontend directory exists
            if (!fs.existsSync(frontendDir)) {
                throw new Error(`Frontend directory ${frontendDir} does not exist`);
            }
            
            fs.writeFileSync(envFilePath, envContent);
            console.log(`✅ Created ${envFilePath}`);
            
            return envFilePath;
            
        } catch (error) {
            this.errors.push(`❌ Failed to create .env.production file: ${error.message}`);
            return null;
        }
    }

    /**
     * Generate environment file content
     */
    generateEnvFileContent() {
        const lines = [
            '# FarmTally Frontend Production Environment Variables',
            '# Generated by Jenkins pipeline',
            '',
            '# Supabase Configuration',
            `NEXT_PUBLIC_SUPABASE_URL=${this.validatedVars.NEXT_PUBLIC_SUPABASE_URL}`,
            `NEXT_PUBLIC_SUPABASE_ANON_KEY=${this.validatedVars.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            '',
            '# API Configuration - Production Backend',
            `NEXT_PUBLIC_API_URL=${this.validatedVars.NEXT_PUBLIC_API_URL}`,
            `NEXT_PUBLIC_SOCKET_URL=${this.validatedVars.NEXT_PUBLIC_SOCKET_URL}`,
            '',
            '# App Configuration',
            `NEXT_PUBLIC_APP_NAME=${this.validatedVars.NEXT_PUBLIC_APP_NAME}`,
            `NEXT_PUBLIC_APP_VERSION=${this.validatedVars.NEXT_PUBLIC_APP_VERSION}`,
            '',
            '# Production',
            `NODE_ENV=${this.validatedVars.NODE_ENV}`,
            ''
        ];
        
        return lines.join('\n');
    }

    /**
     * Mask sensitive values for logging
     */
    maskSensitiveValue(varName, value) {
        if (varName.includes('KEY') || varName.includes('SECRET')) {
            return value.length > 10 ? 
                `${value.substring(0, 8)}...${value.substring(value.length - 4)}` : 
                '***masked***';
        }
        
        if (varName.includes('URL')) {
            try {
                const url = new URL(value);
                return `${url.protocol}//${url.host}${url.pathname ? url.pathname : ''}`;
            } catch {
                return value.length > 20 ? `${value.substring(0, 20)}...` : value;
            }
        }
        
        return value;
    }

    /**
     * Generate validation report
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            status: this.errors.length === 0 ? 'PASSED' : 'FAILED',
            errors: this.errors,
            warnings: this.warnings,
            validatedVariables: Object.keys(this.validatedVars),
            summary: {
                totalVariables: Object.keys(this.validatedVars).length,
                errorCount: this.errors.length,
                warningCount: this.warnings.length
            }
        };
        
        // Write report to file
        fs.writeFileSync('frontend-env-validation-report.json', JSON.stringify(report, null, 2));
        
        return report;
    }

    /**
     * Run complete validation
     */
    async validate() {
        console.log('🚀 Starting frontend environment validation...\n');
        
        this.validateRequiredVariables();
        this.validateOptionalVariables();
        await this.validateApiUrl();
        this.validateSupabaseConfig();
        
        const report = this.generateReport();
        
        console.log('\n📊 Validation Summary:');
        console.log(`   Status: ${report.status}`);
        console.log(`   Variables validated: ${report.summary.totalVariables}`);
        console.log(`   Errors: ${report.summary.errorCount}`);
        console.log(`   Warnings: ${report.summary.warningCount}`);
        
        if (this.warnings.length > 0) {
            console.log('\n⚠️ Warnings:');
            this.warnings.forEach(warning => console.log(`   ${warning}`));
        }
        
        if (this.errors.length > 0) {
            console.log('\n❌ Errors:');
            this.errors.forEach(error => console.log(`   ${error}`));
            console.log('\n💡 Please ensure all required environment variables are set in Jenkins credentials.');
            process.exit(1);
        }
        
        console.log('\n✅ Frontend environment validation completed successfully!');
        return report;
    }
}

// CLI execution
if (require.main === module) {
    const validator = new FrontendEnvironmentValidator();
    
    // Handle command line arguments
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case 'validate':
            validator.validate().catch(error => {
                console.error('❌ Validation failed:', error.message);
                process.exit(1);
            });
            break;
            
        case 'create-env':
            const frontendDir = args[1] || 'farmtally-frontend';
            validator.validateRequiredVariables();
            validator.validateOptionalVariables();
            const envFile = validator.createProductionEnvFile(frontendDir);
            if (!envFile) {
                process.exit(1);
            }
            break;
            
        default:
            // Default: run full validation
            validator.validate().catch(error => {
                console.error('❌ Validation failed:', error.message);
                process.exit(1);
            });
    }
}

module.exports = FrontendEnvironmentValidator;