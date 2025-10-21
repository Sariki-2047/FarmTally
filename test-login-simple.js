const API_URL = 'https://qvxcbdglyvzohzdefnet.supabase.co/functions/v1/farmtally-api';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eGNiZGdseXZ6b2h6ZGVmbmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTQxMzgsImV4cCI6MjA3NjI3MDEzOH0.hMzK3q1lQQPy7y0KMURxN-NwlOMO7WN_wFttWMyu9GM';

fetch(`${API_URL}/auth/login`, {
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
})
.then(response => {
  console.log('Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Response:', JSON.stringify(data, null, 2));
  if (data.success) {
    console.log('✅ Login works!');
    console.log('User role:', data.data.user.role);
  } else {
    console.log('❌ Login failed');
  }
})
.catch(error => {
  console.error('Error:', error);
});