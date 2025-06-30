# 🛠️ Cursor Blueprint Enforcer

A comprehensive system for enforcing the Barton Doctrine across development workflows with nuclear-grade compliance and multi-service integrations.

## 🚀 Quick Start for New Machines

### 1. Clone Repository

```bash
git clone https://github.com/djb258/cursor-blueprint-enforcer.git
cd cursor-blueprint-enforcer
```

### 2. Install Development Tools

#### Windows (PowerShell - Run as Administrator)

```powershell
.\scripts\install_development_tools.ps1
```

#### macOS/Linux (Bash)

```bash
./scripts/install_development_tools.sh
```

#### Manual Installation

See detailed instructions in [TOOLS_INSTALLED.md](TOOLS_INSTALLED.md)

### 3. Environment Setup

```bash
# Copy environment template
cp env.comprehensive.template .env

# Edit .env with your actual API keys
# See ENVIRONMENT_SETUP.md for detailed configuration
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Verify Setup

```bash
npm test
```

### 6. Explore UI Library

```bash
# Browse comprehensive UI component resources
cat ui-library/external_sources.md

# View landing page templates
ls ui-library/templates/landing-pages/

# Check component blocks
ls ui-library/components/blocks/
```

## 📋 Development Tools Stack

- **🗒️ Obsidian** - Knowledge management and graph visualization
- **📚 Dendron** - Hierarchical documentation with VS Code/Cursor integration
- **🔄 Graphite** - Stacked pull requests and advanced Git workflows
- **⚛️ Nuclear Barton Doctrine** - Zero-tolerance compliance enforcement
- **🎨 UI Library** - Comprehensive component library and design resources

## 🚀 Quick Start

1. **Install Node.js** (version 16 or higher)
2. **Clone and setup**:
   ```bash
   git clone <your-repo>
   cd cursor-blueprint-enforcer
   ./setup.sh
   ```
3. **Configure environment**:
   ```bash
   cp env.template .env
   # Edit .env with your actual credentials
   ```
4. **Run the enforcer**:
   ```bash
   npm run dev src/index.ts
   ```

## 🔧 Machine Synchronization

### Overview

The Cursor Blueprint Enforcer includes comprehensive machine synchronization capabilities to keep all your development machines up to date with:

- **Cursor Configuration**: Settings, keybindings, extensions, and snippets
- **Tool Integrations**: MindPal, DeerFlow, Render, Make.com, Firebase, BigQuery, Neon
- **Project Configuration**: Package.json, environment variables, schemas, and documentation

### Quick Sync Commands

```bash
# Sync everything across all machines
npm run sync-machines

# Sync only Cursor configuration
npm run sync-cursor export
npm run sync-cursor import

# Sync only tool configurations
npm run sync-tools

# Backup current configuration
npm run backup-config

# Validate sync status
npm run validate-sync
```

### Machine Synchronization Setup

#### 1. Create Machine Sync Configuration

```bash
# Generate configuration template
npm run sync-machines
```

This creates `machine-sync-config.json` with your current machine setup. Edit it to include all your machines:

```json
{
  "machines": [
    {
      "name": "local-machine",
      "type": "local",
      "syncPaths": [
        "~/.cursor/settings.json",
        "~/.cursor/keybindings.json",
        "~/projects/cursor-blueprint-enforcer/"
      ],
      "tools": ["cursor", "mindpal", "deerflow", "render", "make"]
    },
    {
      "name": "remote-server",
      "type": "remote",
      "host": "your-server.com",
      "user": "your-username",
      "sshKey": "~/.ssh/id_rsa",
      "syncPaths": [
        "~/cursor-config/",
        "~/projects/cursor-blueprint-enforcer/"
      ],
      "tools": ["cursor", "mindpal", "deerflow", "render", "make"]
    }
  ]
}
```

#### 2. Configure Environment Variables

Add machine sync configuration to your `.env` file:

```bash
# Machine Synchronization
SYNC_BACKUP_ENABLED=true
SYNC_VALIDATION_ENABLED=true
SYNC_NOTIFICATION_ENABLED=true
SYNC_SSH_KEY_PATH=~/.ssh/id_rsa

# Remote Machine Configuration
REMOTE_HOST_1=your-server-1.com
REMOTE_USER_1=your-username-1
REMOTE_PROJECT_PATH_1=/home/your-username-1/projects/cursor-blueprint-enforcer
```

#### 3. Set Up SSH Keys (for remote machines)

```bash
# Generate SSH key if you don't have one
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Copy public key to remote machines
ssh-copy-id your-username@your-server.com
```

### Cursor Configuration Synchronization

#### Export Current Cursor Config

```bash
# Export to ./cursor-config directory
npm run sync-cursor export

# Export to custom directory
npm run sync-cursor export ./my-cursor-config
```

This exports:

- Settings (`settings.json`)
- Keybindings (`keybindings.json`)
- Extensions list (`extensions.json`)
- Snippets (`snippets/`)
- Workspace settings (`workspaceStorage/`)

#### Import Cursor Config

```bash
# Import from ./cursor-config directory
npm run sync-cursor import

# Import from custom directory
npm run sync-cursor import ./my-cursor-config
```

#### Validate Cursor Config

```bash
# Validate current configuration
npm run sync-cursor validate
```

### Tool Configuration Synchronization

#### Create Tool Sync Configuration

```bash
# Generate configuration template
npm run sync-tools
```

This creates `tool-sync-config.json` with all integrated tools:

```json
{
  "tools": [
    {
      "name": "mindpal",
      "enabled": true,
      "configFiles": [
        "scripts/mindpal_integration.ts",
        "src/schemas/blueprint-schemas.ts"
      ],
      "envVars": ["MINDPAL_API_KEY"],
      "dependencies": ["axios"]
    },
    {
      "name": "deerflow",
      "enabled": true,
      "configFiles": [
        "scripts/deerflow_integration.ts",
        "src/schemas/blueprint-schemas.ts"
      ],
      "envVars": ["DEERFLOW_API_KEY"],
      "dependencies": ["axios"]
    }
  ],
  "targetMachines": [
    {
      "name": "local-machine",
      "type": "local",
      "projectPath": "/path/to/your/project"
    }
  ]
}
```

#### Sync All Tools

```bash
# Sync all tools to all configured machines
npm run sync-tools
```

### Automated Synchronization

#### 1. Pre-commit Hooks

The project includes Husky pre-commit hooks that automatically:

- Run linting and formatting
- Execute tests
- Generate updated summary
- Optionally sync configuration

#### 2. CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Sync Configuration
  run: |
    npm run sync-machines
    npm run generate-summary
```

#### 3. Scheduled Sync

Create a cron job for regular synchronization:

```bash
# Add to crontab (sync every 6 hours)
0 */6 * * * cd /path/to/cursor-blueprint-enforcer && npm run sync-machines
```

### Synchronization Features

#### ✅ Backup and Restore

- **Automatic backups** before each sync operation
- **Timestamped backups** in `./backups/` directory
- **Restore capability** from any backup point

#### ✅ Validation

- **Pre-sync validation** of source configuration
- **Post-sync validation** of target machines
- **Tool-specific validation** for each integrated service

#### ✅ Notifications

- **Sync completion notifications** via Slack, Discord, or email
- **Error reporting** with detailed logs
- **Success/failure summaries**

#### ✅ Cross-Platform Support

- **Windows**: Uses appropriate Cursor paths
- **macOS**: Handles macOS-specific configurations
- **Linux**: Supports Linux environments
- **Remote machines**: SSH-based synchronization

### Troubleshooting

#### Common Issues

1. **SSH Connection Failed**

   ```bash
   # Test SSH connection
   ssh your-username@your-server.com

   # Check SSH key permissions
   chmod 600 ~/.ssh/id_rsa
   ```

2. **Permission Denied**

   ```bash
   # Fix file permissions
   chmod +x scripts/*.ts
   chmod 644 *.json
   ```

3. **Missing Dependencies**
   ```bash
   # Install missing dependencies
   npm install
   npm run build
   ```

#### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run sync-machines

# View sync logs
cat sync-notifications.json
```

### Best Practices

#### 1. Regular Sync Schedule

- **Daily**: Sync Cursor configuration
- **Weekly**: Full machine synchronization
- **On changes**: Sync after major configuration updates

#### 2. Backup Strategy

- **Keep multiple backups** (last 7 days)
- **Test restore procedures** regularly
- **Version control** your sync configurations

#### 3. Security

- **Use SSH keys** instead of passwords
- **Restrict file permissions** on sensitive configs
- **Encrypt sensitive data** in environment files

#### 4. Monitoring

- **Monitor sync logs** for errors
- **Set up alerts** for failed synchronizations
- **Regular validation** of synced configurations

## 📋 Available Scripts

### Core Scripts

- `npm run dev` - Run TypeScript files directly
- `npm run build` - Build the project
- `npm run test` - Run all tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Tool Integration Scripts

- `npm run mindpal` - MindPal integration
- `npm run deerflow` - DeerFlow integration
- `npm run render` - Render integration
- `npm run make` - Make.com integration
- `npm run firebase` - Firebase operations
- `npm run bigquery` - BigQuery operations
- `npm run neon` - Neon database operations

### Synchronization Scripts

- `npm run sync-machines` - Sync all machines
- `npm run sync-cursor` - Sync Cursor configuration
- `npm run sync-tools` - Sync tool configurations
- `npm run backup-config` - Backup current configuration
- `npm run validate-sync` - Validate sync status

### Utility Scripts

- `npm run generate-summary` - Generate project summary
- `npm run validate` - Run all validations

## 🏗️ Project Structure

```
cursor-blueprint-enforcer/
├── src/
│   ├── index.ts                 # Main application
│   ├── schemas/
│   │   └── blueprint-schemas.ts # Zod schemas
│   └── __tests__/              # Test files
├── scripts/
│   ├── mindpal_integration.ts   # MindPal integration
│   ├── deerflow_integration.ts  # DeerFlow integration
│   ├── render_integration.ts    # Render integration
│   ├── make_integration.ts      # Make.com integration
│   ├── firebase_push.ts         # Firebase operations
│   ├── bigquery_ingest.ts       # BigQuery operations
│   ├── neon_sync.ts            # Neon operations
│   ├── sync_all_machines.ts    # Machine synchronization
│   ├── cursor_config_sync.ts   # Cursor config sync
│   ├── tool_sync_manager.ts    # Tool sync management
│   └── generate_summary.ts     # Summary generation
├── firebase/                   # Firebase templates
├── schemas/                    # JSON schemas
├── prompts/                    # AI prompts
├── examples/                   # Usage examples
└── docs/                      # Documentation
```

## 🔐 Environment Configuration

Copy `env.template` to `.env` and configure:

```bash
# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="your-private-key"

# BigQuery
GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json
BIGQUERY_PROJECT_ID=your-project-id

# Neon
NEON_DATABASE_URL=postgresql://user:pass@host:port/db

# Tool APIs
MINDPAL_API_KEY=your-api-key
DEERFLOW_API_KEY=your-api-key
RENDER_API_KEY=your-api-key
MAKE_API_KEY=your-api-key

# Machine Sync
SYNC_BACKUP_ENABLED=true
REMOTE_HOST_1=your-server.com
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- mindpal.test.ts

# Watch mode
npm run test:watch
```

## 📚 Documentation

- [Installation Summary](INSTALLATION_SUMMARY.md) - Detailed setup guide
- [Doctrine](DOCTRINE.md) - Schema rules and enforcement policies
- [Latest Summary](LATEST_SUMMARY.md) - Current project status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
# Command Center - Updated Mon, Jun 30, 2025  5:13:17 PM
