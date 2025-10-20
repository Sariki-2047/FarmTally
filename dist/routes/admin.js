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
router.use((0, auth_1.requireRole)(['FARM_ADMIN']));
router.get('/dashboard', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const organizationId = req.user.organizationId;
    const [totalLorries, activeLorries, totalFarmers, activeFarmers, totalDeliveries, pendingDeliveries, totalRevenue] = await Promise.all([
        prisma_1.prisma.lorry.count({ where: { organizationId } }),
        prisma_1.prisma.lorry.count({ where: { organizationId, status: { not: 'AVAILABLE' } } }),
        prisma_1.prisma.farmer.count({ where: { organizationId } }),
        prisma_1.prisma.farmer.count({ where: { organizationId, isActive: true } }),
        prisma_1.prisma.delivery.count({ where: { organizationId } }),
        prisma_1.prisma.delivery.count({ where: { organizationId, status: 'PENDING' } }),
        prisma_1.prisma.delivery.aggregate({
            where: { organizationId, status: 'COMPLETED' },
            _sum: { netAmount: true }
        })
    ]);
    res.json({
        lorries: { total: totalLorries, active: activeLorries },
        farmers: { total: totalFarmers, active: activeFarmers },
        deliveries: { total: totalDeliveries, pending: pendingDeliveries },
        revenue: totalRevenue._sum.netAmount || 0
    });
}));
router.get('/lorries', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const organizationId = req.user.organizationId;
    const { status } = req.query;
    const where = { organizationId };
    if (status)
        where.status = status;
    const lorries = await prisma_1.prisma.lorry.findMany({
        where,
        include: {
            assignedTo: {
                select: { id: true, firstName: true, lastName: true, email: true }
            },
            deliveries: {
                where: { status: { not: 'COMPLETED' } },
                include: {
                    farmer: { select: { firstName: true, lastName: true } }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    res.json(lorries);
}));
router.post('/lorries', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const organizationId = req.user.organizationId;
    const { plateNumber, capacity } = req.body;
    if (!plateNumber || !capacity) {
        return res.status(400).json({ error: 'Plate number and capacity are required' });
    }
    const lorry = await prisma_1.prisma.lorry.create({
        data: {
            plateNumber,
            capacity: parseFloat(capacity),
            organizationId
        }
    });
    res.status(201).json(lorry);
}));
router.put('/lorries/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    const { plateNumber, capacity, status, assignedToId } = req.body;
    const lorry = await prisma_1.prisma.lorry.update({
        where: { id, organizationId },
        data: {
            ...(plateNumber && { plateNumber }),
            ...(capacity && { capacity: parseFloat(capacity) }),
            ...(status && { status }),
            ...(assignedToId !== undefined && { assignedToId })
        },
        include: {
            assignedTo: {
                select: { id: true, firstName: true, lastName: true, email: true }
            }
        }
    });
    res.json(lorry);
}));
router.delete('/lorries/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    await prisma_1.prisma.lorry.delete({
        where: { id, organizationId }
    });
    res.json({ message: 'Lorry deleted successfully' });
}));
router.get('/farmers', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const organizationId = req.user.organizationId;
    const farmers = await prisma_1.prisma.farmer.findMany({
        where: { organizationId },
        include: {
            deliveries: {
                select: {
                    id: true,
                    totalWeight: true,
                    netAmount: true,
                    status: true,
                    createdAt: true
                },
                orderBy: { createdAt: 'desc' },
                take: 5
            },
            payments: {
                select: {
                    id: true,
                    amount: true,
                    type: true,
                    status: true,
                    createdAt: true
                },
                orderBy: { createdAt: 'desc' },
                take: 5
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    res.json(farmers);
}));
router.post('/farmers', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const organizationId = req.user.organizationId;
    const { firstName, lastName, phone, address, bankAccount } = req.body;
    if (!firstName || !lastName || !phone) {
        return res.status(400).json({ error: 'First name, last name, and phone are required' });
    }
    const farmer = await prisma_1.prisma.farmer.create({
        data: {
            firstName,
            lastName,
            phone,
            address,
            bankAccount,
            organizationId
        }
    });
    res.status(201).json(farmer);
}));
router.put('/farmers/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    const { firstName, lastName, phone, address, bankAccount, isActive } = req.body;
    const farmer = await prisma_1.prisma.farmer.update({
        where: { id, organizationId },
        data: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(phone && { phone }),
            ...(address && { address }),
            ...(bankAccount && { bankAccount }),
            ...(isActive !== undefined && { isActive })
        }
    });
    res.json(farmer);
}));
router.get('/field-managers', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const organizationId = req.user.organizationId;
    const fieldManagers = await prisma_1.prisma.user.findMany({
        where: { organizationId, role: 'FIELD_MANAGER' },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            isActive: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' }
    });
    res.json(fieldManagers);
}));
router.get('/deliveries', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const organizationId = req.user.organizationId;
    const { status, farmerId, lorryId } = req.query;
    const where = { organizationId };
    if (status)
        where.status = status;
    if (farmerId)
        where.farmerId = farmerId;
    if (lorryId)
        where.lorryId = lorryId;
    const deliveries = await prisma_1.prisma.delivery.findMany({
        where,
        include: {
            farmer: { select: { firstName: true, lastName: true, phone: true } },
            lorry: { select: { plateNumber: true } },
            fieldManager: { select: { firstName: true, lastName: true } },
            bags: true
        },
        orderBy: { createdAt: 'desc' }
    });
    res.json(deliveries);
}));
router.put('/deliveries/:id/process', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    const { pricePerKg, qualityGrade, deductions } = req.body;
    const delivery = await prisma_1.prisma.delivery.findFirst({
        where: { id, organizationId },
        include: { bags: true }
    });
    if (!delivery) {
        return res.status(404).json({ error: 'Delivery not found' });
    }
    const totalWeight = delivery.bags.reduce((sum, bag) => sum + bag.weight, 0);
    const totalAmount = totalWeight * pricePerKg;
    const netAmount = totalAmount - (deductions || 0);
    const updatedDelivery = await prisma_1.prisma.delivery.update({
        where: { id },
        data: {
            pricePerKg,
            qualityGrade,
            deductions: deductions || 0,
            totalAmount,
            netAmount,
            status: 'COMPLETED',
            processedAt: new Date()
        },
        include: {
            farmer: true,
            lorry: true,
            fieldManager: true,
            bags: true
        }
    });
    res.json(updatedDelivery);
}));
router.get('/payments', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const organizationId = req.user.organizationId;
    const { farmerId, type, status } = req.query;
    const where = { organizationId };
    if (farmerId)
        where.farmerId = farmerId;
    if (type)
        where.type = type;
    if (status)
        where.status = status;
    const payments = await prisma_1.prisma.payment.findMany({
        where,
        include: {
            farmer: { select: { firstName: true, lastName: true } },
            delivery: { select: { id: true, totalWeight: true } },
            processedBy: { select: { firstName: true, lastName: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
    res.json(payments);
}));
router.post('/payments', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const organizationId = req.user.organizationId;
    const processedById = req.user.id;
    const { farmerId, deliveryId, amount, type, reference, notes } = req.body;
    if (!farmerId || !amount || !type) {
        return res.status(400).json({ error: 'Farmer ID, amount, and type are required' });
    }
    const payment = await prisma_1.prisma.payment.create({
        data: {
            farmerId,
            deliveryId,
            amount: parseFloat(amount),
            type,
            reference,
            notes,
            organizationId,
            processedById,
            status: 'COMPLETED',
            paidAt: new Date()
        },
        include: {
            farmer: { select: { firstName: true, lastName: true } },
            delivery: { select: { id: true, totalWeight: true } }
        }
    });
    res.status(201).json(payment);
}));
exports.default = router;
//# sourceMappingURL=admin.js.map