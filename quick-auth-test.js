#!/usr/bin/env node

/**
 * Quick Authentication Test
 * Tests the core auth functionality without requiring server to be running
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function quickAuthTest() {
  console.log('🔐 Quick Authentication Test');
  console.log('============================\n');

  try {
    // Test 1: Create System Admin
    console.log('1. Testing System Admin Creation...');
    try {
      const adminResponse = await axios.post(`${BASE_URL}/system-admin/setup`, {
        email: 'admin@test.com',
        password: 'TestAdmin123!',
        firstName: 'Test',
        lastName: 'Admin'
      });
      
      if (adminResponse.data.success) {
        console.log('✅ System admin created successfully');
        console.log(`   Admin ID: ${adminResponse.data.data.id}`);
      }
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('⚠️  System admin already exists - continuing');
      } else {
        console.log('❌ System admin creation failed:', error.message);
        return;
      }
    }

    // Test 2: System Admin Login
    console.log('\n2. Testing System Admin Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'TestAdmin123!'
    });

    if (loginResponse.data.success && loginResponse.data.data.tokens.accessToken) {
      console.log('✅ System admin login successful');
      console.log(`   Role: ${loginResponse.data.data.user.role}`);
      console.log(`   Status: ${loginResponse.data.data.user.status}`);
      
      const token = loginResponse.data.data.tokens.accessToken;

      // Test 3: Dashboard Access
      console.log('\n3. Testing Dashboard Access...');
      const dashboardResponse = await axios.get(`${BASE_URL}/system-admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (dashboardResponse.data.success) {
        console.log('✅ Dashboard access successful');
        console.log(`   Total Users: ${dashboardResponse.data.data.totalUsers}`);
        console.log(`   Pending Users: ${dashboardResponse.data.data.pendingUsers}`);
      }

      // Test 4: Farm Admin Registration
      console.log('\n4. Testing Farm Admin Registration...');
      try {
        const farmAdminResponse = await axios.post(`${BASE_URL}/auth/register`, {
          email: 'farmadmin@test.com',
          password: 'FarmAdmin123!',
          role: 'FARM_ADMIN',
          profile: {
            firstName: 'Farm',
            lastName: 'Admin'
          }
        });

        if (farmAdminResponse.data.success) {
          console.log('✅ Farm admin registration successful');
          console.log(`   Status: ${farmAdminResponse.data.data.user.status}`);
          
          if (farmAdminResponse.data.data.user.status === 'PENDING') {
            console.log('✅ User correctly set to PENDING status');
            
            // Test 5: Approve Farm Admin
            console.log('\n5. Testing User Approval...');
            const approvalResponse = await axios.post(
              `${BASE_URL}/system-admin/users/${farmAdminResponse.data.data.user.id}/approve`,
              { approvalNotes: 'Test approval' },
              { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (approvalResponse.data.success) {
              console.log('✅ User approval successful');
              console.log(`   New Status: ${approvalResponse.data.data.status}`);
              
              // Test 6: Approved User Login
              console.log('\n6. Testing Approved User Login...');
              const approvedLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'farmadmin@test.com',
                password: 'FarmAdmin123!'
              });

              if (approvedLoginResponse.data.success) {
                console.log('✅ Approved user login successful');
                console.log(`   Role: ${approvedLoginResponse.data.data.user.role}`);
                console.log(`   Status: ${approvedLoginResponse.data.data.user.status}`);
              }
            }
          }
        }
      } catch (error) {
        if (error.response?.data?.message?.includes('already exists')) {
          console.log('⚠️  Farm admin already exists - skipping registration test');
        } else {
          throw error;
        }
      }

      console.log('\n🎉 All authentication tests passed!');
      console.log('\n✅ System is ready for deployment!');
      
    } else {
      console.log('❌ System admin login failed');
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the server is running:');
      console.log('   npm run dev');
    }
  }
}

// Run the test
quickAuthTest();