import express from 'express';
import { DeliveryController } from '../controllers/delivery.controller';
import { validate, validateParams, validateQuery } from '../middleware/validation.middleware';
import { deliverySchemas, commonSchemas } from '../utils/validation';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import Joi from 'joi';

const router = express.Router();
const deliveryController = new DeliveryController();

// All routes require authentication
router.use(authMiddleware);

// Field Manager routes - Delivery recording
router.post(
  '/lorries/:lorryId/farmers/:farmerId/delivery',
  requireRole(['FIELD_MANAGER']),
  validateParams(Joi.object({
    lorryId: commonSchemas.uuid,
    farmerId: commonSchemas.uuid,
  })),
  validate(deliverySchemas.create),
  deliveryController.addFarmerToLorry
);

router.get(
  '/lorries/:lorryId/deliveries',
  validateParams(Joi.object({ lorryId: commonSchemas.uuid })),
  deliveryController.getLorryDeliveries
);

router.put(
  '/deliveries/:deliveryId',
  requireRole(['FIELD_MANAGER']),
  validateParams(Joi.object({ deliveryId: commonSchemas.uuid })),
  validate(deliverySchemas.update),
  deliveryController.updateDelivery
);

router.post(
  '/lorries/:lorryId/submit',
  requireRole(['FIELD_MANAGER']),
  validateParams(Joi.object({ lorryId: commonSchemas.uuid })),
  deliveryController.submitLorryToAdmin
);

// Advance Payment routes
router.post(
  '/organizations/:organizationId/advance-payments',
  requireRole(['FARM_ADMIN', 'FIELD_MANAGER']),
  validateParams(Joi.object({ organizationId: commonSchemas.uuid })),
  validate(Joi.object({
    farmerId: commonSchemas.uuid.required(),
    amount: Joi.number().positive().precision(2).required(),
    paymentMethod: Joi.string().valid('CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CHECK').required(),
    paymentDate: Joi.date().iso().required(),
    referenceNumber: Joi.string().max(100),
    reason: Joi.string().max(1000),
    notes: Joi.string().max(1000),
    receiptPhoto: Joi.string().uri(),
  })),
  deliveryController.createAdvancePayment
);

// Farm Admin routes - Quality deductions
router.post(
  '/deliveries/:deliveryId/quality-deduction',
  requireRole(['FARM_ADMIN']),
  validateParams(Joi.object({ deliveryId: commonSchemas.uuid })),
  validate(Joi.object({
    qualityDeductionKgs: Joi.number().min(0).precision(2).required(),
    qualityDeductionReason: Joi.string().max(1000),
  })),
  deliveryController.setQualityDeduction
);

// Farm Admin routes - Flexible pricing
router.post(
  '/organizations/:organizationId/pricing',
  requireRole(['FARM_ADMIN']),
  validateParams(Joi.object({ organizationId: commonSchemas.uuid })),
  validate(Joi.object({
    pricePerKg: Joi.number().positive().precision(2).required(),
    pricingType: Joi.string().valid('UNIVERSAL', 'LORRY', 'FARMER').required(),
    lorryId: Joi.string().uuid().when('pricingType', {
      is: 'LORRY',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    farmerId: Joi.string().uuid().when('pricingType', {
      is: 'FARMER',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  })),
  deliveryController.setPricing
);

router.post(
  '/lorries/:lorryId/process',
  requireRole(['FARM_ADMIN']),
  validateParams(Joi.object({ lorryId: commonSchemas.uuid })),
  deliveryController.processDeliveries
);

// Organization-specific delivery routes
router.get(
  '/organizations/:organizationId/deliveries',
  validateParams(Joi.object({ organizationId: commonSchemas.uuid })),
  validateQuery(Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
    lorryId: Joi.string().uuid().optional(),
    farmerId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
  })),
  deliveryController.getDeliveries
);

router.get(
  '/organizations/:organizationId/deliveries/stats',
  validateParams(Joi.object({ organizationId: commonSchemas.uuid })),
  deliveryController.getDeliveryStats
);

export default router;