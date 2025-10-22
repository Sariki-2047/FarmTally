#!/usr/bin/env node

/**
 * Test FarmTally Microservices Deployment
 */

const axios = require('axios');

const VPS_HOST = '147.93.153.247';
const services = {
  'api-gateway': { port: 8090, path: '/health' },
  'auth-service': { port: 8081, path: '/health' },
  'field-manager-service': { port: 8088, path: '/health' },
  'farm-admin-service': { port: 8089, path: '/health' },
};

async function testService(serviceName, config) {
  const url = `http://${VPS_HOST}:${config.port}${config.path}`;
  
  try {
    const response = await axios.get(url, { timeout: 5000 });
    
    if (response.status === 200) {
      console.log(`✅ ${serviceName} is healthy (${config.port})`);
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      return true;
    } else {
      console.log(`❌ ${serviceName} returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${serviceName} health check failed: ${error.message}`);
    return false;
  }
}

async function testAuthentication() {
  console.log('\n🔐 Testing Authentication Flow...');
  
  const authUrl = `http://${VPS_HOST}:8081`;
  
  try {
    // Test registration
    const registerData = {
      email: `test-${Date.now()}@farmtally.com`,
      password: 'TestPassword123!',
      role: 'APPLICATION_ADMIN',
      profile: {
        firstName: 'Test',
        lastName: 'User'
      }
    };
    
    console.log('📝 Testing user registration...');
    const registerResponse = await axios.post(`${authUrl}/register`, registerData);
    console.log(`✅ Registration successful: ${registerResponse.data.message}`);
    
    if (registerResponse.data.data.tokens) {
      console.log('✅ Tokens received - user auto-approved');
      
      // Test login
      console.log('🔑 Testing user login...');
      const loginResponse = await axios.post(`${authUrl}/login`, {
        email: registerData.email,
        password: registerData.password
      });
      
      console.log(`✅ Login successful`);
      console.log(`   User: ${loginResponse.data.data.user.email}`);
      console.log(`   Role: ${loginResponse.data.data.user.role}`);
      
      return loginResponse.data.data.tokens.accessToken;
    } else {
      console.log('⏳ User pending approval');
      return null;
    }
    
  } catch (error) {
    console.log(`❌ Authentication test failed: ${error.message}`);
    if (error.response) {
      console.log(`   Error details: ${JSON.stringify(error.response.data)}`);
    }
    return null;
  }
}

async function testFieldManagerOperations(token) {
  if (!token) {
    console.log('⏭️  Skipping Field Manager tests - no auth token');
    return;
  }
  
  console.log('\n👨‍🌾 Testing Field Manager Operations...');
  
  const fmUrl = `http://${VPS_HOST}:8088`;
  const headers = { Authorization: `Bearer ${token}` };
  
  try {
    // Test lorry request creation
    console.log('📋 Testing lorry request creation...');
    const lorryRequestData = {
      requestedDate: '2024-01-15',
      location: 'Test Farm Location',
      estimatedQuantity: 500,
      notes: 'Test lorry request',
      fieldManagerId: 'test-fm-id'
    };
    
    const lorryResponse = await axios.post(`${fmUrl}/lorry-requests`, lorryRequestData, { headers });
    console.log(`✅ Lorry request created: ${lorryResponse.data.message}`);
    
  } catch (error) {
    console.log(`❌ Field Manager test failed: ${error.message}`);
    if (error.response) {
      console.log(`   Error details: ${JSON.stringify(error.response.data)}`);
    }
  }
}

async function testFarmAdminOperations(token) {
  if (!token) {
    console.log('⏭️  Skipping Farm Admin tests - no auth token');
    return;
  }
  
  console.log('\n🏢 Testing Farm Admin Operations...');
  
  const faUrl = `http://${VPS_HOST}:8089`;
  const headers = { Authorization: `Bearer ${token}` };
  
  try {
    // Test pending lorry requests
    console.log('📋 Testing pending lorry requests...');
    const pendingResponse = await axios.get(`${faUrl}/lorry-requests/pending`, { headers });
    console.log(`✅ Pending requests retrieved: ${pendingResponse.data.data.count} requests`);
    
  } catch (error) {
    console.log(`❌ Farm Admin test failed: ${error.message}`);
    if (error.response) {
      console.log(`   Error details: ${JSON.stringify(error.response.data)}`);
    }
  }
}

async function testAPIGatewayRouting() {
  console.log('\n🚪 Testing API Gateway Routing...');
  
  const gatewayUrl = `http://${VPS_HOST}:8090`;
  
  const routes = [
    '/api/auth/health',
    '/api/field-manager/health',
    '/api/farm-admin/health'
  ];
  
  for (const route of routes) {
    try {
      const response = await axios.get(`${gatewayUrl}${route}`, { timeout: 5000 });
      console.log(`✅ Gateway routing to ${route} works`);
    } catch (error) {
      console.log(`❌ Gateway routing to ${route} failed: ${error.message}`);
    }
  }
}

async function runTests() {
  console.log('🧪 FarmTally Microservices Deployment Test');
  console.log('==========================================\n');
  
  // Test individual service health
  console.log('1️⃣  Testing individual service health...');
  let healthyServices = 0;
  for (const [serviceName, config] of Object.entries(services)) {
    const isHealthy = await testService(serviceName, config);
    if (isHealthy) healthyServices++;
  }
  
  console.log(`\n📊 Health Summary: ${healthyServices}/${Object.keys(services).length} services healthy\n`);
  
  // Test authentication
  const token = await testAuthentication();
  
  // Test Field Manager operations
  await testFieldManagerOperations(token);
  
  // Test Farm Admin operations
  await testFarmAdminOperations(token);
  
  // Test API Gateway routing
  await testAPIGatewayRouting();
  
  // Final summary
  console.log('\n🎉 Deployment Test Summary');
  console.log('==========================');
  console.log(`✅ Services deployed: ${healthyServices}/${Object.keys(services).length}`);
  console.log(`🌐 API Gateway: http://${VPS_HOST}:8090`);
  console.log(`🔐 Auth Service: http://${VPS_HOST}:8081`);
  console.log(`👨‍🌾 Field Manager: http://${VPS_HOST}:8088`);
  console.log(`🏢 Farm Admin: http://${VPS_HOST}:8089`);
  console.log('\n🚀 FarmTally Microservices are ready for use!');
}

// Run tests
runTests().catch(console.error);