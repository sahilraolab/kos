const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const net = require('net');
const dgram = require('dgram');
const os = require('os');

let mainWindow;

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true, // Ensure context isolation is enabled
            nodeIntegration: false  // Ensure node integration is disabled for security
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

// Create a server to listen for connections from order creation software
const server = net.createServer((socket) => {
    console.log('Order creation software connected');

    // Handle incoming orders from order creation software
    socket.on('data', (data) => {
        // console.log('Received order from order creation software:', data.toString());
        console.log(":)++++++++++++++++++++++++++++++:)")

        // Parse the received data as JSON
        const orderData = JSON.parse(data.toString());

        // Send the order data to the renderer process
        if (mainWindow) {
            console.log('Sending order data to renderer process');
            mainWindow.webContents.send('order-data', orderData);
        }


        // Simulate updating order status and send it back to order creation software
        setTimeout(() => {
            const updatedOrderStatus = 'Order in progress';
            socket.write(updatedOrderStatus);
        }, 2000);
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

const port = 9001;
server.listen(port, () => {
    console.log(`KDS listening for connections on port ${port}`);
});
