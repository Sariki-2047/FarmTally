// Simple test to verify backend endpoints
const http = require('http');

function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 8001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: body
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

async function runTests() {
  console.log('🧪 Testing Backend Endpoints...');
  console.log('================================');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await testEndpoint('/healthz');
    console.log(`   Status: ${health.statusCode}`);
    console.log(`   Response: ${health.body}`);

    // Test field manager invitation endpoint
    console.log('\n2. Testing field manager invitation endpoint...');
    const invite = await testEndpoint('/api/v1/admin/field-managers/invite', 'POST', {
      name: 'Test User',
      email: 'test@example.com',
      phone: '9876543210'
    });
    console.log(`   Status: ${invite.statusCode}`);
    console.log(`   Response: ${invite.body}`);

  } catch (error) {
    console.error('❌ Error testing backend:', error.message);
  }
}

runTests();