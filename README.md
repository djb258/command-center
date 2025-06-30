# Cursor Blueprint Enforcer - Monorepo

This monorepo contains multiple applications and tools for development workflow management and data processing.

## 🏗️ Project Structure

```
cursor-blueprint-enforcer/
├── command-center/          # Next.js 14 Command Center app
├── mapping-agent/           # Next.js 14 Mapping Agent app
├── scripts/                 # Utility scripts and tools
├── docs/                    # Documentation
├── schemas/                 # Data schemas and templates
├── tools/                   # Shared tools and validators
└── env.*.template          # Environment templates
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 8+

### Installation

```bash
# Install all dependencies for all workspaces
npm run install:all
```

### Development

#### Command Center App

```bash
# Start Command Center development server
npm run dev:command-center
# or
cd command-center && npm run dev
```

#### Mapping Agent App

```bash
# Start Mapping Agent development server
npm run dev:mapping-agent
# or
cd mapping-agent && npm run dev
```

### Building

```bash
# Build all apps
npm run build:command-center
npm run build:mapping-agent
```

## 📱 Applications

### Command Center

- **Purpose**: Centralized project and task management
- **Features**: CRUD operations, Barton Doctrine compliance, real-time validation
- **Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, SQLite
- **Port**: 3000 (default)

### Mapping Agent

- **Purpose**: Data mapping and transformation workflows
- **Features**: CSV/XLSX processing, AI-powered mapping, vendor output generation
- **Tech Stack**: Next.js 14, TypeScript, Tailwind CSS
- **Port**: 3001 (default)

## 🔧 Tools and Scripts

### Barton Doctrine Enforcer

- Automated code quality and compliance validation
- Pre-build validation for all applications
- Configurable rules and standards

### Environment Management

- Multiple environment templates for different use cases
- Automated environment setup scripts
- Secure configuration management

## 📚 Documentation

- `docs/` - Comprehensive documentation
- `ENVIRONMENT_SETUP.md` - Environment configuration guide
- `BARTON_DOCTRINE_ENFORCEMENT.md` - Compliance standards
- `CURSOR_PRODUCTIVITY_SETUP.md` - Development workflow

## 🚀 Deployment

Each application can be deployed independently:

### Command Center

- **Vercel**: Configure root directory as `command-center`
- **Environment**: Use `env.command-center.template`

### Mapping Agent

- **Vercel**: Configure root directory as `mapping-agent`
- **Environment**: Use appropriate environment template

## 🔍 Development Workflow

1. **Setup**: Run `npm run install:all`
2. **Development**: Use `npm run dev:[app-name]`
3. **Validation**: Barton Doctrine validation runs automatically
4. **Build**: Use `npm run build:[app-name]`
5. **Deploy**: Configure Vercel with correct root directory

## 📝 Environment Setup

Copy the appropriate template and configure:

```bash
# For Command Center
cp env.command-center.template .env

# For Mapping Agent
cp env.template .env
```

## 🤝 Contributing

1. Follow Barton Doctrine compliance standards
2. Run validation before committing
3. Update documentation for new features
4. Test across all affected applications

## 📄 License

Private - All rights reserved
