#!/usr/bin/env tsx
interface Reminder {
  id: string;
  type: 'api_key' | 'tool' | 'config' | 'env_var';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  created: Date;
  completed: boolean;
  autoBackup: boolean;
}
declare class PriorityReminders {
  private remindersFile;
  private backup;
  private log;
  private loadReminders;
  private saveReminders;
  addReminder(
    type: Reminder['type'],
    title: string,
    description: string,
    priority?: Reminder['priority'],
    autoBackup?: boolean
  ): Promise<void>;
  completeReminder(id: string): Promise<void>;
  showReminders(): void;
  checkEnvironmentChanges(): Promise<void>;
  suggestNewToolReminders(): Promise<void>;
  cleanupCompleted(): Promise<void>;
  urgentCheck(): Promise<void>;
}
export { PriorityReminders };
//# sourceMappingURL=priority_reminders.d.ts.map
