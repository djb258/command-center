import { z } from 'zod';
export declare const RenderConfigSchema: z.ZodObject<
  {
    apiKey: z.ZodString;
    webhookUrl: z.ZodString;
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
    webhookUrl: string;
  },
  {
    apiKey: string;
    webhookUrl: string;
    timeout?: number | undefined;
    baseUrl?: string | undefined;
    retryAttempts?: number | undefined;
  }
>;
export type RenderConfig = z.infer<typeof RenderConfigSchema>;
export declare const RenderServiceSchema: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<
      ['web_service', 'static_site', 'background_worker', 'cron_job']
    >;
    status: z.ZodEnum<
      ['live', 'suspended', 'deleted', 'build_failed', 'deploy_failed']
    >;
    service_details: z.ZodOptional<
      z.ZodObject<
        {
          url: z.ZodOptional<z.ZodString>;
          environment: z.ZodOptional<z.ZodEnum<['production', 'preview']>>;
          region: z.ZodOptional<z.ZodString>;
          plan: z.ZodOptional<z.ZodString>;
        },
        'strip',
        z.ZodTypeAny,
        {
          url?: string | undefined;
          environment?: 'production' | 'preview' | undefined;
          region?: string | undefined;
          plan?: string | undefined;
        },
        {
          url?: string | undefined;
          environment?: 'production' | 'preview' | undefined;
          region?: string | undefined;
          plan?: string | undefined;
        }
      >
    >;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
  },
  'strip',
  z.ZodTypeAny,
  {
    status: 'live' | 'suspended' | 'deleted' | 'build_failed' | 'deploy_failed';
    type: 'web_service' | 'static_site' | 'background_worker' | 'cron_job';
    created_at: Date;
    id: string;
    name: string;
    updated_at: Date;
    service_details?:
      | {
          url?: string | undefined;
          environment?: 'production' | 'preview' | undefined;
          region?: string | undefined;
          plan?: string | undefined;
        }
      | undefined;
  },
  {
    status: 'live' | 'suspended' | 'deleted' | 'build_failed' | 'deploy_failed';
    type: 'web_service' | 'static_site' | 'background_worker' | 'cron_job';
    created_at: Date;
    id: string;
    name: string;
    updated_at: Date;
    service_details?:
      | {
          url?: string | undefined;
          environment?: 'production' | 'preview' | undefined;
          region?: string | undefined;
          plan?: string | undefined;
        }
      | undefined;
  }
>;
export type RenderService = z.infer<typeof RenderServiceSchema>;
export declare const RenderDeploymentSchema: z.ZodObject<
  {
    id: z.ZodString;
    service_id: z.ZodString;
    status: z.ZodEnum<['pending', 'building', 'live', 'failed', 'cancelled']>;
    commit: z.ZodOptional<
      z.ZodObject<
        {
          id: z.ZodOptional<z.ZodString>;
          message: z.ZodOptional<z.ZodString>;
          author: z.ZodOptional<z.ZodString>;
        },
        'strip',
        z.ZodTypeAny,
        {
          message?: string | undefined;
          id?: string | undefined;
          author?: string | undefined;
        },
        {
          message?: string | undefined;
          id?: string | undefined;
          author?: string | undefined;
        }
      >
    >;
    environment: z.ZodOptional<z.ZodEnum<['production', 'preview']>>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
    finished_at: z.ZodOptional<z.ZodDate>;
  },
  'strip',
  z.ZodTypeAny,
  {
    status: 'pending' | 'failed' | 'cancelled' | 'live' | 'building';
    created_at: Date;
    id: string;
    updated_at: Date;
    service_id: string;
    environment?: 'production' | 'preview' | undefined;
    commit?:
      | {
          message?: string | undefined;
          id?: string | undefined;
          author?: string | undefined;
        }
      | undefined;
    finished_at?: Date | undefined;
  },
  {
    status: 'pending' | 'failed' | 'cancelled' | 'live' | 'building';
    created_at: Date;
    id: string;
    updated_at: Date;
    service_id: string;
    environment?: 'production' | 'preview' | undefined;
    commit?:
      | {
          message?: string | undefined;
          id?: string | undefined;
          author?: string | undefined;
        }
      | undefined;
    finished_at?: Date | undefined;
  }
>;
export type RenderDeployment = z.infer<typeof RenderDeploymentSchema>;
export declare const RenderWebhookPayloadSchema: z.ZodObject<
  {
    action: z.ZodEnum<['deploy', 'build', 'restart', 'suspend']>;
    timestamp: z.ZodString;
    environment: z.ZodOptional<
      z.ZodEnum<['production', 'preview', 'development']>
    >;
    service_id: z.ZodOptional<z.ZodString>;
    deployment_id: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    timestamp: string;
    action: 'deploy' | 'build' | 'restart' | 'suspend';
    metadata?: Record<string, unknown> | undefined;
    environment?: 'production' | 'preview' | 'development' | undefined;
    service_id?: string | undefined;
    deployment_id?: string | undefined;
  },
  {
    timestamp: string;
    action: 'deploy' | 'build' | 'restart' | 'suspend';
    metadata?: Record<string, unknown> | undefined;
    environment?: 'production' | 'preview' | 'development' | undefined;
    service_id?: string | undefined;
    deployment_id?: string | undefined;
  }
>;
export type RenderWebhookPayload = z.infer<typeof RenderWebhookPayloadSchema>;
export declare class RenderIntegration {
  private config;
  private client;
  constructor(config: RenderConfig);
  triggerDeployment(payload?: Partial<RenderWebhookPayload>): Promise<{
    success: boolean;
    statusCode: number;
    response?: unknown;
    error?: string;
  }>;
  getServices(): Promise<RenderService[]>;
  getService(serviceId: string): Promise<RenderService>;
  getDeployments(serviceId: string): Promise<RenderDeployment[]>;
  getDeployment(
    serviceId: string,
    deploymentId: string
  ): Promise<RenderDeployment>;
  createDeployment(
    serviceId: string,
    options?: {
      branch?: string;
      commitId?: string;
      environment?: 'production' | 'preview';
    }
  ): Promise<RenderDeployment>;
  deployBlueprint(
    blueprintData: unknown,
    serviceId: string
  ): Promise<{
    success: boolean;
    deploymentId?: string;
    serviceUrl?: string;
    error?: string;
  }>;
  setupBlueprintDeployment(
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
  healthCheck(): Promise<{
    status: string;
    timestamp: string;
    version?: string;
  }>;
  getDeploymentLogs(
    serviceId: string,
    deploymentId: string
  ): Promise<{
    logs: string;
    timestamp: string;
  }>;
  restartService(serviceId: string): Promise<{
    success: boolean;
    deploymentId?: string;
    error?: string;
  }>;
}
export declare const validateRenderConfig: (data: unknown) => RenderConfig;
export declare const validateRenderService: (data: unknown) => RenderService;
export declare const validateRenderDeployment: (
  data: unknown
) => RenderDeployment;
export declare const validateRenderWebhookPayload: (
  data: unknown
) => RenderWebhookPayload;
//# sourceMappingURL=render_integration.d.ts.map
