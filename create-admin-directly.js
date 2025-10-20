#!/usr/bin/env node

/**
 * Create System Admin Directly in Supabase
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://qvxcbdglyvzohzdefnet.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eGNiZGdseXZ6b2h6ZGVmbmV0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY5NDEzOCwiZXhwIjoyMDc2MjcwMTM4fQ.MCCGzB9BPHgfZC72NQGyKKWFFxw4s3LovUgJy14NBk4';

async function createSystemAdmin() {
  console.log('🔧 Creating System Admin directly in Supabase...\n');

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    // Simple password hash (same as our Edge Function)
    const password = 'FarmTallyAdmin2024!';
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'farmtally-salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', 'admin@farmtally.in')
      .maybeSingle();

    if (existingAdmin) {
      console.log('✅ System admin already exists:', existingAdmin.email);
      return;
    }

    // Create system admin
    const { data: newAdmin, error } = await supabase
      .from('users')
      .insert({
        email: 'admin@farmtally.in',
        password_hash: passwordHash,
        role: 'APPLICATION_ADMIN',
        status: 'APPROVED',
        profile: {
          firstName: 'System',
          lastName: 'Administrator'
        }
      })
      .select('id, email, role, status')
      .single();

    if (error) {
      console.error('❌ Error creating admin:', error);
      return;
    }

    console.log('✅ System admin created successfully!');
    console.log('📧 Email: admin@farmtally.in');
    console.log('🔑 Password: FarmTallyAdmin2024!');
    console.log('👤 Role:', newAdmin.role);
    console.log('📊 Status:', newAdmin.status);

  } catch (error) {
    console.error('❌ Failed to create system admin:', error.message);
  }
}

createSystemAdmin();