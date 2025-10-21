// Test the JWT fix
const API_URL = 'https://qvxcbdglyvzohzdefnet.supabase.co/functions/v1/farmtally-api';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eGNiZGdseXZ6b2h6ZGVmbmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTQxMzgsImV4cCI6MjA3NjI3MDEzOH0.hMzK3q1lQQPy7y0KMURxN-NwlOMO7WN_wFttWMyu9GM';

async function testLogin() {
  console.log('🧪 Testing login with updated JWT...');
  
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

    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login Success:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Login Failed:', errorText);
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testLogin();