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
exports.MandatoryComplianceEnforcer = void 0;
const fs = __importStar(require('fs'));
const path = __importStar(require('path'));
class MandatoryComplianceEnforcer {
  constructor() {
    this.scriptsDir = path.join(process.cwd(), 'scripts');
    this.nonCompliantTools = [];
    this.fixedTools = [];
  }
  async enforceCompliance() {
    console.log('🔒 ENFORCING MANDATORY BARTON DOCTRINE COMPLIANCE');
    console.log('📋 NO TOOL WILL BE ALLOWED TO BYPASS THE DOCTRINE');
    console.log('⚡ AUTOMATICALLY FIXING ALL NON-COMPLIANT TOOLS');
    const tools = this.getAllIntegrationTools();
    console.log(`\n🔍 Found ${tools.length} tools to enforce compliance on:`);
    tools.forEach((tool) => console.log(`   - ${path.basename(tool)}`));
    for (const tool of tools) {
      await this.enforceToolCompliance(tool);
    }
    this.generateComplianceReport();
    if (this.nonCompliantTools.length > 0) {
      console.log(
        `\n🚨 CRITICAL: ${this.nonCompliantTools.length} tools were NON-COMPLIANT`
      );
      console.log(
        `✅ FIXED: ${this.fixedTools.length} tools automatically fixed`
      );
    } else {
      console.log('\n✅ ALL TOOLS ARE BARTON DOCTRINE COMPLIANT');
    }
    console.log('\n🔒 MANDATORY COMPLIANCE ENFORCEMENT COMPLETE');
  }
  getAllIntegrationTools() {
    if (!fs.existsSync(this.scriptsDir)) {
      return [];
    }
    return fs
      .readdirSync(this.scriptsDir)
      .filter((file) => file.endsWith('_integration.ts'))
      .map((file) => path.join(this.scriptsDir, file));
  }
  async enforceToolCompliance(toolPath) {
    const toolName = path.basename(toolPath, '.ts');
    console.log(`\n🔧 Enforcing compliance on: ${toolName}`);
    if (!fs.existsSync(toolPath)) {
      console.log(`   ⚠️  Tool file not found: ${toolPath}`);
      return;
    }
    let content = fs.readFileSync(toolPath, 'utf8');
    let modified = false;
    if (!content.includes('START_WITH_BARTON_DOCTRINE')) {
      console.log(`   ❌ Missing Barton Doctrine import - FIXING`);
      content = this.addBartonDoctrineImport(content);
      modified = true;
      this.nonCompliantTools.push(toolName);
    }
    if (!content.includes('START_WITH_BARTON_DOCTRINE(')) {
      console.log(`   ❌ Missing Barton Doctrine initialization - FIXING`);
      content = this.addBartonDoctrineInitialization(content, toolName);
      modified = true;
    }
    if (modified) {
      const backupPath = `${toolPath}.backup.${Date.now()}`;
      fs.writeFileSync(backupPath, fs.readFileSync(toolPath, 'utf8'));
      fs.writeFileSync(toolPath, content);
      this.fixedTools.push(toolName);
      console.log(`   ✅ Tool fixed and made Barton Doctrine compliant`);
      console.log(`   📦 Backup saved: ${backupPath}`);
    } else {
      console.log(`   ✅ Tool is already Barton Doctrine compliant`);
    }
  }
  addBartonDoctrineImport(content) {
    const importStatement = `import { START_WITH_BARTON_DOCTRINE } from '../src/core/mandatory-barton-doctrine';\n`;
    const lines = content.split('\n');
    let lastImportIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (
        lines[i].trim().startsWith('import ') ||
        (lines[i].trim().startsWith('const ') && lines[i].includes('require('))
      ) {
        lastImportIndex = i;
      }
    }
    if (lastImportIndex >= 0) {
      lines.splice(
        lastImportIndex + 1,
        0,
        '',
        '// 🔒 MANDATORY: Barton Doctrine enforcement',
        importStatement
      );
    } else {
      lines.unshift(
        '// 🔒 MANDATORY: Barton Doctrine enforcement',
        importStatement,
        ''
      );
    }
    return lines.join('\n');
  }
  addBartonDoctrineInitialization(content, toolName) {
    const toolBaseName = path.basename(toolName, '_integration');
    const initStatement = `
// 🔒 MANDATORY: Initialize Barton Doctrine (CANNOT BE SKIPPED)
const doctrine = START_WITH_BARTON_DOCTRINE('${toolBaseName}');
`;
    const lines = content.split('\n');
    let insertIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (
        lines[i].trim().startsWith('export class') ||
        lines[i].trim().startsWith('class ') ||
        lines[i].trim().startsWith('async function') ||
        lines[i].trim().startsWith('function ')
      ) {
        insertIndex = i;
        break;
      }
    }
    if (insertIndex >= 0) {
      lines.splice(insertIndex, 0, initStatement);
    } else {
      lines.push(initStatement);
    }
    return lines.join('\n');
  }
  generateComplianceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      enforcement_summary: {
        total_tools_checked: this.getAllIntegrationTools().length,
        non_compliant_tools: this.nonCompliantTools.length,
        fixed_tools: this.fixedTools.length,
        compliance_rate:
          this.fixedTools.length > 0
            ? (
                ((this.getAllIntegrationTools().length -
                  this.nonCompliantTools.length) /
                  this.getAllIntegrationTools().length) *
                100
              ).toFixed(2) + '%'
            : '100%',
      },
      non_compliant_tools: this.nonCompliantTools,
      fixed_tools: this.fixedTools,
      enforcement_actions: [
        'Added mandatory Barton Doctrine imports',
        'Added mandatory initialization calls',
        'Created backup files for all modified tools',
      ],
      next_steps: [
        'Run npm run validate:barton-doctrine to verify compliance',
        'Test all modified tools to ensure functionality',
        'All new tools must use npm run generate:tool',
      ],
    };
    const reportsDir = path.join(process.cwd(), 'barton-doctrine-logs');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(
      reportsDir,
      `enforcement-report-${timestamp}.json`
    );
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📊 Enforcement report saved: ${reportFile}`);
    console.log(
      `📈 Compliance rate: ${report.enforcement_summary.compliance_rate}`
    );
  }
}
exports.MandatoryComplianceEnforcer = MandatoryComplianceEnforcer;
async function main() {
  const args = process.argv.slice(2);
  const enforcer = new MandatoryComplianceEnforcer();
  switch (args[0]) {
    case 'check':
      console.log('🔍 Checking compliance status...');
      break;
    default:
      await enforcer.enforceCompliance();
  }
}
if (require.main === module) {
  main();
}
//# sourceMappingURL=enforce_mandatory_compliance.js.map
