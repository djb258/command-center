@echo off
REM ============================================================================
REM CURSOR BLUEPRINT ENFORCER - DEVELOPMENT TOOLS INSTALLER (BATCH LAUNCHER)
REM ============================================================================
REM Double-click friendly installer for Windows users

title Cursor Blueprint Enforcer - Development Tools Installer

echo.
echo ============================================================================
echo   CURSOR BLUEPRINT ENFORCER - DEVELOPMENT TOOLS INSTALLER
echo ============================================================================
echo.
echo This will install all required development tools:
echo   - Obsidian (Knowledge Management)
echo   - Dendron CLI (Hierarchical Documentation)
echo   - Graphite CLI (Stacked PR Workflow)
echo.
echo NOTE: This installer requires Administrator privileges for best results.
echo.

pause

echo.
echo Starting PowerShell installer...
echo.

REM Run the PowerShell script with execution policy bypass
powershell.exe -ExecutionPolicy Bypass -File "scripts\install_development_tools.ps1"

echo.
echo ============================================================================
echo Installation process completed!
echo.
echo Next Steps:
echo 1. Install Dendron extension in Cursor/VS Code
echo 2. Create Obsidian vault in project directory
echo 3. Configure environment variables (.env file)
echo 4. Run 'npm install' to install project dependencies
echo.
echo For detailed setup instructions, see:
echo - TOOLS_INSTALLED.md
echo - ENVIRONMENT_SETUP.md
echo - README.md
echo ============================================================================
echo.

pause 