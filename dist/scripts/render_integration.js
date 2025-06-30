'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.validateRenderWebhookPayload =
  exports.validateRenderDeployment =
  exports.validateRenderService =
  exports.validateRenderConfig =
  exports.RenderIntegration =
  exports.RenderWebhookPayloadSchema =
  exports.RenderDeploymentSchema =
  exports.RenderServiceSchema =
  exports.RenderConfigSchema =
    void 0;
const axios_1 = __importDefault(require('axios'));
const zod_1 = require('zod');
const mandatory_barton_doctrine_1 = require('../src/core/mandatory-barton-doctrine');
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
const doctrine = (0, mandatory_barton_doctrine_1.START_WITH_BARTON_DOCTRINE)(
  'render'
);
class RenderIntegration {
  constructor(config) {
    this.config = exports.RenderConfigSchema.parse(config);
    this.client = axios_1.default.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }
  async triggerDeployment(payload) {
    try {
      const defaultPayload = {
        action: 'deploy',
        timestamp: new Date().toISOString(),
        environment: 'production',
        metadata: {
          triggered_by: 'blueprint_enforcer',
          source: 'automated_deployment',
        },
      };
      const finalPayload = { ...defaultPayload, ...payload };
      const validatedPayload =
        exports.RenderWebhookPayloadSchema.parse(finalPayload);
      const response = await this.client.post(
        this.config.webhookUrl,
        validatedPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );
      return {
        success: response.status >= 200 && response.status < 300,
        statusCode: response.status,
        response: response.data,
      };
    } catch (error) {
      console.error('Error triggering Render deployment:', error);
      return {
        success: false,
        statusCode:
          error instanceof Error && 'response' in error
            ? error.response?.status || 500
            : 500,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  async getServices() {
    try {
      const response = await this.client.get('/v1/services');
      return zod_1.z.array(exports.RenderServiceSchema).parse(response.data);
    } catch (error) {
      console.error('Error fetching Render services:', error);
      throw new Error(
        `Failed to fetch Render services: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async getService(serviceId) {
    try {
      const response = await this.client.get(`/v1/services/${serviceId}`);
      return exports.RenderServiceSchema.parse(response.data);
    } catch (error) {
      console.error('Error fetching Render service:', error);
      throw new Error(
        `Failed to fetch Render service: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async getDeployments(serviceId) {
    try {
      const response = await this.client.get(
        `/v1/services/${serviceId}/deploys`
      );
      return zod_1.z.array(exports.RenderDeploymentSchema).parse(response.data);
    } catch (error) {
      console.error('Error fetching Render deployments:', error);
      throw new Error(
        `Failed to fetch Render deployments: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async getDeployment(serviceId, deploymentId) {
    try {
      const response = await this.client.get(
        `/v1/services/${serviceId}/deploys/${deploymentId}`
      );
      return exports.RenderDeploymentSchema.parse(response.data);
    } catch (error) {
      console.error('Error fetching Render deployment:', error);
      throw new Error(
        `Failed to fetch Render deployment: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async createDeployment(serviceId, options) {
    try {
      const response = await this.client.post(
        `/v1/services/${serviceId}/deploys`,
        {
          ...options,
          created_at: new Date(),
          updated_at: new Date(),
        }
      );
      return exports.RenderDeploymentSchema.parse(response.data);
    } catch (error) {
      console.error('Error creating Render deployment:', error);
      throw new Error(
        `Failed to create Render deployment: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async deployBlueprint(blueprintData, serviceId) {
    try {
      const deployment = await this.createDeployment(serviceId, {
        environment: 'production',
      });
      let finalDeployment = deployment;
      const maxAttempts = 30;
      let attempts = 0;
      while (
        finalDeployment.status === 'pending' ||
        finalDeployment.status === 'building'
      ) {
        if (attempts >= maxAttempts) {
          throw new Error('Deployment timeout');
        }
        await new Promise((resolve) => setTimeout(resolve, 10000));
        finalDeployment = await this.getDeployment(serviceId, deployment.id);
        attempts++;
      }
      if (finalDeployment.status === 'live') {
        const service = await this.getService(serviceId);
        return {
          success: true,
          deploymentId: deployment.id,
          ...(service.service_details?.url && {
            serviceUrl: service.service_details.url,
          }),
        };
      } else {
        return {
          success: false,
          deploymentId: deployment.id,
          error: `Deployment failed with status: ${finalDeployment.status}`,
        };
      }
    } catch (error) {
      console.error('Error deploying blueprint to Render:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  async setupBlueprintDeployment(blueprintId, serviceId, config) {
    try {
      const webhookPayload = {
        action: 'deploy',
        timestamp: new Date().toISOString(),
        environment: config.environment,
        service_id: serviceId,
        metadata: {
          blueprint_id: blueprintId,
          auto_deploy: config.autoDeploy,
          branch: config.branch || 'main',
        },
      };
      const result = await this.triggerDeployment(webhookPayload);
      if (result.success) {
        return {
          success: true,
          webhookUrl: this.config.webhookUrl,
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to set up webhook',
        };
      }
    } catch (error) {
      console.error('Error setting up blueprint deployment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
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
      console.error('Render health check failed:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }
  async getDeploymentLogs(serviceId, deploymentId) {
    try {
      const response = await this.client.get(
        `/v1/services/${serviceId}/deploys/${deploymentId}/logs`
      );
      return {
        logs: response.data.logs || '',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching deployment logs:', error);
      throw new Error(
        `Failed to fetch deployment logs: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async restartService(serviceId) {
    try {
      const response = await this.client.post(
        `/v1/services/${serviceId}/restart`
      );
      return {
        success: true,
        deploymentId: response.data.deployment_id,
      };
    } catch (error) {
      console.error('Error restarting Render service:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
exports.RenderIntegration = RenderIntegration;
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
//# sourceMappingURL=render_integration.js.map
