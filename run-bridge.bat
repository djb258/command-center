@echo off
echo ScreenPipe Bridge Launcher
echo =========================

REM Check if bridge binary exists
if not exist "bin\bridge.exe" (
    echo Bridge binary not found. Building...
    call build.bat
    if errorlevel 1 (
        echo Build failed. Please check Go installation.
        pause
        exit /b 1
    )
)

REM Check if OPENAI_API_KEY is set
if "%OPENAI_API_KEY%"=="" (
    echo WARNING: OPENAI_API_KEY environment variable not set
    echo Please set it before running the bridge:
    echo set OPENAI_API_KEY=your-api-key-here
    echo.
    pause
)

echo Starting ScreenPipe Bridge...
echo Monitoring: %USERPROFILE%\.screenpipe\data
echo.

cd bin
bridge.exe 