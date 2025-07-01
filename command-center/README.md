# 🔒 Command Center - Barton Doctrine Compliant

A modern Next.js 14 Command Center application with full CRUD functionality, built with **Barton Doctrine compliance** from the ground up.

## 🛡️ Barton Doctrine Compliance

This application is built with **mandatory Barton Doctrine enforcement** ensuring:

- **SPVPET/STAMPED/STACKED schema compliance** for all data operations
- **Runtime validation** of all database operations
- **Pre-commit hooks** preventing non-compliant code
- **Automatic validation** during builds and deployments
- **Zero exceptions** - all operations must go through Barton Doctrine validation

### 🔒 Compliance Features

- ✅ All database operations validated through Barton Doctrine
- ✅ API routes enforce Barton Doctrine validation
- ✅ Schema validation using Zod with Barton Doctrine schemas
- ✅ Automatic logging of all Barton Doctrine operations
- ✅ Build-time validation preventing deployment of non-compliant code

## 🚀 Features

- **Commands Management**: Create, read, update, delete commands with categories and priorities
- **Task Management**: Assign tasks to commands with status tracking
- **Project Management**: Manage projects with timelines and status
- **Modern UI**: Beautiful, responsive interface with Tailwind CSS
- **Real-time Updates**: Live data updates with React hooks
- **SQLite Database**: Local database with Barton Doctrine compliance
- **TypeScript**: Full type safety throughout the application

## 🛠️ Technology Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **SQLite** - Local database with better-sqlite3
- **Zod** - Schema validation
- **Lucide React** - Beautiful icons
- **Barton Doctrine** - Mandatory data validation system

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd command-center
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

```bash
npm run dev
```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔒 Barton Doctrine Validation

### Pre-build Validation

```bash
npm run validate:barton-doctrine
```

### Build with Validation

```bash
npm run build
```

### Vercel Deployment

The application includes `vercel-build` script that runs Barton Doctrine validation before building.

## 📊 Database Schema

### Commands Table

- `id` - Unique identifier (UUID)
- `name` - Command name (required, max 255 chars)
- `description` - Optional description
- `category` - Command category (required)
- `status` - active, inactive, draft, archived
- `priority` - low, medium, high, critical
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `metadata` - Optional JSON metadata

### Tasks Table

- `id` - Unique identifier (UUID)
- `command_id` - Reference to command (foreign key)
- `title` - Task title (required)
- `description` - Optional description
- `status` - pending, in_progress, completed, failed
- `priority` - low, medium, high, critical
- `assigned_to` - Optional assignee
- `due_date` - Optional due date
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `metadata` - Optional JSON metadata

### Projects Table

- `id` - Unique identifier (UUID)
- `name` - Project name (required, max 255 chars)
- `description` - Optional description
- `status` - planning, active, on_hold, completed, cancelled
- `priority` - low, medium, high, critical
- `start_date` - Optional start date
- `end_date` - Optional end date
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `metadata` - Optional JSON metadata

### Barton Doctrine Logs Table

- `id` - Unique identifier (UUID)
- `source_id` - Source identifier
- `process_id` - Process identifier
- `validated` - Validation status
- `execution_signature` - Execution signature
- `timestamp_last_touched` - Last touch timestamp
- `data_payload` - Data payload (JSON)
- `operation` - Operation type
- `tool_name` - Tool name

## 🔧 API Endpoints

### Commands

- `GET /api/commands` - Get all commands
- `POST /api/commands` - Create new command
- `GET /api/commands/[id]` - Get specific command
- `PUT /api/commands/[id]` - Update command
- `DELETE /api/commands/[id]` - Delete command

### Tasks

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task

### Projects

- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project

All API endpoints include Barton Doctrine validation and return `barton_doctrine_validated: true` in responses.

## 🎨 UI Components

### Dashboard

- **Stats Overview**: Shows total commands, active tasks, active projects, and team members
- **Tabbed Interface**: Switch between Commands, Tasks, and Projects
- **Card Layout**: Clean, modern card-based design
- **Status Indicators**: Color-coded status and priority badges
- **Responsive Design**: Works on desktop, tablet, and mobile

### Status Colors

- **Green**: Active, Completed
- **Blue**: Draft, Planning
- **Yellow**: In Progress, On Hold
- **Orange**: Pending
- **Red**: Failed, Cancelled
- **Gray**: Inactive, Archived

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set the root directory to `command-center`
3. Vercel will automatically run Barton Doctrine validation during build
4. Deploy with confidence knowing all code is compliant

### Environment Variables

No environment variables required - the application uses local SQLite database.

## 🔍 Development

### File Structure

```
command-center/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── commands/
│   │   │   ├── tasks/
│   │   │   └── projects/
│   │   └── page.tsx
│   ├── core/
│   │   └── barton-doctrine-enforcer.ts
│   └── lib/
│       └── database.ts
├── tools/
│   └── validation/
│       └── doctrine-validator.js
└── package.json
```

### Adding New Features

1. **Create API route** with Barton Doctrine validation
2. **Update database schema** with proper validation
3. **Add UI components** following existing patterns
4. **Run validation** to ensure compliance
5. **Test thoroughly** before deployment

## 🔒 Barton Doctrine Enforcement

### What is Enforced

- All database operations must go through Barton Doctrine validation
- All API endpoints must validate payloads
- All schemas must conform to SPVPET/STAMPED/STACKED structure
- No direct database access allowed
- All operations logged for audit trail

### Validation Process

1. **Pre-commit**: Automatic validation before commits
2. **Build-time**: Validation during build process
3. **Runtime**: Validation during application execution
4. **Deployment**: Validation before deployment

## 📝 License

This project is built with Barton Doctrine compliance and follows strict data validation standards.

## 🤝 Contributing

1. Ensure all code follows Barton Doctrine compliance
2. Run validation before submitting changes
3. Follow existing code patterns and structure
4. Test thoroughly before deployment

---

**🔒 Built with Barton Doctrine - Zero Exceptions, Zero Bypass, Zero Compromise**
