#!/usr/bin/env tsx
declare class AutoBackupSystem {
  private projectRoot;
  private backupInterval;
  private lastBackupFile;
  private log;
  private runCommand;
  checkForChanges(): Promise<boolean>;
  commitAndPush(message?: string): Promise<boolean>;
  private generateCommitMessage;
  startAutoBackup(): Promise<void>;
  backupOnFileChange(): Promise<void>;
  manualBackup(message?: string): Promise<void>;
  getLastBackupTime(): string | null;
  status(): Promise<void>;
}
export { AutoBackupSystem };
//# sourceMappingURL=auto_backup.d.ts.map
