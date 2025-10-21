#!/usr/bin/env node

/**
 * Simple Server Integration Test
 * Tests the baseline functionality before deploying
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:9999';
const API_BASE = `${BASE_URL}/api/v1`;

async function runTests() {
  console.log('🧪 Starting Simple Server Integration Tests...\n');
  
  let passed = 0;
  let failed = 0;

  // Test 1: Health Check
  try {
    console.log('1️⃣ Testing Health Check...');
    const response = await axios.get(`${BASE_URL}/health`);
    
    if (response.status === 200 && response.data.status === 'OK') {
      console.log('✅ Health check passed');
      passed++;
    } else {
      console.log('❌ Health check failed:', response.data);
      failed++;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    failed++;
  }

  // Test 2: API Test Endpoint
  try {
    console.log('\n2️⃣ Testing API Test Endpoint...');
    const response = await axios.get(`${API_BASE}/test`);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ API test endpoint passed');
      passed++;
    } else {
      console.log('❌ API test endpoint failed:', response.data);
      failed++;
    }
  } catch (error) {
    console.log('❌ API test endpoint error:', error.message);
    failed++;
  }

  // Test 3: Login with Demo Credentials
  try {
    console.log('\n3️⃣ Testing Login...');
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@farmtally.com',
      password: 'Admin123!'
    });
    
    if (response.status === 200 && response.data.success && response.data.data.tokens) {
      console.log('✅ Login test passed');
      console.log('🎫 Token received:', response.data.data.tokens.accessToken ? 'YES' : 'NO');
      passed++;
      
      // Test 4: Authenticated Request
      try {
        console.log('\n4️⃣ Testing Authenticated Request...');
        const token = response.data.data.tokens.accessToken;
        const authResponse = await axios.get(`${API_BASE}/debug`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (authResponse.status === 200) {
          console.log('✅ Authenticated request passed');
          passed++;
        } else {
          console.log('❌ Authenticated request failed');
          failed++;
        }
      } catch (authError) {
        console.log('❌ Authenticated request error:', authError.message);
        failed++;
      }
      
    } else {
      console.log('❌ Login test failed:', response.data);
      failed++;
    }
  } catch (error) {
    console.log('❌ Login test error:', error.message);
    failed++;
  }

  // Summary
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Simple server is ready for deployment.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Check the server before deploying.');
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`, { timeout: 2000 });
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🔍 Checking if server is running...');
  
  const isRunning = await checkServer();
  
  if (!isRunning) {
    console.log('❌ Server is not running on', BASE_URL);
    console.log('💡 Start the server with: npm run dev:simple');
    process.exit(1);
  }
  
  console.log('✅ Server is running, starting tests...\n');
  await runTests();
}

main().catch(console.error);