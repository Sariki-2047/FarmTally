// Apply FarmTally Database Schema to VPS PostgreSQL
// This script applies the schema from supabase/migrations to PostgreSQL

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://farmtally:farmtally123@localhost:5432/farmtally',
  ssl: false
});

async function applySchema() {
  console.log('🗄️ Applying FarmTally Database Schema...');
  
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, 'supabase/migrations/20241020_create_farmtally_tables.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }
    
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Schema file loaded successfully');
    console.log(`📏 Schema size: ${schemaSql.length} characters`);
    
    // Test connection first
    console.log('🔌 Testing database connection...');
    const testResult = await pool.query('SELECT NOW() as timestamp');
    console.log('✅ Database connected:', testResult.rows[0].timestamp);
    
    // Apply the schema
    console.log('🚀 Applying schema to database...');
    await pool.query(schemaSql);
    
    console.log('✅ Schema applied successfully!');
    
    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Tables created:');
    tablesResult.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });
    
    console.log(`\n🎉 Database setup complete! ${tablesResult.rows.length} tables created.`);
    
  } catch (error) {
    console.error('❌ Schema application failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the schema application
applySchema();