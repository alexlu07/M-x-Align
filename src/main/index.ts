import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import * as models from './models';

let mainWindow: BrowserWindow | null = null;
let deployWindow: BrowserWindow | null = null;

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 960,
    height: 640,
    show: false,
    resizable: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

function createDeployWindow(model: string): void {
  // Create the deploy window.
  deployWindow = new BrowserWindow({
    width: 320,
    height: 160,
    show: false,
    resizable: false,
    transparent: true,
    frame: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  deployWindow.on('ready-to-show', () => {
    deployWindow?.show();
  });

  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    console.log(process.env['ELECTRON_RENDERER_URL'] + '#/deploy?modelId=' + encodeURI(model));
    deployWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#/deploy?modelId=' + encodeURI(model));
  } else {
    deployWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: '#/deploy', query: { model: model } });
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('dev.alexlu07.mxalign');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  ipcMain.handle('listModels', () => {
    return models.listModels();
  });

  ipcMain.handle('deleteModel', (_, model) => {
    return models.deleteModel(model);
  });

  ipcMain.handle('loadFiles', (_, model) => {
    return models.loadFiles(model);
  });

  ipcMain.handle('train', async (_, samples) => {
    const callbacks = {
      onEpochEnd: async (epoch, logs) => {
        mainWindow?.webContents.send('trainProgress', {
          epoch,
          loss: logs.loss,
          accuracy: logs.acc,
          valLoss: logs.val_loss,
          valAccuracy: logs.val_acc,
        });
      },
    };

    mainWindow?.webContents.send('trainComplete', await models.train(samples, callbacks));
  });

  ipcMain.handle('deploy', (_, model) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.close();
      mainWindow = null;
    }

    if (deployWindow && !deployWindow.isDestroyed()) deployWindow.close();

    createDeployWindow(model);
    deployWindow?.webContents.send('deployModel', model);
  });

  ipcMain.handle('closeDeploy', () => {
    if (deployWindow && !deployWindow.isDestroyed()) {
      deployWindow?.close();
      deployWindow = null;
    }

    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.show();
    else createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
