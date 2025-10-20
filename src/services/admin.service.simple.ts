import { prisma } from '../lib/prisma';
import { UserRole, UserStatus } from '@prisma/client';

export interface PendingFarmAdminResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  organizationName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalData {
  userId: string;
  approved: boolean;
  rejectionReason?: string;
}

export class AdminService {
  
  /**
   * Get all pending Farm Admin registrations
   */
  async getPendingFarmAdmins(): Promise<PendingFarmAdminResponse[]> {
    const pendingAdmins = await prisma.user.findMany({
      where: {
        role: UserRole.FARM_ADMIN,
        status: UserStatus.PENDING
      },
      include: {
        organization: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return pendingAdmins.map(admin => ({
      id: admin.id,
      email: admin.email || '',
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role,
      status: admin.status,
      organizationName: admin.organization?.name || '',
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    }));
  }

  /**
   * Approve or reject Farm Admin registration
   */
  async reviewFarmAdminRegistration(
    data: ApprovalData,
    reviewerId: string
  ): Promise<{ message: string; user: any }> {
    
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      include: { organization: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== UserRole.FARM_ADMIN) {
      throw new Error('Only Farm Admin accounts can be reviewed');
    }

    if (user.status !== UserStatus.PENDING) {
      throw new Error('User account is not pending review');
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    let message = '';

    if (data.approved) {
      updateData.status = UserStatus.APPROVED;
      updateData.approvedAt = new Date();
      updateData.approvedBy = reviewerId;
      message = 'Farm Admin account approved successfully';
    } else {
      updateData.status = UserStatus.REJECTED;
      updateData.rejectedAt = new Date();
      updateData.rejectedBy = reviewerId;
      updateData.rejectionReason = data.rejectionReason || 'No reason provided';
      message = 'Farm Admin account rejected';
    }

    const updatedUser = await prisma.user.update({
      where: { id: data.userId },
      data: updateData,
      include: { organization: true }
    });

    return {
      message,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        status: updatedUser.status,
        organization: updatedUser.organization ? {
          id: updatedUser.organization.id,
          name: updatedUser.organization.name
        } : null
      }
    };
  }

  /**
   * Get all Farm Admins with their status
   */
  async getAllFarmAdmins(): Promise<PendingFarmAdminResponse[]> {
    const farmAdmins = await prisma.user.findMany({
      where: {
        role: UserRole.FARM_ADMIN
      },
      include: {
        organization: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return farmAdmins.map(admin => ({
      id: admin.id,
      email: admin.email || '',
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role,
      status: admin.status,
      organizationName: admin.organization?.name || '',
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    }));
  }

  /**
   * Get system statistics for admin dashboard
   */
  async getSystemStats(): Promise<{
    totalOrganizations: number;
    totalFarmAdmins: number;
    pendingApprovals: number;
    totalFieldManagers: number;
    totalFarmers: number;
    totalDeliveries: number;
    totalAdvancePayments: number;
  }> {
    
    const [
      totalOrganizations,
      totalFarmAdmins,
      pendingApprovals,
      totalFieldManagers,
      totalFarmers,
      totalDeliveries,
      totalAdvancePayments
    ] = await Promise.all([
      prisma.organization.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: UserRole.FARM_ADMIN, status: UserStatus.APPROVED } }),
      prisma.user.count({ where: { role: UserRole.FARM_ADMIN, status: UserStatus.PENDING } }),
      prisma.user.count({ where: { role: UserRole.FIELD_MANAGER, isActive: true } }),
      prisma.farmer.count({ where: { isActive: true } }),
      prisma.delivery.count(),
      prisma.advancePayment.count()
    ]);

    return {
      totalOrganizations,
      totalFarmAdmins,
      pendingApprovals,
      totalFieldManagers,
      totalFarmers,
      totalDeliveries,
      totalAdvancePayments
    };
  }

  /**
   * Create initial Application Admin (for setup only)
   */
  async createApplicationAdmin(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ token: string; user: any }> {
    
    // Check if Application Admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: UserRole.APPLICATION_ADMIN }
    });

    if (existingAdmin) {
      throw new Error('Application Admin already exists');
    }

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create system organization for Application Admin
    let systemOrg = await prisma.organization.findFirst({
      where: { name: 'FarmTally System' }
    });

    if (!systemOrg) {
      systemOrg = await prisma.organization.create({
        data: {
          name: 'FarmTally System',
          code: 'SYSTEM',
          isActive: true
        }
      });
    }

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: UserRole.APPLICATION_ADMIN,
        status: UserStatus.APPROVED,
        organizationId: systemOrg.id,
        approvedAt: new Date()
      },
      include: { organization: true }
    });

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organization: user.organization ? {
          id: user.organization.id,
          name: user.organization.name
        } : null
      }
    };
  }

  /**
   * Check if user can invite Field Managers (must be approved Farm Admin)
   */
  async canInviteFieldManagers(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true }
    });

    return user?.role === UserRole.FARM_ADMIN && 
           user?.status === UserStatus.APPROVED && 
           user?.organization?.isActive === true;
  }
}

export const adminService = new AdminService();