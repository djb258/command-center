'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.MANDATORY_TOOL_TEMPLATE =
  exports.BARTON_DOCTRINE =
  exports.MandatoryBartonDoctrine =
    void 0;
exports.warnDirectDatabaseAccess = warnDirectDatabaseAccess;
exports.START_WITH_BARTON_DOCTRINE = START_WITH_BARTON_DOCTRINE;
const barton_doctrine_enforcer_1 = require('../schemas/barton-doctrine-enforcer');
const barton_doctrine_formatter_1 = require('../schemas/barton-doctrine-formatter');
class MandatoryBartonDoctrine {
  constructor(toolName) {
    MandatoryBartonDoctrine.toolName = toolName;
  }
  static initializeTool(toolName) {
    if (!toolName || toolName.trim().length === 0) {
      throw new Error(
        'FATAL: Tool name is required for Barton Doctrine compliance'
      );
    }
    console.log(`🔒 MANDATORY: Initializing Barton Doctrine for ${toolName}`);
    console.log(
      '📋 ALL operations will be validated against SPVPET/STAMPED/STACKED'
    );
    MandatoryBartonDoctrine.initialized = true;
    MandatoryBartonDoctrine.toolName = toolName;
    barton_doctrine_enforcer_1.BartonDoctrine.setStrict(true);
    barton_doctrine_enforcer_1.BartonDoctrine.setEnabled(true);
    return new MandatoryBartonDoctrine(toolName);
  }
  createPayload(sourceId, processId, data, metadata) {
    this.enforceInitialization();
    if (!sourceId || !processId) {
      throw new barton_doctrine_enforcer_1.BartonDoctrineViolationError(
        'FATAL: source_id and process_id are MANDATORY',
        { sourceId, processId }
      );
    }
    console.log(
      `🔧 [${MandatoryBartonDoctrine.toolName}] Creating MANDATORY Barton Doctrine payload`
    );
    return barton_doctrine_formatter_1.BartonDoctrineFormatter.createBasePayload(
      sourceId,
      processId,
      data,
      {
        agent_id: MandatoryBartonDoctrine.toolName,
        blueprint_id: metadata?.blueprint_id || 'default',
        schema_version: metadata?.schema_version || '1.0.0',
      }
    );
  }
  saveToFirebase(payload, collection) {
    this.enforceInitialization();
    console.log(
      `🔒 [${MandatoryBartonDoctrine.toolName}] MANDATORY Firebase SPVPET enforcement`
    );
    const validatedPayload =
      barton_doctrine_enforcer_1.BartonDoctrine.formatFor(
        payload,
        'firebase',
        MandatoryBartonDoctrine.toolName
      );
    if (collection) {
      console.log(`📤 Saving to Firebase collection: ${collection}`);
    }
    return validatedPayload;
  }
  saveToNeon(payload, table) {
    this.enforceInitialization();
    console.log(
      `🔒 [${MandatoryBartonDoctrine.toolName}] MANDATORY Neon STAMPED enforcement`
    );
    const validatedPayload =
      barton_doctrine_enforcer_1.BartonDoctrine.formatFor(
        payload,
        'neon',
        MandatoryBartonDoctrine.toolName
      );
    if (table) {
      console.log(`📤 Saving to Neon table: ${table}`);
    }
    return validatedPayload;
  }
  saveToBigQuery(payload, dataset, table) {
    this.enforceInitialization();
    console.log(
      `🔒 [${MandatoryBartonDoctrine.toolName}] MANDATORY BigQuery STACKED enforcement`
    );
    const validatedPayload =
      barton_doctrine_enforcer_1.BartonDoctrine.formatFor(
        payload,
        'bigquery',
        MandatoryBartonDoctrine.toolName
      );
    if (dataset && table) {
      console.log(`📤 Saving to BigQuery: ${dataset}.${table}`);
    }
    return validatedPayload;
  }
  validate(payload, operation) {
    this.enforceInitialization();
    console.log(
      `✅ [${MandatoryBartonDoctrine.toolName}] MANDATORY validation`
    );
    return barton_doctrine_enforcer_1.BartonDoctrine.validate(
      payload,
      MandatoryBartonDoctrine.toolName,
      operation
    );
  }
  enforceInitialization() {
    if (!MandatoryBartonDoctrine.initialized) {
      throw new Error(
        'FATAL ERROR: Barton Doctrine not initialized!\n' +
          'You MUST call MandatoryBartonDoctrine.initializeTool(toolName) first!\n' +
          'NO database operations allowed without Barton Doctrine compliance!'
      );
    }
  }
  getToolName() {
    return MandatoryBartonDoctrine.toolName;
  }
}
exports.MandatoryBartonDoctrine = MandatoryBartonDoctrine;
MandatoryBartonDoctrine.initialized = false;
function warnDirectDatabaseAccess(operation) {
  console.warn(`🚨 WARNING: Direct ${operation} access detected!`);
  console.warn('   Use MandatoryBartonDoctrine methods instead!');
  console.warn('   This ensures SPVPET/STAMPED/STACKED compliance!');
}
exports.BARTON_DOCTRINE = {
  init: (toolName) => MandatoryBartonDoctrine.initializeTool(toolName),
  create: (instance) => ({
    payload: (sourceId, processId, data, metadata) =>
      instance.createPayload(sourceId, processId, data, metadata),
    firebase: (payload, collection) =>
      instance.saveToFirebase(payload, collection),
    neon: (payload, table) => instance.saveToNeon(payload, table),
    bigquery: (payload, dataset, table) =>
      instance.saveToBigQuery(payload, dataset, table),
    validate: (payload, operation) => instance.validate(payload, operation),
  }),
};
function START_WITH_BARTON_DOCTRINE(toolName) {
  console.log('🔒 STARTING WITH MANDATORY BARTON DOCTRINE ENFORCEMENT');
  console.log('📋 NO FLEXIBILITY - ALL OPERATIONS WILL BE VALIDATED');
  console.log(`🏷️  Tool: ${toolName}`);
  const doctrine = exports.BARTON_DOCTRINE.init(toolName);
  const operations = exports.BARTON_DOCTRINE.create(doctrine);
  return {
    createPayload: operations.payload,
    saveToFirebase: operations.firebase,
    saveToNeon: operations.neon,
    saveToBigQuery: operations.bigquery,
    validate: operations.validate,
    getToolName: () => doctrine.getToolName(),
    __doctrine: doctrine,
  };
}
exports.MANDATORY_TOOL_TEMPLATE = `
// MANDATORY: Every tool MUST start with this line
import { START_WITH_BARTON_DOCTRINE } from '../core/mandatory-barton-doctrine';

// MANDATORY: Initialize Barton Doctrine (cannot be skipped)
const doctrine = START_WITH_BARTON_DOCTRINE('YOUR_TOOL_NAME');

// MANDATORY: Use only these methods
class YourTool {
  async processData(data: any) {
    // STEP 1: Create compliant payload (MANDATORY)
    const payload = doctrine.createPayload(
      'your_source',
      'your_process', 
      data
    );
    
    // STEP 2: Save to database (automatically enforced)
    const firebaseResult = doctrine.saveToFirebase(payload, 'collection_name');
    const neonResult = doctrine.saveToNeon(payload, 'table_name');
    const bigqueryResult = doctrine.saveToBigQuery(payload, 'dataset', 'table');
    
    return { firebaseResult, neonResult, bigqueryResult };
  }
}

export { YourTool };
`;
console.log('🔒 MANDATORY BARTON DOCTRINE SYSTEM LOADED');
console.log('📋 NO BYPASS POSSIBLE - ALL OPERATIONS ENFORCED');
//# sourceMappingURL=mandatory-barton-doctrine.js.map
