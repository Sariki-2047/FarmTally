import { Request, Response } from 'express';
import SystemAdminService from '../services/system-admin.service';
import { BadRequestError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth';

// Simple async handler
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: Function) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const systemAdminService = new SystemAdminService();

/**
 * Get system admin dashboard statistics
 */
export const getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stats = await systemAdminService.getDashboardStats();

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * Get all pending user registrations
 */
export const getPendingUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    role,
    status = 'PENDING',
    organizationId,
    startDate,
    endDate,
    page = 1,
    limit = 20,
  } = req.query;

  const filters: any = {};
  
  if (role) filters.role = role;
  if (status) filters.status = status;
  if (organizationId) filters.organizationId = organizationId as string;
  if (startDate) filters.startDate = new Date(startDate as string);
  if (endDate) filters.endDate = new Date(endDate as string);

  const result = await systemAdminService.getPendingUsers(
    filters,
    parseInt(page as string),
    parseInt(limit as string)
  );

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Approve a pending user registration
 */
export const approveUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const { approvalNotes } = req.body;

  if (!userId) {
    throw new BadRequestError('User ID is required');
  }

  const approvedUser = await systemAdminService.approveUser(req.user!.id, {
    userId,
    approvalNotes,
  });

  res.json({
    success: true,
    message: 'User approved successfully',
    data: approvedUser,
  });
});

/**
 * Reject a pending user registration
 */
export const rejectUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const { rejectionReason } = req.body;

  if (!userId) {
    throw new BadRequestError('User ID is required');
  }

  if (!rejectionReason) {
    throw new BadRequestError('Rejection reason is required');
  }

  const rejectedUser = await systemAdminService.rejectUser(req.user!.id, {
    userId,
    rejectionReason,
  });

  res.json({
    success: true,
    message: 'User rejected successfully',
    data: rejectedUser,
  });
});

/**
 * Get all organizations
 */
export const getAllOrganizations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20 } = req.query;

  const result = await systemAdminService.getAllOrganizations(
    parseInt(page as string),
    parseInt(limit as string)
  );

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Suspend or reactivate a user
 */
export const toggleUserStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const { suspend } = req.body;

  if (!userId) {
    throw new BadRequestError('User ID is required');
  }

  if (typeof suspend !== 'boolean') {
    throw new BadRequestError('Suspend flag must be a boolean');
  }

  const updatedUser = await systemAdminService.toggleUserStatus(
    req.user!.id,
    userId,
    suspend
  );

  res.json({
    success: true,
    message: suspend ? 'User suspended successfully' : 'User reactivated successfully',
    data: updatedUser,
  });
});

/**
 * Create the first system admin (for initial setup)
 */
export const createSystemAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { email, phone, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    throw new BadRequestError('Email, password, first name, and last name are required');
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

/**
 * Bulk approve multiple users
 */
export const bulkApproveUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userIds, approvalNotes } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    throw new BadRequestError('User IDs array is required');
  }

  const results = [];
  let successCount = 0;
  let failureCount = 0;

  for (const userId of userIds) {
    try {
      const approvedUser = await systemAdminService.approveUser(req.user!.id, {
        userId,
        approvalNotes,
      });
      results.push({ userId, status: 'approved', data: approvedUser });
      successCount++;
    } catch (error) {
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

/**
 * Get user details by ID
 */
export const getUserDetails = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    throw new BadRequestError('User ID is required');
  }

  // This would typically use a dedicated service method
  // For now, we'll use a simple Prisma query
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
    throw new BadRequestError('User not found');
  }

  // Remove sensitive data
  const { passwordHash, ...userResponse } = user;

  res.json({
    success: true,
    data: userResponse,
  });
});