#!/usr/bin/env node

/**
 * Test Complete Backend with Supabase
 */

async function testBackend() {
  console.log('🧪 Testing Complete Backend with Supabase...\n');
  
  // Test 1: Health check
  console.log('1. Testing health endpoint...');
  try {
    const healthResponse = await fetch('https://app.farmtally.in/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData.message);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
  
  // Test 2: Registration
  console.log('\n2. Testing registration...');
  try {
    const regResponse = await fetch('https://app.farmtally.in/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testfarm@example.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'Farm',
        role: 'FARM_ADMIN',
        organizationName: 'Test Farm Organization'
      })
    });
    
    const regData = await regResponse.json();
    if (regData.success) {
      console.log('✅ Registration successful:', regData.message);
    } else {
      console.log('❌ Registration failed:', regData.error);
    }
  } catch (error) {
    console.log('❌ Registration error:', error.message);
  }
  
  // Test 3: Get pending users
  console.log('\n3. Testing pending users endpoint...');
  try {
    const pendingResponse = await fetch('https://app.farmtally.in/api/system-admin/users/pending');
    const pendingData = await pendingResponse.json();
    if (pendingData.success) {
      console.log('✅ Pending users:', pendingData.data.length, 'users found');
      if (pendingData.data.length > 0) {
        console.log('📋 Latest pending user:', pendingData.data[0].email);
      }
    } else {
      console.log('❌ Pending users failed:', pendingData.error);
    }
  } catch (error) {
    console.log('❌ Pending users error:', error.message);
  }
  
  // Test 4: Login
  console.log('\n4. Testing admin login...');
  try {
    const loginResponse = await fetch('https://app.farmtally.in/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@farmtally.in',
        password: 'FarmTallyAdmin2024!'
      })
    });
    
    const loginData = await loginResponse.json();
    if (loginData.success) {
      console.log('✅ Admin login successful');
    } else {
      console.log('❌ Admin login failed:', loginData.error);
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
  }
  
  console.log('\n🎯 Backend testing complete!');
}

testBackend();