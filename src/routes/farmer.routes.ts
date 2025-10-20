import express from 'express';
import { FarmerController } from '../controllers/farmer.controller';
import { validate, validateParams, validateQuery } from '../middleware/validation.middleware';
import { farmerSchemas, commonSchemas } from '../utils/validation';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import Joi from 'joi';

const router = express.Router();
const farmerController = new FarmerController();

// All routes require authentication
router.use(authMiddleware);

// Organization-specific farmer routes
router.post(
  '/organizations/:organizationId/farmers',
  requireRole(['FARM_ADMIN', 'FIELD_MANAGER']),
  validateParams(Joi.object({ organizationId: commonSchemas.uuid })),
  validate(farmerSchemas.create),
  farmerController.createFarmer
);

router.get(
  '/organizations/:organizationId/farmers',
  validateParams(Joi.object({ organizationId: commonSchemas.uuid })),
  validateQuery(Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().min(1).max(100),
    status: Joi.string().valid('ACTIVE', 'INACTIVE'),
  })),
  farmerController.getFarmers
);

router.get(
  '/organizations/:organizationId/farmers/stats',
  validateParams(Joi.object({ organizationId: commonSchemas.uuid })),
  farmerController.getFarmerStats
);

router.get(
  '/organizations/:organizationId/farmers/search',
  validateParams(Joi.object({ organizationId: commonSchemas.uuid })),
  validateQuery(Joi.object({
    search: Joi.string().min(1).max(100),
    limit: Joi.number().integer().min(1).max(50).default(10),
  })),
  farmerController.searchFarmersForLorry
);

// Individual farmer routes
router.get(
  '/farmers/:farmerId',
  validateParams(Joi.object({ farmerId: commonSchemas.uuid })),
  farmerController.getFarmerById
);

router.put(
  '/farmers/:farmerId',
  requireRole(['FARM_ADMIN', 'FIELD_MANAGER']),
  validateParams(Joi.object({ farmerId: commonSchemas.uuid })),
  validate(farmerSchemas.update),
  farmerController.updateFarmer
);

router.delete(
  '/farmers/:farmerId',
  requireRole(['FARM_ADMIN']),
  validateParams(Joi.object({ farmerId: commonSchemas.uuid })),
  farmerController.removeFarmerFromOrganization
);

export default router;