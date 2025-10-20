"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.post('/', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { requestedDate, estimatedGunnyBags, location, notes } = req.body;
    if (!requestedDate || !estimatedGunnyBags || !location) {
        return res.status(400).json({
            success: false,
            error: 'Requested date, estimated gunny bags, and location are required'
        });
    }
    if (req.user.role !== 'FIELD_MANAGER') {
        return res.status(403).json({
            success: false,
            error: 'Only field managers can create lorry requests'
        });
    }
    try {
        const estimatedWeight = parseInt(estimatedGunnyBags) * 50;
        const lorryRequest = await prisma.lorryRequest.create({
            data: {
                requestedDate: new Date(requestedDate),
                estimatedFarmers: 1,
                estimatedWeight: estimatedWeight,
                location,
                purpose: 'Corn collection',
                notes: notes || null,
                managerId: req.user.id,
                organizationId: req.user.organizationId,
                status: 'PENDING'
            },
            include: {
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                assignedLorry: {
                    select: {
                        id: true,
                        plateNumber: true,
                        capacity: true,
                        status: true
                    }
                }
            }
        });
        res.status(201).json({
            success: true,
            data: lorryRequest,
            message: 'Lorry request created successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
router.get('/', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        let whereClause = {};
        if (req.user.role === 'FIELD_MANAGER') {
            whereClause = {
                managerId: req.user.id
            };
        }
        else if (req.user.role === 'FARM_ADMIN') {
            whereClause = {
                organizationId: req.user.organizationId
            };
        }
        else {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }
        const lorryRequests = await prisma.lorryRequest.findMany({
            where: whereClause,
            include: {
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                assignedLorry: {
                    select: {
                        id: true,
                        plateNumber: true,
                        capacity: true,
                        status: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json({
            success: true,
            data: lorryRequests
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
router.patch('/:requestId/status', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { requestId } = req.params;
    const { status, lorryId } = req.body;
    if (!status) {
        return res.status(400).json({
            success: false,
            error: 'Status is required'
        });
    }
    if (req.user.role !== 'FARM_ADMIN') {
        return res.status(403).json({
            success: false,
            error: 'Only farm admins can update lorry request status'
        });
    }
    try {
        const existingRequest = await prisma.lorryRequest.findFirst({
            where: {
                id: requestId,
                organizationId: req.user.organizationId
            }
        });
        if (!existingRequest) {
            return res.status(404).json({
                success: false,
                error: 'Lorry request not found'
            });
        }
        if (status === 'APPROVED' && lorryId) {
            const lorry = await prisma.lorry.findFirst({
                where: {
                    id: lorryId,
                    organizationId: req.user.organizationId,
                    status: 'AVAILABLE'
                }
            });
            if (!lorry) {
                return res.status(400).json({
                    success: false,
                    error: 'Lorry not found or not available'
                });
            }
            await prisma.lorry.update({
                where: { id: lorryId },
                data: { status: 'ASSIGNED' }
            });
        }
        const updatedRequest = await prisma.lorryRequest.update({
            where: { id: requestId },
            data: {
                status: status,
                assignedLorryId: status === 'APPROVED' ? lorryId : null,
                approvedAt: status === 'APPROVED' ? new Date() : null,
                rejectedAt: status === 'REJECTED' ? new Date() : null
            },
            include: {
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                assignedLorry: {
                    select: {
                        id: true,
                        plateNumber: true,
                        capacity: true,
                        status: true
                    }
                }
            }
        });
        res.json({
            success: true,
            data: updatedRequest,
            message: `Lorry request ${status.toLowerCase()} successfully`
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
router.get('/:requestId', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { requestId } = req.params;
    try {
        let whereClause = { id: requestId };
        if (req.user.role === 'FIELD_MANAGER') {
            whereClause.managerId = req.user.id;
        }
        else if (req.user.role === 'FARM_ADMIN') {
            whereClause.organizationId = req.user.organizationId;
        }
        else {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }
        const lorryRequest = await prisma.lorryRequest.findFirst({
            where: whereClause,
            include: {
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                assignedLorry: {
                    select: {
                        id: true,
                        plateNumber: true,
                        capacity: true,
                        status: true
                    }
                }
            }
        });
        if (!lorryRequest) {
            return res.status(404).json({
                success: false,
                error: 'Lorry request not found'
            });
        }
        res.json({
            success: true,
            data: lorryRequest
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
//# sourceMappingURL=lorry-request.simple.js.map