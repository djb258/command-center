export declare class BartonDoctrineMiddleware {
    private static instance;
    private toolName;
    constructor(toolName: string);
    static forTool(toolName: string): BartonDoctrineMiddleware;
    validateForFirebase(payload: unknown): Record<string, unknown>;
    validateForNeon(payload: unknown): Record<string, unknown>;
    validateForBigQuery(payload: unknown): Record<string, unknown>;
    createPayload(sourceId: string, processId: string, dataPayload: Record<string, unknown>, metadata?: {
        agent_id?: string;
        blueprint_id?: string;
        schema_version?: string;
    }): {
        source_id: string;
        process_id: string;
        validated: boolean | "pending" | "approved" | "rejected";
        execution_signature: string;
        timestamp_last_touched: string | Date;
        promoted_to?: string | undefined;
        data_payload?: Record<string, unknown> | undefined;
    };
    validate(payload: unknown, operation?: string): {
        source_id: string;
        process_id: string;
        validated: boolean | "pending" | "approved" | "rejected";
        execution_signature: string;
        timestamp_last_touched: string | Date;
        promoted_to?: string | undefined;
        data_payload?: Record<string, unknown> | undefined;
    };
}
export declare function withBartonDoctrine(toolName: string): BartonDoctrineMiddleware;
export declare const DatabaseOperations: {
    firebase: (toolName: string) => {
        save: (payload: unknown) => Record<string, unknown>;
        saveToCollection: (collection: string, payload: unknown) => Record<string, unknown>;
    };
    neon: (toolName: string) => {
        insert: (table: string, payload: unknown) => Record<string, unknown>;
        update: (table: string, payload: unknown, whereClause: string) => Record<string, unknown>;
    };
    bigquery: (toolName: string) => {
        insert: (dataset: string, table: string, payload: unknown) => Record<string, unknown>;
        stream: (dataset: string, table: string, payloads: unknown[]) => Record<string, unknown>[];
    };
};
//# sourceMappingURL=barton-doctrine-middleware.d.ts.map