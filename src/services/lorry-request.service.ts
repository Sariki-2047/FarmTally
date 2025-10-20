import { prisma } from '../config/database';
import { NotFoundError, BadRequestError, ForbiddenError } from '../middleware/error.middleware';
import { LorryRequest, RequestStatus, RequestPriority } from '@prisma/client';
import EmailService from './emailService';

export interface CreateLorryRequestData {
  requiredDate: Date;
  priority?: RequestPriority;
  purpose: string;
  estimatedDuration?: number;
  location?: string;
  expectedVolume?: number;
}

export interface UpdateLorryRequestData {
  requiredDate?: Date;
  priority?: RequestPriority;
  purpose?: string;
  estimatedDuration?: number;
  location?: string;
  expectedVolume?: number;
}

export interface ApproveLorryRequestData {
  assignedLorryId: string;
}

export interface RejectLorryRequestData {
  rejectionReason: string;
}

export interface LorryRequestFilters {
  status?: RequestStatus;
  priority?: RequestPriority;
  managerId?: string;
  startDate?: Date;
  endDate?: Date;
}

export class LorryRequestService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async createLorryRequest(
    organizationId: string,
    managerId: string,
    data: CreateLorryRequestData
  ): Promise<any> {
    // Verify user is Field Manager of this organization
    const manager = await prisma.user.findUnique({
      where: { id: managerId },
      select: { role: true, organizationId: true, status: true },
    });

    if (!manager || manager.organizationId !== organizationId || manager.role !== 'FIELD_MANAGER') {
      throw new ForbiddenError('Only field managers can create lorry requests');
    }

    if (manager.status !== 'ACTIVE') {
      throw new BadRequestError('Inactive users cannot create requests');
    }

    // Validate required date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requiredDate = new Date(data.requiredDate);
    requiredDate.setHours(0, 0, 0, 0);

    if (requiredDate < today) {
      throw new BadRequestError('Required date cannot be in the past');
    }

    // Check for duplicate requests on the same date
    const existingRequest = await prisma.lorryRequest.findFirst({
      where: {
        organizationId,
        managerId,
        requiredDate: {
          gte: new Date(requiredDate),
          lt: new Date(requiredDate.getTime() + 24 * 60 * 60 * 1000), // Next day
        },
        status: {
          in: ['PENDING', 'APPROVED'],
        },
      },
    });

    if (existingRequest) {
      throw new BadRequestError('You already have a pending or approved request for this date');
    }

    const lorryRequest = await prisma.lorryRequest.create({
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

    // Send email notification to farm admin
    if (process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true') {
      try {
        // Get farm admin email
        const farmAdmin = await prisma.user.findFirst({
          where: {
            organizationId,
            role: 'FARM_ADMIN',
            status: 'ACTIVE',
          },
          select: { email: true },
        });

        if (farmAdmin?.email) {
          await this.emailService.sendLorryRequestNotification(
            farmAdmin.email,
            lorryRequest.manager.profile?.firstName || 'Field Manager',
            {
              id: lorryRequest.id,
              requiredDate: lorryRequest.requiredDate.toLocaleDateString(),
              purpose: lorryRequest.purpose,
              priority: lorryRequest.priority,
              location: lorryRequest.location,
            }
          );
        }
      } catch (error) {
        console.error('Failed to send lorry request notification email:', error);
        // Don't fail the request creation if email fails
      }
    }

    return lorryRequest;
  }

  async getLorryRequests(
    organizationId: string,
    userId: string,
    filters: LorryRequestFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ requests: any[]; total: number; page: number; totalPages: number }> {
    // Verify user belongs to this organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user || user.organizationId !== organizationId) {
      throw new ForbiddenError('Access denied to this organization');
    }

    const where: any = { organizationId };

    // Apply filters
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

    // Field managers can only see their own requests
    if (user.role === 'FIELD_MANAGER') {
      where.managerId = userId;
    }

    const [requests, total] = await Promise.all([
      prisma.lorryRequest.findMany({
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
      prisma.lorryRequest.count({ where }),
    ]);

    return {
      requests,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getLorryRequestById(requestId: string, userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const request = await prisma.lorryRequest.findUnique({
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
      throw new NotFoundError('Lorry request not found');
    }

    // Check access permissions
    if (user.organizationId !== request.organizationId) {
      throw new ForbiddenError('Access denied to this request');
    }

    // Field managers can only see their own requests
    if (user.role === 'FIELD_MANAGER' && request.managerId !== userId) {
      throw new ForbiddenError('Access denied to this request');
    }

    return request;
  }

  async updateLorryRequest(
    requestId: string,
    userId: string,
    data: UpdateLorryRequestData
  ): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const request = await prisma.lorryRequest.findUnique({
      where: { id: requestId },
      select: {
        organizationId: true,
        managerId: true,
        status: true,
        requiredDate: true,
      },
    });

    if (!request) {
      throw new NotFoundError('Lorry request not found');
    }

    if (user.organizationId !== request.organizationId) {
      throw new ForbiddenError('Access denied to this request');
    }

    // Only the requesting manager can update their own request
    if (request.managerId !== userId) {
      throw new ForbiddenError('Only the requesting manager can update this request');
    }

    // Can only update pending requests
    if (request.status !== 'PENDING') {
      throw new BadRequestError('Can only update pending requests');
    }

    // Validate required date if being updated
    if (data.requiredDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const requiredDate = new Date(data.requiredDate);
      requiredDate.setHours(0, 0, 0, 0);

      if (requiredDate < today) {
        throw new BadRequestError('Required date cannot be in the past');
      }

      // Check for duplicate requests on the new date (excluding current request)
      const existingRequest = await prisma.lorryRequest.findFirst({
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
        throw new BadRequestError('You already have a pending or approved request for this date');
      }
    }

    const updatedRequest = await prisma.lorryRequest.update({
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

  async approveLorryRequest(
    requestId: string,
    approverId: string,
    data: ApproveLorryRequestData
  ): Promise<any> {
    const approver = await prisma.user.findUnique({
      where: { id: approverId },
      select: { role: true, organizationId: true },
    });

    if (!approver || approver.role !== 'FARM_ADMIN') {
      throw new ForbiddenError('Only farm admins can approve lorry requests');
    }

    const request = await prisma.lorryRequest.findUnique({
      where: { id: requestId },
      select: {
        organizationId: true,
        status: true,
        managerId: true,
        requiredDate: true,
      },
    });

    if (!request) {
      throw new NotFoundError('Lorry request not found');
    }

    if (approver.organizationId !== request.organizationId) {
      throw new ForbiddenError('Access denied to this request');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestError('Can only approve pending requests');
    }

    // Verify the lorry exists and is available
    const lorry = await prisma.lorry.findUnique({
      where: { id: data.assignedLorryId },
      select: {
        organizationId: true,
        status: true,
        assignedManagerId: true,
      },
    });

    if (!lorry) {
      throw new NotFoundError('Lorry not found');
    }

    if (lorry.organizationId !== request.organizationId) {
      throw new BadRequestError('Lorry does not belong to this organization');
    }

    if (lorry.status !== 'AVAILABLE') {
      throw new BadRequestError('Lorry is not available for assignment');
    }

    // Check if lorry is already assigned to another request on the same date
    const conflictingRequest = await prisma.lorryRequest.findFirst({
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
      throw new BadRequestError('Lorry is already assigned to another request on this date');
    }

    // Use transaction to update both request and lorry
    const result = await prisma.$transaction(async (tx) => {
      // Update the request
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

      // Update the lorry assignment
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

    // Send approval notification email
    if (process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true') {
      try {
        await this.emailService.sendLorryApprovalNotification(
          result.manager.email,
          {
            requestId: result.id,
            lorryName: result.assignedLorry?.name || 'Unknown',
            licensePlate: result.assignedLorry?.licensePlate || 'Unknown',
            approvedBy: result.approver?.profile?.firstName || 'Farm Admin',
          }
        );
      } catch (error) {
        console.error('Failed to send lorry approval notification email:', error);
        // Don't fail the approval if email fails
      }
    }

    return result;
  }

  async rejectLorryRequest(
    requestId: string,
    approverId: string,
    data: RejectLorryRequestData
  ): Promise<any> {
    const approver = await prisma.user.findUnique({
      where: { id: approverId },
      select: { role: true, organizationId: true },
    });

    if (!approver || approver.role !== 'FARM_ADMIN') {
      throw new ForbiddenError('Only farm admins can reject lorry requests');
    }

    const request = await prisma.lorryRequest.findUnique({
      where: { id: requestId },
      select: { organizationId: true, status: true },
    });

    if (!request) {
      throw new NotFoundError('Lorry request not found');
    }

    if (approver.organizationId !== request.organizationId) {
      throw new ForbiddenError('Access denied to this request');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestError('Can only reject pending requests');
    }

    const updatedRequest = await prisma.lorryRequest.update({
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

  async cancelLorryRequest(requestId: string, userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const request = await prisma.lorryRequest.findUnique({
      where: { id: requestId },
      select: {
        organizationId: true,
        managerId: true,
        status: true,
        assignedLorryId: true,
      },
    });

    if (!request) {
      throw new NotFoundError('Lorry request not found');
    }

    if (user.organizationId !== request.organizationId) {
      throw new ForbiddenError('Access denied to this request');
    }

    // Only the requesting manager can cancel their own request
    if (request.managerId !== userId) {
      throw new ForbiddenError('Only the requesting manager can cancel this request');
    }

    if (!['PENDING', 'APPROVED'].includes(request.status)) {
      throw new BadRequestError('Can only cancel pending or approved requests');
    }

    // Use transaction to update request and potentially unassign lorry
    const result = await prisma.$transaction(async (tx) => {
      // Update the request
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

      // If lorry was assigned, unassign it
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

  async getLorryRequestStats(organizationId: string, userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user || user.organizationId !== organizationId) {
      throw new ForbiddenError('Access denied to this organization');
    }

    const where: any = { organizationId };

    // Field managers only see their own stats
    if (user.role === 'FIELD_MANAGER') {
      where.managerId = userId;
    }

    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      cancelledRequests,
      completedRequests,
      urgentRequests,
    ] = await Promise.all([
      prisma.lorryRequest.count({ where }),
      prisma.lorryRequest.count({ where: { ...where, status: 'PENDING' } }),
      prisma.lorryRequest.count({ where: { ...where, status: 'APPROVED' } }),
      prisma.lorryRequest.count({ where: { ...where, status: 'REJECTED' } }),
      prisma.lorryRequest.count({ where: { ...where, status: 'CANCELLED' } }),
      prisma.lorryRequest.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.lorryRequest.count({ where: { ...where, priority: 'URGENT' } }),
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