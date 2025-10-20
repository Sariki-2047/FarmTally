// Test Current FarmTally Backend
const http = require('http');

console.log('🧪 Testing FarmTally Backend...');
console.log('================================');

// Test if the backend is running
const testEndpoint = (url, description) => {
  return new Promise((resolve) => {
    const request = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`✅ ${description}: ${res.statusCode} - ${data.substring(0, 100)}...`);
        resolve(true);
      });
    });
    
    request.on('error', (err) => {
      console.log(`❌ ${description}: ${err.message}`);
      resolve(false);
    });
    
    request.setTimeout(5000, () => {
      console.log(`⏰ ${description}: Timeout`);
      request.destroy();
      resolve(false);
    });
  });
};

async function testBackend() {
  console.log('Testing local backend endpoints...\n');
  
  const tests = [
    { url: 'http://localhost:3000/api/health', desc: 'Health Check' },
    { url: 'http://localhost:3000/api/auth/profile', desc: 'Auth Profile (should fail without token)' },
  ];
  
  for (const test of tests) {
    await testEndpoint(test.url, test.desc);
  }
  
  console.log('\n📋 Backend Status Summary:');
  console.log('==========================');
  console.log('If health check passed: ✅ Backend is running');
  console.log('If health check failed: ❌ Start backend with: npm run dev');
  console.log('');
  console.log('🔗 Available Endpoints:');
  console.log('   Health: http://localhost:3000/api/health');
  console.log('   Login: http://localhost:3000/api/auth/login');
  console.log('   Admin: http://localhost:3000/api/admin/dashboard');
  console.log('');
  console.log('🌐 Frontend Options:');
  console.log('   1. Use existing Node.js backend (recommended)');
  console.log('   2. Use Supabase Edge Functions (advanced)');
  console.log('   3. Deploy both to different services');
}

testBackend().catch(console.error);