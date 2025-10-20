const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing Supabase Database Connection...\n');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('📡 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    console.log('🧪 Testing basic query...');
    const result = await client.query('SELECT version()');
    console.log('✅ Database version:', result.rows[0].version.substring(0, 50) + '...');
    
    console.log('🗄️  Testing table creation...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Test table created successfully!');
    
    console.log('📝 Testing data insertion...');
    await client.query(`
      INSERT INTO test_table (name) VALUES ('FarmTally Test')
    `);
    console.log('✅ Data inserted successfully!');
    
    console.log('📊 Testing data retrieval...');
    const testResult = await client.query('SELECT * FROM test_table LIMIT 1');
    console.log('✅ Data retrieved:', testResult.rows[0]);
    
    console.log('🧹 Cleaning up test table...');
    await client.query('DROP TABLE test_table');
    console.log('✅ Test table cleaned up!');
    
    console.log('\n🎉 Database connection test PASSED!');
    console.log('✅ Your Supabase database is ready for FarmTally!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your DATABASE_URL in .env file');
    console.log('   2. Verify your Supabase password is correct');
    console.log('   3. Make sure your Supabase project is active');
  } finally {
    await client.end();
  }
}

testConnection();