import { NeonBlueprint } from '../src/schemas/blueprint-schemas';
interface SyncOptions {
    table: string;
    data: NeonBlueprint[];
    upsert?: boolean;
    conflictColumns?: string[];
}
export declare class NeonSync {
    private pool;
    private config;
    constructor();
    syncData(options: SyncOptions): Promise<void>;
    private insertRecord;
    private upsertRecord;
    queryData(query: string, params?: unknown[]): Promise<NeonBlueprint[]>;
    createTable(tableName: string, schema: string): Promise<void>;
    close(): Promise<void>;
}
export {};
//# sourceMappingURL=neon_sync.d.ts.map