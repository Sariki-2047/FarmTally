"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const lorry_request_controller_1 = require("../controllers/lorry-request.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const validation_1 = require("../utils/validation");
const auth_middleware_1 = require("../middleware/auth.middleware");
const joi_1 = __importDefault(require("joi"));
const router = express_1.default.Router();
const lorryRequestController = new lorry_request_controller_1.LorryRequestController();
router.use(auth_middleware_1.authMiddleware);
router.post('/organizations/:organizationId/lorry-requests', (0, auth_middleware_1.requireRole)(['FIELD_MANAGER']), (0, validation_middleware_1.validateParams)(joi_1.default.object({ organizationId: validation_1.commonSchemas.uuid })), (0, validation_middleware_1.validate)(validation_1.lorryRequestSchemas.create), lorryRequestController.createLorryRequest);
router.get('/organizations/:organizationId/lorry-requests', (0, validation_middleware_1.validateParams)(joi_1.default.object({ organizationId: validation_1.commonSchemas.uuid })), (0, validation_middleware_1.validateQuery)(joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(20),
    sortBy: joi_1.default.string(),
    sortOrder: joi_1.default.string().valid('asc', 'desc').default('desc'),
    status: joi_1.default.string().valid('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'),
    priority: joi_1.default.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
    managerId: joi_1.default.string().uuid().optional(),
    startDate: joi_1.default.date().iso(),
    endDate: joi_1.default.date().iso(),
})), lorryRequestController.getLorryRequests);
router.get('/organizations/:organizationId/lorry-requests/stats', (0, validation_middleware_1.validateParams)(joi_1.default.object({ organizationId: validation_1.commonSchemas.uuid })), lorryRequestController.getLorryRequestStats);
router.get('/lorry-requests/:requestId', (0, validation_middleware_1.validateParams)(joi_1.default.object({ requestId: validation_1.commonSchemas.uuid })), lorryRequestController.getLorryRequestById);
router.put('/lorry-requests/:requestId', (0, auth_middleware_1.requireRole)(['FIELD_MANAGER']), (0, validation_middleware_1.validateParams)(joi_1.default.object({ requestId: validation_1.commonSchemas.uuid })), (0, validation_middleware_1.validate)(validation_1.lorryRequestSchemas.update), lorryRequestController.updateLorryRequest);
router.post('/lorry-requests/:requestId/approve', (0, auth_middleware_1.requireRole)(['FARM_ADMIN']), (0, validation_middleware_1.validateParams)(joi_1.default.object({ requestId: validation_1.commonSchemas.uuid })), (0, validation_middleware_1.validate)(validation_1.lorryRequestSchemas.approve), lorryRequestController.approveLorryRequest);
router.post('/lorry-requests/:requestId/reject', (0, auth_middleware_1.requireRole)(['FARM_ADMIN']), (0, validation_middleware_1.validateParams)(joi_1.default.object({ requestId: validation_1.commonSchemas.uuid })), (0, validation_middleware_1.validate)(validation_1.lorryRequestSchemas.reject), lorryRequestController.rejectLorryRequest);
router.post('/lorry-requests/:requestId/cancel', (0, auth_middleware_1.requireRole)(['FIELD_MANAGER']), (0, validation_middleware_1.validateParams)(joi_1.default.object({ requestId: validation_1.commonSchemas.uuid })), lorryRequestController.cancelLorryRequest);
exports.default = router;
//# sourceMappingURL=lorry-request.routes.js.map