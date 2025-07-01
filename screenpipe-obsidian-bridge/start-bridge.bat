@echo off
echo 🚀 Starting ScreenPipe Obsidian Bridge...
echo.

:: Add Go to PATH if needed
set PATH=C:\Program Files\Go\bin;%PATH%

:: Check if Go is available
go version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Go not found. Please install Go from https://golang.org/dl/
    pause
    exit /b 1
)

:: Check if config exists
if not exist "configs\config.yaml" (
    echo ❌ Configuration file not found.
    echo Please run: copy configs\config.example.yaml configs\config.yaml
    echo Then edit configs\config.yaml with your settings.
    pause
    exit /b 1
)

:: Check if executable exists, build if needed
if not exist "screenpipe-bridge.exe" (
    echo 🔨 Building application...
    go build -o screenpipe-bridge.exe cmd/main.go
    if %errorlevel% neq 0 (
        echo ❌ Build failed
        pause
        exit /b 1
    )
    echo ✅ Build successful
)

:: Start the bridge
echo ✅ Starting ScreenPipe Obsidian Bridge...
echo.
echo 📝 Logs will appear below. Press Ctrl+C to stop.
echo ================================================
echo.

screenpipe-bridge.exe 