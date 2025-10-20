import express from 'express';
import { LorryController } from '../controllers/lorry.controller';
import { validate, validateParams, validateQuery } from '../middleware/validation.middleware';
import { lorrySchemas, commonSchemas, querySchemas } from '../utils/validation';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import Joi from 'joi';

const router = express.Router();
const lorryController = new LorryController();

// All routes require authentication
router.use(authMiddleware);

// Organization-specific lorry routes
router.post(
  '/organizations/:organizationId/lorries',
  requireRole(['FARM_ADMIN']),
  validateParams(Joi.object({ organizationId: commonSchemas.uuid })),
  validate(lorrySchemas.create),
  lorryController.createLorry
);

router.get(
  '/organizations/:organizationId/lorries',
  validateParams(Joi.object({ organizationId: commonSchemas.uuid })),
  validateQuery(Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    status: Joi.string().valid('AVAILABLE', 'ASSIGNED', 'IN_TRANSIT', 'MAINTENANCE'),
    assignedManagerId: Joi.string().uuid().optional(),
    search: Joi.string().min(1).max(100),
  })),
  lorryController.getLorries
);

router.get(
  '/organizations/:organizationId/lorries/stats',
  validateParams(Joi.object({ organizationId: commonSchemas.uuid })),
  lorryController.getLorryStats
);

// Individual lorry routes
router.get(
  '/lorries/:lorryId',
  validateParams(Joi.object({ lorryId: commonSchemas.uuid })),
  lorryController.getLorryById
);

router.put(
  '/lorries/:lorryId',
  validateParams(Joi.object({ lorryId: commonSchemas.uuid })),
  validate(lorrySchemas.update),
  lorryController.updateLorry
);

router.delete(
  '/lorries/:lorryId',
  requireRole(['FARM_ADMIN']),
  validateParams(Joi.object({ lorryId: commonSchemas.uuid })),
  lorryController.deleteLorry
);

// Lorry assignment routes
router.post(
  '/lorries/:lorryId/assign',
  requireRole(['FARM_ADMIN']),
  validateParams(Joi.object({ lorryId: commonSchemas.uuid })),
  validate(Joi.object({
    managerId: commonSchemas.uuid.required(),
  })),
  lorryController.assignLorryToManager
);

router.post(
  '/lorries/:lorryId/unassign',
  requireRole(['FARM_ADMIN']),
  validateParams(Joi.object({ lorryId: commonSchemas.uuid })),
  lorryController.unassignLorry
);

export default router;