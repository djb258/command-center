'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.GoogleCalendarEventSchema =
  exports.GoogleSheetsSpreadsheetSchema =
  exports.GoogleDocsDocumentSchema =
  exports.GoogleDriveFileSchema =
  exports.GoogleWorkspaceConfigSchema =
  exports.validateMakeBlueprintIntegration =
  exports.validateMakeConnection =
  exports.validateMakeExecution =
  exports.validateMakeScenario =
  exports.validateMakeConfig =
  exports.MakeBlueprintIntegrationSchema =
  exports.MakeConnectionSchema =
  exports.MakeExecutionSchema =
  exports.MakeScenarioSchema =
  exports.MakeConfigSchema =
  exports.validateRenderWebhookPayload =
  exports.validateRenderDeployment =
  exports.validateRenderService =
  exports.validateRenderConfig =
  exports.validateDeerFlowBlueprintIntegration =
  exports.validateDeerFlowExecution =
  exports.validateDeerFlowWorkflow =
  exports.validateDeerFlowConfig =
  exports.RenderWebhookPayloadSchema =
  exports.RenderDeploymentSchema =
  exports.RenderServiceSchema =
  exports.RenderConfigSchema =
  exports.DeerFlowBlueprintIntegrationSchema =
  exports.DeerFlowExecutionSchema =
  exports.DeerFlowWorkflowSchema =
  exports.DeerFlowConfigSchema =
  exports.validateMindPalTask =
  exports.validateMindPalAgent =
  exports.validateMindPalConfig =
  exports.MindPalTaskSchema =
  exports.MindPalAgentSchema =
  exports.MindPalConfigSchema =
  exports.validateHumanFirebreakQueue =
  exports.validateErrorLog =
  exports.validateAgentTask =
  exports.validateBlueprintForBigQuery =
  exports.validateBlueprintForFirebase =
  exports.validateBlueprintForNeon =
  exports.HumanFirebreakQueueSchema =
  exports.ErrorLogSchema =
  exports.AgentTaskSchema =
  exports.BigQueryBlueprintSchema =
  exports.FirebaseBlueprintSchema =
  exports.NeonBlueprintSchema =
  exports.BaseBlueprintSchema =
    void 0;
const zod_1 = require('zod');
exports.BaseBlueprintSchema = zod_1.z.object({
  id: zod_1.z.string().min(1, 'ID is required'),
  name: zod_1.z.string().min(1, 'Name is required').max(255, 'Name too long'),
  version: zod_1.z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, 'Version must be in semver format (e.g., 1.0.0)'),
  status: zod_1.z.enum(['active', 'inactive', 'draft', 'archived'], {
    errorMap: () => ({
      message: 'Status must be active, inactive, draft, or archived',
    }),
  }),
  description: zod_1.z.string().optional(),
  author: zod_1.z.string().min(1, 'Author is required'),
  timestamp: zod_1.z.string().datetime('Invalid timestamp format'),
  created_at: zod_1.z.date().optional(),
  updated_at: zod_1.z.date().optional(),
});
exports.NeonBlueprintSchema = exports.BaseBlueprintSchema.extend({
  metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
  tags: zod_1.z.array(zod_1.z.string()).optional(),
  category: zod_1.z.string().optional(),
  priority: zod_1.z.enum(['low', 'medium', 'high', 'critical']).optional(),
  id: zod_1.z.string().min(1).max(50),
});
exports.FirebaseBlueprintSchema = exports.BaseBlueprintSchema.extend({
  firebase_id: zod_1.z.string().optional(),
  collection: zod_1.z.string().default('blueprints'),
  metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
  tags: zod_1.z.array(zod_1.z.string()).optional(),
  category: zod_1.z.string().optional(),
  priority: zod_1.z.enum(['low', 'medium', 'high', 'critical']).optional(),
});
exports.BigQueryBlueprintSchema = exports.BaseBlueprintSchema.extend({
  dataset_id: zod_1.z.string().optional(),
  table_id: zod_1.z.string().optional(),
  partition_date: zod_1.z.string().optional(),
  metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
  tags: zod_1.z.array(zod_1.z.string()).optional(),
  category: zod_1.z.string().optional(),
  priority: zod_1.z.enum(['low', 'medium', 'high', 'critical']).optional(),
});
exports.AgentTaskSchema = zod_1.z.object({
  id: zod_1.z.string().min(1, 'Task ID is required'),
  blueprint_id: zod_1.z.string().min(1, 'Blueprint ID is required'),
  agent_id: zod_1.z.string().min(1, 'Agent ID is required'),
  status: zod_1.z.enum([
    'pending',
    'running',
    'completed',
    'failed',
    'cancelled',
  ]),
  task_type: zod_1.z.string().min(1, 'Task type is required'),
  payload: zod_1.z.record(zod_1.z.unknown()).optional(),
  result: zod_1.z.record(zod_1.z.unknown()).optional(),
  created_at: zod_1.z.date(),
  updated_at: zod_1.z.date(),
  started_at: zod_1.z.date().optional(),
  completed_at: zod_1.z.date().optional(),
  error_message: zod_1.z.string().optional(),
});
exports.ErrorLogSchema = zod_1.z.object({
  id: zod_1.z.string().min(1, 'Error ID is required'),
  timestamp: zod_1.z.date(),
  level: zod_1.z.enum(['debug', 'info', 'warning', 'error', 'critical']),
  message: zod_1.z.string().min(1, 'Error message is required'),
  stack_trace: zod_1.z.string().optional(),
  context: zod_1.z.record(zod_1.z.unknown()).optional(),
  blueprint_id: zod_1.z.string().optional(),
  agent_id: zod_1.z.string().optional(),
  user_id: zod_1.z.string().optional(),
});
exports.HumanFirebreakQueueSchema = zod_1.z.object({
  id: zod_1.z.string().min(1, 'Queue ID is required'),
  blueprint_id: zod_1.z.string().min(1, 'Blueprint ID is required'),
  priority: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
  status: zod_1.z.enum(['queued', 'in_progress', 'resolved', 'escalated']),
  assigned_to: zod_1.z.string().optional(),
  description: zod_1.z.string().min(1, 'Description is required'),
  created_at: zod_1.z.date(),
  updated_at: zod_1.z.date(),
  resolved_at: zod_1.z.date().optional(),
  resolution_notes: zod_1.z.string().optional(),
});
const validateBlueprintForNeon = (data) => {
  return exports.NeonBlueprintSchema.parse(data);
};
exports.validateBlueprintForNeon = validateBlueprintForNeon;
const validateBlueprintForFirebase = (data) => {
  return exports.FirebaseBlueprintSchema.parse(data);
};
exports.validateBlueprintForFirebase = validateBlueprintForFirebase;
const validateBlueprintForBigQuery = (data) => {
  return exports.BigQueryBlueprintSchema.parse(data);
};
exports.validateBlueprintForBigQuery = validateBlueprintForBigQuery;
const validateAgentTask = (data) => {
  return exports.AgentTaskSchema.parse(data);
};
exports.validateAgentTask = validateAgentTask;
const validateErrorLog = (data) => {
  return exports.ErrorLogSchema.parse(data);
};
exports.validateErrorLog = validateErrorLog;
const validateHumanFirebreakQueue = (data) => {
  return exports.HumanFirebreakQueueSchema.parse(data);
};
exports.validateHumanFirebreakQueue = validateHumanFirebreakQueue;
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
exports.RenderConfigSchema = zod_1.z.object({
  apiKey: zod_1.z.string().min(1, 'API key is required'),
  webhookUrl: zod_1.z.string().url('Webhook URL must be a valid URL'),
  baseUrl: zod_1.z
    .string()
    .url('Base URL must be a valid URL')
    .default('https://api.render.com'),
  timeout: zod_1.z.number().positive().default(30000),
  retryAttempts: zod_1.z.number().int().min(0).max(5).default(3),
});
exports.RenderServiceSchema = zod_1.z.object({
  id: zod_1.z.string().min(1, 'Service ID is required'),
  name: zod_1.z.string().min(1, 'Service name is required'),
  type: zod_1.z.enum([
    'web_service',
    'static_site',
    'background_worker',
    'cron_job',
  ]),
  status: zod_1.z.enum([
    'live',
    'suspended',
    'deleted',
    'build_failed',
    'deploy_failed',
  ]),
  service_details: zod_1.z
    .object({
      url: zod_1.z.string().url().optional(),
      environment: zod_1.z.enum(['production', 'preview']).optional(),
      region: zod_1.z.string().optional(),
      plan: zod_1.z.string().optional(),
    })
    .optional(),
  created_at: zod_1.z.date(),
  updated_at: zod_1.z.date(),
});
exports.RenderDeploymentSchema = zod_1.z.object({
  id: zod_1.z.string().min(1, 'Deployment ID is required'),
  service_id: zod_1.z.string().min(1, 'Service ID is required'),
  status: zod_1.z.enum(['pending', 'building', 'live', 'failed', 'cancelled']),
  commit: zod_1.z
    .object({
      id: zod_1.z.string().optional(),
      message: zod_1.z.string().optional(),
      author: zod_1.z.string().optional(),
    })
    .optional(),
  environment: zod_1.z.enum(['production', 'preview']).optional(),
  created_at: zod_1.z.date(),
  updated_at: zod_1.z.date(),
  finished_at: zod_1.z.date().optional(),
});
exports.RenderWebhookPayloadSchema = zod_1.z.object({
  action: zod_1.z.enum(['deploy', 'build', 'restart', 'suspend']),
  timestamp: zod_1.z.string().datetime(),
  environment: zod_1.z
    .enum(['production', 'preview', 'development'])
    .optional(),
  service_id: zod_1.z.string().optional(),
  deployment_id: zod_1.z.string().optional(),
  metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
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
const validateRenderConfig = (data) => {
  return exports.RenderConfigSchema.parse(data);
};
exports.validateRenderConfig = validateRenderConfig;
const validateRenderService = (data) => {
  return exports.RenderServiceSchema.parse(data);
};
exports.validateRenderService = validateRenderService;
const validateRenderDeployment = (data) => {
  return exports.RenderDeploymentSchema.parse(data);
};
exports.validateRenderDeployment = validateRenderDeployment;
const validateRenderWebhookPayload = (data) => {
  return exports.RenderWebhookPayloadSchema.parse(data);
};
exports.validateRenderWebhookPayload = validateRenderWebhookPayload;
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
exports.GoogleWorkspaceConfigSchema = zod_1.z.object({
  clientId: zod_1.z.string(),
  clientSecret: zod_1.z.string(),
  redirectUri: zod_1.z.string().url(),
  refreshToken: zod_1.z.string().optional(),
  scopes: zod_1.z
    .array(zod_1.z.string())
    .default([
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/gmail.readonly',
    ]),
});
exports.GoogleDriveFileSchema = zod_1.z.object({
  id: zod_1.z.string(),
  name: zod_1.z.string(),
  mimeType: zod_1.z.string(),
  size: zod_1.z.string().optional(),
  createdTime: zod_1.z.string(),
  modifiedTime: zod_1.z.string(),
  parents: zod_1.z.array(zod_1.z.string()).optional(),
  webViewLink: zod_1.z.string().optional(),
  webContentLink: zod_1.z.string().optional(),
});
exports.GoogleDocsDocumentSchema = zod_1.z.object({
  documentId: zod_1.z.string(),
  title: zod_1.z.string(),
  body: zod_1.z.object({
    content: zod_1.z.array(zod_1.z.any()),
  }),
  revisionId: zod_1.z.string(),
  suggestionsViewMode: zod_1.z.string().optional(),
});
exports.GoogleSheetsSpreadsheetSchema = zod_1.z.object({
  spreadsheetId: zod_1.z.string(),
  properties: zod_1.z.object({
    title: zod_1.z.string(),
    locale: zod_1.z.string().optional(),
    timeZone: zod_1.z.string().optional(),
  }),
  sheets: zod_1.z.array(
    zod_1.z.object({
      properties: zod_1.z.object({
        sheetId: zod_1.z.number(),
        title: zod_1.z.string(),
        index: zod_1.z.number(),
      }),
    })
  ),
});
exports.GoogleCalendarEventSchema = zod_1.z.object({
  id: zod_1.z.string(),
  summary: zod_1.z.string(),
  description: zod_1.z.string().optional(),
  start: zod_1.z.object({
    dateTime: zod_1.z.string().optional(),
    date: zod_1.z.string().optional(),
    timeZone: zod_1.z.string().optional(),
  }),
  end: zod_1.z.object({
    dateTime: zod_1.z.string().optional(),
    date: zod_1.z.string().optional(),
    timeZone: zod_1.z.string().optional(),
  }),
  attendees: zod_1.z
    .array(
      zod_1.z.object({
        email: zod_1.z.string(),
        displayName: zod_1.z.string().optional(),
        responseStatus: zod_1.z.string().optional(),
      })
    )
    .optional(),
  location: zod_1.z.string().optional(),
  status: zod_1.z.string().optional(),
});
//# sourceMappingURL=blueprint-schemas.js.map
