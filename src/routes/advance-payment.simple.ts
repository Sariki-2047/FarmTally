import express from 'express';
import { advancePaymentService } from '../services/advance-payment.service.simple';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create advance payment (Farm Admin only)
router.post('/', asyncHandler(async (req: AuthRequest, res) => {
  const { farmerId, amount, paymentDate, reference, notes } = req.body;

  if (!farmerId || !amount || !paymentDate) {
    return res.status(400).json({
      success: false,
      error: 'Farmer ID, amount, and payment date are required'
    });
  }

  // Validate farm admin role
  if (req.user!.role !== 'FARM_ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Only farm admins can create advance payments'
    });
  }

  try {
    const payment = await advancePaymentService.createAdvancePayment(
      {
        farmerId,
        amount: parseFloat(amount),
        paymentDate: new Date(paymentDate),
        reference,
        notes
      },
      req.user!.id,
      req.user!.organizationId
    );

    res.status(201).json({
      success: true,
      data: payment,
      message: 'Advance payment created successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// Get advance payments for a farmer
router.get('/farmer/:farmerId', asyncHandler(async (req: AuthRequest, res) => {
  const { farmerId } = req.params;

  try {
    const payments = await advancePaymentService.getFarmerAdvancePayments(
      farmerId,
      req.user!.organizationId
    );

    const totalBalance = await advancePaymentService.getFarmerAdvanceBalance(
      farmerId,
      req.user!.organizationId
    );

    res.json({
      success: true,
      data: {
        payments,
        totalBalance,
        count: payments.length
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// Get farmer's total advance balance
router.get('/farmer/:farmerId/balance', asyncHandler(async (req: AuthRequest, res) => {
  const { farmerId } = req.params;

  try {
    const balance = await advancePaymentService.getFarmerAdvanceBalance(
      farmerId,
      req.user!.organizationId
    );

    res.json({
      success: true,
      data: {
        farmerId,
        totalAdvanceBalance: balance
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// Get advance payment summary for organization
router.get('/summary', asyncHandler(async (req: AuthRequest, res) => {
  try {
    const summary = await advancePaymentService.getAdvancePaymentSummary(
      req.user!.organizationId
    );

    res.json({
      success: true,
      data: summary
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// Update advance payment (Farm Admin only)
router.put('/:paymentId', asyncHandler(async (req: AuthRequest, res) => {
  const { paymentId } = req.params;
  const { amount, paymentDate, reference, notes } = req.body;

  // Validate farm admin role
  if (req.user!.role !== 'FARM_ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Only farm admins can update advance payments'
    });
  }

  try {
    const payment = await advancePaymentService.updateAdvancePayment(
      paymentId,
      {
        amount: amount ? parseFloat(amount) : undefined,
        paymentDate: paymentDate ? new Date(paymentDate) : undefined,
        reference,
        notes
      },
      req.user!.organizationId
    );

    res.json({
      success: true,
      data: payment,
      message: 'Advance payment updated successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// Delete advance payment (Farm Admin only)
router.delete('/:paymentId', asyncHandler(async (req: AuthRequest, res) => {
  const { paymentId } = req.params;

  // Validate farm admin role
  if (req.user!.role !== 'FARM_ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Only farm admins can delete advance payments'
    });
  }

  try {
    await advancePaymentService.deleteAdvancePayment(
      paymentId,
      req.user!.organizationId
    );

    res.json({
      success: true,
      message: 'Advance payment deleted successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

export default router;