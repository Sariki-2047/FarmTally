import { prisma } from '../lib/prisma';

export interface CreateLorryData {
  plateNumber: string;
  capacity: number;
  assignedManagerId?: string;
}

export interface LorryResponse {
  id: string;
  plateNumber: string;
  licensePlate: string;
  capacity: number;
  status: string;
  assignedToId: string | null;
  assignedManagerId: string | null;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  assignedManager?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export class LorryService {
  async createLorry(data: CreateLorryData, organizationId: string): Promise<LorryResponse> {
    // Check if lorry with this plate number already exists
    const existingLorry = await prisma.lorry.findFirst({
      where: { 
        OR: [
          { plateNumber: data.plateNumber.toUpperCase() },
          { licensePlate: data.plateNumber.toUpperCase() }
        ]
      }
    });

    if (existingLorry) {
      throw new Error('Lorry with this plate number already exists');
    }

    const lorry = await prisma.lorry.create({
      data: {
        plateNumber: data.plateNumber.toUpperCase(),
        licensePlate: data.plateNumber.toUpperCase(),
        capacity: data.capacity,
        status: 'AVAILABLE',
        assignedToId: data.assignedManagerId || null,
        assignedManagerId: data.assignedManagerId || null,
        organizationId: organizationId
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return {
      ...lorry,
      assignedManager: lorry.assignedTo
    };
  }

  async getLorries(organizationId: string, page = 1, limit = 20): Promise<{
    lorries: LorryResponse[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [lorries, total] = await Promise.all([
      prisma.lorry.findMany({
        where: { organizationId: organizationId },
        include: {
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.lorry.count({
        where: { organizationId: organizationId }
      })
    ]);

    const formattedLorries = lorries.map(lorry => ({
      ...lorry,
      assignedManager: lorry.assignedTo
    }));

    return {
      lorries: formattedLorries,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getLorryById(id: string, organizationId: string): Promise<LorryResponse> {
    const lorry = await prisma.lorry.findFirst({
      where: { 
        id,
        organizationId: organizationId
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!lorry) {
      throw new Error('Lorry not found');
    }

    return {
      ...lorry,
      assignedManager: lorry.assignedTo
    };
  }

  async updateLorry(id: string, data: Partial<CreateLorryData>, organizationId: string): Promise<LorryResponse> {
    const lorry = await prisma.lorry.findFirst({
      where: { 
        id,
        organizationId: organizationId
      }
    });

    if (!lorry) {
      throw new Error('Lorry not found');
    }

    const updatedLorry = await prisma.lorry.update({
      where: { id },
      data: {
        ...data,
        plateNumber: data.plateNumber ? data.plateNumber.toUpperCase() : undefined,
        licensePlate: data.plateNumber ? data.plateNumber.toUpperCase() : undefined,
        assignedToId: data.assignedManagerId,
        assignedManagerId: data.assignedManagerId,
        updatedAt: new Date()
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return {
      ...updatedLorry,
      assignedManager: updatedLorry.assignedTo
    };
  }

  async deleteLorry(id: string, organizationId: string): Promise<void> {
    const lorry = await prisma.lorry.findFirst({
      where: { 
        id,
        organizationId: organizationId
      }
    });

    if (!lorry) {
      throw new Error('Lorry not found');
    }

    // Check if lorry has active deliveries
    const activeDeliveries = await prisma.delivery.count({
      where: {
        lorryId: id,
        status: { in: ['PENDING', 'IN_PROGRESS'] }
      }
    });

    if (activeDeliveries > 0) {
      throw new Error('Cannot delete lorry with active deliveries');
    }

    await prisma.lorry.delete({
      where: { id }
    });
  }

  async updateLorryStatus(id: string, status: string, organizationId: string): Promise<LorryResponse> {
    const lorry = await prisma.lorry.findFirst({
      where: { 
        id,
        organizationId: organizationId
      }
    });

    if (!lorry) {
      throw new Error('Lorry not found');
    }

    // Special handling for status transitions
    const updateData: any = { 
      status: status as any,
      updatedAt: new Date()
    };

    // When setting to SENT_TO_DEALER, record the timestamp
    if (status === 'SENT_TO_DEALER') {
      updateData.sentToDealerAt = new Date();
    }

    // When setting to AVAILABLE, clear assignment if coming from SENT_TO_DEALER
    if (status === 'AVAILABLE' && lorry.status === 'SENT_TO_DEALER') {
      updateData.assignedManagerId = null;
      updateData.assignedAt = null;
    }

    const updatedLorry = await prisma.lorry.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return {
      ...updatedLorry,
      assignedManager: updatedLorry.assignedTo
    };
  }
}

export const lorryService = new LorryService();