# ScreenPipe Obsidian Bridge

A Go application that monitors ScreenPipe output, processes it through LLMs, and generates Obsidian-compatible markdown notes.

## Project Structure

```
screenpipe-obsidian-bridge/
├── cmd/
│   └── main.go                 # Application entry point
├── internal/
│   ├── config/
│   │   └── config.go          # Configuration management
│   ├── watcher/
│   │   └── watcher.go         # File system watcher for ScreenPipe output
│   ├── llm/
│   │   ├── client.go          # LLM client interface
│   │   └── openai.go          # OpenAI implementation
│   ├── processor/
│   │   └── processor.go       # Main processing orchestrator
│   └── obsidian/
│       └── writer.go          # Obsidian markdown generation
├── configs/
│   └── config.example.yaml    # Example configuration
├── examples/
│   └── generated-note.md      # Example output
├── go.mod
├── go.sum
├── README.md
└── .gitignore
```

## Prerequisites

- Go 1.21 or later
- ScreenPipe installed and running (from https://github.com/djb258/screenpipe)
- Obsidian vault set up
- OpenAI API key or other LLM provider access

## Installation

1. **Install Go** (if not already installed):
   - Download from https://golang.org/dl/
   - Follow installation instructions for your OS

2. **Clone and set up the project**:

   ```bash
   git clone <your-repo-url>
   cd screenpipe-obsidian-bridge
   go mod tidy
   ```

3. **Configure the application**:
   ```bash
   cp configs/config.example.yaml configs/config.yaml
   ```
4. **Edit `configs/config.yaml`** with your settings:
   - Set `screenpipe.output_path` to your ScreenPipe output directory
   - Set `obsidian.vault_path` to your Obsidian vault path
   - Set your OpenAI API key (or set `OPENAI_API_KEY` environment variable)

## Quick Start

```bash
# Build the application
go build -o screenpipe-bridge cmd/main.go

# Run with default config
./screenpipe-bridge

# Or run directly with Go
go run cmd/main.go

# Run with custom config
./screenpipe-bridge -config /path/to/config.yaml
```

## Features

- Monitors ScreenPipe output using native Go file watchers
- Configurable LLM integration (OpenAI by default)
- Generates Obsidian-compatible markdown with frontmatter
- Doctrine compliance checking (extensible)
- Clean architecture for future integrations

## Configuration

See `configs/config.example.yaml` for all available options.

### Key Configuration Sections

- **screenpipe**: Configure ScreenPipe output monitoring
- **llm**: Set up your LLM provider (OpenAI, custom endpoints)
- **obsidian**: Configure Obsidian vault integration
- **processing**: Adjust batch processing and compliance checking
- **logging**: Control logging behavior

## Troubleshooting

### Common Issues

1. **"screenpipe output path does not exist"**
   - Ensure ScreenPipe is installed and running
   - Check the output path in your config matches ScreenPipe's actual output directory

2. **"obsidian vault path does not exist"**
   - Verify the vault path exists and is accessible
   - The app will warn if it doesn't look like an Obsidian vault (missing `.obsidian` folder)

3. **"llm.api_key is required"**
   - Set your API key in the config file or via `OPENAI_API_KEY` environment variable

4. **No files being processed**
   - Check that ScreenPipe is actively creating files matching the watch patterns
   - Look for log messages indicating file events are being detected

### Log Messages

The application provides detailed logging with emojis for easy scanning:

- 🚀 Startup messages
- 📂 File system events
- 🔄 Processing activities
- ✅ Successful operations
- ❌ Errors
- ⚠️ Warnings

## Architecture

The application follows a clean architecture pattern:

- **cmd/**: Application entry point
- **internal/config/**: Configuration management
- **internal/watcher/**: File system monitoring
- **internal/llm/**: LLM client abstractions and implementations
- **internal/processor/**: Main workflow orchestration
- **internal/obsidian/**: Obsidian markdown generation

This structure makes it easy to:

- Add new LLM providers
- Extend doctrine compliance logic
- Integrate with additional tools (like Deerflow)
- Test individual components
