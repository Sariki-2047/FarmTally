import { prisma } from '../config/database';
import { NotFoundError, BadRequestError, ForbiddenError } from '../middleware/error.middleware';
import { Lorry, LorryStatus } from '@prisma/client';

export interface CreateLorryData {
  name: string;
  licensePlate: string;
  capacity: number;
  assignedManagerId?: string;
  location?: any;
  maintenanceSchedule?: any;
}

export interface UpdateLorryData {
  name?: string;
  licensePlate?: string;
  capacity?: number;
  status?: LorryStatus;
  assignedManagerId?: string | null;
  location?: any;
  maintenanceSchedule?: any;
}

export interface LorryFilters {
  status?: LorryStatus;
  assignedManagerId?: string;
  search?: string;
}

export class LorryService {
  async createLorry(organizationId: string, userId: string, data: CreateLorryData): Promise<Lorry> {
    // Verify user is Farm Admin of this organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user || user.organizationId !== organizationId || user.role !== 'FARM_ADMIN') {
      throw new ForbiddenError('Only farm admins can create lorries');
    }

    // Check if license plate already exists in this organization
    const existingLorry = await prisma.lorry.findFirst({
      where: {
        organizationId,
        licensePlate: data.licensePlate.toUpperCase(),
      },
    });

    if (existingLorry) {
      throw new BadRequestError('A lorry with this license plate already exists');
    }

    // If assigning to a manager, verify the manager exists and belongs to organization
    if (data.assignedManagerId) {
      const manager = await prisma.user.findUnique({
        where: { id: data.assignedManagerId },
        select: { role: true, organizationId: true, status: true },
      });

      if (!manager || manager.organizationId !== organizationId) {
        throw new NotFoundError('Manager not found in this organization');
      }

      if (manager.role !== 'FIELD_MANAGER') {
        throw new BadRequestError('Can only assign lorries to field managers');
      }

      if (manager.status !== 'ACTIVE') {
        throw new BadRequestError('Cannot assign lorry to inactive manager');
      }
    }

    const lorry = await prisma.lorry.create({
      data: {
        ...data,
        licensePlate: data.licensePlate.toUpperCase(),
        organizationId,
        status: data.assignedManagerId ? 'ASSIGNED' : 'AVAILABLE',
        assignedAt: data.assignedManagerId ? new Date() : null,
      },
      include: {
        assignedManager: {
          select: {
            id: true,
            email: true,
            phone: true,
            profile: true,
          },
        },
      },
    });

    return lorry;
  }

  async getLorries(
    organizationId: string,
    userId: string,
    filters: LorryFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ lorries: any[]; total: number; page: number; totalPages: number }> {
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

    if (filters.assignedManagerId) {
      where.assignedManagerId = filters.assignedManagerId;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { licensePlate: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // For field managers, only show their assigned lorries
    if (user.role === 'FIELD_MANAGER') {
      where.assignedManagerId = userId;
    }

    const [lorries, total] = await Promise.all([
      prisma.lorry.findMany({
        where,
        include: {
          assignedManager: {
            select: {
              id: true,
              email: true,
              phone: true,
              profile: true,
            },
          },
          _count: {
            select: {
              requests: true,
              deliveries: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lorry.count({ where }),
    ]);

    return {
      lorries,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getLorryById(lorryId: string, userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const lorry = await prisma.lorry.findUnique({
      where: { id: lorryId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        assignedManager: {
          select: {
            id: true,
            email: true,
            phone: true,
            profile: true,
          },
        },
        requests: {
          select: {
            id: true,
            requiredDate: true,
            priority: true,
            status: true,
            manager: {
              select: {
                id: true,
                email: true,
                profile: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        deliveries: {
          select: {
            id: true,
            deliveryDate: true,
            grossWeight: true,
            netWeight: true,
            status: true,
            farmer: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!lorry) {
      throw new NotFoundError('Lorry not found');
    }

    // Check access permissions
    if (user.organizationId !== lorry.organizationId) {
      throw new ForbiddenError('Access denied to this lorry');
    }

    // Field managers can only see their assigned lorries
    if (user.role === 'FIELD_MANAGER' && lorry.assignedManagerId !== userId) {
      throw new ForbiddenError('Access denied to this lorry');
    }

    return lorry;
  }

  async updateLorry(lorryId: string, userId: string, data: UpdateLorryData): Promise<Lorry> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const lorry = await prisma.lorry.findUnique({
      where: { id: lorryId },
      select: { organizationId: true, assignedManagerId: true },
    });

    if (!lorry) {
      throw new NotFoundError('Lorry not found');
    }

    if (user.organizationId !== lorry.organizationId) {
      throw new ForbiddenError('Access denied to this lorry');
    }

    // Only farm admins can update lorry details, field managers can only update location/status
    if (user.role === 'FIELD_MANAGER') {
      if (lorry.assignedManagerId !== userId) {
        throw new ForbiddenError('Access denied to this lorry');
      }

      // Field managers can only update limited fields
      const allowedFields = ['location', 'status'];
      const hasDisallowedFields = Object.keys(data).some(key => !allowedFields.includes(key));
      
      if (hasDisallowedFields) {
        throw new ForbiddenError('Field managers can only update location and status');
      }
    }

    // If updating license plate, check for duplicates
    if (data.licensePlate) {
      const existingLorry = await prisma.lorry.findFirst({
        where: {
          organizationId: lorry.organizationId,
          licensePlate: data.licensePlate.toUpperCase(),
          id: { not: lorryId },
        },
      });

      if (existingLorry) {
        throw new BadRequestError('A lorry with this license plate already exists');
      }

      data.licensePlate = data.licensePlate.toUpperCase();
    }

    // If assigning to a new manager, verify the manager
    if (data.assignedManagerId !== undefined) {
      if (data.assignedManagerId) {
        const manager = await prisma.user.findUnique({
          where: { id: data.assignedManagerId },
          select: { role: true, organizationId: true, status: true },
        });

        if (!manager || manager.organizationId !== lorry.organizationId) {
          throw new NotFoundError('Manager not found in this organization');
        }

        if (manager.role !== 'FIELD_MANAGER') {
          throw new BadRequestError('Can only assign lorries to field managers');
        }

        if (manager.status !== 'ACTIVE') {
          throw new BadRequestError('Cannot assign lorry to inactive manager');
        }

        // Update status and assignment time
        data.status = 'ASSIGNED';
        (data as any).assignedAt = new Date();
      } else {
        // Unassigning lorry
        data.status = 'AVAILABLE';
        (data as any).assignedAt = null;
      }
    }

    const updatedLorry = await prisma.lorry.update({
      where: { id: lorryId },
      data,
      include: {
        assignedManager: {
          select: {
            id: true,
            email: true,
            phone: true,
            profile: true,
          },
        },
      },
    });

    return updatedLorry;
  }

  async deleteLorry(lorryId: string, userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user || user.role !== 'FARM_ADMIN') {
      throw new ForbiddenError('Only farm admins can delete lorries');
    }

    const lorry = await prisma.lorry.findUnique({
      where: { id: lorryId },
      select: { 
        organizationId: true,
        _count: {
          select: {
            requests: true,
            deliveries: true,
          },
        },
      },
    });

    if (!lorry) {
      throw new NotFoundError('Lorry not found');
    }

    if (user.organizationId !== lorry.organizationId) {
      throw new ForbiddenError('Access denied to this lorry');
    }

    // Check if lorry has associated records
    if (lorry._count.requests > 0 || lorry._count.deliveries > 0) {
      throw new BadRequestError('Cannot delete lorry with existing requests or deliveries');
    }

    await prisma.lorry.delete({
      where: { id: lorryId },
    });
  }

  async assignLorryToManager(lorryId: string, managerId: string, userId: string): Promise<Lorry> {
    return this.updateLorry(lorryId, userId, { assignedManagerId: managerId });
  }

  async unassignLorry(lorryId: string, userId: string): Promise<Lorry> {
    return this.updateLorry(lorryId, userId, { assignedManagerId: null });
  }

  async getLorryStats(organizationId: string, userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user || user.organizationId !== organizationId) {
      throw new ForbiddenError('Access denied to this organization');
    }

    const where: any = { organizationId };

    // Field managers only see their assigned lorries
    if (user.role === 'FIELD_MANAGER') {
      where.assignedManagerId = userId;
    }

    const [
      totalLorries,
      availableLorries,
      assignedLorries,
      inTransitLorries,
      maintenanceLorries,
    ] = await Promise.all([
      prisma.lorry.count({ where }),
      prisma.lorry.count({ where: { ...where, status: 'AVAILABLE' } }),
      prisma.lorry.count({ where: { ...where, status: 'ASSIGNED' } }),
      prisma.lorry.count({ where: { ...where, status: 'IN_TRANSIT' } }),
      prisma.lorry.count({ where: { ...where, status: 'MAINTENANCE' } }),
    ]);

    return {
      totalLorries,
      availableLorries,
      assignedLorries,
      inTransitLorries,
      maintenanceLorries,
      utilizationRate: totalLorries > 0 ? ((assignedLorries + inTransitLorries) / totalLorries * 100).toFixed(1) : 0,
    };
  }
}