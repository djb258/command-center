'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.BlueprintEnforcer =
  exports.MakeIntegration =
  exports.RenderIntegration =
  exports.DeerFlowIntegration =
  exports.MindPalIntegration =
  exports.NeonSync =
  exports.FirebasePush =
  exports.BigQueryIngest =
    void 0;
const bigquery_ingest_1 = require('../scripts/bigquery_ingest');
Object.defineProperty(exports, 'BigQueryIngest', {
  enumerable: true,
  get: function () {
    return bigquery_ingest_1.BigQueryIngest;
  },
});
const firebase_push_1 = require('../scripts/firebase_push');
Object.defineProperty(exports, 'FirebasePush', {
  enumerable: true,
  get: function () {
    return firebase_push_1.FirebasePush;
  },
});
const neon_sync_1 = require('../scripts/neon_sync');
Object.defineProperty(exports, 'NeonSync', {
  enumerable: true,
  get: function () {
    return neon_sync_1.NeonSync;
  },
});
const mindpal_integration_1 = require('../scripts/mindpal_integration');
Object.defineProperty(exports, 'MindPalIntegration', {
  enumerable: true,
  get: function () {
    return mindpal_integration_1.MindPalIntegration;
  },
});
const deerflow_integration_1 = require('../scripts/deerflow_integration');
Object.defineProperty(exports, 'DeerFlowIntegration', {
  enumerable: true,
  get: function () {
    return deerflow_integration_1.DeerFlowIntegration;
  },
});
const render_integration_1 = require('../scripts/render_integration');
Object.defineProperty(exports, 'RenderIntegration', {
  enumerable: true,
  get: function () {
    return render_integration_1.RenderIntegration;
  },
});
const make_integration_1 = require('../scripts/make_integration');
Object.defineProperty(exports, 'MakeIntegration', {
  enumerable: true,
  get: function () {
    return make_integration_1.MakeIntegration;
  },
});
const google_workspace_integration_1 = require('../scripts/google_workspace_integration');
const blueprint_schemas_1 = require('./schemas/blueprint-schemas');
class BlueprintEnforcer {
  constructor(mindPalConfig, deerFlowConfig, renderConfig, makeConfig) {
    this.bigquery = new bigquery_ingest_1.BigQueryIngest();
    this.firebase = new firebase_push_1.FirebasePush();
    this.neon = new neon_sync_1.NeonSync();
    const mindPalFinalConfig = mindPalConfig || {
      apiKey: process.env.MINDPAL_API_KEY || '',
      baseUrl: process.env.MINDPAL_BASE_URL || 'https://api.mindpal.com',
      timeout: parseInt(process.env.MINDPAL_TIMEOUT || '30000'),
      retryAttempts: parseInt(process.env.MINDPAL_RETRY_ATTEMPTS || '3'),
    };
    this.mindPalIntegration = new mindpal_integration_1.MindPalIntegration(
      mindPalFinalConfig
    );
    const deerFlowFinalConfig = deerFlowConfig || {
      apiKey: process.env.DEERFLOW_API_KEY || '',
      baseUrl: process.env.DEERFLOW_BASE_URL || 'https://api.deerflow.com',
      timeout: parseInt(process.env.DEERFLOW_TIMEOUT || '30000'),
      retryAttempts: parseInt(process.env.DEERFLOW_RETRY_ATTEMPTS || '3'),
    };
    this.deerFlowIntegration = new deerflow_integration_1.DeerFlowIntegration(
      deerFlowFinalConfig
    );
    const renderFinalConfig = renderConfig || {
      apiKey: process.env.RENDER_API_KEY || '',
      webhookUrl: process.env.RENDER_WEBHOOK_URL || '',
      baseUrl: process.env.RENDER_BASE_URL || 'https://api.render.com',
      timeout: parseInt(process.env.RENDER_TIMEOUT || '30000'),
      retryAttempts: parseInt(process.env.RENDER_RETRY_ATTEMPTS || '3'),
    };
    this.renderIntegration = new render_integration_1.RenderIntegration(
      renderFinalConfig
    );
    const makeFinalConfig = makeConfig || {
      apiKey: process.env.MAKE_API_KEY || '',
      baseUrl: process.env.MAKE_BASE_URL || 'https://www.make.com/api/v2',
      timeout: parseInt(process.env.MAKE_TIMEOUT || '30000'),
      retryAttempts: parseInt(process.env.MAKE_RETRY_ATTEMPTS || '3'),
    };
    this.makeIntegration = new make_integration_1.MakeIntegration(
      makeFinalConfig
    );
    this.googleWorkspace =
      new google_workspace_integration_1.GoogleWorkspaceIntegration({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI,
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
  validateBlueprint(blueprintData) {
    const errors = [];
    const validatedData = {};
    try {
      validatedData.neon = (0, blueprint_schemas_1.validateBlueprintForNeon)(
        blueprintData
      );
    } catch (error) {
      errors.push(
        `Neon validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
    try {
      validatedData.firebase = (0,
      blueprint_schemas_1.validateBlueprintForFirebase)(blueprintData);
    } catch (error) {
      errors.push(
        `Firebase validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
    try {
      validatedData.bigquery = (0,
      blueprint_schemas_1.validateBlueprintForBigQuery)(blueprintData);
    } catch (error) {
      errors.push(
        `BigQuery validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
    return {
      isValid: errors.length === 0,
      errors,
      validatedData: errors.length === 0 ? validatedData : undefined,
    };
  }
  async processBlueprint(blueprintData) {
    try {
      const name = blueprintData.name;
      console.log('Processing blueprint:', name);
      const validation = this.validateBlueprint(blueprintData);
      if (!validation.isValid) {
        console.error('Blueprint validation failed:');
        validation.errors.forEach((error) => console.error(`  - ${error}`));
        throw new Error('Blueprint data does not conform to required schemas');
      }
      console.log('✅ Blueprint validation passed for all databases');
      const results = await Promise.allSettled([
        this.processToFirebase(validation.validatedData.firebase),
        this.processToNeon(validation.validatedData.neon),
        this.processToBigQuery(validation.validatedData.bigquery),
      ]);
      const failures = results.filter((result) => result.status === 'rejected');
      if (failures.length > 0) {
        console.warn(`⚠️  ${failures.length} database operations failed:`);
        failures.forEach((failure, index) => {
          if (failure.status === 'rejected') {
            console.warn(`  - Database ${index + 1}: ${failure.reason}`);
          }
        });
      }
      const successes = results.filter(
        (result) => result.status === 'fulfilled'
      );
      console.log(
        `✅ Successfully processed to ${successes.length}/3 databases`
      );
    } catch (error) {
      console.error('Error processing blueprint:', error);
      throw error;
    }
  }
  async processToFirebase(data) {
    console.log('📤 Pushing to Firebase...');
    return await this.firebase.pushData({
      collection: 'blueprints',
      data: data,
    });
  }
  async processToNeon(data) {
    console.log('🔄 Syncing to Neon...');
    await this.neon.syncData({
      table: 'blueprints',
      data: [data],
      upsert: true,
      conflictColumns: ['id'],
    });
  }
  async processToBigQuery(data) {
    console.log('📊 Ingesting to BigQuery...');
    await this.bigquery.ingestData({
      tableId: 'blueprints',
      data: [data],
    });
  }
  async validateExistingData() {
    console.log('🔍 Validating existing data across all databases...');
    try {
      console.log('Validation framework ready for existing data checks');
    } catch (error) {
      console.error('Error validating existing data:', error);
    }
  }
  async generateComplianceReport() {
    console.log('📋 Generating schema compliance report...');
    console.log('Compliance reporting framework ready');
  }
  async cleanup() {
    await this.neon.close();
  }
  async validateWithMindPal(blueprintData, agentId) {
    try {
      return await this.mindPalIntegration.validateBlueprintWithMindPal(
        blueprintData,
        agentId
      );
    } catch (error) {
      console.error('Error validating with MindPal:', error);
      throw error;
    }
  }
  async getMindPalHealth() {
    try {
      return await this.mindPalIntegration.healthCheck();
    } catch (error) {
      console.error('Error checking MindPal health:', error);
      throw error;
    }
  }
  async createMindPalAgent(agentData) {
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
  async processWithDeerFlow(blueprintData, workflowId) {
    try {
      return await this.deerFlowIntegration.processBlueprintWithDeerFlow(
        blueprintData,
        workflowId
      );
    } catch (error) {
      console.error('Error processing with DeerFlow:', error);
      throw error;
    }
  }
  async deployToRender(blueprintData, serviceId) {
    try {
      return await this.renderIntegration.deployBlueprint(
        blueprintData,
        serviceId
      );
    } catch (error) {
      console.error('Error deploying to Render:', error);
      throw error;
    }
  }
  async setupDeerFlowAutomation(blueprintId, workflowId, config) {
    try {
      const integration =
        await this.deerFlowIntegration.setupBlueprintAutomation(
          blueprintId,
          workflowId,
          config
        );
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
  async setupRenderDeployment(blueprintId, serviceId, config) {
    try {
      return await this.renderIntegration.setupBlueprintDeployment(
        blueprintId,
        serviceId,
        config
      );
    } catch (error) {
      console.error('Error setting up Render deployment:', error);
      throw error;
    }
  }
  async getDeerFlowHealth() {
    try {
      return await this.deerFlowIntegration.healthCheck();
    } catch (error) {
      console.error('Error checking DeerFlow health:', error);
      throw error;
    }
  }
  async getRenderHealth() {
    try {
      return await this.renderIntegration.healthCheck();
    } catch (error) {
      console.error('Error checking Render health:', error);
      throw error;
    }
  }
  async createDeerFlowWorkflow(workflowData) {
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
  async getDeerFlowWorkflowMetrics(workflowId) {
    try {
      return await this.deerFlowIntegration.getWorkflowMetrics(workflowId);
    } catch (error) {
      console.error('Error fetching DeerFlow workflow metrics:', error);
      throw error;
    }
  }
  async processWithMake(blueprintData, scenarioId) {
    try {
      return await this.makeIntegration.processBlueprintWithMake(
        blueprintData,
        scenarioId
      );
    } catch (error) {
      console.error('Error processing with Make.com:', error);
      throw error;
    }
  }
  async setupMakeAutomation(blueprintId, scenarioId, config) {
    try {
      const integration = await this.makeIntegration.setupBlueprintAutomation(
        blueprintId,
        scenarioId,
        config
      );
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
  async getMakeHealth() {
    try {
      return await this.makeIntegration.healthCheck();
    } catch (error) {
      console.error('Error checking Make.com health:', error);
      throw error;
    }
  }
  async createMakeScenario(scenarioData) {
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
  async getMakeScenarioMetrics(scenarioId) {
    try {
      return await this.makeIntegration.getScenarioMetrics(scenarioId);
    } catch (error) {
      console.error('Error fetching Make.com scenario metrics:', error);
      throw error;
    }
  }
  async createMakeWebhook(webhookData) {
    try {
      return await this.makeIntegration.createWebhook(webhookData);
    } catch (error) {
      console.error('Error creating Make.com webhook:', error);
      throw error;
    }
  }
  async getMakeScenarios() {
    try {
      const scenarios = await this.makeIntegration.getScenarios();
      return scenarios.map((scenario) => ({
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
  async updateMakeScenarioStatus(scenarioId, status) {
    try {
      const scenario = await this.makeIntegration.updateScenarioStatus(
        scenarioId,
        status
      );
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
  getGoogleWorkspace() {
    return this.googleWorkspace;
  }
  async processGoogleWorkspaceOperations(operations) {
    const results = {};
    const errors = [];
    try {
      if (operations.drive) {
        try {
          switch (operations.drive.action) {
            case 'list':
              results.drive = await this.googleWorkspace.listFiles(
                operations.drive.params.query
              );
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
          errors.push(
            `Drive operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }
      if (operations.docs) {
        try {
          switch (operations.docs.action) {
            case 'create':
              results.docs = await this.googleWorkspace.createDocument(
                operations.docs.params.title
              );
              break;
            case 'get':
              results.docs = await this.googleWorkspace.getDocument(
                operations.docs.params.documentId
              );
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
          errors.push(
            `Docs operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }
      if (operations.sheets) {
        try {
          switch (operations.sheets.action) {
            case 'create':
              results.sheets = await this.googleWorkspace.createSpreadsheet(
                operations.sheets.params.title
              );
              break;
            case 'get':
              results.sheets = await this.googleWorkspace.getSpreadsheet(
                operations.sheets.params.spreadsheetId
              );
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
          errors.push(
            `Sheets operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }
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
              errors.push(
                `Unknown Calendar action: ${operations.calendar.action}`
              );
          }
        } catch (error) {
          errors.push(
            `Calendar operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
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
exports.BlueprintEnforcer = BlueprintEnforcer;
if (require.main === module) {
  const enforcer = new BlueprintEnforcer();
  const sampleBlueprint = {
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
      testField: 'testValue',
    },
    collection: 'blueprints',
  };
  enforcer
    .processBlueprint(sampleBlueprint)
    .then(() => {
      console.log('Blueprint enforcement completed');
      return enforcer.cleanup();
    })
    .catch(console.error);
}
//# sourceMappingURL=index.js.map
