import express from 'express';
import { LorryRequestController } from '../controllers/lorry-request.controller';
import { validate, validateParams, validateQuery } from '../middleware/validation.middleware';
import { lorryRequestSchemas, commonSchemas } from '../utils/validation';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import Joi from 'joi';

const router = express.Router();
const lorryRequestController = new LorryRequestController();

// All routes require authentication
router.use(authMiddleware);

// Organization-specific lorry request routes
router.post(
  '/organizations/:organizationId/lorry-requests',
  requireRole(['FIELD_MANAGER']),
  validateParams(Joi.object({ organizationId: commonSchemas.uuid })),
  validate(lorryRequestSchemas.create),
  lorryRequestController.createLorryRequest
);

router.get(
  '/organizations/:organizationId/lorry-requests',
  validateParams(Joi.object({ organizationId: commonSchemas.uuid })),
  validateQuery(Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
    managerId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
  })),
  lorryRequestController.getLorryRequests
);

router.get(
  '/organizations/:organizationId/lorry-requests/stats',
  validateParams(Joi.object({ organizationId: commonSchemas.uuid })),
  lorryRequestController.getLorryRequestStats
);

// Individual lorry request routes
router.get(
  '/lorry-requests/:requestId',
  validateParams(Joi.object({ requestId: commonSchemas.uuid })),
  lorryRequestController.getLorryRequestById
);

router.put(
  '/lorry-requests/:requestId',
  requireRole(['FIELD_MANAGER']),
  validateParams(Joi.object({ requestId: commonSchemas.uuid })),
  validate(lorryRequestSchemas.update),
  lorryRequestController.updateLorryRequest
);

// Admin approval/rejection routes
router.post(
  '/lorry-requests/:requestId/approve',
  requireRole(['FARM_ADMIN']),
  validateParams(Joi.object({ requestId: commonSchemas.uuid })),
  validate(lorryRequestSchemas.approve),
  lorryRequestController.approveLorryRequest
);

router.post(
  '/lorry-requests/:requestId/reject',
  requireRole(['FARM_ADMIN']),
  validateParams(Joi.object({ requestId: commonSchemas.uuid })),
  validate(lorryRequestSchemas.reject),
  lorryRequestController.rejectLorryRequest
);

// Manager cancellation route
router.post(
  '/lorry-requests/:requestId/cancel',
  requireRole(['FIELD_MANAGER']),
  validateParams(Joi.object({ requestId: commonSchemas.uuid })),
  lorryRequestController.cancelLorryRequest
);

export default router;