#!/usr/bin/env tsx
'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.ApifyIntegration = void 0;
const axios_1 = __importDefault(require('axios'));
const dotenv_1 = require('dotenv');
const mandatory_barton_doctrine_1 = require('../src/core/mandatory-barton-doctrine');
(0, dotenv_1.config)();
const doctrine = (0, mandatory_barton_doctrine_1.START_WITH_BARTON_DOCTRINE)(
  'apify'
);
class ApifyIntegration {
  constructor() {
    this.config = {
      apiToken: process.env.APIFY_API_TOKEN || '',
      baseUrl: process.env.APIFY_BASE_URL || 'https://api.apify.com/v2',
      userId: process.env.APIFY_USER_ID,
      defaultDatasetId: process.env.APIFY_DEFAULT_DATASET_ID,
    };
    if (!this.config.apiToken) {
      throw new Error(
        'APIFY_API_TOKEN is required. Please set it in your .env file.'
      );
    }
    this.client = axios_1.default.create({
      baseURL: this.config.baseUrl,
      headers: {
        Authorization: `Bearer ${this.config.apiToken}`,
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
    };
    console.log(`${colors[color]}${message}\x1b[0m`);
  }
  async setup() {
    this.log('🕷️ Setting up Apify Integration', 'blue');
    this.log('===============================', 'blue');
    try {
      await this.testConnection();
      const user = await this.getUserInfo();
      if (user) {
        this.log(`✅ Connected as: ${user.username}`, 'green');
        this.log(
          `💰 Credits: ${user.usageStats?.monthlyUsageUsd || 0} USD`,
          'blue'
        );
      }
      const actors = await this.listActors();
      this.log(`🎭 Found ${actors.length} actor(s) in your account`, 'green');
      this.log('✅ Apify integration setup complete!', 'green');
    } catch (error) {
      this.log('❌ Setup failed:', 'red');
      this.log(error.message, 'red');
      throw error;
    }
  }
  async testConnection() {
    try {
      this.log('🔍 Testing Apify API connection...', 'blue');
      const response = await this.client.get('/users/me');
      if (response.status === 200) {
        this.log('✅ API connection successful!', 'green');
        return true;
      } else {
        throw new Error(`API returned status ${response.status}`);
      }
    } catch (error) {
      this.log('❌ API connection failed:', 'red');
      if (error.response?.status === 401) {
        this.log('Invalid API token. Please check your APIFY_API_TOKEN', 'red');
      } else {
        this.log(error.message, 'red');
      }
      return false;
    }
  }
  async getUserInfo() {
    try {
      const response = await this.client.get('/users/me');
      return response.data.data;
    } catch (error) {
      this.log('❌ Failed to get user info:', 'red');
      this.log(error.message, 'red');
      return null;
    }
  }
  async listActors() {
    try {
      this.log('🎭 Fetching actors...', 'blue');
      const response = await this.client.get('/acts');
      return response.data.data.items || [];
    } catch (error) {
      this.log('❌ Failed to fetch actors:', 'red');
      this.log(error.message, 'red');
      return [];
    }
  }
  async runActor(actorId, input) {
    try {
      this.log(`🚀 Running actor ${actorId}...`, 'blue');
      const response = await this.client.post(`/acts/${actorId}/runs`, input);
      const run = response.data.data;
      this.log(`✅ Actor run started: ${run.id}`, 'green');
      this.log(`Status: ${run.status}`, 'blue');
      return run;
    } catch (error) {
      this.log('❌ Failed to run actor:', 'red');
      this.log(error.message, 'red');
      throw error;
    }
  }
  async getRunStatus(runId) {
    try {
      const response = await this.client.get(`/actor-runs/${runId}`);
      return response.data.data;
    } catch (error) {
      this.log('❌ Failed to get run status:', 'red');
      this.log(error.message, 'red');
      throw error;
    }
  }
  async getDataset(datasetId) {
    try {
      this.log(`📊 Fetching dataset ${datasetId}...`, 'blue');
      const response = await this.client.get(`/datasets/${datasetId}/items`);
      return response.data || [];
    } catch (error) {
      this.log('❌ Failed to fetch dataset:', 'red');
      this.log(error.message, 'red');
      return [];
    }
  }
  async validateConfiguration() {
    this.log('🔍 Validating Apify configuration...', 'blue');
    const issues = [];
    if (!this.config.apiToken) {
      issues.push('APIFY_API_TOKEN is missing');
    }
    if (!this.config.baseUrl) {
      issues.push('APIFY_BASE_URL is missing');
    }
    if (issues.length > 0) {
      this.log('❌ Configuration issues found:', 'red');
      issues.forEach((issue) => this.log(`  - ${issue}`, 'red'));
      this.log('\n📝 Required environment variables:', 'yellow');
      this.log('APIFY_API_TOKEN=your-api-token', 'yellow');
      this.log('APIFY_BASE_URL=https://api.apify.com/v2', 'yellow');
      this.log('APIFY_USER_ID=your-user-id (optional)', 'yellow');
      this.log('APIFY_DEFAULT_DATASET_ID=your-dataset-id (optional)', 'yellow');
      throw new Error('Configuration validation failed');
    }
    this.log('✅ Configuration is valid!', 'green');
  }
}
exports.ApifyIntegration = ApifyIntegration;
async function main() {
  const args = process.argv.slice(2);
  try {
    const apify = new ApifyIntegration();
    switch (args[0]) {
      case 'setup':
        await apify.setup();
        break;
      case 'test':
        await apify.testConnection();
        break;
      case 'user':
        const user = await apify.getUserInfo();
        console.log('User Info:', user);
        break;
      case 'actors':
        const actors = await apify.listActors();
        console.log('Actors:', actors);
        break;
      case 'run':
        if (!args[1]) {
          console.log('Usage: npm run apify:run <actor-id> [input-json]');
          return;
        }
        const input = args[2] ? JSON.parse(args[2]) : {};
        const run = await apify.runActor(args[1], input);
        console.log('Run:', run);
        break;
      case 'status':
        if (!args[1]) {
          console.log('Usage: npm run apify:status <run-id>');
          return;
        }
        const status = await apify.getRunStatus(args[1]);
        console.log('Status:', status);
        break;
      case 'dataset':
        if (!args[1]) {
          console.log('Usage: npm run apify:dataset <dataset-id>');
          return;
        }
        const data = await apify.getDataset(args[1]);
        console.log('Dataset:', data);
        break;
      case 'validate':
        await apify.validateConfiguration();
        break;
      default:
        console.log(`
🕷️ Apify Integration

Usage:
  npm run apify:setup              # Initial setup and connection test
  npm run apify:test               # Test API connection
  npm run apify:user               # Get user information
  npm run apify:actors             # List available actors
  npm run apify:run <actor-id> [input] # Run an actor
  npm run apify:status <run-id>    # Get run status
  npm run apify:dataset <dataset-id> # Get dataset data
  npm run apify:validate           # Validate configuration

Examples:
  npm run apify:setup
  npm run apify:run web-scraper '{"url": "https://example.com"}'
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
//# sourceMappingURL=apify_integration.js.map
