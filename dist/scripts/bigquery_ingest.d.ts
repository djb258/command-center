import { BigQueryBlueprint } from '../src/schemas/blueprint-schemas';
interface IngestOptions {
    tableId: string;
    data: BigQueryBlueprint[];
    schema?: object[];
    createDisposition?: string;
    writeDisposition?: string;
}
export declare class BigQueryIngest {
    private bigquery;
    private config;
    constructor();
    ingestData(options: IngestOptions): Promise<void>;
    createTable(tableId: string, schema: object[]): Promise<void>;
    queryData(query: string): Promise<BigQueryBlueprint[]>;
}
export {};
//# sourceMappingURL=bigquery_ingest.d.ts.map