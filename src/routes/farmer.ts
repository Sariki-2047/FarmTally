import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Apply authentication and role check to all farmer routes
router.use(authenticateToken);
router.use(requireRole(['FARMER', 'FARM_ADMIN', 'FIELD_MANAGER']));

// Get farmer profile and deliveries
router.get('/profile', asyncHandler(async (req: AuthRequest, res) => {
  const organizationId = req.user!.organizationId;
  const { farmerId } = req.query;

  // If user is a farmer, use their associated farmer record
  // If admin/field manager, they can specify farmerId
  let targetFarmerId = farmerId as string;
  
  if (req.user!.role === 'FARMER') {
    // Find farmer record associated with this user
    const farmer = await prisma.farmer.findFirst({
      where: { 
        organizationId,
        // In a real system, you'd have a userId field in farmer table
        // For now, we'll use email matching or similar logic
      }
    });
    
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }
    
    targetFarmerId = farmer.id;
  }

  if (!targetFarmerId) {
    return res.status(400).json({ error: 'Farmer ID is required' });
  }

  const farmer = await prisma.farmer.findFirst({
    where: { id: targetFarmerId, organizationId },
    include: {
      deliveries: {
        include: {
          lorry: { select: { plateNumber: true } },
          fieldManager: { select: { firstName: true, lastName: true } },
          bags: true
        },
        orderBy: { createdAt: 'desc' }
      },
      payments: {
        include: {
          delivery: { select: { id: true, totalWeight: true } },
          processedBy: { select: { firstName: true, lastName: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!farmer) {
    return res.status(404).json({ error: 'Farmer not found' });
  }

  res.json(farmer);
}));

// Get farmer deliveries
router.get('/deliveries', asyncHandler(async (req: AuthRequest, res) => {
  const organizationId = req.user!.organizationId;
  const { farmerId, status } = req.query;

  if (!farmerId) {
    return res.status(400).json({ error: 'Farmer ID is required' });
  }

  const where: any = { organizationId, farmerId };
  if (status) where.status = status;

  const deliveries = await prisma.delivery.findMany({
    where,
    include: {
      lorry: { select: { plateNumber: true } },
      fieldManager: { select: { firstName: true, lastName: true } },
      bags: true
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(deliveries);
}));

// Get farmer payments
router.get('/payments', asyncHandler(async (req: AuthRequest, res) => {
  const organizationId = req.user!.organizationId;
  const { farmerId, type } = req.query;

  if (!farmerId) {
    return res.status(400).json({ error: 'Farmer ID is required' });
  }

  const where: any = { organizationId, farmerId };
  if (type) where.type = type;

  const payments = await prisma.payment.findMany({
    where,
    include: {
      delivery: { 
        select: { 
          id: true, 
          totalWeight: true, 
          lorry: { select: { plateNumber: true } }
        } 
      },
      processedBy: { select: { firstName: true, lastName: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(payments);
}));

// Get farmer balance summary
router.get('/balance', asyncHandler(async (req: AuthRequest, res) => {
  const organizationId = req.user!.organizationId;
  const { farmerId } = req.query;

  if (!farmerId) {
    return res.status(400).json({ error: 'Farmer ID is required' });
  }

  const [
    totalEarnings,
    totalAdvances,
    totalDeductions,
    pendingDeliveries
  ] = await Promise.all([
    prisma.delivery.aggregate({
      where: { 
        organizationId, 
        farmerId, 
        status: 'COMPLETED',
        netAmount: { not: null }
      },
      _sum: { netAmount: true }
    }),
    prisma.payment.aggregate({
      where: { 
        organizationId, 
        farmerId, 
        type: 'ADVANCE',
        status: 'COMPLETED'
      },
      _sum: { amount: true }
    }),
    prisma.payment.aggregate({
      where: { 
        organizationId, 
        farmerId, 
        type: 'DEDUCTION',
        status: 'COMPLETED'
      },
      _sum: { amount: true }
    }),
    prisma.delivery.count({
      where: { 
        organizationId, 
        farmerId, 
        status: { in: ['PENDING', 'IN_PROGRESS'] }
      }
    })
  ]);

  const earnings = totalEarnings._sum.netAmount || 0;
  const advances = totalAdvances._sum.amount || 0;
  const deductions = totalDeductions._sum.amount || 0;
  const balance = earnings - advances - deductions;

  res.json({
    totalEarnings: earnings,
    totalAdvances: advances,
    totalDeductions: deductions,
    currentBalance: balance,
    pendingDeliveries
  });
}));

// Get farmer statistics
router.get('/statistics', asyncHandler(async (req: AuthRequest, res) => {
  const organizationId = req.user!.organizationId;
  const { farmerId } = req.query;

  if (!farmerId) {
    return res.status(400).json({ error: 'Farmer ID is required' });
  }

  const [
    totalDeliveries,
    completedDeliveries,
    totalWeight,
    averageQuality,
    recentDeliveries
  ] = await Promise.all([
    prisma.delivery.count({
      where: { organizationId, farmerId }
    }),
    prisma.delivery.count({
      where: { organizationId, farmerId, status: 'COMPLETED' }
    }),
    prisma.delivery.aggregate({
      where: { organizationId, farmerId, status: 'COMPLETED' },
      _sum: { totalWeight: true }
    }),
    prisma.delivery.groupBy({
      by: ['qualityGrade'],
      where: { 
        organizationId, 
        farmerId, 
        status: 'COMPLETED',
        qualityGrade: { not: null }
      },
      _count: { qualityGrade: true }
    }),
    prisma.delivery.findMany({
      where: { organizationId, farmerId },
      include: {
        lorry: { select: { plateNumber: true } },
        bags: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ]);

  res.json({
    deliveries: {
      total: totalDeliveries,
      completed: completedDeliveries,
      pending: totalDeliveries - completedDeliveries
    },
    totalWeight: totalWeight._sum.totalWeight || 0,
    qualityDistribution: averageQuality,
    recentDeliveries
  });
}));

export default router;