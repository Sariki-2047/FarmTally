// Test the exact same API call the frontend makes
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://qvxcbdglyvzohzdefnet.supabase.co/functions/v1/farmtally-api';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eGNiZGdseXZ6b2h6ZGVmbmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTQxMzgsImV4cCI6MjA3NjI3MDEzOH0.hMzK3q1lQQPy7y0KMURxN-NwlOMO7WN_wFttWMyu9GM';

async function testFrontendStyleLogin() {
  console.log('🧪 Testing login exactly like the frontend does...');
  console.log('API URL:', API_URL);
  
  const credentials = {
    email: 'admin@farmtally.in',
    password: 'FarmTallyAdmin2024!'
  };
  
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  };
  
  console.log('Headers:', headers);
  console.log('Credentials:', credentials);
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(credentials),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Frontend-style login SUCCESS!');
      console.log('Response data:', data);
    } else {
      console.log('❌ Frontend-style login FAILED!');
      console.log('Error data:', data);
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

// Also test with different header combinations
async function testDifferentHeaders() {
  console.log('\n🔍 Testing different header combinations...');
  
  const credentials = {
    email: 'admin@farmtally.in',
    password: 'FarmTallyAdmin2024!'
  };
  
  // Test 1: Only apikey
  console.log('\n📋 Test 1: Only apikey header');
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(credentials),
    });
    
    const data = await response.json();
    console.log('Status:', response.status, response.ok ? '✅' : '❌');
    if (!response.ok) console.log('Error:', data.message || data.error);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  // Test 2: Only Authorization
  console.log('\n📋 Test 2: Only Authorization header');
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(credentials),
    });
    
    const data = await response.json();
    console.log('Status:', response.status, response.ok ? '✅' : '❌');
    if (!response.ok) console.log('Error:', data.message || data.error);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function runTests() {
  await testFrontendStyleLogin();
  await testDifferentHeaders();
}

runTests();