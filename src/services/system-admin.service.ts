import { prisma } from '../config/database';
import { NotFoundError, BadRequestError, ForbiddenError } from '../middleware/error.middleware';
import { UserStatus, UserRole } from '@prisma/client';
import EmailService from './emailService';

export interface PendingUserFilters {
  role?: UserRole;
  status?: UserStatus;
  organizationId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ApproveUserData {
  userId: string;
  approvalNotes?: string;
}

export interface RejectUserData {
  userId: string;
  rejectionReason: string;
}

export interface CreateSystemAdminData {
  email: string;
  phone?: string;
  password: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

export class SystemAdminService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Get all pending user registrations for approval
   */
  async getPendingUsers(
    filters: PendingUserFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ users: any[]; total: number; page: number; totalPages: number }> {
    const where: any = {
      status: filters.status || 'PENDING',
    };

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.organizationId) {
      where.organizationId = filters.organizationId;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: [
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Approve a pending user registration
   */
  async approveUser(adminId: string, data: ApproveUserData): Promise<any> {
    // Verify admin is APPLICATION_ADMIN
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true, status: true },
    });

    if (!admin || admin.role !== 'APPLICATION_ADMIN') {
      throw new ForbiddenError('Only application admins can approve users');
    }

    if (admin.status !== 'APPROVED') {
      throw new ForbiddenError('Admin account is not approved');
    }

    // Get the user to approve
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.status !== 'PENDING') {
      throw new BadRequestError('User is not in pending status');
    }

    // Approve the user
    const approvedUser = await prisma.user.update({
      where: { id: data.userId },
      data: {
        status: 'APPROVED',
        approvedBy: adminId,
        approvedAt: new Date(),
        approvalNotes: data.approvalNotes,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Send approval email notification
    if (process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true' && user.email) {
      try {
        await this.sendUserApprovalEmail(user.email, {
          userName: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim(),
          role: user.role,
          organizationName: user.organization?.name,
          approvalNotes: data.approvalNotes,
        });
      } catch (error) {
        console.error('Failed to send user approval email:', error);
        // Don't fail the approval if email fails
      }
    }

    return approvedUser;
  }

  /**
   * Reject a pending user registration
   */
  async rejectUser(adminId: string, data: RejectUserData): Promise<any> {
    // Verify admin is APPLICATION_ADMIN
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true, status: true },
    });

    if (!admin || admin.role !== 'APPLICATION_ADMIN') {
      throw new ForbiddenError('Only application admins can reject users');
    }

    if (admin.status !== 'APPROVED') {
      throw new ForbiddenError('Admin account is not approved');
    }

    // Get the user to reject
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.status !== 'PENDING') {
      throw new BadRequestError('User is not in pending status');
    }

    // Reject the user
    const rejectedUser = await prisma.user.update({
      where: { id: data.userId },
      data: {
        status: 'REJECTED',
        approvedBy: adminId,
        approvedAt: new Date(),
        rejectionReason: data.rejectionReason,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Send rejection email notification
    if (process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true' && user.email) {
      try {
        await this.sendUserRejectionEmail(user.email, {
          userName: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim(),
          role: user.role,
          organizationName: user.organization?.name,
          rejectionReason: data.rejectionReason,
        });
      } catch (error) {
        console.error('Failed to send user rejection email:', error);
        // Don't fail the rejection if email fails
      }
    }

    return rejectedUser;
  }

  /**
   * Get system admin dashboard statistics
   */
  async getDashboardStats(): Promise<any> {
    const [
      totalUsers,
      pendingUsers,
      approvedUsers,
      rejectedUsers,
      totalOrganizations,
      activeOrganizations,
      recentRegistrations,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { status: 'APPROVED' } }),
      prisma.user.count({ where: { status: 'REJECTED' } }),
      prisma.organization.count(),
      prisma.organization.count({ where: { isActive: true } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    // Get user distribution by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    });

    // Get recent pending users
    const recentPendingUsers = await prisma.user.findMany({
      where: { status: 'PENDING' },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      totalUsers,
      pendingUsers,
      approvedUsers,
      rejectedUsers,
      totalOrganizations,
      activeOrganizations,
      recentRegistrations,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      recentPendingUsers,
    };
  }

  /**
   * Create the first system admin (for initial setup)
   */
  async createSystemAdmin(data: CreateSystemAdminData): Promise<any> {
    // Check if any APPLICATION_ADMIN already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'APPLICATION_ADMIN' },
    });

    if (existingAdmin) {
      throw new BadRequestError('System admin already exists');
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new BadRequestError('User with this email already exists');
    }

    // Create system admin
    const admin = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        phone: data.phone,
        passwordHash: await require('../utils/password').PasswordService.hash(data.password),
        role: 'APPLICATION_ADMIN',
        profile: data.profile,
        status: 'APPROVED', // System admin is auto-approved
      },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        profile: true,
        status: true,
        createdAt: true,
      },
    });

    return admin;
  }

  /**
   * Get all organizations for system admin management
   */
  async getAllOrganizations(
    page: number = 1,
    limit: number = 20
  ): Promise<{ organizations: any[]; total: number; page: number; totalPages: number }> {
    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              phone: true,
              profile: true,
              status: true,
            },
          },
          _count: {
            select: {
              users: true,
              farmers: true,
              lorries: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.organization.count(),
    ]);

    return {
      organizations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Suspend or reactivate a user
   */
  async toggleUserStatus(adminId: string, userId: string, suspend: boolean): Promise<any> {
    // Verify admin is APPLICATION_ADMIN
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true, status: true },
    });

    if (!admin || admin.role !== 'APPLICATION_ADMIN') {
      throw new ForbiddenError('Only application admins can suspend/reactivate users');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.role === 'APPLICATION_ADMIN') {
      throw new ForbiddenError('Cannot suspend another system admin');
    }

    const newStatus = suspend ? 'SUSPENDED' : 'APPROVED';

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return updatedUser;
  }

  /**
   * Send user approval email
   */
  private async sendUserApprovalEmail(
    email: string,
    details: {
      userName: string;
      role: string;
      organizationName?: string;
      approvalNotes?: string;
    }
  ): Promise<boolean> {
    return await this.emailService.sendEmail({
      to: email,
      subject: '✅ FarmTally Account Approved - Welcome!',
      html: this.generateApprovalEmailTemplate(details),
      text: `Your FarmTally account has been approved! You can now log in as ${details.role}.`,
    });
  }

  /**
   * Send user rejection email
   */
  private async sendUserRejectionEmail(
    email: string,
    details: {
      userName: string;
      role: string;
      organizationName?: string;
      rejectionReason: string;
    }
  ): Promise<boolean> {
    return await this.emailService.sendEmail({
      to: email,
      subject: '❌ FarmTally Account Registration - Update Required',
      html: this.generateRejectionEmailTemplate(details),
      text: `Your FarmTally account registration was not approved. Reason: ${details.rejectionReason}`,
    });
  }

  /**
   * Generate approval email template
   */
  private generateApprovalEmailTemplate(details: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { padding: 20px; background-color: #f9f9f9; border-radius: 0 0 5px 5px; }
          .success { background-color: #E8F5E8; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #4CAF50; }
          .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Account Approved!</h1>
          </div>
          <div class="content">
            <p>Dear ${details.userName},</p>
            
            <div class="success">
              <h3>✅ Welcome to FarmTally!</h3>
              <p>Your account registration has been approved by our system administrator.</p>
            </div>
            
            <h4>Account Details:</h4>
            <ul>
              <li><strong>Role:</strong> ${details.role}</li>
              ${details.organizationName ? `<li><strong>Organization:</strong> ${details.organizationName}</li>` : ''}
              <li><strong>Status:</strong> Active</li>
            </ul>
            
            ${details.approvalNotes ? `
              <h4>Admin Notes:</h4>
              <p><em>${details.approvalNotes}</em></p>
            ` : ''}
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'https://app.farmtally.in'}/login" class="button">Login to FarmTally</a>
            </div>
            
            <h4>What's Next?</h4>
            <ul>
              <li>Log in to your FarmTally account</li>
              <li>Complete your profile setup</li>
              <li>Start managing your farm operations</li>
              <li>Contact support if you need assistance</li>
            </ul>
            
            <p>Thank you for choosing FarmTally for your agricultural management needs!</p>
            
            <p>Best regards,<br>The FarmTally Team</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message from FarmTally. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate rejection email template
   */
  private generateRejectionEmailTemplate(details: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f44336; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { padding: 20px; background-color: #f9f9f9; border-radius: 0 0 5px 5px; }
          .warning { background-color: #FFF3E0; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #FF9800; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2E7D32; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Registration Update Required</h1>
          </div>
          <div class="content">
            <p>Dear ${details.userName},</p>
            
            <p>Thank you for your interest in FarmTally. After reviewing your registration, we need some additional information or corrections before we can approve your account.</p>
            
            <div class="warning">
              <h4>⚠️ Reason for Review:</h4>
              <p>${details.rejectionReason}</p>
            </div>
            
            <h4>Registration Details:</h4>
            <ul>
              <li><strong>Role:</strong> ${details.role}</li>
              ${details.organizationName ? `<li><strong>Organization:</strong> ${details.organizationName}</li>` : ''}
              <li><strong>Status:</strong> Requires Update</li>
            </ul>
            
            <h4>Next Steps:</h4>
            <ul>
              <li>Review the reason provided above</li>
              <li>Update your registration information</li>
              <li>Resubmit your application</li>
              <li>Contact support if you have questions</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'https://app.farmtally.in'}/register" class="button">Update Registration</a>
            </div>
            
            <p>We appreciate your patience and look forward to welcoming you to the FarmTally community once the required updates are made.</p>
            
            <p>Best regards,<br>The FarmTally Team</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message from FarmTally. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default SystemAdminService;