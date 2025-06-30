#!/usr/bin/env tsx
declare class RTRVRIntegration {
  private config;
  private client;
  constructor();
  private log;
  setup(): Promise<void>;
  testConnection(): Promise<boolean>;
  getAccountInfo(): Promise<any>;
  listIndexes(): Promise<any[]>;
  createIndex(name: string, description?: string): Promise<any>;
  addDocument(indexId: string, document: any): Promise<any>;
  search(query: string, indexId?: string, options?: any): Promise<any>;
  askQuestion(
    question: string,
    indexId?: string,
    context?: string
  ): Promise<any>;
  validateConfiguration(): Promise<void>;
  saveSearchHistory(query: string, results: any): Promise<void>;
  saveSearchWithBartonDoctrine(
    query: string,
    results: any,
    targetDatabase?: 'firebase' | 'neon' | 'bigquery'
  ): Promise<void>;
}
export { RTRVRIntegration };
//# sourceMappingURL=rtrvr_integration.d.ts.map
