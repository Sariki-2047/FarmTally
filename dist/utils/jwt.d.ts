export interface JWTPayload {
    userId: string;
    email?: string;
    phone?: string;
    role: string;
    organizationId?: string;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
declare class JWTService {
    private readonly accessTokenSecret;
    private readonly refreshTokenSecret;
    private readonly accessTokenExpiry;
    private readonly refreshTokenExpiry;
    constructor();
    generateTokenPair(payload: JWTPayload): TokenPair;
    verifyAccessToken(token: string): JWTPayload;
    verifyRefreshToken(token: string): {
        userId: string;
    };
    storeRefreshToken(userId: string, refreshToken: string): Promise<void>;
    getStoredRefreshToken(userId: string): Promise<string | null>;
    revokeRefreshToken(userId: string): Promise<void>;
    blacklistToken(token: string): Promise<void>;
    isTokenBlacklisted(token: string): Promise<boolean>;
}
export declare const jwtService: JWTService;
export {};
//# sourceMappingURL=jwt.d.ts.map