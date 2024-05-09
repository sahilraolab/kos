// main.js (KDS)

const { app, BrowserWindow, ipcMain } = require('electron');
const net = require('net');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            // preload: path.join(app.getAppPath(), 'preload.js')
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

/* ==============================================================
          KDS SERVER
============================================================== */

// Create a server to listen for connections from order creation software
const server = net.createServer((socket) => {
    console.log('Order creation software connected');

    // Handle incoming orders from order creation software
    socket.on('data', (data) => {
        // Process the received order (e.g., display on KDS interface)
        console.log('Received order from order creation software:', data.toString());

        // Simulate updating order status and send it back to order creation software
        setTimeout(() => {
            const updatedOrderStatus = 'Order in progress';
            socket.write(updatedOrderStatus);
        }, 2000); // Simulate some processing time before updating status
    });

    // Handle socket errors
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

// Start listening for connections on port 9000
const port = 9001;
server.listen(port, () => {
    console.log(`KDS listening for connections on port ${port}`);
});



