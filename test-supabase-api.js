#!/usr/bin/env node

/**
 * Test Supabase FarmTally API
 */

const https = require('https');

const SUPABASE_URL = 'https://qvxcbdglyvzohzdefnet.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eGNiZGdseXZ6b2h6ZGVmbmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTQxMzgsImV4cCI6MjA3NjI3MDEzOH0.hMzK3q1lQQPy7y0KMURxN-NwlOMO7WN_wFttWMyu9GM';

async function testAPI() {
  console.log('🧪 Testing FarmTally API on Supabase...\n');

  // Test 1: Health endpoint
  console.log('1. Testing Health Endpoint...');
  try {
    const response = await makeRequest('/functions/v1/farmtally-api/health', 'GET');
    console.log('✅ Health Response:', response);
  } catch (error) {
    console.log('❌ Health Error:', error.message);
  }

  // Test 2: System admin setup
  console.log('\n2. Testing System Admin Setup...');
  try {
    const response = await makeRequest('/functions/v1/farmtally-api/system-admin/setup', 'POST', {
      email: 'admin@farmtally.in',
      password: 'FarmTallyAdmin2024!',
      firstName: 'System',
      lastName: 'Administrator'
    });
    console.log('✅ Admin Setup Response:', response);
  } catch (error) {
    console.log('❌ Admin Setup Error:', error.message);
  }

  // Test 3: Auth login
  console.log('\n3. Testing Auth Login...');
  try {
    const response = await makeRequest('/functions/v1/farmtally-api/auth/login', 'POST', {
      email: 'admin@farmtally.in',
      password: 'FarmTallyAdmin2024!'
    });
    console.log('✅ Login Response:', response);
  } catch (error) {
    console.log('❌ Login Error:', error.message);
  }
}

function makeRequest(path, method, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'qvxcbdglyvzohzdefnet.supabase.co',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'apikey': ANON_KEY,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          resolve({ raw: data, status: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Run the test
testAPI().catch(console.error);