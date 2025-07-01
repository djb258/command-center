const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const yaml = require('yaml');

let mainWindow;
let bridgeProcess = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    title: 'ScreenPipe Assistant',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open DevTools in development
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

// IPC handlers for bridge communication
ipcMain.handle('get-config', async () => {
  try {
    const configPath = path.join(__dirname, '..', 'config.yaml');
    const configContent = fs.readFileSync(configPath, 'utf8');
    return yaml.parse(configContent);
  } catch (error) {
    console.error('Error loading config:', error);
    return null;
  }
});

ipcMain.handle('save-config', async (event, config) => {
  try {
    const configPath = path.join(__dirname, '..', 'config.yaml');
    const configContent = yaml.stringify(config);
    fs.writeFileSync(configPath, configContent);
    return { success: true };
  } catch (error) {
    console.error('Error saving config:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('start-bridge', async () => {
  try {
    const { spawn } = require('child_process');
    const bridgePath = path.join(__dirname, '..', 'mindpal_bridge.py');
    
    bridgeProcess = spawn('python', [bridgePath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    bridgeProcess.stdout.on('data', (data) => {
      mainWindow.webContents.send('bridge-output', data.toString());
    });

    bridgeProcess.stderr.on('data', (data) => {
      mainWindow.webContents.send('bridge-error', data.toString());
    });

    bridgeProcess.on('close', (code) => {
      mainWindow.webContents.send('bridge-closed', code);
      bridgeProcess = null;
    });

    return { success: true };
  } catch (error) {
    console.error('Error starting bridge:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('stop-bridge', async () => {
  try {
    if (bridgeProcess) {
      bridgeProcess.kill();
      bridgeProcess = null;
    }
    return { success: true };
  } catch (error) {
    console.error('Error stopping bridge:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (bridgeProcess) {
    bridgeProcess.kill();
  }
}); 