'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.validateMakeBlueprintIntegration =
  exports.validateMakeConnection =
  exports.validateMakeExecution =
  exports.validateMakeScenario =
  exports.validateMakeConfig =
  exports.MakeIntegration =
  exports.MakeBlueprintIntegrationSchema =
  exports.MakeConnectionSchema =
  exports.MakeExecutionSchema =
  exports.MakeScenarioSchema =
  exports.MakeConfigSchema =
    void 0;
const axios_1 = __importDefault(require('axios'));
const zod_1 = require('zod');
const mandatory_barton_doctrine_1 = require('../src/core/mandatory-barton-doctrine');
exports.MakeConfigSchema = zod_1.z.object({
  apiKey: zod_1.z.string().min(1, 'API key is required'),
  baseUrl: zod_1.z
    .string()
    .url('Base URL must be a valid URL')
    .default('https://www.make.com/api/v2'),
  timeout: zod_1.z.number().positive().default(30000),
  retryAttempts: zod_1.z.number().int().min(0).max(5).default(3),
});
exports.MakeScenarioSchema = zod_1.z.object({
  id: zod_1.z.number().positive(),
  name: zod_1.z.string().min(1, 'Scenario name is required'),
  description: zod_1.z.string().optional(),
  status: zod_1.z.enum(['active', 'inactive', 'draft', 'error']),
  flow: zod_1.z.array(zod_1.z.record(zod_1.z.unknown())).optional(),
  connections: zod_1.z.array(zod_1.z.record(zod_1.z.unknown())).optional(),
  metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
  created_at: zod_1.z.date(),
  updated_at: zod_1.z.date(),
});
exports.MakeExecutionSchema = zod_1.z.object({
  id: zod_1.z.number().positive(),
  scenario_id: zod_1.z.number().positive(),
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
exports.MakeConnectionSchema = zod_1.z.object({
  id: zod_1.z.number().positive(),
  name: zod_1.z.string().min(1, 'Connection name is required'),
  type: zod_1.z.enum(['webhook', 'api', 'database', 'file', 'email', 'custom']),
  status: zod_1.z.enum(['active', 'inactive', 'error']),
  config: zod_1.z.record(zod_1.z.unknown()),
  metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
  created_at: zod_1.z.date(),
  updated_at: zod_1.z.date(),
});
exports.MakeBlueprintIntegrationSchema = zod_1.z.object({
  id: zod_1.z.string().min(1, 'Integration ID is required'),
  blueprint_id: zod_1.z.string().min(1, 'Blueprint ID is required'),
  scenario_id: zod_1.z.number().positive(),
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
  'make'
);
class MakeIntegration {
  constructor(config) {
    this.config = exports.MakeConfigSchema.parse(config);
    this.client = axios_1.default.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        Authorization: `Token ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }
  async createScenario(scenarioData) {
    try {
      const response = await this.client.post('/scenarios', {
        ...scenarioData,
        created_at: new Date(),
        updated_at: new Date(),
      });
      return exports.MakeScenarioSchema.parse(response.data);
    } catch (error) {
      console.error('Error creating Make.com scenario:', error);
      throw new Error(
        `Failed to create Make.com scenario: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async getScenarios() {
    try {
      const response = await this.client.get('/scenarios');
      return zod_1.z.array(exports.MakeScenarioSchema).parse(response.data);
    } catch (error) {
      console.error('Error fetching Make.com scenarios:', error);
      throw new Error(
        `Failed to fetch Make.com scenarios: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async getScenario(scenarioId) {
    try {
      const response = await this.client.get(`/scenarios/${scenarioId}`);
      return exports.MakeScenarioSchema.parse(response.data);
    } catch (error) {
      console.error('Error fetching Make.com scenario:', error);
      throw new Error(
        `Failed to fetch Make.com scenario: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async executeScenario(scenarioId, inputData) {
    try {
      const response = await this.client.post(
        `/scenarios/${scenarioId}/executions`,
        {
          input_data: inputData || {},
          created_at: new Date(),
          updated_at: new Date(),
        }
      );
      return exports.MakeExecutionSchema.parse(response.data);
    } catch (error) {
      console.error('Error executing Make.com scenario:', error);
      throw new Error(
        `Failed to execute Make.com scenario: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async getExecutionStatus(executionId) {
    try {
      const response = await this.client.get(`/executions/${executionId}`);
      return exports.MakeExecutionSchema.parse(response.data);
    } catch (error) {
      console.error('Error fetching execution status:', error);
      throw new Error(
        `Failed to fetch execution status: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async getScenarioExecutions(scenarioId) {
    try {
      const response = await this.client.get(
        `/scenarios/${scenarioId}/executions`
      );
      return zod_1.z.array(exports.MakeExecutionSchema).parse(response.data);
    } catch (error) {
      console.error('Error fetching scenario executions:', error);
      throw new Error(
        `Failed to fetch scenario executions: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async createConnection(connectionData) {
    try {
      const response = await this.client.post('/connections', {
        ...connectionData,
        created_at: new Date(),
        updated_at: new Date(),
      });
      return exports.MakeConnectionSchema.parse(response.data);
    } catch (error) {
      console.error('Error creating Make.com connection:', error);
      throw new Error(
        `Failed to create Make.com connection: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async getConnections() {
    try {
      const response = await this.client.get('/connections');
      return zod_1.z.array(exports.MakeConnectionSchema).parse(response.data);
    } catch (error) {
      console.error('Error fetching Make.com connections:', error);
      throw new Error(
        `Failed to fetch Make.com connections: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async processBlueprintWithMake(blueprintData, scenarioId) {
    try {
      const execution = await this.executeScenario(scenarioId, {
        blueprint: blueprintData,
      });
      let finalExecution = execution;
      const maxAttempts = 15;
      let attempts = 0;
      while (
        finalExecution.status === 'pending' ||
        finalExecution.status === 'running'
      ) {
        if (attempts >= maxAttempts) {
          throw new Error('Scenario execution timeout');
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
      console.error('Error processing blueprint with Make.com:', error);
      throw new Error(
        `Failed to process blueprint with Make.com: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async setupBlueprintAutomation(blueprintId, scenarioId, config) {
    try {
      const integration = await this.createBlueprintIntegration({
        blueprint_id: blueprintId,
        scenario_id: scenarioId,
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
  async createBlueprintIntegration(integrationData) {
    try {
      const response = await this.client.post('/integrations', {
        ...integrationData,
        created_at: new Date(),
        updated_at: new Date(),
      });
      return exports.MakeBlueprintIntegrationSchema.parse(response.data);
    } catch (error) {
      console.error('Error creating blueprint integration:', error);
      throw new Error(
        `Failed to create blueprint integration: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async createWebhook(webhookData) {
    try {
      const response = await this.client.post('/webhooks', {
        ...webhookData,
        created_at: new Date(),
        updated_at: new Date(),
      });
      return {
        id: response.data.id,
        url: response.data.url,
        secret: response.data.secret,
      };
    } catch (error) {
      console.error('Error creating webhook:', error);
      throw new Error(
        `Failed to create webhook: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
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
      console.error('Make.com health check failed:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }
  async getScenarioMetrics(scenarioId) {
    try {
      const response = await this.client.get(
        `/scenarios/${scenarioId}/metrics`
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
      console.error('Error fetching scenario metrics:', error);
      throw new Error(
        `Failed to fetch scenario metrics: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async updateScenarioStatus(scenarioId, status) {
    try {
      const response = await this.client.patch(`/scenarios/${scenarioId}`, {
        status,
        updated_at: new Date(),
      });
      return exports.MakeScenarioSchema.parse(response.data);
    } catch (error) {
      console.error('Error updating scenario status:', error);
      throw new Error(
        `Failed to update scenario status: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async deleteScenario(scenarioId) {
    try {
      await this.client.delete(`/scenarios/${scenarioId}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting scenario:', error);
      throw new Error(
        `Failed to delete scenario: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
exports.MakeIntegration = MakeIntegration;
const validateMakeConfig = (data) => {
  return exports.MakeConfigSchema.parse(data);
};
exports.validateMakeConfig = validateMakeConfig;
const validateMakeScenario = (data) => {
  return exports.MakeScenarioSchema.parse(data);
};
exports.validateMakeScenario = validateMakeScenario;
const validateMakeExecution = (data) => {
  return exports.MakeExecutionSchema.parse(data);
};
exports.validateMakeExecution = validateMakeExecution;
const validateMakeConnection = (data) => {
  return exports.MakeConnectionSchema.parse(data);
};
exports.validateMakeConnection = validateMakeConnection;
const validateMakeBlueprintIntegration = (data) => {
  return exports.MakeBlueprintIntegrationSchema.parse(data);
};
exports.validateMakeBlueprintIntegration = validateMakeBlueprintIntegration;
//# sourceMappingURL=make_integration.js.map
