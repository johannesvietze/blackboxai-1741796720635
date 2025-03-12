const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // We can add methods here later if needed for Steam integration
  // Example: saveGame: (data) => ipcRenderer.invoke('save-game', data)
});
