import { BigQueryIngest } from '../scripts/bigquery_ingest';
import { FirebasePush } from '../scripts/firebase_push';
import { NeonSync } from '../scripts/neon_sync';
import { MindPalIntegration } from '../scripts/mindpal_integration';
import { DeerFlowIntegration } from '../scripts/deerflow_integration';
import { RenderIntegration } from '../scripts/render_integration';
import { MakeIntegration } from '../scripts/make_integration';
import { GoogleWorkspaceIntegration } from '../scripts/google_workspace_integration';
import { 
  validateBlueprintForNeon, 
  validateBlueprintForFirebase, 
  validateBlueprintForBigQuery,
  NeonBlueprint,
  FirebaseBlueprint,
  BigQueryBlueprint,
  MindPalConfig,
  DeerFlowConfig,
  RenderConfig,
  MakeConfig
} from './schemas/blueprint-schemas';

export { BigQueryIngest, FirebasePush, NeonSync, MindPalIntegration, DeerFlowIntegration, RenderIntegration, MakeIntegration };

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  validatedData?: {
    neon?: NeonBlueprint;
    firebase?: FirebaseBlueprint;
    bigquery?: BigQueryBlueprint;
  } | undefined;
}

// Main application class
export class BlueprintEnforcer {
  private bigquery: BigQueryIngest;
  private firebase: FirebasePush;
  private neon: NeonSync;
  private mindPalIntegration: MindPalIntegration;
  private deerFlowIntegration: DeerFlowIntegration;
  private renderIntegration: RenderIntegration;
  private makeIntegration: MakeIntegration;
  private googleWorkspace: GoogleWorkspaceIntegration;

  constructor(
    mindPalConfig?: MindPalConfig,
    deerFlowConfig?: DeerFlowConfig,
    renderConfig?: RenderConfig,
    makeConfig?: MakeConfig
  ) {
    this.bigquery = new BigQueryIngest();
    this.firebase = new FirebasePush();
    this.neon = new NeonSync();
    
    // Initialize MindPal with config or default values
    const mindPalFinalConfig = mindPalConfig || {
      apiKey: process.env.MINDPAL_API_KEY || '',
      baseUrl: process.env.MINDPAL_BASE_URL || 'https://api.mindpal.com',
      timeout: parseInt(process.env.MINDPAL_TIMEOUT || '30000'),
      retryAttempts: parseInt(process.env.MINDPAL_RETRY_ATTEMPTS || '3'),
    };
    this.mindPalIntegration = new MindPalIntegration(mindPalFinalConfig);

    // Initialize DeerFlow with config or default values
    const deerFlowFinalConfig = deerFlowConfig || {
      apiKey: process.env.DEERFLOW_API_KEY || '',
      baseUrl: process.env.DEERFLOW_BASE_URL || 'https://api.deerflow.com',
      timeout: parseInt(process.env.DEERFLOW_TIMEOUT || '30000'),
      retryAttempts: parseInt(process.env.DEERFLOW_RETRY_ATTEMPTS || '3'),
    };
    this.deerFlowIntegration = new DeerFlowIntegration(deerFlowFinalConfig);

    // Initialize Render with config or default values
    const renderFinalConfig = renderConfig || {
      apiKey: process.env.RENDER_API_KEY || '',
      webhookUrl: process.env.RENDER_WEBHOOK_URL || '',
      baseUrl: process.env.RENDER_BASE_URL || 'https://api.render.com',
      timeout: parseInt(process.env.RENDER_TIMEOUT || '30000'),
      retryAttempts: parseInt(process.env.RENDER_RETRY_ATTEMPTS || '3'),
    };
    this.renderIntegration = new RenderIntegration(renderFinalConfig);

    // Initialize Make.com with config or default values
    const makeFinalConfig = makeConfig || {
      apiKey: process.env.MAKE_API_KEY || '',
      baseUrl: process.env.MAKE_BASE_URL || 'https://www.make.com/api/v2',
      timeout: parseInt(process.env.MAKE_TIMEOUT || '30000'),
      retryAttempts: parseInt(process.env.MAKE_RETRY_ATTEMPTS || '3'),
    };
    this.makeIntegration = new MakeIntegration(makeFinalConfig);

    // Initialize Google Workspace integration
    this.googleWorkspace = new GoogleWorkspaceIntegration({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: process.env.GOOGLE_REDIRECT_URI!,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/gmail.readonly',
      ],
    });
  }

  /**
   * Validate blueprint data against all database schemas
   */
  validateBlueprint(blueprintData: unknown): ValidationResult {
    const errors: string[] = [];
    const validatedData: {
      neon?: NeonBlueprint;
      firebase?: FirebaseBlueprint;
      bigquery?: BigQueryBlueprint;
    } = {};

    // Validate for Neon
    try {
      validatedData.neon = validateBlueprintForNeon(blueprintData);
    } catch (error) {
      errors.push(`Neon validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Validate for Firebase
    try {
      validatedData.firebase = validateBlueprintForFirebase(blueprintData);
    } catch (error) {
      errors.push(`Firebase validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Validate for BigQuery
    try {
      validatedData.bigquery = validateBlueprintForBigQuery(blueprintData);
    } catch (error) {
      errors.push(`BigQuery validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      validatedData: errors.length === 0 ? validatedData : undefined
    };
  }

  /**
   * Process blueprint with comprehensive validation and error handling
   */
  async processBlueprint(blueprintData: unknown): Promise<void> {
    try {
      const name = (blueprintData as { name?: string }).name;
      console.log('Processing blueprint:', name);

      // Validate data first
      const validation = this.validateBlueprint(blueprintData);
      
      if (!validation.isValid) {
        console.error('Blueprint validation failed:');
        validation.errors.forEach(error => console.error(`  - ${error}`));
        throw new Error('Blueprint data does not conform to required schemas');
      }

      console.log('✅ Blueprint validation passed for all databases');

      // Process to each database with validated data
      const results = await Promise.allSettled([
        this.processToFirebase(validation.validatedData!.firebase!),
        this.processToNeon(validation.validatedData!.neon!),
        this.processToBigQuery(validation.validatedData!.bigquery!)
      ]);

      // Check results
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        console.warn(`⚠️  ${failures.length} database operations failed:`);
        failures.forEach((failure, index) => {
          if (failure.status === 'rejected') {
            console.warn(`  - Database ${index + 1}: ${failure.reason}`);
          }
        });
      }

      const successes = results.filter(result => result.status === 'fulfilled');
      console.log(`✅ Successfully processed to ${successes.length}/3 databases`);

    } catch (error) {
      console.error('Error processing blueprint:', error);
      throw error;
    }
  }

  private async processToFirebase(data: FirebaseBlueprint): Promise<string> {
    console.log('📤 Pushing to Firebase...');
    return await this.firebase.pushData({
      collection: 'blueprints',
      data: data,
    });
  }

  private async processToNeon(data: NeonBlueprint): Promise<void> {
    console.log('🔄 Syncing to Neon...');
    await this.neon.syncData({
      table: 'blueprints',
      data: [data],
      upsert: true,
      conflictColumns: ['id'],
    });
  }

  private async processToBigQuery(data: BigQueryBlueprint): Promise<void> {
    console.log('📊 Ingesting to BigQuery...');
    await this.bigquery.ingestData({
      tableId: 'blueprints',
      data: [data],
    });
  }

  /**
   * Get validation report for existing data
   */
  async validateExistingData(): Promise<void> {
    console.log('🔍 Validating existing data across all databases...');
    
    try {
      // This would typically query existing data and validate it
      // For now, we'll just show the structure
      console.log('Validation framework ready for existing data checks');
    } catch (error) {
      console.error('Error validating existing data:', error);
    }
  }

  /**
   * Generate schema compliance report
   */
  async generateComplianceReport(): Promise<void> {
    console.log('📋 Generating schema compliance report...');
    
    // This would analyze data across all databases and report compliance
    console.log('Compliance reporting framework ready');
  }

  async cleanup(): Promise<void> {
    await this.neon.close();
  }

  /**
   * Validate blueprint with MindPal AI agent
   */
  async validateWithMindPal(blueprintData: unknown, agentId: string): Promise<{
    isValid: boolean;
    errors: string[];
    suggestions: string[];
    validatedData?: unknown;
  }> {
    try {
      return await this.mindPalIntegration.validateBlueprintWithMindPal(blueprintData, agentId);
    } catch (error) {
      console.error('Error validating with MindPal:', error);
      throw error;
    }
  }

  /**
   * Get MindPal health status
   */
  async getMindPalHealth(): Promise<{ status: string; timestamp: string; version?: string }> {
    try {
      return await this.mindPalIntegration.healthCheck();
    } catch (error) {
      console.error('Error checking MindPal health:', error);
      throw error;
    }
  }

  /**
   * Create MindPal agent
   */
  async createMindPalAgent(agentData: {
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
  }> {
    try {
      const agent = await this.mindPalIntegration.createAgent({
        ...agentData,
        status: 'active',
      });
      
      return {
        id: agent.id,
        name: agent.name,
        type: agent.type,
        status: agent.status,
        capabilities: agent.capabilities,
      };
    } catch (error) {
      console.error('Error creating MindPal agent:', error);
      throw error;
    }
  }

  /**
   * Process blueprint with DeerFlow workflow
   */
  async processWithDeerFlow(blueprintData: unknown, workflowId: string): Promise<{
    success: boolean;
    executionId: string;
    output?: Record<string, unknown>;
    error?: string;
  }> {
    try {
      return await this.deerFlowIntegration.processBlueprintWithDeerFlow(blueprintData, workflowId);
    } catch (error) {
      console.error('Error processing with DeerFlow:', error);
      throw error;
    }
  }

  /**
   * Deploy blueprint to Render
   */
  async deployToRender(blueprintData: unknown, serviceId: string): Promise<{
    success: boolean;
    deploymentId?: string;
    serviceUrl?: string;
    error?: string;
  }> {
    try {
      return await this.renderIntegration.deployBlueprint(blueprintData, serviceId);
    } catch (error) {
      console.error('Error deploying to Render:', error);
      throw error;
    }
  }

  /**
   * Set up automated blueprint processing with DeerFlow
   */
  async setupDeerFlowAutomation(blueprintId: string, workflowId: string, config: Record<string, unknown>): Promise<{
    id: string;
    status: string;
    integration_type: string;
  }> {
    try {
      const integration = await this.deerFlowIntegration.setupBlueprintAutomation(blueprintId, workflowId, config);
      return {
        id: integration.id,
        status: integration.status,
        integration_type: integration.integration_type,
      };
    } catch (error) {
      console.error('Error setting up DeerFlow automation:', error);
      throw error;
    }
  }

  /**
   * Set up automated deployments with Render
   */
  async setupRenderDeployment(blueprintId: string, serviceId: string, config: {
    autoDeploy: boolean;
    environment: 'production' | 'preview';
    branch?: string;
  }): Promise<{
    success: boolean;
    webhookUrl?: string;
    error?: string;
  }> {
    try {
      return await this.renderIntegration.setupBlueprintDeployment(blueprintId, serviceId, config);
    } catch (error) {
      console.error('Error setting up Render deployment:', error);
      throw error;
    }
  }

  /**
   * Get DeerFlow health status
   */
  async getDeerFlowHealth(): Promise<{ status: string; timestamp: string; version?: string }> {
    try {
      return await this.deerFlowIntegration.healthCheck();
    } catch (error) {
      console.error('Error checking DeerFlow health:', error);
      throw error;
    }
  }

  /**
   * Get Render health status
   */
  async getRenderHealth(): Promise<{ status: string; timestamp: string; version?: string }> {
    try {
      return await this.renderIntegration.healthCheck();
    } catch (error) {
      console.error('Error checking Render health:', error);
      throw error;
    }
  }

  /**
   * Create DeerFlow workflow
   */
  async createDeerFlowWorkflow(workflowData: {
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
  }> {
    try {
      const workflow = await this.deerFlowIntegration.createWorkflow({
        ...workflowData,
        status: 'active',
      });
      
      return {
        id: workflow.id,
        name: workflow.name,
        type: workflow.type,
        status: workflow.status,
      };
    } catch (error) {
      console.error('Error creating DeerFlow workflow:', error);
      throw error;
    }
  }

  /**
   * Get workflow metrics from DeerFlow
   */
  async getDeerFlowWorkflowMetrics(workflowId: string): Promise<{
    total_executions: number;
    successful_executions: number;
    failed_executions: number;
    average_duration: number;
    last_execution: Date | null;
  }> {
    try {
      return await this.deerFlowIntegration.getWorkflowMetrics(workflowId);
    } catch (error) {
      console.error('Error fetching DeerFlow workflow metrics:', error);
      throw error;
    }
  }

  /**
   * Process blueprint with Make.com scenario
   */
  async processWithMake(blueprintData: unknown, scenarioId: number): Promise<{
    success: boolean;
    executionId: number;
    output?: Record<string, unknown>;
    error?: string;
  }> {
    try {
      return await this.makeIntegration.processBlueprintWithMake(blueprintData, scenarioId);
    } catch (error) {
      console.error('Error processing with Make.com:', error);
      throw error;
    }
  }

  /**
   * Set up automated blueprint processing with Make.com
   */
  async setupMakeAutomation(blueprintId: string, scenarioId: number, config: Record<string, unknown>): Promise<{
    id: string;
    status: string;
    integration_type: string;
  }> {
    try {
      const integration = await this.makeIntegration.setupBlueprintAutomation(blueprintId, scenarioId, config);
      return {
        id: integration.id,
        status: integration.status,
        integration_type: integration.integration_type,
      };
    } catch (error) {
      console.error('Error setting up Make.com automation:', error);
      throw error;
    }
  }

  /**
   * Get Make.com health status
   */
  async getMakeHealth(): Promise<{ status: string; timestamp: string; version?: string }> {
    try {
      return await this.makeIntegration.healthCheck();
    } catch (error) {
      console.error('Error checking Make.com health:', error);
      throw error;
    }
  }

  /**
   * Create Make.com scenario
   */
  async createMakeScenario(scenarioData: {
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
  }> {
    try {
      const scenario = await this.makeIntegration.createScenario(scenarioData);
      
      return {
        id: scenario.id,
        name: scenario.name,
        status: scenario.status,
      };
    } catch (error) {
      console.error('Error creating Make.com scenario:', error);
      throw error;
    }
  }

  /**
   * Get scenario metrics from Make.com
   */
  async getMakeScenarioMetrics(scenarioId: number): Promise<{
    total_executions: number;
    successful_executions: number;
    failed_executions: number;
    average_duration: number;
    last_execution: Date | null;
  }> {
    try {
      return await this.makeIntegration.getScenarioMetrics(scenarioId);
    } catch (error) {
      console.error('Error fetching Make.com scenario metrics:', error);
      throw error;
    }
  }

  /**
   * Create webhook for blueprint triggers
   */
  async createMakeWebhook(webhookData: {
    name: string;
    url: string;
    events: string[];
    headers?: Record<string, string>;
  }): Promise<{
    id: number;
    url: string;
    secret: string;
  }> {
    try {
      return await this.makeIntegration.createWebhook(webhookData);
    } catch (error) {
      console.error('Error creating Make.com webhook:', error);
      throw error;
    }
  }

  /**
   * Get all Make.com scenarios
   */
  async getMakeScenarios(): Promise<{
    id: number;
    name: string;
    status: string;
    description?: string;
  }[]> {
    try {
      const scenarios = await this.makeIntegration.getScenarios();
      return scenarios.map(scenario => ({
        id: scenario.id,
        name: scenario.name,
        status: scenario.status,
        ...(scenario.description && { description: scenario.description }),
      }));
    } catch (error) {
      console.error('Error fetching Make.com scenarios:', error);
      throw error;
    }
  }

  /**
   * Update Make.com scenario status
   */
  async updateMakeScenarioStatus(scenarioId: number, status: 'active' | 'inactive' | 'draft'): Promise<{
    id: number;
    name: string;
    status: string;
  }> {
    try {
      const scenario = await this.makeIntegration.updateScenarioStatus(scenarioId, status);
      return {
        id: scenario.id,
        name: scenario.name,
        status: scenario.status,
      };
    } catch (error) {
      console.error('Error updating Make.com scenario status:', error);
      throw error;
    }
  }

  /**
   * Get Google Workspace integration
   */
  getGoogleWorkspace(): GoogleWorkspaceIntegration {
    return this.googleWorkspace;
  }

  /**
   * Process Google Workspace operations
   */
  async processGoogleWorkspaceOperations(operations: {
    drive?: { action: string; params: any };
    docs?: { action: string; params: any };
    sheets?: { action: string; params: any };
    calendar?: { action: string; params: any };
  }): Promise<{
    success: boolean;
    results: Record<string, any>;
    errors: string[];
  }> {
    const results: Record<string, any> = {};
    const errors: string[] = [];

    try {
      // Process Drive operations
      if (operations.drive) {
        try {
          switch (operations.drive.action) {
            case 'list':
              results.drive = await this.googleWorkspace.listFiles(operations.drive.params.query);
              break;
            case 'upload':
              results.drive = await this.googleWorkspace.uploadFile(
                operations.drive.params.filePath,
                operations.drive.params.fileName,
                operations.drive.params.folderId
              );
              break;
            case 'download':
              await this.googleWorkspace.downloadFile(
                operations.drive.params.fileId,
                operations.drive.params.outputPath
              );
              results.drive = { success: true };
              break;
            case 'createFolder':
              results.drive = await this.googleWorkspace.createFolder(
                operations.drive.params.folderName,
                operations.drive.params.parentFolderId
              );
              break;
            default:
              errors.push(`Unknown Drive action: ${operations.drive.action}`);
          }
        } catch (error) {
          errors.push(`Drive operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Process Docs operations
      if (operations.docs) {
        try {
          switch (operations.docs.action) {
            case 'create':
              results.docs = await this.googleWorkspace.createDocument(operations.docs.params.title);
              break;
            case 'get':
              results.docs = await this.googleWorkspace.getDocument(operations.docs.params.documentId);
              break;
            case 'update':
              await this.googleWorkspace.updateDocument(
                operations.docs.params.documentId,
                operations.docs.params.requests
              );
              results.docs = { success: true };
              break;
            default:
              errors.push(`Unknown Docs action: ${operations.docs.action}`);
          }
        } catch (error) {
          errors.push(`Docs operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Process Sheets operations
      if (operations.sheets) {
        try {
          switch (operations.sheets.action) {
            case 'create':
              results.sheets = await this.googleWorkspace.createSpreadsheet(operations.sheets.params.title);
              break;
            case 'get':
              results.sheets = await this.googleWorkspace.getSpreadsheet(operations.sheets.params.spreadsheetId);
              break;
            case 'update':
              await this.googleWorkspace.updateSheet(
                operations.sheets.params.spreadsheetId,
                operations.sheets.params.range,
                operations.sheets.params.values
              );
              results.sheets = { success: true };
              break;
            case 'getValues':
              results.sheets = await this.googleWorkspace.getSheetValues(
                operations.sheets.params.spreadsheetId,
                operations.sheets.params.range
              );
              break;
            default:
              errors.push(`Unknown Sheets action: ${operations.sheets.action}`);
          }
        } catch (error) {
          errors.push(`Sheets operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Process Calendar operations
      if (operations.calendar) {
        try {
          switch (operations.calendar.action) {
            case 'list':
              results.calendar = await this.googleWorkspace.listEvents(
                operations.calendar.params.calendarId,
                operations.calendar.params.timeMin,
                operations.calendar.params.timeMax
              );
              break;
            case 'create':
              results.calendar = await this.googleWorkspace.createEvent(
                operations.calendar.params.calendarId,
                operations.calendar.params.event
              );
              break;
            case 'update':
              results.calendar = await this.googleWorkspace.updateEvent(
                operations.calendar.params.calendarId,
                operations.calendar.params.eventId,
                operations.calendar.params.event
              );
              break;
            case 'delete':
              await this.googleWorkspace.deleteEvent(
                operations.calendar.params.calendarId,
                operations.calendar.params.eventId
              );
              results.calendar = { success: true };
              break;
            default:
              errors.push(`Unknown Calendar action: ${operations.calendar.action}`);
          }
        } catch (error) {
          errors.push(`Calendar operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        success: errors.length === 0,
        results,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        results,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }
}

// Example usage
if (require.main === module) {
  const enforcer = new BlueprintEnforcer();
  
  const sampleBlueprint: NeonBlueprint & FirebaseBlueprint & BigQueryBlueprint = {
    id: 'bp-001',
    name: 'Sample Blueprint',
    version: '1.0.0',
    status: 'active',
    author: 'Test User',
    timestamp: new Date().toISOString(),
    description: 'A sample blueprint for testing validation',
    category: 'test',
    priority: 'medium',
    tags: ['test', 'sample'],
    metadata: {
      testField: 'testValue'
    },
    collection: 'blueprints'
  };

  enforcer.processBlueprint(sampleBlueprint)
    .then(() => {
      console.log('Blueprint enforcement completed');
      return enforcer.cleanup();
    })
    .catch(console.error);
} 