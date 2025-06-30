#!/usr/bin/env tsx
declare class ApifyIntegration {
  private config;
  private client;
  constructor();
  private log;
  setup(): Promise<void>;
  testConnection(): Promise<boolean>;
  getUserInfo(): Promise<any>;
  listActors(): Promise<any[]>;
  runActor(actorId: string, input: any): Promise<any>;
  getRunStatus(runId: string): Promise<any>;
  getDataset(datasetId: string): Promise<any[]>;
  validateConfiguration(): Promise<void>;
}
export { ApifyIntegration };
//# sourceMappingURL=apify_integration.d.ts.map
