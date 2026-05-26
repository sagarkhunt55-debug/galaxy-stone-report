const { app, BrowserWindow } = require('electron');

function createWindow(){

    const win = new BrowserWindow({

        width:1400,
        height:900

    });

    win.loadFile('GALAXY STONE REPORT.html');

    win.removeMenu();

}

app.whenReady().then(createWindow);
