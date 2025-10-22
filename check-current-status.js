#!/usr/bin/env node

// Check Current FarmTally Deployment Status

const http = require('http');

const VPS_HOST = '147.93.153.247';

// Test different configurations
const testConfigs = [
    { name: 'Port 8080 (Consolidated)', port: 8080, paths: ['/health', '/farmtally/', '/farmtally/api-gateway/'] },
    { name: 'API Gateway (Direct)', port: 8090, paths: ['/health', '/'] },
    { name: 'Auth Service (Direct)', port: 8081, paths: ['/health', '/'] },
    { name: 'Field Manager (Direct)', port: 8088, paths: ['/health', '/'] },
    { name: 'Farm Admin (Direct)', port: 8089, paths: ['/health', '/'] }
];

function makeRequest(host, port, path) {
    return new Promise((resolve) => {
        const options = {
            hostname: host,
            port: port,
            path: path,
            method: 'GET',
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            resolve({
                success: true,
                statusCode: res.statusCode,
                headers: res.headers
            });
        });

        req.on('error', (error) => {
            resolve({
                success: false,
                error: error.message
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                success: false,
                error: 'timeout'
            });
        });

        req.setTimeout(5000);
        req.end();
    });
}

async function checkStatus() {
    console.log('🔍 Checking Current FarmTally Deployment Status...\n');
    
    for (const config of testConfigs) {
        console.log(`📋 Testing ${config.name} (Port ${config.port}):`);
        
        for (const path of config.paths) {
            const result = await makeRequest(VPS_HOST, config.port, path);
            
            if (result.success) {
                const status = result.statusCode >= 200 && result.statusCode < 400 ? '✅' : '⚠️';
                console.log(`  ${status} ${path}: ${result.statusCode}`);
            } else {
                console.log(`  ❌ ${path}: ${result.error}`);
            }
        }
        console.log('');
    }

    // Check what's actually running
    console.log('🔍 Summary of Current Status:');
    console.log('================================');
    
    // Test port 8080 (consolidated)
    const port8080 = await makeRequest(VPS_HOST, 8080, '/health');
    if (port8080.success) {
        console.log('✅ Port 8080: Something is running (likely Apache/Nginx)');
        console.log('   Status:', port8080.statusCode);
        
        // Test if it's our consolidated setup
        const farmtally = await makeRequest(VPS_HOST, 8080, '/farmtally/');
        if (farmtally.success && farmtally.statusCode !== 403) {
            console.log('✅ Consolidated FarmTally: ACTIVE');
        } else {
            console.log('❌ Consolidated FarmTally: NOT ACTIVE (403 Forbidden)');
            console.log('   This suggests Apache/Nginx is running but not configured for FarmTally');
        }
    } else {
        console.log('❌ Port 8080: Nothing running');
    }

    // Test individual microservices
    const microservices = [
        { name: 'API Gateway', port: 8090 },
        { name: 'Auth Service', port: 8081 },
        { name: 'Field Manager', port: 8088 },
        { name: 'Farm Admin', port: 8089 }
    ];

    console.log('\n🔧 Individual Microservices:');
    let activeServices = 0;
    
    for (const service of microservices) {
        const result = await makeRequest(VPS_HOST, service.port, '/health');
        if (result.success && result.statusCode < 400) {
            console.log(`✅ ${service.name}: ACTIVE (${result.statusCode})`);
            activeServices++;
        } else {
            console.log(`❌ ${service.name}: INACTIVE`);
        }
    }

    console.log('\n📊 Deployment Analysis:');
    console.log('========================');
    
    if (port8080.success && port8080.statusCode === 302) {
        console.log('🔍 Port 8080 Status: Apache/Nginx is running but redirecting');
        console.log('   This means the web server is active but FarmTally is not deployed');
    }
    
    if (activeServices > 0) {
        console.log(`✅ ${activeServices}/4 microservices are running individually`);
        console.log('   These are the old deployment, not the consolidated version');
    } else {
        console.log('❌ No microservices are running');
    }

    console.log('\n🎯 Recommendation:');
    if (port8080.success && activeServices === 0) {
        console.log('   Deploy the consolidated version using: .\\deploy-consolidated.ps1');
    } else if (activeServices > 0) {
        console.log('   Stop old services and deploy consolidated version');
    } else {
        console.log('   Deploy FarmTally using the consolidated configuration');
    }
}

checkStatus().catch(console.error);