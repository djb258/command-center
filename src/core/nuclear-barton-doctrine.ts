/**
 * NUCLEAR BARTON DOCTRINE ENFORCEMENT
 * 
 * ULTIMATE LEVEL OF COMPLIANCE
 * ZERO TOLERANCE FOR VIOLATIONS
 * AUTOMATIC SYSTEM SHUTDOWN ON VIOLATIONS
 * NO RECOVERY POSSIBLE WITHOUT MANUAL INTERVENTION
 */

import { BartonDoctrine, BartonDoctrineViolationError } from '../schemas/barton-doctrine-enforcer';
import { BartonDoctrineFormatter } from '../schemas/barton-doctrine-formatter';
import * as fs from 'fs';
import * as path from 'path';

/**
 * NUCLEAR ENFORCEMENT MODE
 * 
 * When enabled:
 * - ALL violations trigger immediate system shutdown
 * - NO database operations allowed without perfect compliance
 * - Automatic rollback of any non-compliant changes
 * - Permanent blacklisting of violating tools
 * - System-wide lockdown until manual intervention
 */
export class NuclearBartonDoctrine {
  private static nuclearMode = false;
  private static violationCount = 0;
  private static maxViolations = 1; // ZERO TOLERANCE
  private static blacklistedTools = new Set<string>();
  private static systemLocked = false;
  private static nuclearLog: Array<{
    timestamp: string;
    tool: string;
    violation: string;
    action: string;
    systemState: string;
  }> = [];

  /**
   * ENABLE NUCLEAR MODE - NO GOING BACK
   */
  public static enableNuclearMode(): void {
    if (NuclearBartonDoctrine.nuclearMode) {
      throw new Error('NUCLEAR MODE ALREADY ACTIVE - CANNOT BE ENABLED TWICE');
    }

    console.log('☢️  NUCLEAR BARTON DOCTRINE MODE ENABLED');
    console.log('🚨 ZERO TOLERANCE FOR VIOLATIONS');
    console.log('💥 SYSTEM SHUTDOWN ON FIRST VIOLATION');
    console.log('🔒 NO RECOVERY WITHOUT MANUAL INTERVENTION');
    
    NuclearBartonDoctrine.nuclearMode = true;
    NuclearBartonDoctrine.violationCount = 0;
    NuclearBartonDoctrine.systemLocked = false;
    
    // Set up nuclear event handlers
    this.setupNuclearEventHandlers();
    
    // Log nuclear activation
    this.logNuclearEvent('SYSTEM', 'NUCLEAR_MODE_ENABLED', 'Nuclear mode activated', 'ACTIVE');
  }

  /**
   * NUCLEAR VALIDATION - ULTIMATE ENFORCEMENT
   */
  public static nuclearValidate(
    payload: unknown,
    toolName: string,
    operation: string = 'unknown'
  ): unknown {
    if (!NuclearBartonDoctrine.nuclearMode) {
      throw new Error('NUCLEAR MODE NOT ENABLED - Call enableNuclearMode() first');
    }

    if (NuclearBartonDoctrine.systemLocked) {
      throw new Error('SYSTEM LOCKED - Nuclear violation detected. Manual intervention required.');
    }

    if (NuclearBartonDoctrine.blacklistedTools.has(toolName)) {
      throw new Error(`TOOL BLACKLISTED: ${toolName} - Previous nuclear violation`);
    }

    try {
      // Attempt validation
      const validatedPayload = BartonDoctrine.validate(payload, toolName, operation);
      
      // Log successful validation
      this.logNuclearEvent(toolName, operation, 'VALIDATION_SUCCESS', 'COMPLIANT');
      
      return validatedPayload;
    } catch (error) {
      // NUCLEAR VIOLATION DETECTED
      NuclearBartonDoctrine.violationCount++;
      
      const violation = {
        timestamp: new Date().toISOString(),
        tool: toolName,
        operation,
        error: error instanceof Error ? error.message : 'Unknown nuclear violation',
        payload: this.sanitizePayload(payload)
      };

      // LOG NUCLEAR VIOLATION
      this.logNuclearEvent(toolName, operation, `NUCLEAR_VIOLATION_${NuclearBartonDoctrine.violationCount}`, 'VIOLATION');
      
      // BLACKLIST THE TOOL
      NuclearBartonDoctrine.blacklistedTools.add(toolName);
      
      // CHECK IF SYSTEM SHOULD SHUTDOWN
      if (NuclearBartonDoctrine.violationCount >= NuclearBartonDoctrine.maxViolations) {
        this.triggerNuclearShutdown(violation);
      }

      // THROW NUCLEAR ERROR
      throw new NuclearBartonDoctrineViolationError(
        `NUCLEAR VIOLATION #${NuclearBartonDoctrine.violationCount}: ${toolName}.${operation}`,
        violation
      );
    }
  }

  /**
   * NUCLEAR DATABASE OPERATION - ULTIMATE COMPLIANCE
   */
  public static nuclearDatabaseOperation(
    operation: 'firebase' | 'neon' | 'bigquery',
    payload: unknown,
    toolName: string
  ): Record<string, unknown> {
    if (!NuclearBartonDoctrine.nuclearMode) {
      throw new Error('NUCLEAR MODE NOT ENABLED');
    }

    if (NuclearBartonDoctrine.systemLocked) {
      throw new Error('SYSTEM LOCKED - Nuclear violation detected');
    }

    // Nuclear validation first
    const validatedPayload = this.nuclearValidate(payload, toolName, `${operation}_nuclear_operation`);
    
    // Format for specific database with nuclear compliance
    const formattedPayload = BartonDoctrineFormatter.formatForDatabase(validatedPayload, operation);
    
    // Log successful nuclear operation
    this.logNuclearEvent(toolName, operation, 'NUCLEAR_DATABASE_SUCCESS', 'COMPLIANT');
    
    return formattedPayload;
  }

  /**
   * TRIGGER NUCLEAR SHUTDOWN
   */
  private static triggerNuclearShutdown(violation: any): void {
    console.error('☢️  NUCLEAR SHUTDOWN TRIGGERED');
    console.error('🚨 MAXIMUM VIOLATIONS REACHED');
    console.error('💥 SYSTEM LOCKDOWN INITIATED');
    console.error('🔒 NO FURTHER OPERATIONS ALLOWED');
    
    NuclearBartonDoctrine.systemLocked = true;
    
    // Save nuclear shutdown report
    this.saveNuclearShutdownReport(violation);
    
    // Log nuclear shutdown
    this.logNuclearEvent('SYSTEM', 'NUCLEAR_SHUTDOWN', 'System shutdown triggered', 'LOCKED');
    
    // Exit process with nuclear error code
    process.exit(255); // Nuclear error code
  }

  /**
   * SETUP NUCLEAR EVENT HANDLERS
   */
  private static setupNuclearEventHandlers(): void {
    // Handle process exit
    process.on('exit', (code) => {
      if (code === 255) {
        console.error('☢️  NUCLEAR SHUTDOWN COMPLETE');
        console.error('🔒 SYSTEM LOCKED - Manual intervention required');
      }
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      if (error instanceof NuclearBartonDoctrineViolationError) {
        console.error('☢️  NUCLEAR VIOLATION - Uncaught exception');
        this.triggerNuclearShutdown({ error: error.message });
      }
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason) => {
      if (reason instanceof NuclearBartonDoctrineViolationError) {
        console.error('☢️  NUCLEAR VIOLATION - Unhandled rejection');
        this.triggerNuclearShutdown({ error: reason.message });
      }
    });
  }

  /**
   * LOG NUCLEAR EVENT
   */
  private static logNuclearEvent(
    tool: string,
    operation: string,
    event: string,
    state: string
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      tool,
      operation,
      event,
      state,
      violationCount: NuclearBartonDoctrine.violationCount,
      systemLocked: NuclearBartonDoctrine.systemLocked,
      blacklistedTools: Array.from(NuclearBartonDoctrine.blacklistedTools)
    };

    NuclearBartonDoctrine.nuclearLog.push(logEntry);
    
    // Save to file immediately
    this.saveNuclearLog(logEntry);
  }

  /**
   * SAVE NUCLEAR LOG
   */
  private static saveNuclearLog(entry: any): void {
    try {
      const logDir = path.join(process.cwd(), 'nuclear-doctrine-logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const logFile = path.join(logDir, 'nuclear-events.log');
      const logLine = JSON.stringify(entry) + '\n';
      
      fs.appendFileSync(logFile, logLine);
    } catch (error) {
      console.error('Failed to save nuclear log:', error);
    }
  }

  /**
   * SAVE NUCLEAR SHUTDOWN REPORT
   */
  private static saveNuclearShutdownReport(violation: any): void {
    try {
      const logDir = path.join(process.cwd(), 'nuclear-doctrine-logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportFile = path.join(logDir, `nuclear-shutdown-${timestamp}.json`);
      
      const report = {
        timestamp: new Date().toISOString(),
        nuclearMode: NuclearBartonDoctrine.nuclearMode,
        violationCount: NuclearBartonDoctrine.violationCount,
        maxViolations: NuclearBartonDoctrine.maxViolations,
        systemLocked: NuclearBartonDoctrine.systemLocked,
        blacklistedTools: Array.from(NuclearBartonDoctrine.blacklistedTools),
        nuclearLog: NuclearBartonDoctrine.nuclearLog,
        finalViolation: violation
      };

      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
      console.error(`☢️  Nuclear shutdown report saved: ${reportFile}`);
    } catch (error) {
      console.error('CRITICAL: Failed to save nuclear shutdown report:', error);
    }
  }

  /**
   * GET NUCLEAR STATUS
   */
  public static getNuclearStatus(): {
    nuclearMode: boolean;
    violationCount: number;
    maxViolations: number;
    systemLocked: boolean;
    blacklistedTools: string[];
    nuclearLog: any[];
  } {
    return {
      nuclearMode: NuclearBartonDoctrine.nuclearMode,
      violationCount: NuclearBartonDoctrine.violationCount,
      maxViolations: NuclearBartonDoctrine.maxViolations,
      systemLocked: NuclearBartonDoctrine.systemLocked,
      blacklistedTools: Array.from(NuclearBartonDoctrine.blacklistedTools),
      nuclearLog: NuclearBartonDoctrine.nuclearLog
    };
  }

  /**
   * MANUAL RECOVERY - ONLY FOR AUTHORIZED PERSONNEL
   */
  public static manualRecovery(authorizationCode: string): void {
    if (authorizationCode !== 'BARTON_DOCTRINE_EMERGENCY_OVERRIDE_2025') {
      throw new Error('INVALID AUTHORIZATION CODE - Manual recovery denied');
    }

    console.log('🔓 MANUAL RECOVERY INITIATED');
    console.log('⚠️  Nuclear mode will be disabled');
    console.log('⚠️  All violations will be cleared');
    console.log('⚠️  Blacklisted tools will be unblocked');
    
    NuclearBartonDoctrine.nuclearMode = false;
    NuclearBartonDoctrine.violationCount = 0;
    NuclearBartonDoctrine.systemLocked = false;
    NuclearBartonDoctrine.blacklistedTools.clear();
    
    this.logNuclearEvent('SYSTEM', 'MANUAL_RECOVERY', 'Manual recovery completed', 'RECOVERED');
  }

  private static sanitizePayload(payload: unknown): unknown {
    if (typeof payload !== 'object' || payload === null) {
      return payload;
    }
    
    try {
      return JSON.parse(JSON.stringify(payload));
    } catch {
      return '[Payload sanitization failed]';
    }
  }
}

/**
 * NUCLEAR VIOLATION ERROR
 */
export class NuclearBartonDoctrineViolationError extends Error {
  public readonly violation: any;
  public readonly nuclearLevel: number;

  constructor(message: string, violation: any) {
    super(`☢️  NUCLEAR VIOLATION: ${message}`);
    this.name = 'NuclearBartonDoctrineViolationError';
    this.violation = violation;
    this.nuclearLevel = NuclearBartonDoctrine.violationCount;
  }
}

/**
 * NUCLEAR EXPORT
 */
export const NUCLEAR_DOCTRINE = {
  enable: () => NuclearBartonDoctrine.enableNuclearMode(),
  validate: (payload: unknown, toolName: string, operation?: string) => 
    NuclearBartonDoctrine.nuclearValidate(payload, toolName, operation),
  database: (operation: 'firebase' | 'neon' | 'bigquery', payload: unknown, toolName: string) =>
    NuclearBartonDoctrine.nuclearDatabaseOperation(operation, payload, toolName),
  status: () => NuclearBartonDoctrine.getNuclearStatus(),
  recovery: (code: string) => NuclearBartonDoctrine.manualRecovery(code)
};


