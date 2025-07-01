@echo off
echo 🧪 Testing ScreenPipe Obsidian Bridge Configuration...
echo.

:: Add Go to PATH
set PATH=C:\Program Files\Go\bin;%PATH%

:: Build and run config test
echo 🔨 Building test...
go build -o test-config.exe -ldflags "-X main.appName=ConfigTest" cmd/main.go
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Running configuration test...
echo.

:: Test configuration loading
test-config.exe -help
echo.
echo 📋 If you see the help message above, the build is working!
echo.
echo 🔧 To test your actual config:
echo 1. Make sure configs\config.yaml is properly configured
echo 2. Run: test-config.exe (without -help) to test config loading
echo.

pause 