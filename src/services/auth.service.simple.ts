import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { config } from '../config/config';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'FARM_ADMIN' | 'FIELD_MANAGER' | 'FARMER';
  organizationName?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status?: string;
  organization: {
    id: string;
    name: string;
  };
}

export class AuthService {
  async login(data: LoginData): Promise<{ token: string; user: UserResponse }> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { organization: true }
    });

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    // Check if Farm Admin account is approved
    if (user.role === 'FARM_ADMIN' && (user as any).status !== 'APPROVED') {
      const statusMessage = (user as any).status === 'PENDING' 
        ? 'Your Farm Admin account is pending approval by the application administrator.'
        : (user as any).status === 'REJECTED'
        ? 'Your Farm Admin account has been rejected. Please contact support.'
        : 'Your account is not active. Please contact support.';
      
      throw new Error(statusMessage);
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = (jwt as any).sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: (user as any).status,
        organization: {
          id: user.organization.id,
          name: user.organization.name
        }
      }
    };
  }

  async register(data: RegisterData): Promise<{ message: string; user: UserResponse }> {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, config.bcrypt.saltRounds);

    // Create organization if it doesn't exist (for Farm Admin)
    let organization = await prisma.organization.findFirst({
      where: { name: data.organizationName || 'Default Organization' }
    });

    if (!organization) {
      organization = await prisma.organization.create({
        data: { 
          name: data.organizationName || 'Default Organization',
          code: (data.organizationName || 'DEFAULT').toUpperCase().replace(/\s+/g, '_'),
          isActive: true
        }
      });
    }

    // Determine initial status based on role
    let initialStatus = 'APPROVED'; // Default for Field Managers and Farmers
    let message = 'Account created successfully';

    if (data.role === 'FARM_ADMIN') {
      initialStatus = 'PENDING';
      message = 'Farm Admin account created successfully. Your account is pending approval by the application administrator.';
    }

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        status: initialStatus as any,
        organizationId: organization.id
      },
      include: { organization: true }
    });

    return {
      message,
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
      }
    };
  }

  async getCurrentUser(userId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: (user as any).status,
      organization: {
        id: user.organization.id,
        name: user.organization.name
      }
    };
  }
}

export const authService = new AuthService();