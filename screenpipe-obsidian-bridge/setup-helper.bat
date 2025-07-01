@echo off
echo ========================================
echo ScreenPipe Obsidian Bridge Setup Helper
echo ========================================
echo.

echo 🔍 Checking your system...
echo.

echo 1. Checking for ScreenPipe installation...
if exist "C:\Users\%USERNAME%\.screenpipe\data" (
    echo ✅ Found ScreenPipe data at: C:\Users\%USERNAME%\.screenpipe\data
) else if exist "C:\Users\%USERNAME%\AppData\Local\screenpipe\data" (
    echo ✅ Found ScreenPipe data at: C:\Users\%USERNAME%\AppData\Local\screenpipe\data
) else (
    echo ❌ ScreenPipe data folder not found. Please install and run ScreenPipe first.
    echo    Check: https://github.com/djb258/screenpipe
)
echo.

echo 2. Checking for Obsidian vault...
if exist "C:\Users\%USERNAME%\Documents\ObsidianVault" (
    echo ✅ Found Obsidian vault at: C:\Users\%USERNAME%\Documents\ObsidianVault
) else if exist "C:\Users\%USERNAME%\Desktop\ObsidianVault" (
    echo ✅ Found Obsidian vault at: C:\Users\%USERNAME%\Desktop\ObsidianVault
) else if exist "C:\Users\%USERNAME%\Obsidian" (
    echo ✅ Found Obsidian vault at: C:\Users\%USERNAME%\Obsidian
) else (
    echo ❌ Obsidian vault not found in common locations.
    echo    Please create an Obsidian vault or update config.yaml with your vault path.
)
echo.

echo 3. Checking configuration...
if exist "configs\config.yaml" (
    echo ✅ Configuration file exists
    findstr "REPLACE_WITH_YOUR_OPENAI_API_KEY" configs\config.yaml >nul
    if %errorlevel%==0 (
        echo ❌ OpenAI API key not set in config.yaml
        echo    Please edit configs\config.yaml and replace REPLACE_WITH_YOUR_OPENAI_API_KEY
        echo    Or set environment variable: set OPENAI_API_KEY=sk-your-key
    ) else (
        echo ✅ API key appears to be configured
    )
) else (
    echo ❌ Configuration file missing. Run: copy configs\config.example.yaml configs\config.yaml
)
echo.

echo 📋 Next Steps:
echo 1. Install ScreenPipe from: https://github.com/djb258/screenpipe
echo 2. Create an Obsidian vault or note your existing vault path
echo 3. Get OpenAI API key from: https://platform.openai.com/api-keys
echo 4. Edit configs\config.yaml with your paths and API key
echo 5. Run: screenpipe-bridge.exe
echo.

echo Press any key to exit...
pause >nul 