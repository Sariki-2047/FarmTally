"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.invitationService = exports.InvitationService = void 0;
const prisma_1 = require("../lib/prisma");
const crypto = __importStar(require("crypto"));
class InvitationService {
    async createInvitation(data, inviterUserId) {
        const inviter = await prisma_1.prisma.user.findUnique({
            where: { id: inviterUserId },
            include: { organization: true }
        });
        if (!inviter) {
            throw new Error('Inviter not found');
        }
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
        const invitationToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (data.expiresInDays || 7));
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email: data.email.toLowerCase() }
        });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        const invitation = await prisma_1.prisma.invitation.create({
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
        return invitation;
    }
    async validateInvitation(token) {
        const invitation = await prisma_1.prisma.invitation.findFirst({
            where: {
                invitationToken: token,
                isUsed: false,
                expiresAt: { gt: new Date() }
            }
        });
        if (!invitation) {
            throw new Error('Invalid or expired invitation token');
        }
        return invitation;
    }
    async registerWithInvitation(token, userData) {
        const invitation = await this.validateInvitation(token);
        let organization = await prisma_1.prisma.organization.findFirst({
            where: { name: invitation.organizationName }
        });
        if (!organization) {
            organization = await prisma_1.prisma.organization.create({
                data: {
                    name: invitation.organizationName,
                    code: invitation.organizationName.toUpperCase().replace(/\s+/g, '_'),
                    isActive: true
                }
            });
        }
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        const user = await prisma_1.prisma.user.create({
            data: {
                email: invitation.email,
                password: hashedPassword,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: invitation.role,
                organizationId: organization.id,
                isActive: true
            },
            include: { organization: true }
        });
        await prisma_1.prisma.invitation.update({
            where: { id: invitation.id },
            data: {
                isUsed: true,
                usedAt: new Date()
            }
        });
        const jwt = require('jsonwebtoken');
        const authToken = jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production', { expiresIn: '24h' });
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
    async getInvitations(organizationId) {
        const where = {};
        if (organizationId) {
            where.organizationName = {
                in: await prisma_1.prisma.organization.findMany({
                    where: { id: organizationId },
                    select: { name: true }
                }).then(orgs => orgs.map(o => o.name))
            };
        }
        const invitations = await prisma_1.prisma.invitation.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        return invitations;
    }
    async resendInvitation(invitationId) {
        const invitation = await prisma_1.prisma.invitation.findUnique({
            where: { id: invitationId }
        });
        if (!invitation) {
            throw new Error('Invitation not found');
        }
        if (invitation.isUsed) {
            throw new Error('Invitation has already been used');
        }
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + 7);
        const updatedInvitation = await prisma_1.prisma.invitation.update({
            where: { id: invitationId },
            data: {
                expiresAt: newExpiresAt,
                updatedAt: new Date()
            }
        });
        return updatedInvitation;
    }
    async cancelInvitation(invitationId) {
        await prisma_1.prisma.invitation.delete({
            where: { id: invitationId }
        });
    }
    async getFarmAdminWithOrganization(userId) {
        const farmAdmin = await prisma_1.prisma.user.findUnique({
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
    async getFieldManagers(organizationId) {
        const fieldManagers = await prisma_1.prisma.user.findMany({
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
exports.InvitationService = InvitationService;
exports.invitationService = new InvitationService();
//# sourceMappingURL=invitation.service.simple.js.map