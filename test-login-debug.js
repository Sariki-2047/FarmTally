#!/usr/bin/env node

/**
 * Debug Login Issues
 */

const API_URL = 'https://qvxcbdglyvzohzdefnet.supabase.co/functions/v1/farmtally-api';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eGNiZGdseXZ6b2h6ZGVmbmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTQxMzgsImV4cCI6MjA3NjI3MDEzOH0.hMzK3q1lQQPy7y0KMURxN-NwlOMO7WN_wFttWMyu9GM';

async function testHealthCheck() {
  console.log('🏥 Testing health endpoint...');
  
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'apikey': API_KEY,
      }
    });

    console.log('Health Status:', response.status);
    const data = await response.json();
    console.log('Health Response:', data);
    return response.ok;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testLogin() {
  console.log('\n🔐 Testing login...');
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'apikey': API_KEY,
      },
      body: JSON.stringify({
        email: 'admin@farmtally.in',
        password: 'FarmTallyAdmin2024!'
      })
    });

    console.log('Login Status:', response.status);
    console.log('Login Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Login Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('User role:', data.data?.user?.role);
      console.log('Token preview:', data.data?.tokens?.accessToken?.substring(0, 50) + '...');
    } else {
      console.log('❌ Login failed');
    }
    
    return response.ok;
  } catch (error) {
    console.error('❌ Login test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Running login debug tests...\n');
  
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('❌ Health check failed, stopping tests');
    return;
  }
  
  const loginOk = await testLogin();
  
  console.log('\n📊 Test Summary:');
  console.log('Health:', healthOk ? '✅' : '❌');
  console.log('Login:', loginOk ? '✅' : '❌');
}

runTests();