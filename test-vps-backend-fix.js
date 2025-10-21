#!/usr/bin/env node

/**
 * Test VPS Backend Fix
 */

async function testVPSBackend() {
  console.log('🧪 Testing VPS Backend Fix...\n');
  
  try {
    const response = await fetch('https://app.farmtally.in/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@farmtally.in',
        password: 'FarmTallyAdmin2024!'
      })
    });

    console.log('📡 Response Status:', response.status);
    
    const data = await response.json();
    console.log('📊 Response Data:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.success) {
      console.log('\n✅ VPS Backend Fix SUCCESSFUL!');
      console.log('🎯 Frontend should now be able to login');
      console.log('👤 User role:', data.data.user.role);
      console.log('🎫 Token provided:', data.data.tokens.accessToken ? 'YES' : 'NO');
    } else {
      console.log('\n❌ VPS Backend Fix FAILED');
      console.log('🔍 Error:', data.error || data.message);
    }
    
  } catch (error) {
    console.error('\n❌ Network Error:', error.message);
  }
}

testVPSBackend();