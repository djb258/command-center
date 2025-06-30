'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.STACKEDSchema =
  exports.STAMPEDSchema =
  exports.SPVPETSchema =
  exports.BartonDoctrineFormatter =
  exports.BartonDoctrineBaseSchema =
    void 0;
const zod_1 = require('zod');
const crypto_1 = require('crypto');
exports.BartonDoctrineBaseSchema = zod_1.z.object({
  source_id: zod_1.z.string().min(1, 'Source ID is required'),
  process_id: zod_1.z.string().min(1, 'Process ID is required'),
  validated: zod_1.z
    .boolean()
    .or(zod_1.z.enum(['pending', 'approved', 'rejected'])),
  promoted_to: zod_1.z.string().optional(),
  execution_signature: zod_1.z
    .string()
    .min(1, 'Execution signature is required'),
  timestamp_last_touched: zod_1.z.date().or(zod_1.z.string().datetime()),
  data_payload: zod_1.z.record(zod_1.z.unknown()).optional(),
});
class BartonDoctrineFormatter {
  static generateExecutionSignature(
    agent_id,
    blueprint_id,
    schema_version = '1.0.0'
  ) {
    const payload = `${agent_id}:${blueprint_id}:${schema_version}:${Date.now()}`;
    return (0, crypto_1.createHash)('sha256')
      .update(payload)
      .digest('hex')
      .substring(0, 32);
  }
  static createBasePayload(source_id, process_id, data, options = {}) {
    const execution_signature = this.generateExecutionSignature(
      options.agent_id || 'system',
      options.blueprint_id || process_id,
      options.schema_version || '1.0.0'
    );
    return {
      source_id,
      process_id,
      validated: false,
      promoted_to: undefined,
      execution_signature,
      timestamp_last_touched: new Date(),
      data_payload: data,
    };
  }
  static toSPVPET(payload) {
    const validated = exports.BartonDoctrineBaseSchema.parse(payload);
    return {
      source_id: validated.source_id,
      process_id: validated.process_id,
      validated: validated.validated,
      promoted_to: validated.promoted_to || null,
      execution_signature: validated.execution_signature,
      timestamp_last_touched:
        validated.timestamp_last_touched instanceof Date
          ? validated.timestamp_last_touched.toISOString()
          : validated.timestamp_last_touched,
      ...validated.data_payload,
    };
  }
  static toSTAMPED(payload) {
    const validated = exports.BartonDoctrineBaseSchema.parse(payload);
    return {
      source_id: validated.source_id,
      task_id: validated.process_id,
      approved:
        validated.validated === true || validated.validated === 'approved',
      migrated_to: validated.promoted_to || null,
      process_signature: validated.execution_signature,
      event_timestamp:
        validated.timestamp_last_touched instanceof Date
          ? validated.timestamp_last_touched.toISOString()
          : validated.timestamp_last_touched,
      data_payload: validated.data_payload || {},
    };
  }
  static toSTACKED(payload) {
    const validated = exports.BartonDoctrineBaseSchema.parse(payload);
    return {
      source_id: validated.source_id,
      task_id: validated.process_id,
      analytics_approved:
        validated.validated === true || validated.validated === 'approved',
      consolidated_from: validated.promoted_to || null,
      knowledge_signature: validated.execution_signature,
      event_timestamp:
        validated.timestamp_last_touched instanceof Date
          ? validated.timestamp_last_touched.toISOString()
          : validated.timestamp_last_touched,
      data_payload: validated.data_payload || {},
    };
  }
  static formatForDatabase(payload, target) {
    switch (target) {
      case 'firebase':
        return this.toSPVPET(payload);
      case 'neon':
        return this.toSTAMPED(payload);
      case 'bigquery':
        return this.toSTACKED(payload);
      default:
        throw new Error(`Unsupported target database: ${target}`);
    }
  }
  static validate(payload) {
    return exports.BartonDoctrineBaseSchema.parse(payload);
  }
  static fromAnyFormat(data) {
    let normalized;
    if ('task_id' in data && 'approved' in data) {
      normalized = {
        source_id: data.source_id,
        process_id: data.task_id,
        validated: data.approved,
        promoted_to: data.migrated_to,
        execution_signature: data.process_signature,
        timestamp_last_touched: new Date(data.event_timestamp),
        data_payload: data.data_payload,
      };
    } else if ('analytics_approved' in data && 'knowledge_signature' in data) {
      normalized = {
        source_id: data.source_id,
        process_id: data.task_id,
        validated: data.analytics_approved,
        promoted_to: data.consolidated_from,
        execution_signature: data.knowledge_signature,
        timestamp_last_touched: new Date(data.event_timestamp),
        data_payload: data.data_payload,
      };
    } else {
      const {
        source_id,
        process_id,
        validated,
        promoted_to,
        execution_signature,
        timestamp_last_touched,
        ...data_payload
      } = data;
      normalized = {
        source_id: source_id,
        process_id: process_id,
        validated: validated,
        promoted_to: promoted_to,
        execution_signature: execution_signature,
        timestamp_last_touched: new Date(timestamp_last_touched),
        data_payload,
      };
    }
    return this.validate(normalized);
  }
  static createFirebaseDocument(collection, payload, ttl_seconds = 3600) {
    const spvpet = this.toSPVPET(payload);
    return {
      collection,
      document: {
        ...spvpet,
        ttl: ttl_seconds,
        created_at: new Date().toISOString(),
        collection_type: 'working_memory',
      },
    };
  }
  static createNeonInsert(table, payload) {
    const stamped = this.toSTAMPED(payload);
    const sql = `
      INSERT INTO ${table} (
        source_id, task_id, approved, migrated_to, 
        process_signature, event_timestamp, data_payload
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (source_id, task_id, process_signature) 
      DO UPDATE SET
        approved = EXCLUDED.approved,
        migrated_to = EXCLUDED.migrated_to,
        event_timestamp = EXCLUDED.event_timestamp,
        data_payload = EXCLUDED.data_payload,
        updated_at = NOW()
    `;
    const values = [
      stamped.source_id,
      stamped.task_id,
      stamped.approved,
      stamped.migrated_to,
      stamped.process_signature,
      stamped.event_timestamp,
      JSON.stringify(stamped.data_payload),
    ];
    return { sql, values };
  }
  static createBigQueryInsert(dataset, table, payload) {
    const stacked = this.toSTACKED(payload);
    return {
      dataset,
      table,
      rows: [
        {
          insertId: `${stacked.source_id}-${stacked.task_id}-${Date.now()}`,
          json: stacked,
        },
      ],
    };
  }
}
exports.BartonDoctrineFormatter = BartonDoctrineFormatter;
exports.SPVPETSchema = zod_1.z
  .object({
    source_id: zod_1.z.string(),
    process_id: zod_1.z.string(),
    validated: zod_1.z
      .boolean()
      .or(zod_1.z.enum(['pending', 'approved', 'rejected'])),
    promoted_to: zod_1.z.string().nullable(),
    execution_signature: zod_1.z.string(),
    timestamp_last_touched: zod_1.z.string().datetime(),
  })
  .passthrough();
exports.STAMPEDSchema = zod_1.z.object({
  source_id: zod_1.z.string(),
  task_id: zod_1.z.string(),
  approved: zod_1.z.boolean(),
  migrated_to: zod_1.z.string().nullable(),
  process_signature: zod_1.z.string(),
  event_timestamp: zod_1.z.string().datetime(),
  data_payload: zod_1.z.record(zod_1.z.unknown()),
});
exports.STACKEDSchema = zod_1.z.object({
  source_id: zod_1.z.string(),
  task_id: zod_1.z.string(),
  analytics_approved: zod_1.z.boolean(),
  consolidated_from: zod_1.z.string().nullable(),
  knowledge_signature: zod_1.z.string(),
  event_timestamp: zod_1.z.string().datetime(),
  data_payload: zod_1.z.record(zod_1.z.unknown()),
});
//# sourceMappingURL=barton-doctrine-formatter.js.map
