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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.BrowserlessIntegration = void 0;
const axios_1 = __importDefault(require('axios'));
const fs = __importStar(require('fs'));
const path = __importStar(require('path'));
const dotenv_1 = require('dotenv');
const mandatory_barton_doctrine_1 = require('../src/core/mandatory-barton-doctrine');
(0, dotenv_1.config)();
const doctrine = (0, mandatory_barton_doctrine_1.START_WITH_BARTON_DOCTRINE)(
  'browserless'
);
class BrowserlessIntegration {
  constructor() {
    this.config = {
      apiKey: process.env.BROWSERLESS_API_KEY || '',
      baseUrl: process.env.BROWSERLESS_BASE_URL || 'https://api.browserless.ai',
      endpoint: process.env.BROWSERLESS_ENDPOINT,
      token: process.env.BROWSERLESS_TOKEN,
    };
    if (!this.config.apiKey && !this.config.token) {
      throw new Error(
        'BROWSERLESS_API_KEY or BROWSERLESS_TOKEN is required. Please set it in your .env file.'
      );
    }
    this.client = axios_1.default.create({
      baseURL: this.config.baseUrl,
      headers: {
        Authorization: `Bearer ${this.config.apiKey || this.config.token}`,
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
      magenta: '\x1b[35m',
    };
    console.log(`${colors[color]}${message}\x1b[0m`);
  }
  async setup() {
    this.log('🌐 Setting up Browserless.ai Integration', 'blue');
    this.log('========================================', 'blue');
    try {
      await this.testConnection();
      const account = await this.getAccountInfo();
      if (account) {
        this.log(`✅ Connected as: ${account.email || account.name}`, 'green');
        this.log(`💰 Credits: ${account.credits || 0}`, 'blue');
        this.log(`⏱️ Usage: ${account.usage || 0} minutes this month`, 'blue');
      }
      this.log('✅ Browserless.ai integration setup complete!', 'green');
      this.log('🚀 Ready for headless browser automation!', 'cyan');
    } catch (error) {
      this.log('❌ Setup failed:', 'red');
      this.log(error.message, 'red');
      throw error;
    }
  }
  async testConnection() {
    try {
      this.log('🔍 Testing Browserless.ai API connection...', 'blue');
      const response = await this.client.get('/account');
      if (response.status === 200) {
        this.log('✅ API connection successful!', 'green');
        return true;
      } else {
        throw new Error(`API returned status ${response.status}`);
      }
    } catch (error) {
      try {
        const healthResponse = await this.client.get('/health');
        if (healthResponse.status === 200) {
          this.log('✅ API connection successful!', 'green');
          return true;
        }
      } catch (healthError) {}
      this.log('❌ API connection failed:', 'red');
      if (error.response?.status === 401) {
        this.log(
          'Invalid API key/token. Please check your BROWSERLESS_API_KEY or BROWSERLESS_TOKEN',
          'red'
        );
      } else if (error.response?.status === 403) {
        this.log(
          'Access forbidden. Please check your API key permissions',
          'red'
        );
      } else {
        this.log(error.message, 'red');
      }
      return false;
    }
  }
  async getAccountInfo() {
    try {
      const response = await this.client.get('/account');
      return response.data;
    } catch (error) {
      this.log('❌ Failed to get account info:', 'red');
      this.log(error.message, 'red');
      return null;
    }
  }
  async takeScreenshot(url, options = {}) {
    try {
      this.log(`📸 Taking screenshot of: ${url}`, 'blue');
      const screenshotParams = {
        url: url,
        type: options.type || 'png',
        fullPage: options.fullPage !== false,
        quality: options.quality || 90,
        width: options.width || 1920,
        height: options.height || 1080,
        ...options,
      };
      const response = await this.client.post('/screenshot', screenshotParams, {
        responseType: 'arraybuffer',
      });
      if (response.status === 200) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `screenshot-${timestamp}.${screenshotParams.type}`;
        const outputDir = path.join(__dirname, '../logs');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, response.data);
        this.log(`✅ Screenshot saved: ${filename}`, 'green');
        return { filename, filepath, size: response.data.length };
      }
    } catch (error) {
      this.log('❌ Screenshot failed:', 'red');
      this.log(error.message, 'red');
      throw error;
    }
  }
  async generatePDF(url, options = {}) {
    try {
      this.log(`📄 Generating PDF of: ${url}`, 'blue');
      const pdfParams = {
        url: url,
        format: options.format || 'A4',
        landscape: options.landscape || false,
        margin: options.margin || {
          top: '1cm',
          bottom: '1cm',
          left: '1cm',
          right: '1cm',
        },
        printBackground: options.printBackground !== false,
        ...options,
      };
      const response = await this.client.post('/pdf', pdfParams, {
        responseType: 'arraybuffer',
      });
      if (response.status === 200) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `pdf-${timestamp}.pdf`;
        const outputDir = path.join(__dirname, '../logs');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, response.data);
        this.log(`✅ PDF saved: ${filename}`, 'green');
        return { filename, filepath, size: response.data.length };
      }
    } catch (error) {
      this.log('❌ PDF generation failed:', 'red');
      this.log(error.message, 'red');
      throw error;
    }
  }
  async scrapeContent(url, selector) {
    try {
      this.log(`🕷️ Scraping content from: ${url}`, 'blue');
      const scrapeParams = {
        url: url,
        elements: selector ? [{ selector: selector }] : [{ selector: 'body' }],
        waitFor: 2000,
      };
      const response = await this.client.post('/scrape', scrapeParams);
      const results = response.data;
      if (results && results.data) {
        this.log(`✅ Scraped ${results.data.length} element(s)`, 'green');
        results.data.forEach((item, index) => {
          this.log(
            `\n${index + 1}. ${item.text?.substring(0, 100)}...`,
            'cyan'
          );
        });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `scrape-${timestamp}.json`;
        const outputDir = path.join(__dirname, '../logs');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
        this.log(`💾 Scraped data saved: ${filename}`, 'green');
      }
      return results;
    } catch (error) {
      this.log('❌ Scraping failed:', 'red');
      this.log(error.message, 'red');
      throw error;
    }
  }
  async runFunction(code, url) {
    try {
      this.log('🚀 Running custom browser function...', 'blue');
      const functionParams = {
        code: code,
        context: url ? { url: url } : {},
      };
      const response = await this.client.post('/function', functionParams);
      const results = response.data;
      this.log('✅ Function executed successfully!', 'green');
      this.log(`Result: ${JSON.stringify(results, null, 2)}`, 'cyan');
      return results;
    } catch (error) {
      this.log('❌ Function execution failed:', 'red');
      this.log(error.message, 'red');
      throw error;
    }
  }
  async validateConfiguration() {
    this.log('🔍 Validating Browserless.ai configuration...', 'blue');
    const issues = [];
    if (!this.config.apiKey && !this.config.token) {
      issues.push('BROWSERLESS_API_KEY or BROWSERLESS_TOKEN is missing');
    }
    if (!this.config.baseUrl) {
      issues.push('BROWSERLESS_BASE_URL is missing');
    }
    if (issues.length > 0) {
      this.log('❌ Configuration issues found:', 'red');
      issues.forEach((issue) => this.log(`  - ${issue}`, 'red'));
      this.log('\n📝 Required environment variables:', 'yellow');
      this.log(
        'BROWSERLESS_API_KEY=your-api-key (or BROWSERLESS_TOKEN)',
        'yellow'
      );
      this.log('BROWSERLESS_BASE_URL=https://api.browserless.ai', 'yellow');
      this.log('BROWSERLESS_ENDPOINT=your-endpoint (optional)', 'yellow');
      throw new Error('Configuration validation failed');
    }
    this.log('✅ Configuration is valid!', 'green');
  }
}
exports.BrowserlessIntegration = BrowserlessIntegration;
async function main() {
  const args = process.argv.slice(2);
  try {
    const browserless = new BrowserlessIntegration();
    switch (args[0]) {
      case 'setup':
        await browserless.setup();
        break;
      case 'test':
        await browserless.testConnection();
        break;
      case 'account':
        const account = await browserless.getAccountInfo();
        console.log('Account Info:', account);
        break;
      case 'screenshot':
        if (!args[1]) {
          console.log(
            'Usage: npm run browserless:screenshot <url> [width] [height]'
          );
          return;
        }
        const width = args[2] ? parseInt(args[2]) : 1920;
        const height = args[3] ? parseInt(args[3]) : 1080;
        await browserless.takeScreenshot(args[1], { width, height });
        break;
      case 'pdf':
        if (!args[1]) {
          console.log('Usage: npm run browserless:pdf <url> [format]');
          return;
        }
        const format = args[2] || 'A4';
        await browserless.generatePDF(args[1], { format });
        break;
      case 'scrape':
        if (!args[1]) {
          console.log('Usage: npm run browserless:scrape <url> [selector]');
          return;
        }
        await browserless.scrapeContent(args[1], args[2]);
        break;
      case 'function':
        if (!args[1]) {
          console.log(
            'Usage: npm run browserless:function <javascript-code> [url]'
          );
          return;
        }
        await browserless.runFunction(args[1], args[2]);
        break;
      case 'validate':
        await browserless.validateConfiguration();
        break;
      default:
        console.log(`
🌐 Browserless.ai Integration

Usage:
  npm run browserless:setup                    # Initial setup and connection test
  npm run browserless:test                     # Test API connection
  npm run browserless:account                  # Get account information
  npm run browserless:screenshot <url> [w] [h] # Take screenshot
  npm run browserless:pdf <url> [format]      # Generate PDF
  npm run browserless:scrape <url> [selector] # Scrape content
  npm run browserless:function <code> [url]   # Run custom function
  npm run browserless:validate                # Validate configuration

Examples:
  npm run browserless:setup
  npm run browserless:screenshot "https://example.com" 1920 1080
  npm run browserless:pdf "https://example.com" A4
  npm run browserless:scrape "https://example.com" "h1"
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
//# sourceMappingURL=browserless_integration.js.map
