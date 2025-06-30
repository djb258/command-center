# 🔄 Auto-Backup & Priority Reminders Guide

**NEVER LOSE YOUR WORK AGAIN!** This system ensures all your API keys, tools, and configurations are safely backed up to the repository.

## 🚀 Quick Commands

### 📦 Auto-Backup System
```bash
# Manual backup right now
npm run backup:now "Added new API keys"

# Check what needs backing up
npm run backup:status

# Watch files and auto-backup on changes (recommended for active development)
npm run backup:watch

# Start backup daemon (every 30 minutes)
npm run backup:start
```

### 🔔 Priority Reminders
```bash
# Add reminder for new API key
npm run remind:api "OpenAI API" "Configure OpenAI API key in environment"

# Add reminder for new tool
npm run remind:tool "Stripe" "Set up Stripe payment integration"

# See all active reminders
npm run remind:list

# Mark reminder as done
npm run remind:done <ID>

# Check for urgent/old reminders
npm run remind:urgent

# Get suggestions for common tools
npm run remind:suggest
```

## 🎯 **PRIORITY WORKFLOW** - New API Keys & Tools

When you get a new API key or install a new tool:

### 1. **IMMEDIATE BACKUP** 🚨
```bash
npm run backup:now "Added [API/Tool Name]"
```

### 2. **ADD REMINDER** 📝
```bash
# For API keys (HIGH priority)
npm run remind:api "Service Name" "Description of what it's for"

# For tools (MEDIUM priority)  
npm run remind:tool "Tool Name" "What it does"
```

### 3. **UPDATE ENVIRONMENT** 🌍
```bash
# Add to your .env file
npm run env:validate

# Auto-backup the changes
npm run backup:now "Updated environment with [Service Name]"
```

### 4. **MARK COMPLETE** ✅
```bash
npm run remind:done <ID>
```

## 🔄 **RECOMMENDED DAILY WORKFLOW**

### Morning Setup
```bash
# Check what needs attention
npm run remind:urgent
npm run backup:status

# Start file watcher for the day
npm run backup:watch
```

### When Adding New Services
```bash
# 1. Add API key to .env
# 2. Immediate backup
npm run backup:now "Added [Service] API key"

# 3. Add reminder
npm run remind:api "[Service]" "Configure [Service] integration"

# 4. Update documentation if needed
# 5. Final backup
npm run backup:now "Completed [Service] setup"
```

### End of Day
```bash
# Final backup of the day
npm run backup:now "End of day backup"

# Check reminders for tomorrow
npm run remind:list
```

## 🛡️ **NEVER LOSE WORK CHECKLIST**

✅ **Auto-backup is running**: `npm run backup:watch`  
✅ **Environment is configured**: `npm run env:validate`  
✅ **No urgent reminders**: `npm run remind:urgent`  
✅ **Changes are backed up**: `npm run backup:status`  

## 🔧 **Auto-Backup Features**

### **Smart Commit Messages**
The system automatically generates meaningful commit messages based on what changed:
- `🔄 Auto-backup 2025-06-26 15:30 - Updated env+config`
- `📝 Updated .env`
- `➕ Added scripts/new_integration.ts`

### **File Watching**
Automatically backs up when you change:
- `.env*` files (environment variables)
- `package.json` (dependencies)
- `scripts/**/*` (your custom scripts)
- `*.md` (documentation)
- `*.yml`, `*.yaml` (configuration)

### **Debouncing**
Waits 5 seconds after your last change before backing up to avoid spam commits.

## 🔔 **Priority Reminder Features**

### **Smart Detection**
Automatically detects potential API keys in your environment:
```bash
npm run remind:check
```

### **Priority Levels**
- 🔴 **HIGH**: API keys, secrets, critical configs
- 🟡 **MEDIUM**: Tools, integrations, general configs  
- 🔵 **LOW**: Documentation, minor updates

### **Age Tracking**
Shows how old reminders are and flags urgent items:
- **Today**: Just added
- **7+ days**: Marked as old/urgent

## 💡 **Pro Tips**

### **For API Keys**
1. **Never commit actual keys** - always use placeholders in templates
2. **Use the reminder system** to track which keys need setup
3. **Backup immediately** after adding new keys
4. **Validate regularly**: `npm run env:validate`

### **For New Tools**
1. **Document as you go** - add to README or create docs
2. **Add to environment template** if it needs configuration
3. **Create integration scripts** in the `scripts/` folder
4. **Test and backup** before moving on

### **File Organization**
```
├── .env                          # Your actual secrets (NEVER commit)
├── env.comprehensive.template    # Template with all possible variables
├── scripts/
│   ├── auto_backup.ts           # Backup automation
│   ├── priority_reminders.ts    # Reminder system
│   └── your_integrations.ts     # Your custom integrations
└── BACKUP_AND_REMINDERS.md     # This guide
```

## 🚨 **Emergency Recovery**

If something goes wrong:

```bash
# Check git history
git log --oneline -10

# See what's changed
git status

# Restore from backup
git stash
git pull origin main

# Check backup status
npm run backup:status
```

## 🎉 **Success Indicators**

You're doing it right when:
- ✅ `npm run backup:status` shows no pending changes
- ✅ `npm run remind:urgent` shows no urgent items
- ✅ Your `.env` file validates: `npm run env:validate`
- ✅ All your tools and API keys are documented
- ✅ You can switch machines without losing anything

---

**Remember: The goal is NEVER to lose work and always have your setup backed up to the repository!** 🚀 