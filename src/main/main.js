const { app, BrowserWindow } = require('electron')
const path = require('path')

let mainWindow;

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1440,
        height: 960,
        webPreferences: {
            preload: path.join(__dirname, '/preload.js')
        }
    })
  
    win.loadFile('src/renderer/pages/home/index.html')
}

app.on('ready', () => {
    createWindow()
  
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})