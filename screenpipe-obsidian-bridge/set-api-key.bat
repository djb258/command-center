@echo off
echo ======================================
echo   ScreenPipe Bridge - Set API Key
echo ======================================
echo.

set CONFIG_FILE=configs\config.yaml

if not exist "%CONFIG_FILE%" (
    echo ERROR: Config file not found at %CONFIG_FILE%
    echo Please run this script from the screenpipe-obsidian-bridge directory
    pause
    exit /b 1
)

echo Current config file: %CONFIG_FILE%
echo.
echo Please enter your OpenAI API key (starts with sk-):
set /p API_KEY="API Key: "

if "%API_KEY%"=="" (
    echo ERROR: No API key entered
    pause
    exit /b 1
)

if not "%API_KEY:~0,3%"=="sk-" (
    echo WARNING: API key doesn't start with 'sk-' - are you sure this is correct?
    set /p CONFIRM="Continue anyway? (y/n): "
    if not "%CONFIRM%"=="y" if not "%CONFIRM%"=="Y" (
        echo Cancelled
        pause
        exit /b 1
    )
)

echo.
echo Updating config file...

powershell -Command "(Get-Content '%CONFIG_FILE%') -replace 'YOUR_ACTUAL_OPENAI_API_KEY_HERE', '%API_KEY%' | Set-Content '%CONFIG_FILE%'"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ API key successfully set in config file!
    echo.
    echo You can now run the bridge with: ..\run-session.bat
    echo.
) else (
    echo.
    echo ✗ Failed to update config file
    echo.
)

pause 