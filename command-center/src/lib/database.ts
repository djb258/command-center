/**
 * 🔒 DATABASE LAYER - BARTON DOCTRINE COMPLIANT
 * 
 * MANDATORY: All database operations go through this layer
 * Enforces SPVPET/STAMPED/STACKED schema compliance
 */

import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { BartonDoctrine, BartonDoctrineViolationError } from '@/core/barton-doctrine-enforcer';

// MANDATORY: Initialize Barton Doctrine for database operations
const doctrine = BartonDoctrine;

export class DatabaseManager {
  private db: Database.Database;
  private static instance: DatabaseManager;

  private constructor() {
    this.db = new Database('command-center.db');
    this.initializeTables();
  }

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private initializeTables(): void {
    // Create tables with Barton Doctrine compliance
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS commands (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'draft', 'archived')),
        priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        metadata TEXT
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        command_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
        priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
        assigned_to TEXT,
        due_date TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        metadata TEXT,
        FOREIGN KEY (command_id) REFERENCES commands (id)
      );

      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
        priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
        start_date TEXT,
        end_date TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        metadata TEXT
      );

      CREATE TABLE IF NOT EXISTS barton_doctrine_logs (
        id TEXT PRIMARY KEY,
        source_id TEXT NOT NULL,
        process_id TEXT NOT NULL,
        validated BOOLEAN NOT NULL,
        execution_signature TEXT NOT NULL,
        timestamp_last_touched TEXT NOT NULL,
        data_payload TEXT,
        operation TEXT NOT NULL,
        tool_name TEXT NOT NULL
      );
    `);
  }

  // Command operations with Barton Doctrine validation
  async createCommand(commandData: any): Promise<any> {
    const payload = {
      source_id: 'command-center',
      process_id: 'create-command',
      validated: true,
      execution_signature: this.generateSignature(),
      timestamp_last_touched: new Date().toISOString(),
      data_payload: commandData
    };

    // MANDATORY: Validate through Barton Doctrine
    const validatedPayload = doctrine.validatePayload(payload, 'database', 'createCommand');
    
    const command = {
      id: uuidv4(),
      ...commandData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Validate command schema
    const validatedCommand = doctrine.validateCommand(command);

    const stmt = this.db.prepare(`
      INSERT INTO commands (id, name, description, category, status, priority, created_at, updated_at, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      validatedCommand.id,
      validatedCommand.name,
      validatedCommand.description,
      validatedCommand.category,
      validatedCommand.status,
      validatedCommand.priority,
      validatedCommand.created_at,
      validatedCommand.updated_at,
      JSON.stringify(validatedCommand.metadata)
    );

    // Log Barton Doctrine compliance
    this.logBartonDoctrineOperation(validatedPayload, 'create-command', 'database');

    return validatedCommand;
  }

  async getCommands(): Promise<any[]> {
    const stmt = this.db.prepare('SELECT * FROM commands ORDER BY created_at DESC');
    const commands = stmt.all();
    
    return commands.map(cmd => ({
      ...cmd,
      metadata: cmd.metadata ? JSON.parse(cmd.metadata) : null
    }));
  }

  async updateCommand(id: string, updates: any): Promise<any> {
    const payload = {
      source_id: 'command-center',
      process_id: 'update-command',
      validated: true,
      execution_signature: this.generateSignature(),
      timestamp_last_touched: new Date().toISOString(),
      data_payload: { id, updates }
    };

    // MANDATORY: Validate through Barton Doctrine
    doctrine.validatePayload(payload, 'database', 'updateCommand');

    const stmt = this.db.prepare(`
      UPDATE commands 
      SET name = ?, description = ?, category = ?, status = ?, priority = ?, updated_at = ?, metadata = ?
      WHERE id = ?
    `);

    const result = stmt.run(
      updates.name,
      updates.description,
      updates.category,
      updates.status,
      updates.priority,
      new Date().toISOString(),
      JSON.stringify(updates.metadata),
      id
    );

    if (result.changes === 0) {
      throw new Error('Command not found');
    }

    return this.getCommandById(id);
  }

  async deleteCommand(id: string): Promise<void> {
    const payload = {
      source_id: 'command-center',
      process_id: 'delete-command',
      validated: true,
      execution_signature: this.generateSignature(),
      timestamp_last_touched: new Date().toISOString(),
      data_payload: { id }
    };

    // MANDATORY: Validate through Barton Doctrine
    doctrine.validatePayload(payload, 'database', 'deleteCommand');

    const stmt = this.db.prepare('DELETE FROM commands WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      throw new Error('Command not found');
    }
  }

  async getCommandById(id: string): Promise<any> {
    const stmt = this.db.prepare('SELECT * FROM commands WHERE id = ?');
    const command = stmt.get(id);
    
    if (!command) {
      throw new Error('Command not found');
    }

    return {
      ...command,
      metadata: command.metadata ? JSON.parse(command.metadata) : null
    };
  }

  // Task operations with Barton Doctrine validation
  async createTask(taskData: any): Promise<any> {
    const payload = {
      source_id: 'command-center',
      process_id: 'create-task',
      validated: true,
      execution_signature: this.generateSignature(),
      timestamp_last_touched: new Date().toISOString(),
      data_payload: taskData
    };

    // MANDATORY: Validate through Barton Doctrine
    doctrine.validatePayload(payload, 'database', 'createTask');

    const task = {
      id: uuidv4(),
      ...taskData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Validate task schema
    const validatedTask = doctrine.validateTask(task);

    const stmt = this.db.prepare(`
      INSERT INTO tasks (id, command_id, title, description, status, priority, assigned_to, due_date, created_at, updated_at, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      validatedTask.id,
      validatedTask.command_id,
      validatedTask.title,
      validatedTask.description,
      validatedTask.status,
      validatedTask.priority,
      validatedTask.assigned_to,
      validatedTask.due_date,
      validatedTask.created_at,
      validatedTask.updated_at,
      JSON.stringify(validatedTask.metadata)
    );

    return validatedTask;
  }

  async getTasks(): Promise<any[]> {
    const stmt = this.db.prepare(`
      SELECT t.*, c.name as command_name 
      FROM tasks t 
      LEFT JOIN commands c ON t.command_id = c.id 
      ORDER BY t.created_at DESC
    `);
    const tasks = stmt.all();
    
    return tasks.map(task => ({
      ...task,
      metadata: task.metadata ? JSON.parse(task.metadata) : null
    }));
  }

  async updateTask(id: string, updates: any): Promise<any> {
    const payload = {
      source_id: 'command-center',
      process_id: 'update-task',
      validated: true,
      execution_signature: this.generateSignature(),
      timestamp_last_touched: new Date().toISOString(),
      data_payload: { id, updates }
    };

    // MANDATORY: Validate through Barton Doctrine
    doctrine.validatePayload(payload, 'database', 'updateTask');

    const stmt = this.db.prepare(`
      UPDATE tasks 
      SET title = ?, description = ?, status = ?, priority = ?, assigned_to = ?, due_date = ?, updated_at = ?, metadata = ?
      WHERE id = ?
    `);

    const result = stmt.run(
      updates.title,
      updates.description,
      updates.status,
      updates.priority,
      updates.assigned_to,
      updates.due_date,
      new Date().toISOString(),
      JSON.stringify(updates.metadata),
      id
    );

    if (result.changes === 0) {
      throw new Error('Task not found');
    }

    return this.getTaskById(id);
  }

  async deleteTask(id: string): Promise<void> {
    const payload = {
      source_id: 'command-center',
      process_id: 'delete-task',
      validated: true,
      execution_signature: this.generateSignature(),
      timestamp_last_touched: new Date().toISOString(),
      data_payload: { id }
    };

    // MANDATORY: Validate through Barton Doctrine
    doctrine.validatePayload(payload, 'database', 'deleteTask');

    const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      throw new Error('Task not found');
    }
  }

  async getTaskById(id: string): Promise<any> {
    const stmt = this.db.prepare(`
      SELECT t.*, c.name as command_name 
      FROM tasks t 
      LEFT JOIN commands c ON t.command_id = c.id 
      WHERE t.id = ?
    `);
    const task = stmt.get(id);
    
    if (!task) {
      throw new Error('Task not found');
    }

    return {
      ...task,
      metadata: task.metadata ? JSON.parse(task.metadata) : null
    };
  }

  // Project operations with Barton Doctrine validation
  async createProject(projectData: any): Promise<any> {
    const payload = {
      source_id: 'command-center',
      process_id: 'create-project',
      validated: true,
      execution_signature: this.generateSignature(),
      timestamp_last_touched: new Date().toISOString(),
      data_payload: projectData
    };

    // MANDATORY: Validate through Barton Doctrine
    doctrine.validatePayload(payload, 'database', 'createProject');

    const project = {
      id: uuidv4(),
      ...projectData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Validate project schema
    const validatedProject = doctrine.validateProject(project);

    const stmt = this.db.prepare(`
      INSERT INTO projects (id, name, description, status, priority, start_date, end_date, created_at, updated_at, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      validatedProject.id,
      validatedProject.name,
      validatedProject.description,
      validatedProject.status,
      validatedProject.priority,
      validatedProject.start_date,
      validatedProject.end_date,
      validatedProject.created_at,
      validatedProject.updated_at,
      JSON.stringify(validatedProject.metadata)
    );

    return validatedProject;
  }

  async getProjects(): Promise<any[]> {
    const stmt = this.db.prepare('SELECT * FROM projects ORDER BY created_at DESC');
    const projects = stmt.all();
    
    return projects.map(project => ({
      ...project,
      metadata: project.metadata ? JSON.parse(project.metadata) : null
    }));
  }

  async updateProject(id: string, updates: any): Promise<any> {
    const payload = {
      source_id: 'command-center',
      process_id: 'update-project',
      validated: true,
      execution_signature: this.generateSignature(),
      timestamp_last_touched: new Date().toISOString(),
      data_payload: { id, updates }
    };

    // MANDATORY: Validate through Barton Doctrine
    doctrine.validatePayload(payload, 'database', 'updateProject');

    const stmt = this.db.prepare(`
      UPDATE projects 
      SET name = ?, description = ?, status = ?, priority = ?, start_date = ?, end_date = ?, updated_at = ?, metadata = ?
      WHERE id = ?
    `);

    const result = stmt.run(
      updates.name,
      updates.description,
      updates.status,
      updates.priority,
      updates.start_date,
      updates.end_date,
      new Date().toISOString(),
      JSON.stringify(updates.metadata),
      id
    );

    if (result.changes === 0) {
      throw new Error('Project not found');
    }

    return this.getProjectById(id);
  }

  async deleteProject(id: string): Promise<void> {
    const payload = {
      source_id: 'command-center',
      process_id: 'delete-project',
      validated: true,
      execution_signature: this.generateSignature(),
      timestamp_last_touched: new Date().toISOString(),
      data_payload: { id }
    };

    // MANDATORY: Validate through Barton Doctrine
    doctrine.validatePayload(payload, 'database', 'deleteProject');

    const stmt = this.db.prepare('DELETE FROM projects WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      throw new Error('Project not found');
    }
  }

  async getProjectById(id: string): Promise<any> {
    const stmt = this.db.prepare('SELECT * FROM projects WHERE id = ?');
    const project = stmt.get(id);
    
    if (!project) {
      throw new Error('Project not found');
    }

    return {
      ...project,
      metadata: project.metadata ? JSON.parse(project.metadata) : null
    };
  }

  // Barton Doctrine logging
  private logBartonDoctrineOperation(payload: any, operation: string, toolName: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO barton_doctrine_logs (id, source_id, process_id, validated, execution_signature, timestamp_last_touched, data_payload, operation, tool_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      uuidv4(),
      payload.source_id,
      payload.process_id,
      payload.validated ? 1 : 0,
      payload.execution_signature,
      payload.timestamp_last_touched,
      JSON.stringify(payload.data_payload),
      operation,
      toolName
    );
  }

  private generateSignature(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Get Barton Doctrine violations
  getBartonDoctrineViolations(): any[] {
    return doctrine.getViolations();
  }

  // Close database connection
  close(): void {
    this.db.close();
  }
}

// Export singleton instance
export const db = DatabaseManager.getInstance(); 