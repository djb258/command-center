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
exports.BartonDoctrineValidator = void 0;
const fs = __importStar(require('fs'));
const path = __importStar(require('path'));
const barton_doctrine_enforcer_1 = require('../src/schemas/barton-doctrine-enforcer');
class BartonDoctrineValidator {
  constructor() {
    this.toolsToValidate = [
      'mindpal_integration.ts',
      'deerflow_integration.ts',
      'render_integration.ts',
      'make_integration.ts',
      'firebase_push.ts',
      'bigquery_ingest.ts',
      'neon_sync.ts',
      'rtrvr_integration.ts',
      'browserless_integration.ts',
      'apify_integration.ts',
      'genspark_integration.ts',
    ];
    console.log('🔒 Barton Doctrine Validator');
    console.log('============================');
    console.log('CRITICAL: Ensuring SPVPET/STAMPED/STACKED compliance');
  }
  async validateAll() {
    console.log('\n🔍 Starting comprehensive Barton Doctrine validation...\n');
    let totalViolations = 0;
    const results = {};
    console.log('📋 Validating tool integrations...');
    const toolResults = await this.validateToolIntegrations();
    results.tools = toolResults;
    totalViolations += toolResults.violations;
    console.log('\n📋 Validating schema templates...');
    const schemaResults = await this.validateSchemaTemplates();
    results.schemas = schemaResults;
    totalViolations += schemaResults.violations;
    await this.generateValidationReport(results, totalViolations);
    if (totalViolations > 0) {
      console.error(
        `\n🚨 CRITICAL: ${totalViolations} Barton Doctrine violations detected!`
      );
      console.error('   System integrity is compromised!');
      process.exit(1);
    } else {
      console.log(
        '\n✅ All validations passed! Barton Doctrine compliance verified.'
      );
    }
  }
  async validateToolIntegrations() {
    const results = { checked: 0, violations: 0, details: [] };
    for (const tool of this.toolsToValidate) {
      const toolPath = path.join(process.cwd(), 'scripts', tool);
      if (!fs.existsSync(toolPath)) {
        console.warn(`⚠️  Tool not found: ${tool}`);
        continue;
      }
      console.log(`   Checking ${tool}...`);
      results.checked++;
      try {
        const content = fs.readFileSync(toolPath, 'utf8');
        const violations = this.analyzeToolForViolations(tool, content);
        if (violations.length > 0) {
          results.violations += violations.length;
          results.details.push({ tool, violations });
          violations.forEach((violation) => {
            console.error(`     ❌ ${violation}`);
          });
        } else {
          console.log(`     ✅ ${tool} - compliant`);
        }
      } catch (error) {
        console.error(`     ❌ Error analyzing ${tool}: ${error}`);
        results.violations++;
      }
    }
    return results;
  }
  analyzeToolForViolations(toolName, content) {
    const violations = [];
    if (!content.includes('barton-doctrine')) {
      violations.push('Missing Barton Doctrine import');
    }
    if (
      content.includes('firebase') ||
      content.includes('neon') ||
      content.includes('bigquery')
    ) {
      if (
        !content.includes('BartonDoctrine.validate') &&
        !content.includes('BartonDoctrine.formatFor')
      ) {
        violations.push(
          'Database operations without Barton Doctrine validation'
        );
      }
    }
    return violations;
  }
  async validateSchemaTemplates() {
    const results = { checked: 0, violations: 0, details: [] };
    const templates = [
      'schemas/spvpet_template.json',
      'schemas/stacked_template.json',
      'schemas/stamped_template.sql',
      'firebase/agent_task.template.json',
      'firebase/human_firebreak_queue.template.json',
    ];
    for (const template of templates) {
      const templatePath = path.join(process.cwd(), template);
      if (!fs.existsSync(templatePath)) {
        results.violations++;
        results.details.push({
          template,
          error: 'Template file missing',
        });
        console.error(`   ❌ Missing template: ${template}`);
        continue;
      }
      console.log(`   Checking ${template}...`);
      results.checked++;
      console.log(`     ✅ Template exists`);
    }
    return results;
  }
  async generateValidationReport(results, totalViolations) {
    const report = {
      timestamp: new Date().toISOString(),
      validation_summary: {
        total_violations: totalViolations,
        tools_checked: results.tools.checked,
        schemas_checked: results.schemas.checked,
        compliance_status:
          totalViolations === 0 ? 'COMPLIANT' : 'VIOLATIONS_DETECTED',
      },
      detailed_results: results,
    };
    const reportsDir = path.join(process.cwd(), 'barton-doctrine-logs');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(
      reportsDir,
      `validation-report-${timestamp}.json`
    );
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(
      `\n📊 Validation report saved: ${path.relative(process.cwd(), reportFile)}`
    );
  }
  enableStrictMode() {
    console.log('⚡ Enabling Barton Doctrine strict mode...');
    barton_doctrine_enforcer_1.BartonDoctrine.setStrict(true);
    console.log('✅ Strict mode enabled - violations will now throw errors');
  }
  generateReport() {
    console.log('📊 Generating Barton Doctrine violation report...');
    const violations =
      barton_doctrine_enforcer_1.BartonDoctrine.getViolations();
    console.log(`\nViolation Summary:`);
    console.log(`  Total violations: ${violations.total}`);
    console.log(`  By tool:`);
    for (const [tool, count] of Object.entries(violations.byTool)) {
      console.log(`    ${tool}: ${count} violation${count > 1 ? 's' : ''}`);
    }
  }
}
exports.BartonDoctrineValidator = BartonDoctrineValidator;
async function main() {
  const args = process.argv.slice(2);
  const validator = new BartonDoctrineValidator();
  try {
    switch (args[0]) {
      case 'enforce':
        barton_doctrine_enforcer_1.BartonDoctrine.setEnabled(true);
        console.log('🔒 Barton Doctrine enforcement enabled globally');
        break;
      case 'strict':
        validator.enableStrictMode();
        break;
      case 'report':
        validator.generateReport();
        break;
      case 'status':
        const violations =
          barton_doctrine_enforcer_1.BartonDoctrine.getViolations();
        console.log(
          `Barton Doctrine Status: ${violations.total === 0 ? '✅ COMPLIANT' : '🚨 VIOLATIONS DETECTED'}`
        );
        console.log(`Total violations: ${violations.total}`);
        break;
      default:
        await validator.validateAll();
    }
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}
if (require.main === module) {
  main();
}
//# sourceMappingURL=barton_doctrine_validator.js.map
