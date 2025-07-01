@echo off
setlocal enabledelayedexpansion

echo ========================================
echo ScreenPipe Assistant Bridge Launcher
echo ========================================

:: Check if .env file exists
if not exist ".env" (
    echo Creating .env file from template...
    copy "template.env" ".env"
    echo.
    echo Please edit .env file with your API keys and paths before running again.
    echo.
    pause
    exit /b 1
)

:: Load environment variables from .env file
for /f "tokens=1,2 delims==" %%a in (.env) do (
    if not "%%a"=="" if not "%%a:~0,1%"=="#" (
        set "%%a=%%b"
    )
)

:: Check required environment variables
if "%OPENAI_API_KEY%"=="" (
    echo ERROR: OPENAI_API_KEY is not set in .env file
    echo Please add your OpenAI API key to the .env file
    pause
    exit /b 1
)

if "%SCREENPIPE_DATA_DIR%"=="" (
    echo ERROR: SCREENPIPE_DATA_DIR is not set in .env file
    pause
    exit /b 1
)

:: Check if Go is installed
go version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Go is not installed or not in PATH
    echo Please install Go 1.21+ from https://golang.org/dl/
    pause
    exit /b 1
)

:: Check if Node.js is installed (for UI)
node --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: Node.js is not installed or not in PATH
    echo UI features will not be available
    echo Please install Node.js 18+ from https://nodejs.org/
    echo.
)

:: Create necessary directories
if not exist "logs" mkdir logs
if not exist "bin" mkdir bin

:: Build the bridge if it doesn't exist or if source is newer
echo Building bridge application...
go build -o bin/bridge.exe cmd/bridge/main.go
if errorlevel 1 (
    echo ERROR: Failed to build bridge application
    pause
    exit /b 1
)

:: Build UI if Node.js is available
node --version >nul 2>&1
if not errorlevel 1 (
    if exist "ui" (
        echo Building UI...
        cd ui
        if not exist "node_modules" (
            echo Installing UI dependencies...
            npm install
        )
        npm run build
        cd ..
    )
)

:: Start the bridge
echo.
echo Starting ScreenPipe Assistant Bridge...
echo Bridge will be available at: http://%UI_HOST%:%BRIDGE_PORT%
echo.
echo Press Ctrl+C to stop the bridge
echo.

:: Set environment variables for the bridge process
set BRIDGE_ENV=1

:: Start the bridge
bin\bridge.exe

echo.
echo Bridge stopped.
pause 