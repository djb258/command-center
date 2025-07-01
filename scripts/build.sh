#!/bin/bash

# ScreenPipe Assistant Bridge Build Script

set -e

echo "========================================"
echo "ScreenPipe Assistant Bridge Build Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Go is installed
if ! command -v go &> /dev/null; then
    print_error "Go is not installed. Please install Go 1.21+ from https://golang.org/dl/"
    exit 1
fi

print_status "Go version: $(go version)"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_warning "Node.js is not installed. UI will not be built."
    print_warning "Please install Node.js 18+ from https://nodejs.org/"
    BUILD_UI=false
else
    print_status "Node.js version: $(node --version)"
    BUILD_UI=true
fi

# Create necessary directories
print_status "Creating build directories..."
mkdir -p bin
mkdir -p logs
mkdir -p ui/dist

# Build Go bridge
print_status "Building Go bridge application..."
if go build -o bin/bridge cmd/bridge/main.go; then
    print_status "Go bridge built successfully"
else
    print_error "Failed to build Go bridge"
    exit 1
fi

# Build UI if Node.js is available
if [ "$BUILD_UI" = true ]; then
    if [ -d "ui" ]; then
        print_status "Building UI..."
        cd ui
        
        # Install dependencies if node_modules doesn't exist
        if [ ! -d "node_modules" ]; then
            print_status "Installing UI dependencies..."
            npm install
        fi
        
        # Build UI
        if npm run build; then
            print_status "UI built successfully"
        else
            print_error "Failed to build UI"
            exit 1
        fi
        
        cd ..
    else
        print_warning "UI directory not found, skipping UI build"
    fi
fi

# Create distribution package
print_status "Creating distribution package..."
DIST_DIR="dist/screenpipe-assistant-bridge-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DIST_DIR"

# Copy files to distribution directory
cp -r bin "$DIST_DIR/"
cp -r templates "$DIST_DIR/"
cp -r configs "$DIST_DIR/"
cp template.env "$DIST_DIR/"
cp run-session.bat "$DIST_DIR/"
cp README.md "$DIST_DIR/"

# Copy UI if built
if [ "$BUILD_UI" = true ] && [ -d "ui/dist" ]; then
    cp -r ui/dist "$DIST_DIR/ui/"
fi

# Create run script for Unix systems
cat > "$DIST_DIR/run-session.sh" << 'EOF'
#!/bin/bash

# ScreenPipe Assistant Bridge Launcher (Unix)

echo "========================================"
echo "ScreenPipe Assistant Bridge Launcher"
echo "========================================"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp template.env .env
    echo ""
    echo "Please edit .env file with your API keys and paths before running again."
    echo ""
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check required environment variables
if [ -z "$OPENAI_API_KEY" ]; then
    echo "ERROR: OPENAI_API_KEY is not set in .env file"
    echo "Please add your OpenAI API key to the .env file"
    exit 1
fi

if [ -z "$SCREENPIPE_DATA_DIR" ]; then
    echo "ERROR: SCREENPIPE_DATA_DIR is not set in .env file"
    exit 1
fi

# Start the bridge
echo ""
echo "Starting ScreenPipe Assistant Bridge..."
echo "Bridge will be available at: http://$UI_HOST:$BRIDGE_PORT"
echo ""
echo "Press Ctrl+C to stop the bridge"
echo ""

./bin/bridge
EOF

chmod +x "$DIST_DIR/run-session.sh"

print_status "Distribution package created: $DIST_DIR"

# Create a simple install script
cat > "$DIST_DIR/install.sh" << 'EOF'
#!/bin/bash

# Simple installation script

echo "Installing ScreenPipe Assistant Bridge..."

# Copy to user's home directory
INSTALL_DIR="$HOME/screenpipe-assistant-bridge"
mkdir -p "$INSTALL_DIR"
cp -r * "$INSTALL_DIR/"

echo "Installation complete!"
echo "Bridge installed at: $INSTALL_DIR"
echo ""
echo "To start the bridge:"
echo "  cd $INSTALL_DIR"
echo "  ./run-session.sh"
EOF

chmod +x "$DIST_DIR/install.sh"

print_status "Build completed successfully!"
print_status "Distribution package: $DIST_DIR"
print_status ""
print_status "To run the bridge:"
print_status "  cd $DIST_DIR"
print_status "  ./run-session.sh (Unix) or run-session.bat (Windows)" 