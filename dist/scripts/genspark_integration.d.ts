#!/usr/bin/env tsx
declare class GensparkIntegration {
  private config;
  private client;
  constructor();
  private log;
  setup(): Promise<void>;
  testConnection(): Promise<boolean>;
  validateConfiguration(): Promise<void>;
}
export { GensparkIntegration };
//# sourceMappingURL=genspark_integration.d.ts.map
