import express from 'express';
import { lorryService } from '../services/lorry.service.simple';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

// Create lorry
router.post('/', asyncHandler(async (req: AuthRequest, res) => {
  const { plateNumber, capacity, assignedManagerId } = req.body;

  if (!plateNumber || !capacity) {
    return res.status(400).json({ 
      success: false, 
      error: 'Plate number and capacity are required' 
    });
  }

  try {
    const lorry = await lorryService.createLorry({
      plateNumber,
      capacity: parseFloat(capacity),
      assignedManagerId
    }, req.user!.organizationId);

    res.status(201).json({
      success: true,
      data: lorry
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
}));

// Get organization lorries (Farm Admin only)
router.get('/organization', asyncHandler(async (req: AuthRequest, res) => {
  if (req.user!.role !== 'FARM_ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Only farm admins can view organization lorries'
    });
  }

  try {
    const lorries = await prisma.lorry.findMany({
      where: {
        organizationId: req.user!.organizationId
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: lorries
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// Get lorries with pagination
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  try {
    const result = await lorryService.getLorries(req.user!.organizationId, page, limit);
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}));

// Get lorry by ID
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  try {
    const lorry = await lorryService.getLorryById(req.params.id, req.user!.organizationId);
    res.json({
      success: true,
      data: lorry
    });
  } catch (error: any) {
    res.status(404).json({ 
      success: false, 
      error: error.message 
    });
  }
}));

// Update lorry
router.put('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { plateNumber, capacity, assignedManagerId } = req.body;

  try {
    const lorry = await lorryService.updateLorry(req.params.id, {
      plateNumber,
      capacity: capacity ? parseFloat(capacity) : undefined,
      assignedManagerId
    }, req.user!.organizationId);

    res.json({
      success: true,
      data: lorry
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
}));

// Update lorry status
router.patch('/:id/status', asyncHandler(async (req: AuthRequest, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ 
      success: false, 
      error: 'Status is required' 
    });
  }

  try {
    const lorry = await lorryService.updateLorryStatus(req.params.id, status, req.user!.organizationId);
    res.json({
      success: true,
      data: lorry
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
}));

// Delete lorry
router.delete('/:id', asyncHandler(async (req: AuthRequest, res) => {
  try {
    await lorryService.deleteLorry(req.params.id, req.user!.organizationId);
    res.json({
      success: true,
      message: 'Lorry deleted successfully'
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
}));

export default router;