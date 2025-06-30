# Automated Weekly Tool Updates

## 🔄 Overview

Keep your development environment up-to-date automatically with our weekly tool update system. This ensures all your development tools stay current with the latest features and security updates.

## 🚀 Quick Setup

### 1. Set Up Automated Weekly Updates
```bash
npm run setup-weekly-updates
```

This will:
- Create a Windows Task Scheduler task
- Run every Sunday at 9:00 AM by default
- Update all development tools automatically
- Log results to `logs/weekly-update.log`

### 2. Manual Update (Run Once)
```bash
npm run update-tools
```

## 🛠️ What Gets Updated

### Winget Tools (All at once)
- **Docker Desktop** - Containerization platform
- **Windows Terminal** - Modern terminal
- **Oh My Posh** - Beautiful terminal prompts
- **Postman** - API testing
- **PowerToys** - Windows productivity tools
- **Git & GitKraken** - Version control tools
- **Programming Languages** - Go, Rust
- **Command-line utilities** - fzf, bat, jq, fd, ripgrep
- **Text Editors** - Neovim

### Node.js Ecosystem
- **npm** - Latest version
- **TypeScript** - Latest version
- **tsx** - TypeScript execution
- **Project dependencies** - All npm packages

### Python Tools
- **pip** - Package installer
- **setuptools & wheel** - Build tools

### System Cleanup
- **npm cache** - Cleared for performance
- **Temporary files** - Cleaned up

## ⚙️ Configuration Options

### Custom Schedule
```bash
# Different day and time
powershell -ExecutionPolicy Bypass -File scripts/setup_weekly_updates.ps1 -Day "Monday" -Time "18:00"
```

### Remove Automation
```bash
npm run remove-weekly-updates
```

## 📋 Management Commands

### Check Task Status
```powershell
Get-ScheduledTask -TaskName "CursorDevToolsWeeklyUpdate"
```

### Run Update Now
```powershell
Start-ScheduledTask -TaskName "CursorDevToolsWeeklyUpdate"
```

### View Logs
```bash
# Latest log
cat logs/weekly-update.log

# Specific date report  
cat logs/update-report-2025-01-15.json
```

## 📊 Update Reports

After each update, you'll get:
- **Console output** - Real-time progress
- **Log file** - Complete history (`logs/weekly-update.log`)
- **JSON report** - Detailed results (`logs/update-report-YYYY-MM-DD.json`)

### Sample Report
```json
{
  "tool": "GitKraken",
  "oldVersion": "winget",
  "newVersion": "latest", 
  "status": "updated"
}
```

## 🔧 Troubleshooting

### Task Not Running
1. Check if task exists: `Get-ScheduledTask -TaskName "CursorDevToolsWeeklyUpdate"`
2. Verify task settings in Task Scheduler app
3. Check logs for errors: `logs/weekly-update.log`

### Permission Issues
- Run setup as Administrator
- Ensure PowerShell execution policy allows scripts

### Network Issues
- Task waits for network availability
- Check internet connection
- Some updates may fail if repositories are unavailable

### Tool-Specific Issues
- **Winget**: May need manual Microsoft Store updates
- **npm**: Clear cache with `npm cache clean --force`
- **Python**: May need manual pip upgrade

## 💡 Benefits

### ✅ Always Up-to-Date
- Latest features and improvements
- Security patches applied automatically
- Bug fixes included

### ✅ Zero Maintenance
- Runs automatically in background
- No manual intervention needed
- Comprehensive logging

### ✅ Professional Environment
- Consistent across all machines
- Reliable development setup
- Reduced compatibility issues

## 🎯 Best Practices

1. **Review logs weekly** - Check for any failed updates
2. **Test after updates** - Verify tools work as expected
3. **Backup important work** - Before major updates
4. **Monitor disk space** - Updates can be large
5. **Keep internet stable** - For reliable downloads

## 📅 Default Schedule

- **Day**: Sunday
- **Time**: 9:00 AM
- **Frequency**: Weekly
- **Duration**: 15-30 minutes (depending on updates)

## 🔗 Related Commands

```bash
# Development workflow
npm run setup              # Initial machine setup
npm run validate-all       # Validate all systems
npm run sync-machines      # Sync configurations
npm run gui               # Launch sync GUI

# Updates
npm run update-tools      # Manual update
npm run setup-weekly-updates  # Enable automation
npm run remove-weekly-updates  # Disable automation
```

---

**Your development environment will now stay automatically updated!** 🚀 