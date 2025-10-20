import express from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Create lorry request (Field Manager only)
router.post('/', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const { requestedDate, estimatedGunnyBags, location, notes } = req.body;

  if (!requestedDate || !estimatedGunnyBags || !location) {
    return res.status(400).json({
      success: false,
      error: 'Requested date, estimated gunny bags, and location are required'
    });
  }

  // Only Field Managers can create lorry requests
  if (req.user!.role !== 'FIELD_MANAGER') {
    return res.status(403).json({
      success: false,
      error: 'Only field managers can create lorry requests'
    });
  }

  try {
    // Convert gunny bags to estimated weight (assuming 50kg per bag)
    const estimatedWeight = parseInt(estimatedGunnyBags) * 50;
    
    const lorryRequest = await prisma.lorryRequest.create({
      data: {
        requestedDate: new Date(requestedDate),
        estimatedFarmers: 1, // Default to 1, can be updated later
        estimatedWeight: estimatedWeight,
        location,
        purpose: 'Corn collection', // Default purpose
        notes: notes || null,
        managerId: req.user!.id,
        organizationId: req.user!.organizationId,
        status: 'PENDING'
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        assignedLorry: {
          select: {
            id: true,
            plateNumber: true,
            capacity: true,
            status: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: lorryRequest,
      message: 'Lorry request created successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// Get lorry requests (Field Manager gets their own, Farm Admin gets all for organization)
router.get('/', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  try {
    let whereClause: any = {};

    if (req.user!.role === 'FIELD_MANAGER') {
      // Field Manager can only see their own requests
      whereClause = {
        managerId: req.user!.id
      };
    } else if (req.user!.role === 'FARM_ADMIN') {
      // Farm Admin can see all requests for their organization
      whereClause = {
        organizationId: req.user!.organizationId
      };
    } else {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const lorryRequests = await prisma.lorryRequest.findMany({
      where: whereClause,
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        assignedLorry: {
          select: {
            id: true,
            plateNumber: true,
            capacity: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: lorryRequests
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// Update lorry request status (Farm Admin only)
router.patch('/:requestId/status', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const { requestId } = req.params;
  const { status, lorryId } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      error: 'Status is required'
    });
  }

  // Only Farm Admin can update request status
  if (req.user!.role !== 'FARM_ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Only farm admins can update lorry request status'
    });
  }

  try {
    // Verify the request belongs to the Farm Admin's organization
    const existingRequest = await prisma.lorryRequest.findFirst({
      where: {
        id: requestId,
        organizationId: req.user!.organizationId
      }
    });

    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        error: 'Lorry request not found'
      });
    }

    // If assigning a lorry, verify it belongs to the organization and is available
    if (status === 'APPROVED' && lorryId) {
      const lorry = await prisma.lorry.findFirst({
        where: {
          id: lorryId,
          organizationId: req.user!.organizationId,
          status: 'AVAILABLE'
        }
      });

      if (!lorry) {
        return res.status(400).json({
          success: false,
          error: 'Lorry not found or not available'
        });
      }

      // Update lorry status to ASSIGNED
      await prisma.lorry.update({
        where: { id: lorryId },
        data: { status: 'ASSIGNED' }
      });
    }

    // Update the lorry request
    const updatedRequest = await prisma.lorryRequest.update({
      where: { id: requestId },
      data: {
        status: status as any,
        assignedLorryId: status === 'APPROVED' ? lorryId : null,
        approvedAt: status === 'APPROVED' ? new Date() : null,
        rejectedAt: status === 'REJECTED' ? new Date() : null
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        assignedLorry: {
          select: {
            id: true,
            plateNumber: true,
            capacity: true,
            status: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedRequest,
      message: `Lorry request ${status.toLowerCase()} successfully`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// Get lorry request details
router.get('/:requestId', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const { requestId } = req.params;

  try {
    let whereClause: any = { id: requestId };

    if (req.user!.role === 'FIELD_MANAGER') {
      // Field Manager can only see their own requests
      whereClause.managerId = req.user!.id;
    } else if (req.user!.role === 'FARM_ADMIN') {
      // Farm Admin can see all requests for their organization
      whereClause.organizationId = req.user!.organizationId;
    } else {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const lorryRequest = await prisma.lorryRequest.findFirst({
      where: whereClause,
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        assignedLorry: {
          select: {
            id: true,
            plateNumber: true,
            capacity: true,
            status: true
          }
        }
      }
    });

    if (!lorryRequest) {
      return res.status(404).json({
        success: false,
        error: 'Lorry request not found'
      });
    }

    res.json({
      success: true,
      data: lorryRequest
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

export default router;