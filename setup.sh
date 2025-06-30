#!/bin/bash

# Cursor Blueprint Enforcer Setup Script
# This script helps set up the project environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Check if Node.js is installed
check_nodejs() {
    print_header "Checking Node.js Installation"
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js is installed: $NODE_VERSION"
        
        if command -v npm &> /dev/null; then
            NPM_VERSION=$(npm --version)
            print_status "npm is installed: $NPM_VERSION"
        else
            print_error "npm is not installed"
            exit 1
        fi
    else
        print_error "Node.js is not installed"
        print_warning "Please install Node.js from https://nodejs.org/"
        print_warning "Or use a package manager:"
        print_warning "  Windows: choco install nodejs"
        print_warning "  macOS: brew install node"
        print_warning "  Linux: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    if [ -f "package.json" ]; then
        print_status "Installing npm dependencies..."
        npm install
        print_status "Dependencies installed successfully"
    else
        print_error "package.json not found"
        exit 1
    fi
}

# Set up environment file
setup_environment() {
    print_header "Setting Up Environment"
    
    if [ -f "env.template" ]; then
        if [ ! -f ".env" ]; then
            print_status "Creating .env file from template..."
            cp env.template .env
            print_status ".env file created"
            print_warning "Please edit .env file with your actual configuration values"
        else
            print_status ".env file already exists"
        fi
    else
        print_warning "env.template not found, skipping environment setup"
    fi
}

# Build the project
build_project() {
    print_header "Building Project"
    
    print_status "Building TypeScript project..."
    npm run build
    print_status "Project built successfully"
}

# Run tests
run_tests() {
    print_header "Running Tests"
    
    print_status "Running test suite..."
    npm test
    print_status "Tests completed"
}

# Make scripts executable
make_executable() {
    print_header "Making Scripts Executable"
    
    if [ -f "scripts/deploy_render.sh" ]; then
        chmod +x scripts/deploy_render.sh
        print_status "Made deploy_render.sh executable"
    fi
    
    if [ -f "setup.sh" ]; then
        chmod +x setup.sh
        print_status "Made setup.sh executable"
    fi
}

# Display next steps
show_next_steps() {
    print_header "Setup Complete!"
    
    echo -e "${GREEN}Your Cursor Blueprint Enforcer is ready to use!${NC}"
    echo
    echo "Next steps:"
    echo "1. Edit the .env file with your actual configuration values"
    echo "2. Configure your Firebase, BigQuery, and Neon credentials"
    echo "3. Run individual scripts:"
    echo "   - npm run dev scripts/bigquery_ingest.ts"
    echo "   - npm run dev scripts/firebase_push.ts"
    echo "   - npm run dev scripts/neon_sync.ts"
    echo "4. Or use the main application: npm run dev src/index.ts"
    echo
    echo "For more information, see the README.md file"
}

# Main setup function
main() {
    print_header "Cursor Blueprint Enforcer Setup"
    
    check_nodejs
    install_dependencies
    setup_environment
    build_project
    make_executable
    
    # Only run tests if they exist
    if [ -f "jest.config.js" ]; then
        run_tests
    else
        print_warning "No test configuration found, skipping tests"
    fi
    
    show_next_steps
}

# Run main function
main "$@" 