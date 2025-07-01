@echo off
:: ================================================================
:: ScreenPipe → LLM → Obsidian Session Launcher
:: ================================================================
:: Double-click this file to start your automated session
:: Edit the variables below to match your system paths
:: ================================================================

title ScreenPipe Obsidian Bridge - Session Active

:: ================================================================
:: 🔧 CONFIGURATION - Edit these paths for your system
:: ================================================================

:: Path to ScreenPipe output directory (where ScreenPipe saves data)
:: ScreenPipe is installed at: C:\Users\%USERNAME%\screenpipe\bin\screenpipe.exe
set SCREENPIPE_PATH=C:\Users\%USERNAME%\.screenpipe\data

:: Path to your Obsidian vault directory
set OBSIDIAN_VAULT=C:\Users\%USERNAME%\Documents\ObsidianVault

:: OpenAI API Key (or set this as a permanent environment variable)
:: TODO: Replace with your actual OpenAI API key from https://platform.openai.com/api-keys
set OPENAI_KEY=sk-placeholder-key-replace-with-real-key

:: Path to your Go bridge application
set BRIDGE_APP_PATH=%~dp0screenpipe-bridge.exe

:: Go binary path (adjust if Go is installed elsewhere)
set GO_PATH=C:\Program Files\Go\bin

:: ================================================================
:: 🚀 SESSION STARTUP
:: ================================================================

echo.
echo ========================================
echo   ScreenPipe → LLM → Obsidian Bridge
echo ========================================
echo.
echo 🚀 Starting automated session...
echo.

:: Add Go to PATH
set PATH=%GO_PATH%;%PATH%

:: Validate environment
echo 🔍 Validating environment...

:: Check if ScreenPipe path exists
if not exist "%SCREENPIPE_PATH%" (
    echo ❌ ERROR: ScreenPipe path not found: %SCREENPIPE_PATH%
    echo    Please install ScreenPipe or update SCREENPIPE_PATH variable
    echo.
    pause
    exit /b 1
) else (
    echo ✅ ScreenPipe path: %SCREENPIPE_PATH%
)

:: Check if Obsidian vault exists
if not exist "%OBSIDIAN_VAULT%" (
    echo ❌ ERROR: Obsidian vault not found: %OBSIDIAN_VAULT%
    echo    Please create vault or update OBSIDIAN_VAULT variable
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Obsidian vault: %OBSIDIAN_VAULT%
)

:: Check API key
if "%OPENAI_KEY%"=="sk-your-openai-api-key-here" (
    echo ⚠️  WARNING: OpenAI API key not configured
    echo    Please update OPENAI_KEY variable or set OPENAI_API_KEY environment variable
)

:: Check if bridge app exists, build if needed
if not exist "%BRIDGE_APP_PATH%" (
    echo 🔨 Building bridge application...
    go build -o "%BRIDGE_APP_PATH%" cmd/main.go
    if %errorlevel% neq 0 (
        echo ❌ Build failed
        pause
        exit /b 1
    )
    echo ✅ Build successful
) else (
    echo ✅ Bridge app: %BRIDGE_APP_PATH%
)

:: Check configuration file
if not exist "%~dp0configs\config.yaml" (
    echo 🔧 Creating configuration file...
    copy "%~dp0configs\config.example.yaml" "%~dp0configs\config.yaml"
    echo ⚠️  Please edit configs\config.yaml with your settings
)

echo.
echo ================================================================
echo 🎯 Session Configuration:
echo ================================================================
echo 📂 ScreenPipe Output: %SCREENPIPE_PATH%
echo 📝 Obsidian Vault:    %OBSIDIAN_VAULT%
echo 🤖 API Key:           %OPENAI_KEY:~0,8%...
echo 🔧 Bridge App:        %BRIDGE_APP_PATH%
echo ================================================================
echo.

:: Set environment variables for the Go application
set OPENAI_API_KEY=%OPENAI_KEY%

:: Launch the bridge application
echo 🚀 Launching ScreenPipe Obsidian Bridge...
echo.
echo 📊 Status: Session Active
echo 🔄 Monitoring ScreenPipe output for new files...
echo 🤖 Ready to process content through LLM...
echo 📝 Will generate Obsidian notes automatically...
echo.
echo ================================================================
echo 💡 Tips:
echo • Keep this window open while working
echo • ScreenPipe notes will appear in: %OBSIDIAN_VAULT%\ScreenPipe\
echo • Press Ctrl+C to stop the session
echo • Check the logs below for processing activity
echo ================================================================
echo.

:: Start the bridge (this will block until Ctrl+C)
"%BRIDGE_APP_PATH%"

:: This section runs when the bridge is stopped
echo.
echo ================================================================
echo 🛑 Session Ended
echo ================================================================
echo.
echo Thank you for using ScreenPipe Obsidian Bridge!
echo Generated notes are saved in your Obsidian vault.
echo.
echo Press any key to close this window...
pause >nul 