import express from 'express';
import { farmerService } from '../services/farmer.service.simple';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create farmer
router.post('/', asyncHandler(async (req: AuthRequest, res) => {
  const { firstName, lastName, phone, address, bankAccount, idNumber } = req.body;

  if (!firstName || !lastName || !phone) {
    return res.status(400).json({ 
      success: false, 
      error: 'First name, last name, and phone are required' 
    });
  }

  try {
    const farmer = await farmerService.createFarmer({
      firstName,
      lastName,
      phone,
      address,
      bankAccount,
      idNumber
    }, req.user!.organizationId);

    res.status(201).json({
      success: true,
      data: farmer
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
}));

// Get farmers with pagination
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  try {
    const result = await farmerService.getFarmers(req.user!.organizationId, page, limit);
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

// Search farmers
router.get('/search', asyncHandler(async (req: AuthRequest, res) => {
  const query = req.query.q as string;

  if (!query) {
    return res.status(400).json({ 
      success: false, 
      error: 'Search query is required' 
    });
  }

  try {
    const farmers = await farmerService.searchFarmers(query, req.user!.organizationId);
    res.json({
      success: true,
      data: farmers
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}));

// Get farmer by ID
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  try {
    const farmer = await farmerService.getFarmerById(req.params.id, req.user!.organizationId);
    res.json({
      success: true,
      data: farmer
    });
  } catch (error: any) {
    res.status(404).json({ 
      success: false, 
      error: error.message 
    });
  }
}));

// Update farmer
router.put('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { firstName, lastName, phone, address, bankAccount, idNumber } = req.body;

  try {
    const farmer = await farmerService.updateFarmer(req.params.id, {
      firstName,
      lastName,
      phone,
      address,
      bankAccount,
      idNumber
    }, req.user!.organizationId);

    res.json({
      success: true,
      data: farmer
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
}));

// Delete farmer
router.delete('/:id', asyncHandler(async (req: AuthRequest, res) => {
  try {
    await farmerService.deleteFarmer(req.params.id, req.user!.organizationId);
    res.json({
      success: true,
      message: 'Farmer deleted successfully'
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
}));

export default router;