#!/usr/bin/env tsx
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
exports.AutoBackupSystem = void 0;
const child_process_1 = require('child_process');
const fs = __importStar(require('fs'));
const path = __importStar(require('path'));
class AutoBackupSystem {
  constructor() {
    this.projectRoot = path.dirname(__dirname);
    this.backupInterval = 30 * 60 * 1000;
    this.lastBackupFile = path.join(this.projectRoot, '.last-backup');
  }
  log(message, color = 'blue') {
    const timestamp = new Date().toISOString();
    const colors = {
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      red: '\x1b[31m',
      blue: '\x1b[34m',
    };
    console.log(`${colors[color]}[${timestamp}] ${message}\x1b[0m`);
  }
  runCommand(command) {
    try {
      const output = (0, child_process_1.execSync)(command, {
        cwd: this.projectRoot,
        encoding: 'utf8',
        stdio: 'pipe',
      });
      return { success: true, output: output.toString() };
    } catch (error) {
      return { success: false, output: error.message };
    }
  }
  async checkForChanges() {
    const result = this.runCommand('git status --porcelain');
    if (!result.success) {
      this.log('❌ Failed to check git status', 'red');
      return false;
    }
    return result.output.trim().length > 0;
  }
  async commitAndPush(message) {
    this.log('🔄 Starting auto-backup process...', 'blue');
    const hasChanges = await this.checkForChanges();
    if (!hasChanges) {
      this.log('✅ No changes to backup', 'green');
      return true;
    }
    const addResult = this.runCommand('git add .');
    if (!addResult.success) {
      this.log('❌ Failed to add changes to git', 'red');
      return false;
    }
    const commitMessage = message || this.generateCommitMessage();
    const commitResult = this.runCommand(
      `git commit -m "${commitMessage}" --no-verify`
    );
    if (!commitResult.success) {
      this.log('❌ Failed to commit changes', 'red');
      return false;
    }
    this.log(`✅ Committed: ${commitMessage}`, 'green');
    const pushResult = this.runCommand('git push origin main');
    if (!pushResult.success) {
      this.log('❌ Failed to push to remote repository', 'red');
      this.log(`Push error: ${pushResult.output}`, 'yellow');
      return false;
    }
    this.log('🚀 Successfully pushed to remote repository!', 'green');
    fs.writeFileSync(this.lastBackupFile, new Date().toISOString());
    return true;
  }
  generateCommitMessage() {
    const timestamp = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
    const statusResult = this.runCommand('git status --porcelain');
    const changes = statusResult.output
      .split('\n')
      .filter((line) => line.trim());
    let changeTypes = [];
    let hasEnvChanges = false;
    let hasConfigChanges = false;
    let hasScriptChanges = false;
    let hasDocChanges = false;
    for (const change of changes) {
      if (change.includes('.env') || change.includes('env.')) {
        hasEnvChanges = true;
      } else if (
        change.includes('.json') ||
        change.includes('.yml') ||
        change.includes('.yaml')
      ) {
        hasConfigChanges = true;
      } else if (
        change.includes('scripts/') ||
        change.includes('.ts') ||
        change.includes('.js')
      ) {
        hasScriptChanges = true;
      } else if (change.includes('.md') || change.includes('README')) {
        hasDocChanges = true;
      }
    }
    if (hasEnvChanges) changeTypes.push('env');
    if (hasConfigChanges) changeTypes.push('config');
    if (hasScriptChanges) changeTypes.push('scripts');
    if (hasDocChanges) changeTypes.push('docs');
    const changeType = changeTypes.length > 0 ? changeTypes.join('+') : 'misc';
    return `🔄 Auto-backup ${timestamp} ${time} - Updated ${changeType}`;
  }
  async startAutoBackup() {
    this.log('🚀 Starting auto-backup daemon...', 'blue');
    this.log(
      `⏰ Backup interval: ${this.backupInterval / 1000 / 60} minutes`,
      'blue'
    );
    await this.commitAndPush('🔄 Auto-backup daemon started');
    setInterval(async () => {
      await this.commitAndPush();
    }, this.backupInterval);
    process.on('SIGINT', () => {
      this.log('🛑 Auto-backup daemon stopping...', 'yellow');
      this.commitAndPush('🔄 Auto-backup daemon stopped').then(() => {
        process.exit(0);
      });
    });
    this.log(
      '✅ Auto-backup daemon is running. Press Ctrl+C to stop.',
      'green'
    );
  }
  async backupOnFileChange() {
    this.log('👀 Starting file watcher for auto-backup...', 'blue');
    const chokidar = await Promise.resolve().then(() =>
      __importStar(require('chokidar'))
    );
    const watcher = chokidar.watch(
      [
        '.env*',
        'package.json',
        'package-lock.json',
        'scripts/**/*',
        '*.md',
        '*.yml',
        '*.yaml',
        'src/**/*',
      ],
      {
        ignored: [
          'node_modules/**',
          '.git/**',
          'dist/**',
          'logs/**',
          '.env.backup.*',
        ],
        persistent: true,
        cwd: this.projectRoot,
      }
    );
    let backupTimeout;
    watcher.on('change', (filePath) => {
      this.log(`📝 File changed: ${filePath}`, 'yellow');
      clearTimeout(backupTimeout);
      backupTimeout = setTimeout(async () => {
        await this.commitAndPush(`📝 Updated ${filePath}`);
      }, 5000);
    });
    watcher.on('add', (filePath) => {
      this.log(`➕ File added: ${filePath}`, 'yellow');
      clearTimeout(backupTimeout);
      backupTimeout = setTimeout(async () => {
        await this.commitAndPush(`➕ Added ${filePath}`);
      }, 5000);
    });
    this.log(
      '✅ File watcher is active. Changes will be auto-backed up.',
      'green'
    );
  }
  async manualBackup(message) {
    this.log('🔧 Manual backup requested...', 'blue');
    const success = await this.commitAndPush(message || '🔧 Manual backup');
    if (success) {
      this.log('✅ Manual backup completed successfully!', 'green');
    } else {
      this.log('❌ Manual backup failed!', 'red');
      process.exit(1);
    }
  }
  getLastBackupTime() {
    try {
      if (fs.existsSync(this.lastBackupFile)) {
        const timestamp = fs.readFileSync(this.lastBackupFile, 'utf8');
        return new Date(timestamp).toLocaleString();
      }
    } catch (error) {}
    return null;
  }
  async status() {
    this.log('📊 Auto-Backup Status', 'blue');
    this.log('==================', 'blue');
    const hasChanges = await this.checkForChanges();
    const lastBackup = this.getLastBackupTime();
    this.log(
      `🔄 Pending changes: ${hasChanges ? 'YES' : 'NO'}`,
      hasChanges ? 'yellow' : 'green'
    );
    this.log(
      `⏰ Last backup: ${lastBackup || 'Never'}`,
      lastBackup ? 'green' : 'yellow'
    );
    if (hasChanges) {
      const statusResult = this.runCommand('git status --porcelain');
      this.log('\n📝 Changed files:', 'yellow');
      statusResult.output.split('\n').forEach((line) => {
        if (line.trim()) {
          this.log(`  ${line}`, 'yellow');
        }
      });
    }
  }
}
exports.AutoBackupSystem = AutoBackupSystem;
async function main() {
  const args = process.argv.slice(2);
  const backup = new AutoBackupSystem();
  switch (args[0]) {
    case 'start':
      await backup.startAutoBackup();
      break;
    case 'watch':
      await backup.backupOnFileChange();
      break;
    case 'now':
      await backup.manualBackup(args[1]);
      break;
    case 'status':
      await backup.status();
      break;
    default:
      console.log(`
🔄 Auto-Backup System

Usage:
  npm run backup:start         # Start auto-backup daemon (every 30 min)
  npm run backup:watch         # Watch files and backup on changes
  npm run backup:now [message] # Manual backup now
  npm run backup:status        # Show backup status

Examples:
  npm run backup:now "Added new API keys"
  npm run backup:watch         # Best for active development
      `);
  }
}
if (require.main === module) {
  main().catch(console.error);
}
//# sourceMappingURL=auto_backup.js.map
