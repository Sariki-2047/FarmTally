"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LorryRequestService = void 0;
const database_1 = require("../config/database");
const error_middleware_1 = require("../middleware/error.middleware");
const emailService_1 = __importDefault(require("./emailService"));
class LorryRequestService {
    emailService;
    constructor() {
        this.emailService = new emailService_1.default();
    }
    async createLorryRequest(organizationId, managerId, data) {
        const manager = await database_1.prisma.user.findUnique({
            where: { id: managerId },
            select: { role: true, organizationId: true, status: true },
        });
        if (!manager || manager.organizationId !== organizationId || manager.role !== 'FIELD_MANAGER') {
            throw new error_middleware_1.ForbiddenError('Only field managers can create lorry requests');
        }
        if (manager.status !== 'APPROVED') {
            throw new error_middleware_1.BadRequestError('Unapproved users cannot create requests');
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const requiredDate = new Date(data.requiredDate);
        requiredDate.setHours(0, 0, 0, 0);
        if (requiredDate < today) {
            throw new error_middleware_1.BadRequestError('Required date cannot be in the past');
        }
        const existingRequest = await database_1.prisma.lorryRequest.findFirst({
            where: {
                organizationId,
                managerId,
                requiredDate: {
                    gte: new Date(requiredDate),
                    lt: new Date(requiredDate.getTime() + 24 * 60 * 60 * 1000),
                },
                status: {
                    in: ['PENDING', 'APPROVED'],
                },
            },
        });
        if (existingRequest) {
            throw new error_middleware_1.BadRequestError('You already have a pending or approved request for this date');
        }
        const lorryRequest = await database_1.prisma.lorryRequest.create({
            data: {
                organizationId,
                managerId,
                requiredDate: data.requiredDate,
                priority: data.priority || 'MEDIUM',
                purpose: data.purpose,
                estimatedDuration: data.estimatedDuration,
                location: data.location,
                expectedVolume: data.expectedVolume,
                status: 'PENDING',
            },
            include: {
                manager: {
                    select: {
                        id: true,
                        email: true,
                        phone: true,
                        profile: true,
                    },
                },
                organization: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
        });
        if (process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true') {
            try {
                const farmAdmin = await database_1.prisma.user.findFirst({
                    where: {
                        organizationId,
                        role: 'FARM_ADMIN',
                        status: 'ACTIVE',
                    },
                    select: { email: true },
                });
                if (farmAdmin?.email) {
                    await this.emailService.sendLorryRequestNotification(farmAdmin.email, lorryRequest.manager.profile?.firstName || 'Field Manager', {
                        id: lorryRequest.id,
                        requiredDate: lorryRequest.requiredDate.toLocaleDateString(),
                        purpose: lorryRequest.purpose,
                        priority: lorryRequest.priority,
                        location: lorryRequest.location,
                    });
                }
            }
            catch (error) {
                console.error('Failed to send lorry request notification email:', error);
            }
        }
        return lorryRequest;
    }
    async getLorryRequests(organizationId, userId, filters = {}, page = 1, limit = 20) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, organizationId: true },
        });
        if (!user || user.organizationId !== organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this organization');
        }
        const where = { organizationId };
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.priority) {
            where.priority = filters.priority;
        }
        if (filters.managerId) {
            where.managerId = filters.managerId;
        }
        if (filters.startDate || filters.endDate) {
            where.requiredDate = {};
            if (filters.startDate) {
                where.requiredDate.gte = filters.startDate;
            }
            if (filters.endDate) {
                where.requiredDate.lte = filters.endDate;
            }
        }
        if (user.role === 'FIELD_MANAGER') {
            where.managerId = userId;
        }
        const [requests, total] = await Promise.all([
            database_1.prisma.lorryRequest.findMany({
                where,
                include: {
                    manager: {
                        select: {
                            id: true,
                            email: true,
                            phone: true,
                            profile: true,
                        },
                    },
                    assignedLorry: {
                        select: {
                            id: true,
                            name: true,
                            licensePlate: true,
                            capacity: true,
                            status: true,
                        },
                    },
                    approver: {
                        select: {
                            id: true,
                            email: true,
                            profile: true,
                        },
                    },
                },
                orderBy: [
                    { priority: 'desc' },
                    { requiredDate: 'asc' },
                    { createdAt: 'desc' },
                ],
                skip: (page - 1) * limit,
                take: limit,
            }),
            database_1.prisma.lorryRequest.count({ where }),
        ]);
        return {
            requests,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getLorryRequestById(requestId, userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, organizationId: true },
        });
        if (!user) {
            throw new error_middleware_1.NotFoundError('User not found');
        }
        const request = await database_1.prisma.lorryRequest.findUnique({
            where: { id: requestId },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                manager: {
                    select: {
                        id: true,
                        email: true,
                        phone: true,
                        profile: true,
                    },
                },
                assignedLorry: {
                    select: {
                        id: true,
                        name: true,
                        licensePlate: true,
                        capacity: true,
                        status: true,
                        location: true,
                    },
                },
                approver: {
                    select: {
                        id: true,
                        email: true,
                        profile: true,
                    },
                },
            },
        });
        if (!request) {
            throw new error_middleware_1.NotFoundError('Lorry request not found');
        }
        if (user.organizationId !== request.organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this request');
        }
        if (user.role === 'FIELD_MANAGER' && request.managerId !== userId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this request');
        }
        return request;
    }
    async updateLorryRequest(requestId, userId, data) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, organizationId: true },
        });
        if (!user) {
            throw new error_middleware_1.NotFoundError('User not found');
        }
        const request = await database_1.prisma.lorryRequest.findUnique({
            where: { id: requestId },
            select: {
                organizationId: true,
                managerId: true,
                status: true,
                requiredDate: true,
            },
        });
        if (!request) {
            throw new error_middleware_1.NotFoundError('Lorry request not found');
        }
        if (user.organizationId !== request.organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this request');
        }
        if (request.managerId !== userId) {
            throw new error_middleware_1.ForbiddenError('Only the requesting manager can update this request');
        }
        if (request.status !== 'PENDING') {
            throw new error_middleware_1.BadRequestError('Can only update pending requests');
        }
        if (data.requiredDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const requiredDate = new Date(data.requiredDate);
            requiredDate.setHours(0, 0, 0, 0);
            if (requiredDate < today) {
                throw new error_middleware_1.BadRequestError('Required date cannot be in the past');
            }
            const existingRequest = await database_1.prisma.lorryRequest.findFirst({
                where: {
                    organizationId: request.organizationId,
                    managerId: request.managerId,
                    requiredDate: {
                        gte: new Date(requiredDate),
                        lt: new Date(requiredDate.getTime() + 24 * 60 * 60 * 1000),
                    },
                    status: {
                        in: ['PENDING', 'APPROVED'],
                    },
                    id: { not: requestId },
                },
            });
            if (existingRequest) {
                throw new error_middleware_1.BadRequestError('You already have a pending or approved request for this date');
            }
        }
        const updatedRequest = await database_1.prisma.lorryRequest.update({
            where: { id: requestId },
            data,
            include: {
                manager: {
                    select: {
                        id: true,
                        email: true,
                        phone: true,
                        profile: true,
                    },
                },
                assignedLorry: {
                    select: {
                        id: true,
                        name: true,
                        licensePlate: true,
                        capacity: true,
                        status: true,
                    },
                },
            },
        });
        return updatedRequest;
    }
    async approveLorryRequest(requestId, approverId, data) {
        const approver = await database_1.prisma.user.findUnique({
            where: { id: approverId },
            select: { role: true, organizationId: true },
        });
        if (!approver || approver.role !== 'FARM_ADMIN') {
            throw new error_middleware_1.ForbiddenError('Only farm admins can approve lorry requests');
        }
        const request = await database_1.prisma.lorryRequest.findUnique({
            where: { id: requestId },
            select: {
                organizationId: true,
                status: true,
                managerId: true,
                requiredDate: true,
            },
        });
        if (!request) {
            throw new error_middleware_1.NotFoundError('Lorry request not found');
        }
        if (approver.organizationId !== request.organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this request');
        }
        if (request.status !== 'PENDING') {
            throw new error_middleware_1.BadRequestError('Can only approve pending requests');
        }
        const lorry = await database_1.prisma.lorry.findUnique({
            where: { id: data.assignedLorryId },
            select: {
                organizationId: true,
                status: true,
                assignedManagerId: true,
            },
        });
        if (!lorry) {
            throw new error_middleware_1.NotFoundError('Lorry not found');
        }
        if (lorry.organizationId !== request.organizationId) {
            throw new error_middleware_1.BadRequestError('Lorry does not belong to this organization');
        }
        if (lorry.status !== 'AVAILABLE') {
            throw new error_middleware_1.BadRequestError('Lorry is not available for assignment');
        }
        const conflictingRequest = await database_1.prisma.lorryRequest.findFirst({
            where: {
                assignedLorryId: data.assignedLorryId,
                requiredDate: {
                    gte: new Date(request.requiredDate),
                    lt: new Date(new Date(request.requiredDate).getTime() + 24 * 60 * 60 * 1000),
                },
                status: 'APPROVED',
                id: { not: requestId },
            },
        });
        if (conflictingRequest) {
            throw new error_middleware_1.BadRequestError('Lorry is already assigned to another request on this date');
        }
        const result = await database_1.prisma.$transaction(async (tx) => {
            const updatedRequest = await tx.lorryRequest.update({
                where: { id: requestId },
                data: {
                    status: 'APPROVED',
                    assignedLorryId: data.assignedLorryId,
                    approvedBy: approverId,
                    approvedAt: new Date(),
                },
                include: {
                    manager: {
                        select: {
                            id: true,
                            email: true,
                            phone: true,
                            profile: true,
                        },
                    },
                    assignedLorry: {
                        select: {
                            id: true,
                            name: true,
                            licensePlate: true,
                            capacity: true,
                            status: true,
                        },
                    },
                    approver: {
                        select: {
                            id: true,
                            email: true,
                            profile: true,
                        },
                    },
                },
            });
            await tx.lorry.update({
                where: { id: data.assignedLorryId },
                data: {
                    assignedManagerId: request.managerId,
                    status: 'ASSIGNED',
                    assignedAt: new Date(),
                },
            });
            return updatedRequest;
        });
        if (process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true') {
            try {
                await this.emailService.sendLorryApprovalNotification(result.manager.email, {
                    requestId: result.id,
                    lorryName: result.assignedLorry?.name || 'Unknown',
                    licensePlate: result.assignedLorry?.licensePlate || 'Unknown',
                    approvedBy: result.approver?.profile?.firstName || 'Farm Admin',
                });
            }
            catch (error) {
                console.error('Failed to send lorry approval notification email:', error);
            }
        }
        return result;
    }
    async rejectLorryRequest(requestId, approverId, data) {
        const approver = await database_1.prisma.user.findUnique({
            where: { id: approverId },
            select: { role: true, organizationId: true },
        });
        if (!approver || approver.role !== 'FARM_ADMIN') {
            throw new error_middleware_1.ForbiddenError('Only farm admins can reject lorry requests');
        }
        const request = await database_1.prisma.lorryRequest.findUnique({
            where: { id: requestId },
            select: { organizationId: true, status: true },
        });
        if (!request) {
            throw new error_middleware_1.NotFoundError('Lorry request not found');
        }
        if (approver.organizationId !== request.organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this request');
        }
        if (request.status !== 'PENDING') {
            throw new error_middleware_1.BadRequestError('Can only reject pending requests');
        }
        const updatedRequest = await database_1.prisma.lorryRequest.update({
            where: { id: requestId },
            data: {
                status: 'REJECTED',
                rejectionReason: data.rejectionReason,
                approvedBy: approverId,
                approvedAt: new Date(),
            },
            include: {
                manager: {
                    select: {
                        id: true,
                        email: true,
                        phone: true,
                        profile: true,
                    },
                },
                approver: {
                    select: {
                        id: true,
                        email: true,
                        profile: true,
                    },
                },
            },
        });
        return updatedRequest;
    }
    async cancelLorryRequest(requestId, userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, organizationId: true },
        });
        if (!user) {
            throw new error_middleware_1.NotFoundError('User not found');
        }
        const request = await database_1.prisma.lorryRequest.findUnique({
            where: { id: requestId },
            select: {
                organizationId: true,
                managerId: true,
                status: true,
                assignedLorryId: true,
            },
        });
        if (!request) {
            throw new error_middleware_1.NotFoundError('Lorry request not found');
        }
        if (user.organizationId !== request.organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this request');
        }
        if (request.managerId !== userId) {
            throw new error_middleware_1.ForbiddenError('Only the requesting manager can cancel this request');
        }
        if (!['PENDING', 'APPROVED'].includes(request.status)) {
            throw new error_middleware_1.BadRequestError('Can only cancel pending or approved requests');
        }
        const result = await database_1.prisma.$transaction(async (tx) => {
            const updatedRequest = await tx.lorryRequest.update({
                where: { id: requestId },
                data: { status: 'CANCELLED' },
                include: {
                    manager: {
                        select: {
                            id: true,
                            email: true,
                            phone: true,
                            profile: true,
                        },
                    },
                    assignedLorry: {
                        select: {
                            id: true,
                            name: true,
                            licensePlate: true,
                            capacity: true,
                            status: true,
                        },
                    },
                },
            });
            if (request.assignedLorryId) {
                await tx.lorry.update({
                    where: { id: request.assignedLorryId },
                    data: {
                        assignedManagerId: null,
                        status: 'AVAILABLE',
                        assignedAt: null,
                    },
                });
            }
            return updatedRequest;
        });
        return result;
    }
    async getLorryRequestStats(organizationId, userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, organizationId: true },
        });
        if (!user || user.organizationId !== organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this organization');
        }
        const where = { organizationId };
        if (user.role === 'FIELD_MANAGER') {
            where.managerId = userId;
        }
        const [totalRequests, pendingRequests, approvedRequests, rejectedRequests, cancelledRequests, completedRequests, urgentRequests,] = await Promise.all([
            database_1.prisma.lorryRequest.count({ where }),
            database_1.prisma.lorryRequest.count({ where: { ...where, status: 'PENDING' } }),
            database_1.prisma.lorryRequest.count({ where: { ...where, status: 'APPROVED' } }),
            database_1.prisma.lorryRequest.count({ where: { ...where, status: 'REJECTED' } }),
            database_1.prisma.lorryRequest.count({ where: { ...where, status: 'CANCELLED' } }),
            database_1.prisma.lorryRequest.count({ where: { ...where, status: 'COMPLETED' } }),
            database_1.prisma.lorryRequest.count({ where: { ...where, priority: 'URGENT' } }),
        ]);
        const approvalRate = totalRequests > 0 ? ((approvedRequests + completedRequests) / totalRequests * 100).toFixed(1) : 0;
        return {
            totalRequests,
            pendingRequests,
            approvedRequests,
            rejectedRequests,
            cancelledRequests,
            completedRequests,
            urgentRequests,
            approvalRate,
        };
    }
}
exports.LorryRequestService = LorryRequestService;
//# sourceMappingURL=lorry-request.service.js.map