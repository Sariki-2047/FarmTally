#!/usr/bin/env node

/**
 * Simulate Frontend Login Flow
 */

const API_URL = 'https://qvxcbdglyvzohzdefnet.supabase.co/functions/v1/farmtally-api';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eGNiZGdseXZ6b2h6ZGVmbmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTQxMzgsImV4cCI6MjA3NjI3MDEzOH0.hMzK3q1lQQPy7y0KMURxN-NwlOMO7WN_wFttWMyu9GM';

// Simulate the API client request method
async function simulateApiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    ...(options.headers || {}),
  };

  console.log('🌐 Making request to:', url);
  console.log('📋 Headers:', headers);
  console.log('📦 Body:', options.body);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('📡 Response status:', response.status);
    const data = await response.json();
    console.log('📊 Response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('❌ API Request failed:', error);
    throw error;
  }
}

// Simulate the login flow
async function simulateLogin() {
  console.log('🔐 Simulating frontend login flow...\n');
  
  try {
    // Step 1: Make login request (like API client does)
    console.log('📧 Step 1: Making login request...');
    const loginResponse = await simulateApiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@farmtally.in',
        password: 'FarmTallyAdmin2024!'
      }),
    });
    
    // Step 2: Process response (like auth store does)
    console.log('\n👤 Step 2: Processing login response...');
    if (loginResponse.success && loginResponse.data) {
      const { tokens, user } = loginResponse.data;
      const token = tokens.accessToken;
      
      console.log('✅ Got access token:', token ? 'YES' : 'NO');
      console.log('👤 User data:', {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        profile: user.profile
      });
      
      // Step 3: Transform user data (like auth store does)
      const transformedUser = {
        id: user.id,
        email: user.email,
        firstName: user.profile?.firstName || user.profile?.first_name || '',
        lastName: user.profile?.lastName || user.profile?.last_name || '',
        role: user.role,
        status: user.status,
        organization: user.organization || { id: '', name: '' }
      };
      
      console.log('🔄 Transformed user:', transformedUser);
      
      // Step 4: Determine redirect
      let redirectPath = '/';
      if (transformedUser.role === "APPLICATION_ADMIN") {
        redirectPath = "/admin";
      } else if (transformedUser.role === "FARM_ADMIN") {
        redirectPath = "/farm-admin";
      } else if (transformedUser.role === "FIELD_MANAGER") {
        redirectPath = "/field-manager";
      } else if (transformedUser.role === "FARMER") {
        redirectPath = "/farmer";
      }
      
      console.log('🚀 Would redirect to:', redirectPath);
      console.log('\n✅ Frontend login simulation SUCCESSFUL!');
      
    } else {
      throw new Error(loginResponse.message || 'Login failed');
    }
    
  } catch (error) {
    console.error('\n❌ Frontend login simulation FAILED:', error.message);
  }
}

simulateLogin();