# ScreenPipe Assistant Bridge - Setup and Usage Guide

## 🚀 Quick Start

### Prerequisites

1. **Go 1.21+** - [Download here](https://golang.org/dl/)
2. **Node.js 18+** (optional, for UI) - [Download here](https://nodejs.org/)
3. **ScreenPipe v0.2.74+** - [Download here](https://github.com/mediar-ai/screenpipe/releases)
4. **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/screenpipe-assistant-bridge.git
   cd screenpipe-assistant-bridge
   ```

2. **Setup environment:**

   ```bash
   # Windows
   copy template.env .env

   # Unix/Linux/Mac
   cp template.env .env
   ```

3. **Edit `.env` file:**

   ```env
   # Add your OpenAI API key
   OPENAI_API_KEY=sk-your-actual-key-here

   # Update paths to match your system
   SCREENPIPE_DATA_DIR=C:/Users/YourName/.screenpipe/data
   OBSIDIAN_VAULT_PATH=C:/Users/YourName/ObsidianVault
   ```

4. **Build and run:**

   ```bash
   # Windows
   run-session.bat

   # Unix/Linux/Mac
   ./scripts/build.sh
   ./run-session.sh
   ```

## 📋 Detailed Setup

### 1. Environment Configuration

The bridge uses a `.env` file for all configuration. Key settings:

```env
# ScreenPipe Configuration
SCREENPIPE_DATA_DIR=C:/Users/CUSTOM PC/.screenpipe/data
SCREENPIPE_POLL_INTERVAL=5s

# LLM Configuration
LLM_PROVIDER=openai
OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-4-turbo

# Obsidian Configuration
OBSIDIAN_VAULT_PATH=C:/Users/CUSTOM PC/ObsidianVault
OBSIDIAN_FOLDER=ScreenPipe Notes
OBSIDIAN_TAG_PREFIX=screenpipe

# UI Configuration
UI_PORT=3000
BRIDGE_PORT=8080
```

### 2. ScreenPipe Setup

1. **Install ScreenPipe:**
   - Download from [GitHub releases](https://github.com/mediar-ai/screenpipe/releases)
   - Extract to a directory (e.g., `C:\Users\YourName\screenpipe\`)

2. **Start ScreenPipe:**

   ```bash
   # List available monitors
   screenpipe --list-monitors

   # Start recording (replace MONITOR_ID with actual ID)
   screenpipe --monitor-id MONITOR_ID
   ```

3. **Verify data directory:**
   - ScreenPipe saves data to `C:\Users\YourName\.screenpipe\data\`
   - Ensure this path matches `SCREENPIPE_DATA_DIR` in your `.env` file

### 3. Obsidian Setup

1. **Create Obsidian vault:**
   - Open Obsidian
   - Create new vault or use existing
   - Note the vault path

2. **Update configuration:**
   ```env
   OBSIDIAN_VAULT_PATH=C:/Users/YourName/ObsidianVault
   OBSIDIAN_FOLDER=ScreenPipe Notes  # Optional subfolder
   ```

## 🔧 Usage

### Starting the Bridge

1. **Run the launcher:**

   ```bash
   # Windows
   run-session.bat

   # Unix/Linux/Mac
   ./run-session.sh
   ```

2. **Verify startup:**
   - Check console output for "Starting bridge server on port 8080"
   - Open browser to `http://localhost:8080` for UI

### Using the UI

1. **Access the interface:**
   - Open `http://localhost:8080` in your browser
   - You should see the bridge status and processing results

2. **Monitor processing:**
   - The UI shows real-time processing results
   - Each result includes summary, action items, and compliance notes
   - Use Approve/Edit/Reject buttons to control note creation

3. **View generated notes:**
   - Check your Obsidian vault for new notes
   - Notes are tagged with `#screenpipe` and content type

### Command Line Usage

The bridge can also run without UI:

```bash
# Build and run directly
go build -o bin/bridge cmd/bridge/main.go
./bin/bridge
```

## 🔍 Troubleshooting

### Common Issues

1. **"OpenAI API key is required"**
   - Ensure your `.env` file contains a valid OpenAI API key
   - Key should start with `sk-`

2. **"Failed to create data directory"**
   - Check file permissions
   - Ensure the path in `SCREENPIPE_DATA_DIR` is valid

3. **"No processing results"**
   - Verify ScreenPipe is running and creating files
   - Check the data directory for `.mp4`, `.wav`, or `.txt` files
   - Ensure file patterns match in configuration

4. **"WebSocket connection failed"**
   - Check if bridge is running on port 8080
   - Verify firewall settings
   - Try refreshing the browser

### Debug Mode

Enable debug logging:

```env
LOG_LEVEL=debug
ENABLE_DEBUG_MODE=true
```

### Logs

Check logs in the `logs/` directory:

- `bridge.log` - Main application logs
- Console output - Real-time status

## 🚀 Advanced Configuration

### Custom Note Templates

Create custom templates in `templates/note_template.md`:

```markdown
# {{.Title}}

**Generated:** {{.Timestamp.Format "2006-01-02 15:04:05"}}

## Summary

{{.Summary}}

## Action Items

{{range .ActionItems}}

- [ ] {{.}}
      {{end}}

## Custom Section

Add your custom content here...
```

### Multiple LLM Providers

The bridge supports multiple LLM providers (Phase 2+):

```env
# Switch providers
LLM_PROVIDER=claude  # openai, claude, grok, gemini, mindpal

# Provider-specific settings
CLAUDE_API_KEY=your_claude_key
CLAUDE_MODEL=claude-3-sonnet-20240229
```

### Processing Configuration

Fine-tune processing behavior:

```env
# Processing settings
PROCESSING_BATCH_SIZE=5
PROCESSING_TIMEOUT=30s
ENABLE_AUDIO_PROCESSING=true
ENABLE_VIDEO_PROCESSING=true
ENABLE_TEXT_PROCESSING=true
```

## 🔮 Future Features

### Phase 2: Enhanced Interaction

- [ ] Global hotkey support (CTRL+ALT+A)
- [ ] Voice command triggers
- [ ] Context-aware processing

### Phase 3: Multi-LLM Intelligence

- [ ] Multiple LLM routing
- [ ] Output comparison
- [ ] Model selection per task

### Phase 4: Orchestration

- [ ] Deerflow integration
- [ ] Remote dashboard
- [ ] Team collaboration

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/your-username/screenpipe-assistant-bridge/issues)
- **Documentation:** [Project Wiki](https://github.com/your-username/screenpipe-assistant-bridge/wiki)
- **Discussions:** [GitHub Discussions](https://github.com/your-username/screenpipe-assistant-bridge/discussions)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
