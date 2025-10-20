"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
class JWTService {
    accessTokenSecret;
    refreshTokenSecret;
    accessTokenExpiry;
    refreshTokenExpiry;
    constructor() {
        this.accessTokenSecret = process.env.JWT_SECRET;
        this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
        this.accessTokenExpiry = process.env.JWT_EXPIRES_IN || '15m';
        this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
        if (!this.accessTokenSecret || !this.refreshTokenSecret) {
            throw new Error('JWT secrets not configured');
        }
    }
    generateTokenPair(payload) {
        const accessToken = jsonwebtoken_1.default.sign(payload, this.accessTokenSecret, {
            expiresIn: this.accessTokenExpiry,
        });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: payload.userId }, this.refreshTokenSecret, { expiresIn: this.refreshTokenExpiry });
        return { accessToken, refreshToken };
    }
    verifyAccessToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.accessTokenSecret);
        }
        catch (error) {
            throw new Error('Invalid access token');
        }
    }
    verifyRefreshToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.refreshTokenSecret);
        }
        catch (error) {
            throw new Error('Invalid refresh token');
        }
    }
    async storeRefreshToken(userId, refreshToken) {
        const key = `refresh_token:${userId}`;
        await database_1.redis.setEx(key, 7 * 24 * 60 * 60, refreshToken);
    }
    async getStoredRefreshToken(userId) {
        const key = `refresh_token:${userId}`;
        return await database_1.redis.get(key);
    }
    async revokeRefreshToken(userId) {
        const key = `refresh_token:${userId}`;
        await database_1.redis.del(key);
    }
    async blacklistToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.decode(token);
            if (decoded && decoded.exp) {
                const ttl = decoded.exp - Math.floor(Date.now() / 1000);
                if (ttl > 0) {
                    await database_1.redis.setEx(`blacklist:${token}`, ttl, 'true');
                }
            }
        }
        catch (error) {
            console.error('Error blacklisting token:', error);
        }
    }
    async isTokenBlacklisted(token) {
        const result = await database_1.redis.get(`blacklist:${token}`);
        return result === 'true';
    }
}
exports.jwtService = new JWTService();
//# sourceMappingURL=jwt.js.map