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
router.use((0, auth_1.requireRole)(['FIELD_MANAGER', 'FARM_ADMIN']));
router.get('/lorries', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const organizationId = req.user.organizationId;
    const fieldManagerId = req.user.id;
    const lorries = await prisma_1.prisma.lorry.findMany({
        where: {
            organizationId,
            OR: [
                { assignedToId: fieldManagerId },
                { status: 'AVAILABLE' }
            ]
        },
        include: {
            deliveries: {
                where: { status: { not: 'COMPLETED' } },
                include: {
                    farmer: { select: { firstName: true, lastName: true, phone: true } },
                    bags: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    res.json(lorries);
}));
router.post('/lorries/:id/request', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    const fieldManagerId = req.user.id;
    const lorry = await prisma_1.prisma.lorry.findFirst({
        where: { id, organizationId, status: 'AVAILABLE' }
    });
    if (!lorry) {
        return res.status(404).json({ error: 'Lorry not available' });
    }
    const updatedLorry = await prisma_1.prisma.lorry.update({
        where: { id },
        data: {
            status: 'ASSIGNED',
            assignedToId: fieldManagerId
        }
    });
    res.json(updatedLorry);
}));
router.get('/farmers', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const organizationId = req.user.organizationId;
    const farmers = await prisma_1.prisma.farmer.findMany({
        where: { organizationId, isActive: true },
        include: {
            deliveries: {
                select: {
                    id: true,
                    totalWeight: true,
                    status: true,
                    createdAt: true
                },
                orderBy: { createdAt: 'desc' },
                take: 3
            }
        },
        orderBy: { firstName: 'asc' }
    });
    res.json(farmers);
}));
router.post('/deliveries', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const organizationId = req.user.organizationId;
    const fieldManagerId = req.user.id;
    const { lorryId, farmerId } = req.body;
    if (!lorryId || !farmerId) {
        return res.status(400).json({ error: 'Lorry ID and Farmer ID are required' });
    }
    const lorry = await prisma_1.prisma.lorry.findFirst({
        where: {
            id: lorryId,
            organizationId,
            assignedToId: fieldManagerId,
            status: { in: ['ASSIGNED', 'LOADING'] }
        }
    });
    if (!lorry) {
        return res.status(404).json({ error: 'Lorry not found or not assigned to you' });
    }
    const existingDelivery = await prisma_1.prisma.delivery.findFirst({
        where: {
            lorryId,
            farmerId,
            status: { in: ['PENDING', 'IN_PROGRESS'] }
        }
    });
    if (existingDelivery) {
        return res.status(400).json({ error: 'Farmer already has a pending delivery for this lorry' });
    }
    const delivery = await prisma_1.prisma.delivery.create({
        data: {
            lorryId,
            farmerId,
            fieldManagerId,
            organizationId,
            totalWeight: 0,
            status: 'PENDING'
        },
        include: {
            farmer: { select: { firstName: true, lastName: true, phone: true } },
            bags: true
        }
    });
    if (lorry.status === 'ASSIGNED') {
        await prisma_1.prisma.lorry.update({
            where: { id: lorryId },
            data: { status: 'LOADING' }
        });
    }
    res.status(201).json(delivery);
}));
router.get('/deliveries', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const organizationId = req.user.organizationId;
    const fieldManagerId = req.user.id;
    const { lorryId, status } = req.query;
    const where = { organizationId, fieldManagerId };
    if (lorryId)
        where.lorryId = lorryId;
    if (status)
        where.status = status;
    const deliveries = await prisma_1.prisma.delivery.findMany({
        where,
        include: {
            farmer: { select: { firstName: true, lastName: true, phone: true } },
            lorry: { select: { plateNumber: true } },
            bags: true
        },
        orderBy: { createdAt: 'desc' }
    });
    res.json(deliveries);
}));
router.post('/deliveries/:id/bags', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    const fieldManagerId = req.user.id;
    const { weight, bagNumber } = req.body;
    if (!weight || !bagNumber) {
        return res.status(400).json({ error: 'Weight and bag number are required' });
    }
    const delivery = await prisma_1.prisma.delivery.findFirst({
        where: {
            id,
            organizationId,
            fieldManagerId,
            status: { in: ['PENDING', 'IN_PROGRESS'] }
        },
        include: { bags: true }
    });
    if (!delivery) {
        return res.status(404).json({ error: 'Delivery not found or not editable' });
    }
    const existingBag = delivery.bags.find(bag => bag.bagNumber === parseInt(bagNumber));
    if (existingBag) {
        return res.status(400).json({ error: 'Bag number already exists for this delivery' });
    }
    const bag = await prisma_1.prisma.bag.create({
        data: {
            deliveryId: id,
            weight: parseFloat(weight),
            bagNumber: parseInt(bagNumber)
        }
    });
    const totalWeight = delivery.bags.reduce((sum, b) => sum + b.weight, 0) + parseFloat(weight);
    await prisma_1.prisma.delivery.update({
        where: { id },
        data: {
            totalWeight,
            status: 'IN_PROGRESS'
        }
    });
    res.status(201).json(bag);
}));
router.put('/deliveries/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    const fieldManagerId = req.user.id;
    const { moistureContent, status } = req.body;
    const delivery = await prisma_1.prisma.delivery.findFirst({
        where: {
            id,
            organizationId,
            fieldManagerId
        },
        include: { bags: true }
    });
    if (!delivery) {
        return res.status(404).json({ error: 'Delivery not found' });
    }
    const updateData = {};
    if (moistureContent !== undefined)
        updateData.moistureContent = parseFloat(moistureContent);
    if (status)
        updateData.status = status;
    if (status === 'COMPLETED')
        updateData.deliveredAt = new Date();
    const updatedDelivery = await prisma_1.prisma.delivery.update({
        where: { id },
        data: updateData,
        include: {
            farmer: { select: { firstName: true, lastName: true, phone: true } },
            lorry: { select: { plateNumber: true } },
            bags: true
        }
    });
    res.json(updatedDelivery);
}));
router.post('/lorries/:id/submit', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    const fieldManagerId = req.user.id;
    const lorry = await prisma_1.prisma.lorry.findFirst({
        where: {
            id,
            organizationId,
            assignedToId: fieldManagerId,
            status: 'LOADING'
        },
        include: {
            deliveries: {
                where: { status: { not: 'COMPLETED' } }
            }
        }
    });
    if (!lorry) {
        return res.status(404).json({ error: 'Lorry not found or not ready for submission' });
    }
    if (lorry.deliveries.length === 0) {
        return res.status(400).json({ error: 'No deliveries to submit' });
    }
    await prisma_1.prisma.delivery.updateMany({
        where: {
            lorryId: id,
            status: { in: ['PENDING', 'IN_PROGRESS'] }
        },
        data: {
            status: 'COMPLETED',
            deliveredAt: new Date()
        }
    });
    const updatedLorry = await prisma_1.prisma.lorry.update({
        where: { id },
        data: { status: 'SUBMITTED' }
    });
    res.json(updatedLorry);
}));
router.post('/payments/advance', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const organizationId = req.user.organizationId;
    const processedById = req.user.id;
    const { farmerId, amount, reference, notes } = req.body;
    if (!farmerId || !amount) {
        return res.status(400).json({ error: 'Farmer ID and amount are required' });
    }
    const payment = await prisma_1.prisma.payment.create({
        data: {
            farmerId,
            amount: parseFloat(amount),
            type: 'ADVANCE',
            reference,
            notes,
            organizationId,
            processedById,
            status: 'COMPLETED',
            paidAt: new Date()
        },
        include: {
            farmer: { select: { firstName: true, lastName: true } }
        }
    });
    res.status(201).json(payment);
}));
router.get('/reports', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const organizationId = req.user.organizationId;
    const fieldManagerId = req.user.id;
    const [totalDeliveries, completedDeliveries, totalWeight, totalPayments] = await Promise.all([
        prisma_1.prisma.delivery.count({
            where: { organizationId, fieldManagerId }
        }),
        prisma_1.prisma.delivery.count({
            where: { organizationId, fieldManagerId, status: 'COMPLETED' }
        }),
        prisma_1.prisma.delivery.aggregate({
            where: { organizationId, fieldManagerId, status: 'COMPLETED' },
            _sum: { totalWeight: true }
        }),
        prisma_1.prisma.payment.aggregate({
            where: { organizationId, processedById: fieldManagerId, type: 'ADVANCE' },
            _sum: { amount: true }
        })
    ]);
    res.json({
        deliveries: {
            total: totalDeliveries,
            completed: completedDeliveries,
            pending: totalDeliveries - completedDeliveries
        },
        totalWeight: totalWeight._sum.totalWeight || 0,
        totalAdvancePayments: totalPayments._sum.amount || 0
    });
}));
exports.default = router;
//# sourceMappingURL=fieldManager.js.map