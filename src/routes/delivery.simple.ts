import express from 'express';
import { deliveryService } from '../services/delivery.service.simple';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Add farmer to lorry with delivery details
router.post('/lorries/:lorryId/farmers/:farmerId', asyncHandler(async (req: AuthRequest, res) => {
  const { lorryId, farmerId } = req.params;
  const {
    deliveryDate,
    bagsCount,
    individualWeights,
    moistureContent,
    qualityGrade,
    photos,
    notes
  } = req.body;

  // Validate required fields
  if (!deliveryDate || !bagsCount || !individualWeights || moistureContent === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Delivery date, bags count, individual weights, and moisture content are required'
    });
  }

  // Validate field manager role
  if (req.user!.role !== 'FIELD_MANAGER') {
    return res.status(403).json({
      success: false,
      error: 'Only field managers can add farmers to lorries'
    });
  }

  try {
    const delivery = await deliveryService.addFarmerToLorry(
      lorryId,
      farmerId,
      req.user!.id,
      req.user!.organizationId,
      {
        lorryId,
        farmerId,
        deliveryDate: new Date(deliveryDate),
        bagsCount: parseInt(bagsCount),
        individualWeights: individualWeights.map((w: any) => parseFloat(w)),
        moistureContent: parseFloat(moistureContent),
        qualityGrade,
        photos,
        notes
      }
    );

    res.status(201).json({
      success: true,
      data: delivery,
      message: 'Farmer added to lorry successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// Get all deliveries for a lorry
router.get('/lorries/:lorryId', asyncHandler(async (req: AuthRequest, res) => {
  const { lorryId } = req.params;

  try {
    const deliveries = await deliveryService.getLorryDeliveries(lorryId, req.user!.organizationId);
    
    res.json({
      success: true,
      data: deliveries,
      count: deliveries.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// Get delivery by ID
router.get('/:deliveryId', asyncHandler(async (req: AuthRequest, res) => {
  const { deliveryId } = req.params;

  try {
    const delivery = await deliveryService.getDeliveryById(deliveryId, req.user!.organizationId);
    
    res.json({
      success: true,
      data: delivery
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
}));

// Update delivery details
router.put('/:deliveryId', asyncHandler(async (req: AuthRequest, res) => {
  const { deliveryId } = req.params;
  const {
    bagsCount,
    individualWeights,
    moistureContent,
    qualityGrade,
    qualityDeduction,
    pricePerKg,
    photos,
    notes
  } = req.body;

  // Validate user role - Field managers can update basic details, Farm admins can update pricing/quality
  if (req.user!.role !== 'FIELD_MANAGER' && req.user!.role !== 'FARM_ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Only field managers and farm admins can update deliveries'
    });
  }

  try {
    const updateData: any = {};
    
    // Field manager can update these fields
    if (req.user!.role === 'FIELD_MANAGER') {
      if (bagsCount) updateData.bagsCount = parseInt(bagsCount);
      if (individualWeights) updateData.individualWeights = individualWeights.map((w: any) => parseFloat(w));
      if (moistureContent !== undefined) updateData.moistureContent = parseFloat(moistureContent);
      if (qualityGrade) updateData.qualityGrade = qualityGrade;
      if (photos) updateData.photos = photos;
      if (notes) updateData.notes = notes;
    }
    
    // Farm admin can update these fields
    if (req.user!.role === 'FARM_ADMIN') {
      if (qualityDeduction !== undefined) updateData.qualityDeduction = parseFloat(qualityDeduction);
      if (pricePerKg !== undefined) updateData.pricePerKg = parseFloat(pricePerKg);
      if (qualityGrade) updateData.qualityGrade = qualityGrade;
    }

    const delivery = await deliveryService.updateDelivery(
      deliveryId,
      updateData,
      req.user!.id,
      req.user!.organizationId
    );

    res.json({
      success: true,
      data: delivery,
      message: 'Delivery updated successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// Set quality deduction for delivery (Farm Admin only)
router.patch('/:deliveryId/quality', asyncHandler(async (req: AuthRequest, res) => {
  const { deliveryId } = req.params;
  const { qualityDeduction, standardDeduction, qualityGrade } = req.body;

  if (qualityDeduction === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Quality deduction is required'
    });
  }

  // Validate farm admin role
  if (req.user!.role !== 'FARM_ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Only farm admins can set quality deduction'
    });
  }

  try {
    const delivery = await deliveryService.setQualityDeduction(
      deliveryId,
      { 
        qualityDeduction: parseFloat(qualityDeduction),
        standardDeduction: standardDeduction ? parseFloat(standardDeduction) : undefined,
        qualityGrade: qualityGrade
      },
      req.user!.organizationId
    );

    res.json({
      success: true,
      data: delivery,
      message: 'Quality deduction set successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// Set pricing for delivery (Farm Admin only)
router.patch('/:deliveryId/pricing', asyncHandler(async (req: AuthRequest, res) => {
  const { deliveryId } = req.params;
  const { pricePerKg } = req.body;

  if (!pricePerKg) {
    return res.status(400).json({
      success: false,
      error: 'Price per kg is required'
    });
  }

  // Validate farm admin role
  if (req.user!.role !== 'FARM_ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Only farm admins can set pricing'
    });
  }

  try {
    const delivery = await deliveryService.setPricing(
      deliveryId,
      { pricePerKg: parseFloat(pricePerKg) },
      req.user!.organizationId
    );

    res.json({
      success: true,
      data: delivery,
      message: 'Pricing set successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// Clear pending deliveries for lorry
router.post('/lorries/:lorryId/clear-pending', asyncHandler(async (req: AuthRequest, res) => {
  const { lorryId } = req.params;

  // Validate field manager role
  if (req.user!.role !== 'FIELD_MANAGER') {
    return res.status(403).json({
      success: false,
      error: 'Only field managers can clear pending deliveries'
    });
  }

  try {
    await deliveryService.clearPendingDeliveries(lorryId, req.user!.organizationId);

    res.json({
      success: true,
      message: 'Pending deliveries cleared successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// Submit lorry for processing
router.post('/lorries/:lorryId/submit', asyncHandler(async (req: AuthRequest, res) => {
  const { lorryId } = req.params;

  // Validate field manager role
  if (req.user!.role !== 'FIELD_MANAGER') {
    return res.status(403).json({
      success: false,
      error: 'Only field managers can submit lorries'
    });
  }

  try {
    await deliveryService.submitLorry(lorryId, req.user!.id, req.user!.organizationId);

    res.json({
      success: true,
      message: 'Lorry submitted for processing successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// Mark lorry as sent to dealer (Farm Admin only)
router.post('/lorries/:lorryId/send-to-dealer', asyncHandler(async (req: AuthRequest, res) => {
  const { lorryId } = req.params;

  // Validate farm admin role
  if (req.user!.role !== 'FARM_ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Only farm admins can mark lorries as sent to dealer'
    });
  }

  try {
    await deliveryService.markSentToDealer(lorryId, req.user!.organizationId);

    res.json({
      success: true,
      message: 'Lorry marked as sent to dealer successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// Delete delivery
router.delete('/:deliveryId', asyncHandler(async (req: AuthRequest, res) => {
  const { deliveryId } = req.params;

  // Validate field manager role
  if (req.user!.role !== 'FIELD_MANAGER') {
    return res.status(403).json({
      success: false,
      error: 'Only field managers can delete deliveries'
    });
  }

  try {
    await deliveryService.deleteDelivery(deliveryId, req.user!.id, req.user!.organizationId);

    res.json({
      success: true,
      message: 'Delivery deleted successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// Get deliveries based on user role
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  try {
    let deliveries;
    
    if (req.user!.role === 'FARM_ADMIN') {
      // Farm Admin sees all organization deliveries
      deliveries = await deliveryService.getOrganizationDeliveries(req.user!.organizationId);
    } else if (req.user!.role === 'FIELD_MANAGER') {
      // Field Manager sees only their own deliveries
      deliveries = await deliveryService.getFieldManagerDeliveries(req.user!.id, req.user!.organizationId);
    } else {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: deliveries,
      count: deliveries.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// Get delivery summary for lorry
router.get('/lorries/:lorryId/summary', asyncHandler(async (req: AuthRequest, res) => {
  const { lorryId } = req.params;

  try {
    const deliveries = await deliveryService.getLorryDeliveries(lorryId, req.user!.organizationId);
    
    // Calculate summary statistics
    const summary = {
      totalDeliveries: deliveries.length,
      totalFarmers: deliveries.length,
      totalBags: deliveries.reduce((sum, d) => sum + d.bagsCount, 0),
      totalGrossWeight: deliveries.reduce((sum, d) => sum + d.grossWeight, 0),
      totalNetWeight: deliveries.reduce((sum, d) => sum + d.netWeight, 0),
      totalStandardDeduction: deliveries.reduce((sum, d) => sum + (d.standardDeduction || 0), 0),
      totalQualityDeduction: deliveries.reduce((sum, d) => sum + (d.qualityDeduction || 0), 0),
      totalValue: deliveries.reduce((sum, d) => sum + (d.totalValue || 0), 0),
      totalAdvanceAmount: deliveries.reduce((sum, d) => sum + (d.advanceAmount || 0), 0),
      totalFinalAmount: deliveries.reduce((sum, d) => sum + (d.finalAmount || 0), 0),
      averageMoisture: deliveries.length > 0 
        ? deliveries.reduce((sum, d) => sum + (d.moistureContent || 0), 0) / deliveries.length 
        : 0,
      qualityDistribution: deliveries.reduce((acc: any, d) => {
        const grade = d.qualityGrade || 'Unknown';
        acc[grade] = (acc[grade] || 0) + 1;
        return acc;
      }, {}),
      statusDistribution: deliveries.reduce((acc: any, d) => {
        acc[d.status] = (acc[d.status] || 0) + 1;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: {
        summary,
        deliveries
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

export default router;