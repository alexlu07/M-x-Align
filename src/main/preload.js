const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');

contextBridge.exposeInMainWorld('electronAPI', {
  getFileData: (filePath) => {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) return reject(err);
        // Return file buffer and name
        resolve({
          buffer: data.buffer,
          name: require('path').basename(filePath),
          type: 'application/octet-stream' // Optionally detect MIME type
        });
      });
    });
  }
});