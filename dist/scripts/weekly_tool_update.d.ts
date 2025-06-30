#!/usr/bin/env tsx
declare class WeeklyToolUpdater {
  private results;
  private logFile;
  constructor();
  private ensureLogDirectory;
  private log;
  private runCommand;
  private updateWingetTools;
  private updateNodeTools;
  private updatePythonTools;
  private cleanupSystem;
  private generateReport;
  runWeeklyUpdate(): Promise<void>;
}
export { WeeklyToolUpdater };
//# sourceMappingURL=weekly_tool_update.d.ts.map
