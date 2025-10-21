"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserDetails = exports.bulkApproveUsers = exports.createSystemAdmin = exports.toggleUserStatus = exports.getAllOrganizations = exports.rejectUser = exports.approveUser = exports.getPendingUsers = exports.getDashboardStats = void 0;
const system_admin_service_1 = __importDefault(require("../services/system-admin.service"));
const error_middleware_1 = require("../middleware/error.middleware");
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
const systemAdminService = new system_admin_service_1.default();
exports.getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await systemAdminService.getDashboardStats();
    res.json({
        success: true,
        data: stats,
    });
});
exports.getPendingUsers = asyncHandler(async (req, res) => {
    const { role, status = 'PENDING', organizationId, startDate, endDate, page = 1, limit = 20, } = req.query;
    const filters = {};
    if (role)
        filters.role = role;
    if (status)
        filters.status = status;
    if (organizationId)
        filters.organizationId = organizationId;
    if (startDate)
        filters.startDate = new Date(startDate);
    if (endDate)
        filters.endDate = new Date(endDate);
    const result = await systemAdminService.getPendingUsers(filters, parseInt(page), parseInt(limit));
    res.json({
        success: true,
        data: result,
    });
});
exports.approveUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { approvalNotes } = req.body;
    if (!userId) {
        throw new error_middleware_1.BadRequestError('User ID is required');
    }
    const approvedUser = await systemAdminService.approveUser(req.user.id, {
        userId,
        approvalNotes,
    });
    res.json({
        success: true,
        message: 'User approved successfully',
        data: approvedUser,
    });
});
exports.rejectUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { rejectionReason } = req.body;
    if (!userId) {
        throw new error_middleware_1.BadRequestError('User ID is required');
    }
    if (!rejectionReason) {
        throw new error_middleware_1.BadRequestError('Rejection reason is required');
    }
    const rejectedUser = await systemAdminService.rejectUser(req.user.id, {
        userId,
        rejectionReason,
    });
    res.json({
        success: true,
        message: 'User rejected successfully',
        data: rejectedUser,
    });
});
exports.getAllOrganizations = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const result = await systemAdminService.getAllOrganizations(parseInt(page), parseInt(limit));
    res.json({
        success: true,
        data: result,
    });
});
exports.toggleUserStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { suspend } = req.body;
    if (!userId) {
        throw new error_middleware_1.BadRequestError('User ID is required');
    }
    if (typeof suspend !== 'boolean') {
        throw new error_middleware_1.BadRequestError('Suspend flag must be a boolean');
    }
    const updatedUser = await systemAdminService.toggleUserStatus(req.user.id, userId, suspend);
    res.json({
        success: true,
        message: suspend ? 'User suspended successfully' : 'User reactivated successfully',
        data: updatedUser,
    });
});
exports.createSystemAdmin = asyncHandler(async (req, res) => {
    const { email, phone, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
        throw new error_middleware_1.BadRequestError('Email, password, first name, and last name are required');
    }
    const admin = await systemAdminService.createSystemAdmin({
        email,
        phone,
        password,
        profile: {
            firstName,
            lastName,
        },
    });
    res.status(201).json({
        success: true,
        message: 'System admin created successfully',
        data: admin,
    });
});
exports.bulkApproveUsers = asyncHandler(async (req, res) => {
    const { userIds, approvalNotes } = req.body;
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        throw new error_middleware_1.BadRequestError('User IDs array is required');
    }
    const results = [];
    let successCount = 0;
    let failureCount = 0;
    for (const userId of userIds) {
        try {
            const approvedUser = await systemAdminService.approveUser(req.user.id, {
                userId,
                approvalNotes,
            });
            results.push({ userId, status: 'approved', data: approvedUser });
            successCount++;
        }
        catch (error) {
            results.push({ userId, status: 'failed', error: error.message });
            failureCount++;
        }
    }
    res.json({
        success: true,
        message: `Bulk approval completed: ${successCount} approved, ${failureCount} failed`,
        data: {
            results,
            summary: {
                total: userIds.length,
                approved: successCount,
                failed: failureCount,
            },
        },
    });
});
exports.getUserDetails = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        throw new error_middleware_1.BadRequestError('User ID is required');
    }
    const { prisma } = require('../config/database');
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    address: true,
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
    if (!user) {
        throw new error_middleware_1.BadRequestError('User not found');
    }
    const { passwordHash, ...userResponse } = user;
    res.json({
        success: true,
        data: userResponse,
    });
});
//# sourceMappingURL=system-admin.controller.js.map