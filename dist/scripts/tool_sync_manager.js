'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.ToolSyncManager = exports.ToolSyncConfigSchema = void 0;
const fs_1 = __importDefault(require('fs'));
const path_1 = __importDefault(require('path'));
const child_process_1 = require('child_process');
const zod_1 = require('zod');
exports.ToolSyncConfigSchema = zod_1.z.object({
  tools: zod_1.z.array(
    zod_1.z.object({
      name: zod_1.z.enum([
        'mindpal',
        'deerflow',
        'render',
        'make',
        'firebase',
        'bigquery',
        'neon',
      ]),
      enabled: zod_1.z.boolean().default(true),
      configFiles: zod_1.z.array(zod_1.z.string()),
      envVars: zod_1.z.array(zod_1.z.string()),
      dependencies: zod_1.z.array(zod_1.z.string()).default([]),
    })
  ),
  syncOptions: zod_1.z.object({
    backupBeforeSync: zod_1.z.boolean().default(true),
    validateAfterSync: zod_1.z.boolean().default(true),
    installDependencies: zod_1.z.boolean().default(true),
    updateEnvFile: zod_1.z.boolean().default(true),
  }),
  targetMachines: zod_1.z.array(
    zod_1.z.object({
      name: zod_1.z.string(),
      type: zod_1.z.enum(['local', 'remote']),
      host: zod_1.z.string().optional(),
      user: zod_1.z.string().optional(),
      projectPath: zod_1.z.string(),
    })
  ),
});
class ToolSyncManager {
  constructor(config) {
    this.syncLog = [];
    this.config = exports.ToolSyncConfigSchema.parse(config);
  }
  async syncAllTools() {
    const results = {};
    this.log('Starting tool synchronization across all machines...');
    for (const machine of this.config.targetMachines) {
      results[machine.name] = {};
      this.log(`Syncing tools for machine: ${machine.name}`);
      for (const tool of this.config.tools) {
        if (!tool.enabled) {
          this.log(`Skipping disabled tool: ${tool.name}`);
          continue;
        }
        try {
          const result = await this.syncTool(machine, tool);
          results[machine.name][tool.name] = result;
          if (result.success) {
            this.log(`✅ Successfully synced ${tool.name} to ${machine.name}`);
          } else {
            this.log(
              `❌ Failed to sync ${tool.name} to ${machine.name}: ${result.errors.join(', ')}`
            );
          }
        } catch (error) {
          results[machine.name][tool.name] = {
            success: false,
            errors: [error instanceof Error ? error.message : 'Unknown error'],
          };
          this.log(
            `❌ Error syncing ${tool.name} to ${machine.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }
    }
    const successCount = Object.values(results).reduce(
      (machineResults, toolResults) => {
        return (
          machineResults +
          Object.values(toolResults).filter((r) => r.success).length
        );
      },
      0
    );
    const totalCount =
      this.config.targetMachines.length *
      this.config.tools.filter((t) => t.enabled).length;
    const summary = `Tool sync completed: ${successCount}/${totalCount} tool-machine combinations successful`;
    return {
      success: successCount === totalCount,
      results,
      summary,
    };
  }
  async syncTool(machine, tool) {
    const errors = [];
    try {
      if (this.config.syncOptions.backupBeforeSync) {
        await this.backupToolConfig(machine, tool);
      }
      for (const configFile of tool.configFiles) {
        try {
          await this.syncConfigFile(machine, tool, configFile);
        } catch (error) {
          errors.push(
            `Config file sync failed for ${configFile}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }
      if (this.config.syncOptions.updateEnvFile) {
        try {
          await this.updateEnvFile(machine, tool);
        } catch (error) {
          errors.push(
            `Environment file update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }
      if (
        this.config.syncOptions.installDependencies &&
        tool.dependencies.length > 0
      ) {
        try {
          await this.installDependencies(machine, tool);
        } catch (error) {
          errors.push(
            `Dependency installation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }
      if (this.config.syncOptions.validateAfterSync) {
        try {
          await this.validateToolSync(machine, tool);
        } catch (error) {
          errors.push(
            `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }
      return {
        success: errors.length === 0,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }
  async backupToolConfig(machine, tool) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path_1.default.join(
      process.cwd(),
      'backups',
      machine.name,
      tool.name,
      timestamp
    );
    this.log(`Creating backup for ${tool.name} on ${machine.name}`);
    if (machine.type === 'local') {
      for (const configFile of tool.configFiles) {
        const sourcePath = path_1.default.join(machine.projectPath, configFile);
        if (fs_1.default.existsSync(sourcePath)) {
          const backupPath = path_1.default.join(backupDir, configFile);
          fs_1.default.mkdirSync(path_1.default.dirname(backupPath), {
            recursive: true,
          });
          fs_1.default.copyFileSync(sourcePath, backupPath);
        }
      }
    } else {
      const rsyncCmd = `rsync -avz --backup-dir="${backupDir}" ${machine.user}@${machine.host}:${machine.projectPath}/{${tool.configFiles.join(',')}} ./backups/${machine.name}/${tool.name}/`;
      (0, child_process_1.execSync)(rsyncCmd, { stdio: 'inherit' });
    }
  }
  async syncConfigFile(machine, tool, configFile) {
    const sourcePath = path_1.default.join(process.cwd(), configFile);
    const targetPath = path_1.default.join(machine.projectPath, configFile);
    if (!fs_1.default.existsSync(sourcePath)) {
      throw new Error(`Source config file not found: ${sourcePath}`);
    }
    if (machine.type === 'local') {
      fs_1.default.mkdirSync(path_1.default.dirname(targetPath), {
        recursive: true,
      });
      fs_1.default.copyFileSync(sourcePath, targetPath);
    } else {
      const rsyncCmd = `rsync -avz "${sourcePath}" ${machine.user}@${machine.host}:"${targetPath}"`;
      (0, child_process_1.execSync)(rsyncCmd, { stdio: 'inherit' });
    }
  }
  async updateEnvFile(machine, tool) {
    const envTemplatePath = path_1.default.join(process.cwd(), 'env.template');
    const targetEnvPath = path_1.default.join(machine.projectPath, '.env');
    if (!fs_1.default.existsSync(envTemplatePath)) {
      throw new Error('Environment template not found');
    }
    let envContent = fs_1.default.readFileSync(envTemplatePath, 'utf8');
    for (const envVar of tool.envVars) {
      if (!envContent.includes(envVar)) {
        envContent += `\n# ${tool.name.toUpperCase()} Configuration\n${envVar}=\n`;
      }
    }
    if (machine.type === 'local') {
      fs_1.default.mkdirSync(path_1.default.dirname(targetEnvPath), {
        recursive: true,
      });
      fs_1.default.writeFileSync(targetEnvPath, envContent);
    } else {
      const tempEnvFile = path_1.default.join(process.cwd(), 'temp-env');
      fs_1.default.writeFileSync(tempEnvFile, envContent);
      const rsyncCmd = `rsync -avz "${tempEnvFile}" ${machine.user}@${machine.host}:"${targetEnvPath}"`;
      (0, child_process_1.execSync)(rsyncCmd, { stdio: 'inherit' });
      fs_1.default.unlinkSync(tempEnvFile);
    }
  }
  async installDependencies(machine, tool) {
    if (tool.dependencies.length === 0) {
      return;
    }
    this.log(`Installing dependencies for ${tool.name} on ${machine.name}`);
    if (machine.type === 'local') {
      for (const dep of tool.dependencies) {
        try {
          (0, child_process_1.execSync)(`npm install ${dep}`, {
            cwd: machine.projectPath,
            stdio: 'inherit',
          });
        } catch (error) {
          this.log(
            `Warning: Failed to install dependency ${dep}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }
    } else {
      const installScript = tool.dependencies
        .map((dep) => `npm install ${dep}`)
        .join('\n');
      const scriptFile = path_1.default.join(
        process.cwd(),
        `install-${tool.name}-deps.sh`
      );
      fs_1.default.writeFileSync(
        scriptFile,
        `#!/bin/bash\ncd ${machine.projectPath}\n${installScript}`
      );
      (0, child_process_1.execSync)(
        `scp ${scriptFile} ${machine.user}@${machine.host}:/tmp/`
      );
      (0, child_process_1.execSync)(
        `ssh ${machine.user}@${machine.host} 'chmod +x /tmp/install-${tool.name}-deps.sh && /tmp/install-${tool.name}-deps.sh'`
      );
      fs_1.default.unlinkSync(scriptFile);
    }
  }
  async validateToolSync(machine, tool) {
    this.log(`Validating ${tool.name} sync on ${machine.name}`);
    for (const configFile of tool.configFiles) {
      const targetPath = path_1.default.join(machine.projectPath, configFile);
      if (machine.type === 'local') {
        if (!fs_1.default.existsSync(targetPath)) {
          throw new Error(`Configuration file missing: ${configFile}`);
        }
      } else {
        try {
          (0, child_process_1.execSync)(
            `ssh ${machine.user}@${machine.host} "test -f ${targetPath}"`,
            { stdio: 'pipe' }
          );
        } catch (error) {
          throw new Error(
            `Configuration file missing on remote: ${configFile}`
          );
        }
      }
    }
    const envPath = path_1.default.join(machine.projectPath, '.env');
    if (machine.type === 'local') {
      if (!fs_1.default.existsSync(envPath)) {
        throw new Error('Environment file missing');
      }
      const envContent = fs_1.default.readFileSync(envPath, 'utf8');
      for (const envVar of tool.envVars) {
        if (!envContent.includes(envVar)) {
          throw new Error(`Environment variable missing: ${envVar}`);
        }
      }
    } else {
      for (const envVar of tool.envVars) {
        try {
          (0, child_process_1.execSync)(
            `ssh ${machine.user}@${machine.host} "grep -q '${envVar}' ${envPath}"`,
            { stdio: 'pipe' }
          );
        } catch (error) {
          throw new Error(`Environment variable missing on remote: ${envVar}`);
        }
      }
    }
    await this.validateToolSpecific(machine, tool);
  }
  async validateToolSpecific(machine, tool) {
    switch (tool.name) {
      case 'mindpal':
        await this.validateMindPalConfig(machine);
        break;
      case 'deerflow':
        await this.validateDeerFlowConfig(machine);
        break;
      case 'render':
        await this.validateRenderConfig(machine);
        break;
      case 'make':
        await this.validateMakeConfig(machine);
        break;
      case 'firebase':
        await this.validateFirebaseConfig(machine);
        break;
      case 'bigquery':
        await this.validateBigQueryConfig(machine);
        break;
      case 'neon':
        await this.validateNeonConfig(machine);
        break;
    }
  }
  async validateMindPalConfig(machine) {
    const mindpalScript = path_1.default.join(
      machine.projectPath,
      'scripts/mindpal_integration.ts'
    );
    if (machine.type === 'local') {
      if (!fs_1.default.existsSync(mindpalScript)) {
        throw new Error('MindPal integration script missing');
      }
    } else {
      try {
        (0, child_process_1.execSync)(
          `ssh ${machine.user}@${machine.host} "test -f ${mindpalScript}"`,
          { stdio: 'pipe' }
        );
      } catch (error) {
        throw new Error('MindPal integration script missing on remote');
      }
    }
  }
  async validateDeerFlowConfig(machine) {
    const deerflowScript = path_1.default.join(
      machine.projectPath,
      'scripts/deerflow_integration.ts'
    );
    if (machine.type === 'local') {
      if (!fs_1.default.existsSync(deerflowScript)) {
        throw new Error('DeerFlow integration script missing');
      }
    } else {
      try {
        (0, child_process_1.execSync)(
          `ssh ${machine.user}@${machine.host} "test -f ${deerflowScript}"`,
          { stdio: 'pipe' }
        );
      } catch (error) {
        throw new Error('DeerFlow integration script missing on remote');
      }
    }
  }
  async validateRenderConfig(machine) {
    const renderScript = path_1.default.join(
      machine.projectPath,
      'scripts/render_integration.ts'
    );
    const deployScript = path_1.default.join(
      machine.projectPath,
      'scripts/deploy_render.sh'
    );
    if (machine.type === 'local') {
      if (!fs_1.default.existsSync(renderScript)) {
        throw new Error('Render integration script missing');
      }
      if (!fs_1.default.existsSync(deployScript)) {
        throw new Error('Render deployment script missing');
      }
    } else {
      try {
        (0, child_process_1.execSync)(
          `ssh ${machine.user}@${machine.host} "test -f ${renderScript}"`,
          { stdio: 'pipe' }
        );
        (0, child_process_1.execSync)(
          `ssh ${machine.user}@${machine.host} "test -f ${deployScript}"`,
          { stdio: 'pipe' }
        );
      } catch (error) {
        throw new Error('Render scripts missing on remote');
      }
    }
  }
  async validateMakeConfig(machine) {
    const makeScript = path_1.default.join(
      machine.projectPath,
      'scripts/make_integration.ts'
    );
    if (machine.type === 'local') {
      if (!fs_1.default.existsSync(makeScript)) {
        throw new Error('Make.com integration script missing');
      }
    } else {
      try {
        (0, child_process_1.execSync)(
          `ssh ${machine.user}@${machine.host} "test -f ${makeScript}"`,
          { stdio: 'pipe' }
        );
      } catch (error) {
        throw new Error('Make.com integration script missing on remote');
      }
    }
  }
  async validateFirebaseConfig(machine) {
    const firebaseScript = path_1.default.join(
      machine.projectPath,
      'scripts/firebase_push.ts'
    );
    const firebaseDir = path_1.default.join(machine.projectPath, 'firebase');
    if (machine.type === 'local') {
      if (!fs_1.default.existsSync(firebaseScript)) {
        throw new Error('Firebase integration script missing');
      }
      if (!fs_1.default.existsSync(firebaseDir)) {
        throw new Error('Firebase directory missing');
      }
    } else {
      try {
        (0, child_process_1.execSync)(
          `ssh ${machine.user}@${machine.host} "test -f ${firebaseScript}"`,
          { stdio: 'pipe' }
        );
        (0, child_process_1.execSync)(
          `ssh ${machine.user}@${machine.host} "test -d ${firebaseDir}"`,
          { stdio: 'pipe' }
        );
      } catch (error) {
        throw new Error('Firebase configuration missing on remote');
      }
    }
  }
  async validateBigQueryConfig(machine) {
    const bigqueryScript = path_1.default.join(
      machine.projectPath,
      'scripts/bigquery_ingest.ts'
    );
    if (machine.type === 'local') {
      if (!fs_1.default.existsSync(bigqueryScript)) {
        throw new Error('BigQuery integration script missing');
      }
    } else {
      try {
        (0, child_process_1.execSync)(
          `ssh ${machine.user}@${machine.host} "test -f ${bigqueryScript}"`,
          { stdio: 'pipe' }
        );
      } catch (error) {
        throw new Error('BigQuery integration script missing on remote');
      }
    }
  }
  async validateNeonConfig(machine) {
    const neonScript = path_1.default.join(
      machine.projectPath,
      'scripts/neon_sync.ts'
    );
    if (machine.type === 'local') {
      if (!fs_1.default.existsSync(neonScript)) {
        throw new Error('Neon integration script missing');
      }
    } else {
      try {
        (0, child_process_1.execSync)(
          `ssh ${machine.user}@${machine.host} "test -f ${neonScript}"`,
          { stdio: 'pipe' }
        );
      } catch (error) {
        throw new Error('Neon integration script missing on remote');
      }
    }
  }
  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    this.syncLog.push(logMessage);
    console.log(logMessage);
  }
  getSyncLog() {
    return this.syncLog;
  }
  static generateConfigTemplate() {
    return {
      tools: [
        {
          name: 'mindpal',
          enabled: true,
          configFiles: [
            'scripts/mindpal_integration.ts',
            'src/schemas/blueprint-schemas.ts',
          ],
          envVars: ['MINDPAL_API_KEY'],
          dependencies: ['axios'],
        },
        {
          name: 'deerflow',
          enabled: true,
          configFiles: [
            'scripts/deerflow_integration.ts',
            'src/schemas/blueprint-schemas.ts',
          ],
          envVars: ['DEERFLOW_API_KEY'],
          dependencies: ['axios'],
        },
        {
          name: 'render',
          enabled: true,
          configFiles: [
            'scripts/render_integration.ts',
            'scripts/deploy_render.sh',
            'src/schemas/blueprint-schemas.ts',
          ],
          envVars: ['RENDER_API_KEY', 'RENDER_WEBHOOK_URL'],
          dependencies: ['axios'],
        },
        {
          name: 'make',
          enabled: true,
          configFiles: [
            'scripts/make_integration.ts',
            'src/schemas/blueprint-schemas.ts',
          ],
          envVars: ['MAKE_API_KEY'],
          dependencies: ['axios'],
        },
        {
          name: 'firebase',
          enabled: true,
          configFiles: ['scripts/firebase_push.ts', 'firebase/'],
          envVars: ['FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY'],
          dependencies: ['firebase-admin'],
        },
        {
          name: 'bigquery',
          enabled: true,
          configFiles: ['scripts/bigquery_ingest.ts'],
          envVars: ['GOOGLE_APPLICATION_CREDENTIALS', 'BIGQUERY_PROJECT_ID'],
          dependencies: ['@google-cloud/bigquery'],
        },
        {
          name: 'neon',
          enabled: true,
          configFiles: ['scripts/neon_sync.ts'],
          envVars: ['NEON_DATABASE_URL'],
          dependencies: ['pg'],
        },
      ],
      syncOptions: {
        backupBeforeSync: true,
        validateAfterSync: true,
        installDependencies: true,
        updateEnvFile: true,
      },
      targetMachines: [
        {
          name: 'local-machine',
          type: 'local',
          projectPath: process.cwd(),
        },
        {
          name: 'remote-server',
          type: 'remote',
          host: 'your-server.com',
          user: 'your-username',
          projectPath: '/home/your-username/projects/cursor-blueprint-enforcer',
        },
      ],
    };
  }
}
exports.ToolSyncManager = ToolSyncManager;
if (require.main === module) {
  const configPath = process.argv[2] || 'tool-sync-config.json';
  if (!fs_1.default.existsSync(configPath)) {
    console.log('Creating tool sync configuration template...');
    const template = ToolSyncManager.generateConfigTemplate();
    fs_1.default.writeFileSync(configPath, JSON.stringify(template, null, 2));
    console.log(`Configuration template created at ${configPath}`);
    console.log('Please edit the configuration file and run the sync again.');
    process.exit(0);
  }
  try {
    const config = JSON.parse(fs_1.default.readFileSync(configPath, 'utf8'));
    const syncManager = new ToolSyncManager(config);
    syncManager
      .syncAllTools()
      .then((result) => {
        console.log('\nTool Sync Summary:', result.summary);
        process.exit(result.success ? 0 : 1);
      })
      .catch((error) => {
        console.error('Tool sync failed:', error);
        process.exit(1);
      });
  } catch (error) {
    console.error('Failed to load configuration:', error);
    process.exit(1);
  }
}
//# sourceMappingURL=tool_sync_manager.js.map
