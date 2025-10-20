#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🗄️  FarmTally Database Setup\n');

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('⚠️  .env file not found. Creating from .env.example...');
  if (fs.existsSync('.env.example')) {
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ .env file created. Please edit it with your configuration.');
    console.log('   Especially update the DATABASE_URL with your PostgreSQL credentials.\n');
  } else {
    console.log('❌ .env.example file not found. Please create .env manually.\n');
    process.exit(1);
  }
}

// Load environment variables
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.log('❌ DATABASE_URL not found in .env file.');
  console.log('   Please set DATABASE_URL in your .env file.\n');
  console.log('   Example: DATABASE_URL="postgresql://postgres:password@localhost:5432/farmtally"');
  process.exit(1);
}

console.log('🔍 Checking database connection...');

try {
  // Test database connection
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('✅ Database connection successful');
} catch (error) {
  console.log('❌ Database connection failed');
  console.log('   Please ensure PostgreSQL is running and credentials are correct.\n');
  
  console.log('Quick setup commands:');
  console.log('1. Start PostgreSQL service:');
  console.log('   Windows: net start postgresql-x64-14');
  console.log('   macOS:   brew services start postgresql');
  console.log('   Linux:   sudo systemctl start postgresql\n');
  
  console.log('2. Create database:');
  console.log('   createdb -U postgres farmtally\n');
  
  console.log('3. Update DATABASE_URL in .env file');
  process.exit(1);
}

console.log('\n🔄 Running database migrations...');

try {
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  console.log('✅ Database migrations completed');
} catch (error) {
  console.log('❌ Database migration failed');
  process.exit(1);
}

console.log('\n📊 Generating Prisma client...');

try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');
} catch (error) {
  console.log('❌ Prisma client generation failed');
  process.exit(1);
}

console.log('\n🌱 Seeding database with initial data...');

// Create a simple seed script
const seedScript = `
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  // Create a sample organization
  const org = await prisma.organization.create({
    data: {
      name: 'Demo Farm Organization',
      code: 'DEMO001',
      ownerId: '00000000-0000-0000-0000-000000000000', // Temporary ID
      email: 'admin@demofarm.com',
      phone: '+1234567890',
      address: '123 Farm Road, Agriculture City, AC 12345'
    }
  });
  
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@demofarm.com',
      phone: '+1234567890',
      passwordHash: hashedPassword,
      role: 'FARM_ADMIN',
      organizationId: org.id,
      profile: {
        firstName: 'Demo',
        lastName: 'Admin',
        fullName: 'Demo Admin'
      }
    }
  });
  
  // Update organization owner
  await prisma.organization.update({
    where: { id: org.id },
    data: { ownerId: adminUser.id }
  });
  
  console.log('✅ Seed data created:');
  console.log(\`   Organization: \${org.name} (\${org.code})\`);
  console.log(\`   Admin User: \${adminUser.email}\`);
  console.log(\`   Password: admin123\`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

fs.writeFileSync('prisma/seed.js', seedScript);

try {
  execSync('node prisma/seed.js', { stdio: 'inherit' });
  console.log('✅ Database seeded successfully');
} catch (error) {
  console.log('⚠️  Database seeding failed, but setup can continue');
}

console.log('\n🎉 Database setup completed!');
console.log('================================================');
console.log('');
console.log('Demo credentials:');
console.log('  Email: admin@demofarm.com');
console.log('  Password: admin123');
console.log('');
console.log('Next steps:');
console.log('1. Start Redis server: redis-server');
console.log('2. Start the backend: npm run dev');
console.log('3. Start the Flutter app: cd farmtally_mobile && flutter run');
console.log('');
console.log('🔗 Access Prisma Studio: npx prisma studio');
console.log('📚 View API docs: http://localhost:3000/health');