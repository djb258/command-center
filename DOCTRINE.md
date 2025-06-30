# Data Doctrine & Schema Enforcement

## Overview

This document defines the **Data Doctrine** for the Cursor Blueprint Enforcer system. All data operations must conform to these schemas and rules to ensure consistency across Neon (PostgreSQL), Firebase (Firestore), BigQuery databases, and MindPal AI agents.

## 🎯 Core Principles

1. **Schema-First Development**: All data structures are defined in Zod schemas before implementation
2. **Cross-Database Consistency**: Data must be valid for all three databases simultaneously
3. **AI-Enhanced Validation**: MindPal agents provide additional validation and suggestions
4. **Validation at Every Step**: Data is validated before any database operation
5. **Type Safety**: Full TypeScript support with runtime validation
6. **Automated Enforcement**: Pre-commit hooks and CI/CD ensure compliance

## 📊 Database Schema Requirements

### Base Blueprint Schema (Common Fields)

All blueprints must include these core fields:

```typescript
{
  id: string,           // Required, unique identifier
  name: string,         // Required, max 255 chars
  version: string,      // Required, semver format (e.g., "1.0.0")
  status: enum,         // Required: 'active' | 'inactive' | 'draft' | 'archived'
  author: string,       // Required, who created the blueprint
  timestamp: string,    // Required, ISO datetime format
  description?: string, // Optional description
  created_at?: Date,    // Optional creation timestamp
  updated_at?: Date     // Optional update timestamp
}
```

### Neon Database (PostgreSQL) Specific

**Additional Requirements:**

- `id`: Max 50 characters (PostgreSQL varchar limit)
- `metadata`: Optional JSON object
- `tags`: Optional string array
- `category`: Optional string
- `priority`: Optional enum: 'low' | 'medium' | 'high' | 'critical'

**Constraints:**

- All string fields have appropriate length limits
- Dates stored as PostgreSQL timestamps
- JSON fields for flexible metadata

### Firebase Database (Firestore) Specific

**Additional Requirements:**

- `firebase_id`: Optional auto-generated Firebase document ID
- `collection`: Defaults to 'blueprints'
- `metadata`: Optional JSON object
- `tags`: Optional string array
- `category`: Optional string
- `priority`: Optional enum: 'low' | 'medium' | 'high' | 'critical'

**Constraints:**

- Document size limits (1MB per document)
- Nested object depth limits
- Array field limitations

### BigQuery Database Specific

**Additional Requirements:**

- `dataset_id`: Optional BigQuery dataset identifier
- `table_id`: Optional BigQuery table identifier
- `partition_date`: Optional date string for partitioning
- `metadata`: Optional JSON object
- `tags`: Optional string array
- `category`: Optional string
- `priority`: Optional enum: 'low' | 'medium' | 'high' | 'critical'

**Constraints:**

- Column name limitations
- Data type restrictions
- Partitioning considerations

## 🔧 Validation Rules

### Version Format

- Must follow semantic versioning: `MAJOR.MINOR.PATCH`
- Examples: "1.0.0", "2.1.3", "0.1.0"
- Invalid: "1.0", "v1.0.0", "1.0.0-beta"

### Status Values

- `active`: Blueprint is currently in use
- `inactive`: Blueprint is not currently used
- `draft`: Blueprint is being developed
- `archived`: Blueprint is no longer maintained

### Timestamp Format

- Must be ISO 8601 datetime string
- Example: "2024-01-15T10:30:00.000Z"
- Invalid: "2024-01-15", "10:30 AM"

### Priority Levels

- `low`: Non-critical, can be addressed later
- `medium`: Standard priority
- `high`: Important, should be addressed soon
- `critical`: Urgent, requires immediate attention

## 🚨 Enforcement Mechanisms

### 1. Pre-commit Validation

- **Husky hooks** run before every commit
- **Lint-staged** validates only changed files
- **ESLint** checks code quality
- **Prettier** ensures consistent formatting
- **Jest tests** verify schema compliance

### 2. Runtime Validation

- **Zod schemas** validate all data at runtime
- **Database-specific validation** before each operation
- **Error logging** for failed validations
- **Graceful degradation** for partial failures

### 3. CI/CD Pipeline

- **Automated testing** on every pull request
- **Schema compliance checks** in deployment pipeline
- **Database migration validation**
- **Cross-database consistency verification**

## 📋 Compliance Checklist

Before any data operation, ensure:

- [ ] Data conforms to base blueprint schema
- [ ] Database-specific requirements are met
- [ ] Validation tests pass
- [ ] TypeScript types are correct
- [ ] Documentation is updated
- [ ] Pre-commit hooks pass

## 🔍 Validation Examples

### ✅ Valid Blueprint Data

```typescript
{
  id: "bp-001",
  name: "User Authentication Flow",
  version: "1.2.0",
  status: "active",
  author: "john.doe@company.com",
  timestamp: "2024-01-15T10:30:00.000Z",
  description: "Handles user login and registration",
  category: "authentication",
  priority: "high",
  tags: ["security", "user-management"],
  metadata: {
    complexity: "medium",
    estimatedTime: "2 weeks"
  }
}
```

### ❌ Invalid Blueprint Data

```typescript
{
  id: "bp-001",
  name: "", // ❌ Empty name
  version: "1.0", // ❌ Invalid semver format
  status: "invalid", // ❌ Invalid status
  author: "john.doe@company.com",
  timestamp: "2024-01-15", // ❌ Invalid datetime format
  // ❌ Missing required fields
}
```

## 🛠️ Development Workflow

1. **Define Schema**: Update Zod schemas in `src/schemas/blueprint-schemas.ts`
2. **Write Tests**: Add validation tests in `src/__tests__/validation.test.ts`
3. **Update Scripts**: Modify database scripts to use new schemas
4. **Test Locally**: Run `npm run validate` to check everything
5. **Commit**: Pre-commit hooks will validate automatically
6. **Deploy**: CI/CD pipeline ensures production compliance

## 📚 Related Files

- `src/schemas/blueprint-schemas.ts` - Zod schema definitions
- `src/__tests__/validation.test.ts` - Validation tests
- `scripts/*.ts` - Database operation scripts
- `src/index.ts` - Main BlueprintEnforcer class
- `.husky/pre-commit` - Pre-commit hooks
- `package.json` - Lint-staged configuration

## 🆘 Troubleshooting

### Common Validation Errors

1. **Invalid Version Format**
   - Ensure version follows `MAJOR.MINOR.PATCH` format
   - Don't include "v" prefix

2. **Invalid Timestamp**
   - Use ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`
   - Include timezone information

3. **Missing Required Fields**
   - Check that all required fields are present
   - Ensure field names match schema exactly

4. **Invalid Enum Values**
   - Use only allowed values for status, priority, etc.
   - Check spelling and case sensitivity

### Getting Help

1. Check the validation error messages
2. Review the schema definitions
3. Run tests: `npm test`
4. Check TypeScript errors: `npm run build`
5. Review this doctrine document

---

**Remember: All data must conform to these schemas. When in doubt, validate first!**

## 🤖 MindPal AI Agent Integration

### Overview

MindPal AI agents provide intelligent validation, analysis, and automation capabilities for blueprint processing. They complement the existing schema validation with AI-powered insights and suggestions.

### MindPal Agent Types

- **blueprint_validator**: Validates blueprints against business rules and best practices
- **data_processor**: Processes and transforms blueprint data
- **automation_agent**: Automates blueprint workflows and decision-making

### MindPal Configuration Schema

```typescript
{
  apiKey: string,           // Required MindPal API key
  baseUrl: string,          // MindPal API base URL
  timeout: number,          // Request timeout in milliseconds
  retryAttempts: number     // Number of retry attempts for failed requests
}
```

### MindPal Agent Schema

```typescript
{
  id: string,               // Unique agent identifier
  name: string,             // Human-readable agent name
  type: enum,               // Agent type (blueprint_validator, data_processor, automation_agent)
  status: enum,             // Agent status (active, inactive, training, error)
  capabilities: string[],   // Array of agent capabilities
  metadata?: object,        // Optional metadata
  created_at: Date,         // Creation timestamp
  updated_at: Date          // Last update timestamp
}
```

### MindPal Task Schema

```typescript
{
  id: string,               // Unique task identifier
  agent_id: string,         // Associated agent ID
  blueprint_id: string,     // Associated blueprint ID
  task_type: enum,          // Task type (validate, process, automate, analyze)
  payload: object,          // Task input data
  status: enum,             // Task status (pending, running, completed, failed)
  result?: object,          // Task output data
  error_message?: string,   // Error message if failed
  created_at: Date,         // Creation timestamp
  updated_at: Date,         // Last update timestamp
  completed_at?: Date       // Completion timestamp
}
```

### Integration with Existing Workflow

1. **Pre-Validation**: MindPal agents can validate blueprints before database operations
2. **Enhanced Validation**: AI agents provide suggestions and identify potential issues
3. **Automated Processing**: Agents can automatically process and transform data
4. **Quality Assurance**: Continuous monitoring and improvement of blueprint quality

### Environment Variables

```bash
MINDPAL_API_KEY=your_mindpal_api_key_here
MINDPAL_BASE_URL=https://api.mindpal.com
MINDPAL_TIMEOUT=30000
MINDPAL_RETRY_ATTEMPTS=3
```

## 🦌 DeerFlow Workflow Integration

### Overview

DeerFlow provides workflow automation and data pipeline capabilities for blueprint processing. It enables complex workflow orchestration, data transformation, and automated decision-making based on blueprint changes.

### DeerFlow Workflow Types

- **data_pipeline**: Processes and transforms blueprint data through multiple stages
- **automation**: Automates repetitive blueprint tasks and workflows
- **integration**: Connects blueprints with external systems and services
- **monitoring**: Monitors blueprint health, performance, and compliance

### DeerFlow Configuration Schema

```typescript
{
  apiKey: string,           // Required DeerFlow API key
  baseUrl: string,          // DeerFlow API base URL
  timeout: number,          // Request timeout in milliseconds
  retryAttempts: number     // Number of retry attempts for failed requests
}
```

### DeerFlow Workflow Schema

```typescript
{
  id: string,               // Unique workflow identifier
  name: string,             // Human-readable workflow name
  description?: string,     // Optional workflow description
  status: enum,             // Workflow status (active, inactive, draft, archived)
  type: enum,               // Workflow type (data_pipeline, automation, integration, monitoring)
  triggers?: string[],      // Array of trigger conditions
  steps?: object[],         // Array of workflow steps
  metadata?: object,        // Optional metadata
  created_at: Date,         // Creation timestamp
  updated_at: Date          // Last update timestamp
}
```

### DeerFlow Execution Schema

```typescript
{
  id: string,               // Unique execution identifier
  workflow_id: string,      // Associated workflow ID
  status: enum,             // Execution status (pending, running, completed, failed, cancelled)
  input_data?: object,      // Input data for the workflow
  output_data?: object,     // Output data from the workflow
  error_message?: string,   // Error message if failed
  started_at?: Date,        // Start timestamp
  completed_at?: Date,      // Completion timestamp
  created_at: Date,         // Creation timestamp
  updated_at: Date          // Last update timestamp
}
```

### DeerFlow Blueprint Integration Schema

```typescript
{
  id: string,               // Unique integration identifier
  blueprint_id: string,     // Associated blueprint ID
  workflow_id: string,      // Associated workflow ID
  integration_type: enum,   // Integration type (validation, processing, monitoring, automation)
  config: object,           // Integration configuration
  status: enum,             // Integration status (active, inactive, error)
  last_execution?: Date,    // Last execution timestamp
  created_at: Date,         // Creation timestamp
  updated_at: Date          // Last update timestamp
}
```

### Integration with Existing Workflow

1. **Workflow Orchestration**: DeerFlow manages complex blueprint processing workflows
2. **Data Transformation**: Automated data processing and transformation pipelines
3. **Event-Driven Automation**: Triggers workflows based on blueprint changes
4. **Monitoring & Alerting**: Continuous monitoring of blueprint health and performance

### Environment Variables

```bash
DEERFLOW_API_KEY=your_deerflow_api_key_here
DEERFLOW_BASE_URL=https://api.deerflow.com
DEERFLOW_TIMEOUT=30000
DEERFLOW_RETRY_ATTEMPTS=3
```

## 🚀 Render Deployment Integration

### Overview

Render provides cloud deployment and hosting capabilities for blueprint-based applications. It enables automated deployments, environment management, and service orchestration for blueprint implementations.

### Render Service Types

- **web_service**: Web applications and APIs
- **static_site**: Static websites and frontend applications
- **background_worker**: Background processing and task queues
- **cron_job**: Scheduled tasks and automated jobs

### Render Configuration Schema

```typescript
{
  apiKey: string,           // Required Render API key
  webhookUrl: string,       // Render webhook URL for deployments
  baseUrl: string,          // Render API base URL
  timeout: number,          // Request timeout in milliseconds
  retryAttempts: number     // Number of retry attempts for failed requests
}
```

### Render Service Schema

```typescript
{
  id: string,               // Unique service identifier
  name: string,             // Service name
  type: enum,               // Service type (web_service, static_site, background_worker, cron_job)
  status: enum,             // Service status (live, suspended, deleted, build_failed, deploy_failed)
  service_details?: {       // Optional service details
    url?: string,           // Service URL
    environment?: enum,     // Environment (production, preview)
    region?: string,        // Deployment region
    plan?: string           // Service plan
  },
  created_at: Date,         // Creation timestamp
  updated_at: Date          // Last update timestamp
}
```

### Render Deployment Schema

```typescript
{
  id: string,               // Unique deployment identifier
  service_id: string,       // Associated service ID
  status: enum,             // Deployment status (pending, building, live, failed, cancelled)
  commit?: {                // Optional commit information
    id?: string,            // Commit hash
    message?: string,       // Commit message
    author?: string         // Commit author
  },
  environment?: enum,       // Deployment environment (production, preview)
  created_at: Date,         // Creation timestamp
  updated_at: Date,         // Last update timestamp
  finished_at?: Date        // Completion timestamp
}
```

### Render Webhook Payload Schema

```typescript
{
  action: enum,             // Action type (deploy, build, restart, suspend)
  timestamp: string,        // ISO datetime string
  environment?: enum,       // Environment (production, preview, development)
  service_id?: string,      // Associated service ID
  deployment_id?: string,   // Associated deployment ID
  metadata?: object         // Optional metadata
}
```

### Integration with Existing Workflow

1. **Automated Deployments**: Trigger deployments based on blueprint changes
2. **Environment Management**: Manage multiple deployment environments
3. **Service Orchestration**: Coordinate deployments across multiple services
4. **Health Monitoring**: Monitor deployment health and performance

### Environment Variables

```bash
RENDER_API_KEY=your_render_api_key_here
RENDER_WEBHOOK_URL=https://your-render-service.onrender.com/webhook
RENDER_BASE_URL=https://api.render.com
RENDER_TIMEOUT=30000
RENDER_RETRY_ATTEMPTS=3
```

## 🔧 Make.com Automation Integration

### Overview

Make.com (formerly Integromat) provides powerful visual automation and integration capabilities for blueprint processing. It enables complex workflow automation, data transformation, and multi-service orchestration through its visual scenario builder.

### Make.com Scenario Types

- **webhook**: Trigger scenarios via HTTP webhooks
- **api**: Connect to external APIs and services
- **database**: Database operations and data synchronization
- **file**: File processing and management
- **email**: Email automation and notifications
- **custom**: Custom integrations and transformations

### Make.com Configuration Schema

```typescript
{
  apiKey: string,           // Required Make.com API key
  baseUrl: string,          // Make.com API base URL
  timeout: number,          // Request timeout in milliseconds
  retryAttempts: number     // Number of retry attempts for failed requests
}
```

### Make.com Scenario Schema

```typescript
{
  id: number,               // Unique scenario identifier
  name: string,             // Human-readable scenario name
  description?: string,     // Optional scenario description
  status: enum,             // Scenario status (active, inactive, draft, error)
  flow?: object[],          // Array of scenario flow steps
  connections?: object[],   // Array of scenario connections
  metadata?: object,        // Optional metadata
  created_at: Date,         // Creation timestamp
  updated_at: Date          // Last update timestamp
}
```

### Make.com Execution Schema

```typescript
{
  id: number,               // Unique execution identifier
  scenario_id: number,      // Associated scenario ID
  status: enum,             // Execution status (pending, running, completed, failed, cancelled)
  input_data?: object,      // Input data for the scenario
  output_data?: object,     // Output data from the scenario
  error_message?: string,   // Error message if failed
  started_at?: Date,        // Start timestamp
  completed_at?: Date,      // Completion timestamp
  created_at: Date,         // Creation timestamp
  updated_at: Date          // Last update timestamp
}
```

### Make.com Connection Schema

```typescript
{
  id: number,               // Unique connection identifier
  name: string,             // Connection name
  type: enum,               // Connection type (webhook, api, database, file, email, custom)
  status: enum,             // Connection status (active, inactive, error)
  config: object,           // Connection configuration
  metadata?: object,        // Optional metadata
  created_at: Date,         // Creation timestamp
  updated_at: Date          // Last update timestamp
}
```

### Make.com Blueprint Integration Schema

```typescript
{
  id: string,               // Unique integration identifier
  blueprint_id: string,     // Associated blueprint ID
  scenario_id: number,      // Associated scenario ID
  integration_type: enum,   // Integration type (validation, processing, monitoring, automation)
  config: object,           // Integration configuration
  status: enum,             // Integration status (active, inactive, error)
  last_execution?: Date,    // Last execution timestamp
  created_at: Date,         // Creation timestamp
  updated_at: Date          // Last update timestamp
}
```

### Integration with Existing Workflow

1. **Visual Automation**: Create complex workflows using Make.com's visual scenario builder
2. **Multi-Service Integration**: Connect blueprints with hundreds of external services
3. **Data Transformation**: Transform and process blueprint data through visual modules
4. **Event-Driven Automation**: Trigger scenarios based on blueprint changes and events
5. **Error Handling**: Built-in error handling and retry mechanisms

### Environment Variables

```bash
MAKE_API_KEY=your_make_api_key_here
MAKE_BASE_URL=https://www.make.com/api/v2
MAKE_TIMEOUT=30000
MAKE_RETRY_ATTEMPTS=3
```
