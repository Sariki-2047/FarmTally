import { PrismaClient, UserRole, LorryStatus, QualityGrade, DeliveryStatus, PaymentType, PaymentStatus } from '@prisma/client';
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
    },
  });

  console.log('✅ Organization created:', organization.name);

  // Create Farm Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@farmtally.com',
      password: await bcrypt.hash('Admin123!', 10),
      firstName: 'Farm',
      lastName: 'Admin',
      phone: '+91-9876543210',
      role: UserRole.FARM_ADMIN,
      organizationId: organization.id,
    },
  });

  console.log('✅ Farm Admin created:', adminUser.email);

  // Create Field Manager User
  const fieldManager = await prisma.user.create({
    data: {
      email: 'manager@farmtally.com',
      password: await bcrypt.hash('Manager123!', 10),
      firstName: 'Field',
      lastName: 'Manager',
      phone: '+91-9876543211',
      role: UserRole.FIELD_MANAGER,
      organizationId: organization.id,
    },
  });

  console.log('✅ Field Manager created:', fieldManager.email);

  // Create Farmer User
  const farmerUser = await prisma.user.create({
    data: {
      email: 'farmer@farmtally.com',
      password: await bcrypt.hash('Farmer123!', 10),
      firstName: 'Demo',
      lastName: 'Farmer',
      phone: '+91-9876543212',
      role: UserRole.FARMER,
      organizationId: organization.id,
    },
  });

  console.log('✅ Farmer User created:', farmerUser.email);

  // Create Sample Farmers
  const farmer1 = await prisma.farmer.create({
    data: {
      firstName: 'Rajesh',
      lastName: 'Kumar',
      phone: '+91-9876543213',
      address: 'Village Khetpura, District Farmabad',
      bankAccount: 'BANK123456789',
      organizationId: organization.id,
    },
  });

  const farmer2 = await prisma.farmer.create({
    data: {
      firstName: 'Suresh',
      lastName: 'Patel',
      phone: '+91-9876543214',
      address: 'Village Kisanpur, District Farmabad',
      bankAccount: 'BANK987654321',
      organizationId: organization.id,
    },
  });

  console.log('✅ Sample farmers created');

  // Create Sample Lorries
  const lorry1 = await prisma.lorry.create({
    data: {
      plateNumber: 'UP-32-AB-1234',
      capacity: 10.0, // 10 tons
      status: LorryStatus.AVAILABLE,
      organizationId: organization.id,
    },
  });

  const lorry2 = await prisma.lorry.create({
    data: {
      plateNumber: 'UP-32-CD-5678',
      capacity: 12.0, // 12 tons
      status: LorryStatus.ASSIGNED,
      assignedToId: fieldManager.id,
      organizationId: organization.id,
    },
  });

  console.log('✅ Sample lorries created');

  // Create Sample Delivery
  const delivery = await prisma.delivery.create({
    data: {
      lorryId: lorry2.id,
      farmerId: farmer1.id,
      fieldManagerId: fieldManager.id,
      organizationId: organization.id,
      totalWeight: 500.0, // 500 kg
      moistureContent: 12.5,
      qualityGrade: QualityGrade.A,
      pricePerKg: 25.0,
      totalAmount: 12500.0,
      deductions: 250.0,
      netAmount: 12250.0,
      status: DeliveryStatus.COMPLETED,
      deliveredAt: new Date(),
      processedAt: new Date(),
    },
  });

  console.log('✅ Sample delivery created');

  // Create Sample Bags for the delivery
  await prisma.bag.createMany({
    data: [
      { deliveryId: delivery.id, weight: 50.5, bagNumber: 1 },
      { deliveryId: delivery.id, weight: 49.8, bagNumber: 2 },
      { deliveryId: delivery.id, weight: 50.2, bagNumber: 3 },
      { deliveryId: delivery.id, weight: 48.9, bagNumber: 4 },
      { deliveryId: delivery.id, weight: 50.1, bagNumber: 5 },
      { deliveryId: delivery.id, weight: 49.7, bagNumber: 6 },
      { deliveryId: delivery.id, weight: 50.3, bagNumber: 7 },
      { deliveryId: delivery.id, weight: 49.9, bagNumber: 8 },
      { deliveryId: delivery.id, weight: 50.0, bagNumber: 9 },
      { deliveryId: delivery.id, weight: 50.6, bagNumber: 10 },
    ],
  });

  console.log('✅ Sample bags created');

  // Create Sample Payment
  const payment = await prisma.payment.create({
    data: {
      deliveryId: delivery.id,
      farmerId: farmer1.id,
      organizationId: organization.id,
      processedById: adminUser.id,
      amount: 12250.0,
      type: PaymentType.SETTLEMENT,
      status: PaymentStatus.COMPLETED,
      reference: 'PAY-001',
      notes: 'Payment for corn delivery - Batch 001',
      paidAt: new Date(),
    },
  });

  console.log('✅ Sample payment created');

  // Create Advance Payment
  const advancePayment = await prisma.payment.create({
    data: {
      farmerId: farmer2.id,
      organizationId: organization.id,
      processedById: fieldManager.id,
      amount: 5000.0,
      type: PaymentType.ADVANCE,
      status: PaymentStatus.COMPLETED,
      reference: 'ADV-001',
      notes: 'Advance payment for upcoming harvest',
      paidAt: new Date(),
    },
  });

  console.log('✅ Sample advance payment created');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('👨‍💼 Farm Admin: admin@farmtally.com / Admin123!');
  console.log('👨‍🌾 Field Manager: manager@farmtally.com / Manager123!');
  console.log('🌾 Farmer: farmer@farmtally.com / Farmer123!');
  console.log('\n📊 Sample Data Created:');
  console.log(`🏢 Organization: ${organization.name}`);
  console.log(`👥 Users: 3 (Admin, Manager, Farmer)`);
  console.log(`🌾 Farmers: 2 (Rajesh Kumar, Suresh Patel)`);
  console.log(`🚛 Lorries: 2 (UP-32-AB-1234, UP-32-CD-5678)`);
  console.log(`📦 Deliveries: 1 (500kg corn delivery)`);
  console.log(`💰 Payments: 2 (Settlement + Advance)`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });