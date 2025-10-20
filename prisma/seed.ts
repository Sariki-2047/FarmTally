import { PrismaClient, UserRole, LorryStatus, RequestStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Farm Admin Organization
  const organization = await prisma.organization.create({
    data: {
      name: 'FarmTally Demo Organization',
      address: '123 Agricultural Street, Farm City, State 12345',
      phone: '+91-9876543210',
      email: 'admin@farmtally.com',
        qualityParameters: {
          moistureThreshold: 14,
          standardDeduction: 2.5,
        },
      },
      owner: {
        create: {
          email: 'admin@farmtally.com',
          phone: '+91-9876543210',
          passwordHash: await bcrypt.hash('Admin123!', 10),
          role: UserRole.FARM_ADMIN,
          profile: {
            firstName: 'Farm',
            lastName: 'Admin',
            address: '123 Agricultural Street, Farm City',
            idNumber: 'ADMIN001',
          },
          preferences: {
            language: 'en',
            notifications: {
              email: true,
              sms: true,
              push: true,
            },
          },
        },
      },
    },
  });

  console.log('✅ Created organization and admin user');

  // Create Field Manager
  const fieldManager = await prisma.user.create({
    data: {
      email: 'manager@farmtally.com',
      phone: '+91-9876543211',
      passwordHash: await bcrypt.hash('Manager123!', 10),
      role: UserRole.FIELD_MANAGER,
      organizationId: organization.id,
      profile: {
        firstName: 'Field',
        lastName: 'Manager',
        address: '456 Manager Street, Farm City',
        idNumber: 'MGR001',
        aadhaar: '123456789012',
      },
      preferences: {
        language: 'en',
        notifications: {
          email: true,
          sms: true,
          push: true,
        },
      },
    },
  });

  console.log('✅ Created field manager user');

  // Create Lorries
  const lorries = await Promise.all([
    prisma.lorry.create({
      data: {
        organizationId: organization.id,
        name: 'Lorry Alpha',
        licensePlate: 'KA01AB1234',
        capacity: 1000,
        status: LorryStatus.AVAILABLE,
        location: {
          latitude: 12.9716,
          longitude: 77.5946,
          address: 'Bangalore, Karnataka',
        },
        maintenanceSchedule: {
          lastService: '2024-01-15',
          nextService: '2024-04-15',
          serviceInterval: 90,
        },
      },
    }),
    prisma.lorry.create({
      data: {
        organizationId: organization.id,
        name: 'Lorry Beta',
        licensePlate: 'KA02CD5678',
        capacity: 1500,
        status: LorryStatus.ASSIGNED,
        assignedManagerId: fieldManager.id,
        assignedAt: new Date(),
        location: {
          latitude: 13.0827,
          longitude: 80.2707,
          address: 'Chennai, Tamil Nadu',
        },
      },
    }),
    prisma.lorry.create({
      data: {
        organizationId: organization.id,
        name: 'Lorry Gamma',
        licensePlate: 'MH12EF9012',
        capacity: 2000,
        status: LorryStatus.AVAILABLE,
        location: {
          latitude: 19.0760,
          longitude: 72.8777,
          address: 'Mumbai, Maharashtra',
        },
      },
    }),
  ]);

  console.log('✅ Created lorries');

  // Create Farmers
  const farmers = await Promise.all([
    prisma.farmer.create({
      data: {
        name: 'Rajesh Kumar',
        phone: '+91-9876543220',
        email: 'rajesh.kumar@email.com',
        address: 'Village Kothapalli, Mandal Medak, District Medak, Telangana',
        idNumber: 'FARMER001',
        bankDetails: {
          bankName: 'State Bank of India',
          accountNumber: '1234567890123456',
          accountName: 'Rajesh Kumar',
          ifscCode: 'SBIN0001234',
          branchName: 'Medak Branch',
        },
        createdBy: fieldManager.id,
        organizations: {
          create: {
            organizationId: organization.id,
            qualityRating: 4.5,
            totalDeliveries: 15,
            totalEarnings: 125000.00,
          },
        },
      },
    }),
    prisma.farmer.create({
      data: {
        name: 'Sunita Devi',
        phone: '+91-9876543221',
        email: 'sunita.devi@email.com',
        address: 'Village Rampur, Mandal Sangareddy, District Sangareddy, Telangana',
        idNumber: 'FARMER002',
        bankDetails: {
          bankName: 'Andhra Bank',
          accountNumber: '2345678901234567',
          accountName: 'Sunita Devi',
          ifscCode: 'ANDB0002345',
          branchName: 'Sangareddy Branch',
        },
        createdBy: fieldManager.id,
        organizations: {
          create: {
            organizationId: organization.id,
            qualityRating: 4.2,
            totalDeliveries: 12,
            totalEarnings: 98000.00,
          },
        },
      },
    }),
    prisma.farmer.create({
      data: {
        name: 'Mohan Singh',
        phone: '+91-9876543222',
        email: 'mohan.singh@email.com',
        address: 'Village Patancheru, Mandal Patancheru, District Sangareddy, Telangana',
        idNumber: 'FARMER003',
        bankDetails: {
          bankName: 'ICICI Bank',
          accountNumber: '3456789012345678',
          accountName: 'Mohan Singh',
          ifscCode: 'ICIC0003456',
          branchName: 'Patancheru Branch',
        },
        createdBy: fieldManager.id,
        organizations: {
          create: {
            organizationId: organization.id,
            qualityRating: 4.8,
            totalDeliveries: 20,
            totalEarnings: 180000.00,
          },
        },
      },
    }),
  ]);

  console.log('✅ Created farmers');

  // Create Lorry Request
  const lorryRequest = await prisma.lorryRequest.create({
    data: {
      organizationId: organization.id,
      managerId: fieldManager.id,
      requiredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      priority: 'HIGH',
      purpose: 'Corn collection from Medak district farmers',
      estimatedDuration: 480, // 8 hours in minutes
      location: 'Medak District, Telangana',
      expectedVolume: 2500,
      status: RequestStatus.PENDING,
    },
  });

  console.log('✅ Created lorry request');

  // Create Sample Deliveries
  const deliveries = await Promise.all([
    prisma.delivery.create({
      data: {
        organizationId: organization.id,
        lorryId: lorries[1].id, // Assigned lorry
        farmerId: farmers[0].id,
        managerId: fieldManager.id,
        deliveryDate: new Date('2024-01-15'),
        bagsCount: 25,
        individualWeights: [48.5, 49.2, 47.8, 50.1, 48.9, 49.5, 48.2, 49.8, 47.5, 50.3, 48.7, 49.1, 48.4, 49.6, 47.9, 50.0, 48.8, 49.3, 48.1, 49.7, 47.6, 50.2, 48.6, 49.0, 48.3],
        grossWeight: 1225.5,
        moistureContent: 12.5,
        standardDeduction: 30.64, // 2.5% of gross weight
        qualityDeduction: 0,
        netWeight: 1194.86,
        pricePerKg: 25.50,
        totalValue: 30468.93,
        advanceAmount: 5000.00,
        interestCharges: 0,
        finalAmount: 25468.93,
        status: 'COMPLETED',
        photos: ['delivery_photo_1.jpg', 'quality_check_1.jpg'],
        notes: 'Good quality corn, moisture content within acceptable limits',
      },
    }),
    prisma.delivery.create({
      data: {
        organizationId: organization.id,
        lorryId: lorries[1].id,
        farmerId: farmers[1].id,
        managerId: fieldManager.id,
        deliveryDate: new Date('2024-01-16'),
        bagsCount: 20,
        individualWeights: [49.1, 48.7, 49.5, 48.3, 49.8, 48.9, 49.2, 48.6, 49.4, 48.8, 49.0, 48.5, 49.3, 48.7, 49.1, 48.4, 49.6, 48.8, 49.2, 48.9],
        grossWeight: 980.2,
        moistureContent: 13.2,
        standardDeduction: 24.51,
        qualityDeduction: 0,
        netWeight: 955.69,
        pricePerKg: 25.50,
        totalValue: 24370.10,
        advanceAmount: 3000.00,
        interestCharges: 0,
        finalAmount: 21370.10,
        status: 'COMPLETED',
        photos: ['delivery_photo_2.jpg'],
        notes: 'Standard quality delivery',
      },
    }),
  ]);

  console.log('✅ Created sample deliveries');

  // Create Advance Payments
  const advancePayments = await Promise.all([
    prisma.advancePayment.create({
      data: {
        organizationId: organization.id,
        farmerId: farmers[0].id,
        amount: 5000.00,
        paymentMethod: 'BANK_TRANSFER',
        paymentDate: new Date('2024-01-10'),
        referenceNumber: 'TXN123456789',
        reason: 'Advance for upcoming corn delivery',
        notes: 'Transferred to SBI account ending 3456',
        recordedBy: fieldManager.id,
        status: 'ACTIVE',
      },
    }),
    prisma.advancePayment.create({
      data: {
        organizationId: organization.id,
        farmerId: farmers[1].id,
        amount: 3000.00,
        paymentMethod: 'CASH',
        paymentDate: new Date('2024-01-12'),
        reason: 'Emergency advance payment',
        notes: 'Cash payment made at field location',
        recordedBy: fieldManager.id,
        status: 'ACTIVE',
      },
    }),
  ]);

  console.log('✅ Created advance payments');

  // Create Notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: fieldManager.id,
        organizationId: organization.id,
        type: 'LORRY_REQUEST',
        title: 'Lorry Request Submitted',
        body: 'Your lorry request for Medak district collection has been submitted for approval.',
        data: {
          requestId: lorryRequest.id,
          location: 'Medak District',
        },
        priority: 'MEDIUM',
      },
    }),
    prisma.notification.create({
      data: {
        userId: organization.ownerId,
        organizationId: organization.id,
        type: 'APPROVAL_REQUIRED',
        title: 'Lorry Request Approval Required',
        body: 'A new lorry request from Field Manager requires your approval.',
        data: {
          requestId: lorryRequest.id,
          managerId: fieldManager.id,
        },
        priority: 'HIGH',
      },
    }),
  ]);

  console.log('✅ Created notifications');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Created:');
  console.log(`   • 1 Organization: ${organization.name}`);
  console.log(`   • 2 Users: Farm Admin & Field Manager`);
  console.log(`   • 3 Lorries: Alpha, Beta, Gamma`);
  console.log(`   • 3 Farmers: Rajesh, Sunita, Mohan`);
  console.log(`   • 1 Lorry Request: Pending approval`);
  console.log(`   • 2 Deliveries: Completed transactions`);
  console.log(`   • 2 Advance Payments: Active advances`);
  console.log(`   • 2 Notifications: System alerts`);
  console.log('\n🔐 Login Credentials:');
  console.log('   Farm Admin:');
  console.log('     Email: admin@farmtally.com');
  console.log('     Password: Admin123!');
  console.log('   Field Manager:');
  console.log('     Email: manager@farmtally.com');
  console.log('     Password: Manager123!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });