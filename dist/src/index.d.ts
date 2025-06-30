import { BigQueryIngest } from '../scripts/bigquery_ingest';
import { FirebasePush } from '../scripts/firebase_push';
import { NeonSync } from '../scripts/neon_sync';
import { MindPalIntegration } from '../scripts/mindpal_integration';
import { DeerFlowIntegration } from '../scripts/deerflow_integration';
import { RenderIntegration } from '../scripts/render_integration';
import { MakeIntegration } from '../scripts/make_integration';
import { GoogleWorkspaceIntegration } from '../scripts/google_workspace_integration';
import {
  NeonBlueprint,
  FirebaseBlueprint,
  BigQueryBlueprint,
  MindPalConfig,
  DeerFlowConfig,
  RenderConfig,
  MakeConfig,
} from './schemas/blueprint-schemas';
export {
  BigQueryIngest,
  FirebasePush,
  NeonSync,
  MindPalIntegration,
  DeerFlowIntegration,
  RenderIntegration,
  MakeIntegration,
};
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  validatedData?:
    | {
        neon?: NeonBlueprint;
        firebase?: FirebaseBlueprint;
        bigquery?: BigQueryBlueprint;
      }
    | undefined;
}
export declare class BlueprintEnforcer {
  private bigquery;
  private firebase;
  private neon;
  private mindPalIntegration;
  private deerFlowIntegration;
  private renderIntegration;
  private makeIntegration;
  private googleWorkspace;
  constructor(
    mindPalConfig?: MindPalConfig,
    deerFlowConfig?: DeerFlowConfig,
    renderConfig?: RenderConfig,
    makeConfig?: MakeConfig
  );
  validateBlueprint(blueprintData: unknown): ValidationResult;
  processBlueprint(blueprintData: unknown): Promise<void>;
  private processToFirebase;
  private processToNeon;
  private processToBigQuery;
  validateExistingData(): Promise<void>;
  generateComplianceReport(): Promise<void>;
  cleanup(): Promise<void>;
  validateWithMindPal(
    blueprintData: unknown,
    agentId: string
  ): Promise<{
    isValid: boolean;
    errors: string[];
    suggestions: string[];
    validatedData?: unknown;
  }>;
  getMindPalHealth(): Promise<{
    status: string;
    timestamp: string;
    version?: string;
  }>;
  createMindPalAgent(agentData: {
    name: string;
    type: 'blueprint_validator' | 'data_processor' | 'automation_agent';
    capabilities: string[];
    metadata?: Record<string, unknown>;
  }): Promise<{
    id: string;
    name: string;
    type: string;
    status: string;
    capabilities: string[];
  }>;
  processWithDeerFlow(
    blueprintData: unknown,
    workflowId: string
  ): Promise<{
    success: boolean;
    executionId: string;
    output?: Record<string, unknown>;
    error?: string;
  }>;
  deployToRender(
    blueprintData: unknown,
    serviceId: string
  ): Promise<{
    success: boolean;
    deploymentId?: string;
    serviceUrl?: string;
    error?: string;
  }>;
  setupDeerFlowAutomation(
    blueprintId: string,
    workflowId: string,
    config: Record<string, unknown>
  ): Promise<{
    id: string;
    status: string;
    integration_type: string;
  }>;
  setupRenderDeployment(
    blueprintId: string,
    serviceId: string,
    config: {
      autoDeploy: boolean;
      environment: 'production' | 'preview';
      branch?: string;
    }
  ): Promise<{
    success: boolean;
    webhookUrl?: string;
    error?: string;
  }>;
  getDeerFlowHealth(): Promise<{
    status: string;
    timestamp: string;
    version?: string;
  }>;
  getRenderHealth(): Promise<{
    status: string;
    timestamp: string;
    version?: string;
  }>;
  createDeerFlowWorkflow(workflowData: {
    name: string;
    description?: string;
    type: 'data_pipeline' | 'automation' | 'integration' | 'monitoring';
    triggers?: string[];
    steps?: Record<string, unknown>[];
    metadata?: Record<string, unknown>;
  }): Promise<{
    id: string;
    name: string;
    type: string;
    status: string;
  }>;
  getDeerFlowWorkflowMetrics(workflowId: string): Promise<{
    total_executions: number;
    successful_executions: number;
    failed_executions: number;
    average_duration: number;
    last_execution: Date | null;
  }>;
  processWithMake(
    blueprintData: unknown,
    scenarioId: number
  ): Promise<{
    success: boolean;
    executionId: number;
    output?: Record<string, unknown>;
    error?: string;
  }>;
  setupMakeAutomation(
    blueprintId: string,
    scenarioId: number,
    config: Record<string, unknown>
  ): Promise<{
    id: string;
    status: string;
    integration_type: string;
  }>;
  getMakeHealth(): Promise<{
    status: string;
    timestamp: string;
    version?: string;
  }>;
  createMakeScenario(scenarioData: {
    name: string;
    description?: string;
    status: 'active' | 'inactive' | 'draft';
    flow?: Record<string, unknown>[];
    connections?: Record<string, unknown>[];
    metadata?: Record<string, unknown>;
  }): Promise<{
    id: number;
    name: string;
    status: string;
  }>;
  getMakeScenarioMetrics(scenarioId: number): Promise<{
    total_executions: number;
    successful_executions: number;
    failed_executions: number;
    average_duration: number;
    last_execution: Date | null;
  }>;
  createMakeWebhook(webhookData: {
    name: string;
    url: string;
    events: string[];
    headers?: Record<string, string>;
  }): Promise<{
    id: number;
    url: string;
    secret: string;
  }>;
  getMakeScenarios(): Promise<
    {
      id: number;
      name: string;
      status: string;
      description?: string;
    }[]
  >;
  updateMakeScenarioStatus(
    scenarioId: number,
    status: 'active' | 'inactive' | 'draft'
  ): Promise<{
    id: number;
    name: string;
    status: string;
  }>;
  getGoogleWorkspace(): GoogleWorkspaceIntegration;
  processGoogleWorkspaceOperations(operations: {
    drive?: {
      action: string;
      params: any;
    };
    docs?: {
      action: string;
      params: any;
    };
    sheets?: {
      action: string;
      params: any;
    };
    calendar?: {
      action: string;
      params: any;
    };
  }): Promise<{
    success: boolean;
    results: Record<string, any>;
    errors: string[];
  }>;
}
//# sourceMappingURL=index.d.ts.map
