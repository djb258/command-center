import { z } from 'zod';
export declare const BartonDoctrineBaseSchema: z.ZodObject<{
    source_id: z.ZodString;
    process_id: z.ZodString;
    validated: z.ZodUnion<[z.ZodBoolean, z.ZodEnum<["pending", "approved", "rejected"]>]>;
    promoted_to: z.ZodOptional<z.ZodString>;
    execution_signature: z.ZodString;
    timestamp_last_touched: z.ZodUnion<[z.ZodDate, z.ZodString]>;
    data_payload: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    source_id: string;
    process_id: string;
    validated: boolean | "pending" | "approved" | "rejected";
    execution_signature: string;
    timestamp_last_touched: string | Date;
    promoted_to?: string | undefined;
    data_payload?: Record<string, unknown> | undefined;
}, {
    source_id: string;
    process_id: string;
    validated: boolean | "pending" | "approved" | "rejected";
    execution_signature: string;
    timestamp_last_touched: string | Date;
    promoted_to?: string | undefined;
    data_payload?: Record<string, unknown> | undefined;
}>;
export type BartonDoctrinePayload = z.infer<typeof BartonDoctrineBaseSchema>;
export interface PayloadFormatOptions {
    agent_id?: string;
    blueprint_id?: string;
    schema_version?: string;
    source_system?: string;
    target_database?: 'firebase' | 'neon' | 'bigquery';
}
export declare class BartonDoctrineFormatter {
    static generateExecutionSignature(agent_id: string, blueprint_id: string, schema_version?: string): string;
    static createBasePayload(source_id: string, process_id: string, data: Record<string, unknown>, options?: PayloadFormatOptions): BartonDoctrinePayload;
    static toSPVPET(payload: BartonDoctrinePayload): Record<string, unknown>;
    static toSTAMPED(payload: BartonDoctrinePayload): Record<string, unknown>;
    static toSTACKED(payload: BartonDoctrinePayload): Record<string, unknown>;
    static formatForDatabase(payload: BartonDoctrinePayload, target: 'firebase' | 'neon' | 'bigquery'): Record<string, unknown>;
    static validate(payload: unknown): BartonDoctrinePayload;
    static fromAnyFormat(data: Record<string, unknown>): BartonDoctrinePayload;
    static createFirebaseDocument(collection: string, payload: BartonDoctrinePayload, ttl_seconds?: number): {
        collection: string;
        document: Record<string, unknown>;
    };
    static createNeonInsert(table: string, payload: BartonDoctrinePayload): {
        sql: string;
        values: unknown[];
    };
    static createBigQueryInsert(dataset: string, table: string, payload: BartonDoctrinePayload): {
        dataset: string;
        table: string;
        rows: Record<string, unknown>[];
    };
}
export declare const SPVPETSchema: z.ZodObject<{
    source_id: z.ZodString;
    process_id: z.ZodString;
    validated: z.ZodUnion<[z.ZodBoolean, z.ZodEnum<["pending", "approved", "rejected"]>]>;
    promoted_to: z.ZodNullable<z.ZodString>;
    execution_signature: z.ZodString;
    timestamp_last_touched: z.ZodString;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    source_id: z.ZodString;
    process_id: z.ZodString;
    validated: z.ZodUnion<[z.ZodBoolean, z.ZodEnum<["pending", "approved", "rejected"]>]>;
    promoted_to: z.ZodNullable<z.ZodString>;
    execution_signature: z.ZodString;
    timestamp_last_touched: z.ZodString;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    source_id: z.ZodString;
    process_id: z.ZodString;
    validated: z.ZodUnion<[z.ZodBoolean, z.ZodEnum<["pending", "approved", "rejected"]>]>;
    promoted_to: z.ZodNullable<z.ZodString>;
    execution_signature: z.ZodString;
    timestamp_last_touched: z.ZodString;
}, z.ZodTypeAny, "passthrough">>;
export declare const STAMPEDSchema: z.ZodObject<{
    source_id: z.ZodString;
    task_id: z.ZodString;
    approved: z.ZodBoolean;
    migrated_to: z.ZodNullable<z.ZodString>;
    process_signature: z.ZodString;
    event_timestamp: z.ZodString;
    data_payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    source_id: string;
    approved: boolean;
    data_payload: Record<string, unknown>;
    task_id: string;
    migrated_to: string | null;
    process_signature: string;
    event_timestamp: string;
}, {
    source_id: string;
    approved: boolean;
    data_payload: Record<string, unknown>;
    task_id: string;
    migrated_to: string | null;
    process_signature: string;
    event_timestamp: string;
}>;
export declare const STACKEDSchema: z.ZodObject<{
    source_id: z.ZodString;
    task_id: z.ZodString;
    analytics_approved: z.ZodBoolean;
    consolidated_from: z.ZodNullable<z.ZodString>;
    knowledge_signature: z.ZodString;
    event_timestamp: z.ZodString;
    data_payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    source_id: string;
    data_payload: Record<string, unknown>;
    task_id: string;
    event_timestamp: string;
    analytics_approved: boolean;
    consolidated_from: string | null;
    knowledge_signature: string;
}, {
    source_id: string;
    data_payload: Record<string, unknown>;
    task_id: string;
    event_timestamp: string;
    analytics_approved: boolean;
    consolidated_from: string | null;
    knowledge_signature: string;
}>;
//# sourceMappingURL=barton-doctrine-formatter.d.ts.map