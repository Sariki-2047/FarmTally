"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const delivery_service_simple_1 = require("../services/delivery.service.simple");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.post('/lorries/:lorryId/farmers/:farmerId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { lorryId, farmerId } = req.params;
    const { deliveryDate, bagsCount, individualWeights, moistureContent, qualityGrade, photos, notes } = req.body;
    if (!deliveryDate || !bagsCount || !individualWeights || moistureContent === undefined) {
        return res.status(400).json({
            success: false,
            error: 'Delivery date, bags count, individual weights, and moisture content are required'
        });
    }
    if (req.user.role !== 'FIELD_MANAGER') {
        return res.status(403).json({
            success: false,
            error: 'Only field managers can add farmers to lorries'
        });
    }
    try {
        const delivery = await delivery_service_simple_1.deliveryService.addFarmerToLorry(lorryId, farmerId, req.user.id, req.user.organizationId, {
            lorryId,
            farmerId,
            deliveryDate: new Date(deliveryDate),
            bagsCount: parseInt(bagsCount),
            individualWeights: individualWeights.map((w) => parseFloat(w)),
            moistureContent: parseFloat(moistureContent),
            qualityGrade,
            photos,
            notes
        });
        res.status(201).json({
            success: true,
            data: delivery,
            message: 'Farmer added to lorry successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}));
router.get('/lorries/:lorryId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { lorryId } = req.params;
    try {
        const deliveries = await delivery_service_simple_1.deliveryService.getLorryDeliveries(lorryId, req.user.organizationId);
        res.json({
            success: true,
            data: deliveries,
            count: deliveries.length
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
router.get('/:deliveryId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { deliveryId } = req.params;
    try {
        const delivery = await delivery_service_simple_1.deliveryService.getDeliveryById(deliveryId, req.user.organizationId);
        res.json({
            success: true,
            data: delivery
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
}));
router.put('/:deliveryId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { deliveryId } = req.params;
    const { bagsCount, individualWeights, moistureContent, qualityGrade, photos, notes } = req.body;
    if (req.user.role !== 'FIELD_MANAGER') {
        return res.status(403).json({
            success: false,
            error: 'Only field managers can update deliveries'
        });
    }
    try {
        const delivery = await delivery_service_simple_1.deliveryService.updateDelivery(deliveryId, {
            bagsCount: bagsCount ? parseInt(bagsCount) : undefined,
            individualWeights: individualWeights ? individualWeights.map((w) => parseFloat(w)) : undefined,
            moistureContent: moistureContent ? parseFloat(moistureContent) : undefined,
            qualityGrade,
            photos,
            notes
        }, req.user.id, req.user.organizationId);
        res.json({
            success: true,
            data: delivery,
            message: 'Delivery updated successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}));
router.patch('/:deliveryId/quality', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { deliveryId } = req.params;
    const { qualityDeduction, standardDeduction, qualityGrade } = req.body;
    if (qualityDeduction === undefined) {
        return res.status(400).json({
            success: false,
            error: 'Quality deduction is required'
        });
    }
    if (req.user.role !== 'FARM_ADMIN') {
        return res.status(403).json({
            success: false,
            error: 'Only farm admins can set quality deduction'
        });
    }
    try {
        const delivery = await delivery_service_simple_1.deliveryService.setQualityDeduction(deliveryId, {
            qualityDeduction: parseFloat(qualityDeduction),
            standardDeduction: standardDeduction ? parseFloat(standardDeduction) : undefined,
            qualityGrade: qualityGrade
        }, req.user.organizationId);
        res.json({
            success: true,
            data: delivery,
            message: 'Quality deduction set successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}));
router.patch('/:deliveryId/pricing', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { deliveryId } = req.params;
    const { pricePerKg } = req.body;
    if (!pricePerKg) {
        return res.status(400).json({
            success: false,
            error: 'Price per kg is required'
        });
    }
    if (req.user.role !== 'FARM_ADMIN') {
        return res.status(403).json({
            success: false,
            error: 'Only farm admins can set pricing'
        });
    }
    try {
        const delivery = await delivery_service_simple_1.deliveryService.setPricing(deliveryId, { pricePerKg: parseFloat(pricePerKg) }, req.user.organizationId);
        res.json({
            success: true,
            data: delivery,
            message: 'Pricing set successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}));
router.post('/lorries/:lorryId/submit', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { lorryId } = req.params;
    if (req.user.role !== 'FIELD_MANAGER') {
        return res.status(403).json({
            success: false,
            error: 'Only field managers can submit lorries'
        });
    }
    try {
        await delivery_service_simple_1.deliveryService.submitLorry(lorryId, req.user.id, req.user.organizationId);
        res.json({
            success: true,
            message: 'Lorry submitted for processing successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}));
router.post('/lorries/:lorryId/send-to-dealer', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { lorryId } = req.params;
    if (req.user.role !== 'FARM_ADMIN') {
        return res.status(403).json({
            success: false,
            error: 'Only farm admins can mark lorries as sent to dealer'
        });
    }
    try {
        await delivery_service_simple_1.deliveryService.markSentToDealer(lorryId, req.user.organizationId);
        res.json({
            success: true,
            message: 'Lorry marked as sent to dealer successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}));
router.delete('/:deliveryId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { deliveryId } = req.params;
    if (req.user.role !== 'FIELD_MANAGER') {
        return res.status(403).json({
            success: false,
            error: 'Only field managers can delete deliveries'
        });
    }
    try {
        await delivery_service_simple_1.deliveryService.deleteDelivery(deliveryId, req.user.id, req.user.organizationId);
        res.json({
            success: true,
            message: 'Delivery deleted successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}));
router.get('/lorries/:lorryId/summary', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { lorryId } = req.params;
    try {
        const deliveries = await delivery_service_simple_1.deliveryService.getLorryDeliveries(lorryId, req.user.organizationId);
        const summary = {
            totalDeliveries: deliveries.length,
            totalFarmers: deliveries.length,
            totalBags: deliveries.reduce((sum, d) => sum + d.bagsCount, 0),
            totalGrossWeight: deliveries.reduce((sum, d) => sum + d.grossWeight, 0),
            totalNetWeight: deliveries.reduce((sum, d) => sum + d.netWeight, 0),
            totalStandardDeduction: deliveries.reduce((sum, d) => sum + (d.standardDeduction || 0), 0),
            totalQualityDeduction: deliveries.reduce((sum, d) => sum + (d.qualityDeduction || 0), 0),
            totalValue: deliveries.reduce((sum, d) => sum + (d.totalValue || 0), 0),
            totalAdvanceAmount: deliveries.reduce((sum, d) => sum + (d.advanceAmount || 0), 0),
            totalFinalAmount: deliveries.reduce((sum, d) => sum + (d.finalAmount || 0), 0),
            averageMoisture: deliveries.length > 0
                ? deliveries.reduce((sum, d) => sum + (d.moistureContent || 0), 0) / deliveries.length
                : 0,
            qualityDistribution: deliveries.reduce((acc, d) => {
                const grade = d.qualityGrade || 'Unknown';
                acc[grade] = (acc[grade] || 0) + 1;
                return acc;
            }, {}),
            statusDistribution: deliveries.reduce((acc, d) => {
                acc[d.status] = (acc[d.status] || 0) + 1;
                return acc;
            }, {})
        };
        res.json({
            success: true,
            data: {
                summary,
                deliveries
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
exports.default = router;
//# sourceMappingURL=delivery.simple.js.map