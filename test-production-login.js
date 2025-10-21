// Test different login scenarios
const API_URL = 'https://qvxcbdglyvzohzdefnet.supabase.co/functions/v1/farmtally-api';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eGNiZGdseXZ6b2h6ZGVmbmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTQxMzgsImV4cCI6MjA3NjI3MDEzOH0.hMzK3q1lQQPy7y0KMURxN-NwlOMO7WN_wFttWMyu9GM';

async function testLogin(email, password, description) {
  console.log(`\n🧪 Testing ${description}...`);
  console.log(`Email: ${email}`);
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'apikey': API_KEY,
      },
      body: JSON.stringify({ email, password })
    });

    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success:', data.message);
      console.log('User role:', data.data?.user?.role);
      console.log('User status:', data.data?.user?.status);
    } else {
      const errorData = await response.json();
      console.log('❌ Failed:', errorData.message || errorData.error);
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

async function testAllCredentials() {
  console.log('🔍 Testing various login credentials...\n');
  
  // Test the admin credentials we know should work
  await testLogin('admin@farmtally.in', 'FarmTallyAdmin2024!', 'System Admin');
  
  // Test some variations
  await testLogin('admin@farmtally.in', 'admin123', 'Admin with simple password');
  await testLogin('admin@example.com', 'password123', 'Generic admin');
  
  // Test if there are any users at all
  console.log('\n🔍 Checking if any users exist...');
  try {
    const response = await fetch(`${API_URL}/system-admin/users/pending`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'apikey': API_KEY,
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Users endpoint accessible');
    } else {
      console.log('❌ Users endpoint not accessible');
    }
  } catch (error) {
    console.log('❌ Cannot access users endpoint');
  }
}

testAllCredentials();