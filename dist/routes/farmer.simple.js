"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const farmer_service_simple_1 = require("../services/farmer.service.simple");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.post('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { firstName, lastName, phone, address, bankAccount, idNumber } = req.body;
    if (!firstName || !lastName || !phone) {
        return res.status(400).json({
            success: false,
            error: 'First name, last name, and phone are required'
        });
    }
    try {
        const farmer = await farmer_service_simple_1.farmerService.createFarmer({
            firstName,
            lastName,
            phone,
            address,
            bankAccount,
            idNumber
        }, req.user.organizationId);
        res.status(201).json({
            success: true,
            data: farmer
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}));
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    try {
        const result = await farmer_service_simple_1.farmerService.getFarmers(req.user.organizationId, page, limit);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
router.get('/search', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({
            success: false,
            error: 'Search query is required'
        });
    }
    try {
        const farmers = await farmer_service_simple_1.farmerService.searchFarmers(query, req.user.organizationId);
        res.json({
            success: true,
            data: farmers
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const farmer = await farmer_service_simple_1.farmerService.getFarmerById(req.params.id, req.user.organizationId);
        res.json({
            success: true,
            data: farmer
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
}));
router.put('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { firstName, lastName, phone, address, bankAccount, idNumber } = req.body;
    try {
        const farmer = await farmer_service_simple_1.farmerService.updateFarmer(req.params.id, {
            firstName,
            lastName,
            phone,
            address,
            bankAccount,
            idNumber
        }, req.user.organizationId);
        res.json({
            success: true,
            data: farmer
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}));
router.delete('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        await farmer_service_simple_1.farmerService.deleteFarmer(req.params.id, req.user.organizationId);
        res.json({
            success: true,
            message: 'Farmer deleted successfully'
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
//# sourceMappingURL=farmer.simple.js.map