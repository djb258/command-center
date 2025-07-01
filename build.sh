#!/bin/bash

echo "ScreenPipe Bridge Builder"
echo "========================"

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed or not in PATH"
    echo ""
    echo "To install Go on Windows:"
    echo "1. Download from: https://golang.org/dl/"
    echo "2. Run the installer"
    echo "3. Restart your terminal"
    echo ""
    echo "Or use Chocolatey: choco install golang"
    echo "Or use Scoop: scoop install go"
    exit 1
fi

echo "✅ Go found: $(go version)"

# Check if OPENAI_API_KEY is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY environment variable not set"
    echo "Please set it before running the bridge:"
    echo "export OPENAI_API_KEY='your-api-key-here'"
    echo ""
fi

# Create bin directory if it doesn't exist
mkdir -p bin

# Build the bridge
echo "🔨 Building bridge..."
cd cmd/bridge
if go build -o ../../bin/bridge.exe main.go; then
    echo "✅ Bridge built successfully: bin/bridge.exe"
    echo ""
    echo "To run the bridge:"
    echo "cd bin"
    echo "./bridge.exe"
    echo ""
    echo "Or from the project root:"
    echo "./bin/bridge.exe"
else
    echo "❌ Build failed"
    exit 1
fi

# Set your OpenAI API key
export OPENAI_API_KEY="your-api-key-here"

# Build and run
./build.sh
./bin/bridge.exe 
# Set your OpenAI API key
export OPENAI_API_KEY="your-api-key-here"

# Build and run
./build.sh
./bin/bridge.exe
