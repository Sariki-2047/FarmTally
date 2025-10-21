import { prisma } from '../lib/prisma';
import * as crypto from 'crypto';
import { EmailService } from './emailService';

export interface CreateInvitationData {
  email: string;
  role: 'FARM_ADMIN' | 'FIELD_MANAGER';
  organizationName: string;
  invitedBy: string;
  firstName?: string;
  lastName?: string;
  message?: string;
  expiresInDays?: number;
}

export interface InvitationResponse {
  id: string;
  email: string;
  role: string;
  organizationName: string;
  invitationToken: string;
  invitedBy: string;
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class InvitationService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }
  
  /**
   * Create invitation for Farm Admin or Field Manager
   * Only approved Farm Admin can invite Field Managers
   */
  async createInvitation(
    data: CreateInvitationData,
    inviterUserId: string
  ): Promise<InvitationResponse> {
    
    // Check if inviter is authorized
    const inviter = await prisma.user.findUnique({
      where: { id: inviterUserId },
      include: { organization: true }
    });

    if (!inviter) {
      throw new Error('Inviter not found');
    }

    // Only approved Farm Admins can invite Field Managers
    if (data.role === 'FIELD_MANAGER') {
      if (inviter.role !== 'FARM_ADMIN') {
        throw new Error('Only Farm Admins can invite Field Managers');
      }
      
      if (inviter.status !== 'APPROVED') {
        throw new Error('Your account must be approved before you can invite Field Managers');
      }

      if (!inviter.organization?.isActive) {
        throw new Error('Your organization must be active to invite Field Managers');
      }
    }

    // Generate unique invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    
    // Set expiration (default 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (data.expiresInDays || 7));

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create invitation in database (using only existing fields for now)
    const invitation = await prisma.invitation.create({
      data: {
        email: data.email.toLowerCase(),
        role: data.role,
        organizationName: data.organizationName,
        invitationToken: invitationToken,
        invitedBy: inviterUserId,
        isUsed: false,
        expiresAt: expiresAt
      }
    });

    // Send invitation email
    if (data.role === 'FIELD_MANAGER') {
      const invitationLink = `${process.env.FRONTEND_URL || 'https://app.farmtally.in'}/register?token=${invitationToken}`;
      const inviterName = `${inviter.firstName || ''} ${inviter.lastName || ''}`.trim() || inviter.email;
      
      try {
        await this.emailService.sendFieldManagerInvitation(
          data.email,
          inviterName,
          data.organizationName,
          invitationLink,
          data.message
        );
        console.log(`✅ Invitation email sent to ${data.email}`);
      } catch (error) {
        console.error(`❌ Failed to send invitation email to ${data.email}:`, error);
        // Don't fail the invitation creation if email fails
      }
    }

    return invitation as InvitationResponse;
  }

  /**
   * Validate invitation token
   */
  async validateInvitation(token: string): Promise<InvitationResponse> {
    const invitation = await prisma.invitation.findFirst({
      where: {
        invitationToken: token,
        isUsed: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!invitation) {
      throw new Error('Invalid or expired invitation token');
    }

    return invitation as InvitationResponse;
  }

  /**
   * Register user with invitation token
   */
  async registerWithInvitation(
    token: string,
    userData: {
      password: string;
      firstName: string;
      lastName: string;
    }
  ): Promise<{ user: any; token: string }> {
    
    // Validate invitation
    const invitation = await this.validateInvitation(token);

    // Create or find organization
    let organization = await prisma.organization.findFirst({
      where: { name: invitation.organizationName }
    });

    if (!organization) {
      organization = await prisma.organization.create({
        data: {
          name: invitation.organizationName,
          code: invitation.organizationName.toUpperCase().replace(/\s+/g, '_'),
          isActive: true
        }
      });
    }

    // Create user account
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const user = await prisma.user.create({
      data: {
        email: invitation.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: invitation.role as any,
        organizationId: organization.id,
        isActive: true
      },
      include: { organization: true }
    });

    // Mark invitation as used
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { 
        isUsed: true,
        usedAt: new Date()
      }
    });

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const authToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      { expiresIn: '24h' }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organization: {
          id: user.organization.id,
          name: user.organization.name
        }
      },
      token: authToken
    };
  }

  /**
   * Get all invitations (for admin dashboard)
   */
  async getInvitations(organizationId?: string): Promise<InvitationResponse[]> {
    const where: any = {};
    if (organizationId) {
      where.organizationName = { 
        in: await prisma.organization.findMany({
          where: { id: organizationId },
          select: { name: true }
        }).then(orgs => orgs.map(o => o.name))
      };
    }

    const invitations = await prisma.invitation.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return invitations as InvitationResponse[];
  }

  /**
   * Resend invitation
   */
  async resendInvitation(invitationId: string): Promise<InvitationResponse> {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId }
    });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.isUsed) {
      throw new Error('Invitation has already been used');
    }

    // Extend expiration by 7 days
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    const updatedInvitation = await prisma.invitation.update({
      where: { id: invitationId },
      data: { 
        expiresAt: newExpiresAt,
        updatedAt: new Date()
      }
    });

    return updatedInvitation as InvitationResponse;
  }

  /**
   * Cancel invitation
   */
  async cancelInvitation(invitationId: string): Promise<void> {
    await prisma.invitation.delete({
      where: { id: invitationId }
    });
  }

  /**
   * Get Farm Admin with organization details
   */
  async getFarmAdminWithOrganization(userId: string): Promise<any> {
    const farmAdmin = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true }
    });

    if (!farmAdmin) {
      throw new Error('Farm Admin not found');
    }

    if (farmAdmin.role !== 'FARM_ADMIN') {
      throw new Error('User is not a Farm Admin');
    }

    if (farmAdmin.status !== 'APPROVED') {
      throw new Error('Farm Admin account is not approved');
    }

    return farmAdmin;
  }

  /**
   * Get Field Managers for a Farm Admin's organization
   */
  async getFieldManagers(organizationId: string): Promise<any[]> {
    const fieldManagers = await prisma.user.findMany({
      where: {
        role: 'FIELD_MANAGER',
        organizationId: organizationId,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return fieldManagers;
  }
}

export const invitationService = new InvitationService();