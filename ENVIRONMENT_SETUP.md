# 🔧 Environment Setup Guide

This guide will help you set up your development environment for the Cursor Blueprint Enforcer with comprehensive API integrations.

## 🚀 Quick Start

1. **Copy the template:**

   ```bash
   cp env.comprehensive.template .env
   ```

2. **Fill in your API keys** in the `.env` file

3. **Verify `.env` is in `.gitignore** (it should be already)

## 📋 Supported Services

### 🗄️ Database Services

- **Neon PostgreSQL** (Primary + Commands databases)
- **BigQuery** (Google Cloud analytics)
- **Firebase** (Real-time database)
- **MongoDB** (Optional document database)
- **Redis** (Caching)
- **SQLite** (Local development)

### 🤖 AI Services

- **OpenAI** (GPT models)
- **Anthropic Claude** (Claude models)
- **Google Gemini** (Gemini models)
- **Perplexity AI** (Search-enhanced AI)
- **MindPal AI** (AI workflows)
- **Abacus.AI** (ML platform)
- **Genspark** (AI search engine)
- **RTRVR.AI** (AI-powered retrieval)

### 🕷️ Web Scraping & Automation

- **Apify** (Comprehensive web scraping platform)
- **Browserless.io** (Headless browser automation)

### 🔗 Workflow Automation

- **Make.com** (formerly Integromat)
- **DeerFlow** (Workflow automation)

### ☁️ Cloud Services

- **Render.com** (Deployment platform)
- **Vercel** (Frontend deployment)
- **Netlify** (Static site hosting)
- **AWS** (Cloud infrastructure)

## 🔐 Security Configuration

The template includes security settings for:

- JWT authentication
- CORS configuration
- Password hashing (bcrypt)
- Environment-specific settings

## 🔄 Machine Synchronization

Built-in support for:

- Multi-machine development
- Cursor configuration sync
- SSH-based remote deployment
- Backup and validation

## 📧 Notifications

Optional notification channels:

- Slack webhooks
- Discord webhooks
- Email (SMTP)
- Telegram bots

## 🛠️ Development Tools

Pre-configured for:

- Node.js applications
- Docker containerization
- Debug logging
- API rate limiting

## 📝 Configuration Steps

### 1. Database Setup

```bash
# Neon PostgreSQL
NEON_DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require&channel_binding=require

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# BigQuery
BIGQUERY_PROJECT_ID=your-project-id
BIGQUERY_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 2. AI Services

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Google Gemini
GEMINI_API_KEY=AIza...

# Perplexity
PERPLEXITY_API_KEY=pplx-...
```

### 3. Web Scraping

```bash
# Apify
APIFY_API_TOKEN=apify_api_...

# Browserless
BROWSERLESS_API_KEY=your-key
BROWSERLESS_BASE_URL=https://chrome.browserless.io
```

### 4. Application Settings

```bash
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
JWT_SECRET=your-secure-secret
```

## 🔍 Validation

The system includes built-in validation for:

- API key format verification
- Database connection testing
- Service availability checks
- Configuration completeness

## 🚨 Security Notes

- **Never commit `.env` files** to version control
- **Use strong JWT secrets** in production
- **Rotate API keys regularly**
- **Use environment-specific configurations**
- **Enable proper CORS settings**

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify connection strings
   - Check network access
   - Confirm SSL settings

2. **API Authentication Failures**
   - Validate API key format
   - Check service quotas
   - Verify account status

3. **Environment Loading Issues**
   - Ensure `.env` file exists
   - Check file permissions
   - Verify dotenv loading

### Getting Help

- Check the `CURRENT_STATUS.md` for system status
- Review `DOCTRINE.md` for compliance requirements
- Consult service-specific documentation
- Check the `barton-doctrine-logs/` directory for validation reports

## 🔄 Updates

The environment template is regularly updated with:

- New service integrations
- Security improvements
- Configuration optimizations
- Best practice updates

Keep your template up to date by pulling the latest changes from the repository.

## 📋 Environment Management Commands

| Command                        | Description                                  |
| ------------------------------ | -------------------------------------------- |
| `npm run env:setup`            | Create .env file from comprehensive template |
| `npm run env:validate`         | Validate current environment configuration   |
| `npm run env:list`             | Show all available environment variables     |
| `npm run env:generate-secrets` | Generate secure random secrets               |

## 🐳 Docker Development Environment

| Command                    | Description                    |
| -------------------------- | ------------------------------ |
| `npm run docker:dev`       | Start all development services |
| `npm run docker:dev:down`  | Stop all services              |
| `npm run docker:dev:logs`  | View service logs              |
| `npm run docker:dev:clean` | Stop and remove all data       |

### 🔗 Development Service URLs

- **Adminer (PostgreSQL)**: http://localhost:8080
- **Redis Commander**: http://localhost:8081
- **Mongo Express**: http://localhost:8082
- **MailHog (Email Testing)**: http://localhost:8025

## 🗄️ Database Configuration

### Primary Database (Neon PostgreSQL)

```env
NEON_DATABASE_URL=postgresql://username:password@host:port/database
NEON_DATABASE_HOST=your-neon-host.neon.tech
NEON_DATABASE_PORT=5432
NEON_DATABASE_USER=your-username
NEON_DATABASE_PASSWORD=your-password
NEON_SSL_MODE=require
```

### Local Development Database (Docker)

```env
# When using docker:dev, use these values:
NEON_DATABASE_URL=postgresql://cursor_user:cursor_password@localhost:5432/cursor_dev
```

### Redis Configuration

```env
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password
REDIS_DATABASE=0
```

### MongoDB (Optional)

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
MONGODB_DATABASE_NAME=your-mongo-db
```

## 🔥 Firebase & Google Cloud

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Generate a service account key
3. Download the JSON file
4. Configure these variables:

```env
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Key Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
```

### BigQuery Setup

```env
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
BIGQUERY_PROJECT_ID=your-bigquery-project-id
BIGQUERY_DATASET_ID=your-dataset-id
BIGQUERY_TABLE_ID=your-table-id
```

## 🔗 API Integrations

### AI Services

```env
# OpenAI
OPENAI_API_KEY=sk-your-openai-key
OPENAI_ORGANIZATION_ID=your-org-id

# Anthropic Claude
ANTHROPIC_API_KEY=your-anthropic-key
```

### Development Tools

```env
# GitHub API
GITHUB_TOKEN=ghp_your-github-token
GITHUB_USERNAME=your-username
GITHUB_ORGANIZATION=your-org

# GitKraken
GITKRAKEN_API_TOKEN=your-gitkraken-token
```

### Workflow Automation

```env
# MindPal AI
MINDPAL_API_KEY=your-mindpal-key
MINDPAL_BASE_URL=https://api.mindpal.com/v1
MINDPAL_WORKSPACE_ID=your-workspace-id

# DeerFlow
DEERFLOW_API_KEY=your-deerflow-key
DEERFLOW_BASE_URL=https://api.deerflow.com/v1

# Make.com
MAKE_API_KEY=your-make-key
MAKE_BASE_URL=https://eu1.make.com/api/v2
MAKE_WEBHOOK_URL=https://hook.eu1.make.com/your-webhook-id
```

## ☁️ Cloud Services & Deployment

### Render.com

```env
RENDER_API_KEY=your-render-api-key
RENDER_WEBHOOK_URL=https://your-render-webhook-url.com/webhook
RENDER_SERVICE_ID=your-render-service-id
RENDER_ENVIRONMENT=production
```

### Vercel

```env
VERCEL_TOKEN=your-vercel-token
VERCEL_PROJECT_ID=your-vercel-project-id
VERCEL_ORG_ID=your-vercel-org-id
```

### AWS (Optional)

```env
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket
```

## 📧 Communication & Notifications

### Email (SMTP)

```env
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Slack Integration

```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/slack/webhook
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_CHANNEL=#development
```

### Discord Integration

```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your/discord/webhook
DISCORD_BOT_TOKEN=your-discord-bot-token
```

## 🔄 Machine Synchronization

```env
# Sync Configuration
SYNC_BACKUP_ENABLED=true
SYNC_VALIDATION_ENABLED=true
SYNC_NOTIFICATION_ENABLED=true
SYNC_SSH_KEY_PATH=~/.ssh/id_rsa
SYNC_BACKUP_RETENTION_DAYS=30

# Cursor Paths
CURSOR_SETTINGS_PATH=~/.cursor/settings.json
CURSOR_KEYBINDINGS_PATH=~/.cursor/keybindings.json
CURSOR_EXTENSIONS_PATH=~/.cursor/extensions
CURSOR_SNIPPETS_PATH=~/.cursor/snippets

# Remote Machines
REMOTE_HOST_1=your-server-1.com
REMOTE_USER_1=your-username-1
REMOTE_PROJECT_PATH_1=/home/your-username-1/projects/cursor-blueprint-enforcer
```

## 🔒 Security & Secrets

### Generate Secure Secrets

```bash
npm run env:generate-secrets
```

This generates:

- `JWT_SECRET` - For JWT token signing
- `SESSION_SECRET` - For session management
- `ENCRYPTION_KEY` - For data encryption
- `BACKUP_ENCRYPTION_KEY` - For backup encryption

### Security Best Practices

1. **Never commit .env files** - Always in .gitignore
2. **Use strong secrets** - At least 32 characters
3. **Rotate keys regularly** - Especially API keys
4. **Use different keys per environment** - dev/staging/production
5. **Secure backup storage** - Encrypt sensitive backups

## 🌍 Environment-Specific Configuration

### Development

```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
DEV_HOT_RELOAD=true
```

### Production

```env
NODE_ENV=production
PORT=8080
LOG_LEVEL=info
PROD_DATABASE_POOL_SIZE=20
PROD_CACHE_TTL=3600
```

### Staging

```env
NODE_ENV=staging
STAGING_API_URL=https://staging-api.yourapp.com
STAGING_DATABASE_URL=postgresql://staging_user:staging_pass@staging-db:5432/staging_db
```

## 🧪 Testing Configuration

```env
# Test Database
TEST_DATABASE_URL=postgresql://test_user:test_pass@localhost:5432/test_db
TEST_REDIS_URL=redis://localhost:6380

# Test API Keys (use sandbox/test keys)
TEST_STRIPE_KEY=sk_test_your_stripe_test_key
TEST_PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
```

## 📊 Monitoring & Analytics

### Application Monitoring

```env
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=development
```

### Analytics

```env
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
MIXPANEL_TOKEN=your-mixpanel-token
```

### Performance Monitoring

```env
NEW_RELIC_LICENSE_KEY=your-new-relic-key
DATADOG_API_KEY=your-datadog-key
```

## 🔧 Development Tools Configuration

### Package Managers

```env
PREFERRED_PACKAGE_MANAGER=npm
NPM_REGISTRY=https://registry.npmjs.org/
YARN_REGISTRY=https://registry.yarnpkg.com/
```

### Git Configuration

```env
GIT_DEFAULT_BRANCH=main
GIT_AUTO_PUSH=false
GIT_COMMIT_TEMPLATE=conventional
```

### Terminal & Shell

```env
SHELL_THEME=oh-my-posh
TERMINAL_FONT=CascadiaCode
TERMINAL_FONT_SIZE=14
```

## 📚 Additional Resources

- [Firebase Console](https://console.firebase.google.com)
- [Google Cloud Console](https://console.cloud.google.com)
- [Neon Console](https://console.neon.tech)
- [Render Dashboard](https://dashboard.render.com)
- [GitHub Settings](https://github.com/settings/tokens)

## 🔄 Environment File Templates

The system provides multiple environment templates:

- `env.template` - Basic template with core services
- `env.comprehensive.template` - Complete template with all services
- `.env.example` - Example values for reference

Choose the template that best fits your needs and customize accordingly.

---

💡 **Pro Tip**: Use the environment manager commands to maintain your configuration easily. The validation system will help catch issues before they become problems!
