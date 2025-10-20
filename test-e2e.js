const http = require('http');

class E2ETestSuite {
  constructor(baseUrl = 'http://127.0.0.1:8001') {
    this.baseUrl = baseUrl;
    this.testResults = [];
  }

  async makeRequest(path, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsedBody = body ? JSON.parse(body) : {};
            resolve({
              statusCode: res.statusCode,
              body: parsedBody,
              rawBody: body,
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              body: null,
              rawBody: body,
            });
          }
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

  async testEndpoint(name, path, method = 'GET', data = null, headers = {}, expectedStatus = 200) {
    console.log(`\n🧪 Testing ${name}...`);
    
    try {
      const result = await this.makeRequest(path, method, data, headers);
      
      const success = result.statusCode === expectedStatus;
      const status = success ? '✅' : '❌';
      
      console.log(`${status} ${name}`);
      console.log(`   Status: ${result.statusCode} (expected: ${expectedStatus})`);
      
      if (result.body && typeof result.body === 'object') {
        console.log(`   Response: ${JSON.stringify(result.body).substring(0, 100)}...`);
      } else {
        console.log(`   Response: ${result.rawBody.substring(0, 100)}...`);
      }
      
      this.testResults.push({
        name,
        success,
        statusCode: result.statusCode,
        expectedStatus,
        response: result.body,
      });
      
      return result;
    } catch (error) {
      console.log(`❌ ${name} - Error: ${error.message}`);
      this.testResults.push({
        name,
        success: false,
        error: error.message,
      });
      return null;
    }
  }

  async runE2ETests() {
    console.log('🚀 Starting End-to-End Tests');
    console.log('=' .repeat(50));

    // Test 1: Health Check
    await this.testEndpoint('Health Check', '/health', 'GET', null, {}, 200);
    await this.testEndpoint('Health Check Alt', '/healthz', 'GET', null, {}, 200);

    // Test 2: API Test Endpoints
    await this.testEndpoint('GET Test Endpoint', '/api/v1/test', 'GET', null, {}, 200);
    await this.testEndpoint('POST Test Endpoint', '/api/v1/test', 'POST', { test: 'data' }, {}, 200);

    // Test 3: Authentication Tests
    console.log('\n📋 Testing Authentication Flow...');
    
    // Test invalid login
    await this.testEndpoint(
      'Login (Invalid Credentials)', 
      '/api/v1/auth/login', 
      'POST', 
      { email: 'wrong@email.com', password: 'wrongpass' }, 
      {}, 
      401
    );

    // Test valid login
    const loginResult = await this.testEndpoint(
      'Login (Valid Credentials)', 
      '/api/v1/auth/login', 
      'POST', 
      { email: 'admin@farmtally.com', password: 'Admin123!' }, 
      {}, 
      200
    );

    let authToken = null;
    if (loginResult && loginResult.body && loginResult.body.data) {
      authToken = loginResult.body.data.tokens.accessToken;
      console.log('   🔑 Auth token obtained for further tests');
    }

    // Test 4: Field Manager Invitation
    console.log('\n👥 Testing Field Manager Management...');
    
    await this.testEndpoint(
      'Invite Field Manager (Valid)', 
      '/api/v1/admin/field-managers/invite', 
      'POST', 
      {
        name: 'Test Manager',
        email: 'testmanager@farmtally.com',
        phone: '9876543210',
        aadhaar: '123456789012'
      }, 
      {}, 
      200
    );

    await this.testEndpoint(
      'Invite Field Manager (Invalid - Missing Data)', 
      '/api/v1/admin/field-managers/invite', 
      'POST', 
      {
        name: 'Test Manager'
        // Missing email and phone
      }, 
      {}, 
      400
    );

    // Test 5: Field Manager Registration
    console.log('\n📝 Testing Field Manager Registration...');
    
    await this.testEndpoint(
      'Field Manager Registration', 
      '/api/v1/auth/register/field-manager', 
      'POST', 
      {
        token: 'test-token',
        password: 'Manager123!',
        confirmPassword: 'Manager123!'
      }, 
      {}, 
      200
    );

    // Test 6: Error Handling
    console.log('\n🚫 Testing Error Handling...');
    
    await this.testEndpoint('404 Not Found', '/api/v1/nonexistent', 'GET', null, {}, 404);
    await this.testEndpoint('Invalid JSON', '/api/v1/test', 'POST', 'invalid-json', {}, 400);

    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 End-to-End Test Summary');
    console.log('=' .repeat(50));
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(t => t.success).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`\n📈 Results:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   ✅ Passed: ${passedTests}`);
    console.log(`   ❌ Failed: ${failedTests}`);
    console.log(`   📊 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(t => !t.success)
        .forEach(test => {
          console.log(`   - ${test.name}: ${test.error || `Status ${test.statusCode} (expected ${test.expectedStatus})`}`);
        });
    }

    console.log('\n🎯 Key Functionality Status:');
    const keyTests = [
      'Health Check',
      'Login (Valid Credentials)',
      'Invite Field Manager (Valid)',
      'Field Manager Registration'
    ];
    
    keyTests.forEach(testName => {
      const test = this.testResults.find(t => t.name === testName);
      const status = test && test.success ? '✅' : '❌';
      console.log(`   ${status} ${testName}`);
    });

    const overallStatus = passedTests >= totalTests * 0.8 ? '✅ PASSED' : '❌ NEEDS ATTENTION';
    console.log(`\n🏆 Overall E2E Test Status: ${overallStatus}`);
  }
}

// Run the tests
async function main() {
  const testSuite = new E2ETestSuite();
  await testSuite.runE2ETests();
}

main().catch(console.error);