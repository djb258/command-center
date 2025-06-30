'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.validateMindPalTask =
  exports.validateMindPalAgent =
  exports.validateMindPalConfig =
  exports.MindPalIntegration =
  exports.MindPalTaskSchema =
  exports.MindPalAgentSchema =
  exports.MindPalConfigSchema =
    void 0;
const axios_1 = __importDefault(require('axios'));
const zod_1 = require('zod');
const blueprint_schemas_1 = require('../src/schemas/blueprint-schemas');
const mandatory_barton_doctrine_1 = require('../src/core/mandatory-barton-doctrine');
exports.MindPalConfigSchema = zod_1.z.object({
  apiKey: zod_1.z.string().min(1, 'API key is required'),
  baseUrl: zod_1.z
    .string()
    .url('Base URL must be a valid URL')
    .default('https://api.mindpal.com'),
  timeout: zod_1.z.number().positive().default(30000),
  retryAttempts: zod_1.z.number().int().min(0).max(5).default(3),
});
exports.MindPalAgentSchema = zod_1.z.object({
  id: zod_1.z.string().min(1, 'Agent ID is required'),
  name: zod_1.z.string().min(1, 'Agent name is required'),
  type: zod_1.z.enum([
    'blueprint_validator',
    'data_processor',
    'automation_agent',
  ]),
  status: zod_1.z.enum(['active', 'inactive', 'training', 'error']),
  capabilities: zod_1.z.array(zod_1.z.string()),
  metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
  created_at: zod_1.z.date(),
  updated_at: zod_1.z.date(),
});
exports.MindPalTaskSchema = zod_1.z.object({
  id: zod_1.z.string().min(1, 'Task ID is required'),
  agent_id: zod_1.z.string().min(1, 'Agent ID is required'),
  blueprint_id: zod_1.z.string().min(1, 'Blueprint ID is required'),
  task_type: zod_1.z.enum(['validate', 'process', 'automate', 'analyze']),
  payload: zod_1.z.record(zod_1.z.unknown()),
  status: zod_1.z.enum(['pending', 'running', 'completed', 'failed']),
  result: zod_1.z.record(zod_1.z.unknown()).optional(),
  error_message: zod_1.z.string().optional(),
  created_at: zod_1.z.date(),
  updated_at: zod_1.z.date(),
  completed_at: zod_1.z.date().optional(),
});
const doctrine = (0, mandatory_barton_doctrine_1.START_WITH_BARTON_DOCTRINE)(
  'mindpal'
);
class MindPalIntegration {
  constructor(config) {
    this.config = exports.MindPalConfigSchema.parse(config);
    this.client = axios_1.default.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }
  async createAgent(agentData) {
    try {
      const response = await this.client.post('/agents', {
        ...agentData,
        created_at: new Date(),
        updated_at: new Date(),
      });
      return exports.MindPalAgentSchema.parse(response.data);
    } catch (error) {
      console.error('Error creating MindPal agent:', error);
      throw new Error(
        `Failed to create MindPal agent: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async getAgents() {
    try {
      const response = await this.client.get('/agents');
      return zod_1.z.array(exports.MindPalAgentSchema).parse(response.data);
    } catch (error) {
      console.error('Error fetching MindPal agents:', error);
      throw new Error(
        `Failed to fetch MindPal agents: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async getAgent(agentId) {
    try {
      const response = await this.client.get(`/agents/${agentId}`);
      return exports.MindPalAgentSchema.parse(response.data);
    } catch (error) {
      console.error('Error fetching MindPal agent:', error);
      throw new Error(
        `Failed to fetch MindPal agent: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async createTask(taskData) {
    try {
      const response = await this.client.post('/tasks', {
        ...taskData,
        created_at: new Date(),
        updated_at: new Date(),
      });
      return exports.MindPalTaskSchema.parse(response.data);
    } catch (error) {
      console.error('Error creating MindPal task:', error);
      throw new Error(
        `Failed to create MindPal task: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async getTasks() {
    try {
      const response = await this.client.get('/tasks');
      return zod_1.z.array(exports.MindPalTaskSchema).parse(response.data);
    } catch (error) {
      console.error('Error fetching MindPal tasks:', error);
      throw new Error(
        `Failed to fetch MindPal tasks: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async getTask(taskId) {
    try {
      const response = await this.client.get(`/tasks/${taskId}`);
      return exports.MindPalTaskSchema.parse(response.data);
    } catch (error) {
      console.error('Error fetching MindPal task:', error);
      throw new Error(
        `Failed to fetch MindPal task: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async updateTaskStatus(taskId, status, result) {
    try {
      const updateData = {
        status,
        updated_at: new Date(),
      };
      if (status === 'completed' && result) {
        updateData.result = result;
        updateData.completed_at = new Date();
      }
      const response = await this.client.patch(`/tasks/${taskId}`, updateData);
      return exports.MindPalTaskSchema.parse(response.data);
    } catch (error) {
      console.error('Error updating MindPal task status:', error);
      throw new Error(
        `Failed to update MindPal task status: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async validateBlueprintWithMindPal(blueprintData, agentId) {
    try {
      const validatedBlueprint = (0,
      blueprint_schemas_1.validateBlueprintForFirebase)(blueprintData);
      const task = await this.createTask({
        agent_id: agentId,
        blueprint_id: validatedBlueprint.id,
        task_type: 'validate',
        payload: { blueprint: validatedBlueprint },
        status: 'pending',
      });
      await this.updateTaskStatus(task.id, 'running');
      const mindpalResult = await this.processWithMindPal(task);
      await this.updateTaskStatus(task.id, 'completed', mindpalResult);
      return {
        isValid: mindpalResult.isValid,
        errors: mindpalResult.errors || [],
        suggestions: mindpalResult.suggestions || [],
        validatedData: mindpalResult.validatedData,
      };
    } catch (error) {
      console.error('Error validating blueprint with MindPal:', error);
      throw new Error(
        `Failed to validate blueprint with MindPal: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async processWithMindPal(task) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      isValid: true,
      errors: [],
      suggestions: ['Consider adding more metadata for better organization'],
      validatedData: task.payload,
    };
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
      console.error('MindPal health check failed:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
exports.MindPalIntegration = MindPalIntegration;
const validateMindPalConfig = (data) => {
  return exports.MindPalConfigSchema.parse(data);
};
exports.validateMindPalConfig = validateMindPalConfig;
const validateMindPalAgent = (data) => {
  return exports.MindPalAgentSchema.parse(data);
};
exports.validateMindPalAgent = validateMindPalAgent;
const validateMindPalTask = (data) => {
  return exports.MindPalTaskSchema.parse(data);
};
exports.validateMindPalTask = validateMindPalTask;
//# sourceMappingURL=mindpal_integration.js.map
