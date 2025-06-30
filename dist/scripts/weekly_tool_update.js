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
exports.WeeklyToolUpdater = void 0;
const child_process_1 = require('child_process');
const fs = __importStar(require('fs'));
const path = __importStar(require('path'));
class WeeklyToolUpdater {
  constructor() {
    this.results = [];
    this.logFile = path.join(__dirname, '..', 'logs', 'weekly-update.log');
    this.ensureLogDirectory();
  }
  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }
  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    fs.appendFileSync(this.logFile, logMessage);
  }
  async runCommand(command, description) {
    try {
      this.log(`Running: ${description}`);
      const output = (0, child_process_1.execSync)(command, {
        encoding: 'utf8',
        timeout: 300000,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      return output.trim();
    } catch (error) {
      this.log(`Error in ${description}: ${error.message}`);
      throw error;
    }
  }
  async updateWingetTools() {
    this.log('🔄 Updating Winget tools...');
    const wingetTools = [
      'Docker.DockerDesktop',
      'Microsoft.WindowsTerminal',
      'JanDeDobbeleer.OhMyPosh',
      'Postman.Postman',
      'Microsoft.PowerToys',
      'Yarn.Yarn',
      'Rustlang.Rustup',
      'GoLang.Go',
      'Neovim.Neovim',
      'BurntSushi.ripgrep.MSVC',
      'junegunn.fzf',
      'sharkdp.bat',
      'jqlang.jq',
      'sharkdp.fd',
      'GitKraken.cli',
      'Axosoft.GitKraken',
      'GitHub.GitHubDesktop',
      'Git.Git',
    ];
    try {
      await this.runCommand(
        'winget upgrade --all --accept-source-agreements --accept-package-agreements --silent',
        'Updating all Winget tools'
      );
      for (const tool of wingetTools) {
        this.results.push({
          tool: tool.split('.').pop() || tool,
          oldVersion: 'winget',
          newVersion: 'latest',
          status: 'updated',
        });
      }
    } catch (error) {
      this.log(`Some winget updates may have failed: ${error.message}`);
    }
  }
  async updateNodeTools() {
    this.log('📦 Updating Node.js tools...');
    try {
      await this.runCommand('npm install -g npm@latest', 'Updating npm');
      const globalPackages = ['typescript', 'tsx', 'ts-node'];
      for (const pkg of globalPackages) {
        try {
          await this.runCommand(
            `npm install -g ${pkg}@latest`,
            `Updating ${pkg}`
          );
          this.results.push({
            tool: pkg,
            oldVersion: 'global',
            newVersion: 'latest',
            status: 'updated',
          });
        } catch (error) {
          this.results.push({
            tool: pkg,
            oldVersion: 'global',
            newVersion: 'failed',
            status: 'failed',
            error: error.message,
          });
        }
      }
      if (fs.existsSync('package.json')) {
        await this.runCommand('npm update', 'Updating project dependencies');
      }
    } catch (error) {
      this.log(`Error updating Node.js tools: ${error.message}`);
    }
  }
  async updatePythonTools() {
    this.log('🐍 Updating Python tools...');
    try {
      await this.runCommand(
        'python -m pip install --upgrade pip',
        'Updating pip'
      );
      await this.runCommand(
        'pip install --upgrade setuptools wheel',
        'Updating Python tools'
      );
      this.results.push({
        tool: 'Python tools',
        oldVersion: 'installed',
        newVersion: 'latest',
        status: 'updated',
      });
    } catch (error) {
      this.log(`Error updating Python tools: ${error.message}`);
    }
  }
  async cleanupSystem() {
    this.log('🧹 Performing cleanup...');
    try {
      await this.runCommand('npm cache clean --force', 'Cleaning npm cache');
    } catch (error) {
      this.log(`Cleanup warning: ${error.message}`);
    }
  }
  generateReport() {
    this.log('\n📊 UPDATE REPORT');
    this.log('================');
    const updated = this.results.filter((r) => r.status === 'updated');
    const failed = this.results.filter((r) => r.status === 'failed');
    this.log(`✅ Updated: ${updated.length} tools`);
    this.log(`❌ Failed: ${failed.length} tools`);
    if (failed.length > 0) {
      this.log('\n❌ Failed Updates:');
      failed.forEach((tool) => {
        this.log(`  • ${tool.tool}: ${tool.error || 'Unknown error'}`);
      });
    }
    const reportFile = path.join(
      __dirname,
      '..',
      'logs',
      `update-report-${new Date().toISOString().split('T')[0]}.json`
    );
    fs.writeFileSync(reportFile, JSON.stringify(this.results, null, 2));
    this.log(`\n📄 Report saved to: ${reportFile}`);
  }
  async runWeeklyUpdate() {
    this.log('🚀 Starting Weekly Tool Update');
    this.log(`📅 Date: ${new Date().toISOString()}`);
    this.log('================================\n');
    try {
      await this.updateWingetTools();
      await this.updateNodeTools();
      await this.updatePythonTools();
      await this.cleanupSystem();
      this.generateReport();
      this.log('\n🎉 Weekly update completed!');
      this.log('💡 Restart your terminal to use updated tools');
    } catch (error) {
      this.log(`\n❌ Update failed: ${error.message}`);
      process.exit(1);
    }
  }
}
exports.WeeklyToolUpdater = WeeklyToolUpdater;
async function main() {
  const updater = new WeeklyToolUpdater();
  await updater.runWeeklyUpdate();
}
if (require.main === module) {
  main().catch(console.error);
}
//# sourceMappingURL=weekly_tool_update.js.map
