import express from 'express';
import { OrganizationController } from '../controllers/organization.controller';
import { validate, validateParams } from '../middleware/validation.middleware';
import { organizationSchemas, commonSchemas } from '../utils/validation';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import Joi from 'joi';

const router = express.Router();
const organizationController = new OrganizationController();

// All routes require authentication
router.use(authMiddleware);

// Organization CRUD routes
router.post(
  '/',
  requireRole(['FARM_ADMIN']),
  validate(organizationSchemas.create),
  organizationController.createOrganization
);

router.get(
  '/:organizationId',
  validateParams(Joi.object({ organizationId: commonSchemas.uuid })),
  organizationController.getOrganization
);

router.put(
  '/:organizationId',
  requireRole(['FARM_ADMIN']),
  validateParams(Joi.object({ organizationId: commonSchemas.uuid })),
  validate(organizationSchemas.update),
  organizationController.updateOrganization
);

// User management routes
router.get(
  '/:organizationId/users',
  validateParams(Joi.object({ organizationId: commonSchemas.uuid })),
  organizationController.getOrganizationUsers
);

router.post(
  '/:organizationId/users',
  requireRole(['FARM_ADMIN']),
  validateParams(Joi.object({ organizationId: commonSchemas.uuid })),
  validate(Joi.object({
    email: commonSchemas.email,
    phone: commonSchemas.phone,
    role: Joi.string().valid('FIELD_MANAGER', 'FARMER').required(),
    profile: Joi.object({
      firstName: Joi.string().min(2).max(50).required(),
      lastName: Joi.string().min(2).max(50).required(),
      address: Joi.string().max(500),
      idNumber: Joi.string().max(50),
    }).required(),
  }).or('email', 'phone')),
  organizationController.inviteUser
);

router.delete(
  '/:organizationId/users/:userId',
  requireRole(['FARM_ADMIN']),
  validateParams(Joi.object({
    organizationId: commonSchemas.uuid,
    userId: commonSchemas.uuid,
  })),
  organizationController.removeUser
);

// Statistics route
router.get(
  '/:organizationId/stats',
  validateParams(Joi.object({ organizationId: commonSchemas.uuid })),
  organizationController.getOrganizationStats
);

export default router;