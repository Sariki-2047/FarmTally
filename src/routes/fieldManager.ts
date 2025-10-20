import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Apply authentication and role check to all field manager routes
router.use(authenticateToken);
router.use(requireRole(['FIELD_MANAGER', 'FARM_ADMIN']));

// Get assigned lorries
router.get('/lorries', asyncHandler(async (req: AuthRequest, res) => {
  const organizationId = req.user!.organizationId;
  const fieldManagerId = req.user!.id;

  const lorries = await prisma.lorry.findMany({
    where: {
      organizationId,
      OR: [
        { assignedToId: fieldManagerId },
        { status: 'AVAILABLE' }
      ]
    },
    include: {
      deliveries: {
        where: { status: { not: 'COMPLETED' } },
        include: {
          farmer: { select: { firstName: true, lastName: true, phone: true } },
          bags: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(lorries);
}));

// Request lorry assignment
router.post('/lorries/:id/request', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;
  const fieldManagerId = req.user!.id;

  const lorry = await prisma.lorry.findFirst({
    where: { id, organizationId, status: 'AVAILABLE' }
  });

  if (!lorry) {
    return res.status(404).json({ error: 'Lorry not available' });
  }

  const updatedLorry = await prisma.lorry.update({
    where: { id },
    data: {
      status: 'ASSIGNED',
      assignedToId: fieldManagerId
    }
  });

  res.json(updatedLorry);
}));

// Get farmers
router.get('/farmers', asyncHandler(async (req: AuthRequest, res) => {
  const organizationId = req.user!.organizationId;

  const farmers = await prisma.farmer.findMany({
    where: { organizationId, isActive: true },
    include: {
      deliveries: {
        select: {
          id: true,
          totalWeight: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 3
      }
    },
    orderBy: { firstName: 'asc' }
  });

  res.json(farmers);
}));

// Add farmer to lorry (create delivery)
router.post('/deliveries', asyncHandler(async (req: AuthRequest, res) => {
  const organizationId = req.user!.organizationId;
  const fieldManagerId = req.user!.id;
  const { lorryId, farmerId } = req.body;

  if (!lorryId || !farmerId) {
    return res.status(400).json({ error: 'Lorry ID and Farmer ID are required' });
  }

  // Verify lorry is assigned to this field manager
  const lorry = await prisma.lorry.findFirst({
    where: {
      id: lorryId,
      organizationId,
      assignedToId: fieldManagerId,
      status: { in: ['ASSIGNED', 'LOADING'] }
    }
  });

  if (!lorry) {
    return res.status(404).json({ error: 'Lorry not found or not assigned to you' });
  }

  // Check if farmer already has a pending delivery for this lorry
  const existingDelivery = await prisma.delivery.findFirst({
    where: {
      lorryId,
      farmerId,
      status: { in: ['PENDING', 'IN_PROGRESS'] }
    }
  });

  if (existingDelivery) {
    return res.status(400).json({ error: 'Farmer already has a pending delivery for this lorry' });
  }

  const delivery = await prisma.delivery.create({
    data: {
      lorryId,
      farmerId,
      fieldManagerId,
      organizationId,
      totalWeight: 0,
      status: 'PENDING'
    },
    include: {
      farmer: { select: { firstName: true, lastName: true, phone: true } },
      bags: true
    }
  });

  // Update lorry status to LOADING if it's the first delivery
  if (lorry.status === 'ASSIGNED') {
    await prisma.lorry.update({
      where: { id: lorryId },
      data: { status: 'LOADING' }
    });
  }

  res.status(201).json(delivery);
}));

// Get deliveries for field manager
router.get('/deliveries', asyncHandler(async (req: AuthRequest, res) => {
  const organizationId = req.user!.organizationId;
  const fieldManagerId = req.user!.id;
  const { lorryId, status } = req.query;

  const where: any = { organizationId, fieldManagerId };
  if (lorryId) where.lorryId = lorryId;
  if (status) where.status = status;

  const deliveries = await prisma.delivery.findMany({
    where,
    include: {
      farmer: { select: { firstName: true, lastName: true, phone: true } },
      lorry: { select: { plateNumber: true } },
      bags: true
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(deliveries);
}));

// Add bag to delivery
router.post('/deliveries/:id/bags', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;
  const fieldManagerId = req.user!.id;
  const { weight, bagNumber } = req.body;

  if (!weight || !bagNumber) {
    return res.status(400).json({ error: 'Weight and bag number are required' });
  }

  // Verify delivery belongs to this field manager
  const delivery = await prisma.delivery.findFirst({
    where: {
      id,
      organizationId,
      fieldManagerId,
      status: { in: ['PENDING', 'IN_PROGRESS'] }
    },
    include: { bags: true }
  });

  if (!delivery) {
    return res.status(404).json({ error: 'Delivery not found or not editable' });
  }

  // Check if bag number already exists for this delivery
  const existingBag = delivery.bags.find(bag => bag.bagNumber === parseInt(bagNumber));
  if (existingBag) {
    return res.status(400).json({ error: 'Bag number already exists for this delivery' });
  }

  const bag = await prisma.bag.create({
    data: {
      deliveryId: id,
      weight: parseFloat(weight),
      bagNumber: parseInt(bagNumber)
    }
  });

  // Update delivery total weight and status
  const totalWeight = delivery.bags.reduce((sum, b) => sum + b.weight, 0) + parseFloat(weight);
  
  await prisma.delivery.update({
    where: { id },
    data: {
      totalWeight,
      status: 'IN_PROGRESS'
    }
  });

  res.status(201).json(bag);
}));

// Update delivery (add moisture content, complete, etc.)
router.put('/deliveries/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;
  const fieldManagerId = req.user!.id;
  const { moistureContent, status } = req.body;

  const delivery = await prisma.delivery.findFirst({
    where: {
      id,
      organizationId,
      fieldManagerId
    },
    include: { bags: true }
  });

  if (!delivery) {
    return res.status(404).json({ error: 'Delivery not found' });
  }

  const updateData: any = {};
  if (moistureContent !== undefined) updateData.moistureContent = parseFloat(moistureContent);
  if (status) updateData.status = status;
  if (status === 'COMPLETED') updateData.deliveredAt = new Date();

  const updatedDelivery = await prisma.delivery.update({
    where: { id },
    data: updateData,
    include: {
      farmer: { select: { firstName: true, lastName: true, phone: true } },
      lorry: { select: { plateNumber: true } },
      bags: true
    }
  });

  res.json(updatedDelivery);
}));

// Submit lorry (complete all deliveries and change lorry status)
router.post('/lorries/:id/submit', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;
  const fieldManagerId = req.user!.id;

  const lorry = await prisma.lorry.findFirst({
    where: {
      id,
      organizationId,
      assignedToId: fieldManagerId,
      status: 'LOADING'
    },
    include: {
      deliveries: {
        where: { status: { not: 'COMPLETED' } }
      }
    }
  });

  if (!lorry) {
    return res.status(404).json({ error: 'Lorry not found or not ready for submission' });
  }

  // Check if there are any incomplete deliveries
  if (lorry.deliveries.length === 0) {
    return res.status(400).json({ error: 'No deliveries to submit' });
  }

  // Update all pending deliveries to completed
  await prisma.delivery.updateMany({
    where: {
      lorryId: id,
      status: { in: ['PENDING', 'IN_PROGRESS'] }
    },
    data: {
      status: 'COMPLETED',
      deliveredAt: new Date()
    }
  });

  // Update lorry status
  const updatedLorry = await prisma.lorry.update({
    where: { id },
    data: { status: 'SUBMITTED' }
  });

  res.json(updatedLorry);
}));

// Record advance payment
router.post('/payments/advance', asyncHandler(async (req: AuthRequest, res) => {
  const organizationId = req.user!.organizationId;
  const processedById = req.user!.id;
  const { farmerId, amount, reference, notes } = req.body;

  if (!farmerId || !amount) {
    return res.status(400).json({ error: 'Farmer ID and amount are required' });
  }

  const payment = await prisma.payment.create({
    data: {
      farmerId,
      amount: parseFloat(amount),
      type: 'ADVANCE',
      reference,
      notes,
      organizationId,
      processedById,
      status: 'COMPLETED',
      paidAt: new Date()
    },
    include: {
      farmer: { select: { firstName: true, lastName: true } }
    }
  });

  res.status(201).json(payment);
}));

// Get reports/statistics
router.get('/reports', asyncHandler(async (req: AuthRequest, res) => {
  const organizationId = req.user!.organizationId;
  const fieldManagerId = req.user!.id;

  const [
    totalDeliveries,
    completedDeliveries,
    totalWeight,
    totalPayments
  ] = await Promise.all([
    prisma.delivery.count({
      where: { organizationId, fieldManagerId }
    }),
    prisma.delivery.count({
      where: { organizationId, fieldManagerId, status: 'COMPLETED' }
    }),
    prisma.delivery.aggregate({
      where: { organizationId, fieldManagerId, status: 'COMPLETED' },
      _sum: { totalWeight: true }
    }),
    prisma.payment.aggregate({
      where: { organizationId, processedById: fieldManagerId, type: 'ADVANCE' },
      _sum: { amount: true }
    })
  ]);

  res.json({
    deliveries: {
      total: totalDeliveries,
      completed: completedDeliveries,
      pending: totalDeliveries - completedDeliveries
    },
    totalWeight: totalWeight._sum.totalWeight || 0,
    totalAdvancePayments: totalPayments._sum.amount || 0
  });
}));

export default router;