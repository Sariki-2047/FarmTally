// Quick Status Check for Area 1 Deployment
const baseURL = 'http://147.93.153.247:8082';

async function quickCheck() {
  console.log('🔍 Quick Area 1 Status Check\n');
  
  try {
    // Check API endpoint
    const response = await fetch(`${baseURL}/api`);
    const data = await response.json();
    
    console.log('📡 API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    // Check if new version is deployed
    if (data.database === 'PostgreSQL' && data.version === 'Area 1 - Database Ready') {
      console.log('\n✅ NEW VERSION DEPLOYED!');
      console.log('✅ Area 1 endpoints should be available');
      
      // Quick test of new endpoints
      const endpoints = ['/api/health/db', '/api/users', '/api/organizations'];
      
      for (const endpoint of endpoints) {
        try {
          const testResponse = await fetch(`${baseURL}${endpoint}`);
          const testData = await testResponse.json();
          console.log(`✅ ${endpoint}: ${testData.status}`);
        } catch (error) {
          console.log(`❌ ${endpoint}: Error`);
        }
      }
    } else {
      console.log('\n⏳ OLD VERSION STILL RUNNING');
      console.log('💡 Jenkins deployment may still be in progress');
    }
    
  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }
}

quickCheck();