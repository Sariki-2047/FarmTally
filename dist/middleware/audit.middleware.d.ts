import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
export declare const auditMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=audit.middleware.d.ts.map