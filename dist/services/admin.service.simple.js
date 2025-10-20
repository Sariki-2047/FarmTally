"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = exports.AdminService = void 0;
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
class AdminService {
    async getPendingFarmAdmins() {
        const pendingAdmins = await prisma_1.prisma.user.findMany({
            where: {
                role: client_1.UserRole.FARM_ADMIN,
                status: client_1.UserStatus.PENDING
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
    async reviewFarmAdminRegistration(data, reviewerId) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: data.userId },
            include: { organization: true }
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (user.role !== client_1.UserRole.FARM_ADMIN) {
            throw new Error('Only Farm Admin accounts can be reviewed');
        }
        if (user.status !== client_1.UserStatus.PENDING) {
            throw new Error('User account is not pending review');
        }
        const updateData = {
            updatedAt: new Date()
        };
        let message = '';
        if (data.approved) {
            updateData.status = client_1.UserStatus.APPROVED;
            updateData.approvedAt = new Date();
            updateData.approvedBy = reviewerId;
            message = 'Farm Admin account approved successfully';
        }
        else {
            updateData.status = client_1.UserStatus.REJECTED;
            updateData.rejectedAt = new Date();
            updateData.rejectedBy = reviewerId;
            updateData.rejectionReason = data.rejectionReason || 'No reason provided';
            message = 'Farm Admin account rejected';
        }
        const updatedUser = await prisma_1.prisma.user.update({
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
    async getAllFarmAdmins() {
        const farmAdmins = await prisma_1.prisma.user.findMany({
            where: {
                role: client_1.UserRole.FARM_ADMIN
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
    async getSystemStats() {
        const [totalOrganizations, totalFarmAdmins, pendingApprovals, totalFieldManagers, totalFarmers, totalDeliveries, totalAdvancePayments] = await Promise.all([
            prisma_1.prisma.organization.count({ where: { isActive: true } }),
            prisma_1.prisma.user.count({ where: { role: client_1.UserRole.FARM_ADMIN, status: client_1.UserStatus.APPROVED } }),
            prisma_1.prisma.user.count({ where: { role: client_1.UserRole.FARM_ADMIN, status: client_1.UserStatus.PENDING } }),
            prisma_1.prisma.user.count({ where: { role: client_1.UserRole.FIELD_MANAGER, isActive: true } }),
            prisma_1.prisma.farmer.count({ where: { isActive: true } }),
            prisma_1.prisma.delivery.count(),
            prisma_1.prisma.advancePayment.count()
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
    async createApplicationAdmin(data) {
        const existingAdmin = await prisma_1.prisma.user.findFirst({
            where: { role: client_1.UserRole.APPLICATION_ADMIN }
        });
        if (existingAdmin) {
            throw new Error('Application Admin already exists');
        }
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            throw new Error('User already exists');
        }
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(data.password, 12);
        let systemOrg = await prisma_1.prisma.organization.findFirst({
            where: { name: 'FarmTally System' }
        });
        if (!systemOrg) {
            systemOrg = await prisma_1.prisma.organization.create({
                data: {
                    name: 'FarmTally System',
                    code: 'SYSTEM',
                    isActive: true
                }
            });
        }
        const user = await prisma_1.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                role: client_1.UserRole.APPLICATION_ADMIN,
                status: client_1.UserStatus.APPROVED,
                organizationId: systemOrg.id,
                approvedAt: new Date()
            },
            include: { organization: true }
        });
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production', { expiresIn: '24h' });
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
    async canInviteFieldManagers(userId) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            include: { organization: true }
        });
        return user?.role === client_1.UserRole.FARM_ADMIN &&
            user?.status === client_1.UserStatus.APPROVED &&
            user?.organization?.isActive === true;
    }
}
exports.AdminService = AdminService;
exports.adminService = new AdminService();
//# sourceMappingURL=admin.service.simple.js.map