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
export declare class AuthService {
    login(data: LoginData): Promise<{
        token: string;
        user: UserResponse;
    }>;
    register(data: RegisterData): Promise<{
        message: string;
        user: UserResponse;
    }>;
    getCurrentUser(userId: string): Promise<UserResponse>;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.simple.d.ts.map