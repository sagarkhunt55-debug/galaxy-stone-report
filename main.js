const { app, BrowserWindow, ipcMain, dialog } = require('electron');
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

const licensePath = path.join(app.getPath('userData'), "license.json");

function getSavedLicense() {
    try {
        return JSON.parse(fs.readFileSync(licensePath));
    } catch {
        return null;
    }
}

function saveLicense(key) {
    fs.writeFileSync(licensePath, JSON.stringify({ key }));
}

function isValid(key) {
    const id = machineIdSync();
    const correct = generateKey(id);
    return key === correct;
}

let win;

function createWindow(page) {
    win = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile(page);
    win.removeMenu();
}

app.whenReady().then(() => {

    const saved = getSavedLicense();

    if (saved && isValid(saved.key)) {
        createWindow("GALAXY STONE REPORT.html");
    } else {
        createWindow("license.html");
    }

});

// from license page
ipcMain.on("check-license", (event, key) => {

    if (isValid(key)) {

        saveLicense(key);

        dialog.showMessageBox({
            message: "License Activated Successfully"
        });

        win.loadFile("GALAXY STONE REPORT.html");

    } else {
        dialog.showErrorBox("Error", "Invalid License Key");
    }

});