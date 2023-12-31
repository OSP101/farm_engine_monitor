import { app } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
require("v8-compile-cache");
// app.disableHardwareAcceleration();
app.commandLine.appendSwitch("enable-features", "VaapiVideoDecoder");
app.commandLine.appendSwitch("enable-gpu-rasterization");
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow('main', {
    width: 1920,
    height: 1080,
    autoHideMenuBar: true,
    // kiosk: true,
  });

  if (process.platform === "linux") {
    app.commandLine.appendSwitch("enable-features", "VaapiVideoDecoder");
    // This switch is not really for video decoding I enabled for smoother UI
    app.commandLine.appendSwitch("enable-gpu-rasterization");
  }

  mainWindow.webContents.on("crashed", (e) => {
    app.relaunch();
    app.quit();
  });

  if (isProd) {
    mainWindow.kiosk = true
    await mainWindow.loadURL('app://./index.html');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on('window-all-closed', () => {
  app.quit();
});
