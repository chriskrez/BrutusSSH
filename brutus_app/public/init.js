const electron = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

const BrowserWindow = electron.BrowserWindow;

const app = electron.app;
let mainWindow;

require("../src/api/index.js");

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 880,
    icon: __dirname + "/icon.png",
  });
  mainWindow.webContents.executeJavaScript(`window.port = ${process.env.PORT}`);
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
