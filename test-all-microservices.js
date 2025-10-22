const axios = require('axios');

const services = [
    {
        name: 'Field Manager Service',
        url: 'http://147.93.153.247:8088/',
        port: 8088
    },
    {
        name: 'Farm Admin Service', 
        url: 'http://147.93.153.247:8089/',
        port: 8089
    },
    {
        name: 'Auth Service',
        url: 'http://147.93.153.247:8081/',
        port: 8081
    },
    {
        name: 'API Gateway',
        url: 'http://147.93.153.247:8090/',
        port: 8090
    }
];

async function testService(service) {
    try {
        console.log(`\n🔍 Testing ${service.name}...`);
        const response = await axios.get(service.url, { timeout: 10000 });
        
        console.log(`✅ ${service.name} - Status: ${response.status}`);
        console.log(`📊 Response:`, response.data);
        
        return { service: service.name, status: 'SUCCESS', data: response.data };
    } catch (error) {
        console.log(`❌ ${service.name} - Error: ${error.message}`);
        return { service: service.name, status: 'FAILED', error: error.message };
    }
}

async function testAllServices() {
    console.log('🚀 TESTING ALL FARMTALLY MICROSERVICES');
    console.log('=====================================');
    
    const results = [];
    
    for (const service of services) {
        const result = await testService(service);
        results.push(result);
    }
    
    console.log('\n📋 SUMMARY REPORT');
    console.log('=================');
    
    const successful = results.filter(r => r.status === 'SUCCESS');
    const failed = results.filter(r => r.status === 'FAILED');
    
    console.log(`✅ Successful: ${successful.length}/${results.length}`);
    console.log(`❌ Failed: ${failed.length}/${results.length}`);
    
    if (successful.length > 0) {
        console.log('\n🎉 WORKING SERVICES:');
        successful.forEach(s => console.log(`  - ${s.service}`));
    }
    
    if (failed.length > 0) {
        console.log('\n⚠️  FAILED SERVICES:');
        failed.forEach(s => console.log(`  - ${s.service}: ${s.error}`));
    }
    
    if (successful.length === services.length) {
        console.log('\n🏆 ALL MICROSERVICES ARE OPERATIONAL!');
        console.log('Your FarmTally deployment is COMPLETE! 🌾');
    }
}

testAllServices().catch(console.error);