#!/usr/bin/env node

/**
 * Test Approval System
 */

async function testApprovalSystem() {
  console.log('🧪 Testing Approval System...\n');
  
  const baseUrl = 'https://app.farmtally.in/api';
  
  // Step 1: Register a new user
  console.log('1. 📝 Registering new test user...');
  const testEmail = 'approvaltest' + Date.now() + '@example.com';
  
  try {
    const regResponse = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPassword123!',
        firstName: 'Approval',
        lastName: 'Test',
        role: 'FARM_ADMIN',
        organizationName: 'Test Approval Farm'
      })
    });
    
    const regData = await regResponse.json();
    if (regData.success) {
      console.log('✅ Registration successful');
      console.log('👤 User ID:', regData.data.user.id);
      
      const userId = regData.data.user.id;
      
      // Step 2: Get pending users to verify it's there
      console.log('\n2. 📋 Checking pending users...');
      const pendingResponse = await fetch(`${baseUrl}/system-admin/users/pending`);
      const pendingData = await pendingResponse.json();
      
      if (pendingData.success && pendingData.data.length > 0) {
        console.log('✅ Found', pendingData.data.length, 'pending users');
        
        // Step 3: Approve the user
        console.log('\n3. ✅ Approving user...');
        const approveResponse = await fetch(`${baseUrl}/system-admin/users/${userId}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            approvalNotes: 'Approved during approval system testing'
          })
        });
        
        const approveData = await approveResponse.json();
        if (approveData.success) {
          console.log('✅ User approved successfully!');
          
          // Step 4: Test login with approved user
          console.log('\n4. 🔑 Testing login with approved user...');
          const loginResponse = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: testEmail,
              password: 'TestPassword123!'
            })
          });
          
          const loginData = await loginResponse.json();
          if (loginData.success) {
            console.log('✅ Approved user login successful!');
            console.log('👤 Role:', loginData.data.user.role);
            console.log('📊 Status:', loginData.data.user.status);
            console.log('🏢 Organization:', loginData.data.user.organization_id ? 'Created' : 'None');
          } else {
            console.log('❌ Login failed:', loginData.error);
          }
          
        } else {
          console.log('❌ Approval failed:', approveData.error);
        }
      } else {
        console.log('❌ No pending users found');
      }
      
    } else {
      console.log('❌ Registration failed:', regData.error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n🎯 Approval System Test Complete!');
}

testApprovalSystem();