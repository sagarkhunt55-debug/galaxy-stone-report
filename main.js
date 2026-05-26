const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { machineIdSync } = require('node-machine-id');

const SECRET = "GALAXY_STONE_SECRET";

function generateKey(id) {
    return crypto
        .createHash('sha256')
        .update(id + SECRET)
        .digest('hex')
        .substring(0, 20)
        .toUpperCase();
}

const licenseFile = path.join(app.getPath('userData'), 'license.json');

function getSavedLicense() {
    try {
        return JSON.parse(fs.readFileSync(licenseFile));
    } catch {
        return null;
    }
}

function saveLicense(key) {
    fs.writeFileSync(licenseFile, JSON.stringify({ key }));
}

function isValid(key) {
    const deviceId = machineIdSync();
    const correctKey = generateKey(deviceId);
    return key === correctKey;
}

let mainWindow;

function createWindow(showLicense) {

    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    if (showLicense) {
        mainWindow.loadFile('license.html');
    } else {
        mainWindow.loadFile('GALAXY STONE REPORT.html');
    }

    mainWindow.removeMenu();
}

app.whenReady().then(() => {

    const saved = getSavedLicense();

    if (saved && isValid(saved.key)) {
        createWindow(false);
    } else {
        createWindow(true);
    }

});

// IPC from license page
ipcMain.on('validate-license', (event, key) => {

    if (isValid(key)) {

        saveLicense(key);

        dialog.showMessageBox({
            message: "License Activated Successfully"
        });

        mainWindow.loadFile('GALAXY STONE REPORT.html');

    } else {

        dialog.showErrorBox("Error", "Invalid License Key");

    }

});
