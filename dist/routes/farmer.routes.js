"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const farmer_controller_1 = require("../controllers/farmer.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const validation_1 = require("../utils/validation");
const auth_middleware_1 = require("../middleware/auth.middleware");
const joi_1 = __importDefault(require("joi"));
const router = express_1.default.Router();
const farmerController = new farmer_controller_1.FarmerController();
router.use(auth_middleware_1.authMiddleware);
router.post('/organizations/:organizationId/farmers', (0, auth_middleware_1.requireRole)(['FARM_ADMIN', 'FIELD_MANAGER']), (0, validation_middleware_1.validateParams)(joi_1.default.object({ organizationId: validation_1.commonSchemas.uuid })), (0, validation_middleware_1.validate)(validation_1.farmerSchemas.create), farmerController.createFarmer);
router.get('/organizations/:organizationId/farmers', (0, validation_middleware_1.validateParams)(joi_1.default.object({ organizationId: validation_1.commonSchemas.uuid })), (0, validation_middleware_1.validateQuery)(joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(20),
    search: joi_1.default.string().min(1).max(100),
    status: joi_1.default.string().valid('ACTIVE', 'INACTIVE'),
})), farmerController.getFarmers);
router.get('/organizations/:organizationId/farmers/stats', (0, validation_middleware_1.validateParams)(joi_1.default.object({ organizationId: validation_1.commonSchemas.uuid })), farmerController.getFarmerStats);
router.get('/organizations/:organizationId/farmers/search', (0, validation_middleware_1.validateParams)(joi_1.default.object({ organizationId: validation_1.commonSchemas.uuid })), (0, validation_middleware_1.validateQuery)(joi_1.default.object({
    search: joi_1.default.string().min(1).max(100),
    limit: joi_1.default.number().integer().min(1).max(50).default(10),
})), farmerController.searchFarmersForLorry);
router.get('/farmers/:farmerId', (0, validation_middleware_1.validateParams)(joi_1.default.object({ farmerId: validation_1.commonSchemas.uuid })), farmerController.getFarmerById);
router.put('/farmers/:farmerId', (0, auth_middleware_1.requireRole)(['FARM_ADMIN', 'FIELD_MANAGER']), (0, validation_middleware_1.validateParams)(joi_1.default.object({ farmerId: validation_1.commonSchemas.uuid })), (0, validation_middleware_1.validate)(validation_1.farmerSchemas.update), farmerController.updateFarmer);
router.delete('/farmers/:farmerId', (0, auth_middleware_1.requireRole)(['FARM_ADMIN']), (0, validation_middleware_1.validateParams)(joi_1.default.object({ farmerId: validation_1.commonSchemas.uuid })), farmerController.removeFarmerFromOrganization);
exports.default = router;
//# sourceMappingURL=farmer.routes.js.map