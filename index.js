const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const net = require('net');
const dgram = require('dgram');
const os = require('os');

let mainWindow;
const UDP_PORT = 9999;
let KDS_PORT = 9001; // Default KDS port

// ✅ Get Local IP Address
function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    for (let ifaceName in interfaces) {
        for (let details of interfaces[ifaceName]) {
            if (details.family === 'IPv4' && !details.internal) {
                return details.address;
            }
        }
    }
    return '127.0.0.1'; // Default if no external IP is found
}

// ✅ KDS Information
const KDS_INFO = {
    kds_name: "Main Kitchen Display",
    department: "Kitchen",
    ip: getLocalIPAddress(),
    port: KDS_PORT
};

// ✅ Create KDS Window
function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true, // Secure IPC communication
            nodeIntegration: false  // Prevent security risks
        }
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// ✅ Create TCP KDS Server
const kdsServer = net.createServer((socket) => {
    console.log("✅ POS Connected Successfully");

    socket.on('data', (data) => {
        try {
            const orderDetails = JSON.parse(data.toString());
            console.log('🛎️ New Order Received:', orderDetails);
            sendOrderToRenderer(orderDetails);
        } catch (err) {
            console.error('❌ Error Processing Order:', err);
        }
    });

    socket.on('error', (err) => console.error('KDS Error:', err));
    socket.on('close', () => console.log('POS Disconnected'));
});

// ✅ Start KDS Server with Port Retry
function startKdsServer(port) {
    kdsServer.listen(port, () => {
        console.log(`✅ KDS running on ${KDS_INFO.ip}:${port}`);
    }).once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`⚠️ Port ${port} is in use. Trying ${port + 1}...`);
            startKdsServer(port + 1); // Retry with next port
        } else {
            console.error('❌ KDS Server Error:', err);
        }
    });
}

startKdsServer(KDS_PORT);

// ✅ Function to Send Orders to UI
function sendOrderToRenderer(orderDetails) {
    if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
        console.log('📢 Sending order data to UI:', orderDetails);
        mainWindow.webContents.send('order-data', orderDetails);
    } else {
        console.warn('⚠️ Renderer not available. Order not sent.');
    }
}

// ✅ UDP Discovery Server
const udpServer = dgram.createSocket('udp4');

udpServer.on('message', (msg, rinfo) => {
    console.log(`🔍 Received Discovery Request from ${rinfo.address}`);

    const response = JSON.stringify({
        kds_name: KDS_INFO.kds_name,
        department: KDS_INFO.department,
        ip: KDS_INFO.ip,
        port: KDS_INFO.port
    });

    udpServer.send(response, rinfo.port, rinfo.address);
});

udpServer.bind(UDP_PORT, () => console.log(`🔎 KDS Discovery Listening on UDP ${UDP_PORT}`));
