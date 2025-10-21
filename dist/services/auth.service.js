"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const database_1 = require("../config/database");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const error_middleware_1 = require("../middleware/error.middleware");
const emailService_1 = __importDefault(require("./emailService"));
class AuthService {
    emailService;
    constructor() {
        this.emailService = new emailService_1.default();
    }
    async register(data) {
        if (!data.email && !data.phone) {
            throw new error_middleware_1.BadRequestError('Either email or phone number is required');
        }
        const existingUser = await database_1.prisma.user.findFirst({
            where: {
                OR: [
                    ...(data.email ? [{ email: data.email }] : []),
                    ...(data.phone ? [{ phone: data.phone }] : []),
                ],
            },
        });
        if (existingUser) {
            throw new error_middleware_1.ConflictError('User with this email or phone already exists');
        }
        if (data.role !== 'FARM_ADMIN' && data.organizationId) {
            const organization = await database_1.prisma.organization.findUnique({
                where: { id: data.organizationId },
            });
            if (!organization) {
                throw new error_middleware_1.NotFoundError('Organization not found');
            }
        }
        const passwordHash = await password_1.PasswordService.hash(data.password);
        const status = data.role === 'APPLICATION_ADMIN' ? 'APPROVED' : 'PENDING';
        const user = await database_1.prisma.user.create({
            data: {
                email: data.email?.toLowerCase(),
                phone: data.phone,
                passwordHash,
                role: data.role,
                organizationId: data.organizationId,
                profile: data.profile,
                status,
            },
            select: {
                id: true,
                email: true,
                phone: true,
                role: true,
                organizationId: true,
                profile: true,
                status: true,
                createdAt: true,
            },
        });
        const tokenPayload = {
            userId: user.id,
            email: user.email || undefined,
            phone: user.phone || undefined,
            role: user.role,
            organizationId: user.organizationId || undefined,
        };
        let tokens = null;
        if (status === 'APPROVED') {
            tokens = jwt_1.jwtService.generateTokenPair(tokenPayload);
            await jwt_1.jwtService.storeRefreshToken(user.id, tokens.refreshToken);
        }
        if (process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true') {
            try {
                if (status === 'PENDING') {
                    if (user.email) {
                        await this.sendRegistrationPendingEmail(user.email, {
                            userName: `${data.profile.firstName} ${data.profile.lastName}`,
                            role: data.role,
                        });
                    }
                    await this.notifySystemAdminsOfNewRegistration({
                        userName: `${data.profile.firstName} ${data.profile.lastName}`,
                        email: user.email,
                        phone: user.phone,
                        role: data.role,
                        userId: user.id,
                    });
                }
            }
            catch (error) {
                console.error('Failed to send registration notification emails:', error);
            }
        }
        return {
            user,
            tokens: tokens || { accessToken: '', refreshToken: '' },
            message: status === 'PENDING' ? 'Registration successful. Please wait for admin approval.' : undefined
        };
    }
    async login(data) {
        if (!data.email && !data.phone) {
            throw new error_middleware_1.BadRequestError('Either email or phone number is required');
        }
        const user = await database_1.prisma.user.findFirst({
            where: {
                OR: [
                    ...(data.email ? [{ email: data.email.toLowerCase() }] : []),
                    ...(data.phone ? [{ phone: data.phone }] : []),
                ],
            },
            select: {
                id: true,
                email: true,
                phone: true,
                passwordHash: true,
                role: true,
                organizationId: true,
                profile: true,
                status: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new error_middleware_1.UnauthorizedError('Invalid credentials');
        }
        if (user.status === 'PENDING') {
            throw new error_middleware_1.UnauthorizedError('Account is pending approval. Please wait for admin approval.');
        }
        if (user.status === 'REJECTED') {
            throw new error_middleware_1.UnauthorizedError('Account registration was rejected. Please contact support.');
        }
        if (user.status === 'SUSPENDED') {
            throw new error_middleware_1.UnauthorizedError('Account is suspended. Please contact support.');
        }
        if (user.status !== 'APPROVED') {
            throw new error_middleware_1.UnauthorizedError('Account is not active');
        }
        const isPasswordValid = await password_1.PasswordService.verify(data.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new error_middleware_1.UnauthorizedError('Invalid credentials');
        }
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });
        const tokenPayload = {
            userId: user.id,
            email: user.email || undefined,
            phone: user.phone || undefined,
            role: user.role,
            organizationId: user.organizationId || undefined,
        };
        const tokens = jwt_1.jwtService.generateTokenPair(tokenPayload);
        await jwt_1.jwtService.storeRefreshToken(user.id, tokens.refreshToken);
        const { passwordHash, ...userResponse } = user;
        return { user: userResponse, tokens };
    }
    async refreshToken(refreshToken) {
        try {
            const decoded = jwt_1.jwtService.verifyRefreshToken(refreshToken);
            const storedToken = await jwt_1.jwtService.getStoredRefreshToken(decoded.userId);
            if (!storedToken || storedToken !== refreshToken) {
                throw new error_middleware_1.UnauthorizedError('Invalid refresh token');
            }
            const user = await database_1.prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    phone: true,
                    role: true,
                    organizationId: true,
                    status: true,
                },
            });
            if (!user || user.status !== 'APPROVED') {
                throw new error_middleware_1.UnauthorizedError('User not found or not approved');
            }
            const tokenPayload = {
                userId: user.id,
                email: user.email || undefined,
                phone: user.phone || undefined,
                role: user.role,
                organizationId: user.organizationId || undefined,
            };
            const tokens = jwt_1.jwtService.generateTokenPair(tokenPayload);
            await jwt_1.jwtService.storeRefreshToken(user.id, tokens.refreshToken);
            return tokens;
        }
        catch (error) {
            throw new error_middleware_1.UnauthorizedError('Invalid refresh token');
        }
    }
    async logout(userId, accessToken) {
        await jwt_1.jwtService.revokeRefreshToken(userId);
        await jwt_1.jwtService.blacklistToken(accessToken);
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { passwordHash: true },
        });
        if (!user) {
            throw new error_middleware_1.NotFoundError('User not found');
        }
        const isCurrentPasswordValid = await password_1.PasswordService.verify(currentPassword, user.passwordHash);
        if (!isCurrentPasswordValid) {
            throw new error_middleware_1.UnauthorizedError('Current password is incorrect');
        }
        const validation = password_1.PasswordService.validate(newPassword);
        if (!validation.isValid) {
            throw new error_middleware_1.BadRequestError(`Password validation failed: ${validation.errors.join(', ')}`);
        }
        const newPasswordHash = await password_1.PasswordService.hash(newPassword);
        await database_1.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
        });
        await jwt_1.jwtService.revokeRefreshToken(userId);
    }
    async getUserProfile(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                phone: true,
                role: true,
                organizationId: true,
                profile: true,
                status: true,
                createdAt: true,
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
            throw new error_middleware_1.NotFoundError('User not found');
        }
        return user;
    }
    async updateProfile(userId, profileData) {
        const user = await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                profile: profileData,
            },
            select: {
                id: true,
                email: true,
                phone: true,
                role: true,
                organizationId: true,
                profile: true,
                status: true,
                createdAt: true,
            },
        });
        return user;
    }
    async sendRegistrationPendingEmail(email, details) {
        return await this.emailService.sendEmail({
            to: email,
            subject: '📋 FarmTally Registration - Pending Approval',
            html: this.generateRegistrationPendingTemplate(details),
            text: `Thank you for registering with FarmTally. Your ${details.role} account is pending admin approval.`,
        });
    }
    async notifySystemAdminsOfNewRegistration(details) {
        const systemAdmins = await database_1.prisma.user.findMany({
            where: {
                role: 'APPLICATION_ADMIN',
                status: 'APPROVED',
                email: { not: null },
            },
            select: { email: true },
        });
        const adminEmails = systemAdmins
            .map(admin => admin.email)
            .filter(email => email);
        if (adminEmails.length > 0) {
            await this.emailService.sendEmail({
                to: adminEmails,
                subject: '🔔 New User Registration - Approval Required',
                html: this.generateNewRegistrationNotificationTemplate(details),
                text: `New ${details.role} registration from ${details.userName} requires approval.`,
            });
        }
    }
    generateRegistrationPendingTemplate(details) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { padding: 20px; background-color: #f9f9f9; border-radius: 0 0 5px 5px; }
          .pending { background-color: #FFF3E0; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #FF9800; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Registration Received</h1>
          </div>
          <div class="content">
            <p>Dear ${details.userName},</p>
            
            <p>Thank you for registering with FarmTally! We have received your registration request.</p>
            
            <div class="pending">
              <h4>⏳ Pending Approval</h4>
              <p>Your <strong>${details.role}</strong> account is currently pending approval from our system administrator.</p>
              <p>You will receive an email notification once your account has been reviewed and approved.</p>
            </div>
            
            <h4>What happens next?</h4>
            <ul>
              <li>Our admin team will review your registration</li>
              <li>You'll receive an email once approved</li>
              <li>You can then log in and start using FarmTally</li>
              <li>Contact support if you have any questions</li>
            </ul>
            
            <p>We appreciate your patience and look forward to welcoming you to the FarmTally community!</p>
            
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
    generateNewRegistrationNotificationTemplate(details) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2E7D32; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { padding: 20px; background-color: #f9f9f9; border-radius: 0 0 5px 5px; }
          .user-details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #2E7D32; }
          .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
          .reject-button { background-color: #f44336; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New User Registration</h1>
          </div>
          <div class="content">
            <p>Hello System Administrator,</p>
            
            <p>A new user has registered and requires approval to access FarmTally.</p>
            
            <div class="user-details">
              <h4>Registration Details:</h4>
              <p><strong>Name:</strong> ${details.userName}</p>
              <p><strong>Role:</strong> ${details.role}</p>
              <p><strong>Email:</strong> ${details.email || 'Not provided'}</p>
              <p><strong>Phone:</strong> ${details.phone || 'Not provided'}</p>
              <p><strong>User ID:</strong> ${details.userId}</p>
              <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://app.farmtally.in'}/admin/users" class="button">Review User</a>
            </div>
            
            <p>Please review this registration and take appropriate action through the system admin dashboard.</p>
            
            <p>Best regards,<br>FarmTally System</p>
          </div>
          
          <div class="footer">
            <p>This is an automated notification from FarmTally.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map