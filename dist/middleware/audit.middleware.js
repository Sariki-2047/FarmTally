"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditMiddleware = void 0;
const database_1 = require("../config/database");
const auditMiddleware = async (req, res, next) => {
    if (req.path === '/health' || req.path.includes('/auth/')) {
        return next();
    }
    const originalEnd = res.end;
    const originalJson = res.json;
    let responseBody;
    res.json = function (body) {
        responseBody = body;
        return originalJson.call(this, body);
    };
    res.end = function (chunk, encoding) {
        setImmediate(async () => {
            try {
                if (req.user && req.method !== 'GET') {
                    await database_1.prisma.auditLog.create({
                        data: {
                            userId: req.user.id,
                            organizationId: req.user.organizationId || null,
                            action: `${req.method} ${req.path}`,
                            entityType: extractEntityType(req.path),
                            entityId: extractEntityId(req.params),
                            oldValues: req.method === 'PUT' || req.method === 'PATCH' ? req.body : null,
                            newValues: responseBody?.data || null,
                            ipAddress: req.ip,
                            userAgent: req.get('User-Agent') || null,
                        },
                    });
                }
            }
            catch (error) {
                console.error('Audit logging failed:', error);
            }
        });
        return originalEnd.call(this, chunk, encoding);
    };
    next();
};
exports.auditMiddleware = auditMiddleware;
function extractEntityType(path) {
    const segments = path.split('/').filter(Boolean);
    if (segments.length >= 3) {
        return segments[2];
    }
    return 'unknown';
}
function extractEntityId(params) {
    const idFields = ['id', 'organizationId', 'userId', 'lorryId', 'farmerId'];
    for (const field of idFields) {
        if (params[field]) {
            return params[field];
        }
    }
    return null;
}
//# sourceMappingURL=audit.middleware.js.map