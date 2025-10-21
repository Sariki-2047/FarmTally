// Monitor Area 1 Deployment Progress
// Check if new PostgreSQL endpoints are deployed

const baseURL = 'http://147.93.153.247:8082';

async function checkDeploymentStatus() {
  console.log('🔍 Monitoring Area 1 Deployment Status...\n');
  
  try {
    // Check API endpoint for new format
    console.log('📡 Checking API endpoint format...');
    const apiResponse = await fetch(`${baseURL}/api`);
    const apiData = await apiResponse.json();
    
    console.log('📋 Current API Response:');
    console.log(JSON.stringify(apiData, null, 2));
    
    // Check if new format is deployed
    if (apiData.database === 'PostgreSQL' && apiData.endpoints) {
      console.log('\n✅ NEW VERSION DEPLOYED!');
      console.log('✅ PostgreSQL endpoints are available');
      console.log('✅ Area 1 deployment successful');
      
      // Test the new endpoints
      console.log('\n🧪 Testing new endpoints...');
      
      const dbHealthResponse = await fetch(`${baseURL}/api/health/db`);
      if (dbHealthResponse.ok) {
        const dbHealthData = await dbHealthResponse.json();
        console.log('✅ Database health:', dbHealthData.status);
      }
      
      const usersResponse = await fetch(`${baseURL}/api/users`);
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log('✅ Users endpoint:', usersData.status);
      }
      
      return true;
    } else {
      console.log('\n⏳ OLD VERSION STILL RUNNING');
      console.log('⏳ Jenkins deployment in progress...');
      console.log('💡 New PostgreSQL endpoints not yet available');
      return false;
    }
    
  } catch (error) {
    console.log('❌ Error checking deployment:', error.message);
    return false;
  }
}

async function monitorWithRetry() {
  const maxAttempts = 10;
  const delayMs = 30000; // 30 seconds
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`\n🔄 Attempt ${attempt}/${maxAttempts}`);
    
    const isDeployed = await checkDeploymentStatus();
    
    if (isDeployed) {
      console.log('\n🎉 AREA 1 DEPLOYMENT COMPLETE!');
      console.log('🚀 Ready to test full functionality');
      break;
    }
    
    if (attempt < maxAttempts) {
      console.log(`\n⏰ Waiting 30 seconds before next check...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    } else {
      console.log('\n⚠️ Deployment taking longer than expected');
      console.log('💡 Check Jenkins build status manually');
      console.log('🔗 Jenkins: http://147.93.153.247:8080/job/farmtally-isolated/');
    }
  }
}

// Run monitoring
monitorWithRetry().catch(console.error);