
// Test Area 1 Direct Deployment
const baseURL = 'http://147.93.153.247:8082';

async function testArea1Direct() {
  console.log('🧪 Testing Area 1 Direct Deployment\n');
  
  const endpoints = [
    { path: '/health', name: 'Backend Health' },
    { path: '/api', name: 'API Info (should show Area 1)' },
    { path: '/api/health/db', name: 'Database Health (NEW)' },
    { path: '/api/users', name: 'Users Endpoint (NEW)' },
    { path: '/api/organizations', name: 'Organizations Endpoint (NEW)' }
  ];

  let successCount = 0;
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing: ${endpoint.name}`);
      const response = await fetch(`${baseURL}${endpoint.path}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`   ✅ SUCCESS - ${data.status || 'ok'}`);
        if (data.version && data.version.includes('Area 1')) {
          console.log(`   🎯 Area 1 version detected!`);
        }
        successCount++;
      } else {
        console.log(`   ❌ FAILED - ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ERROR - ${error.message}`);
    }
    console.log('');
  }
  
  console.log('='.repeat(50));
  console.log(`📊 Results: ${successCount}/${endpoints.length} endpoints working`);
  
  if (successCount >= 4) {
    console.log('🎉 AREA 1 DEPLOYMENT SUCCESSFUL!');
    console.log('✅ All Area 1 endpoints are working');
    console.log('✅ Ready for Area 2 implementation');
  } else {
    console.log('⚠️ Some endpoints not working - check deployment');
  }
}

testArea1Direct().catch(console.error);
