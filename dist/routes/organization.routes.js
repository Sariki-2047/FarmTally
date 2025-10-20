"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const organization_controller_1 = require("../controllers/organization.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const validation_1 = require("../utils/validation");
const auth_middleware_1 = require("../middleware/auth.middleware");
const joi_1 = __importDefault(require("joi"));
const router = express_1.default.Router();
const organizationController = new organization_controller_1.OrganizationController();
router.use(auth_middleware_1.authMiddleware);
router.post('/', (0, auth_middleware_1.requireRole)(['FARM_ADMIN']), (0, validation_middleware_1.validate)(validation_1.organizationSchemas.create), organizationController.createOrganization);
router.get('/:organizationId', (0, validation_middleware_1.validateParams)(joi_1.default.object({ organizationId: validation_1.commonSchemas.uuid })), organizationController.getOrganization);
router.put('/:organizationId', (0, auth_middleware_1.requireRole)(['FARM_ADMIN']), (0, validation_middleware_1.validateParams)(joi_1.default.object({ organizationId: validation_1.commonSchemas.uuid })), (0, validation_middleware_1.validate)(validation_1.organizationSchemas.update), organizationController.updateOrganization);
router.get('/:organizationId/users', (0, validation_middleware_1.validateParams)(joi_1.default.object({ organizationId: validation_1.commonSchemas.uuid })), organizationController.getOrganizationUsers);
router.post('/:organizationId/users', (0, auth_middleware_1.requireRole)(['FARM_ADMIN']), (0, validation_middleware_1.validateParams)(joi_1.default.object({ organizationId: validation_1.commonSchemas.uuid })), (0, validation_middleware_1.validate)(joi_1.default.object({
    email: validation_1.commonSchemas.email,
    phone: validation_1.commonSchemas.phone,
    role: joi_1.default.string().valid('FIELD_MANAGER', 'FARMER').required(),
    profile: joi_1.default.object({
        firstName: joi_1.default.string().min(2).max(50).required(),
        lastName: joi_1.default.string().min(2).max(50).required(),
        address: joi_1.default.string().max(500),
        idNumber: joi_1.default.string().max(50),
    }).required(),
}).or('email', 'phone')), organizationController.inviteUser);
router.delete('/:organizationId/users/:userId', (0, auth_middleware_1.requireRole)(['FARM_ADMIN']), (0, validation_middleware_1.validateParams)(joi_1.default.object({
    organizationId: validation_1.commonSchemas.uuid,
    userId: validation_1.commonSchemas.uuid,
})), organizationController.removeUser);
router.get('/:organizationId/stats', (0, validation_middleware_1.validateParams)(joi_1.default.object({ organizationId: validation_1.commonSchemas.uuid })), organizationController.getOrganizationStats);
exports.default = router;
//# sourceMappingURL=organization.routes.js.map