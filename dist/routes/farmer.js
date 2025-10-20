"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.use((0, auth_1.requireRole)(['FARMER', 'FARM_ADMIN', 'FIELD_MANAGER']));
router.get('/profile', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const organizationId = req.user.organizationId;
    const { farmerId } = req.query;
    let targetFarmerId = farmerId;
    if (req.user.role === 'FARMER') {
        const farmer = await prisma_1.prisma.farmer.findFirst({
            where: {
                organizationId,
            }
        });
        if (!farmer) {
            return res.status(404).json({ error: 'Farmer profile not found' });
        }
        targetFarmerId = farmer.id;
    }
    if (!targetFarmerId) {
        return res.status(400).json({ error: 'Farmer ID is required' });
    }
    const farmer = await prisma_1.prisma.farmer.findFirst({
        where: { id: targetFarmerId, organizationId },
        include: {
            deliveries: {
                include: {
                    lorry: { select: { plateNumber: true } },
                    fieldManager: { select: { firstName: true, lastName: true } },
                    bags: true
                },
                orderBy: { createdAt: 'desc' }
            },
            payments: {
                include: {
                    delivery: { select: { id: true, totalWeight: true } },
                    processedBy: { select: { firstName: true, lastName: true } }
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    });
    if (!farmer) {
        return res.status(404).json({ error: 'Farmer not found' });
    }
    res.json(farmer);
}));
router.get('/deliveries', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const organizationId = req.user.organizationId;
    const { farmerId, status } = req.query;
    if (!farmerId) {
        return res.status(400).json({ error: 'Farmer ID is required' });
    }
    const where = { organizationId, farmerId };
    if (status)
        where.status = status;
    const deliveries = await prisma_1.prisma.delivery.findMany({
        where,
        include: {
            lorry: { select: { plateNumber: true } },
            fieldManager: { select: { firstName: true, lastName: true } },
            bags: true
        },
        orderBy: { createdAt: 'desc' }
    });
    res.json(deliveries);
}));
router.get('/payments', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const organizationId = req.user.organizationId;
    const { farmerId, type } = req.query;
    if (!farmerId) {
        return res.status(400).json({ error: 'Farmer ID is required' });
    }
    const where = { organizationId, farmerId };
    if (type)
        where.type = type;
    const payments = await prisma_1.prisma.payment.findMany({
        where,
        include: {
            delivery: {
                select: {
                    id: true,
                    totalWeight: true,
                    lorry: { select: { plateNumber: true } }
                }
            },
            processedBy: { select: { firstName: true, lastName: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
    res.json(payments);
}));
router.get('/balance', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const organizationId = req.user.organizationId;
    const { farmerId } = req.query;
    if (!farmerId) {
        return res.status(400).json({ error: 'Farmer ID is required' });
    }
    const [totalEarnings, totalAdvances, totalDeductions, pendingDeliveries] = await Promise.all([
        prisma_1.prisma.delivery.aggregate({
            where: {
                organizationId,
                farmerId,
                status: 'COMPLETED',
                netAmount: { not: null }
            },
            _sum: { netAmount: true }
        }),
        prisma_1.prisma.payment.aggregate({
            where: {
                organizationId,
                farmerId,
                type: 'ADVANCE',
                status: 'COMPLETED'
            },
            _sum: { amount: true }
        }),
        prisma_1.prisma.payment.aggregate({
            where: {
                organizationId,
                farmerId,
                type: 'DEDUCTION',
                status: 'COMPLETED'
            },
            _sum: { amount: true }
        }),
        prisma_1.prisma.delivery.count({
            where: {
                organizationId,
                farmerId,
                status: { in: ['PENDING', 'IN_PROGRESS'] }
            }
        })
    ]);
    const earnings = totalEarnings._sum.netAmount || 0;
    const advances = totalAdvances._sum.amount || 0;
    const deductions = totalDeductions._sum.amount || 0;
    const balance = earnings - advances - deductions;
    res.json({
        totalEarnings: earnings,
        totalAdvances: advances,
        totalDeductions: deductions,
        currentBalance: balance,
        pendingDeliveries
    });
}));
router.get('/statistics', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const organizationId = req.user.organizationId;
    const { farmerId } = req.query;
    if (!farmerId) {
        return res.status(400).json({ error: 'Farmer ID is required' });
    }
    const [totalDeliveries, completedDeliveries, totalWeight, averageQuality, recentDeliveries] = await Promise.all([
        prisma_1.prisma.delivery.count({
            where: { organizationId, farmerId }
        }),
        prisma_1.prisma.delivery.count({
            where: { organizationId, farmerId, status: 'COMPLETED' }
        }),
        prisma_1.prisma.delivery.aggregate({
            where: { organizationId, farmerId, status: 'COMPLETED' },
            _sum: { totalWeight: true }
        }),
        prisma_1.prisma.delivery.groupBy({
            by: ['qualityGrade'],
            where: {
                organizationId,
                farmerId,
                status: 'COMPLETED',
                qualityGrade: { not: null }
            },
            _count: { qualityGrade: true }
        }),
        prisma_1.prisma.delivery.findMany({
            where: { organizationId, farmerId },
            include: {
                lorry: { select: { plateNumber: true } },
                bags: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        })
    ]);
    res.json({
        deliveries: {
            total: totalDeliveries,
            completed: completedDeliveries,
            pending: totalDeliveries - completedDeliveries
        },
        totalWeight: totalWeight._sum.totalWeight || 0,
        qualityDistribution: averageQuality,
        recentDeliveries
    });
}));
exports.default = router;
//# sourceMappingURL=farmer.js.map