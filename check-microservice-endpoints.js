const axios = require('axios');

// Your operational microservices
const services = {
    'API Gateway': {
        url: 'http://147.93.153.247:8090',
        endpoints: []
    },
    'Auth Service': {
        url: 'http://147.93.153.247:8081',
        endpoints: ['/health', '/register', '/login', '/verify', '/users']
    },
    'Field Manager Service': {
        url: 'http://147.93.153.247:8088',
        endpoints: ['/health', '/lorry-requests', '/deliveries', '/advance-payments', '/dashboard/stats']
    },
    'Farm Admin Service': {
        url: 'http://147.93.153.247:8089',
        endpoints: ['/health', '/lorry-requests/pending', '/lorry-requests/:id/approve', '/lorry-requests/:id/reject', '/lorries', '/pricing-rules', '/settlements/pending', '/dashboard/stats']
    }
};

async function checkServiceEndpoints(serviceName, serviceConfig) {
    console.log(`\n🔍 Checking ${serviceName} (${serviceConfig.url})`);
    console.log('=' .repeat(50));
    
    try {
        // Get service info
        const response = await axios.get(serviceConfig.url, { timeout: 5000 });
        console.log('✅ Service Status:', response.data);
        
        // Test each endpoint
        for (const endpoint of serviceConfig.endpoints) {
            if (endpoint.includes(':id')) {
                console.log(`⚠️  ${endpoint} - Requires ID parameter (skipping)`);
                continue;
            }
            
            try {
                const endpointUrl = `${serviceConfig.url}${endpoint}`;
                const endpointResponse = await axios.get(endpointUrl, { timeout: 3000 });
                console.log(`✅ ${endpoint} - Status: ${endpointResponse.status}`);
            } catch (error) {
                console.log(`❌ ${endpoint} - Error: ${error.response?.status || error.message}`);
            }
        }
        
    } catch (error) {
        console.log(`❌ Service unreachable: ${error.message}`);
    }
}

async function checkAllEndpoints() {
    console.log('🚀 CHECKING ALL MICROSERVICE ENDPOINTS');
    console.log('=====================================');
    
    for (const [serviceName, serviceConfig] of Object.entries(services)) {
        await checkServiceEndpoints(serviceName, serviceConfig);
    }
    
    console.log('\n📋 FRONTEND API MAPPING NEEDED:');
    console.log('===============================');
    console.log('Current Frontend API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://147.93.153.247:8082');
    console.log('Should point to API Gateway:', 'http://147.93.153.247:8090');
    console.log('\nRequired Frontend Updates:');
    console.log('- Authentication: Use Auth Service (8081)');
    console.log('- Field Manager Features: Use Field Manager Service (8088)');
    console.log('- Farm Admin Features: Use Farm Admin Service (8089)');
    console.log('- API Gateway: Central routing (8090)');
}

checkAllEndpoints().catch(console.error);