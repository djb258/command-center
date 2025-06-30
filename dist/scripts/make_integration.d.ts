import { z } from 'zod';
export declare const MakeConfigSchema: z.ZodObject<
  {
    apiKey: z.ZodString;
    baseUrl: z.ZodDefault<z.ZodString>;
    timeout: z.ZodDefault<z.ZodNumber>;
    retryAttempts: z.ZodDefault<z.ZodNumber>;
  },
  'strip',
  z.ZodTypeAny,
  {
    timeout: number;
    apiKey: string;
    baseUrl: string;
    retryAttempts: number;
  },
  {
    apiKey: string;
    timeout?: number | undefined;
    baseUrl?: string | undefined;
    retryAttempts?: number | undefined;
  }
>;
export type MakeConfig = z.infer<typeof MakeConfigSchema>;
export declare const MakeScenarioSchema: z.ZodObject<
  {
    id: z.ZodNumber;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<['active', 'inactive', 'draft', 'error']>;
    flow: z.ZodOptional<
      z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, 'many'>
    >;
    connections: z.ZodOptional<
      z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, 'many'>
    >;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
  },
  'strip',
  z.ZodTypeAny,
  {
    status: 'error' | 'active' | 'inactive' | 'draft';
    created_at: Date;
    id: number;
    name: string;
    updated_at: Date;
    description?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    flow?: Record<string, unknown>[] | undefined;
    connections?: Record<string, unknown>[] | undefined;
  },
  {
    status: 'error' | 'active' | 'inactive' | 'draft';
    created_at: Date;
    id: number;
    name: string;
    updated_at: Date;
    description?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    flow?: Record<string, unknown>[] | undefined;
    connections?: Record<string, unknown>[] | undefined;
  }
>;
export type MakeScenario = z.infer<typeof MakeScenarioSchema>;
export declare const MakeExecutionSchema: z.ZodObject<
  {
    id: z.ZodNumber;
    scenario_id: z.ZodNumber;
    status: z.ZodEnum<
      ['pending', 'running', 'completed', 'failed', 'cancelled']
    >;
    input_data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    output_data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    error_message: z.ZodOptional<z.ZodString>;
    started_at: z.ZodOptional<z.ZodDate>;
    completed_at: z.ZodOptional<z.ZodDate>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
  },
  'strip',
  z.ZodTypeAny,
  {
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    created_at: Date;
    id: number;
    updated_at: Date;
    scenario_id: number;
    started_at?: Date | undefined;
    completed_at?: Date | undefined;
    error_message?: string | undefined;
    input_data?: Record<string, unknown> | undefined;
    output_data?: Record<string, unknown> | undefined;
  },
  {
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    created_at: Date;
    id: number;
    updated_at: Date;
    scenario_id: number;
    started_at?: Date | undefined;
    completed_at?: Date | undefined;
    error_message?: string | undefined;
    input_data?: Record<string, unknown> | undefined;
    output_data?: Record<string, unknown> | undefined;
  }
>;
export type MakeExecution = z.infer<typeof MakeExecutionSchema>;
export declare const MakeConnectionSchema: z.ZodObject<
  {
    id: z.ZodNumber;
    name: z.ZodString;
    type: z.ZodEnum<['webhook', 'api', 'database', 'file', 'email', 'custom']>;
    status: z.ZodEnum<['active', 'inactive', 'error']>;
    config: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
  },
  'strip',
  z.ZodTypeAny,
  {
    status: 'error' | 'active' | 'inactive';
    type: 'custom' | 'webhook' | 'api' | 'database' | 'file' | 'email';
    created_at: Date;
    config: Record<string, unknown>;
    id: number;
    name: string;
    updated_at: Date;
    metadata?: Record<string, unknown> | undefined;
  },
  {
    status: 'error' | 'active' | 'inactive';
    type: 'custom' | 'webhook' | 'api' | 'database' | 'file' | 'email';
    created_at: Date;
    config: Record<string, unknown>;
    id: number;
    name: string;
    updated_at: Date;
    metadata?: Record<string, unknown> | undefined;
  }
>;
export type MakeConnection = z.infer<typeof MakeConnectionSchema>;
export declare const MakeBlueprintIntegrationSchema: z.ZodObject<
  {
    id: z.ZodString;
    blueprint_id: z.ZodString;
    scenario_id: z.ZodNumber;
    integration_type: z.ZodEnum<
      ['validation', 'processing', 'monitoring', 'automation']
    >;
    config: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    status: z.ZodEnum<['active', 'inactive', 'error']>;
    last_execution: z.ZodOptional<z.ZodDate>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
  },
  'strip',
  z.ZodTypeAny,
  {
    status: 'error' | 'active' | 'inactive';
    created_at: Date;
    blueprint_id: string;
    config: Record<string, unknown>;
    id: string;
    updated_at: Date;
    integration_type: 'validation' | 'automation' | 'monitoring' | 'processing';
    scenario_id: number;
    last_execution?: Date | undefined;
  },
  {
    status: 'error' | 'active' | 'inactive';
    created_at: Date;
    blueprint_id: string;
    config: Record<string, unknown>;
    id: string;
    updated_at: Date;
    integration_type: 'validation' | 'automation' | 'monitoring' | 'processing';
    scenario_id: number;
    last_execution?: Date | undefined;
  }
>;
export type MakeBlueprintIntegration = z.infer<
  typeof MakeBlueprintIntegrationSchema
>;
export declare class MakeIntegration {
  private config;
  private client;
  constructor(config: MakeConfig);
  createScenario(
    scenarioData: Omit<MakeScenario, 'id' | 'created_at' | 'updated_at'>
  ): Promise<MakeScenario>;
  getScenarios(): Promise<MakeScenario[]>;
  getScenario(scenarioId: number): Promise<MakeScenario>;
  executeScenario(
    scenarioId: number,
    inputData?: Record<string, unknown>
  ): Promise<MakeExecution>;
  getExecutionStatus(executionId: number): Promise<MakeExecution>;
  getScenarioExecutions(scenarioId: number): Promise<MakeExecution[]>;
  createConnection(
    connectionData: Omit<MakeConnection, 'id' | 'created_at' | 'updated_at'>
  ): Promise<MakeConnection>;
  getConnections(): Promise<MakeConnection[]>;
  processBlueprintWithMake(
    blueprintData: unknown,
    scenarioId: number
  ): Promise<{
    success: boolean;
    executionId: number;
    output?: Record<string, unknown>;
    error?: string;
  }>;
  setupBlueprintAutomation(
    blueprintId: string,
    scenarioId: number,
    config: Record<string, unknown>
  ): Promise<MakeBlueprintIntegration>;
  createBlueprintIntegration(
    integrationData: Omit<
      MakeBlueprintIntegration,
      'id' | 'created_at' | 'updated_at'
    >
  ): Promise<MakeBlueprintIntegration>;
  createWebhook(webhookData: {
    name: string;
    url: string;
    events: string[];
    headers?: Record<string, string>;
  }): Promise<{
    id: number;
    url: string;
    secret: string;
  }>;
  healthCheck(): Promise<{
    status: string;
    timestamp: string;
    version?: string;
  }>;
  getScenarioMetrics(scenarioId: number): Promise<{
    total_executions: number;
    successful_executions: number;
    failed_executions: number;
    average_duration: number;
    last_execution: Date | null;
  }>;
  updateScenarioStatus(
    scenarioId: number,
    status: 'active' | 'inactive' | 'draft'
  ): Promise<MakeScenario>;
  deleteScenario(scenarioId: number): Promise<{
    success: boolean;
  }>;
}
export declare const validateMakeConfig: (data: unknown) => MakeConfig;
export declare const validateMakeScenario: (data: unknown) => MakeScenario;
export declare const validateMakeExecution: (data: unknown) => MakeExecution;
export declare const validateMakeConnection: (data: unknown) => MakeConnection;
export declare const validateMakeBlueprintIntegration: (
  data: unknown
) => MakeBlueprintIntegration;
//# sourceMappingURL=make_integration.d.ts.map
