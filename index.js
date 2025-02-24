const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const net = require('net');
const dgram = require('dgram');
const os = require('os');

let mainWindow;
const UDP_PORT = 9999;
let KDS_PORT = 9001;
let connectedPOSClients = []; // Store connected POS clients

function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    for (let ifaceName in interfaces) {
        for (let details of interfaces[ifaceName]) {
            if (details.family === 'IPv4' && !details.internal) {
                return details.address;
            }
        }
    }
    return '127.0.0.1';
}

const KDS_INFO = {
    kds_name: "Main Kitchen Display",
    department: "Kitchen",
    ip: getLocalIPAddress(),
    port: KDS_PORT
};

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
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
    connectedPOSClients.push(socket); // Store connected POS clients

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
    socket.on('close', () => {
        console.log('POS Disconnected');
        connectedPOSClients = connectedPOSClients.filter(client => client !== socket);
    });
});

// ✅ Listen for "Mark as Done" from Renderer
ipcMain.on('order-done', (event, { orderId }) => {
    console.log(`✅ Order ${orderId} marked as done`);

    // Send order completion message to all connected POS clients
    const message = JSON.stringify({ orderId, status: 'done' });
    connectedPOSClients.forEach(client => {
        client.write(message);
    });
});

// ✅ Start KDS Server
function startKdsServer(port) {
    kdsServer.listen(port, () => {
        console.log(`✅ KDS running on ${KDS_INFO.ip}:${port}`);
    }).once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`⚠️ Port ${port} is in use. Trying ${port + 1}...`);
            startKdsServer(port + 1);
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
