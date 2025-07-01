@echo off
echo ScreenPipe Bridge Builder
echo ========================

REM Check if Go is installed
go version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Go is not installed or not in PATH
    echo.
    echo To install Go on Windows:
    echo 1. Download from: https://golang.org/dl/
    echo 2. Run the installer
    echo 3. Restart your terminal
    echo.
    echo Or use Chocolatey: choco install golang
    echo Or use Scoop: scoop install go
    pause
    exit /b 1
)

echo Go found: 
go version

REM Create bin directory if it doesn't exist
if not exist "bin" mkdir bin

REM Build the bridge
echo Building bridge...
cd cmd\bridge
go build -o ..\..\bin\bridge.exe main.go
if errorlevel 1 (
    echo Build failed
    pause
    exit /b 1
)

echo Bridge built successfully: bin\bridge.exe
cd ..\.. 