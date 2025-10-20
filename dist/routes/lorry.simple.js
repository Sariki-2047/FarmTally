"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const lorry_service_simple_1 = require("../services/lorry.service.simple");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.use(auth_1.authenticateToken);
router.post('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { plateNumber, capacity, assignedManagerId } = req.body;
    if (!plateNumber || !capacity) {
        return res.status(400).json({
            success: false,
            error: 'Plate number and capacity are required'
        });
    }
    try {
        const lorry = await lorry_service_simple_1.lorryService.createLorry({
            plateNumber,
            capacity: parseFloat(capacity),
            assignedManagerId
        }, req.user.organizationId);
        res.status(201).json({
            success: true,
            data: lorry
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}));
router.get('/organization', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (req.user.role !== 'FARM_ADMIN') {
        return res.status(403).json({
            success: false,
            error: 'Only farm admins can view organization lorries'
        });
    }
    try {
        const lorries = await prisma.lorry.findMany({
            where: {
                organizationId: req.user.organizationId
            },
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json({
            success: true,
            data: lorries
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    try {
        const result = await lorry_service_simple_1.lorryService.getLorries(req.user.organizationId, page, limit);
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
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const lorry = await lorry_service_simple_1.lorryService.getLorryById(req.params.id, req.user.organizationId);
        res.json({
            success: true,
            data: lorry
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
    const { plateNumber, capacity, assignedManagerId } = req.body;
    try {
        const lorry = await lorry_service_simple_1.lorryService.updateLorry(req.params.id, {
            plateNumber,
            capacity: capacity ? parseFloat(capacity) : undefined,
            assignedManagerId
        }, req.user.organizationId);
        res.json({
            success: true,
            data: lorry
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}));
router.patch('/:id/status', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({
            success: false,
            error: 'Status is required'
        });
    }
    try {
        const lorry = await lorry_service_simple_1.lorryService.updateLorryStatus(req.params.id, status, req.user.organizationId);
        res.json({
            success: true,
            data: lorry
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
        await lorry_service_simple_1.lorryService.deleteLorry(req.params.id, req.user.organizationId);
        res.json({
            success: true,
            message: 'Lorry deleted successfully'
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
//# sourceMappingURL=lorry.simple.js.map