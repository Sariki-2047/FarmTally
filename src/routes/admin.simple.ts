import express from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to check if user is APPLICATION_ADMIN
const requireApplicationAdmin = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  if (!req.user || req.user.role !== 'APPLICATION_ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Application Admin privileges required'
    });
  }
  next();
};

// Get system statistics
router.get('/stats', authenticateToken, requireApplicationAdmin, asyncHandler(async (req: AuthRequest, res) => {
  try {
    // Get counts from database
    const [
      totalOrganizations,
      totalFarmAdmins,
      pendingApprovals,
      totalFieldManagers,
      totalFarmers,
      totalDeliveries,
      totalAdvancePayments
    ] = await Promise.all([
      prisma.organization.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'FARM_ADMIN', status: 'APPROVED' } }),
      prisma.user.count({ where: { role: 'FARM_ADMIN', status: 'PENDING' } }),
      prisma.user.count({ where: { role: 'FIELD_MANAGER', status: 'APPROVED' } }),
      prisma.farmer.count(),
      prisma.delivery.count(),
      prisma.advancePayment.count()
    ]);

    res.json({
      success: true,
      data: {
        totalOrganizations,
        totalFarmAdmins,
        pendingApprovals,
        totalFieldManagers,
        totalFarmers,
        totalDeliveries,
        totalAdvancePayments
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// Get pending Farm Admin approvals
router.get('/pending-farm-admins', authenticateToken, requireApplicationAdmin, asyncHandler(async (req: AuthRequest, res) => {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: {
        role: 'FARM_ADMIN',
        status: 'PENDING'
      },
      include: {
        organization: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: pendingUsers
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// Review Farm Admin (approve/reject)
router.post('/review-farm-admin', authenticateToken, requireApplicationAdmin, asyncHandler(async (req: AuthRequest, res) => {
  try {
    const { userId, approved, rejectionReason } = req.body;

    if (!userId || typeof approved !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'userId and approved status are required'
      });
    }

    const updateData: any = {
      status: approved ? 'APPROVED' : 'REJECTED',
      approvedBy: approved ? req.user!.id : undefined,
      approvedAt: approved ? new Date() : undefined,
      rejectedBy: !approved ? req.user!.id : undefined,
      rejectedAt: !approved ? new Date() : undefined,
      rejectionReason: !approved ? rejectionReason : undefined
    };

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        organization: true
      }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: `Farm Admin ${approved ? 'approved' : 'rejected'} successfully`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// Get all Farm Admins
router.get('/all-farm-admins', authenticateToken, requireApplicationAdmin, asyncHandler(async (req: AuthRequest, res) => {
  try {
    const farmAdmins = await prisma.user.findMany({
      where: {
        role: 'FARM_ADMIN'
      },
      include: {
        organization: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: farmAdmins
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// Health check for admin
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Admin service is healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;