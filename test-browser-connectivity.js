const http = require('http');

async function testConnectivity() {
  console.log('🔍 Testing FarmTally Application Connectivity...\n');

  // Test Backend API
  console.log('1. Testing Backend API (Port 8001)...');
  try {
    const backendResponse = await makeRequest('http://127.0.0.1:8001/health');
    if (backendResponse.statusCode === 200) {
      console.log('   ✅ Backend API is running and healthy');
      console.log(`   📊 Response time: ${backendResponse.responseTime}ms`);
    } else {
      console.log(`   ❌ Backend API returned status: ${backendResponse.statusCode}`);
    }
  } catch (error) {
    console.log(`   ❌ Backend API connection failed: ${error.message}`);
  }

  // Test Frontend Web Server
  console.log('\n2. Testing Frontend Web Server (Port 3005)...');
  try {
    const frontendResponse = await makeRequest('http://127.0.0.1:3005');
    if (frontendResponse.statusCode === 200) {
      console.log('   ✅ Frontend web server is running');
      console.log(`   📊 Response time: ${frontendResponse.responseTime}ms`);
    } else {
      console.log(`   ❌ Frontend web server returned status: ${frontendResponse.statusCode}`);
    }
  } catch (error) {
    console.log(`   ❌ Frontend web server connection failed: ${error.message}`);
  }

  // Test API Endpoints
  console.log('\n3. Testing Key API Endpoints...');
  
  const endpoints = [
    { name: 'Test Endpoint', url: 'http://127.0.0.1:8001/api/v1/test' },
    { name: 'Auth Login', url: 'http://127.0.0.1:8001/api/v1/auth/login' },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(endpoint.url, 'POST', { test: 'data' });
      console.log(`   ✅ ${endpoint.name}: Status ${response.statusCode} (${response.responseTime}ms)`);
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: ${error.message}`);
    }
  }

  console.log('\n🎯 Browser Testing Instructions:');
  console.log('=' .repeat(50));
  console.log('1. Open your web browser');
  console.log('2. Navigate to: http://localhost:3005');
  console.log('3. You should see the FarmTally application');
  console.log('4. Use these test credentials:');
  console.log('   • Email: admin@farmtally.com');
  console.log('   • Password: Admin123!');
  console.log('\n📋 Additional URLs to test:');
  console.log('   • API Health: http://localhost:8001/health');
  console.log('   • API Test: http://localhost:8001/api/v1/test');
  console.log('\n🔧 If you see any connection errors above:');
  console.log('   • Make sure both servers are running');
  console.log('   • Check that ports 3005 and 8001 are not blocked');
  console.log('   • Try restarting the servers');
}

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        resolve({
          statusCode: res.statusCode,
          body,
          responseTime,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

testConnectivity().catch(console.error);