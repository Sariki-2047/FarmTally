"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const redis_1 = require("redis");
const prisma = new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});
exports.prisma = prisma;
const redis = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});
exports.redis = redis;
redis.on('error', (err) => {
    console.error('Redis Client Error:', err);
});
redis.on('connect', () => {
    console.log('✅ Connected to Redis');
});
redis.connect().catch(console.error);
//# sourceMappingURL=database.js.map