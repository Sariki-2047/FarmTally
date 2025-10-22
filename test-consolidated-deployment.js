#!/usr/bin/env node

// FarmTally Consolidated Deployment Test
// Tests all services on port 8080 with /farmtally/ subdirectory

const http = require('http');
const https = require('https');

const VPS_HOST = '147.93.153.247';
const BASE_PORT = 8085;
const BASE_URL = `http://${VPS_HOST}:${BASE_PORT}`;

// Test endpoints
const endpoints = [
    { name: 'Health Check', url: `${BASE_URL}/health`, method: 'GET' },
    { name: 'Frontend', url: `${BASE_URL}/farmtally/`, method: 'GET' },
    { name: 'API Gateway', url: `${BASE_URL}/farmtally/api-gateway/`, method: 'GET' },
    { name: 'Auth Service Health', url: `${BASE_URL}/farmtally/auth-service/health`, method: 'GET' },
    { name: 'Field Manager Health', url: `${BASE_URL}/farmtally/field-manager-service/health`, method: 'GET' },
    { name: 'Farm Admin Health', url: `${BASE_URL}/farmtally/farm-admin-service/health`, method: 'GET' }
];

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, method = 'GET', timeout = 10000) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: method,
            timeout: timeout,
            headers: {
                'User-Agent': 'FarmTally-Test-Client/1.0'
            }
        };

        const client = urlObj.protocol === 'https:' ? https : http;
        
        const req = client.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: data,
                    success: res.statusCode >= 200 && res.statusCode < 400
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.setTimeout(timeout);
        req.end();
    });
}

async function testEndpoint(endpoint) {
    try {
        log(`Testing ${endpoint.name}...`, 'blue');
        const result = await makeRequest(endpoint.url, endpoint.method);
        
        if (result.success) {
            log(`✅ ${endpoint.name}: OK (${result.statusCode})`, 'green');
            return { ...endpoint, status: 'success', statusCode: result.statusCode };
        } else {
            log(`❌ ${endpoint.name}: Failed (${result.statusCode})`, 'red');
            return { ...endpoint, status: 'failed', statusCode: result.statusCode };
        }
    } catch (error) {
        log(`❌ ${endpoint.name}: Error - ${error.message}`, 'red');
        return { ...endpoint, status: 'error', error: error.message };
    }
}

async function runTests() {
    log('🚀 Starting FarmTally Consolidated Deployment Tests', 'cyan');
    log(`📍 Testing against: ${BASE_URL}`, 'blue');
    log('=' .repeat(60), 'blue');

    const results = [];
    
    for (const endpoint of endpoints) {
        const result = await testEndpoint(endpoint);
        results.push(result);
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Summary
    log('\n' + '=' .repeat(60), 'blue');
    log('📊 Test Summary', 'cyan');
    log('=' .repeat(60), 'blue');

    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const errors = results.filter(r => r.status === 'error').length;

    log(`✅ Successful: ${successful}`, 'green');
    log(`❌ Failed: ${failed}`, 'red');
    log(`🔥 Errors: ${errors}`, 'yellow');
    log(`📈 Success Rate: ${((successful / results.length) * 100).toFixed(1)}%`, 'cyan');

    if (successful === results.length) {
        log('\n🎉 All tests passed! FarmTally consolidated deployment is working correctly.', 'green');
        log('\nAccess URLs:', 'cyan');
        log(`🌐 FarmTally App: ${BASE_URL}/farmtally/`, 'blue');
        log(`🔍 Health Check: ${BASE_URL}/health`, 'blue');
        log('\nAPI Endpoints:', 'cyan');
        log(`🚪 API Gateway: ${BASE_URL}/farmtally/api-gateway/`, 'blue');
        log(`🔐 Auth Service: ${BASE_URL}/farmtally/auth-service/`, 'blue');
        log(`👨‍🌾 Field Manager: ${BASE_URL}/farmtally/field-manager-service/`, 'blue');
        log(`🏢 Farm Admin: ${BASE_URL}/farmtally/farm-admin-service/`, 'blue');
    } else {
        log('\n⚠️  Some tests failed. Please check the deployment.', 'yellow');
        
        // Show failed tests
        const failedTests = results.filter(r => r.status !== 'success');
        if (failedTests.length > 0) {
            log('\nFailed Tests:', 'red');
            failedTests.forEach(test => {
                log(`  - ${test.name}: ${test.error || test.statusCode}`, 'red');
            });
        }
    }

    return results;
}

// Run tests if this script is executed directly
if (require.main === module) {
    runTests().catch(error => {
        log(`Fatal error: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = { runTests, testEndpoint };