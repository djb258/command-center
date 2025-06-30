import { z } from 'zod';
export declare const BaseBlueprintSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    version: z.ZodString;
    status: z.ZodEnum<["active", "inactive", "draft", "archived"]>;
    description: z.ZodOptional<z.ZodString>;
    author: z.ZodString;
    timestamp: z.ZodString;
    created_at: z.ZodOptional<z.ZodDate>;
    updated_at: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive" | "draft" | "archived";
    id: string;
    name: string;
    version: string;
    author: string;
    timestamp: string;
    created_at?: Date | undefined;
    description?: string | undefined;
    updated_at?: Date | undefined;
}, {
    status: "active" | "inactive" | "draft" | "archived";
    id: string;
    name: string;
    version: string;
    author: string;
    timestamp: string;
    created_at?: Date | undefined;
    description?: string | undefined;
    updated_at?: Date | undefined;
}>;
export type BaseBlueprint = z.infer<typeof BaseBlueprintSchema>;
export declare const NeonBlueprintSchema: z.ZodObject<{
    name: z.ZodString;
    version: z.ZodString;
    status: z.ZodEnum<["active", "inactive", "draft", "archived"]>;
    description: z.ZodOptional<z.ZodString>;
    author: z.ZodString;
    timestamp: z.ZodString;
    created_at: z.ZodOptional<z.ZodDate>;
    updated_at: z.ZodOptional<z.ZodDate>;
} & {
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    category: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive" | "draft" | "archived";
    id: string;
    name: string;
    version: string;
    author: string;
    timestamp: string;
    created_at?: Date | undefined;
    description?: string | undefined;
    updated_at?: Date | undefined;
    metadata?: Record<string, unknown> | undefined;
    tags?: string[] | undefined;
    category?: string | undefined;
    priority?: "low" | "medium" | "high" | "critical" | undefined;
}, {
    status: "active" | "inactive" | "draft" | "archived";
    id: string;
    name: string;
    version: string;
    author: string;
    timestamp: string;
    created_at?: Date | undefined;
    description?: string | undefined;
    updated_at?: Date | undefined;
    metadata?: Record<string, unknown> | undefined;
    tags?: string[] | undefined;
    category?: string | undefined;
    priority?: "low" | "medium" | "high" | "critical" | undefined;
}>;
export type NeonBlueprint = z.infer<typeof NeonBlueprintSchema>;
export declare const FirebaseBlueprintSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    version: z.ZodString;
    status: z.ZodEnum<["active", "inactive", "draft", "archived"]>;
    description: z.ZodOptional<z.ZodString>;
    author: z.ZodString;
    timestamp: z.ZodString;
    created_at: z.ZodOptional<z.ZodDate>;
    updated_at: z.ZodOptional<z.ZodDate>;
} & {
    firebase_id: z.ZodOptional<z.ZodString>;
    collection: z.ZodDefault<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    category: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "critical"]>>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive" | "draft" | "archived";
    id: string;
    name: string;
    version: string;
    author: string;
    timestamp: string;
    collection: string;
    created_at?: Date | undefined;
    description?: string | undefined;
    updated_at?: Date | undefined;
    metadata?: Record<string, unknown> | undefined;
    tags?: string[] | undefined;
    category?: string | undefined;
    priority?: "low" | "medium" | "high" | "critical" | undefined;
    firebase_id?: string | undefined;
}, {
    status: "active" | "inactive" | "draft" | "archived";
    id: string;
    name: string;
    version: string;
    author: string;
    timestamp: string;
    created_at?: Date | undefined;
    description?: string | undefined;
    updated_at?: Date | undefined;
    metadata?: Record<string, unknown> | undefined;
    tags?: string[] | undefined;
    category?: string | undefined;
    priority?: "low" | "medium" | "high" | "critical" | undefined;
    firebase_id?: string | undefined;
    collection?: string | undefined;
}>;
export type FirebaseBlueprint = z.infer<typeof FirebaseBlueprintSchema>;
export declare const BigQueryBlueprintSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    version: z.ZodString;
    status: z.ZodEnum<["active", "inactive", "draft", "archived"]>;
    description: z.ZodOptional<z.ZodString>;
    author: z.ZodString;
    timestamp: z.ZodString;
    created_at: z.ZodOptional<z.ZodDate>;
    updated_at: z.ZodOptional<z.ZodDate>;
} & {
    dataset_id: z.ZodOptional<z.ZodString>;
    table_id: z.ZodOptional<z.ZodString>;
    partition_date: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    category: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "critical"]>>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive" | "draft" | "archived";
    id: string;
    name: string;
    version: string;
    author: string;
    timestamp: string;
    created_at?: Date | undefined;
    description?: string | undefined;
    updated_at?: Date | undefined;
    metadata?: Record<string, unknown> | undefined;
    tags?: string[] | undefined;
    category?: string | undefined;
    priority?: "low" | "medium" | "high" | "critical" | undefined;
    dataset_id?: string | undefined;
    table_id?: string | undefined;
    partition_date?: string | undefined;
}, {
    status: "active" | "inactive" | "draft" | "archived";
    id: string;
    name: string;
    version: string;
    author: string;
    timestamp: string;
    created_at?: Date | undefined;
    description?: string | undefined;
    updated_at?: Date | undefined;
    metadata?: Record<string, unknown> | undefined;
    tags?: string[] | undefined;
    category?: string | undefined;
    priority?: "low" | "medium" | "high" | "critical" | undefined;
    dataset_id?: string | undefined;
    table_id?: string | undefined;
    partition_date?: string | undefined;
}>;
export type BigQueryBlueprint = z.infer<typeof BigQueryBlueprintSchema>;
export declare const AgentTaskSchema: z.ZodObject<{
    id: z.ZodString;
    blueprint_id: z.ZodString;
    agent_id: z.ZodString;
    status: z.ZodEnum<["pending", "running", "completed", "failed", "cancelled"]>;
    task_type: z.ZodString;
    payload: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    result: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
    started_at: z.ZodOptional<z.ZodDate>;
    completed_at: z.ZodOptional<z.ZodDate>;
    error_message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "running" | "completed" | "failed" | "cancelled";
    created_at: Date;
    agent_id: string;
    blueprint_id: string;
    id: string;
    updated_at: Date;
    task_type: string;
    payload?: Record<string, unknown> | undefined;
    result?: Record<string, unknown> | undefined;
    started_at?: Date | undefined;
    completed_at?: Date | undefined;
    error_message?: string | undefined;
}, {
    status: "pending" | "running" | "completed" | "failed" | "cancelled";
    created_at: Date;
    agent_id: string;
    blueprint_id: string;
    id: string;
    updated_at: Date;
    task_type: string;
    payload?: Record<string, unknown> | undefined;
    result?: Record<string, unknown> | undefined;
    started_at?: Date | undefined;
    completed_at?: Date | undefined;
    error_message?: string | undefined;
}>;
export type AgentTask = z.infer<typeof AgentTaskSchema>;
export declare const ErrorLogSchema: z.ZodObject<{
    id: z.ZodString;
    timestamp: z.ZodDate;
    level: z.ZodEnum<["debug", "info", "warning", "error", "critical"]>;
    message: z.ZodString;
    stack_trace: z.ZodOptional<z.ZodString>;
    context: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    blueprint_id: z.ZodOptional<z.ZodString>;
    agent_id: z.ZodOptional<z.ZodString>;
    user_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    id: string;
    timestamp: Date;
    level: "warning" | "error" | "critical" | "debug" | "info";
    agent_id?: string | undefined;
    blueprint_id?: string | undefined;
    stack_trace?: string | undefined;
    context?: Record<string, unknown> | undefined;
    user_id?: string | undefined;
}, {
    message: string;
    id: string;
    timestamp: Date;
    level: "warning" | "error" | "critical" | "debug" | "info";
    agent_id?: string | undefined;
    blueprint_id?: string | undefined;
    stack_trace?: string | undefined;
    context?: Record<string, unknown> | undefined;
    user_id?: string | undefined;
}>;
export type ErrorLog = z.infer<typeof ErrorLogSchema>;
export declare const HumanFirebreakQueueSchema: z.ZodObject<{
    id: z.ZodString;
    blueprint_id: z.ZodString;
    priority: z.ZodEnum<["low", "medium", "high", "critical"]>;
    status: z.ZodEnum<["queued", "in_progress", "resolved", "escalated"]>;
    assigned_to: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
    resolved_at: z.ZodOptional<z.ZodDate>;
    resolution_notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "queued" | "in_progress" | "resolved" | "escalated";
    created_at: Date;
    blueprint_id: string;
    id: string;
    description: string;
    updated_at: Date;
    priority: "low" | "medium" | "high" | "critical";
    assigned_to?: string | undefined;
    resolved_at?: Date | undefined;
    resolution_notes?: string | undefined;
}, {
    status: "queued" | "in_progress" | "resolved" | "escalated";
    created_at: Date;
    blueprint_id: string;
    id: string;
    description: string;
    updated_at: Date;
    priority: "low" | "medium" | "high" | "critical";
    assigned_to?: string | undefined;
    resolved_at?: Date | undefined;
    resolution_notes?: string | undefined;
}>;
export type HumanFirebreakQueue = z.infer<typeof HumanFirebreakQueueSchema>;
export declare const validateBlueprintForNeon: (data: unknown) => NeonBlueprint;
export declare const validateBlueprintForFirebase: (data: unknown) => FirebaseBlueprint;
export declare const validateBlueprintForBigQuery: (data: unknown) => BigQueryBlueprint;
export declare const validateAgentTask: (data: unknown) => AgentTask;
export declare const validateErrorLog: (data: unknown) => ErrorLog;
export declare const validateHumanFirebreakQueue: (data: unknown) => HumanFirebreakQueue;
export declare const MindPalConfigSchema: z.ZodObject<{
    apiKey: z.ZodString;
    baseUrl: z.ZodDefault<z.ZodString>;
    timeout: z.ZodDefault<z.ZodNumber>;
    retryAttempts: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    timeout: number;
    apiKey: string;
    baseUrl: string;
    retryAttempts: number;
}, {
    apiKey: string;
    timeout?: number | undefined;
    baseUrl?: string | undefined;
    retryAttempts?: number | undefined;
}>;
export type MindPalConfig = z.infer<typeof MindPalConfigSchema>;
export declare const MindPalAgentSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["blueprint_validator", "data_processor", "automation_agent"]>;
    status: z.ZodEnum<["active", "inactive", "training", "error"]>;
    capabilities: z.ZodArray<z.ZodString, "many">;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: "error" | "active" | "inactive" | "training";
    type: "blueprint_validator" | "data_processor" | "automation_agent";
    created_at: Date;
    id: string;
    name: string;
    updated_at: Date;
    capabilities: string[];
    metadata?: Record<string, unknown> | undefined;
}, {
    status: "error" | "active" | "inactive" | "training";
    type: "blueprint_validator" | "data_processor" | "automation_agent";
    created_at: Date;
    id: string;
    name: string;
    updated_at: Date;
    capabilities: string[];
    metadata?: Record<string, unknown> | undefined;
}>;
export type MindPalAgent = z.infer<typeof MindPalAgentSchema>;
export declare const MindPalTaskSchema: z.ZodObject<{
    id: z.ZodString;
    agent_id: z.ZodString;
    blueprint_id: z.ZodString;
    task_type: z.ZodEnum<["validate", "process", "automate", "analyze"]>;
    payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    status: z.ZodEnum<["pending", "running", "completed", "failed"]>;
    result: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    error_message: z.ZodOptional<z.ZodString>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
    completed_at: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "running" | "completed" | "failed";
    created_at: Date;
    agent_id: string;
    blueprint_id: string;
    id: string;
    updated_at: Date;
    task_type: "validate" | "process" | "automate" | "analyze";
    payload: Record<string, unknown>;
    result?: Record<string, unknown> | undefined;
    completed_at?: Date | undefined;
    error_message?: string | undefined;
}, {
    status: "pending" | "running" | "completed" | "failed";
    created_at: Date;
    agent_id: string;
    blueprint_id: string;
    id: string;
    updated_at: Date;
    task_type: "validate" | "process" | "automate" | "analyze";
    payload: Record<string, unknown>;
    result?: Record<string, unknown> | undefined;
    completed_at?: Date | undefined;
    error_message?: string | undefined;
}>;
export type MindPalTask = z.infer<typeof MindPalTaskSchema>;
export declare const validateMindPalConfig: (data: unknown) => MindPalConfig;
export declare const validateMindPalAgent: (data: unknown) => MindPalAgent;
export declare const validateMindPalTask: (data: unknown) => MindPalTask;
export declare const DeerFlowConfigSchema: z.ZodObject<{
    apiKey: z.ZodString;
    baseUrl: z.ZodDefault<z.ZodString>;
    timeout: z.ZodDefault<z.ZodNumber>;
    retryAttempts: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    timeout: number;
    apiKey: string;
    baseUrl: string;
    retryAttempts: number;
}, {
    apiKey: string;
    timeout?: number | undefined;
    baseUrl?: string | undefined;
    retryAttempts?: number | undefined;
}>;
export type DeerFlowConfig = z.infer<typeof DeerFlowConfigSchema>;
export declare const DeerFlowWorkflowSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["active", "inactive", "draft", "archived"]>;
    type: z.ZodEnum<["data_pipeline", "automation", "integration", "monitoring"]>;
    triggers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    steps: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive" | "draft" | "archived";
    type: "data_pipeline" | "automation" | "integration" | "monitoring";
    created_at: Date;
    id: string;
    name: string;
    updated_at: Date;
    description?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    triggers?: string[] | undefined;
    steps?: Record<string, unknown>[] | undefined;
}, {
    status: "active" | "inactive" | "draft" | "archived";
    type: "data_pipeline" | "automation" | "integration" | "monitoring";
    created_at: Date;
    id: string;
    name: string;
    updated_at: Date;
    description?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    triggers?: string[] | undefined;
    steps?: Record<string, unknown>[] | undefined;
}>;
export type DeerFlowWorkflow = z.infer<typeof DeerFlowWorkflowSchema>;
export declare const DeerFlowExecutionSchema: z.ZodObject<{
    id: z.ZodString;
    workflow_id: z.ZodString;
    status: z.ZodEnum<["pending", "running", "completed", "failed", "cancelled"]>;
    input_data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    output_data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    error_message: z.ZodOptional<z.ZodString>;
    started_at: z.ZodOptional<z.ZodDate>;
    completed_at: z.ZodOptional<z.ZodDate>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "running" | "completed" | "failed" | "cancelled";
    created_at: Date;
    id: string;
    updated_at: Date;
    workflow_id: string;
    started_at?: Date | undefined;
    completed_at?: Date | undefined;
    error_message?: string | undefined;
    input_data?: Record<string, unknown> | undefined;
    output_data?: Record<string, unknown> | undefined;
}, {
    status: "pending" | "running" | "completed" | "failed" | "cancelled";
    created_at: Date;
    id: string;
    updated_at: Date;
    workflow_id: string;
    started_at?: Date | undefined;
    completed_at?: Date | undefined;
    error_message?: string | undefined;
    input_data?: Record<string, unknown> | undefined;
    output_data?: Record<string, unknown> | undefined;
}>;
export type DeerFlowExecution = z.infer<typeof DeerFlowExecutionSchema>;
export declare const DeerFlowBlueprintIntegrationSchema: z.ZodObject<{
    id: z.ZodString;
    blueprint_id: z.ZodString;
    workflow_id: z.ZodString;
    integration_type: z.ZodEnum<["validation", "processing", "monitoring", "automation"]>;
    config: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    status: z.ZodEnum<["active", "inactive", "error"]>;
    last_execution: z.ZodOptional<z.ZodDate>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: "error" | "active" | "inactive";
    created_at: Date;
    blueprint_id: string;
    config: Record<string, unknown>;
    id: string;
    updated_at: Date;
    workflow_id: string;
    integration_type: "validation" | "automation" | "monitoring" | "processing";
    last_execution?: Date | undefined;
}, {
    status: "error" | "active" | "inactive";
    created_at: Date;
    blueprint_id: string;
    config: Record<string, unknown>;
    id: string;
    updated_at: Date;
    workflow_id: string;
    integration_type: "validation" | "automation" | "monitoring" | "processing";
    last_execution?: Date | undefined;
}>;
export type DeerFlowBlueprintIntegration = z.infer<typeof DeerFlowBlueprintIntegrationSchema>;
export declare const RenderConfigSchema: z.ZodObject<{
    apiKey: z.ZodString;
    webhookUrl: z.ZodString;
    baseUrl: z.ZodDefault<z.ZodString>;
    timeout: z.ZodDefault<z.ZodNumber>;
    retryAttempts: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    timeout: number;
    apiKey: string;
    baseUrl: string;
    retryAttempts: number;
    webhookUrl: string;
}, {
    apiKey: string;
    webhookUrl: string;
    timeout?: number | undefined;
    baseUrl?: string | undefined;
    retryAttempts?: number | undefined;
}>;
export type RenderConfig = z.infer<typeof RenderConfigSchema>;
export declare const RenderServiceSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["web_service", "static_site", "background_worker", "cron_job"]>;
    status: z.ZodEnum<["live", "suspended", "deleted", "build_failed", "deploy_failed"]>;
    service_details: z.ZodOptional<z.ZodObject<{
        url: z.ZodOptional<z.ZodString>;
        environment: z.ZodOptional<z.ZodEnum<["production", "preview"]>>;
        region: z.ZodOptional<z.ZodString>;
        plan: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        url?: string | undefined;
        environment?: "production" | "preview" | undefined;
        region?: string | undefined;
        plan?: string | undefined;
    }, {
        url?: string | undefined;
        environment?: "production" | "preview" | undefined;
        region?: string | undefined;
        plan?: string | undefined;
    }>>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: "live" | "suspended" | "deleted" | "build_failed" | "deploy_failed";
    type: "web_service" | "static_site" | "background_worker" | "cron_job";
    created_at: Date;
    id: string;
    name: string;
    updated_at: Date;
    service_details?: {
        url?: string | undefined;
        environment?: "production" | "preview" | undefined;
        region?: string | undefined;
        plan?: string | undefined;
    } | undefined;
}, {
    status: "live" | "suspended" | "deleted" | "build_failed" | "deploy_failed";
    type: "web_service" | "static_site" | "background_worker" | "cron_job";
    created_at: Date;
    id: string;
    name: string;
    updated_at: Date;
    service_details?: {
        url?: string | undefined;
        environment?: "production" | "preview" | undefined;
        region?: string | undefined;
        plan?: string | undefined;
    } | undefined;
}>;
export type RenderService = z.infer<typeof RenderServiceSchema>;
export declare const RenderDeploymentSchema: z.ZodObject<{
    id: z.ZodString;
    service_id: z.ZodString;
    status: z.ZodEnum<["pending", "building", "live", "failed", "cancelled"]>;
    commit: z.ZodOptional<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        message: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message?: string | undefined;
        id?: string | undefined;
        author?: string | undefined;
    }, {
        message?: string | undefined;
        id?: string | undefined;
        author?: string | undefined;
    }>>;
    environment: z.ZodOptional<z.ZodEnum<["production", "preview"]>>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
    finished_at: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "failed" | "cancelled" | "live" | "building";
    created_at: Date;
    id: string;
    updated_at: Date;
    service_id: string;
    environment?: "production" | "preview" | undefined;
    commit?: {
        message?: string | undefined;
        id?: string | undefined;
        author?: string | undefined;
    } | undefined;
    finished_at?: Date | undefined;
}, {
    status: "pending" | "failed" | "cancelled" | "live" | "building";
    created_at: Date;
    id: string;
    updated_at: Date;
    service_id: string;
    environment?: "production" | "preview" | undefined;
    commit?: {
        message?: string | undefined;
        id?: string | undefined;
        author?: string | undefined;
    } | undefined;
    finished_at?: Date | undefined;
}>;
export type RenderDeployment = z.infer<typeof RenderDeploymentSchema>;
export declare const RenderWebhookPayloadSchema: z.ZodObject<{
    action: z.ZodEnum<["deploy", "build", "restart", "suspend"]>;
    timestamp: z.ZodString;
    environment: z.ZodOptional<z.ZodEnum<["production", "preview", "development"]>>;
    service_id: z.ZodOptional<z.ZodString>;
    deployment_id: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    action: "deploy" | "build" | "restart" | "suspend";
    metadata?: Record<string, unknown> | undefined;
    environment?: "production" | "preview" | "development" | undefined;
    service_id?: string | undefined;
    deployment_id?: string | undefined;
}, {
    timestamp: string;
    action: "deploy" | "build" | "restart" | "suspend";
    metadata?: Record<string, unknown> | undefined;
    environment?: "production" | "preview" | "development" | undefined;
    service_id?: string | undefined;
    deployment_id?: string | undefined;
}>;
export type RenderWebhookPayload = z.infer<typeof RenderWebhookPayloadSchema>;
export declare const validateDeerFlowConfig: (data: unknown) => DeerFlowConfig;
export declare const validateDeerFlowWorkflow: (data: unknown) => DeerFlowWorkflow;
export declare const validateDeerFlowExecution: (data: unknown) => DeerFlowExecution;
export declare const validateDeerFlowBlueprintIntegration: (data: unknown) => DeerFlowBlueprintIntegration;
export declare const validateRenderConfig: (data: unknown) => RenderConfig;
export declare const validateRenderService: (data: unknown) => RenderService;
export declare const validateRenderDeployment: (data: unknown) => RenderDeployment;
export declare const validateRenderWebhookPayload: (data: unknown) => RenderWebhookPayload;
export declare const MakeConfigSchema: z.ZodObject<{
    apiKey: z.ZodString;
    baseUrl: z.ZodDefault<z.ZodString>;
    timeout: z.ZodDefault<z.ZodNumber>;
    retryAttempts: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    timeout: number;
    apiKey: string;
    baseUrl: string;
    retryAttempts: number;
}, {
    apiKey: string;
    timeout?: number | undefined;
    baseUrl?: string | undefined;
    retryAttempts?: number | undefined;
}>;
export type MakeConfig = z.infer<typeof MakeConfigSchema>;
export declare const MakeScenarioSchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["active", "inactive", "draft", "error"]>;
    flow: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">>;
    connections: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: "error" | "active" | "inactive" | "draft";
    created_at: Date;
    id: number;
    name: string;
    updated_at: Date;
    description?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    flow?: Record<string, unknown>[] | undefined;
    connections?: Record<string, unknown>[] | undefined;
}, {
    status: "error" | "active" | "inactive" | "draft";
    created_at: Date;
    id: number;
    name: string;
    updated_at: Date;
    description?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    flow?: Record<string, unknown>[] | undefined;
    connections?: Record<string, unknown>[] | undefined;
}>;
export type MakeScenario = z.infer<typeof MakeScenarioSchema>;
export declare const MakeExecutionSchema: z.ZodObject<{
    id: z.ZodNumber;
    scenario_id: z.ZodNumber;
    status: z.ZodEnum<["pending", "running", "completed", "failed", "cancelled"]>;
    input_data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    output_data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    error_message: z.ZodOptional<z.ZodString>;
    started_at: z.ZodOptional<z.ZodDate>;
    completed_at: z.ZodOptional<z.ZodDate>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "running" | "completed" | "failed" | "cancelled";
    created_at: Date;
    id: number;
    updated_at: Date;
    scenario_id: number;
    started_at?: Date | undefined;
    completed_at?: Date | undefined;
    error_message?: string | undefined;
    input_data?: Record<string, unknown> | undefined;
    output_data?: Record<string, unknown> | undefined;
}, {
    status: "pending" | "running" | "completed" | "failed" | "cancelled";
    created_at: Date;
    id: number;
    updated_at: Date;
    scenario_id: number;
    started_at?: Date | undefined;
    completed_at?: Date | undefined;
    error_message?: string | undefined;
    input_data?: Record<string, unknown> | undefined;
    output_data?: Record<string, unknown> | undefined;
}>;
export type MakeExecution = z.infer<typeof MakeExecutionSchema>;
export declare const MakeConnectionSchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    type: z.ZodEnum<["webhook", "api", "database", "file", "email", "custom"]>;
    status: z.ZodEnum<["active", "inactive", "error"]>;
    config: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: "error" | "active" | "inactive";
    type: "custom" | "webhook" | "api" | "database" | "file" | "email";
    created_at: Date;
    config: Record<string, unknown>;
    id: number;
    name: string;
    updated_at: Date;
    metadata?: Record<string, unknown> | undefined;
}, {
    status: "error" | "active" | "inactive";
    type: "custom" | "webhook" | "api" | "database" | "file" | "email";
    created_at: Date;
    config: Record<string, unknown>;
    id: number;
    name: string;
    updated_at: Date;
    metadata?: Record<string, unknown> | undefined;
}>;
export type MakeConnection = z.infer<typeof MakeConnectionSchema>;
export declare const MakeBlueprintIntegrationSchema: z.ZodObject<{
    id: z.ZodString;
    blueprint_id: z.ZodString;
    scenario_id: z.ZodNumber;
    integration_type: z.ZodEnum<["validation", "processing", "monitoring", "automation"]>;
    config: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    status: z.ZodEnum<["active", "inactive", "error"]>;
    last_execution: z.ZodOptional<z.ZodDate>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: "error" | "active" | "inactive";
    created_at: Date;
    blueprint_id: string;
    config: Record<string, unknown>;
    id: string;
    updated_at: Date;
    integration_type: "validation" | "automation" | "monitoring" | "processing";
    scenario_id: number;
    last_execution?: Date | undefined;
}, {
    status: "error" | "active" | "inactive";
    created_at: Date;
    blueprint_id: string;
    config: Record<string, unknown>;
    id: string;
    updated_at: Date;
    integration_type: "validation" | "automation" | "monitoring" | "processing";
    scenario_id: number;
    last_execution?: Date | undefined;
}>;
export type MakeBlueprintIntegration = z.infer<typeof MakeBlueprintIntegrationSchema>;
export declare const validateMakeConfig: (data: unknown) => MakeConfig;
export declare const validateMakeScenario: (data: unknown) => MakeScenario;
export declare const validateMakeExecution: (data: unknown) => MakeExecution;
export declare const validateMakeConnection: (data: unknown) => MakeConnection;
export declare const validateMakeBlueprintIntegration: (data: unknown) => MakeBlueprintIntegration;
export declare const GoogleWorkspaceConfigSchema: z.ZodObject<{
    clientId: z.ZodString;
    clientSecret: z.ZodString;
    redirectUri: z.ZodString;
    refreshToken: z.ZodOptional<z.ZodString>;
    scopes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
    refreshToken?: string | undefined;
}, {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    refreshToken?: string | undefined;
    scopes?: string[] | undefined;
}>;
export declare const GoogleDriveFileSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    mimeType: z.ZodString;
    size: z.ZodOptional<z.ZodString>;
    createdTime: z.ZodString;
    modifiedTime: z.ZodString;
    parents: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    webViewLink: z.ZodOptional<z.ZodString>;
    webContentLink: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    mimeType: string;
    createdTime: string;
    modifiedTime: string;
    size?: string | undefined;
    parents?: string[] | undefined;
    webViewLink?: string | undefined;
    webContentLink?: string | undefined;
}, {
    id: string;
    name: string;
    mimeType: string;
    createdTime: string;
    modifiedTime: string;
    size?: string | undefined;
    parents?: string[] | undefined;
    webViewLink?: string | undefined;
    webContentLink?: string | undefined;
}>;
export declare const GoogleDocsDocumentSchema: z.ZodObject<{
    documentId: z.ZodString;
    title: z.ZodString;
    body: z.ZodObject<{
        content: z.ZodArray<z.ZodAny, "many">;
    }, "strip", z.ZodTypeAny, {
        content: any[];
    }, {
        content: any[];
    }>;
    revisionId: z.ZodString;
    suggestionsViewMode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    documentId: string;
    title: string;
    body: {
        content: any[];
    };
    revisionId: string;
    suggestionsViewMode?: string | undefined;
}, {
    documentId: string;
    title: string;
    body: {
        content: any[];
    };
    revisionId: string;
    suggestionsViewMode?: string | undefined;
}>;
export declare const GoogleSheetsSpreadsheetSchema: z.ZodObject<{
    spreadsheetId: z.ZodString;
    properties: z.ZodObject<{
        title: z.ZodString;
        locale: z.ZodOptional<z.ZodString>;
        timeZone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        locale?: string | undefined;
        timeZone?: string | undefined;
    }, {
        title: string;
        locale?: string | undefined;
        timeZone?: string | undefined;
    }>;
    sheets: z.ZodArray<z.ZodObject<{
        properties: z.ZodObject<{
            sheetId: z.ZodNumber;
            title: z.ZodString;
            index: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            title: string;
            sheetId: number;
            index: number;
        }, {
            title: string;
            sheetId: number;
            index: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        properties: {
            title: string;
            sheetId: number;
            index: number;
        };
    }, {
        properties: {
            title: string;
            sheetId: number;
            index: number;
        };
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    spreadsheetId: string;
    properties: {
        title: string;
        locale?: string | undefined;
        timeZone?: string | undefined;
    };
    sheets: {
        properties: {
            title: string;
            sheetId: number;
            index: number;
        };
    }[];
}, {
    spreadsheetId: string;
    properties: {
        title: string;
        locale?: string | undefined;
        timeZone?: string | undefined;
    };
    sheets: {
        properties: {
            title: string;
            sheetId: number;
            index: number;
        };
    }[];
}>;
export declare const GoogleCalendarEventSchema: z.ZodObject<{
    id: z.ZodString;
    summary: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    start: z.ZodObject<{
        dateTime: z.ZodOptional<z.ZodString>;
        date: z.ZodOptional<z.ZodString>;
        timeZone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        date?: string | undefined;
        timeZone?: string | undefined;
        dateTime?: string | undefined;
    }, {
        date?: string | undefined;
        timeZone?: string | undefined;
        dateTime?: string | undefined;
    }>;
    end: z.ZodObject<{
        dateTime: z.ZodOptional<z.ZodString>;
        date: z.ZodOptional<z.ZodString>;
        timeZone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        date?: string | undefined;
        timeZone?: string | undefined;
        dateTime?: string | undefined;
    }, {
        date?: string | undefined;
        timeZone?: string | undefined;
        dateTime?: string | undefined;
    }>;
    attendees: z.ZodOptional<z.ZodArray<z.ZodObject<{
        email: z.ZodString;
        displayName: z.ZodOptional<z.ZodString>;
        responseStatus: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        displayName?: string | undefined;
        responseStatus?: string | undefined;
    }, {
        email: string;
        displayName?: string | undefined;
        responseStatus?: string | undefined;
    }>, "many">>;
    location: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    start: {
        date?: string | undefined;
        timeZone?: string | undefined;
        dateTime?: string | undefined;
    };
    id: string;
    summary: string;
    end: {
        date?: string | undefined;
        timeZone?: string | undefined;
        dateTime?: string | undefined;
    };
    status?: string | undefined;
    description?: string | undefined;
    attendees?: {
        email: string;
        displayName?: string | undefined;
        responseStatus?: string | undefined;
    }[] | undefined;
    location?: string | undefined;
}, {
    start: {
        date?: string | undefined;
        timeZone?: string | undefined;
        dateTime?: string | undefined;
    };
    id: string;
    summary: string;
    end: {
        date?: string | undefined;
        timeZone?: string | undefined;
        dateTime?: string | undefined;
    };
    status?: string | undefined;
    description?: string | undefined;
    attendees?: {
        email: string;
        displayName?: string | undefined;
        responseStatus?: string | undefined;
    }[] | undefined;
    location?: string | undefined;
}>;
//# sourceMappingURL=blueprint-schemas.d.ts.map