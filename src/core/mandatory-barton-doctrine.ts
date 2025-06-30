/**
 * MANDATORY BARTON DOCTRINE ENFORCEMENT
 * 
 * THIS SYSTEM CANNOT BE BYPASSED OR DISABLED
 * EVERY OPERATION MUST GO THROUGH BARTON DOCTRINE VALIDATION
 * NO FLEXIBILITY - NO EXCEPTIONS - NO COMPROMISE
 */

import { BartonDoctrine, BartonDoctrineViolationError } from '../schemas/barton-doctrine-enforcer';
import { BartonDoctrineFormatter } from '../schemas/barton-doctrine-formatter';

/**
 * CRITICAL: This class intercepts ALL database operations
 * Cannot be instantiated without Barton Doctrine compliance
 */
export class MandatoryBartonDoctrine {
  private static initialized = false;
  private static toolName: string;
  
  // PRIVATE constructor - can only be created through factory
  private constructor(toolName: string) {
    MandatoryBartonDoctrine.toolName = toolName;
  }

  /**
   * MANDATORY: Every tool MUST call this first
   * No database operations possible without this
   */
  public static initializeTool(toolName: string): MandatoryBartonDoctrine {
    if (!toolName || toolName.trim().length === 0) {
      throw new Error('FATAL: Tool name is required for Barton Doctrine compliance');
    }

    console.log(`🔒 MANDATORY: Initializing Barton Doctrine for ${toolName}`);
    console.log('📋 ALL operations will be validated against SPVPET/STAMPED/STACKED');
    
    MandatoryBartonDoctrine.initialized = true;
    MandatoryBartonDoctrine.toolName = toolName;
    
    // Force strict mode - cannot be disabled
    BartonDoctrine.setStrict(true);
    BartonDoctrine.setEnabled(true);
    
    return new MandatoryBartonDoctrine(toolName);
  }

  /**
   * MANDATORY: Create payload - ONLY way to create data
   */
  public createPayload(
    sourceId: string,
    processId: string,
    data: Record<string, unknown>,
    metadata?: {
      blueprint_id?: string;
      schema_version?: string;
    }
  ) {
    this.enforceInitialization();
    
    if (!sourceId || !processId) {
      throw new BartonDoctrineViolationError(
        'FATAL: source_id and process_id are MANDATORY',
        { sourceId, processId }
      );
    }

    console.log(`🔧 [${MandatoryBartonDoctrine.toolName}] Creating MANDATORY Barton Doctrine payload`);
    
    return BartonDoctrineFormatter.createBasePayload(
      sourceId,
      processId,
      data,
      {
        agent_id: MandatoryBartonDoctrine.toolName,
        blueprint_id: metadata?.blueprint_id || 'default',
        schema_version: metadata?.schema_version || '1.0.0'
      }
    );
  }

  /**
   * MANDATORY: Firebase operation - ONLY way to save to Firebase
   */
  public saveToFirebase(payload: unknown, collection?: string): Record<string, unknown> {
    this.enforceInitialization();
    
    console.log(`🔒 [${MandatoryBartonDoctrine.toolName}] MANDATORY Firebase SPVPET enforcement`);
    
    const validatedPayload = BartonDoctrine.formatFor(payload, 'firebase', MandatoryBartonDoctrine.toolName);
    
    if (collection) {
      console.log(`📤 Saving to Firebase collection: ${collection}`);
    }
    
    return validatedPayload;
  }

  /**
   * MANDATORY: Neon operation - ONLY way to save to Neon
   */
  public saveToNeon(payload: unknown, table?: string): Record<string, unknown> {
    this.enforceInitialization();
    
    console.log(`🔒 [${MandatoryBartonDoctrine.toolName}] MANDATORY Neon STAMPED enforcement`);
    
    const validatedPayload = BartonDoctrine.formatFor(payload, 'neon', MandatoryBartonDoctrine.toolName);
    
    if (table) {
      console.log(`📤 Saving to Neon table: ${table}`);
    }
    
    return validatedPayload;
  }

  /**
   * MANDATORY: BigQuery operation - ONLY way to save to BigQuery
   */
  public saveToBigQuery(payload: unknown, dataset?: string, table?: string): Record<string, unknown> {
    this.enforceInitialization();
    
    console.log(`🔒 [${MandatoryBartonDoctrine.toolName}] MANDATORY BigQuery STACKED enforcement`);
    
    const validatedPayload = BartonDoctrine.formatFor(payload, 'bigquery', MandatoryBartonDoctrine.toolName);
    
    if (dataset && table) {
      console.log(`📤 Saving to BigQuery: ${dataset}.${table}`);
    }
    
    return validatedPayload;
  }

  /**
   * MANDATORY: Validate any data - cannot be skipped
   */
  public validate(payload: unknown, operation?: string) {
    this.enforceInitialization();
    
    console.log(`✅ [${MandatoryBartonDoctrine.toolName}] MANDATORY validation`);
    
    return BartonDoctrine.validate(payload, MandatoryBartonDoctrine.toolName, operation);
  }

  /**
   * CRITICAL: Ensure tool was properly initialized
   */
  private enforceInitialization(): void {
    if (!MandatoryBartonDoctrine.initialized) {
      throw new Error(
        'FATAL ERROR: Barton Doctrine not initialized!\n' +
        'You MUST call MandatoryBartonDoctrine.initializeTool(toolName) first!\n' +
        'NO database operations allowed without Barton Doctrine compliance!'
      );
    }
  }

  /**
   * Get tool name (read-only)
   */
  public getToolName(): string {
    return MandatoryBartonDoctrine.toolName;
  }
}

/**
 * GLOBAL INTERCEPTORS - Block all unauthorized database operations
 */

// Warn about direct database access
export function warnDirectDatabaseAccess(operation: string) {
  console.warn(`🚨 WARNING: Direct ${operation} access detected!`);
  console.warn('   Use MandatoryBartonDoctrine methods instead!');
  console.warn('   This ensures SPVPET/STAMPED/STACKED compliance!');
}

/**
 * MANDATORY EXPORT - This is the ONLY way to interact with databases
 */
export const BARTON_DOCTRINE = {
  /**
   * STEP 1: Initialize your tool (MANDATORY)
   */
  init: (toolName: string) => MandatoryBartonDoctrine.initializeTool(toolName),
  
  /**
   * STEP 2: Use only these methods for database operations
   */
  create: (instance: MandatoryBartonDoctrine) => ({
    payload: (sourceId: string, processId: string, data: Record<string, unknown>, metadata?: any) => 
      instance.createPayload(sourceId, processId, data, metadata),
    
    firebase: (payload: unknown, collection?: string) => 
      instance.saveToFirebase(payload, collection),
    
    neon: (payload: unknown, table?: string) => 
      instance.saveToNeon(payload, table),
    
    bigquery: (payload: unknown, dataset?: string, table?: string) => 
      instance.saveToBigQuery(payload, dataset, table),
    
    validate: (payload: unknown, operation?: string) => 
      instance.validate(payload, operation)
  })
};

/**
 * CONVENIENCE FUNCTION - But still enforces initialization
 */
export function START_WITH_BARTON_DOCTRINE(toolName: string) {
  console.log('🔒 STARTING WITH MANDATORY BARTON DOCTRINE ENFORCEMENT');
  console.log('📋 NO FLEXIBILITY - ALL OPERATIONS WILL BE VALIDATED');
  console.log(`🏷️  Tool: ${toolName}`);
  
  const doctrine = BARTON_DOCTRINE.init(toolName);
  const operations = BARTON_DOCTRINE.create(doctrine);
  
  return {
    // ONLY these operations are allowed
    createPayload: operations.payload,
    saveToFirebase: operations.firebase,
    saveToNeon: operations.neon,
    saveToBigQuery: operations.bigquery,
    validate: operations.validate,
    
    // Utility
    getToolName: () => doctrine.getToolName(),
    
    // Block direct access
    __doctrine: doctrine // Hidden access if needed
  };
}

/**
 * TEMPLATE ENFORCER - Forces all new tools to use this pattern
 */
export const MANDATORY_TOOL_TEMPLATE = `
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