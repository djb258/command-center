import { z } from 'zod';
export declare const MachineSyncConfigSchema: z.ZodObject<
  {
    machines: z.ZodArray<
      z.ZodObject<
        {
          name: z.ZodString;
          type: z.ZodEnum<['local', 'remote', 'cloud']>;
          host: z.ZodOptional<z.ZodString>;
          user: z.ZodOptional<z.ZodString>;
          sshKey: z.ZodOptional<z.ZodString>;
          syncPaths: z.ZodArray<z.ZodString, 'many'>;
          tools: z.ZodArray<
            z.ZodEnum<
              [
                'cursor',
                'mindpal',
                'deerflow',
                'render',
                'make',
                'firebase',
                'bigquery',
                'neon',
              ]
            >,
            'many'
          >;
        },
        'strip',
        z.ZodTypeAny,
        {
          type: 'local' | 'remote' | 'cloud';
          tools: (
            | 'firebase'
            | 'neon'
            | 'bigquery'
            | 'deerflow'
            | 'mindpal'
            | 'render'
            | 'make'
            | 'cursor'
          )[];
          name: string;
          syncPaths: string[];
          user?: string | undefined;
          host?: string | undefined;
          sshKey?: string | undefined;
        },
        {
          type: 'local' | 'remote' | 'cloud';
          tools: (
            | 'firebase'
            | 'neon'
            | 'bigquery'
            | 'deerflow'
            | 'mindpal'
            | 'render'
            | 'make'
            | 'cursor'
          )[];
          name: string;
          syncPaths: string[];
          user?: string | undefined;
          host?: string | undefined;
          sshKey?: string | undefined;
        }
      >,
      'many'
    >;
    cursorConfig: z.ZodObject<
      {
        settingsPath: z.ZodString;
        extensionsPath: z.ZodString;
        keybindingsPath: z.ZodString;
        snippetsPath: z.ZodString;
        workspacePath: z.ZodString;
      },
      'strip',
      z.ZodTypeAny,
      {
        settingsPath: string;
        extensionsPath: string;
        keybindingsPath: string;
        snippetsPath: string;
        workspacePath: string;
      },
      {
        settingsPath: string;
        extensionsPath: string;
        keybindingsPath: string;
        snippetsPath: string;
        workspacePath: string;
      }
    >;
    toolsConfig: z.ZodObject<
      {
        envTemplatePath: z.ZodString;
        packageJsonPath: z.ZodString;
        doctrinePath: z.ZodString;
        schemasPath: z.ZodString;
      },
      'strip',
      z.ZodTypeAny,
      {
        envTemplatePath: string;
        packageJsonPath: string;
        doctrinePath: string;
        schemasPath: string;
      },
      {
        envTemplatePath: string;
        packageJsonPath: string;
        doctrinePath: string;
        schemasPath: string;
      }
    >;
    syncOptions: z.ZodObject<
      {
        backupBeforeSync: z.ZodDefault<z.ZodBoolean>;
        validateAfterSync: z.ZodDefault<z.ZodBoolean>;
        notifyOnCompletion: z.ZodDefault<z.ZodBoolean>;
      },
      'strip',
      z.ZodTypeAny,
      {
        backupBeforeSync: boolean;
        validateAfterSync: boolean;
        notifyOnCompletion: boolean;
      },
      {
        backupBeforeSync?: boolean | undefined;
        validateAfterSync?: boolean | undefined;
        notifyOnCompletion?: boolean | undefined;
      }
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    machines: {
      type: 'local' | 'remote' | 'cloud';
      tools: (
        | 'firebase'
        | 'neon'
        | 'bigquery'
        | 'deerflow'
        | 'mindpal'
        | 'render'
        | 'make'
        | 'cursor'
      )[];
      name: string;
      syncPaths: string[];
      user?: string | undefined;
      host?: string | undefined;
      sshKey?: string | undefined;
    }[];
    cursorConfig: {
      settingsPath: string;
      extensionsPath: string;
      keybindingsPath: string;
      snippetsPath: string;
      workspacePath: string;
    };
    toolsConfig: {
      envTemplatePath: string;
      packageJsonPath: string;
      doctrinePath: string;
      schemasPath: string;
    };
    syncOptions: {
      backupBeforeSync: boolean;
      validateAfterSync: boolean;
      notifyOnCompletion: boolean;
    };
  },
  {
    machines: {
      type: 'local' | 'remote' | 'cloud';
      tools: (
        | 'firebase'
        | 'neon'
        | 'bigquery'
        | 'deerflow'
        | 'mindpal'
        | 'render'
        | 'make'
        | 'cursor'
      )[];
      name: string;
      syncPaths: string[];
      user?: string | undefined;
      host?: string | undefined;
      sshKey?: string | undefined;
    }[];
    cursorConfig: {
      settingsPath: string;
      extensionsPath: string;
      keybindingsPath: string;
      snippetsPath: string;
      workspacePath: string;
    };
    toolsConfig: {
      envTemplatePath: string;
      packageJsonPath: string;
      doctrinePath: string;
      schemasPath: string;
    };
    syncOptions: {
      backupBeforeSync?: boolean | undefined;
      validateAfterSync?: boolean | undefined;
      notifyOnCompletion?: boolean | undefined;
    };
  }
>;
export type MachineSyncConfig = z.infer<typeof MachineSyncConfigSchema>;
export declare class MachineSynchronizer {
  private config;
  private syncLog;
  constructor(config: MachineSyncConfig);
  syncAllMachines(): Promise<{
    success: boolean;
    results: Record<
      string,
      {
        success: boolean;
        errors: string[];
      }
    >;
    summary: string;
  }>;
  private syncMachine;
  private backupMachineConfig;
  private syncCursorConfig;
  private syncCursorExtensions;
  private syncToolConfig;
  private syncFile;
  private copyDirectory;
  private validateMachineSync;
  private validateEnvironmentConfig;
  private getRequiredEnvVars;
  private sendNotification;
  private log;
  getSyncLog(): string[];
  static generateConfigTemplate(): MachineSyncConfig;
}
//# sourceMappingURL=sync_all_machines.d.ts.map
