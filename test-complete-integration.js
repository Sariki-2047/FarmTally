const axios = require('axios');

// Test the complete integration
const config = {
    frontend: 'http://localhost:3001',
    backend: {
        gateway: 'http://147.93.153.247:8090',
        auth: 'http://147.93.153.247:8081',
        fieldManager: 'http://147.93.153.247:8088',
        farmAdmin: 'http://147.93.153.247:8089'
    }
};

async function testCompleteIntegration() {
    console.log('🚀 TESTING COMPLETE FARMTALLY INTEGRATION');
    console.log('=========================================');
    
    const results = {
        frontend: null,
        backend: {},
        integration: null
    };
    
    // Test 1: Frontend Accessibility
    console.log('\n1️⃣ Testing Frontend Accessibility...');
    try {
        const response = await axios.get(config.frontend, { timeout: 5000 });
        console.log('✅ Frontend accessible at http://localhost:3001');
        results.frontend = 'SUCCESS';
    } catch (error) {
        console.log('❌ Frontend not accessible:', error.message);
        results.frontend = 'FAILED';
    }
    
    // Test 2: Backend Services
    console.log('\n2️⃣ Testing Backend Services...');
    for (const [service, url] of Object.entries(config.backend)) {
        try {
            const response = await axios.get(url, { timeout: 5000 });
            console.log(`✅ ${service} service operational (${url})`);
            results.backend[service] = 'SUCCESS';
        } catch (error) {
            console.log(`❌ ${service} service failed:`, error.message);
            results.backend[service] = 'FAILED';
        }
    }
    
    // Test 3: Frontend API Test Page
    console.log('\n3️⃣ Testing Frontend API Integration...');
    try {
        const response = await axios.get(`${config.frontend}/test-api`, { timeout: 10000 });
        console.log('✅ Frontend API test page accessible');
        results.integration = 'SUCCESS';
    } catch (error) {
        console.log('❌ Frontend API test page failed:', error.message);
        results.integration = 'FAILED';
    }
    
    // Test 4: Cross-Origin Requests (CORS)
    console.log('\n4️⃣ Testing Cross-Origin Requests...');
    try {
        // Simulate frontend calling backend
        const response = await axios.get(config.backend.gateway, {
            timeout: 5000,
            headers: {
                'Origin': config.frontend,
                'Access-Control-Request-Method': 'GET'
            }
        });
        console.log('✅ CORS configuration working');
    } catch (error) {
        console.log('⚠️  CORS may need configuration:', error.response?.status || error.message);
    }
    
    // Summary Report
    console.log('\n📊 INTEGRATION TEST SUMMARY');
    console.log('============================');
    
    const frontendStatus = results.frontend === 'SUCCESS' ? '✅' : '❌';
    const backendCount = Object.values(results.backend).filter(s => s === 'SUCCESS').length;
    const backendTotal = Object.keys(results.backend).length;
    const integrationStatus = results.integration === 'SUCCESS' ? '✅' : '❌';
    
    console.log(`${frontendStatus} Frontend: ${results.frontend}`);
    console.log(`${backendCount === backendTotal ? '✅' : '❌'} Backend Services: ${backendCount}/${backendTotal} operational`);
    console.log(`${integrationStatus} API Integration: ${results.integration}`);
    
    // Overall Status
    const allWorking = results.frontend === 'SUCCESS' && 
                      backendCount === backendTotal && 
                      results.integration === 'SUCCESS';
    
    if (allWorking) {
        console.log('\n🏆 COMPLETE INTEGRATION SUCCESS!');
        console.log('================================');
        console.log('✅ Frontend running on http://localhost:3001');
        console.log('✅ All backend microservices operational');
        console.log('✅ API integration working');
        console.log('✅ Ready for user testing!');
        
        console.log('\n🎯 NEXT STEPS:');
        console.log('1. Visit http://localhost:3001 to see your FarmTally app');
        console.log('2. Test the API at http://localhost:3001/test-api');
        console.log('3. Try the login flow');
        console.log('4. Deploy to production when ready');
        
    } else {
        console.log('\n⚠️  INTEGRATION ISSUES DETECTED');
        console.log('===============================');
        if (results.frontend !== 'SUCCESS') {
            console.log('❌ Frontend not accessible - check if npm run dev is running');
        }
        if (backendCount < backendTotal) {
            console.log('❌ Some backend services down - check Docker containers');
        }
        if (results.integration !== 'SUCCESS') {
            console.log('❌ API integration issues - check environment variables');
        }
    }
    
    return results;
}

// Run the test
testCompleteIntegration().catch(console.error);