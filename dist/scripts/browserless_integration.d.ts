#!/usr/bin/env tsx
declare class BrowserlessIntegration {
  private config;
  private client;
  constructor();
  private log;
  setup(): Promise<void>;
  testConnection(): Promise<boolean>;
  getAccountInfo(): Promise<any>;
  takeScreenshot(url: string, options?: any): Promise<any>;
  generatePDF(url: string, options?: any): Promise<any>;
  scrapeContent(url: string, selector?: string): Promise<any>;
  runFunction(code: string, url?: string): Promise<any>;
  validateConfiguration(): Promise<void>;
}
export { BrowserlessIntegration };
//# sourceMappingURL=browserless_integration.d.ts.map
