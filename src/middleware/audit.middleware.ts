import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from './auth.middleware';

export const auditMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Skip audit logging for health checks and non-authenticated routes
  if (req.path === '/health' || req.path.includes('/auth/')) {
    return next();
  }

  // Store original end function
  const originalEnd = res.end;
  const originalJson = res.json;

  let responseBody: any;

  // Capture response data
  res.json = function(body: any) {
    responseBody = body;
    return originalJson.call(this, body);
  };

  // Override end function to log after response
  res.end = function(chunk?: any, encoding?: any) {
    // Log the audit entry after response is sent
    setImmediate(async () => {
      try {
        if (req.user && req.method !== 'GET') {
          await prisma.auditLog.create({
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
      } catch (error) {
        console.error('Audit logging failed:', error);
      }
    });

    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

function extractEntityType(path: string): string {
  const segments = path.split('/').filter(Boolean);
  if (segments.length >= 3) {
    return segments[2]; // e.g., /api/v1/organizations -> organizations
  }
  return 'unknown';
}

function extractEntityId(params: any): string | null {
  // Look for common ID parameter names
  const idFields = ['id', 'organizationId', 'userId', 'lorryId', 'farmerId'];
  
  for (const field of idFields) {
    if (params[field]) {
      return params[field];
    }
  }
  
  return null;
}