const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up FarmTally Production Database...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  fs.copyFileSync('.env.example', '.env');
  console.log('✅ .env file created');
  console.log('⚠️  Please update DATABASE_URL in .env file with your PostgreSQL connection string\n');
} else {
  console.log('✅ .env file already exists\n');
}

try {
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated\n');

  console.log('🗄️  Running database migrations...');
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  console.log('✅ Database migrations completed\n');

  console.log('🌱 Seeding database with sample data...');
  execSync('npx prisma db seed', { stdio: 'inherit' });
  console.log('✅ Database seeded successfully\n');

  console.log('🎉 Production database setup completed!\n');
  console.log('📋 What was created:');
  console.log('   • Complete database schema with all tables');
  console.log('   • Sample organization and users');
  console.log('   • Test farmers and lorries');
  console.log('   • Sample deliveries and transactions');
  console.log('   • Notifications and audit logs\n');
  
  console.log('🔐 Login Credentials:');
  console.log('   Farm Admin:');
  console.log('     Email: admin@farmtally.com');
  console.log('     Password: Admin123!');
  console.log('   Field Manager:');
  console.log('     Email: manager@farmtally.com');
  console.log('     Password: Manager123!\n');
  
  console.log('🌐 Next Steps:');
  console.log('   1. Start the backend server: npm run dev');
  console.log('   2. Start the web app: node serve-web.js');
  console.log('   3. Open browser: http://localhost:3006');
  console.log('   4. Login with the credentials above\n');
  
  console.log('🔍 Database Management:');
  console.log('   • View data: npx prisma studio');
  console.log('   • Reset database: npm run db:reset');
  console.log('   • Backup database: pg_dump farmtally_dev > backup.sql');

} catch (error) {
  console.error('❌ Error setting up database:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('   1. Make sure PostgreSQL is installed and running');
  console.log('   2. Create database: createdb farmtally_dev');
  console.log('   3. Update DATABASE_URL in .env file');
  console.log('   4. Run: npm run db:setup');
  process.exit(1);
}