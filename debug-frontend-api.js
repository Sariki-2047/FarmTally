#!/usr/bin/env node

/**
 * Debug Frontend API Integration
 */

async function debugFrontendAPI() {
  console.log('🔍 Debugging Frontend API Integration...\n');
  
  const baseUrl = 'https://app.farmtally.in/api';
  
  // Test the exact API call the frontend makes
  console.log('1. Testing pending users API (frontend call)...');
  try {
    const response = await fetch(`${baseUrl}/system-admin/users/pending`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eGNiZGdseXZ6b2h6ZGVmbmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTQxMzgsImV4cCI6MjA3NjI3MDEzOH0.hMzK3q1lQQPy7y0KMURxN-NwlOMO7WN_wFttWMyu9GM',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eGNiZGdseXZ6b2h6ZGVmbmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTQxMzgsImV4cCI6MjA3NjI3MDEzOH0.hMzK3q1lQQPy7y0KMURxN-NwlOMO7WN_wFttWMyu9GM'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      console.log('✅ API working - Found', data.data.length, 'pending users');
      
      // Show the structure the frontend expects
      if (data.data.length > 0) {
        const user = data.data[0];
        console.log('\n📋 User structure:');
        console.log('- id:', user.id);
        console.log('- email:', user.email);
        console.log('- role:', user.role);
        console.log('- profile:', user.profile);
        console.log('- created_at:', user.created_at);
      }
    } else {
      console.log('❌ API issue:', data.error || 'Unknown error');
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
  
  console.log('\n🔍 Debug complete!');
}

debugFrontendAPI();