'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.DatabaseOperations = exports.BartonDoctrineMiddleware = void 0;
exports.withBartonDoctrine = withBartonDoctrine;
const barton_doctrine_enforcer_1 = require('../schemas/barton-doctrine-enforcer');
const barton_doctrine_formatter_1 = require('../schemas/barton-doctrine-formatter');
class BartonDoctrineMiddleware {
  constructor(toolName) {
    this.toolName = toolName;
  }
  static forTool(toolName) {
    return new BartonDoctrineMiddleware(toolName);
  }
  validateForFirebase(payload) {
    console.log(
      `🔒 [${this.toolName}] Enforcing SPVPET schema for Firebase...`
    );
    return barton_doctrine_enforcer_1.BartonDoctrine.formatFor(
      payload,
      'firebase',
      this.toolName
    );
  }
  validateForNeon(payload) {
    console.log(`🔒 [${this.toolName}] Enforcing STAMPED schema for Neon...`);
    return barton_doctrine_enforcer_1.BartonDoctrine.formatFor(
      payload,
      'neon',
      this.toolName
    );
  }
  validateForBigQuery(payload) {
    console.log(
      `🔒 [${this.toolName}] Enforcing STACKED schema for BigQuery...`
    );
    return barton_doctrine_enforcer_1.BartonDoctrine.formatFor(
      payload,
      'bigquery',
      this.toolName
    );
  }
  createPayload(sourceId, processId, dataPayload, metadata) {
    console.log(
      `🔧 [${this.toolName}] Creating Barton Doctrine compliant payload...`
    );
    return barton_doctrine_formatter_1.BartonDoctrineFormatter.createBasePayload(
      sourceId,
      processId,
      dataPayload,
      {
        agent_id: metadata?.agent_id || this.toolName,
        blueprint_id: metadata?.blueprint_id || 'default',
        schema_version: metadata?.schema_version || '1.0.0',
      }
    );
  }
  validate(payload, operation) {
    console.log(`✅ [${this.toolName}] Validating payload compliance...`);
    return barton_doctrine_enforcer_1.BartonDoctrine.validate(
      payload,
      this.toolName,
      operation
    );
  }
}
exports.BartonDoctrineMiddleware = BartonDoctrineMiddleware;
function withBartonDoctrine(toolName) {
  return BartonDoctrineMiddleware.forTool(toolName);
}
exports.DatabaseOperations = {
  firebase: (toolName) => ({
    save: (payload) => {
      const middleware = withBartonDoctrine(toolName);
      return middleware.validateForFirebase(payload);
    },
    saveToCollection: (collection, payload) => {
      const middleware = withBartonDoctrine(toolName);
      const validatedPayload = middleware.validateForFirebase(payload);
      console.log(
        `📤 [${toolName}] Saving to Firebase collection: ${collection}`
      );
      return validatedPayload;
    },
  }),
  neon: (toolName) => ({
    insert: (table, payload) => {
      const middleware = withBartonDoctrine(toolName);
      const validatedPayload = middleware.validateForNeon(payload);
      console.log(`📤 [${toolName}] Inserting to Neon table: ${table}`);
      return validatedPayload;
    },
    update: (table, payload, whereClause) => {
      const middleware = withBartonDoctrine(toolName);
      const validatedPayload = middleware.validateForNeon(payload);
      console.log(
        `📤 [${toolName}] Updating Neon table: ${table} WHERE ${whereClause}`
      );
      return validatedPayload;
    },
  }),
  bigquery: (toolName) => ({
    insert: (dataset, table, payload) => {
      const middleware = withBartonDoctrine(toolName);
      const validatedPayload = middleware.validateForBigQuery(payload);
      console.log(
        `📤 [${toolName}] Inserting to BigQuery: ${dataset}.${table}`
      );
      return validatedPayload;
    },
    stream: (dataset, table, payloads) => {
      const middleware = withBartonDoctrine(toolName);
      const validatedPayloads = payloads.map((payload) =>
        middleware.validateForBigQuery(payload)
      );
      console.log(
        `📤 [${toolName}] Streaming ${payloads.length} records to BigQuery: ${dataset}.${table}`
      );
      return validatedPayloads;
    },
  }),
};
//# sourceMappingURL=barton-doctrine-middleware.js.map
