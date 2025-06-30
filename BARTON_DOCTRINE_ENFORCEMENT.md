# Barton Doctrine Enforcement System

## 🔒 CRITICAL SYSTEM COMPONENT

The Barton Doctrine Enforcement System ensures **ALL** payloads across **ALL** tools comply with the SPVPET/STAMPED/STACKED schema. This is the **backbone of the entire system** - NO EXCEPTIONS.

## 📋 Schema Overview

### SPVPET → Firebase (Working Memory)
- **S**ource ID - Identifies where the record came from (agent, UI, source system)
- **P**rocess ID - Tied to the blueprint or workflow logic being executed
- **V**alidated - Boolean or enum to track whether the data passed validation
- **P**romoted To - Target storage (e.g. Neon table, BigQuery table, etc.)
- **E**xecution Signature - Unique hash of the agent, blueprint, and schema version used
- **T**imestamp Last Touched - Last update or mutation timestamp — vital for TTL/retention control

### STAMPED → Neon (Permanent Vault)
- **S**ource ID - Identifies where the record came from
- **T**ask ID - Tied to the blueprint or workflow logic being executed
- **A**pproved - Track whether the data passed validation
- **M**igrated To - Target storage reference
- **P**rocess Signature - Unique hash of agent, blueprint, and schema version
- **E**vent Timestamp - Last update or mutation timestamp
- **D**ata Payload - The actual data being stored

### STACKED → BigQuery (Foreign Silo/Long-term Analytics)
- **S**ource ID - Identifies where the record came from
- **T**ask ID - Tied to the blueprint or workflow logic being executed
- **A**nalytics Approved - Track whether the data passed validation for analytics
- **C**onsolidated From - Reference to source storage
- **K**nowledge Signature - Unique hash of agent, blueprint, and schema version
- **E**vent Timestamp - Last update or mutation timestamp
- **D**ata Payload - The actual data being stored

## 🚀 Quick Start

### 1. Import the Enforcement System

```typescript
import { withBartonDoctrine, DatabaseOperations } from '../middleware/barton-doctrine-middleware';
import { BartonDoctrine } from '../schemas/barton-doctrine-enforcer';
```

### 2. Create Compliant Payloads

```typescript
const middleware = withBartonDoctrine('your_tool_name');

const payload = middleware.createPayload(
  'your_source_id',
  'your_process_id',
  { your: 'data' },
  {
    agent_id: 'your_agent',
    blueprint_id: 'your_blueprint',
    schema_version: '1.0.0'
  }
);
```

### 3. Database Operations with Automatic Enforcement

```typescript
// Firebase (SPVPET)
const firebaseOps = DatabaseOperations.firebase('your_tool');
const firebasePayload = firebaseOps.save(payload);

// Neon (STAMPED)
const neonOps = DatabaseOperations.neon('your_tool');
const neonPayload = neonOps.insert('table_name', payload);

// BigQuery (STACKED)
const bigqueryOps = DatabaseOperations.bigquery('your_tool');
const bigqueryPayload = bigqueryOps.insert('dataset', 'table', payload);
```

## 🔧 Manual Validation

### Validate Any Payload

```typescript
try {
  const validatedPayload = BartonDoctrine.validate(payload, 'your_tool', 'operation_name');
  console.log('✅ Payload is compliant');
} catch (error) {
  console.error('🚨 BARTON DOCTRINE VIOLATION:', error.message);
}
```

### Format for Specific Database

```typescript
// Format for Firebase (SPVPET)
const firebaseFormat = BartonDoctrine.formatFor(payload, 'firebase', 'your_tool');

// Format for Neon (STAMPED)
const neonFormat = BartonDoctrine.formatFor(payload, 'neon', 'your_tool');

// Format for BigQuery (STACKED)
const bigqueryFormat = BartonDoctrine.formatFor(payload, 'bigquery', 'your_tool');
```

## ⚙️ Configuration

### Enable/Disable Enforcement

```typescript
// Enable enforcement (default)
BartonDoctrine.setEnabled(true);

// Disable enforcement (DANGEROUS - only for testing)
BartonDoctrine.setEnabled(false);
```

### Strict Mode

```typescript
// Enable strict mode - throw errors on violations (default)
BartonDoctrine.setStrict(true);

// Disable strict mode - attempt to repair violations
BartonDoctrine.setStrict(false);
```

## 📊 Monitoring and Reporting

### Check Violation Status

```typescript
const violations = BartonDoctrine.getViolations();
console.log(`Total violations: ${violations.total}`);
console.log('Violations by tool:', violations.byTool);
```

### Generate Reports

```bash
# Check current status
npm run barton:status

# Generate violation report
npm run barton:report

# Enable strict mode
npm run barton:strict

# Full validation of all tools
npm run validate:barton-doctrine
```

## 🛡️ Enforcement Mechanisms

### 1. Pre-commit Hooks
Automatically validates all payloads before code commits.

### 2. Runtime Validation
All database operations are intercepted and validated in real-time.

### 3. Continuous Integration
Validation runs on every build and deployment.

### 4. Violation Tracking
All violations are logged and tracked for analysis.

## 🚨 Violation Handling

### Strict Mode (Recommended)
In strict mode, violations immediately throw errors:
```typescript
throw new BartonDoctrineViolationError(
  'BARTON DOCTRINE VIOLATION: Missing required field',
  violationDetails
);
```

## 📝 Integration Examples

### Tool Integration Template

```typescript
import { withBartonDoctrine } from '../middleware/barton-doctrine-middleware';

class YourToolIntegration {
  private middleware = withBartonDoctrine('your_tool_name');

  async processData(data: any) {
    // Create compliant payload
    const payload = this.middleware.createPayload(
      'your_tool_name',
      `process_${Date.now()}`,
      data
    );

    // Validate before processing
    const validatedPayload = this.middleware.validate(payload, 'process_data');

    // Save to appropriate database
    if (this.shouldSaveToFirebase()) {
      return this.middleware.validateForFirebase(validatedPayload);
    } else if (this.shouldSaveToNeon()) {
      return this.middleware.validateForNeon(validatedPayload);
    } else {
      return this.middleware.validateForBigQuery(validatedPayload);
    }
  }
}
```

## 🎯 Best Practices

### 1. Always Use Middleware
```typescript
// ✅ GOOD
const middleware = withBartonDoctrine('tool_name');
const payload = middleware.createPayload(...);

// ❌ BAD
const payload = { source_id: '...', /* manual creation */ };
```

### 2. Validate Before Database Operations
```typescript
// ✅ GOOD
const validatedPayload = BartonDoctrine.validate(payload, 'tool_name');
await database.save(validatedPayload);

// ❌ BAD
await database.save(payload); // No validation
```

### 3. Use Database-Specific Formatting
```typescript
// ✅ GOOD
const firebasePayload = BartonDoctrine.formatFor(payload, 'firebase', 'tool');
const neonPayload = BartonDoctrine.formatFor(payload, 'neon', 'tool');

// ❌ BAD
await firebase.save(payload); // Wrong format
await neon.insert(payload);   // Wrong format
```

---

## 🔐 Security & Compliance

The Barton Doctrine Enforcement System ensures:
- **Data Integrity**: All payloads follow consistent structure
- **Audit Trail**: Complete tracking of data transformations
- **Schema Evolution**: Versioned schemas for backward compatibility
- **Error Prevention**: Catch violations before they reach databases
- **System Reliability**: Prevent data corruption from malformed payloads

**Remember**: This system is the backbone of data integrity. Never bypass enforcement unless absolutely necessary and always re-enable immediately after.
