'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.validateDeerFlowBlueprintIntegration =
  exports.validateDeerFlowExecution =
  exports.validateDeerFlowWorkflow =
  exports.validateDeerFlowConfig =
  exports.DeerFlowIntegration =
  exports.DeerFlowBlueprintIntegrationSchema =
  exports.DeerFlowExecutionSchema =
  exports.DeerFlowWorkflowSchema =
  exports.DeerFlowConfigSchema =
    void 0;
const axios_1 = __importDefault(require('axios'));
const zod_1 = require('zod');
const mandatory_barton_doctrine_1 = require('../src/core/mandatory-barton-doctrine');
exports.DeerFlowConfigSchema = zod_1.z.object({
  apiKey: zod_1.z.string().min(1, 'API key is required'),
  baseUrl: zod_1.z
    .string()
    .url('Base URL must be a valid URL')
    .default('https://api.deerflow.com'),
  timeout: zod_1.z.number().positive().default(30000),
  retryAttempts: zod_1.z.number().int().min(0).max(5).default(3),
});
exports.DeerFlowWorkflowSchema = zod_1.z.object({
  id: zod_1.z.string().min(1, 'Workflow ID is required'),
  name: zod_1.z.string().min(1, 'Workflow name is required'),
  description: zod_1.z.string().optional(),
  status: zod_1.z.enum(['active', 'inactive', 'draft', 'archived']),
  type: zod_1.z.enum([
    'data_pipeline',
    'automation',
    'integration',
    'monitoring',
  ]),
  triggers: zod_1.z.array(zod_1.z.string()).optional(),
  steps: zod_1.z.array(zod_1.z.record(zod_1.z.unknown())).optional(),
  metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
  created_at: zod_1.z.date(),
  updated_at: zod_1.z.date(),
});
exports.DeerFlowExecutionSchema = zod_1.z.object({
  id: zod_1.z.string().min(1, 'Execution ID is required'),
  workflow_id: zod_1.z.string().min(1, 'Workflow ID is required'),
  status: zod_1.z.enum([
    'pending',
    'running',
    'completed',
    'failed',
    'cancelled',
  ]),
  input_data: zod_1.z.record(zod_1.z.unknown()).optional(),
  output_data: zod_1.z.record(zod_1.z.unknown()).optional(),
  error_message: zod_1.z.string().optional(),
  started_at: zod_1.z.date().optional(),
  completed_at: zod_1.z.date().optional(),
  created_at: zod_1.z.date(),
  updated_at: zod_1.z.date(),
});
exports.DeerFlowBlueprintIntegrationSchema = zod_1.z.object({
  id: zod_1.z.string().min(1, 'Integration ID is required'),
  blueprint_id: zod_1.z.string().min(1, 'Blueprint ID is required'),
  workflow_id: zod_1.z.string().min(1, 'Workflow ID is required'),
  integration_type: zod_1.z.enum([
    'validation',
    'processing',
    'monitoring',
    'automation',
  ]),
  config: zod_1.z.record(zod_1.z.unknown()),
  status: zod_1.z.enum(['active', 'inactive', 'error']),
  last_execution: zod_1.z.date().optional(),
  created_at: zod_1.z.date(),
  updated_at: zod_1.z.date(),
});
const doctrine = (0, mandatory_barton_doctrine_1.START_WITH_BARTON_DOCTRINE)(
  'deerflow'
);
class DeerFlowIntegration {
  constructor(config) {
    this.config = exports.DeerFlowConfigSchema.parse(config);
    this.client = axios_1.default.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }
  async createWorkflow(workflowData) {
    try {
      const response = await this.client.post('/workflows', {
        ...workflowData,
        created_at: new Date(),
        updated_at: new Date(),
      });
      return exports.DeerFlowWorkflowSchema.parse(response.data);
    } catch (error) {
      console.error('Error creating DeerFlow workflow:', error);
      throw new Error(
        `Failed to create DeerFlow workflow: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async getWorkflows() {
    try {
      const response = await this.client.get('/workflows');
      return zod_1.z.array(exports.DeerFlowWorkflowSchema).parse(response.data);
    } catch (error) {
      console.error('Error fetching DeerFlow workflows:', error);
      throw new Error(
        `Failed to fetch DeerFlow workflows: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async getWorkflow(workflowId) {
    try {
      const response = await this.client.get(`/workflows/${workflowId}`);
      return exports.DeerFlowWorkflowSchema.parse(response.data);
    } catch (error) {
      console.error('Error fetching DeerFlow workflow:', error);
      throw new Error(
        `Failed to fetch DeerFlow workflow: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async executeWorkflow(workflowId, inputData) {
    try {
      const response = await this.client.post(
        `/workflows/${workflowId}/execute`,
        {
          input_data: inputData || {},
          created_at: new Date(),
          updated_at: new Date(),
        }
      );
      return exports.DeerFlowExecutionSchema.parse(response.data);
    } catch (error) {
      console.error('Error executing DeerFlow workflow:', error);
      throw new Error(
        `Failed to execute DeerFlow workflow: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async getExecutionStatus(executionId) {
    try {
      const response = await this.client.get(`/executions/${executionId}`);
      return exports.DeerFlowExecutionSchema.parse(response.data);
    } catch (error) {
      console.error('Error fetching execution status:', error);
      throw new Error(
        `Failed to fetch execution status: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async createBlueprintIntegration(integrationData) {
    try {
      const response = await this.client.post('/integrations', {
        ...integrationData,
        created_at: new Date(),
        updated_at: new Date(),
      });
      return exports.DeerFlowBlueprintIntegrationSchema.parse(response.data);
    } catch (error) {
      console.error('Error creating blueprint integration:', error);
      throw new Error(
        `Failed to create blueprint integration: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async processBlueprintWithDeerFlow(blueprintData, workflowId) {
    try {
      const execution = await this.executeWorkflow(workflowId, {
        blueprint: blueprintData,
      });
      let finalExecution = execution;
      const maxAttempts = 10;
      let attempts = 0;
      while (
        finalExecution.status === 'pending' ||
        finalExecution.status === 'running'
      ) {
        if (attempts >= maxAttempts) {
          throw new Error('Workflow execution timeout');
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
        finalExecution = await this.getExecutionStatus(execution.id);
        attempts++;
      }
      return {
        success: finalExecution.status === 'completed',
        executionId: execution.id,
        ...(finalExecution.output_data && {
          output: finalExecution.output_data,
        }),
        ...(finalExecution.error_message && {
          error: finalExecution.error_message,
        }),
      };
    } catch (error) {
      console.error('Error processing blueprint with DeerFlow:', error);
      throw new Error(
        `Failed to process blueprint with DeerFlow: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async setupBlueprintAutomation(blueprintId, workflowId, config) {
    try {
      const integration = await this.createBlueprintIntegration({
        blueprint_id: blueprintId,
        workflow_id: workflowId,
        integration_type: 'automation',
        config: {
          ...config,
          auto_trigger: true,
          trigger_conditions: ['blueprint_updated', 'blueprint_created'],
        },
        status: 'active',
      });
      console.log(
        `Blueprint automation set up successfully: ${integration.id}`
      );
      return integration;
    } catch (error) {
      console.error('Error setting up blueprint automation:', error);
      throw error;
    }
  }
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: response.data.version,
      };
    } catch (error) {
      console.error('DeerFlow health check failed:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }
  async getWorkflowMetrics(workflowId) {
    try {
      const response = await this.client.get(
        `/workflows/${workflowId}/metrics`
      );
      return {
        total_executions: response.data.total_executions || 0,
        successful_executions: response.data.successful_executions || 0,
        failed_executions: response.data.failed_executions || 0,
        average_duration: response.data.average_duration || 0,
        last_execution: response.data.last_execution
          ? new Date(response.data.last_execution)
          : null,
      };
    } catch (error) {
      console.error('Error fetching workflow metrics:', error);
      throw new Error(
        `Failed to fetch workflow metrics: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
exports.DeerFlowIntegration = DeerFlowIntegration;
const validateDeerFlowConfig = (data) => {
  return exports.DeerFlowConfigSchema.parse(data);
};
exports.validateDeerFlowConfig = validateDeerFlowConfig;
const validateDeerFlowWorkflow = (data) => {
  return exports.DeerFlowWorkflowSchema.parse(data);
};
exports.validateDeerFlowWorkflow = validateDeerFlowWorkflow;
const validateDeerFlowExecution = (data) => {
  return exports.DeerFlowExecutionSchema.parse(data);
};
exports.validateDeerFlowExecution = validateDeerFlowExecution;
const validateDeerFlowBlueprintIntegration = (data) => {
  return exports.DeerFlowBlueprintIntegrationSchema.parse(data);
};
exports.validateDeerFlowBlueprintIntegration =
  validateDeerFlowBlueprintIntegration;
//# sourceMappingURL=deerflow_integration.js.map
