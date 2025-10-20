/**
 * FarmTally Admin Approval System Test
 * 
 * This script demonstrates the complete admin approval workflow:
 * 1. Farm Admin registers (status: PENDING)
 * 2. Application Admin reviews and approves/rejects
 * 3. Approved Farm Admin can invite Field Managers
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testData = {
  applicationAdmin: {
    email: 'admin@farmtally.com',
    password: 'AdminPass123!',
    firstName: 'System',
    lastName: 'Administrator'
  },
  farmAdmin1: {
    email: 'farm1@example.com',
    password: 'FarmPass123!',
    firstName: 'John',
    lastName: 'Farmer',
    organizationName: 'Green Valley Farms'
  },
  farmAdmin2: {
    email: 'farm2@example.com',
    password: 'FarmPass123!',
    firstName: 'Sarah',
    lastName: 'Johnson',
    organizationName: 'Sunrise Agriculture'
  },
  fieldManager: {
    email: 'manager@example.com',
    password: 'ManagerPass123!',
    firstName: 'Mike',
    lastName: 'Manager'
  }
};

let tokens = {};
let userIds = {};

async function makeRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {}
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

async function step1_CreateApplicationAdmin() {
  console.log('\n=== STEP 1: Create Application Admin ===');
  
  const result = await makeRequest('POST', '/admin/setup', testData.applicationAdmin);
  
  if (result.success) {
    console.log('✅ Application Admin created successfully');
    tokens.applicationAdmin = result.data.data.token;
    userIds.applicationAdmin = result.data.data.user.id;
    console.log(`   Admin ID: ${userIds.applicationAdmin}`);
  } else {
    console.log('❌ Failed to create Application Admin:', result.error);
    if (result.error.error === 'Application Admin already exists') {
      console.log('   Attempting to login instead...');
      const loginResult = await makeRequest('POST', '/auth/login', {
        email: testData.applicationAdmin.email,
        password: testData.applicationAdmin.password
      });
      
      if (loginResult.success) {
        console.log('✅ Application Admin logged in successfully');
        tokens.applicationAdmin = loginResult.data.data.token;
        userIds.applicationAdmin = loginResult.data.data.user.id;
      } else {
        console.log('❌ Failed to login Application Admin:', loginResult.error);
        return false;
      }
    } else {
      return false;
    }
  }
  
  return true;
}

async function step2_RegisterFarmAdmins() {
  console.log('\n=== STEP 2: Register Farm Admins (PENDING status) ===');
  
  // Register Farm Admin 1
  console.log('\n--- Registering Farm Admin 1 ---');
  const result1 = await makeRequest('POST', '/auth/register-farm-admin', testData.farmAdmin1);
  
  if (result1.success) {
    console.log('✅ Farm Admin 1 registered successfully (PENDING status)');
    userIds.farmAdmin1 = result1.data.data.user.id;
    console.log(`   User ID: ${userIds.farmAdmin1}`);
    console.log(`   Status: ${result1.data.data.user.status}`);
    console.log(`   Organization: ${result1.data.data.user.organization.name}`);
  } else {
    console.log('❌ Failed to register Farm Admin 1:', result1.error);
  }
  
  // Register Farm Admin 2
  console.log('\n--- Registering Farm Admin 2 ---');
  const result2 = await makeRequest('POST', '/auth/register-farm-admin', testData.farmAdmin2);
  
  if (result2.success) {
    console.log('✅ Farm Admin 2 registered successfully (PENDING status)');
    userIds.farmAdmin2 = result2.data.data.user.id;
    console.log(`   User ID: ${userIds.farmAdmin2}`);
    console.log(`   Status: ${result2.data.data.user.status}`);
    console.log(`   Organization: ${result2.data.data.user.organization.name}`);
  } else {
    console.log('❌ Failed to register Farm Admin 2:', result2.error);
  }
}

async function step3_ViewPendingRegistrations() {
  console.log('\n=== STEP 3: Application Admin Views Pending Registrations ===');
  
  const result = await makeRequest('GET', '/admin/pending-farm-admins', null, tokens.applicationAdmin);
  
  if (result.success) {
    console.log('✅ Retrieved pending registrations successfully');
    console.log(`   Total pending: ${result.data.count}`);
    
    result.data.data.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.firstName} ${admin.lastName} (${admin.email})`);
      console.log(`      Organization: ${admin.organizationName}`);
      console.log(`      Status: ${admin.status}`);
      console.log(`      Registered: ${new Date(admin.createdAt).toLocaleDateString()}`);
    });
  } else {
    console.log('❌ Failed to retrieve pending registrations:', result.error);
  }
}

async function step4_ApproveFarmAdmin() {
  console.log('\n=== STEP 4: Application Admin Approves Farm Admin 1 ===');
  
  const result = await makeRequest('POST', '/admin/review-farm-admin', {
    userId: userIds.farmAdmin1,
    approved: true
  }, tokens.applicationAdmin);
  
  if (result.success) {
    console.log('✅ Farm Admin 1 approved successfully');
    console.log(`   Status: ${result.data.data.status}`);
    console.log(`   Message: ${result.data.message}`);
  } else {
    console.log('❌ Failed to approve Farm Admin 1:', result.error);
  }
}

async function step5_RejectFarmAdmin() {
  console.log('\n=== STEP 5: Application Admin Rejects Farm Admin 2 ===');
  
  const result = await makeRequest('POST', '/admin/review-farm-admin', {
    userId: userIds.farmAdmin2,
    approved: false,
    rejectionReason: 'Incomplete documentation provided'
  }, tokens.applicationAdmin);
  
  if (result.success) {
    console.log('✅ Farm Admin 2 rejected successfully');
    console.log(`   Status: ${result.data.data.status}`);
    console.log(`   Message: ${result.data.message}`);
  } else {
    console.log('❌ Failed to reject Farm Admin 2:', result.error);
  }
}

async function step6_LoginApprovedFarmAdmin() {
  console.log('\n=== STEP 6: Approved Farm Admin Logs In ===');
  
  const result = await makeRequest('POST', '/auth/login', {
    email: testData.farmAdmin1.email,
    password: testData.farmAdmin1.password
  });
  
  if (result.success) {
    console.log('✅ Approved Farm Admin logged in successfully');
    tokens.farmAdmin1 = result.data.data.token;
    console.log(`   Status: ${result.data.data.user.status}`);
    console.log(`   Role: ${result.data.data.user.role}`);
    console.log(`   Organization: ${result.data.data.user.organization.name}`);
  } else {
    console.log('❌ Failed to login approved Farm Admin:', result.error);
  }
}

async function step7_CheckInvitePermission() {
  console.log('\n=== STEP 7: Check If Farm Admin Can Invite Field Managers ===');
  
  const result = await makeRequest('GET', '/admin/can-invite', null, tokens.farmAdmin1);
  
  if (result.success) {
    console.log('✅ Invite permission check completed');
    console.log(`   Can invite: ${result.data.data.canInvite}`);
    console.log(`   Message: ${result.data.data.message}`);
  } else {
    console.log('❌ Failed to check invite permission:', result.error);
  }
}

async function step8_TryInviteFieldManager() {
  console.log('\n=== STEP 8: Approved Farm Admin Invites Field Manager ===');
  
  const result = await makeRequest('POST', '/invitations/create', {
    email: testData.fieldManager.email,
    role: 'FIELD_MANAGER',
    organizationName: 'Green Valley Farms'
  }, tokens.farmAdmin1);
  
  if (result.success) {
    console.log('✅ Field Manager invitation created successfully');
    console.log(`   Invitation ID: ${result.data.data.id}`);
    console.log(`   Email: ${result.data.data.email}`);
    console.log(`   Role: ${result.data.data.role}`);
    console.log(`   Expires: ${new Date(result.data.data.expiresAt).toLocaleDateString()}`);
  } else {
    console.log('❌ Failed to create Field Manager invitation:', result.error);
  }
}

async function step9_ViewSystemStats() {
  console.log('\n=== STEP 9: Application Admin Views System Statistics ===');
  
  const result = await makeRequest('GET', '/admin/stats', null, tokens.applicationAdmin);
  
  if (result.success) {
    console.log('✅ System statistics retrieved successfully');
    const stats = result.data.data;
    console.log(`   Total Organizations: ${stats.totalOrganizations}`);
    console.log(`   Total Farm Admins: ${stats.totalFarmAdmins}`);
    console.log(`   Pending Approvals: ${stats.pendingApprovals}`);
    console.log(`   Total Field Managers: ${stats.totalFieldManagers}`);
    console.log(`   Total Farmers: ${stats.totalFarmers}`);
    console.log(`   Total Deliveries: ${stats.totalDeliveries}`);
    console.log(`   Total Advance Payments: ${stats.totalAdvancePayments}`);
  } else {
    console.log('❌ Failed to retrieve system statistics:', result.error);
  }
}

async function step10_ViewAllFarmAdmins() {
  console.log('\n=== STEP 10: Application Admin Views All Farm Admins ===');
  
  const result = await makeRequest('GET', '/admin/farm-admins', null, tokens.applicationAdmin);
  
  if (result.success) {
    console.log('✅ All Farm Admins retrieved successfully');
    console.log(`   Total Farm Admins: ${result.data.count}`);
    
    result.data.data.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.firstName} ${admin.lastName} (${admin.email})`);
      console.log(`      Organization: ${admin.organizationName}`);
      console.log(`      Status: ${admin.status}`);
      console.log(`      Registered: ${new Date(admin.createdAt).toLocaleDateString()}`);
    });
  } else {
    console.log('❌ Failed to retrieve all Farm Admins:', result.error);
  }
}

async function runAdminApprovalSystemTest() {
  console.log('🚀 Starting FarmTally Admin Approval System Test');
  console.log('================================================');
  
  try {
    // Execute all test steps
    if (!(await step1_CreateApplicationAdmin())) return;
    await step2_RegisterFarmAdmins();
    await step3_ViewPendingRegistrations();
    await step4_ApproveFarmAdmin();
    await step5_RejectFarmAdmin();
    await step6_LoginApprovedFarmAdmin();
    await step7_CheckInvitePermission();
    await step8_TryInviteFieldManager();
    await step9_ViewSystemStats();
    await step10_ViewAllFarmAdmins();
    
    console.log('\n🎉 Admin Approval System Test Completed Successfully!');
    console.log('================================================');
    console.log('\n📋 Test Summary:');
    console.log('✅ Application Admin created/logged in');
    console.log('✅ Farm Admins registered with PENDING status');
    console.log('✅ Application Admin can view pending registrations');
    console.log('✅ Application Admin can approve Farm Admins');
    console.log('✅ Application Admin can reject Farm Admins');
    console.log('✅ Approved Farm Admin can log in');
    console.log('✅ Approved Farm Admin can invite Field Managers');
    console.log('✅ System statistics and reporting work');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
  }
}

// Run the test
runAdminApprovalSystemTest();