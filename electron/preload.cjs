const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('gestvolt', {
  loadDatabase: () => ipcRenderer.invoke('gestvolt:load-database'),
  loadSqlWasm: () => ipcRenderer.invoke('gestvolt:load-sql-wasm'),
  saveDatabase: (bytes) => ipcRenderer.invoke('gestvolt:save-database', bytes),
  writeExport: (filename, contents) => ipcRenderer.invoke('gestvolt:write-export', filename, contents),
  readTextFile: (filePath) => ipcRenderer.invoke('gestvolt:read-text-file', filePath),
  chooseImportFile: () => ipcRenderer.invoke('gestvolt:choose-import-file'),
  revealFile: (filePath) => ipcRenderer.invoke('gestvolt:reveal-file', filePath),
  showMessage: (title, message) => ipcRenderer.invoke('gestvolt:show-message', title, message),
  getStorageInfo: () => ipcRenderer.invoke('gestvolt:storage-info'),
});
