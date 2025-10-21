import { prisma } from '../config/database';
import { PasswordService } from '../utils/password';
import { jwtService, JWTPayload, TokenPair } from '../utils/jwt';
import { NotFoundError, BadRequestError, UnauthorizedError, ConflictError } from '../middleware/error.middleware';
import { UserRole, UserStatus } from '@prisma/client';
import EmailService from './emailService';

export interface RegisterData {
  email?: string;
  phone?: string;
  password: string;
  role: UserRole;
  organizationId?: string;
  profile: {
    firstName: string;
    lastName: string;
    address?: string;
    idNumber?: string;
  };
}

export interface LoginData {
  email?: string;
  phone?: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email?: string | null;
  phone?: string | null;
  role: UserRole;
  organizationId?: string | null;
  profile: any;
  status: UserStatus;
  createdAt: Date;
}

export class AuthService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async register(data: RegisterData): Promise<{ user: UserResponse; tokens: TokenPair }> {
    // Validate that either email or phone is provided
    if (!data.email && !data.phone) {
      throw new BadRequestError('Either email or phone number is required');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(data.email ? [{ email: data.email }] : []),
          ...(data.phone ? [{ phone: data.phone }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new ConflictError('User with this email or phone already exists');
    }

    // For non-admin roles, verify organization exists
    if (data.role !== 'FARM_ADMIN' && data.organizationId) {
      const organization = await prisma.organization.findUnique({
        where: { id: data.organizationId },
      });

      if (!organization) {
        throw new NotFoundError('Organization not found');
      }
    }

    // Hash password
    const passwordHash = await PasswordService.hash(data.password);

    // Create user with appropriate status
    // APPLICATION_ADMIN is auto-approved, others are pending
    const status = data.role === 'APPLICATION_ADMIN' ? 'APPROVED' : 'PENDING';
    
    const user = await prisma.user.create({
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

    // Generate tokens
    const tokenPayload: JWTPayload = {
      userId: user.id,
      email: user.email || undefined,
      phone: user.phone || undefined,
      role: user.role,
      organizationId: user.organizationId || undefined,
    };

    // Only generate tokens for approved users
    let tokens: TokenPair | null = null;
    if (status === 'APPROVED') {
      tokens = jwtService.generateTokenPair(tokenPayload);
      await jwtService.storeRefreshToken(user.id, tokens.refreshToken);
    }

    // Send notification emails
    if (process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true') {
      try {
        if (status === 'PENDING') {
          // Notify user about pending approval
          if (user.email) {
            await this.sendRegistrationPendingEmail(user.email, {
              userName: `${data.profile.firstName} ${data.profile.lastName}`,
              role: data.role,
            });
          }

          // Notify system admins about new registration
          await this.notifySystemAdminsOfNewRegistration({
            userName: `${data.profile.firstName} ${data.profile.lastName}`,
            email: user.email,
            phone: user.phone,
            role: data.role,
            userId: user.id,
          });
        }
      } catch (error) {
        console.error('Failed to send registration notification emails:', error);
        // Don't fail registration if email fails
      }
    }

    return { 
      user, 
      tokens: tokens || { accessToken: '', refreshToken: '' },
      message: status === 'PENDING' ? 'Registration successful. Please wait for admin approval.' : undefined
    };
  }

  async login(data: LoginData): Promise<{ user: UserResponse; tokens: TokenPair }> {
    // Validate that either email or phone is provided
    if (!data.email && !data.phone) {
      throw new BadRequestError('Either email or phone number is required');
    }

    // Find user
    const user = await prisma.user.findFirst({
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
      throw new UnauthorizedError('Invalid credentials');
    }

    if (user.status === 'PENDING') {
      throw new UnauthorizedError('Account is pending approval. Please wait for admin approval.');
    }

    if (user.status === 'REJECTED') {
      throw new UnauthorizedError('Account registration was rejected. Please contact support.');
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedError('Account is suspended. Please contact support.');
    }

    if (user.status !== 'APPROVED') {
      throw new UnauthorizedError('Account is not active');
    }

    // Verify password
    const isPasswordValid = await PasswordService.verify(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate tokens
    const tokenPayload: JWTPayload = {
      userId: user.id,
      email: user.email || undefined,
      phone: user.phone || undefined,
      role: user.role,
      organizationId: user.organizationId || undefined,
    };

    const tokens = jwtService.generateTokenPair(tokenPayload);
    await jwtService.storeRefreshToken(user.id, tokens.refreshToken);

    // Remove password hash from response
    const { passwordHash, ...userResponse } = user;

    return { user: userResponse, tokens };
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      const decoded = jwtService.verifyRefreshToken(refreshToken);
      
      // Check if stored refresh token matches
      const storedToken = await jwtService.getStoredRefreshToken(decoded.userId);
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Get user data
      const user = await prisma.user.findUnique({
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
        throw new UnauthorizedError('User not found or not approved');
      }

      // Generate new tokens
      const tokenPayload: JWTPayload = {
        userId: user.id,
        email: user.email || undefined,
        phone: user.phone || undefined,
        role: user.role,
        organizationId: user.organizationId || undefined,
      };

      const tokens = jwtService.generateTokenPair(tokenPayload);
      await jwtService.storeRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async logout(userId: string, accessToken: string): Promise<void> {
    // Revoke refresh token
    await jwtService.revokeRefreshToken(userId);
    
    // Blacklist access token
    await jwtService.blacklistToken(accessToken);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await PasswordService.verify(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Validate new password
    const validation = PasswordService.validate(newPassword);
    if (!validation.isValid) {
      throw new BadRequestError(`Password validation failed: ${validation.errors.join(', ')}`);
    }

    // Hash and update new password
    const newPasswordHash = await PasswordService.hash(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Revoke all existing tokens to force re-login
    await jwtService.revokeRefreshToken(userId);
  }

  async getUserProfile(userId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
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
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, profileData: any): Promise<UserResponse> {
    const user = await prisma.user.update({
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

  /**
   * Send registration pending email to user
   */
  private async sendRegistrationPendingEmail(
    email: string,
    details: { userName: string; role: string }
  ): Promise<boolean> {
    return await this.emailService.sendEmail({
      to: email,
      subject: '📋 FarmTally Registration - Pending Approval',
      html: this.generateRegistrationPendingTemplate(details),
      text: `Thank you for registering with FarmTally. Your ${details.role} account is pending admin approval.`,
    });
  }

  /**
   * Notify system admins of new registration
   */
  private async notifySystemAdminsOfNewRegistration(details: {
    userName: string;
    email?: string | null;
    phone?: string | null;
    role: string;
    userId: string;
  }): Promise<void> {
    // Get all system admins
    const systemAdmins = await prisma.user.findMany({
      where: {
        role: 'APPLICATION_ADMIN',
        status: 'APPROVED',
        email: { not: null },
      },
      select: { email: true },
    });

    const adminEmails = systemAdmins
      .map(admin => admin.email)
      .filter(email => email) as string[];

    if (adminEmails.length > 0) {
      await this.emailService.sendEmail({
        to: adminEmails,
        subject: '🔔 New User Registration - Approval Required',
        html: this.generateNewRegistrationNotificationTemplate(details),
        text: `New ${details.role} registration from ${details.userName} requires approval.`,
      });
    }
  }

  /**
   * Generate registration pending email template
   */
  private generateRegistrationPendingTemplate(details: any): string {
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

  /**
   * Generate new registration notification template for admins
   */
  private generateNewRegistrationNotificationTemplate(details: any): string {
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