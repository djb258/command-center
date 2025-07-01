# ScreenPipe → Mindpal → Obsidian Assistant

A powerful bridge system that monitors ScreenPipe captures, processes them through Mindpal AI (with Gemini 2.5 LLM orchestration), and creates structured Obsidian notes with interactive approval workflow.

## 🚀 Features

- **Real-time Monitoring**: Watches ScreenPipe data directory for new captures
- **AI Processing**: Routes captures through Mindpal with Gemini 2.5 LLM orchestration
- **Interactive UI**: Electron-based interface for approval, editing, and follow-up prompts
- **Obsidian Integration**: Writes approved notes to your Obsidian vault
- **Cross-platform**: Works on Windows, Mac, and Linux
- **Future-ready**: Stubs for hotkeys, voice commands, webhooks, and dashboard integration

## 📋 Prerequisites

- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **ScreenPipe** installed and configured
- **Obsidian** vault set up
- **Mindpal** account with API key and agent configured

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/screenpipe-mindpal-bridge.git
cd screenpipe-mindpal-bridge
```

### 2. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 3. Install UI Dependencies

```bash
cd ui
npm install
cd ..
```

### 4. Configure the System

```bash
# Copy the example config
cp config.yaml.example config.yaml

# Edit the config with your settings
# Use your preferred editor (VS Code, nano, vim, etc.)
code config.yaml
```

### 5. Update Configuration

Edit `config.yaml` with your specific settings:

```yaml
screenpipe:
  data_dir: ~/.screenpipe/data # Your ScreenPipe data directory
  poll_interval: 10

mindpal:
  base_url: https://api.mindpal.com
  api_key: your-actual-mindpal-api-key
  agent_id: your-mindpal-agent-id
  chatbot_url: https://chatbot.getmindpal.com/your-chatbot-id
  chatbot_id: your-chatbot-id

obsidian:
  vault_dir: ~/Documents/Obsidian Vault # Your Obsidian vault path
  template_path: templates/note_template.md

features:
  auto_approve: false # Set to true for automatic note creation
```

## 🎯 Usage

### Quick Start

1. **Start the UI** (in one terminal):

   ```bash
   cd ui
   npm start
   ```

2. **Start the Bridge** (in another terminal):

   ```bash
   python mindpal_bridge.py
   ```

3. **Create a Test Capture**:
   - Add a `.txt` file to your ScreenPipe data directory, or
   - Let ScreenPipe generate a new capture

4. **Approve in UI**:
   - The bridge will detect new files and send them to Mindpal
   - Review the processed output in the UI
   - Approve, edit, or reject before writing to Obsidian

### Testing

Run the test scripts to verify your setup:

```bash
# Test local bridge functionality
python test_bridge_local.py

# Test Mindpal API connection
python test_mindpal_connection.py

# Test with mock responses
python test_bridge_mock.py
```

## 🏗️ Architecture

```
ScreenPipe Data → Python Bridge → Mindpal API → Interactive UI → Obsidian Vault
     ↓              ↓              ↓              ↓              ↓
  Captures     File Monitor    AI Processing   Approval     Structured Notes
```

### Components

- **`mindpal_bridge.py`**: Main Python bridge that monitors files and processes through Mindpal
- **`ui/`**: Electron application providing interactive chat and approval interface
- **`config.yaml`**: Centralized configuration for all paths, API keys, and settings
- **Test scripts**: Verify functionality and troubleshoot issues

## 🔧 Configuration

### ScreenPipe Settings

- `data_dir`: Directory where ScreenPipe saves captures
- `poll_interval`: How often to check for new files (seconds)

### Mindpal Settings

- `api_key`: Your Mindpal API key
- `agent_id`: Your Mindpal agent ID
- `chatbot_url`: Your Mindpal chatbot URL
- `chatbot_id`: Your Mindpal chatbot ID

### Obsidian Settings

- `vault_dir`: Path to your Obsidian vault
- `template_path`: Template for note creation

### UI Settings

- `port`: Port for the Electron UI
- `host`: Host for the Electron UI
- `title`: Window title

### Features

- `auto_approve`: Automatically write notes without approval
- `hotkeys_enabled`: Enable hotkey support (future)
- `voice_commands_enabled`: Enable voice commands (future)

## 🔮 Future Features

The system includes stubs for future enhancements:

- **Hotkey Command Bar**: Quick access to common actions
- **Voice Command Triggers**: Voice-activated processing
- **Deerflow Webhook Triggers**: Integration with Deerflow automation
- **Vercel Dashboard Hooks**: Remote monitoring and control

## 🐛 Troubleshooting

### Common Issues

1. **ScreenPipe Data Directory Not Found**
   - Ensure ScreenPipe is running
   - Check the `data_dir` path in `config.yaml`

2. **Mindpal API Connection Failed**
   - Verify your API key and agent ID
   - Check internet connection
   - Ensure Mindpal service is available

3. **Obsidian Vault Not Found**
   - Create the vault directory if it doesn't exist
   - Check the `vault_dir` path in `config.yaml`

4. **UI Won't Start**
   - Ensure Node.js and npm are installed
   - Run `npm install` in the `ui/` directory
   - Check for port conflicts

### Debug Mode

Enable detailed logging by editing the Python scripts and setting:

```python
logging.basicConfig(level=logging.DEBUG)
```

### Logs

- Bridge logs: `screenpipe_bridge.log`
- UI logs: Check the Electron console (Ctrl+Shift+I)

## 📁 Project Structure

```
screenpipe-mindpal-bridge/
├── mindpal_bridge.py          # Main bridge application
├── test_bridge_local.py       # Local functionality test
├── test_mindpal_connection.py # API connection test
├── test_bridge_mock.py        # Mock response test
├── config.yaml               # Configuration (not in repo)
├── config.yaml.example       # Example configuration
├── requirements.txt          # Python dependencies
├── README.md                 # This file
├── ui/                       # Electron UI application
│   ├── package.json
│   ├── main.js
│   ├── index.html
│   ├── renderer.js
│   └── styles.css
└── templates/                # Note templates
    └── note_template.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: Create an issue on GitHub
- **Documentation**: Check this README and inline code comments
- **Testing**: Use the provided test scripts to verify functionality

## 🎉 Getting Started Checklist

- [ ] Clone the repository
- [ ] Install Python dependencies (`pip install -r requirements.txt`)
- [ ] Install UI dependencies (`cd ui && npm install`)
- [ ] Copy and configure `config.yaml`
- [ ] Test local functionality (`python test_bridge_local.py`)
- [ ] Start the UI (`cd ui && npm start`)
- [ ] Start the bridge (`python mindpal_bridge.py`)
- [ ] Create a test capture
- [ ] Approve your first note in the UI
- [ ] Check your Obsidian vault for the new note

---

**Happy capturing and organizing! 🚀**
