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
const requireApplicationAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'APPLICATION_ADMIN') {
        return res.status(403).json({
            success: false,
            error: 'Application Admin privileges required'
        });
    }
    next();
};
router.get('/stats', auth_1.authenticateToken, requireApplicationAdmin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const [totalOrganizations, totalFarmAdmins, pendingApprovals, totalFieldManagers, totalFarmers, totalDeliveries, totalAdvancePayments] = await Promise.all([
            prisma.organization.count({ where: { isActive: true } }),
            prisma.user.count({ where: { role: 'FARM_ADMIN', status: 'APPROVED' } }),
            prisma.user.count({ where: { role: 'FARM_ADMIN', status: 'PENDING' } }),
            prisma.user.count({ where: { role: 'FIELD_MANAGER', status: 'APPROVED' } }),
            prisma.farmer.count(),
            prisma.delivery.count(),
            prisma.advancePayment.count()
        ]);
        res.json({
            success: true,
            data: {
                totalOrganizations,
                totalFarmAdmins,
                pendingApprovals,
                totalFieldManagers,
                totalFarmers,
                totalDeliveries,
                totalAdvancePayments
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
router.get('/pending-farm-admins', auth_1.authenticateToken, requireApplicationAdmin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const pendingUsers = await prisma.user.findMany({
            where: {
                role: 'FARM_ADMIN',
                status: 'PENDING'
            },
            include: {
                organization: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json({
            success: true,
            data: pendingUsers
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
router.post('/review-farm-admin', auth_1.authenticateToken, requireApplicationAdmin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { userId, approved, rejectionReason } = req.body;
        if (!userId || typeof approved !== 'boolean') {
            return res.status(400).json({
                success: false,
                error: 'userId and approved status are required'
            });
        }
        const updateData = {
            status: approved ? 'APPROVED' : 'REJECTED',
            approvedBy: approved ? req.user.id : undefined,
            approvedAt: approved ? new Date() : undefined,
            rejectedBy: !approved ? req.user.id : undefined,
            rejectedAt: !approved ? new Date() : undefined,
            rejectionReason: !approved ? rejectionReason : undefined
        };
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            include: {
                organization: true
            }
        });
        res.json({
            success: true,
            data: updatedUser,
            message: `Farm Admin ${approved ? 'approved' : 'rejected'} successfully`
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
router.get('/all-farm-admins', auth_1.authenticateToken, requireApplicationAdmin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const farmAdmins = await prisma.user.findMany({
            where: {
                role: 'FARM_ADMIN'
            },
            include: {
                organization: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json({
            success: true,
            data: farmAdmins
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Admin service is healthy',
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
//# sourceMappingURL=admin.simple.js.map