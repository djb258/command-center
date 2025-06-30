import { z } from 'zod';
export declare const CursorConfigSchema: z.ZodObject<
  {
    settings: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    keybindings: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, 'many'>;
    extensions: z.ZodArray<z.ZodString, 'many'>;
    snippets: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    workspaceSettings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    settings: Record<string, unknown>;
    keybindings: Record<string, unknown>[];
    extensions: string[];
    snippets: Record<string, unknown>;
    workspaceSettings?: Record<string, unknown> | undefined;
  },
  {
    settings: Record<string, unknown>;
    keybindings: Record<string, unknown>[];
    extensions: string[];
    snippets: Record<string, unknown>;
    workspaceSettings?: Record<string, unknown> | undefined;
  }
>;
export type CursorConfig = z.infer<typeof CursorConfigSchema>;
export declare class CursorConfigSynchronizer {
  private cursorPaths;
  constructor();
  exportConfig(outputDir?: string): Promise<{
    success: boolean;
    exportedFiles: string[];
    errors: string[];
  }>;
  importConfig(configDir?: string): Promise<{
    success: boolean;
    importedFiles: string[];
    errors: string[];
  }>;
  private getInstalledExtensions;
  private installExtensions;
  private copyDirectory;
  validateConfig(): Promise<{
    isValid: boolean;
    issues: string[];
    config: CursorConfig | null;
  }>;
  private hasNestedProperty;
  private loadSnippets;
  getCursorPaths(): typeof this.cursorPaths;
}
//# sourceMappingURL=cursor_config_sync.d.ts.map
