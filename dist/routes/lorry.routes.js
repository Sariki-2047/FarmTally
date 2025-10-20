"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const lorry_controller_1 = require("../controllers/lorry.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const validation_1 = require("../utils/validation");
const auth_middleware_1 = require("../middleware/auth.middleware");
const joi_1 = __importDefault(require("joi"));
const router = express_1.default.Router();
const lorryController = new lorry_controller_1.LorryController();
router.use(auth_middleware_1.authMiddleware);
router.post('/organizations/:organizationId/lorries', (0, auth_middleware_1.requireRole)(['FARM_ADMIN']), (0, validation_middleware_1.validateParams)(joi_1.default.object({ organizationId: validation_1.commonSchemas.uuid })), (0, validation_middleware_1.validate)(validation_1.lorrySchemas.create), lorryController.createLorry);
router.get('/organizations/:organizationId/lorries', (0, validation_middleware_1.validateParams)(joi_1.default.object({ organizationId: validation_1.commonSchemas.uuid })), (0, validation_middleware_1.validateQuery)(joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(20),
    sortBy: joi_1.default.string(),
    sortOrder: joi_1.default.string().valid('asc', 'desc').default('desc'),
    status: joi_1.default.string().valid('AVAILABLE', 'ASSIGNED', 'IN_TRANSIT', 'MAINTENANCE'),
    assignedManagerId: joi_1.default.string().uuid().optional(),
    search: joi_1.default.string().min(1).max(100),
})), lorryController.getLorries);
router.get('/organizations/:organizationId/lorries/stats', (0, validation_middleware_1.validateParams)(joi_1.default.object({ organizationId: validation_1.commonSchemas.uuid })), lorryController.getLorryStats);
router.get('/lorries/:lorryId', (0, validation_middleware_1.validateParams)(joi_1.default.object({ lorryId: validation_1.commonSchemas.uuid })), lorryController.getLorryById);
router.put('/lorries/:lorryId', (0, validation_middleware_1.validateParams)(joi_1.default.object({ lorryId: validation_1.commonSchemas.uuid })), (0, validation_middleware_1.validate)(validation_1.lorrySchemas.update), lorryController.updateLorry);
router.delete('/lorries/:lorryId', (0, auth_middleware_1.requireRole)(['FARM_ADMIN']), (0, validation_middleware_1.validateParams)(joi_1.default.object({ lorryId: validation_1.commonSchemas.uuid })), lorryController.deleteLorry);
router.post('/lorries/:lorryId/assign', (0, auth_middleware_1.requireRole)(['FARM_ADMIN']), (0, validation_middleware_1.validateParams)(joi_1.default.object({ lorryId: validation_1.commonSchemas.uuid })), (0, validation_middleware_1.validate)(joi_1.default.object({
    managerId: validation_1.commonSchemas.uuid.required(),
})), lorryController.assignLorryToManager);
router.post('/lorries/:lorryId/unassign', (0, auth_middleware_1.requireRole)(['FARM_ADMIN']), (0, validation_middleware_1.validateParams)(joi_1.default.object({ lorryId: validation_1.commonSchemas.uuid })), lorryController.unassignLorry);
exports.default = router;
//# sourceMappingURL=lorry.routes.js.map