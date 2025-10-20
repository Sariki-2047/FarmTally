"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const delivery_controller_1 = require("../controllers/delivery.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const validation_1 = require("../utils/validation");
const auth_middleware_1 = require("../middleware/auth.middleware");
const joi_1 = __importDefault(require("joi"));
const router = express_1.default.Router();
const deliveryController = new delivery_controller_1.DeliveryController();
router.use(auth_middleware_1.authMiddleware);
router.post('/lorries/:lorryId/farmers/:farmerId/delivery', (0, auth_middleware_1.requireRole)(['FIELD_MANAGER']), (0, validation_middleware_1.validateParams)(joi_1.default.object({
    lorryId: validation_1.commonSchemas.uuid,
    farmerId: validation_1.commonSchemas.uuid,
})), (0, validation_middleware_1.validate)(validation_1.deliverySchemas.create), deliveryController.addFarmerToLorry);
router.get('/lorries/:lorryId/deliveries', (0, validation_middleware_1.validateParams)(joi_1.default.object({ lorryId: validation_1.commonSchemas.uuid })), deliveryController.getLorryDeliveries);
router.put('/deliveries/:deliveryId', (0, auth_middleware_1.requireRole)(['FIELD_MANAGER']), (0, validation_middleware_1.validateParams)(joi_1.default.object({ deliveryId: validation_1.commonSchemas.uuid })), (0, validation_middleware_1.validate)(validation_1.deliverySchemas.update), deliveryController.updateDelivery);
router.post('/lorries/:lorryId/submit', (0, auth_middleware_1.requireRole)(['FIELD_MANAGER']), (0, validation_middleware_1.validateParams)(joi_1.default.object({ lorryId: validation_1.commonSchemas.uuid })), deliveryController.submitLorryToAdmin);
router.post('/organizations/:organizationId/advance-payments', (0, auth_middleware_1.requireRole)(['FARM_ADMIN', 'FIELD_MANAGER']), (0, validation_middleware_1.validateParams)(joi_1.default.object({ organizationId: validation_1.commonSchemas.uuid })), (0, validation_middleware_1.validate)(joi_1.default.object({
    farmerId: validation_1.commonSchemas.uuid.required(),
    amount: joi_1.default.number().positive().precision(2).required(),
    paymentMethod: joi_1.default.string().valid('CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CHECK').required(),
    paymentDate: joi_1.default.date().iso().required(),
    referenceNumber: joi_1.default.string().max(100),
    reason: joi_1.default.string().max(1000),
    notes: joi_1.default.string().max(1000),
    receiptPhoto: joi_1.default.string().uri(),
})), deliveryController.createAdvancePayment);
router.post('/deliveries/:deliveryId/quality-deduction', (0, auth_middleware_1.requireRole)(['FARM_ADMIN']), (0, validation_middleware_1.validateParams)(joi_1.default.object({ deliveryId: validation_1.commonSchemas.uuid })), (0, validation_middleware_1.validate)(joi_1.default.object({
    qualityDeductionKgs: joi_1.default.number().min(0).precision(2).required(),
    qualityDeductionReason: joi_1.default.string().max(1000),
})), deliveryController.setQualityDeduction);
router.post('/organizations/:organizationId/pricing', (0, auth_middleware_1.requireRole)(['FARM_ADMIN']), (0, validation_middleware_1.validateParams)(joi_1.default.object({ organizationId: validation_1.commonSchemas.uuid })), (0, validation_middleware_1.validate)(joi_1.default.object({
    pricePerKg: joi_1.default.number().positive().precision(2).required(),
    pricingType: joi_1.default.string().valid('UNIVERSAL', 'LORRY', 'FARMER').required(),
    lorryId: joi_1.default.string().uuid().when('pricingType', {
        is: 'LORRY',
        then: joi_1.default.required(),
        otherwise: joi_1.default.optional(),
    }),
    farmerId: joi_1.default.string().uuid().when('pricingType', {
        is: 'FARMER',
        then: joi_1.default.required(),
        otherwise: joi_1.default.optional(),
    }),
})), deliveryController.setPricing);
router.post('/lorries/:lorryId/process', (0, auth_middleware_1.requireRole)(['FARM_ADMIN']), (0, validation_middleware_1.validateParams)(joi_1.default.object({ lorryId: validation_1.commonSchemas.uuid })), deliveryController.processDeliveries);
router.get('/organizations/:organizationId/deliveries', (0, validation_middleware_1.validateParams)(joi_1.default.object({ organizationId: validation_1.commonSchemas.uuid })), (0, validation_middleware_1.validateQuery)(joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(20),
    status: joi_1.default.string().valid('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
    lorryId: joi_1.default.string().uuid().optional(),
    farmerId: joi_1.default.string().uuid().optional(),
    startDate: joi_1.default.date().iso(),
    endDate: joi_1.default.date().iso(),
})), deliveryController.getDeliveries);
router.get('/organizations/:organizationId/deliveries/stats', (0, validation_middleware_1.validateParams)(joi_1.default.object({ organizationId: validation_1.commonSchemas.uuid })), deliveryController.getDeliveryStats);
exports.default = router;
//# sourceMappingURL=delivery.routes.js.map