#!/usr/bin/env node

/**
 * Browser Network Log Validation Script
 * 
 * This script provides utilities for validating that the frontend
 * makes API calls to the correct production endpoints when deployed.
 */

const fs = require('fs');
const path = require('path');

class BrowserNetworkLogValidator {
    constructor() {
        this.expectedApiUrl = process.env.NEXT_PUBLIC_API_URL;
        this.expectedSocketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || this.expectedApiUrl;
        this.validationResults = {
            apiCalls: [],
            socketConnections: [],
            errors: [],
            warnings: []
        };
    }

    /**
     * Generate browser testing instructions
     */
    generateBrowserTestInstructions() {
        const instructions = {
            title: "Browser Network Log Validation Instructions",
            description: "Follow these steps to validate API endpoint targeting in production",
            expectedEndpoints: {
                api: this.expectedApiUrl,
                socket: this.expectedSocketUrl
            },
            steps: [
                {
                    step: 1,
                    title: "Open Browser Developer Tools",
                    instructions: [
                        "Open the FarmTally application in your browser",
                        "Press F12 or right-click and select 'Inspect'",
                        "Navigate to the 'Network' tab",
                        "Ensure 'All' or 'XHR/Fetch' filter is selected"
                    ]
                },
                {
                    step: 2,
                    title: "Clear Network Log and Reload",
                    instructions: [
                        "Click the clear button (🚫) in the Network tab",
                        "Reload the page (F5 or Ctrl+R)",
                        "Observe network requests as they appear"
                    ]
                },
                {
                    step: 3,
                    title: "Validate API Calls",
                    instructions: [
                        `Look for requests to: ${this.expectedApiUrl}`,
                        "Common endpoints to check:",
                        "  - /api/health (health check)",
                        "  - /api/auth/* (authentication)",
                        "  - /api/farmers/* (farmer data)",
                        "  - /api/lorries/* (lorry management)",
                        "Verify NO requests go to localhost or development URLs"
                    ]
                },
                {
                    step: 4,
                    title: "Test User Interactions",
                    instructions: [
                        "Perform login/logout operations",
                        "Navigate between different pages",
                        "Submit forms or update data",
                        "Monitor all API calls during these actions"
                    ]
                },
                {
                    step: 5,
                    title: "Validate WebSocket Connections",
                    instructions: [
                        "Look for WebSocket connections in the Network tab",
                        `Verify connections go to: ${this.expectedSocketUrl}`,
                        "Check for successful connection establishment",
                        "Monitor real-time data updates"
                    ]
                },
                {
                    step: 6,
                    title: "Document Results",
                    instructions: [
                        "Take screenshots of the Network tab",
                        "Note any requests to incorrect endpoints",
                        "Record any failed requests or errors",
                        "Save HAR file if detailed analysis is needed"
                    ]
                }
            ],
            redFlags: [
                "Requests to localhost:3000 or 127.0.0.1",
                "Requests to development/staging URLs",
                "Failed API calls (4xx/5xx status codes)",
                "CORS errors in console",
                "WebSocket connection failures"
            ],
            expectedBehavior: [
                `All API requests target: ${this.expectedApiUrl}`,
                `WebSocket connections target: ${this.expectedSocketUrl}`,
                "Successful authentication flows",
                "Data loading without errors",
                "Real-time updates working correctly"
            ]
        };

        return instructions;
    }

    /**
     * Create automated browser test script
     */
    createAutomatedBrowserTest() {
        const testScript = `
/**
 * Automated Browser Network Validation Test
 * 
 * This script can be run in the browser console to automatically
 * validate API endpoint targeting.
 */

(function() {
    'use strict';
    
    const EXPECTED_API_URL = '${this.expectedApiUrl}';
    const EXPECTED_SOCKET_URL = '${this.expectedSocketUrl}';
    
    class NetworkValidator {
        constructor() {
            this.interceptedRequests = [];
            this.originalFetch = window.fetch;
            this.originalXHROpen = XMLHttpRequest.prototype.open;
            this.results = {
                correctRequests: 0,
                incorrectRequests: 0,
                errors: []
            };
            
            this.setupInterceptors();
        }
        
        setupInterceptors() {
            const self = this;
            
            // Intercept fetch requests
            window.fetch = function(...args) {
                const url = args[0];
                self.validateRequest('fetch', url);
                return self.originalFetch.apply(this, args);
            };
            
            // Intercept XMLHttpRequest
            XMLHttpRequest.prototype.open = function(method, url, ...args) {
                self.validateRequest('xhr', url);
                return self.originalXHROpen.apply(this, [method, url, ...args]);
            };
        }
        
        validateRequest(type, url) {
            const fullUrl = new URL(url, window.location.origin).href;
            
            this.interceptedRequests.push({
                type,
                url: fullUrl,
                timestamp: new Date().toISOString(),
                isCorrect: this.isCorrectEndpoint(fullUrl)
            });
            
            if (this.isCorrectEndpoint(fullUrl)) {
                this.results.correctRequests++;
                console.log('✅ Correct API call:', fullUrl);
            } else if (this.isApiCall(fullUrl)) {
                this.results.incorrectRequests++;
                console.warn('❌ Incorrect API call:', fullUrl);
                this.results.errors.push(\`Incorrect API endpoint: \${fullUrl}\`);
            }
        }
        
        isCorrectEndpoint(url) {
            return url.startsWith(EXPECTED_API_URL) || 
                   url.startsWith(EXPECTED_SOCKET_URL);
        }
        
        isApiCall(url) {
            return url.includes('/api/') || 
                   url.includes('localhost') || 
                   url.includes('127.0.0.1') ||
                   url.includes(':3000') ||
                   url.includes(':3001');
        }
        
        generateReport() {
            const report = {
                timestamp: new Date().toISOString(),
                expectedEndpoints: {
                    api: EXPECTED_API_URL,
                    socket: EXPECTED_SOCKET_URL
                },
                results: this.results,
                interceptedRequests: this.interceptedRequests,
                summary: {
                    totalRequests: this.interceptedRequests.length,
                    correctRequests: this.results.correctRequests,
                    incorrectRequests: this.results.incorrectRequests,
                    successRate: this.results.correctRequests / (this.results.correctRequests + this.results.incorrectRequests) * 100
                }
            };
            
            console.log('📊 Network Validation Report:', report);
            
            if (this.results.incorrectRequests > 0) {
                console.error('❌ Found incorrect API endpoints!');
                this.results.errors.forEach(error => console.error('  -', error));
            } else {
                console.log('✅ All API calls are targeting correct endpoints!');
            }
            
            return report;
        }
        
        restore() {
            window.fetch = this.originalFetch;
            XMLHttpRequest.prototype.open = this.originalXHROpen;
        }
    }
    
    // Create global validator instance
    window.farmtallyNetworkValidator = new NetworkValidator();
    
    console.log('🔍 FarmTally Network Validator started');
    console.log('Expected API URL:', EXPECTED_API_URL);
    console.log('Expected Socket URL:', EXPECTED_SOCKET_URL);
    console.log('');
    console.log('Use the following commands:');
    console.log('  farmtallyNetworkValidator.generateReport() - Generate validation report');
    console.log('  farmtallyNetworkValidator.restore() - Stop validation and restore original functions');
    
})();
`;

        return testScript;
    }

    /**
     * Create HAR file analysis script
     */
    createHarAnalysisScript() {
        const harScript = `
/**
 * HAR File Analysis Script for FarmTally
 * 
 * This script analyzes HAR (HTTP Archive) files to validate
 * API endpoint targeting in production.
 */

function analyzeHarFile(harData) {
    const expectedApiUrl = '${this.expectedApiUrl}';
    const expectedSocketUrl = '${this.expectedSocketUrl}';
    
    const results = {
        totalRequests: 0,
        apiRequests: 0,
        correctApiRequests: 0,
        incorrectApiRequests: 0,
        errors: [],
        requestDetails: []
    };
    
    if (!harData.log || !harData.log.entries) {
        throw new Error('Invalid HAR file format');
    }
    
    harData.log.entries.forEach(entry => {
        const url = entry.request.url;
        const method = entry.request.method;
        const status = entry.response.status;
        
        results.totalRequests++;
        
        // Check if this is an API request
        if (isApiRequest(url)) {
            results.apiRequests++;
            
            const isCorrect = url.startsWith(expectedApiUrl) || url.startsWith(expectedSocketUrl);
            
            if (isCorrect) {
                results.correctApiRequests++;
            } else {
                results.incorrectApiRequests++;
                results.errors.push(\`Incorrect API endpoint: \${method} \${url} (Status: \${status})\`);
            }
            
            results.requestDetails.push({
                method,
                url,
                status,
                isCorrect,
                timestamp: entry.startedDateTime
            });
        }
    });
    
    function isApiRequest(url) {
        return url.includes('/api/') || 
               url.includes('localhost') || 
               url.includes('127.0.0.1') ||
               url.includes(':3000') ||
               url.includes(':3001') ||
               url.includes('supabase.co');
    }
    
    // Generate summary
    results.summary = {
        successRate: results.apiRequests > 0 ? 
            (results.correctApiRequests / results.apiRequests * 100).toFixed(2) + '%' : 'N/A',
        hasErrors: results.incorrectApiRequests > 0
    };
    
    return results;
}

// Usage example:
// 1. Export HAR file from browser Network tab
// 2. Load HAR file: const harData = JSON.parse(harFileContent);
// 3. Analyze: const results = analyzeHarFile(harData);
// 4. Review results.errors for any issues
`;

        return harScript;
    }

    /**
     * Generate comprehensive validation package
     */
    generateValidationPackage() {
        const packageDir = 'browser-validation-package';
        
        if (!fs.existsSync(packageDir)) {
            fs.mkdirSync(packageDir, { recursive: true });
        }

        // Generate instructions
        const instructions = this.generateBrowserTestInstructions();
        fs.writeFileSync(
            path.join(packageDir, 'validation-instructions.json'),
            JSON.stringify(instructions, null, 2)
        );

        // Generate automated test script
        const testScript = this.createAutomatedBrowserTest();
        fs.writeFileSync(
            path.join(packageDir, 'automated-network-validator.js'),
            testScript
        );

        // Generate HAR analysis script
        const harScript = this.createHarAnalysisScript();
        fs.writeFileSync(
            path.join(packageDir, 'har-analysis-script.js'),
            harScript
        );

        // Generate README
        const readme = this.generateValidationReadme();
        fs.writeFileSync(
            path.join(packageDir, 'README.md'),
            readme
        );

        console.log(`✅ Browser validation package created in: ${packageDir}/`);
        return packageDir;
    }

    /**
     * Generate validation README
     */
    generateValidationReadme() {
        return `# FarmTally Browser Network Validation Package

This package contains tools and instructions for validating that the FarmTally frontend correctly targets production API endpoints.

## Expected Configuration

- **API URL**: ${this.expectedApiUrl}
- **Socket URL**: ${this.expectedSocketUrl}

## Files Included

### 1. validation-instructions.json
Detailed step-by-step instructions for manual browser testing.

### 2. automated-network-validator.js
JavaScript code to run in browser console for automated validation.

**Usage:**
1. Open FarmTally in browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Copy and paste the entire script
5. Use the application normally
6. Run \`farmtallyNetworkValidator.generateReport()\` to see results

### 3. har-analysis-script.js
Script for analyzing HAR files exported from browser Network tab.

**Usage:**
1. Open Network tab in Developer Tools
2. Use the application
3. Right-click in Network tab and select "Save all as HAR"
4. Load the HAR file and run analysis script

### 4. README.md
This file with usage instructions.

## Quick Validation Checklist

- [ ] All API calls go to: ${this.expectedApiUrl}
- [ ] WebSocket connections go to: ${this.expectedSocketUrl}
- [ ] No requests to localhost or development URLs
- [ ] Authentication flows work correctly
- [ ] Data loads without CORS errors
- [ ] Real-time features function properly

## Troubleshooting

If you find incorrect endpoints:
1. Check Jenkins credentials configuration
2. Verify environment variable injection in build process
3. Clear browser cache and reload
4. Check for cached service workers
5. Verify build artifacts contain correct configuration

## Support

For issues with validation or incorrect endpoints, check:
- Jenkins build logs
- Frontend environment configuration documentation
- API endpoint configuration in backend
`;
    }

    /**
     * Run validation package generation
     */
    run() {
        console.log('🚀 Generating browser network validation package...\n');
        
        if (!this.expectedApiUrl) {
            console.error('❌ NEXT_PUBLIC_API_URL not set - cannot generate validation package');
            process.exit(1);
        }

        console.log('📋 Configuration:');
        console.log(`   Expected API URL: ${this.expectedApiUrl}`);
        console.log(`   Expected Socket URL: ${this.expectedSocketUrl}`);
        console.log('');

        const packageDir = this.generateValidationPackage();
        
        console.log('\n📦 Validation package contents:');
        console.log('   - validation-instructions.json (Manual testing guide)');
        console.log('   - automated-network-validator.js (Browser console script)');
        console.log('   - har-analysis-script.js (HAR file analyzer)');
        console.log('   - README.md (Usage instructions)');
        
        console.log('\n✅ Browser network validation package ready!');
        console.log(`📁 Location: ${packageDir}/`);
        
        return packageDir;
    }
}

// CLI execution
if (require.main === module) {
    const validator = new BrowserNetworkLogValidator();
    validator.run();
}

module.exports = BrowserNetworkLogValidator;