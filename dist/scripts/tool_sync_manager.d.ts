import { z } from 'zod';
export declare const ToolSyncConfigSchema: z.ZodObject<
  {
    tools: z.ZodArray<
      z.ZodObject<
        {
          name: z.ZodEnum<
            [
              'mindpal',
              'deerflow',
              'render',
              'make',
              'firebase',
              'bigquery',
              'neon',
            ]
          >;
          enabled: z.ZodDefault<z.ZodBoolean>;
          configFiles: z.ZodArray<z.ZodString, 'many'>;
          envVars: z.ZodArray<z.ZodString, 'many'>;
          dependencies: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
        },
        'strip',
        z.ZodTypeAny,
        {
          name:
            | 'firebase'
            | 'neon'
            | 'bigquery'
            | 'deerflow'
            | 'mindpal'
            | 'render'
            | 'make';
          enabled: boolean;
          configFiles: string[];
          envVars: string[];
          dependencies: string[];
        },
        {
          name:
            | 'firebase'
            | 'neon'
            | 'bigquery'
            | 'deerflow'
            | 'mindpal'
            | 'render'
            | 'make';
          configFiles: string[];
          envVars: string[];
          enabled?: boolean | undefined;
          dependencies?: string[] | undefined;
        }
      >,
      'many'
    >;
    syncOptions: z.ZodObject<
      {
        backupBeforeSync: z.ZodDefault<z.ZodBoolean>;
        validateAfterSync: z.ZodDefault<z.ZodBoolean>;
        installDependencies: z.ZodDefault<z.ZodBoolean>;
        updateEnvFile: z.ZodDefault<z.ZodBoolean>;
      },
      'strip',
      z.ZodTypeAny,
      {
        backupBeforeSync: boolean;
        validateAfterSync: boolean;
        installDependencies: boolean;
        updateEnvFile: boolean;
      },
      {
        backupBeforeSync?: boolean | undefined;
        validateAfterSync?: boolean | undefined;
        installDependencies?: boolean | undefined;
        updateEnvFile?: boolean | undefined;
      }
    >;
    targetMachines: z.ZodArray<
      z.ZodObject<
        {
          name: z.ZodString;
          type: z.ZodEnum<['local', 'remote']>;
          host: z.ZodOptional<z.ZodString>;
          user: z.ZodOptional<z.ZodString>;
          projectPath: z.ZodString;
        },
        'strip',
        z.ZodTypeAny,
        {
          type: 'local' | 'remote';
          name: string;
          projectPath: string;
          user?: string | undefined;
          host?: string | undefined;
        },
        {
          type: 'local' | 'remote';
          name: string;
          projectPath: string;
          user?: string | undefined;
          host?: string | undefined;
        }
      >,
      'many'
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    tools: {
      name:
        | 'firebase'
        | 'neon'
        | 'bigquery'
        | 'deerflow'
        | 'mindpal'
        | 'render'
        | 'make';
      enabled: boolean;
      configFiles: string[];
      envVars: string[];
      dependencies: string[];
    }[];
    syncOptions: {
      backupBeforeSync: boolean;
      validateAfterSync: boolean;
      installDependencies: boolean;
      updateEnvFile: boolean;
    };
    targetMachines: {
      type: 'local' | 'remote';
      name: string;
      projectPath: string;
      user?: string | undefined;
      host?: string | undefined;
    }[];
  },
  {
    tools: {
      name:
        | 'firebase'
        | 'neon'
        | 'bigquery'
        | 'deerflow'
        | 'mindpal'
        | 'render'
        | 'make';
      configFiles: string[];
      envVars: string[];
      enabled?: boolean | undefined;
      dependencies?: string[] | undefined;
    }[];
    syncOptions: {
      backupBeforeSync?: boolean | undefined;
      validateAfterSync?: boolean | undefined;
      installDependencies?: boolean | undefined;
      updateEnvFile?: boolean | undefined;
    };
    targetMachines: {
      type: 'local' | 'remote';
      name: string;
      projectPath: string;
      user?: string | undefined;
      host?: string | undefined;
    }[];
  }
>;
export type ToolSyncConfig = z.infer<typeof ToolSyncConfigSchema>;
export declare class ToolSyncManager {
  private config;
  private syncLog;
  constructor(config: ToolSyncConfig);
  syncAllTools(): Promise<{
    success: boolean;
    results: Record<
      string,
      Record<
        string,
        {
          success: boolean;
          errors: string[];
        }
      >
    >;
    summary: string;
  }>;
  private syncTool;
  private backupToolConfig;
  private syncConfigFile;
  private updateEnvFile;
  private installDependencies;
  private validateToolSync;
  private validateToolSpecific;
  private validateMindPalConfig;
  private validateDeerFlowConfig;
  private validateRenderConfig;
  private validateMakeConfig;
  private validateFirebaseConfig;
  private validateBigQueryConfig;
  private validateNeonConfig;
  private log;
  getSyncLog(): string[];
  static generateConfigTemplate(): ToolSyncConfig;
}
//# sourceMappingURL=tool_sync_manager.d.ts.map
