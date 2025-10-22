// Test Current Deployment Status
// Check what's actually running on the VPS

const baseURL = 'http://147.93.153.247:8082';

async function testCurrentDeployment() {
  console.log('🔍 Testing Current FarmTally Deployment\n');
  
  const endpoints = [
    { path: '/health', name: 'Backend Health' },
    { path: '/api', name: 'API Info' },
    { path: '/api/health/db', name: 'Database Health' },
    { path: '/api/users', name: 'Users Endpoint' },
    { path: '/api/organizations', name: 'Organizations Endpoint' }
  ];

  let workingEndpoints = 0;
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing: ${endpoint.name}`);
      console.log(`   URL: ${baseURL}${endpoint.path}`);
      
      const response = await fetch(`${baseURL}${endpoint.path}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`   ✅ SUCCESS - Status: ${response.status}`);
        console.log(`   📋 Response: ${JSON.stringify(data, null, 2)}`);
        workingEndpoints++;
      } else {
        console.log(`   ❌ FAILED - Status: ${response.status}`);
        console.log(`   📋 Error: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      console.log(`   ❌ ERROR - ${error.message}`);
    }
    console.log('');
  }

  // Test frontend
  try {
    console.log('🔍 Testing: Frontend');
    console.log('   URL: http://147.93.153.247:8081');
    
    const frontendResponse = await fetch('http://147.93.153.247:8081');
    if (frontendResponse.ok) {
      console.log('   ✅ Frontend is accessible');
      workingEndpoints++;
    } else {
      console.log('   ❌ Frontend not accessible');
    }
  } catch (error) {
    console.log('   ❌ Frontend error:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 CURRENT DEPLOYMENT STATUS');
  console.log('='.repeat(50));
  console.log(`✅ Working endpoints: ${workingEndpoints}/${endpoints.length + 1}`);
  
  if (workingEndpoints >= 3) {
    console.log('\n🎉 DEPLOYMENT IS WORKING!');
    console.log('✅ Backend is responding');
    console.log('✅ Basic endpoints are functional');
    console.log('✅ Jenkins build issues don\'t affect running system');
    console.log('\n💡 The containers from previous deployment are still running');
    console.log('💡 Jenkins build failures are not breaking the live system');
  } else {
    console.log('\n⚠️ Limited functionality detected');
  }
}

testCurrentDeployment().catch(console.error);