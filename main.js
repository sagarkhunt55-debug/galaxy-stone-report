const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let machineIdSync;

try {
    machineIdSync = require('node-machine-id').machineIdSync;
} catch (e) {
    machineIdSync = null;
}

const SECRET = "GALAXY_STONE_SECRET";

function generateKey(id) {
    return crypto
        .createHash('sha256')
        .update(id + SECRET)
        .digest('hex')
        .substring(0, 20)
        .toUpperCase();
}

// REAL MACHINE ID (safe fallback improved)
function getMachineId() {
    if (machineIdSync) {
        try {
            return machineIdSync();
        } catch (e) {
            return app.getPath('home');
        }
    }
    return app.getPath('home');
}

function licensePath() {
    return path.join(app.getPath('userData'), "license.json");
}

// SAFE READ
function getSavedLicense() {
    try {
        const data = fs.readFileSync(licensePath(), 'utf8');
        return JSON.parse(data);
    } catch {
        return null;
    }
}

// SAFE WRITE
function saveLicense(key) {
    try {
        fs.writeFileSync(licensePath(), JSON.stringify({ key }));
    } catch (e) {
        console.log("License save failed");
    }
}

// VALIDATION
function isValid(key) {
    const id = getMachineId();
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
        createWindow("index.html");
    } else {
        createWindow("license.html");
    }

});

// LICENSE CHECK
ipcMain.on("check-license", (event, key) => {

    if (isValid(key)) {

        saveLicense(key);

        dialog.showMessageBox({
            message: "License Activated Successfully"
        });

        win.loadFile("index.html");

    } else {
        dialog.showErrorBox("Error", "Invalid License Key");
    }

});