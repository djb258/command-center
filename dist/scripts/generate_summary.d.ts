interface SummaryData {
  timestamp: string;
  packageInfo: {
    name: string;
    version: string;
    scripts: Record<string, string>;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  doctrine: {
    lastModified: string;
    sections: string[];
  };
  scripts: {
    total: number;
    categories: Record<string, string[]>;
  };
  husky: {
    hooks: string[];
    lintStaged: Record<string, string[]>;
  };
  machineSync: {
    features: string[];
    scripts: string[];
    configFiles: string[];
  };
  tools: {
    integrated: string[];
    status: Record<string, 'active' | 'configured' | 'missing'>;
  };
  tests: {
    total: number;
    files: string[];
  };
  schemas: {
    total: number;
    files: string[];
  };
}
declare function generateSummary(): SummaryData;
declare function formatSummary(data: SummaryData): string;
export { generateSummary, formatSummary };
//# sourceMappingURL=generate_summary.d.ts.map
