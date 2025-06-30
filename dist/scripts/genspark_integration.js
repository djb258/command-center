#!/usr/bin/env tsx
'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.GensparkIntegration = void 0;
const axios_1 = __importDefault(require('axios'));
const dotenv_1 = require('dotenv');
const mandatory_barton_doctrine_1 = require('../src/core/mandatory-barton-doctrine');
(0, dotenv_1.config)();
const doctrine = (0, mandatory_barton_doctrine_1.START_WITH_BARTON_DOCTRINE)(
  'genspark'
);
class GensparkIntegration {
  constructor() {
    this.config = {
      apiKey: process.env.GENSPARK_API_KEY || '',
      baseUrl: process.env.GENSPARK_BASE_URL || 'https://api.genspark.ai/v1',
      projectId: process.env.GENSPARK_PROJECT_ID,
    };
    if (!this.config.apiKey) {
      throw new Error(
        'GENSPARK_API_KEY is required. Please set it in your .env file.'
      );
    }
    this.client = axios_1.default.create({
      baseURL: this.config.baseUrl,
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }
  log(message, color = 'blue') {
    const colors = {
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      red: '\x1b[31m',
      blue: '\x1b[34m',
      cyan: '\x1b[36m',
    };
    console.log(`${colors[color]}${message}\x1b[0m`);
  }
  async setup() {
    this.log('🔍 Setting up Genspark AI Integration', 'blue');
    this.log('====================================', 'blue');
    try {
      await this.testConnection();
      this.log('✅ Genspark AI integration setup complete!', 'green');
      this.log('🚀 Ready to perform AI-powered searches!', 'cyan');
    } catch (error) {
      this.log('❌ Setup failed:', 'red');
      this.log(error.message, 'red');
      throw error;
    }
  }
  async testConnection() {
    try {
      this.log('🔍 Testing Genspark API connection...', 'blue');
      const response = await this.client.get('/health');
      if (response.status === 200) {
        this.log('✅ API connection successful!', 'green');
        return true;
      } else {
        throw new Error(`API returned status ${response.status}`);
      }
    } catch (error) {
      this.log('❌ API connection failed:', 'red');
      if (error.response?.status === 401) {
        this.log('Invalid API key. Please check your GENSPARK_API_KEY', 'red');
      } else {
        this.log(error.message, 'red');
      }
      return false;
    }
  }
  async validateConfiguration() {
    this.log('🔍 Validating Genspark configuration...', 'blue');
    const issues = [];
    if (!this.config.apiKey) {
      issues.push('GENSPARK_API_KEY is missing');
    }
    if (!this.config.baseUrl) {
      issues.push('GENSPARK_BASE_URL is missing');
    }
    if (issues.length > 0) {
      this.log('❌ Configuration issues found:', 'red');
      issues.forEach((issue) => this.log(`  - ${issue}`, 'red'));
      this.log('\n📝 Required environment variables:', 'yellow');
      this.log('GENSPARK_API_KEY=your-api-key', 'yellow');
      this.log('GENSPARK_BASE_URL=https://api.genspark.ai/v1', 'yellow');
      this.log('GENSPARK_PROJECT_ID=your-project-id (optional)', 'yellow');
      throw new Error('Configuration validation failed');
    }
    this.log('✅ Configuration is valid!', 'green');
  }
}
exports.GensparkIntegration = GensparkIntegration;
async function main() {
  const args = process.argv.slice(2);
  try {
    const genspark = new GensparkIntegration();
    switch (args[0]) {
      case 'setup':
        await genspark.setup();
        break;
      case 'test':
        await genspark.testConnection();
        break;
      case 'validate':
        await genspark.validateConfiguration();
        break;
      default:
        console.log(`
🔍 Genspark AI Integration

Usage:
  npm run genspark:setup     # Initial setup and connection test
  npm run genspark:test      # Test API connection
  npm run genspark:validate  # Validate configuration

Examples:
  npm run genspark:setup
        `);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}
if (require.main === module) {
  main();
}
//# sourceMappingURL=genspark_integration.js.map
