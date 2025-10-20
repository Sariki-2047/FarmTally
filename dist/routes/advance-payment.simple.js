"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const advance_payment_service_simple_1 = require("../services/advance-payment.service.simple");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.post('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { farmerId, amount, paymentDate, reference, notes } = req.body;
    if (!farmerId || !amount || !paymentDate) {
        return res.status(400).json({
            success: false,
            error: 'Farmer ID, amount, and payment date are required'
        });
    }
    if (req.user.role !== 'FARM_ADMIN') {
        return res.status(403).json({
            success: false,
            error: 'Only farm admins can create advance payments'
        });
    }
    try {
        const payment = await advance_payment_service_simple_1.advancePaymentService.createAdvancePayment({
            farmerId,
            amount: parseFloat(amount),
            paymentDate: new Date(paymentDate),
            reference,
            notes
        }, req.user.id, req.user.organizationId);
        res.status(201).json({
            success: true,
            data: payment,
            message: 'Advance payment created successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}));
router.get('/farmer/:farmerId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { farmerId } = req.params;
    try {
        const payments = await advance_payment_service_simple_1.advancePaymentService.getFarmerAdvancePayments(farmerId, req.user.organizationId);
        const totalBalance = await advance_payment_service_simple_1.advancePaymentService.getFarmerAdvanceBalance(farmerId, req.user.organizationId);
        res.json({
            success: true,
            data: {
                payments,
                totalBalance,
                count: payments.length
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
router.get('/farmer/:farmerId/balance', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { farmerId } = req.params;
    try {
        const balance = await advance_payment_service_simple_1.advancePaymentService.getFarmerAdvanceBalance(farmerId, req.user.organizationId);
        res.json({
            success: true,
            data: {
                farmerId,
                totalAdvanceBalance: balance
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
router.get('/summary', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const summary = await advance_payment_service_simple_1.advancePaymentService.getAdvancePaymentSummary(req.user.organizationId);
        res.json({
            success: true,
            data: summary
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
router.put('/:paymentId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { paymentId } = req.params;
    const { amount, paymentDate, reference, notes } = req.body;
    if (req.user.role !== 'FARM_ADMIN') {
        return res.status(403).json({
            success: false,
            error: 'Only farm admins can update advance payments'
        });
    }
    try {
        const payment = await advance_payment_service_simple_1.advancePaymentService.updateAdvancePayment(paymentId, {
            amount: amount ? parseFloat(amount) : undefined,
            paymentDate: paymentDate ? new Date(paymentDate) : undefined,
            reference,
            notes
        }, req.user.organizationId);
        res.json({
            success: true,
            data: payment,
            message: 'Advance payment updated successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}));
router.delete('/:paymentId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { paymentId } = req.params;
    if (req.user.role !== 'FARM_ADMIN') {
        return res.status(403).json({
            success: false,
            error: 'Only farm admins can delete advance payments'
        });
    }
    try {
        await advance_payment_service_simple_1.advancePaymentService.deleteAdvancePayment(paymentId, req.user.organizationId);
        res.json({
            success: true,
            message: 'Advance payment deleted successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}));
exports.default = router;
//# sourceMappingURL=advance-payment.simple.js.map