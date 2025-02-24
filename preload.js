const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    receive: (channel, callback) => {
        ipcRenderer.on(channel, (_, data) => callback(data));
    },
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    }
});
