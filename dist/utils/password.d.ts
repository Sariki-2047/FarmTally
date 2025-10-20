export declare class PasswordService {
    private static readonly SALT_ROUNDS;
    static hash(password: string): Promise<string>;
    static verify(password: string, hash: string): Promise<boolean>;
    static validate(password: string): {
        isValid: boolean;
        errors: string[];
    };
    static generate(length?: number): string;
}
//# sourceMappingURL=password.d.ts.map