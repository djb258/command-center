#!/usr/bin/env tsx
declare class BartonDoctrineValidator {
  private toolsToValidate;
  constructor();
  validateAll(): Promise<void>;
  private validateToolIntegrations;
  private analyzeToolForViolations;
  private validateSchemaTemplates;
  private generateValidationReport;
  enableStrictMode(): void;
  generateReport(): void;
}
export { BartonDoctrineValidator };
//# sourceMappingURL=barton_doctrine_validator.d.ts.map
