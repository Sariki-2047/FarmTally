import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}
export declare const errorHandler: (err: AppError | Error, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare class AppErrorClass extends Error implements AppError {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean);
}
export declare class NotFoundError extends AppErrorClass {
    constructor(message?: string);
}
export declare class BadRequestError extends AppErrorClass {
    constructor(message?: string);
}
export declare class UnauthorizedError extends AppErrorClass {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppErrorClass {
    constructor(message?: string);
}
export declare class ConflictError extends AppErrorClass {
    constructor(message?: string);
}
//# sourceMappingURL=error.middleware.d.ts.map