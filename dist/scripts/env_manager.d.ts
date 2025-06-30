#!/usr/bin/env tsx
declare class EnvironmentManager {
  private projectRoot;
  private envPath;
  private templatePath;
  private envVariables;
  private log;
  setupEnvironment(): Promise<void>;
  validateEnvironment(): Promise<void>;
  listEnvironmentVariables(): Promise<void>;
  generateSecrets(): Promise<void>;
  private createBasicEnvFile;
  private ensureGitignore;
  private parseEnvFile;
  private checkCommonIssues;
  private generateRandomString;
}
export { EnvironmentManager };
//# sourceMappingURL=env_manager.d.ts.map
