// Test Area 1 Deployment Results
// Verify that Area 1 (Database Integration) is working on VPS

const baseURL = 'http://147.93.153.247:8082';

async function testArea1Deployment() {
  console.log('🧪 Testing Area 1 Deployment Results...\n');
  console.log(`🌐 Testing against: ${baseURL}\n`);
  
  const tests = [
    {
      name: 'Backend Health Check',
      url: `${baseURL}/health`,
      expected: 'ok'
    },
    {
      name: 'Database Health Check',
      url: `${baseURL}/api/health/db`,
      expected: 'connected'
    },
    {
      name: 'API Info Endpoint',
      url: `${baseURL}/api`,
      expected: 'success'
    },
    {
      name: 'Users Endpoint (GET)',
      url: `${baseURL}/api/users`,
      expected: 'success'
    },
    {
      name: 'Organizations Endpoint (GET)',
      url: `${baseURL}/api/organizations`,
      expected: 'success'
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      console.log(`🔍 Testing: ${test.name}`);
      console.log(`   URL: ${test.url}`);
      
      const response = await fetch(test.url);
      const data = await response.json();
      
      if (response.ok && data.status === test.expected) {
        console.log(`   ✅ PASS - Status: ${data.status}`);
        if (data.database) console.log(`   📊 Database: ${data.database}`);
        if (data.count !== undefined) console.log(`   📈 Records: ${data.count}`);
        passedTests++;
      } else {
        console.log(`   ❌ FAIL - Expected: ${test.expected}, Got: ${data.status || 'error'}`);
        console.log(`   📋 Response:`, JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.log(`   ❌ FAIL - Network Error: ${error.message}`);
    }
    console.log('');
  }

  // Test CRUD Operations
  console.log('🔧 Testing CRUD Operations...\n');
  
  try {
    // Test creating a user
    console.log('📝 Testing User Creation...');
    const createUserResponse = await fetch(`${baseURL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test-area1@farmtally.com',
        role: 'FARM_ADMIN',
        name: 'Area 1 Test User',
        phone: '1234567890'
      }),
    });

    const createUserData = await createUserResponse.json();
    
    if (createUserResponse.ok && createUserData.status === 'success') {
      console.log('   ✅ User creation successful');
      console.log(`   👤 Created user: ${createUserData.data.email}`);
      console.log(`   🆔 User ID: ${createUserData.data.id}`);
      passedTests++;
    } else {
      console.log('   ❌ User creation failed');
      console.log('   📋 Response:', JSON.stringify(createUserData, null, 2));
    }
    totalTests++;
  } catch (error) {
    console.log(`   ❌ User creation error: ${error.message}`);
    totalTests++;
  }

  try {
    // Test creating an organization
    console.log('\n🏢 Testing Organization Creation...');
    const createOrgResponse = await fetch(`${baseURL}/api/organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Area 1 Test Farm',
        code: 'A1TF001',
        address: '123 Test Farm Road',
        phone: '9876543210',
        email: 'contact@area1testfarm.com'
      }),
    });

    const createOrgData = await createOrgResponse.json();
    
    if (createOrgResponse.ok && createOrgData.status === 'success') {
      console.log('   ✅ Organization creation successful');
      console.log(`   🏢 Created org: ${createOrgData.data.name}`);
      console.log(`   🆔 Org ID: ${createOrgData.data.id}`);
      passedTests++;
    } else {
      console.log('   ❌ Organization creation failed');
      console.log('   📋 Response:', JSON.stringify(createOrgData, null, 2));
    }
    totalTests++;
  } catch (error) {
    console.log(`   ❌ Organization creation error: ${error.message}`);
    totalTests++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 AREA 1 DEPLOYMENT TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`📈 Success Rate: ${Math.round((passedTests/totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 AREA 1 DEPLOYMENT SUCCESSFUL!');
    console.log('✅ Database integration complete');
    console.log('✅ CRUD operations working');
    console.log('✅ Real data flowing through PostgreSQL');
    console.log('✅ Ready for Area 2 (Authentication)');
  } else {
    console.log('\n⚠️ Some tests failed - deployment may still be in progress');
    console.log('💡 Wait a few minutes and run this test again');
  }

  console.log('\n🔗 Test these URLs manually:');
  console.log(`   Backend: ${baseURL}/health`);
  console.log(`   Database: ${baseURL}/api/health/db`);
  console.log(`   Users: ${baseURL}/api/users`);
  console.log(`   Organizations: ${baseURL}/api/organizations`);
  console.log(`   Frontend: http://147.93.153.247:8081`);
}

// Run the test
testArea1Deployment().catch(console.error);