export declare class MandatoryBartonDoctrine {
  private static initialized;
  private static toolName;
  private constructor();
  static initializeTool(toolName: string): MandatoryBartonDoctrine;
  createPayload(
    sourceId: string,
    processId: string,
    data: Record<string, unknown>,
    metadata?: {
      blueprint_id?: string;
      schema_version?: string;
    }
  ): {
    source_id: string;
    process_id: string;
    validated: boolean | 'pending' | 'approved' | 'rejected';
    execution_signature: string;
    timestamp_last_touched: string | Date;
    promoted_to?: string | undefined;
    data_payload?: Record<string, unknown> | undefined;
  };
  saveToFirebase(
    payload: unknown,
    collection?: string
  ): Record<string, unknown>;
  saveToNeon(payload: unknown, table?: string): Record<string, unknown>;
  saveToBigQuery(
    payload: unknown,
    dataset?: string,
    table?: string
  ): Record<string, unknown>;
  validate(
    payload: unknown,
    operation?: string
  ): {
    source_id: string;
    process_id: string;
    validated: boolean | 'pending' | 'approved' | 'rejected';
    execution_signature: string;
    timestamp_last_touched: string | Date;
    promoted_to?: string | undefined;
    data_payload?: Record<string, unknown> | undefined;
  };
  private enforceInitialization;
  getToolName(): string;
}
export declare function warnDirectDatabaseAccess(operation: string): void;
export declare const BARTON_DOCTRINE: {
  init: (toolName: string) => MandatoryBartonDoctrine;
  create: (instance: MandatoryBartonDoctrine) => {
    payload: (
      sourceId: string,
      processId: string,
      data: Record<string, unknown>,
      metadata?: any
    ) => {
      source_id: string;
      process_id: string;
      validated: boolean | 'pending' | 'approved' | 'rejected';
      execution_signature: string;
      timestamp_last_touched: string | Date;
      promoted_to?: string | undefined;
      data_payload?: Record<string, unknown> | undefined;
    };
    firebase: (
      payload: unknown,
      collection?: string
    ) => Record<string, unknown>;
    neon: (payload: unknown, table?: string) => Record<string, unknown>;
    bigquery: (
      payload: unknown,
      dataset?: string,
      table?: string
    ) => Record<string, unknown>;
    validate: (
      payload: unknown,
      operation?: string
    ) => {
      source_id: string;
      process_id: string;
      validated: boolean | 'pending' | 'approved' | 'rejected';
      execution_signature: string;
      timestamp_last_touched: string | Date;
      promoted_to?: string | undefined;
      data_payload?: Record<string, unknown> | undefined;
    };
  };
};
export declare function START_WITH_BARTON_DOCTRINE(toolName: string): {
  createPayload: (
    sourceId: string,
    processId: string,
    data: Record<string, unknown>,
    metadata?: any
  ) => {
    source_id: string;
    process_id: string;
    validated: boolean | 'pending' | 'approved' | 'rejected';
    execution_signature: string;
    timestamp_last_touched: string | Date;
    promoted_to?: string | undefined;
    data_payload?: Record<string, unknown> | undefined;
  };
  saveToFirebase: (
    payload: unknown,
    collection?: string
  ) => Record<string, unknown>;
  saveToNeon: (payload: unknown, table?: string) => Record<string, unknown>;
  saveToBigQuery: (
    payload: unknown,
    dataset?: string,
    table?: string
  ) => Record<string, unknown>;
  validate: (
    payload: unknown,
    operation?: string
  ) => {
    source_id: string;
    process_id: string;
    validated: boolean | 'pending' | 'approved' | 'rejected';
    execution_signature: string;
    timestamp_last_touched: string | Date;
    promoted_to?: string | undefined;
    data_payload?: Record<string, unknown> | undefined;
  };
  getToolName: () => string;
  __doctrine: MandatoryBartonDoctrine;
};
export declare const MANDATORY_TOOL_TEMPLATE =
  "\n// MANDATORY: Every tool MUST start with this line\nimport { START_WITH_BARTON_DOCTRINE } from '../core/mandatory-barton-doctrine';\n\n// MANDATORY: Initialize Barton Doctrine (cannot be skipped)\nconst doctrine = START_WITH_BARTON_DOCTRINE('YOUR_TOOL_NAME');\n\n// MANDATORY: Use only these methods\nclass YourTool {\n  async processData(data: any) {\n    // STEP 1: Create compliant payload (MANDATORY)\n    const payload = doctrine.createPayload(\n      'your_source',\n      'your_process', \n      data\n    );\n    \n    // STEP 2: Save to database (automatically enforced)\n    const firebaseResult = doctrine.saveToFirebase(payload, 'collection_name');\n    const neonResult = doctrine.saveToNeon(payload, 'table_name');\n    const bigqueryResult = doctrine.saveToBigQuery(payload, 'dataset', 'table');\n    \n    return { firebaseResult, neonResult, bigqueryResult };\n  }\n}\n\nexport { YourTool };\n";
//# sourceMappingURL=mandatory-barton-doctrine.d.ts.map
