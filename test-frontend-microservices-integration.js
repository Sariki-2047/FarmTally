const axios = require('axios');

// Test the updated frontend API configuration
const frontendConfig = {
    gatewayURL: 'http://147.93.153.247:8090',
    authURL: 'http://147.93.153.247:8081', 
    fieldManagerURL: 'http://147.93.153.247:8088',
    farmAdminURL: 'http://147.93.153.247:8089'
};

async function testFrontendIntegration() {
    console.log('🚀 TESTING FRONTEND-MICROSERVICES INTEGRATION');
    console.log('==============================================');
    
    const tests = [
        {
            name: 'API Gateway Connection',
            url: frontendConfig.gatewayURL,
            endpoint: '/',
            description: 'Main API routing hub'
        },
        {
            name: 'Auth Service Health',
            url: frontendConfig.authURL,
            endpoint: '/health',
            description: 'Authentication service'
        },
        {
            name: 'Auth Service Users',
            url: frontendConfig.authURL,
            endpoint: '/users',
            description: 'User management endpoint'
        },
        {
            name: 'Field Manager Health',
            url: frontendConfig.fieldManagerURL,
            endpoint: '/health',
            description: 'Field manager service'
        },
        {
            name: 'Field Manager Lorry Requests',
            url: frontendConfig.fieldManagerURL,
            endpoint: '/lorry-requests',
            description: 'Lorry request management'
        },
        {
            name: 'Field Manager Deliveries',
            url: frontendConfig.fieldManagerURL,
            endpoint: '/deliveries',
            description: 'Delivery management'
        },
        {
            name: 'Farm Admin Health',
            url: frontendConfig.farmAdminURL,
            endpoint: '/health',
            description: 'Farm admin service'
        },
        {
            name: 'Farm Admin Lorries',
            url: frontendConfig.farmAdminURL,
            endpoint: '/lorries',
            description: 'Fleet management'
        },
        {
            name: 'Farm Admin Pricing Rules',
            url: frontendConfig.farmAdminURL,
            endpoint: '/pricing-rules',
            description: 'Pricing configuration'
        }
    ];
    
    const results = [];
    
    for (const test of tests) {
        try {
            console.log(`\n🔍 Testing: ${test.name}`);
            const response = await axios.get(`${test.url}${test.endpoint}`, { timeout: 5000 });
            console.log(`✅ ${test.name} - Status: ${response.status}`);
            console.log(`📝 ${test.description}`);
            results.push({ ...test, status: 'SUCCESS', code: response.status });
        } catch (error) {
            console.log(`❌ ${test.name} - Error: ${error.response?.status || error.message}`);
            results.push({ ...test, status: 'FAILED', error: error.message });
        }
    }
    
    console.log('\n📊 INTEGRATION TEST SUMMARY');
    console.log('============================');
    
    const successful = results.filter(r => r.status === 'SUCCESS');
    const failed = results.filter(r => r.status === 'FAILED');
    
    console.log(`✅ Successful: ${successful.length}/${results.length}`);
    console.log(`❌ Failed: ${failed.length}/${results.length}`);
    
    if (successful.length > 0) {
        console.log('\n🎉 WORKING ENDPOINTS:');
        successful.forEach(s => console.log(`  ✅ ${s.name} (${s.url}${s.endpoint})`));
    }
    
    if (failed.length > 0) {
        console.log('\n⚠️  FAILED ENDPOINTS:');
        failed.forEach(f => console.log(`  ❌ ${f.name}: ${f.error}`));
    }
    
    console.log('\n🔧 FRONTEND CONFIGURATION STATUS:');
    console.log('==================================');
    console.log('Environment Variables Updated:');
    console.log(`  NEXT_PUBLIC_API_URL: ${frontendConfig.gatewayURL}`);
    console.log(`  NEXT_PUBLIC_AUTH_URL: ${frontendConfig.authURL}`);
    console.log(`  NEXT_PUBLIC_FIELD_MANAGER_URL: ${frontendConfig.fieldManagerURL}`);
    console.log(`  NEXT_PUBLIC_FARM_ADMIN_URL: ${frontendConfig.farmAdminURL}`);
    
    if (successful.length === results.length) {
        console.log('\n🏆 FRONTEND INTEGRATION COMPLETE!');
        console.log('Your frontend is now connected to all microservices! 🌾');
        console.log('\nNext Steps:');
        console.log('1. Build and test the frontend locally');
        console.log('2. Deploy the integrated frontend to VPS');
        console.log('3. Test complete user workflows');
    } else {
        console.log('\n⚠️  Some endpoints need attention before deployment');
    }
}

testFrontendIntegration().catch(console.error);