import { prisma } from '../config/database';
import { NotFoundError, BadRequestError, ConflictError, ForbiddenError } from '../middleware/error.middleware';
import { Organization, User } from '@prisma/client';

export interface CreateOrganizationData {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  settings?: any;
}

export interface UpdateOrganizationData {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  settings?: any;
}

export class OrganizationService {
  async createOrganization(ownerId: string, data: CreateOrganizationData): Promise<Organization> {
    // Check if organization code already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { code: data.code.toUpperCase() },
    });

    if (existingOrg) {
      throw new ConflictError('Organization code already exists');
    }

    // Verify the owner is a FARM_ADMIN
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { role: true, organizationId: true },
    });

    if (!owner) {
      throw new NotFoundError('Owner not found');
    }

    if (owner.role !== 'FARM_ADMIN') {
      throw new ForbiddenError('Only farm admins can create organizations');
    }

    if (owner.organizationId) {
      throw new BadRequestError('User already belongs to an organization');
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        ...data,
        code: data.code.toUpperCase(),
        ownerId,
      },
    });

    // Update owner's organizationId
    await prisma.user.update({
      where: { id: ownerId },
      data: { organizationId: organization.id },
    });

    return organization;
  }

  async getOrganization(organizationId: string, userId: string): Promise<any> {
    // Verify user belongs to this organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, role: true },
    });

    if (!user || user.organizationId !== organizationId) {
      throw new ForbiddenError('Access denied to this organization');
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            phone: true,
            role: true,
            profile: true,
            status: true,
            createdAt: true,
            lastLogin: true,
          },
        },
        owner: {
          select: {
            id: true,
            email: true,
            phone: true,
            profile: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundError('Organization not found');
    }

    return organization;
  }

  async updateOrganization(
    organizationId: string,
    userId: string,
    data: UpdateOrganizationData
  ): Promise<Organization> {
    // Verify user is the owner of this organization
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { ownerId: true },
    });

    if (!organization) {
      throw new NotFoundError('Organization not found');
    }

    if (organization.ownerId !== userId) {
      throw new ForbiddenError('Only organization owner can update organization details');
    }

    const updatedOrganization = await prisma.organization.update({
      where: { id: organizationId },
      data,
    });

    return updatedOrganization;
  }

  async getOrganizationUsers(organizationId: string, userId: string): Promise<any[]> {
    // Verify user belongs to this organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, role: true },
    });

    if (!user || user.organizationId !== organizationId) {
      throw new ForbiddenError('Access denied to this organization');
    }

    const users = await prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        profile: true,
        status: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }

  async inviteUser(
    organizationId: string,
    inviterId: string,
    userData: {
      email?: string;
      phone?: string;
      role: 'FIELD_MANAGER' | 'FARMER';
      profile: any;
    }
  ): Promise<any> {
    // Verify inviter is the owner of this organization
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { ownerId: true },
    });

    if (!organization) {
      throw new NotFoundError('Organization not found');
    }

    if (organization.ownerId !== inviterId) {
      throw new ForbiddenError('Only organization owner can invite users');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(userData.email ? [{ email: userData.email }] : []),
          ...(userData.phone ? [{ phone: userData.phone }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new ConflictError('User with this email or phone already exists');
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: userData.email?.toLowerCase(),
        phone: userData.phone,
        passwordHash,
        role: userData.role,
        organizationId,
        profile: userData.profile,
        status: 'ACTIVE',
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

    // TODO: Send invitation email/SMS with temporary password
    console.log(`Temporary password for ${userData.email || userData.phone}: ${tempPassword}`);

    return user;
  }

  async removeUser(organizationId: string, ownerId: string, userIdToRemove: string): Promise<void> {
    // Verify requester is the owner of this organization
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { ownerId: true },
    });

    if (!organization) {
      throw new NotFoundError('Organization not found');
    }

    if (organization.ownerId !== ownerId) {
      throw new ForbiddenError('Only organization owner can remove users');
    }

    if (ownerId === userIdToRemove) {
      throw new BadRequestError('Organization owner cannot remove themselves');
    }

    // Verify user belongs to this organization
    const userToRemove = await prisma.user.findUnique({
      where: { id: userIdToRemove },
      select: { organizationId: true },
    });

    if (!userToRemove || userToRemove.organizationId !== organizationId) {
      throw new NotFoundError('User not found in this organization');
    }

    // Remove user from organization
    await prisma.user.update({
      where: { id: userIdToRemove },
      data: { 
        organizationId: null,
        status: 'INACTIVE',
      },
    });
  }

  async getOrganizationStats(organizationId: string, userId: string): Promise<any> {
    // Verify user belongs to this organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, role: true },
    });

    if (!user || user.organizationId !== organizationId) {
      throw new ForbiddenError('Access denied to this organization');
    }

    const [
      totalUsers,
      totalLorries,
      totalFarmers,
      totalDeliveries,
      totalAdvancePayments,
      recentRequests,
    ] = await Promise.all([
      prisma.user.count({ where: { organizationId } }),
      prisma.lorry.count({ where: { organizationId } }),
      prisma.farmerOrganization.count({ where: { organizationId } }),
      prisma.delivery.count({ where: { organizationId } }),
      prisma.advancePayment.count({ where: { organizationId } }),
      prisma.lorryRequest.count({
        where: {
          organizationId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    return {
      totalUsers,
      totalLorries,
      totalFarmers,
      totalDeliveries,
      totalAdvancePayments,
      recentRequests,
    };
  }
}