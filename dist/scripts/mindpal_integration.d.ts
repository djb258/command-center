import { z } from 'zod';
export declare const MindPalConfigSchema: z.ZodObject<
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
export type MindPalConfig = z.infer<typeof MindPalConfigSchema>;
export declare const MindPalAgentSchema: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<
      ['blueprint_validator', 'data_processor', 'automation_agent']
    >;
    status: z.ZodEnum<['active', 'inactive', 'training', 'error']>;
    capabilities: z.ZodArray<z.ZodString, 'many'>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
  },
  'strip',
  z.ZodTypeAny,
  {
    status: 'error' | 'active' | 'inactive' | 'training';
    type: 'blueprint_validator' | 'data_processor' | 'automation_agent';
    created_at: Date;
    id: string;
    name: string;
    updated_at: Date;
    capabilities: string[];
    metadata?: Record<string, unknown> | undefined;
  },
  {
    status: 'error' | 'active' | 'inactive' | 'training';
    type: 'blueprint_validator' | 'data_processor' | 'automation_agent';
    created_at: Date;
    id: string;
    name: string;
    updated_at: Date;
    capabilities: string[];
    metadata?: Record<string, unknown> | undefined;
  }
>;
export type MindPalAgent = z.infer<typeof MindPalAgentSchema>;
export declare const MindPalTaskSchema: z.ZodObject<
  {
    id: z.ZodString;
    agent_id: z.ZodString;
    blueprint_id: z.ZodString;
    task_type: z.ZodEnum<['validate', 'process', 'automate', 'analyze']>;
    payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    status: z.ZodEnum<['pending', 'running', 'completed', 'failed']>;
    result: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    error_message: z.ZodOptional<z.ZodString>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
    completed_at: z.ZodOptional<z.ZodDate>;
  },
  'strip',
  z.ZodTypeAny,
  {
    status: 'pending' | 'running' | 'completed' | 'failed';
    created_at: Date;
    agent_id: string;
    blueprint_id: string;
    id: string;
    updated_at: Date;
    task_type: 'validate' | 'process' | 'automate' | 'analyze';
    payload: Record<string, unknown>;
    result?: Record<string, unknown> | undefined;
    completed_at?: Date | undefined;
    error_message?: string | undefined;
  },
  {
    status: 'pending' | 'running' | 'completed' | 'failed';
    created_at: Date;
    agent_id: string;
    blueprint_id: string;
    id: string;
    updated_at: Date;
    task_type: 'validate' | 'process' | 'automate' | 'analyze';
    payload: Record<string, unknown>;
    result?: Record<string, unknown> | undefined;
    completed_at?: Date | undefined;
    error_message?: string | undefined;
  }
>;
export type MindPalTask = z.infer<typeof MindPalTaskSchema>;
export declare class MindPalIntegration {
  private config;
  private client;
  constructor(config: MindPalConfig);
  createAgent(
    agentData: Omit<MindPalAgent, 'id' | 'created_at' | 'updated_at'>
  ): Promise<MindPalAgent>;
  getAgents(): Promise<MindPalAgent[]>;
  getAgent(agentId: string): Promise<MindPalAgent>;
  createTask(
    taskData: Omit<MindPalTask, 'id' | 'created_at' | 'updated_at'>
  ): Promise<MindPalTask>;
  getTasks(): Promise<MindPalTask[]>;
  getTask(taskId: string): Promise<MindPalTask>;
  updateTaskStatus(
    taskId: string,
    status: MindPalTask['status'],
    result?: Record<string, unknown>
  ): Promise<MindPalTask>;
  validateBlueprintWithMindPal(
    blueprintData: unknown,
    agentId: string
  ): Promise<{
    isValid: boolean;
    errors: string[];
    suggestions: string[];
    validatedData?: unknown;
  }>;
  private processWithMindPal;
  healthCheck(): Promise<{
    status: string;
    timestamp: string;
    version?: string;
  }>;
}
export declare const validateMindPalConfig: (data: unknown) => MindPalConfig;
export declare const validateMindPalAgent: (data: unknown) => MindPalAgent;
export declare const validateMindPalTask: (data: unknown) => MindPalTask;
//# sourceMappingURL=mindpal_integration.d.ts.map
