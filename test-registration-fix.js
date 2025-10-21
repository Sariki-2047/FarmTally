#!/usr/bin/env node

/**
 * Test Registration Fix
 */

async function testRegistration() {
  console.log('🧪 Testing Registration Fix...\n');
  
  try {
    const response = await fetch('https://app.farmtally.in/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'FARM_ADMIN',
        organizationName: 'Test Farm'
      })
    });

    console.log('📡 Response Status:', response.status);
    console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('📊 Response Data:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.success) {
      console.log('\n✅ Registration Fix SUCCESSFUL!');
      console.log('🎯 Registration should now work on frontend');
    } else {
      console.log('\n❌ Registration Fix FAILED');
      console.log('🔍 Error:', data.error || data.message);
    }
    
  } catch (error) {
    console.error('\n❌ Network Error:', error.message);
  }
}

testRegistration();