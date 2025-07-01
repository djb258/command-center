# ScreenPipe Bridge - Portable Repository Structure

## 📁 Directory Structure

```
screenpipe-bridge/
├── README.md                    # Setup and usage instructions
├── .gitignore                   # Git ignore rules
├── .env.template                # Environment variables template
├── config.yaml.template         # Configuration template
├── run-session.bat              # Windows launcher
├── run-session.sh               # Mac/Linux launcher
├── install-screenpipe.bat       # ScreenPipe installer for Windows
├── install-screenpipe.sh        # ScreenPipe installer for Mac/Linux
├── bridge/                      # Go bridge application
│   ├── cmd/
│   │   └── main.go
│   ├── internal/
│   │   ├── config/
│   │   ├── watcher/
│   │   ├── llm/
│   │   ├── processor/
│   │   └── obsidian/
│   ├── go.mod
│   └── go.sum
├── scripts/                     # Additional utility scripts
│   ├── setup-desktop-shortcut.bat
│   ├── setup-desktop-shortcut.sh
│   └── validate-config.bat
├── docs/                        # Documentation
│   ├── setup-guide.md
│   ├── troubleshooting.md
│   └── api-reference.md
└── assets/                      # Icons and resources
    ├── icon.ico                 # Desktop shortcut icon
    └── icon.png
```

## 🔧 Configuration Files

### .env.template

```bash
# =============================================================================
# SCREENPIPE BRIDGE - ENVIRONMENT CONFIGURATION
# =============================================================================
# Copy this file to .env and fill in your actual values
# Keep .env in .gitignore for security!

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7

# ScreenPipe Configuration
SCREENPIPE_OUTPUT_PATH=C:\Users\%USERNAME%\.screenpipe\data
SCREENPIPE_BIN_PATH=C:\Users\%USERNAME%\screenpipe\bin

# Obsidian Configuration
OBSIDIAN_VAULT_PATH=C:\Users\%USERNAME%\Documents\ObsidianVault
OBSIDIAN_NOTES_SUBDIR=ScreenPipe

# Processing Configuration
BATCH_DELAY=5
MAX_BATCH_SIZE=10
MAX_FILE_SIZE=1048576

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=bridge.log
```

### config.yaml.template

```yaml
# ScreenPipe Bridge Configuration
# Copy this file to config.yaml and customize for your system

# ScreenPipe settings
screenpipe:
  output_path: '${SCREENPIPE_OUTPUT_PATH}'
  watch_patterns:
    - '*.txt'
    - '*.json'
    - '*.md'

# LLM Configuration
llm:
  provider: 'openai'
  endpoint: 'https://api.openai.com/v1'
  api_key: '${OPENAI_API_KEY}'
  model: '${OPENAI_MODEL}'
  max_tokens: ${OPENAI_MAX_TOKENS}
  temperature: ${OPENAI_TEMPERATURE}

# Obsidian vault settings
obsidian:
  vault_path: '${OBSIDIAN_VAULT_PATH}'
  notes_subdirectory: '${OBSIDIAN_NOTES_SUBDIR}'
  note_template: |
    ---
    created: {{.CreatedAt}}
    source: ScreenPipe Bridge
    activity_type: {{.ActivityType}}
    tags: [screenpipe, {{.Tags}}]
    ---

    # {{.Title}}

    {{.Content}}

    ## Tasks
    {{range .Tasks}}
    - [ ] {{.}}
    {{end}}

    ## Notes
    {{.Notes}}

# Processing settings
processing:
  batch_delay: ${BATCH_DELAY}
  max_batch_size: ${MAX_BATCH_SIZE}
  max_file_size: ${MAX_FILE_SIZE}

# Logging
logging:
  level: '${LOG_LEVEL}'
  file: '${LOG_FILE}'
  max_size: 10485760 # 10MB
  max_backups: 5
```

## 🚀 Launcher Scripts

### run-session.bat (Windows)

```batch
@echo off
setlocal enabledelayedexpansion

echo ======================================
echo   ScreenPipe Bridge - Portable Launcher
echo ======================================
echo.

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM Load environment variables from .env file
if exist ".env" (
    echo [INFO] Loading environment variables from .env file...
    for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" (
            set "%%a=%%b"
        )
    )
    echo [OK] Environment variables loaded
) else (
    echo [ERROR] .env file not found!
    echo [ERROR] Please copy .env.template to .env and configure it
    pause
    exit /b 1
)

REM Validate required environment variables
if "%OPENAI_API_KEY%"=="" (
    echo [ERROR] OPENAI_API_KEY not set in .env file
    pause
    exit /b 1
)

if not "%OPENAI_API_KEY:~0,3%"=="sk-" (
    echo [ERROR] Invalid OpenAI API key format
    pause
    exit /b 1
)

REM Expand environment variables in paths
set "SCREENPIPE_OUTPUT_PATH=%SCREENPIPE_OUTPUT_PATH%"
set "SCREENPIPE_BIN_PATH=%SCREENPIPE_BIN_PATH%"
set "OBSIDIAN_VAULT_PATH=%OBSIDIAN_VAULT_PATH%"

echo [INFO] Configuration:
echo [INFO]   ScreenPipe Output: %SCREENPIPE_OUTPUT_PATH%
echo [INFO]   ScreenPipe Binary: %SCREENPIPE_BIN_PATH%
echo [INFO]   Obsidian Vault: %OBSIDIAN_VAULT_PATH%

REM Validate prerequisites
echo.
echo [INFO] Validating prerequisites...

REM Check Go installation
go version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Go not found. Installing Go...
    call install-go.bat
    if errorlevel 1 (
        echo [ERROR] Failed to install Go
        pause
        exit /b 1
    )
)
echo [OK] Go is available

REM Check ScreenPipe installation
if not exist "%SCREENPIPE_BIN_PATH%\screenpipe.exe" (
    echo [INFO] ScreenPipe not found. Installing ScreenPipe...
    call install-screenpipe.bat
    if errorlevel 1 (
        echo [ERROR] Failed to install ScreenPipe
        pause
        exit /b 1
    )
)
echo [OK] ScreenPipe found

REM Create Obsidian vault if needed
if not exist "%OBSIDIAN_VAULT_PATH%" (
    echo [INFO] Creating Obsidian vault...
    mkdir "%OBSIDIAN_VAULT_PATH%"
    echo [OK] Obsidian vault created
) else (
    echo [OK] Obsidian vault exists
)

REM Build bridge application
echo.
echo [INFO] Building bridge application...
cd bridge
go mod tidy
go build -o bridge.exe cmd/main.go
if errorlevel 1 (
    echo [ERROR] Failed to build bridge
    pause
    exit /b 1
)
echo [OK] Bridge built successfully

REM Generate config.yaml from template
echo.
echo [INFO] Generating configuration...
cd ..
if not exist "config.yaml" (
    copy "config.yaml.template" "config.yaml"
    echo [INFO] Created config.yaml from template
)

REM Start the bridge
echo.
echo [INFO] Starting ScreenPipe Bridge...
echo [INFO] Press Ctrl+C to stop
echo.
echo ======================================
echo   Bridge is running...
echo ======================================

cd bridge
bridge.exe

echo.
echo [INFO] Bridge stopped
pause
```

### run-session.sh (Mac/Linux)

```bash
#!/bin/bash

echo "======================================"
echo "  ScreenPipe Bridge - Portable Launcher"
echo "======================================"
echo

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Load environment variables from .env file
if [ -f ".env" ]; then
    echo "[INFO] Loading environment variables from .env file..."
    export $(grep -v '^#' .env | xargs)
    echo "[OK] Environment variables loaded"
else
    echo "[ERROR] .env file not found!"
    echo "[ERROR] Please copy .env.template to .env and configure it"
    exit 1
fi

# Validate required environment variables
if [ -z "$OPENAI_API_KEY" ]; then
    echo "[ERROR] OPENAI_API_KEY not set in .env file"
    exit 1
fi

if [[ ! "$OPENAI_API_KEY" =~ ^sk- ]]; then
    echo "[ERROR] Invalid OpenAI API key format"
    exit 1
fi

# Expand environment variables in paths
SCREENPIPE_OUTPUT_PATH=$(eval echo "$SCREENPIPE_OUTPUT_PATH")
SCREENPIPE_BIN_PATH=$(eval echo "$SCREENPIPE_BIN_PATH")
OBSIDIAN_VAULT_PATH=$(eval echo "$OBSIDIAN_VAULT_PATH")

echo "[INFO] Configuration:"
echo "[INFO]   ScreenPipe Output: $SCREENPIPE_OUTPUT_PATH"
echo "[INFO]   ScreenPipe Binary: $SCREENPIPE_BIN_PATH"
echo "[INFO]   Obsidian Vault: $OBSIDIAN_VAULT_PATH"

# Validate prerequisites
echo
echo "[INFO] Validating prerequisites..."

# Check Go installation
if ! command -v go &> /dev/null; then
    echo "[ERROR] Go not found. Please install Go first:"
    echo "[ERROR]   https://golang.org/dl/"
    exit 1
fi
echo "[OK] Go is available"

# Check ScreenPipe installation
if [ ! -f "$SCREENPIPE_BIN_PATH/screenpipe" ]; then
    echo "[INFO] ScreenPipe not found. Installing ScreenPipe..."
    ./install-screenpipe.sh
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to install ScreenPipe"
        exit 1
    fi
fi
echo "[OK] ScreenPipe found"

# Create Obsidian vault if needed
if [ ! -d "$OBSIDIAN_VAULT_PATH" ]; then
    echo "[INFO] Creating Obsidian vault..."
    mkdir -p "$OBSIDIAN_VAULT_PATH"
    echo "[OK] Obsidian vault created"
else
    echo "[OK] Obsidian vault exists"
fi

# Build bridge application
echo
echo "[INFO] Building bridge application..."
cd bridge
go mod tidy
go build -o bridge cmd/main.go
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to build bridge"
    exit 1
fi
echo "[OK] Bridge built successfully"

# Generate config.yaml from template
echo
echo "[INFO] Generating configuration..."
cd ..
if [ ! -f "config.yaml" ]; then
    cp "config.yaml.template" "config.yaml"
    echo "[INFO] Created config.yaml from template"
fi

# Start the bridge
echo
echo "[INFO] Starting ScreenPipe Bridge..."
echo "[INFO] Press Ctrl+C to stop"
echo
echo "======================================"
echo "  Bridge is running..."
echo "======================================"

cd bridge
./bridge
```

## 📋 README.md Content

````markdown
# ScreenPipe Bridge

A portable bridge application that automatically processes ScreenPipe data and generates intelligent Obsidian notes using OpenAI.

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/screenpipe-bridge.git
cd screenpipe-bridge
```
````

### 2. Configure Environment

```bash
# Copy the template files
cp .env.template .env
cp config.yaml.template config.yaml

# Edit .env with your API keys and paths
notepad .env  # Windows
# or
nano .env     # Mac/Linux
```

### 3. Run the Bridge

```bash
# Windows
./run-session.bat

# Mac/Linux
./run-session.sh
```

## ⚙️ Configuration

### Environment Variables (.env)

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `SCREENPIPE_OUTPUT_PATH`: Where ScreenPipe saves data
- `OBSIDIAN_VAULT_PATH`: Your Obsidian vault location
- `OPENAI_MODEL`: AI model to use (default: gpt-4)

### Configuration File (config.yaml)

- Processing settings
- Note templates
- File patterns to watch
- Logging configuration

## 📁 Directory Structure

```
screenpipe-bridge/
├── bridge/          # Go application source
├── scripts/         # Utility scripts
├── docs/           # Documentation
├── assets/         # Icons and resources
├── .env.template   # Environment template
├── config.yaml.template  # Configuration template
└── run-session.*   # Launcher scripts
```

## 🔧 Setup Instructions

### Prerequisites

- Go 1.19+ (will be auto-installed on Windows)
- ScreenPipe (will be auto-installed)
- OpenAI API key

### Custom Paths

The launcher automatically detects and uses:

- `%USERNAME%` for user-specific paths
- Environment variables for customization
- Relative paths for portability

### Desktop Shortcut

```bash
# Windows
./scripts/setup-desktop-shortcut.bat

# Mac/Linux
./scripts/setup-desktop-shortcut.sh
```

## 🐛 Troubleshooting

### Common Issues

1. **API Key Error**: Ensure your OpenAI API key starts with `sk-`
2. **Path Not Found**: Check that ScreenPipe and Obsidian paths exist
3. **Go Not Found**: The launcher will attempt to install Go automatically

### Logs

- Bridge logs: `bridge/bridge.log`
- Launcher logs: Check console output

## 📚 Documentation

- [Setup Guide](docs/setup-guide.md)
- [Troubleshooting](docs/troubleshooting.md)
- [API Reference](docs/api-reference.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

````

## 🔧 Additional Scripts

### install-screenpipe.bat
```batch
@echo off
echo Installing ScreenPipe...

REM Download and install ScreenPipe
powershell -Command "& { iwr https://github.com/djb258/screenpipe/releases/latest/download/screenpipe-windows-x64.exe -OutFile screenpipe-installer.exe }"
screenpipe-installer.exe /S

echo ScreenPipe installation complete
````

### setup-desktop-shortcut.bat

```batch
@echo off
echo Creating desktop shortcut...

set "SCRIPT_DIR=%~dp0"
set "DESKTOP=%USERPROFILE%\Desktop"
set "SHORTCUT=%DESKTOP%\ScreenPipe Bridge.lnk"

powershell -Command "& { $WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT%'); $Shortcut.TargetPath = '%SCRIPT_DIR%run-session.bat'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.IconLocation = '%SCRIPT_DIR%assets\icon.ico'; $Shortcut.Description = 'ScreenPipe Bridge Launcher'; $Shortcut.Save() }"

echo Desktop shortcut created: %SHORTCUT%
```

This structure provides a completely portable solution that can be cloned and run on any machine with minimal configuration!
