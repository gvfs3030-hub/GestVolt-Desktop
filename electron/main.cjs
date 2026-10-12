const { app, BrowserWindow, dialog, ipcMain, safeStorage, shell, session } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');

let mainWindow = null;
const chosenImportPaths = new Set();
const exportedPaths = new Set();
const DB_HEADER_ENCRYPTED = 'GVDBENC1\n';
const DB_HEADER_PLAIN = 'GVDBPLAIN1\n';

function dataDirectory() {
  return path.join(app.getPath('userData'), 'GestVolt');
}
function databasePath() {
  return path.join(dataDirectory(), 'gestvolt-desktop.db');
}
function exportDirectory() {
  return path.join(app.getPath('documents'), 'GestVolt');
}
async function ensureDirectories() {
  await fs.mkdir(dataDirectory(), { recursive: true });
  await fs.mkdir(exportDirectory(), { recursive: true });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 1020,
    minHeight: 720,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#16051f',
    title: 'GestVolt — Gestão inteligente. Resultados reais.',
    icon: path.join(__dirname, '..', 'assets', 'gestvolt.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  mainWindow.once('ready-to-show', () => mainWindow && mainWindow.show());
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.on('closed', () => { mainWindow = null; });

  if (!app.isPackaged) {
    await mainWindow.loadURL('http://127.0.0.1:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // Register before loading local content so no external request can slip through at startup.
    session.defaultSession.webRequest.onBeforeRequest({ urls: ['http://*/*', 'https://*/*', 'ws://*/*', 'wss://*/*'] }, (_details, callback) => callback({ cancel: true }));
    await mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(async () => {
  await ensureDirectories();
  await createWindow();
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) await createWindow();
  });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

ipcMain.handle('gestvolt:load-sql-wasm', async () => {
  const wasmPath = app.isPackaged
    ? path.join(app.getAppPath(), 'dist', 'sql-wasm.wasm')
    : path.join(app.getAppPath(), 'public', 'sql-wasm.wasm');
  const wasm = await fs.readFile(wasmPath);
  return wasm.buffer.slice(wasm.byteOffset, wasm.byteOffset + wasm.byteLength);
});

ipcMain.handle('gestvolt:load-database', async () => {
  const filePath = databasePath();
  try {
    const data = await fs.readFile(filePath, 'utf8');
    if (data.startsWith(DB_HEADER_ENCRYPTED)) {
      if (!safeStorage.isEncryptionAvailable()) throw new Error('O sistema não disponibilizou a chave protegida para abrir o banco GestVolt.');
      const encrypted = Buffer.from(data.slice(DB_HEADER_ENCRYPTED.length), 'base64');
      const databaseBase64 = safeStorage.decryptString(encrypted);
      const bytes = Buffer.from(databaseBase64, 'base64');
      return { bytes: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), encryptionAvailable: true, location: filePath };
    }
    if (data.startsWith(DB_HEADER_PLAIN)) {
      const bytes = Buffer.from(data.slice(DB_HEADER_PLAIN.length), 'base64');
      return { bytes: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), encryptionAvailable: false, location: filePath };
    }
    throw new Error('O arquivo local do banco de dados tem um formato desconhecido. Faça uma cópia dele antes de tentar recuperá-lo.');
  } catch (error) {
    if (error && error.code === 'ENOENT') return { bytes: null, encryptionAvailable: safeStorage.isEncryptionAvailable(), location: filePath };
    throw error;
  }
});

ipcMain.handle('gestvolt:save-database', async (_event, bytes) => {
  await ensureDirectories();
  const databaseBase64 = Buffer.from(bytes).toString('base64');
  let payload;
  const encryptionAvailable = safeStorage.isEncryptionAvailable();
  if (encryptionAvailable) {
    const encrypted = safeStorage.encryptString(databaseBase64);
    payload = DB_HEADER_ENCRYPTED + encrypted.toString('base64');
  } else {
    payload = DB_HEADER_PLAIN + databaseBase64;
  }
  const finalPath = databasePath();
  const temporaryPath = `${finalPath}.tmp`;
  await fs.writeFile(temporaryPath, payload, 'utf8');
  await fs.rename(temporaryPath, finalPath);
  return { encryptionAvailable };
});

ipcMain.handle('gestvolt:write-export', async (_event, filename, contents) => {
  await ensureDirectories();
  const safeName = path.basename(String(filename || 'gestvolt-export.txt')).replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').slice(0, 180) || 'gestvolt-export.txt';
  const ext = path.extname(safeName);
  const stem = path.basename(safeName, ext);
  let finalName = safeName;
  let filePath = path.join(exportDirectory(), finalName);
  let suffix = 2;
  while (await fs.stat(filePath).then(() => true).catch(() => false)) {
    finalName = `${stem} (${suffix++})${ext}`;
    filePath = path.join(exportDirectory(), finalName);
  }
  await fs.writeFile(filePath, String(contents), 'utf8');
  exportedPaths.add(filePath);
  return { path: filePath };
});

ipcMain.handle('gestvolt:choose-import-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Importar backup do GestVolt',
    properties: ['openFile'],
    filters: [{ name: 'Backup GestVolt (JSON)', extensions: ['json'] }],
  });
  if (result.canceled || !result.filePaths[0]) return { canceled: true };
  const filePath = result.filePaths[0];
  chosenImportPaths.add(filePath);
  return { canceled: false, path: filePath, name: path.basename(filePath) };
});

ipcMain.handle('gestvolt:read-text-file', async (_event, filePathValue) => {
  const filePath = path.resolve(String(filePathValue));
  if (!chosenImportPaths.has(filePath) && !exportedPaths.has(filePath)) {
    throw new Error('Por segurança, só é possível ler arquivos escolhidos pelo seletor de importação do GestVolt.');
  }
  return fs.readFile(filePath, 'utf8');
});

ipcMain.handle('gestvolt:reveal-file', async (_event, filePathValue) => {
  const filePath = path.resolve(String(filePathValue));
  const allowed = filePath.startsWith(path.resolve(exportDirectory()) + path.sep) && exportedPaths.has(filePath);
  if (!allowed) throw new Error('Este arquivo não foi criado pelo GestVolt nesta sessão.');
  shell.showItemInFolder(filePath);
});

ipcMain.handle('gestvolt:show-message', async (_event, title, message) => {
  await dialog.showMessageBox(mainWindow, { type: 'info', title: String(title), message: String(message), buttons: ['OK'] });
});

ipcMain.handle('gestvolt:storage-info', async () => ({ encryptionAvailable: safeStorage.isEncryptionAvailable(), dataDirectory: dataDirectory() }));
