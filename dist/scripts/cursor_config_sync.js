'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.CursorConfigSynchronizer = exports.CursorConfigSchema = void 0;
const fs_1 = __importDefault(require('fs'));
const path_1 = __importDefault(require('path'));
const child_process_1 = require('child_process');
const zod_1 = require('zod');
exports.CursorConfigSchema = zod_1.z.object({
  settings: zod_1.z.record(zod_1.z.unknown()),
  keybindings: zod_1.z.array(zod_1.z.record(zod_1.z.unknown())),
  extensions: zod_1.z.array(zod_1.z.string()),
  snippets: zod_1.z.record(zod_1.z.unknown()),
  workspaceSettings: zod_1.z.record(zod_1.z.unknown()).optional(),
});
class CursorConfigSynchronizer {
  constructor() {
    const platform = process.platform;
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    if (platform === 'win32') {
      this.cursorPaths = {
        settings: path_1.default.join(
          homeDir,
          'AppData',
          'Roaming',
          'Cursor',
          'User',
          'settings.json'
        ),
        keybindings: path_1.default.join(
          homeDir,
          'AppData',
          'Roaming',
          'Cursor',
          'User',
          'keybindings.json'
        ),
        extensions: path_1.default.join(homeDir, '.cursor', 'extensions'),
        snippets: path_1.default.join(
          homeDir,
          'AppData',
          'Roaming',
          'Cursor',
          'User',
          'snippets'
        ),
        workspace: path_1.default.join(
          homeDir,
          'AppData',
          'Roaming',
          'Cursor',
          'User',
          'workspaceStorage'
        ),
      };
    } else if (platform === 'darwin') {
      this.cursorPaths = {
        settings: path_1.default.join(
          homeDir,
          'Library',
          'Application Support',
          'Cursor',
          'User',
          'settings.json'
        ),
        keybindings: path_1.default.join(
          homeDir,
          'Library',
          'Application Support',
          'Cursor',
          'User',
          'keybindings.json'
        ),
        extensions: path_1.default.join(homeDir, '.cursor', 'extensions'),
        snippets: path_1.default.join(
          homeDir,
          'Library',
          'Application Support',
          'Cursor',
          'User',
          'snippets'
        ),
        workspace: path_1.default.join(
          homeDir,
          'Library',
          'Application Support',
          'Cursor',
          'User',
          'workspaceStorage'
        ),
      };
    } else {
      this.cursorPaths = {
        settings: path_1.default.join(
          homeDir,
          '.config',
          'Cursor',
          'User',
          'settings.json'
        ),
        keybindings: path_1.default.join(
          homeDir,
          '.config',
          'Cursor',
          'User',
          'keybindings.json'
        ),
        extensions: path_1.default.join(homeDir, '.cursor', 'extensions'),
        snippets: path_1.default.join(
          homeDir,
          '.config',
          'Cursor',
          'User',
          'snippets'
        ),
        workspace: path_1.default.join(
          homeDir,
          '.config',
          'Cursor',
          'User',
          'workspaceStorage'
        ),
      };
    }
  }
  async exportConfig(outputDir = './cursor-config') {
    const exportedFiles = [];
    const errors = [];
    try {
      fs_1.default.mkdirSync(outputDir, { recursive: true });
      if (fs_1.default.existsSync(this.cursorPaths.settings)) {
        const settingsContent = fs_1.default.readFileSync(
          this.cursorPaths.settings,
          'utf8'
        );
        const settingsFile = path_1.default.join(outputDir, 'settings.json');
        fs_1.default.writeFileSync(settingsFile, settingsContent);
        exportedFiles.push(settingsFile);
      } else {
        errors.push('Settings file not found');
      }
      if (fs_1.default.existsSync(this.cursorPaths.keybindings)) {
        const keybindingsContent = fs_1.default.readFileSync(
          this.cursorPaths.keybindings,
          'utf8'
        );
        const keybindingsFile = path_1.default.join(
          outputDir,
          'keybindings.json'
        );
        fs_1.default.writeFileSync(keybindingsFile, keybindingsContent);
        exportedFiles.push(keybindingsFile);
      } else {
        errors.push('Keybindings file not found');
      }
      const extensions = this.getInstalledExtensions();
      const extensionsFile = path_1.default.join(outputDir, 'extensions.json');
      fs_1.default.writeFileSync(
        extensionsFile,
        JSON.stringify(extensions, null, 2)
      );
      exportedFiles.push(extensionsFile);
      if (fs_1.default.existsSync(this.cursorPaths.snippets)) {
        const snippetsDir = path_1.default.join(outputDir, 'snippets');
        this.copyDirectory(this.cursorPaths.snippets, snippetsDir);
        exportedFiles.push(snippetsDir);
      } else {
        errors.push('Snippets directory not found');
      }
      if (fs_1.default.existsSync(this.cursorPaths.workspace)) {
        const workspaceDir = path_1.default.join(outputDir, 'workspaceStorage');
        this.copyDirectory(this.cursorPaths.workspace, workspaceDir);
        exportedFiles.push(workspaceDir);
      } else {
        errors.push('WorkspaceStorage directory not found');
      }
      const configSummary = {
        exportedAt: new Date().toISOString(),
        platform: process.platform,
        cursorPaths: this.cursorPaths,
        exportedFiles,
        errors,
      };
      const summaryFile = path_1.default.join(outputDir, 'export-summary.json');
      fs_1.default.writeFileSync(
        summaryFile,
        JSON.stringify(configSummary, null, 2)
      );
      exportedFiles.push(summaryFile);
      return {
        success: errors.length === 0,
        exportedFiles,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        exportedFiles,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }
  async importConfig(configDir = './cursor-config') {
    const importedFiles = [];
    const errors = [];
    try {
      if (!fs_1.default.existsSync(configDir)) {
        throw new Error(`Configuration directory not found: ${configDir}`);
      }
      const settingsFile = path_1.default.join(configDir, 'settings.json');
      if (fs_1.default.existsSync(settingsFile)) {
        const settingsContent = fs_1.default.readFileSync(settingsFile, 'utf8');
        fs_1.default.mkdirSync(
          path_1.default.dirname(this.cursorPaths.settings),
          { recursive: true }
        );
        fs_1.default.writeFileSync(this.cursorPaths.settings, settingsContent);
        importedFiles.push('settings.json');
      } else {
        errors.push('Settings file not found in config directory');
      }
      const keybindingsFile = path_1.default.join(
        configDir,
        'keybindings.json'
      );
      if (fs_1.default.existsSync(keybindingsFile)) {
        const keybindingsContent = fs_1.default.readFileSync(
          keybindingsFile,
          'utf8'
        );
        fs_1.default.mkdirSync(
          path_1.default.dirname(this.cursorPaths.keybindings),
          { recursive: true }
        );
        fs_1.default.writeFileSync(
          this.cursorPaths.keybindings,
          keybindingsContent
        );
        importedFiles.push('keybindings.json');
      } else {
        errors.push('Keybindings file not found in config directory');
      }
      const extensionsFile = path_1.default.join(configDir, 'extensions.json');
      if (fs_1.default.existsSync(extensionsFile)) {
        const extensions = JSON.parse(
          fs_1.default.readFileSync(extensionsFile, 'utf8')
        );
        await this.installExtensions(extensions);
        importedFiles.push('extensions.json');
      } else {
        errors.push('Extensions file not found in config directory');
      }
      const snippetsDir = path_1.default.join(configDir, 'snippets');
      if (fs_1.default.existsSync(snippetsDir)) {
        fs_1.default.mkdirSync(
          path_1.default.dirname(this.cursorPaths.snippets),
          { recursive: true }
        );
        this.copyDirectory(snippetsDir, this.cursorPaths.snippets);
        importedFiles.push('snippets');
      } else {
        errors.push('Snippets directory not found in config directory');
      }
      const workspaceDir = path_1.default.join(configDir, 'workspaceStorage');
      if (fs_1.default.existsSync(workspaceDir)) {
        fs_1.default.mkdirSync(
          path_1.default.dirname(this.cursorPaths.workspace),
          { recursive: true }
        );
        this.copyDirectory(workspaceDir, this.cursorPaths.workspace);
        importedFiles.push('workspaceStorage');
      } else {
        errors.push('WorkspaceStorage directory not found in config directory');
      }
      return {
        success: errors.length === 0,
        importedFiles,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        importedFiles,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }
  getInstalledExtensions() {
    try {
      const output = (0, child_process_1.execSync)('code --list-extensions', {
        encoding: 'utf8',
      });
      return output.split('\n').filter((ext) => ext.trim());
    } catch (error) {
      console.warn('Failed to get installed extensions:', error);
      return [];
    }
  }
  async installExtensions(extensions) {
    for (const extension of extensions) {
      try {
        (0, child_process_1.execSync)(`code --install-extension ${extension}`, {
          stdio: 'pipe',
        });
        console.log(`Installed extension: ${extension}`);
      } catch (error) {
        console.warn(`Failed to install extension ${extension}:`, error);
      }
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
  async validateConfig() {
    const issues = [];
    let config = null;
    try {
      if (fs_1.default.existsSync(this.cursorPaths.settings)) {
        const settingsContent = fs_1.default.readFileSync(
          this.cursorPaths.settings,
          'utf8'
        );
        const settings = JSON.parse(settingsContent);
        const requiredSettings = [
          'editor.fontSize',
          'editor.fontFamily',
          'editor.tabSize',
          'editor.insertSpaces',
        ];
        for (const setting of requiredSettings) {
          if (!this.hasNestedProperty(settings, setting)) {
            issues.push(`Missing required setting: ${setting}`);
          }
        }
      } else {
        issues.push('Settings file not found');
      }
      if (fs_1.default.existsSync(this.cursorPaths.keybindings)) {
        const keybindingsContent = fs_1.default.readFileSync(
          this.cursorPaths.keybindings,
          'utf8'
        );
        const keybindings = JSON.parse(keybindingsContent);
        if (!Array.isArray(keybindings)) {
          issues.push('Keybindings file should contain an array');
        }
      } else {
        issues.push('Keybindings file not found');
      }
      const extensions = this.getInstalledExtensions();
      if (extensions.length === 0) {
        issues.push('No extensions found');
      }
      if (fs_1.default.existsSync(this.cursorPaths.workspace)) {
        const files = fs_1.default.readdirSync(this.cursorPaths.workspace);
        if (files.length === 0) {
          issues.push('WorkspaceStorage is empty');
        }
      } else {
        issues.push('WorkspaceStorage directory not found');
      }
      config = {
        settings: fs_1.default.existsSync(this.cursorPaths.settings)
          ? JSON.parse(
              fs_1.default.readFileSync(this.cursorPaths.settings, 'utf8')
            )
          : {},
        keybindings: fs_1.default.existsSync(this.cursorPaths.keybindings)
          ? JSON.parse(
              fs_1.default.readFileSync(this.cursorPaths.keybindings, 'utf8')
            )
          : [],
        extensions,
        snippets: fs_1.default.existsSync(this.cursorPaths.snippets)
          ? this.loadSnippets(this.cursorPaths.snippets)
          : {},
      };
      return {
        isValid: issues.length === 0,
        issues,
        config,
      };
    } catch (error) {
      return {
        isValid: false,
        issues: [error instanceof Error ? error.message : 'Unknown error'],
        config: null,
      };
    }
  }
  hasNestedProperty(obj, path) {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return false;
      }
    }
    return true;
  }
  loadSnippets(snippetsDir) {
    const snippets = {};
    if (!fs_1.default.existsSync(snippetsDir)) {
      return snippets;
    }
    const files = fs_1.default.readdirSync(snippetsDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path_1.default.join(snippetsDir, file);
        try {
          const content = JSON.parse(
            fs_1.default.readFileSync(filePath, 'utf8')
          );
          snippets[file] = content;
        } catch (error) {
          console.warn(`Failed to load snippet file ${file}:`, error);
        }
      }
    }
    return snippets;
  }
  getCursorPaths() {
    return { ...this.cursorPaths };
  }
}
exports.CursorConfigSynchronizer = CursorConfigSynchronizer;
if (require.main === module) {
  const command = process.argv[2];
  const configDir = process.argv[3] || './cursor-config';
  const synchronizer = new CursorConfigSynchronizer();
  switch (command) {
    case 'export':
      synchronizer
        .exportConfig(configDir)
        .then((result) => {
          console.log('Export result:', result);
          process.exit(result.success ? 0 : 1);
        })
        .catch((error) => {
          console.error('Export failed:', error);
          process.exit(1);
        });
      break;
    case 'import':
      synchronizer
        .importConfig(configDir)
        .then((result) => {
          console.log('Import result:', result);
          process.exit(result.success ? 0 : 1);
        })
        .catch((error) => {
          console.error('Import failed:', error);
          process.exit(1);
        });
      break;
    case 'validate':
      synchronizer
        .validateConfig()
        .then((result) => {
          console.log('Validation result:', result);
          process.exit(result.isValid ? 0 : 1);
        })
        .catch((error) => {
          console.error('Validation failed:', error);
          process.exit(1);
        });
      break;
    case 'paths':
      console.log('Cursor paths:', synchronizer.getCursorPaths());
      break;
    default:
      console.log('Usage:');
      console.log('  node cursor_config_sync.js export [config-dir]');
      console.log('  node cursor_config_sync.js import [config-dir]');
      console.log('  node cursor_config_sync.js validate');
      console.log('  node cursor_config_sync.js paths');
      console.log('');
      console.log(
        'Note: workspaceStorage (open editors, layout, session) is now included in export/import.'
      );
      process.exit(1);
  }
}
//# sourceMappingURL=cursor_config_sync.js.map
