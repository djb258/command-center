'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o)
            if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.BartonDoctrine =
  exports.GlobalBartonDoctrineEnforcer =
  exports.BartonDoctrineViolationError =
  exports.BartonDoctrineEnforcer =
    void 0;
const barton_doctrine_formatter_1 = require('./barton-doctrine-formatter');
const fs = __importStar(require('fs'));
const path = __importStar(require('path'));
class BartonDoctrineEnforcer {
  constructor() {
    this.violations = [];
    this.enforcementEnabled = true;
    this.strictMode = true;
    this.setupGlobalEnforcement();
  }
  static getInstance() {
    if (!BartonDoctrineEnforcer.instance) {
      BartonDoctrineEnforcer.instance = new BartonDoctrineEnforcer();
    }
    return BartonDoctrineEnforcer.instance;
  }
  validatePayload(payload, toolName, operation = 'unknown') {
    if (!this.enforcementEnabled) {
      console.warn(
        '⚠️  Barton Doctrine enforcement is DISABLED - this is dangerous!'
      );
      return payload;
    }
    try {
      const validatedPayload =
        barton_doctrine_formatter_1.BartonDoctrineBaseSchema.parse(payload);
      this.logValidation(toolName, operation, 'SUCCESS', validatedPayload);
      return validatedPayload;
    } catch (error) {
      const violation = {
        timestamp: new Date().toISOString(),
        tool: toolName,
        operation,
        error:
          error instanceof Error ? error.message : 'Unknown validation error',
        payload: this.sanitizePayload(payload),
      };
      this.violations.push(violation);
      this.logViolation(violation);
      if (this.strictMode) {
        throw new BartonDoctrineViolationError(
          `BARTON DOCTRINE VIOLATION in ${toolName}.${operation}: ${violation.error}`,
          violation
        );
      }
      return this.attemptPayloadRepair(payload, toolName);
    }
  }
  interceptDatabaseOperation(operation, payload, toolName) {
    const validatedPayload = this.validatePayload(
      payload,
      toolName,
      `${operation}_operation`
    );
    const formattedPayload =
      barton_doctrine_formatter_1.BartonDoctrineFormatter.formatForDatabase(
        validatedPayload,
        operation
      );
    console.log(
      `✅ ${toolName} payload formatted for ${operation.toUpperCase()} (${operation === 'firebase' ? 'SPVPET' : operation === 'neon' ? 'STAMPED' : 'STACKED'})`
    );
    return formattedPayload;
  }
  setupGlobalEnforcement() {
    process.on('exit', () => {
      this.saveViolationReport();
    });
    process.on('SIGINT', () => {
      this.saveViolationReport();
      process.exit(0);
    });
  }
  logValidation(toolName, operation, status, payload) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      tool: toolName,
      operation,
      status,
      schema_compliance: 'BARTON_DOCTRINE',
      execution_signature: payload.execution_signature,
    };
    this.saveValidationLog(logEntry);
  }
  logViolation(violation) {
    console.error(`🚨 BARTON DOCTRINE VIOLATION DETECTED:`);
    console.error(`   Tool: ${violation.tool}`);
    console.error(`   Time: ${violation.timestamp}`);
    console.error(`   Error: ${violation.error}`);
    console.error(`   This is a CRITICAL system violation!`);
  }
  saveValidationLog(entry) {
    try {
      const logDir = path.join(process.cwd(), 'barton-doctrine-logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      const logFile = path.join(logDir, 'validation-success.log');
      const logLine = JSON.stringify(entry) + '\n';
      fs.appendFileSync(logFile, logLine);
    } catch (error) {
      console.error('Failed to save validation log:', error);
    }
  }
  saveViolationReport() {
    if (this.violations.length === 0) return;
    try {
      const logDir = path.join(process.cwd(), 'barton-doctrine-logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportFile = path.join(logDir, `violations-${timestamp}.json`);
      const report = {
        timestamp: new Date().toISOString(),
        total_violations: this.violations.length,
        enforcement_enabled: this.enforcementEnabled,
        strict_mode: this.strictMode,
        violations: this.violations,
      };
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
      console.error(`🚨 Violation report saved: ${reportFile}`);
    } catch (error) {
      console.error('CRITICAL: Failed to save violation report:', error);
    }
  }
  attemptPayloadRepair(payload, toolName) {
    console.warn(`🔧 Attempting to repair malformed payload from ${toolName}`);
    try {
      const data = payload;
      const repairedPayload =
        barton_doctrine_formatter_1.BartonDoctrineFormatter.createBasePayload(
          data.source_id || toolName,
          data.process_id || `repair_${Date.now()}`,
          data.data_payload || data,
          {
            agent_id: toolName,
            blueprint_id: 'emergency_repair',
            schema_version: '1.0.0',
          }
        );
      console.warn(
        `✅ Payload repaired for ${toolName} - but this should be fixed at source!`
      );
      return repairedPayload;
    } catch (repairError) {
      throw new BartonDoctrineViolationError(
        `CRITICAL: Cannot repair payload from ${toolName}. Manual intervention required.`,
        { payload, repairError }
      );
    }
  }
  sanitizePayload(payload) {
    if (typeof payload !== 'object' || payload === null) {
      return payload;
    }
    const sanitized = { ...payload };
    const sensitiveFields = ['api_key', 'password', 'token', 'secret', 'auth'];
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }
    return sanitized;
  }
  setEnforcementEnabled(enabled) {
    this.enforcementEnabled = enabled;
    console.log(
      `🔒 Barton Doctrine enforcement ${enabled ? 'ENABLED' : 'DISABLED'}`
    );
  }
  setStrictMode(strict) {
    this.strictMode = strict;
    console.log(
      `⚡ Barton Doctrine strict mode ${strict ? 'ENABLED' : 'DISABLED'}`
    );
  }
  getViolationSummary() {
    const byTool = {};
    for (const violation of this.violations) {
      byTool[violation.tool] = (byTool[violation.tool] || 0) + 1;
    }
    return {
      total: this.violations.length,
      byTool,
      recent: this.violations.slice(-5),
    };
  }
}
exports.BartonDoctrineEnforcer = BartonDoctrineEnforcer;
class BartonDoctrineViolationError extends Error {
  constructor(message, violation) {
    super(message);
    this.name = 'BartonDoctrineViolationError';
    this.violation = violation;
  }
}
exports.BartonDoctrineViolationError = BartonDoctrineViolationError;
exports.GlobalBartonDoctrineEnforcer = BartonDoctrineEnforcer.getInstance();
exports.BartonDoctrine = {
  validate: (payload, toolName, operation) => {
    return exports.GlobalBartonDoctrineEnforcer.validatePayload(
      payload,
      toolName,
      operation
    );
  },
  formatFor: (payload, database, toolName) => {
    return exports.GlobalBartonDoctrineEnforcer.interceptDatabaseOperation(
      database,
      payload,
      toolName
    );
  },
  setEnabled: (enabled) => {
    exports.GlobalBartonDoctrineEnforcer.setEnforcementEnabled(enabled);
  },
  setStrict: (strict) => {
    exports.GlobalBartonDoctrineEnforcer.setStrictMode(strict);
  },
  getViolations: () => {
    return exports.GlobalBartonDoctrineEnforcer.getViolationSummary();
  },
};
//# sourceMappingURL=barton-doctrine-enforcer.js.map
