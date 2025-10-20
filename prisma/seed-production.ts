import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting production database seeding...');

  // Create organizations
  const org1 = await prisma.organization.create({
    data: {
      name: 'Green Valley Farms',
      address: '123 Farm Road, Agricultural District',
      phone: '+1-555-0101',
      email: 'admin@greenvalleyfarms.com',
    },
  });

  const org2 = await prisma.organization.create({
    data: {
      name: 'Sunrise Agriculture Co.',
      address: '456 Harvest Lane, Farming County',
      phone: '+1-555-0202',
      email: 'contact@sunriseagri.com',
    },
  });

  console.log('✅ Organizations created');

  // Create users with hashed passwords
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Farm Admins
  const admin1 = await prisma.user.create({
    data: {
      email: 'admin@greenvalley.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1-555-1001',
      role: 'FARM_ADMIN',
      organizationId: org1.id,
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      email: 'admin@sunrise.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+1-555-2001',
      role: 'FARM_ADMIN',
      organizationId: org2.id,
    },
  });

  // Field Managers
  const manager1 = await prisma.user.create({
    data: {
      email: 'manager1@greenvalley.com',
      password: hashedPassword,
      firstName: 'Mike',
      lastName: 'Wilson',
      phone: '+1-555-1002',
      role: 'FIELD_MANAGER',
      organizationId: org1.id,
    },
  });

  const manager2 = await prisma.user.create({
    data: {
      email: 'manager2@greenvalley.com',
      password: hashedPassword,
      firstName: 'Lisa',
      lastName: 'Brown',
      phone: '+1-555-1003',
      role: 'FIELD_MANAGER',
      organizationId: org1.id,
    },
  });

  const manager3 = await prisma.user.create({
    data: {
      email: 'manager1@sunrise.com',
      password: hashedPassword,
      firstName: 'David',
      lastName: 'Garcia',
      phone: '+1-555-2002',
      role: 'FIELD_MANAGER',
      organizationId: org2.id,
    },
  });

  console.log('✅ Users created');

  // Create lorries
  const lorries1 = await Promise.all([
    prisma.lorry.create({
      data: {
        plateNumber: 'GVF-001',
        capacity: 25.0,
        status: 'AVAILABLE',
        organizationId: org1.id,
      },
    }),
    prisma.lorry.create({
      data: {
        plateNumber: 'GVF-002',
        capacity: 30.0,
        status: 'ASSIGNED',
        assignedToId: manager1.id,
        organizationId: org1.id,
      },
    }),
    prisma.lorry.create({
      data: {
        plateNumber: 'GVF-003',
        capacity: 25.0,
        status: 'LOADING',
        assignedToId: manager2.id,
        organizationId: org1.id,
      },
    }),
  ]);

  const lorries2 = await Promise.all([
    prisma.lorry.create({
      data: {
        plateNumber: 'SAC-101',
        capacity: 28.0,
        status: 'AVAILABLE',
        organizationId: org2.id,
      },
    }),
    prisma.lorry.create({
      data: {
        plateNumber: 'SAC-102',
        capacity: 32.0,
        status: 'ASSIGNED',
        assignedToId: manager3.id,
        organizationId: org2.id,
      },
    }),
  ]);

  console.log('✅ Lorries created');

  // Create farmers
  const farmers1 = await Promise.all([
    prisma.farmer.create({
      data: {
        firstName: 'Robert',
        lastName: 'Anderson',
        phone: '+1-555-3001',
        address: '789 Rural Route 1, Farmland',
        bankAccount: '1234567890',
        organizationId: org1.id,
      },
    }),
    prisma.farmer.create({
      data: {
        firstName: 'Maria',
        lastName: 'Rodriguez',
        phone: '+1-555-3002',
        address: '321 Country Road, Farmville',
        bankAccount: '2345678901',
        organizationId: org1.id,
      },
    }),
    prisma.farmer.create({
      data: {
        firstName: 'James',
        lastName: 'Thompson',
        phone: '+1-555-3003',
        address: '654 Farm Lane, Agriculture City',
        bankAccount: '3456789012',
        organizationId: org1.id,
      },
    }),
  ]);

  const farmers2 = await Promise.all([
    prisma.farmer.create({
      data: {
        firstName: 'Emily',
        lastName: 'Davis',
        phone: '+1-555-4001',
        address: '987 Harvest Road, Crop County',
        bankAccount: '4567890123',
        organizationId: org2.id,
      },
    }),
    prisma.farmer.create({
      data: {
        firstName: 'Carlos',
        lastName: 'Martinez',
        phone: '+1-555-4002',
        address: '147 Field Street, Grain Valley',
        bankAccount: '5678901234',
        organizationId: org2.id,
      },
    }),
  ]);

  console.log('✅ Farmers created');

  // Create sample deliveries
  const delivery1 = await prisma.delivery.create({
    data: {
      lorryId: lorries1[1].id,
      farmerId: farmers1[0].id,
      fieldManagerId: manager1.id,
      organizationId: org1.id,
      totalWeight: 1250.5,
      moistureContent: 14.2,
      qualityGrade: 'A',
      pricePerKg: 0.45,
      totalAmount: 562.73,
      deductions: 12.50,
      netAmount: 550.23,
      status: 'COMPLETED',
      deliveredAt: new Date('2024-01-15T10:30:00Z'),
      processedAt: new Date('2024-01-15T16:45:00Z'),
    },
  });

  const delivery2 = await prisma.delivery.create({
    data: {
      lorryId: lorries1[2].id,
      farmerId: farmers1[1].id,
      fieldManagerId: manager2.id,
      organizationId: org1.id,
      totalWeight: 980.0,
      moistureContent: 15.1,
      qualityGrade: 'B',
      status: 'IN_PROGRESS',
      deliveredAt: new Date(),
    },
  });

  console.log('✅ Deliveries created');

  // Create bags for deliveries
  const bags1 = [];
  for (let i = 1; i <= 25; i++) {
    bags1.push(
      prisma.bag.create({
        data: {
          deliveryId: delivery1.id,
          weight: 50.0 + (Math.random() * 2 - 1), // 49-51 kg range
          bagNumber: i,
        },
      })
    );
  }
  await Promise.all(bags1);

  const bags2 = [];
  for (let i = 1; i <= 20; i++) {
    bags2.push(
      prisma.bag.create({
        data: {
          deliveryId: delivery2.id,
          weight: 49.0 + (Math.random() * 2), // 49-51 kg range
          bagNumber: i,
        },
      })
    );
  }
  await Promise.all(bags2);

  console.log('✅ Bags created');

  // Create sample payments
  await Promise.all([
    prisma.payment.create({
      data: {
        deliveryId: delivery1.id,
        farmerId: farmers1[0].id,
        organizationId: org1.id,
        processedById: admin1.id,
        amount: 550.23,
        type: 'SETTLEMENT',
        status: 'COMPLETED',
        reference: 'PAY-001-2024',
        notes: 'Full settlement for delivery #1',
        paidAt: new Date('2024-01-16T09:00:00Z'),
      },
    }),
    prisma.payment.create({
      data: {
        farmerId: farmers1[1].id,
        organizationId: org1.id,
        processedById: manager2.id,
        amount: 200.00,
        type: 'ADVANCE',
        status: 'COMPLETED',
        reference: 'ADV-001-2024',
        notes: 'Advance payment for upcoming delivery',
        paidAt: new Date('2024-01-10T14:30:00Z'),
      },
    }),
    prisma.payment.create({
      data: {
        farmerId: farmers2[0].id,
        organizationId: org2.id,
        processedById: admin2.id,
        amount: 150.00,
        type: 'ADVANCE',
        status: 'COMPLETED',
        reference: 'SAC-ADV-001',
        notes: 'Advance for field preparation',
        paidAt: new Date('2024-01-12T11:15:00Z'),
      },
    }),
  ]);

  console.log('✅ Payments created');

  console.log('🎉 Production database seeding completed successfully!');
  console.log('\n📋 Test Accounts Created:');
  console.log('=========================');
  console.log('Farm Admin (Green Valley): admin@greenvalley.com / password123');
  console.log('Farm Admin (Sunrise): admin@sunrise.com / password123');
  console.log('Field Manager 1: manager1@greenvalley.com / password123');
  console.log('Field Manager 2: manager2@greenvalley.com / password123');
  console.log('Field Manager 3: manager1@sunrise.com / password123');
  console.log('\n🚛 Sample Data:');
  console.log('===============');
  console.log('- 2 Organizations with complete setup');
  console.log('- 5 Users across different roles');
  console.log('- 5 Lorries with various statuses');
  console.log('- 5 Farmers with contact information');
  console.log('- 2 Deliveries with bag details');
  console.log('- 3 Payment records');
  console.log('\n🌐 Ready for production use!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });