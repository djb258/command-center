/**
 * 🔒 BARTON DOCTRINE ENFORCER - COMMAND CENTER
 * 
 * MANDATORY: All data operations MUST go through this enforcer
 * Ensures SPVPET/STAMPED/STACKED schema compliance
 * NO EXCEPTIONS - NO BYPASS - NO COMPROMISE
 */

import { z } from 'zod';
import { createHash } from 'crypto';

// Base schema that all Command Center data must conform to
export const BartonDoctrineBaseSchema = z.object({
  source_id: z.string().min(1, 'Source ID is required'),
  process_id: z.string().min(1, 'Process ID is required'),
  validated: z.boolean().or(z.enum(['pending', 'approved', 'rejected'])),
  promoted_to: z.string().optional(),
  execution_signature: z.string().min(1, 'Execution signature is required'),
  timestamp_last_touched: z.date().or(z.string().datetime()),
  data_payload: z.record(z.unknown()).optional()
});

// Command Center specific schemas
export const CommandSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Command name is required').max(255),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['active', 'inactive', 'draft', 'archived']),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  created_at: z.date(),
  updated_at: z.date(),
  metadata: z.record(z.unknown()).optional()
});

export const TaskSchema = z.object({
  id: z.string().uuid(),
  command_id: z.string().uuid(),
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  assigned_to: z.string().optional(),
  due_date: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date(),
  metadata: z.record(z.unknown()).optional()
});

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Project name is required').max(255),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date(),
  metadata: z.record(z.unknown()).optional()
});

export class BartonDoctrineViolationError extends Error {
  constructor(message: string, public violation: any) {
    super(message);
    this.name = 'BartonDoctrineViolationError';
  }
}

export class BartonDoctrineEnforcer {
  private static instance: BartonDoctrineEnforcer;
  private violations: any[] = [];
  private enforcementEnabled = true;
  private strictMode = true;

  private constructor() {
    this.setupGlobalEnforcement();
  }

  static getInstance(): BartonDoctrineEnforcer {
    if (!BartonDoctrineEnforcer.instance) {
      BartonDoctrineEnforcer.instance = new BartonDoctrineEnforcer();
    }
    return BartonDoctrineEnforcer.instance;
  }

  private setupGlobalEnforcement(): void {
    console.log('🔒 Barton Doctrine enforcement ENABLED for Command Center');
    console.log('   All data operations will be validated against SPVPET/STAMPED/STACKED schema');
  }

  validatePayload(payload: unknown, toolName: string, operation = 'unknown'): any {
    if (!this.enforcementEnabled) {
      console.warn('⚠️  Barton Doctrine enforcement is DISABLED - this is dangerous!');
      return payload;
    }

    try {
      const validatedPayload = BartonDoctrineBaseSchema.parse(payload);
      this.logValidation(toolName, operation, 'SUCCESS', validatedPayload);
      return validatedPayload;
    } catch (error) {
      const violation = {
        timestamp: new Date().toISOString(),
        tool: toolName,
        operation,
        error: error instanceof Error ? error.message : 'Unknown validation error',
        payload: this.sanitizePayload(payload)
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

  validateCommand(command: unknown): any {
    return CommandSchema.parse(command);
  }

  validateTask(task: unknown): any {
    return TaskSchema.parse(task);
  }

  validateProject(project: unknown): any {
    return ProjectSchema.parse(project);
  }

  private logValidation(toolName: string, operation: string, status: string, payload: any): void {
    console.log(`🔒 Barton Doctrine: ${toolName}.${operation} - ${status}`);
  }

  private logViolation(violation: any): void {
    console.error(`🚨 Barton Doctrine VIOLATION:`, violation);
  }

  private sanitizePayload(payload: unknown): unknown {
    if (typeof payload === 'object' && payload !== null) {
      const sanitized = { ...payload as any };
      // Remove sensitive fields if present
      delete sanitized.password;
      delete sanitized.token;
      delete sanitized.secret;
      return sanitized;
    }
    return payload;
  }

  private attemptPayloadRepair(payload: unknown, toolName: string): any {
    console.warn(`🔧 Attempting to repair payload for ${toolName}...`);
    
    // Add missing required fields with defaults
    const repaired = {
      source_id: 'command-center',
      process_id: toolName,
      validated: false,
      execution_signature: this.generateSignature(),
      timestamp_last_touched: new Date().toISOString(),
      data_payload: payload
    };
    
    return repaired;
  }

  private generateSignature(): string {
    return createHash('sha256')
      .update(Date.now().toString() + Math.random().toString())
      .digest('hex')
      .substring(0, 16);
  }

  getViolations(): any[] {
    return [...this.violations];
  }

  clearViolations(): void {
    this.violations = [];
  }

  setStrict(strict: boolean): void {
    this.strictMode = strict;
  }

  setEnabled(enabled: boolean): void {
    this.enforcementEnabled = enabled;
  }
}

// Global instance
export const BartonDoctrine = BartonDoctrineEnforcer.getInstance(); 