const { ipcRenderer } = require('electron');

// Global state
let config = null;
let bridgeRunning = false;
let stats = {
    filesProcessed: 0,
    notesCreated: 0,
    pendingApprovals: 0
};

// DOM elements
const elements = {
    // Bridge controls
    startBridge: document.getElementById('startBridge'),
    stopBridge: document.getElementById('stopBridge'),
    bridgeStatus: document.getElementById('bridgeStatus'),
    
    // Settings
    settingsBtn: document.getElementById('settingsBtn'),
    settingsModal: document.getElementById('settingsModal'),
    closeSettings: document.getElementById('closeSettings'),
    saveSettings: document.getElementById('saveSettings'),
    cancelSettings: document.getElementById('cancelSettings'),
    
    // Chat
    chatMessages: document.getElementById('chatMessages'),
    chatInput: document.getElementById('chatInput'),
    sendMessage: document.getElementById('sendMessage'),
    clearChat: document.getElementById('clearChat'),
    exportChat: document.getElementById('exportChat'),
    
    // Stats
    filesProcessed: document.getElementById('filesProcessed'),
    notesCreated: document.getElementById('notesCreated'),
    pendingApprovals: document.getElementById('pendingApprovals'),
    
    // Quick actions
    refreshStats: document.getElementById('refreshStats'),
    openVault: document.getElementById('openVault'),
    openDataDir: document.getElementById('openDataDir'),
    
    // Approval queue
    approvalList: document.getElementById('approvalList'),
    recentNotesList: document.getElementById('recentNotesList'),
    
    // Settings form
    dataDirInput: document.getElementById('dataDirInput'),
    vaultDirInput: document.getElementById('vaultDirInput'),
    mindpalApiKey: document.getElementById('mindpalApiKey'),
    agentIdInput: document.getElementById('agentIdInput'),
    autoApprove: document.getElementById('autoApprove'),
    pollInterval: document.getElementById('pollInterval'),
    
    // Browse buttons
    browseDataDir: document.getElementById('browseDataDir'),
    browseVaultDir: document.getElementById('browseVaultDir')
};

// Initialize the application
async function init() {
    try {
        // Load configuration
        config = await ipcRenderer.invoke('get-config');
        if (config) {
            updateUIFromConfig();
        }
        
        // Set up event listeners
        setupEventListeners();
        
        // Set up IPC listeners
        setupIPCListeners();
        
        console.log('ScreenPipe Assistant UI initialized');
    } catch (error) {
        console.error('Failed to initialize UI:', error);
        addSystemMessage('Failed to initialize UI: ' + error.message, 'error');
    }
}

// Set up event listeners
function setupEventListeners() {
    // Bridge controls
    elements.startBridge.addEventListener('click', startBridge);
    elements.stopBridge.addEventListener('click', stopBridge);
    
    // Settings
    elements.settingsBtn.addEventListener('click', openSettings);
    elements.closeSettings.addEventListener('click', closeSettings);
    elements.saveSettings.addEventListener('click', saveSettings);
    elements.cancelSettings.addEventListener('click', closeSettings);
    
    // Chat
    elements.sendMessage.addEventListener('click', sendChatMessage);
    elements.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });
    elements.clearChat.addEventListener('click', clearChat);
    elements.exportChat.addEventListener('click', exportChat);
    
    // Quick actions
    elements.refreshStats.addEventListener('click', refreshStats);
    elements.openVault.addEventListener('click', openVault);
    elements.openDataDir.addEventListener('click', openDataDir);
    
    // Browse buttons
    elements.browseDataDir.addEventListener('click', () => browseDirectory('dataDirInput'));
    elements.browseVaultDir.addEventListener('click', () => browseDirectory('vaultDirInput'));
    
    // Modal backdrop click
    elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) {
            closeSettings();
        }
    });
}

// Set up IPC listeners
function setupIPCListeners() {
    // Bridge output
    ipcRenderer.on('bridge-output', (event, data) => {
        addSystemMessage(data, 'info');
        updateStatsFromOutput(data);
    });
    
    // Bridge errors
    ipcRenderer.on('bridge-error', (event, data) => {
        addSystemMessage(data, 'error');
    });
    
    // Bridge closed
    ipcRenderer.on('bridge-closed', (event, code) => {
        setBridgeStatus(false);
        addSystemMessage(`Bridge stopped with code: ${code}`, 'info');
    });
}

// Bridge control functions
async function startBridge() {
    try {
        const result = await ipcRenderer.invoke('start-bridge');
        if (result.success) {
            setBridgeStatus(true);
            addSystemMessage('Bridge started successfully', 'info');
        } else {
            addSystemMessage('Failed to start bridge: ' + result.error, 'error');
        }
    } catch (error) {
        addSystemMessage('Error starting bridge: ' + error.message, 'error');
    }
}

async function stopBridge() {
    try {
        const result = await ipcRenderer.invoke('stop-bridge');
        if (result.success) {
            setBridgeStatus(false);
            addSystemMessage('Bridge stopped', 'info');
        } else {
            addSystemMessage('Failed to stop bridge: ' + result.error, 'error');
        }
    } catch (error) {
        addSystemMessage('Error stopping bridge: ' + error.message, 'error');
    }
}

function setBridgeStatus(running) {
    bridgeRunning = running;
    elements.startBridge.disabled = running;
    elements.stopBridge.disabled = !running;
    elements.bridgeStatus.textContent = running ? 'Online' : 'Offline';
    elements.bridgeStatus.className = running ? 'status-online' : 'status-offline';
}

// Settings functions
function openSettings() {
    elements.settingsModal.style.display = 'block';
}

function closeSettings() {
    elements.settingsModal.style.display = 'none';
}

async function saveSettings() {
    try {
        const newConfig = {
            screenpipe: {
                data_dir: elements.dataDirInput.value,
                poll_interval: parseInt(elements.pollInterval.value)
            },
            mindpal: {
                base_url: config.mindpal.base_url,
                api_key: elements.mindpalApiKey.value,
                agent_id: elements.agentIdInput.value,
                chatbot_url: config.mindpal.chatbot_url,
                chatbot_id: config.mindpal.chatbot_id
            },
            obsidian: {
                vault_dir: elements.vaultDirInput.value,
                template_path: config.obsidian.template_path
            },
            ui: config.ui,
            features: {
                ...config.features,
                auto_approve: elements.autoApprove.checked
            },
            deerflow: config.deerflow,
            vercel: config.vercel,
            future_features: config.future_features
        };
        
        const result = await ipcRenderer.invoke('save-config', newConfig);
        if (result.success) {
            config = newConfig;
            updateUIFromConfig();
            closeSettings();
            addSystemMessage('Settings saved successfully', 'info');
        } else {
            addSystemMessage('Failed to save settings: ' + result.error, 'error');
        }
    } catch (error) {
        addSystemMessage('Error saving settings: ' + error.message, 'error');
    }
}

function updateUIFromConfig() {
    if (!config) return;
    
    // Update display elements
    elements.dataDir.textContent = config.screenpipe.data_dir;
    elements.vaultDir.textContent = config.obsidian.vault_dir;
    elements.agentId.textContent = config.mindpal.agent_id;
    
    // Update settings form
    elements.dataDirInput.value = config.screenpipe.data_dir;
    elements.vaultDirInput.value = config.obsidian.vault_dir;
    elements.mindpalApiKey.value = config.mindpal.api_key;
    elements.agentIdInput.value = config.mindpal.agent_id;
    elements.autoApprove.checked = config.features.auto_approve;
    elements.pollInterval.value = config.screenpipe.poll_interval;
}

// Chat functions
function sendChatMessage() {
    const message = elements.chatInput.value.trim();
    if (!message) return;
    
    addMessage(message, 'user');
    elements.chatInput.value = '';
    
    // TODO: Send message to Mindpal API
    // For now, simulate a response
    setTimeout(() => {
        addMessage('This is a simulated response from Mindpal. In the full implementation, this would be the actual response from your Mindpal agent.', 'assistant');
    }, 1000);
}

function addMessage(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = content;
    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

function addSystemMessage(content, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-system`;
    messageDiv.textContent = `[${type.toUpperCase()}] ${content}`;
    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

function clearChat() {
    elements.chatMessages.innerHTML = `
        <div class="welcome-message">
            <h4>Welcome to ScreenPipe Assistant!</h4>
            <p>Start the bridge to begin processing ScreenPipe captures through Mindpal.</p>
            <p>Your Mindpal agent is configured at: <a href="https://chatbot.getmindpal.com/screenpipe-bridge-assistant" target="_blank">screenpipe-bridge-assistant</a></p>
        </div>
    `;
}

function exportChat() {
    const messages = Array.from(elements.chatMessages.children)
        .filter(el => el.classList.contains('message'))
        .map(el => `${el.classList.contains('message-user') ? 'User' : 'Assistant'}: ${el.textContent}`)
        .join('\n\n');
    
    const blob = new Blob([messages], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `screenpipe-chat-${new Date().toISOString().slice(0, 19)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Quick action functions
function refreshStats() {
    // TODO: Implement actual stats refresh
    addSystemMessage('Stats refreshed', 'info');
}

function openVault() {
    // TODO: Implement opening Obsidian vault
    addSystemMessage('Opening Obsidian vault...', 'info');
}

function openDataDir() {
    // TODO: Implement opening data directory
    addSystemMessage('Opening ScreenPipe data directory...', 'info');
}

// Utility functions
async function browseDirectory(inputId) {
    try {
        const path = await ipcRenderer.invoke('select-directory');
        if (path) {
            elements[inputId].value = path;
        }
    } catch (error) {
        addSystemMessage('Error browsing directory: ' + error.message, 'error');
    }
}

function updateStatsFromOutput(output) {
    // Parse bridge output to update stats
    if (output.includes('Files Processed:')) {
        const match = output.match(/Files Processed: (\d+)/);
        if (match) {
            stats.filesProcessed = parseInt(match[1]);
            elements.filesProcessed.textContent = stats.filesProcessed;
        }
    }
    
    if (output.includes('Notes Created:')) {
        const match = output.match(/Notes Created: (\d+)/);
        if (match) {
            stats.notesCreated = parseInt(match[1]);
            elements.notesCreated.textContent = stats.notesCreated;
        }
    }
    
    if (output.includes('Pending Approval:')) {
        const match = output.match(/Pending Approval: (\d+)/);
        if (match) {
            stats.pendingApprovals = parseInt(match[1]);
            elements.pendingApprovals.textContent = stats.pendingApprovals;
        }
    }
}

// TODO: Future feature stubs
function setupHotkeyCommandBar() {
    // TODO: Implement hotkey command bar
    console.log('Hotkey command bar not yet implemented');
}

function setupVoiceCommandTriggers() {
    // TODO: Implement voice command triggers
    console.log('Voice command triggers not yet implemented');
}

function setupDeerflowWebhookTriggers() {
    // TODO: Implement Deerflow webhook triggers
    console.log('Deerflow webhook triggers not yet implemented');
}

function setupVercelDashboardHooks() {
    // TODO: Implement Vercel dashboard hooks
    console.log('Vercel dashboard hooks not yet implemented');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 