import { z } from 'zod';
export declare const DeerFlowConfigSchema: z.ZodObject<
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
export type DeerFlowConfig = z.infer<typeof DeerFlowConfigSchema>;
export declare const DeerFlowWorkflowSchema: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<['active', 'inactive', 'draft', 'archived']>;
    type: z.ZodEnum<
      ['data_pipeline', 'automation', 'integration', 'monitoring']
    >;
    triggers: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
    steps: z.ZodOptional<
      z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, 'many'>
    >;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
  },
  'strip',
  z.ZodTypeAny,
  {
    status: 'active' | 'inactive' | 'draft' | 'archived';
    type: 'data_pipeline' | 'automation' | 'integration' | 'monitoring';
    created_at: Date;
    id: string;
    name: string;
    updated_at: Date;
    description?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    triggers?: string[] | undefined;
    steps?: Record<string, unknown>[] | undefined;
  },
  {
    status: 'active' | 'inactive' | 'draft' | 'archived';
    type: 'data_pipeline' | 'automation' | 'integration' | 'monitoring';
    created_at: Date;
    id: string;
    name: string;
    updated_at: Date;
    description?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    triggers?: string[] | undefined;
    steps?: Record<string, unknown>[] | undefined;
  }
>;
export type DeerFlowWorkflow = z.infer<typeof DeerFlowWorkflowSchema>;
export declare const DeerFlowExecutionSchema: z.ZodObject<
  {
    id: z.ZodString;
    workflow_id: z.ZodString;
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
    id: string;
    updated_at: Date;
    workflow_id: string;
    started_at?: Date | undefined;
    completed_at?: Date | undefined;
    error_message?: string | undefined;
    input_data?: Record<string, unknown> | undefined;
    output_data?: Record<string, unknown> | undefined;
  },
  {
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    created_at: Date;
    id: string;
    updated_at: Date;
    workflow_id: string;
    started_at?: Date | undefined;
    completed_at?: Date | undefined;
    error_message?: string | undefined;
    input_data?: Record<string, unknown> | undefined;
    output_data?: Record<string, unknown> | undefined;
  }
>;
export type DeerFlowExecution = z.infer<typeof DeerFlowExecutionSchema>;
export declare const DeerFlowBlueprintIntegrationSchema: z.ZodObject<
  {
    id: z.ZodString;
    blueprint_id: z.ZodString;
    workflow_id: z.ZodString;
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
    workflow_id: string;
    integration_type: 'validation' | 'automation' | 'monitoring' | 'processing';
    last_execution?: Date | undefined;
  },
  {
    status: 'error' | 'active' | 'inactive';
    created_at: Date;
    blueprint_id: string;
    config: Record<string, unknown>;
    id: string;
    updated_at: Date;
    workflow_id: string;
    integration_type: 'validation' | 'automation' | 'monitoring' | 'processing';
    last_execution?: Date | undefined;
  }
>;
export type DeerFlowBlueprintIntegration = z.infer<
  typeof DeerFlowBlueprintIntegrationSchema
>;
export declare class DeerFlowIntegration {
  private config;
  private client;
  constructor(config: DeerFlowConfig);
  createWorkflow(
    workflowData: Omit<DeerFlowWorkflow, 'id' | 'created_at' | 'updated_at'>
  ): Promise<DeerFlowWorkflow>;
  getWorkflows(): Promise<DeerFlowWorkflow[]>;
  getWorkflow(workflowId: string): Promise<DeerFlowWorkflow>;
  executeWorkflow(
    workflowId: string,
    inputData?: Record<string, unknown>
  ): Promise<DeerFlowExecution>;
  getExecutionStatus(executionId: string): Promise<DeerFlowExecution>;
  createBlueprintIntegration(
    integrationData: Omit<
      DeerFlowBlueprintIntegration,
      'id' | 'created_at' | 'updated_at'
    >
  ): Promise<DeerFlowBlueprintIntegration>;
  processBlueprintWithDeerFlow(
    blueprintData: unknown,
    workflowId: string
  ): Promise<{
    success: boolean;
    executionId: string;
    output?: Record<string, unknown>;
    error?: string;
  }>;
  setupBlueprintAutomation(
    blueprintId: string,
    workflowId: string,
    config: Record<string, unknown>
  ): Promise<DeerFlowBlueprintIntegration>;
  healthCheck(): Promise<{
    status: string;
    timestamp: string;
    version?: string;
  }>;
  getWorkflowMetrics(workflowId: string): Promise<{
    total_executions: number;
    successful_executions: number;
    failed_executions: number;
    average_duration: number;
    last_execution: Date | null;
  }>;
}
export declare const validateDeerFlowConfig: (data: unknown) => DeerFlowConfig;
export declare const validateDeerFlowWorkflow: (
  data: unknown
) => DeerFlowWorkflow;
export declare const validateDeerFlowExecution: (
  data: unknown
) => DeerFlowExecution;
export declare const validateDeerFlowBlueprintIntegration: (
  data: unknown
) => DeerFlowBlueprintIntegration;
//# sourceMappingURL=deerflow_integration.d.ts.map
