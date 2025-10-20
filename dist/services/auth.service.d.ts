import { TokenPair } from '../utils/jwt';
import { UserRole, UserStatus } from '@prisma/client';
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
export declare class AuthService {
    register(data: RegisterData): Promise<{
        user: UserResponse;
        tokens: TokenPair;
    }>;
    login(data: LoginData): Promise<{
        user: UserResponse;
        tokens: TokenPair;
    }>;
    refreshToken(refreshToken: string): Promise<TokenPair>;
    logout(userId: string, accessToken: string): Promise<void>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    getUserProfile(userId: string): Promise<UserResponse>;
    updateProfile(userId: string, profileData: any): Promise<UserResponse>;
}
//# sourceMappingURL=auth.service.d.ts.map