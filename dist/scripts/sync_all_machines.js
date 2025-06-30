'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.MachineSynchronizer = exports.MachineSyncConfigSchema = void 0;
const fs_1 = __importDefault(require('fs'));
const path_1 = __importDefault(require('path'));
const child_process_1 = require('child_process');
const zod_1 = require('zod');
exports.MachineSyncConfigSchema = zod_1.z.object({
  machines: zod_1.z.array(
    zod_1.z.object({
      name: zod_1.z.string(),
      type: zod_1.z.enum(['local', 'remote', 'cloud']),
      host: zod_1.z.string().optional(),
      user: zod_1.z.string().optional(),
      sshKey: zod_1.z.string().optional(),
      syncPaths: zod_1.z.array(zod_1.z.string()),
      tools: zod_1.z.array(
        zod_1.z.enum([
          'cursor',
          'mindpal',
          'deerflow',
          'render',
          'make',
          'firebase',
          'bigquery',
          'neon',
        ])
      ),
    })
  ),
  cursorConfig: zod_1.z.object({
    settingsPath: zod_1.z.string(),
    extensionsPath: zod_1.z.string(),
    keybindingsPath: zod_1.z.string(),
    snippetsPath: zod_1.z.string(),
    workspacePath: zod_1.z.string(),
  }),
  toolsConfig: zod_1.z.object({
    envTemplatePath: zod_1.z.string(),
    packageJsonPath: zod_1.z.string(),
    doctrinePath: zod_1.z.string(),
    schemasPath: zod_1.z.string(),
  }),
  syncOptions: zod_1.z.object({
    backupBeforeSync: zod_1.z.boolean().default(true),
    validateAfterSync: zod_1.z.boolean().default(true),
    notifyOnCompletion: zod_1.z.boolean().default(true),
  }),
});
class MachineSynchronizer {
  constructor(config) {
    this.syncLog = [];
    this.config = exports.MachineSyncConfigSchema.parse(config);
  }
  async syncAllMachines() {
    const results = {};
    this.log('Starting machine synchronization...');
    for (const machine of this.config.machines) {
      this.log(`Syncing machine: ${machine.name} (${machine.type})`);
      try {
        const result = await this.syncMachine(machine);
        results[machine.name] = result;
        if (result.success) {
          this.log(`✅ Successfully synced ${machine.name}`);
        } else {
          this.log(
            `❌ Failed to sync ${machine.name}: ${result.errors.join(', ')}`
          );
        }
      } catch (error) {
        results[machine.name] = {
          success: false,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        };
        this.log(
          `❌ Error syncing ${machine.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
    const successCount = Object.values(results).filter((r) => r.success).length;
    const totalCount = this.config.machines.length;
    const summary = `Sync completed: ${successCount}/${totalCount} machines successful`;
    if (this.config.syncOptions.notifyOnCompletion) {
      await this.sendNotification(summary, results);
    }
    return {
      success: successCount === totalCount,
      results,
      summary,
    };
  }
  async syncMachine(machine) {
    const errors = [];
    try {
      if (this.config.syncOptions.backupBeforeSync) {
        await this.backupMachineConfig(machine);
      }
      if (machine.tools.includes('cursor')) {
        try {
          await this.syncCursorConfig(machine);
        } catch (error) {
          errors.push(
            `Cursor sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }
      for (const tool of machine.tools) {
        if (tool !== 'cursor') {
          try {
            await this.syncToolConfig(machine, tool);
          } catch (error) {
            errors.push(
              `${tool} sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }
      }
      if (this.config.syncOptions.validateAfterSync) {
        try {
          await this.validateMachineSync(machine);
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
  async backupMachineConfig(machine) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path_1.default.join(
      process.cwd(),
      'backups',
      machine.name,
      timestamp
    );
    this.log(`Creating backup for ${machine.name} in ${backupDir}`);
    if (machine.type === 'local') {
      for (const syncPath of machine.syncPaths) {
        if (fs_1.default.existsSync(syncPath)) {
          const relativePath = path_1.default.relative(process.cwd(), syncPath);
          const backupPath = path_1.default.join(backupDir, relativePath);
          fs_1.default.mkdirSync(path_1.default.dirname(backupPath), {
            recursive: true,
          });
          fs_1.default.copyFileSync(syncPath, backupPath);
        }
      }
    } else {
      const rsyncCmd = `rsync -avz --backup-dir="${backupDir}" ${machine.user}@${machine.host}:${machine.syncPaths.join(' ')} ./backups/${machine.name}/`;
      (0, child_process_1.execSync)(rsyncCmd, { stdio: 'inherit' });
    }
  }
  async syncCursorConfig(machine) {
    this.log(`Syncing Cursor config for ${machine.name}`);
    const cursorConfigs = [
      this.config.cursorConfig.settingsPath,
      this.config.cursorConfig.extensionsPath,
      this.config.cursorConfig.keybindingsPath,
      this.config.cursorConfig.snippetsPath,
      this.config.cursorConfig.workspacePath,
    ];
    for (const configPath of cursorConfigs) {
      if (fs_1.default.existsSync(configPath)) {
        await this.syncFile(machine, configPath, configPath);
      }
    }
    await this.syncCursorExtensions(machine);
  }
  async syncCursorExtensions(machine) {
    try {
      const extensions = (0, child_process_1.execSync)(
        'code --list-extensions',
        { encoding: 'utf8' }
      )
        .split('\n')
        .filter((ext) => ext.trim());
      const extensionsFile = path_1.default.join(
        process.cwd(),
        'cursor-extensions.txt'
      );
      fs_1.default.writeFileSync(extensionsFile, extensions.join('\n'));
      await this.syncFile(machine, extensionsFile, extensionsFile);
      if (machine.type === 'local') {
        for (const ext of extensions) {
          try {
            (0, child_process_1.execSync)(`code --install-extension ${ext}`, {
              stdio: 'inherit',
            });
          } catch (error) {
            this.log(`Warning: Failed to install extension ${ext}`);
          }
        }
      } else {
        const installScript = extensions
          .map((ext) => `code --install-extension ${ext}`)
          .join('\n');
        const scriptFile = path_1.default.join(
          process.cwd(),
          'install-extensions.sh'
        );
        fs_1.default.writeFileSync(scriptFile, `#!/bin/bash\n${installScript}`);
        (0, child_process_1.execSync)(
          `scp ${scriptFile} ${machine.user}@${machine.host}:/tmp/`
        );
        (0, child_process_1.execSync)(
          `ssh ${machine.user}@${machine.host} 'chmod +x /tmp/install-extensions.sh && /tmp/install-extensions.sh'`
        );
      }
    } catch (error) {
      this.log(
        `Warning: Failed to sync Cursor extensions: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async syncToolConfig(machine, tool) {
    this.log(`Syncing ${tool} config for ${machine.name}`);
    const toolConfigs = {
      mindpal: ['env.template', 'src/schemas/blueprint-schemas.ts'],
      deerflow: ['env.template', 'src/schemas/blueprint-schemas.ts'],
      render: [
        'env.template',
        'src/schemas/blueprint-schemas.ts',
        'scripts/deploy_render.sh',
      ],
      make: ['env.template', 'src/schemas/blueprint-schemas.ts'],
      firebase: ['env.template', 'firebase/'],
      bigquery: ['env.template', 'scripts/bigquery_ingest.ts'],
      neon: ['env.template', 'scripts/neon_sync.ts'],
    };
    const configs = toolConfigs[tool] || [];
    for (const config of configs) {
      if (fs_1.default.existsSync(config)) {
        await this.syncFile(machine, config, config);
      }
    }
    await this.syncFile(machine, 'package.json', 'package.json');
  }
  async syncFile(machine, source, target) {
    if (machine.type === 'local') {
      if (fs_1.default.existsSync(source)) {
        const targetDir = path_1.default.dirname(target);
        fs_1.default.mkdirSync(targetDir, { recursive: true });
        if (fs_1.default.statSync(source).isDirectory()) {
          this.copyDirectory(source, target);
        } else {
          fs_1.default.copyFileSync(source, target);
        }
      }
    } else {
      const rsyncCmd = `rsync -avz "${source}" ${machine.user}@${machine.host}:"${target}"`;
      (0, child_process_1.execSync)(rsyncCmd, { stdio: 'inherit' });
    }
  }
  copyDirectory(source, target) {
    if (!fs_1.default.existsSync(target)) {
      fs_1.default.mkdirSync(target, { recursive: true });
    }
    const files = fs_1.default.readdirSync(source);
    for (const file of files) {
      const sourcePath = path_1.default.join(source, file);
      const targetPath = path_1.default.join(target, file);
      if (fs_1.default.statSync(sourcePath).isDirectory()) {
        this.copyDirectory(sourcePath, targetPath);
      } else {
        fs_1.default.copyFileSync(sourcePath, targetPath);
      }
    }
  }
  async validateMachineSync(machine) {
    this.log(`Validating sync for ${machine.name}`);
    const keyFiles = [
      'package.json',
      'env.template',
      'src/schemas/blueprint-schemas.ts',
      'DOCTRINE.md',
    ];
    for (const file of keyFiles) {
      if (machine.type === 'local') {
        if (!fs_1.default.existsSync(file)) {
          throw new Error(`Key file missing: ${file}`);
        }
      } else {
        try {
          (0, child_process_1.execSync)(
            `ssh ${machine.user}@${machine.host} "test -f ${file}"`,
            { stdio: 'pipe' }
          );
        } catch (error) {
          throw new Error(`Key file missing on remote: ${file}`);
        }
      }
    }
    await this.validateEnvironmentConfig(machine);
  }
  async validateEnvironmentConfig(machine) {
    const envFile = machine.type === 'local' ? '.env' : '.env';
    if (machine.type === 'local') {
      if (!fs_1.default.existsSync(envFile)) {
        throw new Error('Environment file (.env) missing');
      }
      const envContent = fs_1.default.readFileSync(envFile, 'utf8');
      const requiredVars = this.getRequiredEnvVars(machine.tools);
      for (const requiredVar of requiredVars) {
        if (!envContent.includes(requiredVar)) {
          throw new Error(
            `Required environment variable missing: ${requiredVar}`
          );
        }
      }
    } else {
      const requiredVars = this.getRequiredEnvVars(machine.tools);
      for (const requiredVar of requiredVars) {
        try {
          (0, child_process_1.execSync)(
            `ssh ${machine.user}@${machine.host} "grep -q '${requiredVar}' ${envFile}"`,
            { stdio: 'pipe' }
          );
        } catch (error) {
          throw new Error(
            `Required environment variable missing on remote: ${requiredVar}`
          );
        }
      }
    }
  }
  getRequiredEnvVars(tools) {
    const toolVars = {
      mindpal: ['MINDPAL_API_KEY'],
      deerflow: ['DEERFLOW_API_KEY'],
      render: ['RENDER_API_KEY', 'RENDER_WEBHOOK_URL'],
      make: ['MAKE_API_KEY'],
      firebase: ['FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY'],
      bigquery: ['GOOGLE_APPLICATION_CREDENTIALS', 'BIGQUERY_PROJECT_ID'],
      neon: ['NEON_DATABASE_URL'],
    };
    return tools.flatMap((tool) => toolVars[tool] || []);
  }
  async sendNotification(summary, results) {
    const notification = {
      timestamp: new Date().toISOString(),
      summary,
      results,
      log: this.syncLog,
    };
    const notificationFile = path_1.default.join(
      process.cwd(),
      'sync-notifications.json'
    );
    const notifications = fs_1.default.existsSync(notificationFile)
      ? JSON.parse(fs_1.default.readFileSync(notificationFile, 'utf8'))
      : [];
    notifications.push(notification);
    fs_1.default.writeFileSync(
      notificationFile,
      JSON.stringify(notifications, null, 2)
    );
    console.log('\n' + '='.repeat(50));
    console.log('SYNC NOTIFICATION');
    console.log('='.repeat(50));
    console.log(summary);
    console.log('\nDetailed Results:');
    for (const [machine, result] of Object.entries(results)) {
      console.log(`\n${machine}: ${result.success ? '✅' : '❌'}`);
      if (result.errors.length > 0) {
        console.log('  Errors:');
        result.errors.forEach((error) => console.log(`    - ${error}`));
      }
    }
    console.log('='.repeat(50));
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
      machines: [
        {
          name: 'local-machine',
          type: 'local',
          syncPaths: [
            '~/.cursor/settings.json',
            '~/.cursor/keybindings.json',
            '~/.cursor/snippets/',
            '~/.cursor/workspaceStorage/',
            '~/projects/cursor-blueprint-enforcer/',
          ],
          tools: [
            'cursor',
            'mindpal',
            'deerflow',
            'render',
            'make',
            'firebase',
            'bigquery',
            'neon',
          ],
        },
        {
          name: 'remote-server',
          type: 'remote',
          host: 'your-server.com',
          user: 'your-username',
          sshKey: '~/.ssh/id_rsa',
          syncPaths: [
            '~/cursor-config/',
            '~/projects/cursor-blueprint-enforcer/',
          ],
          tools: ['cursor', 'mindpal', 'deerflow', 'render', 'make'],
        },
      ],
      cursorConfig: {
        settingsPath: '~/.cursor/settings.json',
        extensionsPath: '~/.cursor/extensions/',
        keybindingsPath: '~/.cursor/keybindings.json',
        snippetsPath: '~/.cursor/snippets/',
        workspacePath: '~/.cursor/workspaceStorage/',
      },
      toolsConfig: {
        envTemplatePath: 'env.template',
        packageJsonPath: 'package.json',
        doctrinePath: 'DOCTRINE.md',
        schemasPath: 'src/schemas/',
      },
      syncOptions: {
        backupBeforeSync: true,
        validateAfterSync: true,
        notifyOnCompletion: true,
      },
    };
  }
}
exports.MachineSynchronizer = MachineSynchronizer;
if (require.main === module) {
  const configPath = process.argv[2] || 'machine-sync-config.json';
  if (!fs_1.default.existsSync(configPath)) {
    console.log('Creating machine sync configuration template...');
    const template = MachineSynchronizer.generateConfigTemplate();
    fs_1.default.writeFileSync(configPath, JSON.stringify(template, null, 2));
    console.log(`Configuration template created at ${configPath}`);
    console.log('Please edit the configuration file and run the sync again.');
    process.exit(0);
  }
  try {
    const config = JSON.parse(fs_1.default.readFileSync(configPath, 'utf8'));
    const synchronizer = new MachineSynchronizer(config);
    synchronizer
      .syncAllMachines()
      .then((result) => {
        console.log('\nSync Summary:', result.summary);
        process.exit(result.success ? 0 : 1);
      })
      .catch((error) => {
        console.error('Sync failed:', error);
        process.exit(1);
      });
  } catch (error) {
    console.error('Failed to load configuration:', error);
    process.exit(1);
  }
}
//# sourceMappingURL=sync_all_machines.js.map
