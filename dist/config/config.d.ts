export declare const config: {
    env: string;
    port: number;
    database: {
        url: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    cors: {
        allowedOrigins: string[];
    };
    bcrypt: {
        saltRounds: number;
    };
    upload: {
        maxFileSize: number;
        allowedTypes: string[];
    };
    rateLimit: {
        windowMs: number;
        max: number;
    };
};
//# sourceMappingURL=config.d.ts.map