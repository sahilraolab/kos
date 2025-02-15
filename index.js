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

const KDS_PORT = 9001;
const UDP_PORT = 9999;

// ✅ Get Local IP Address
function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    for (let iface of Object.values(interfaces)) {
        for (let details of iface) {
            if (details.family === 'IPv4' && !details.internal) {
                return details.address;
            }
        }
    }
    return '127.0.0.1';
}

const kdsServer = net.createServer((socket) => {
    console.log('POS Trying to Connect...');

    socket.once('data', (data) => {
        const receivedPassword = data.toString().trim();
        if (receivedPassword === KDS_INFO.password) {
            socket.write("AUTH_SUCCESS");
            console.log("✅ POS Connected Successfully");
        } else {
            socket.write("AUTH_FAILED");
            socket.destroy();
            console.log("❌ POS Connection Rejected - Incorrect Password");
        }
    });

    socket.on('error', (err) => console.error('KDS Error:', err));
    socket.on('close', () => console.log('POS Disconnected'));
});

kdsServer.listen(KDS_PORT, () => {
    console.log(`✅ KDS running on ${KDS_INFO.ip}:${KDS_PORT}`);
});

// ✅ Handle UDP Discovery Requests
const udpServer = dgram.createSocket('udp4');

const KDS_INFO = {
    kds_name: "Main Kitchen Display",
    department: "Kitchen",
    ip: getLocalIPAddress(),
    port: KDS_PORT,
    password: "1234" // In production, use a secure hash instead
};

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