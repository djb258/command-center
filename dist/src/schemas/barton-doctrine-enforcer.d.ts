import { BartonDoctrinePayload } from './barton-doctrine-formatter';
export declare class BartonDoctrineEnforcer {
    private static instance;
    private violations;
    private enforcementEnabled;
    private strictMode;
    private constructor();
    static getInstance(): BartonDoctrineEnforcer;
    validatePayload(payload: unknown, toolName: string, operation?: string): BartonDoctrinePayload;
    interceptDatabaseOperation(operation: 'firebase' | 'neon' | 'bigquery', payload: unknown, toolName: string): Record<string, unknown>;
    private setupGlobalEnforcement;
    private logValidation;
    private logViolation;
    private saveValidationLog;
    private saveViolationReport;
    private attemptPayloadRepair;
    private sanitizePayload;
    setEnforcementEnabled(enabled: boolean): void;
    setStrictMode(strict: boolean): void;
    getViolationSummary(): {
        total: number;
        byTool: Record<string, number>;
        recent: any[];
    };
}
export declare class BartonDoctrineViolationError extends Error {
    readonly violation: any;
    constructor(message: string, violation: any);
}
export declare const GlobalBartonDoctrineEnforcer: BartonDoctrineEnforcer;
export declare const BartonDoctrine: {
    validate: (payload: unknown, toolName: string, operation?: string) => BartonDoctrinePayload;
    formatFor: (payload: unknown, database: "firebase" | "neon" | "bigquery", toolName: string) => Record<string, unknown>;
    setEnabled: (enabled: boolean) => void;
    setStrict: (strict: boolean) => void;
    getViolations: () => {
        total: number;
        byTool: Record<string, number>;
        recent: any[];
    };
};
//# sourceMappingURL=barton-doctrine-enforcer.d.ts.map