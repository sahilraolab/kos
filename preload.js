const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {
    send: (channel, data) => {
        console.log(`Sending data to channel ${channel}:`, data);
        ipcRenderer.send(channel, data);
    },
    receive: (channel, func) => {
        console.log(`Listening for channel ${channel}`);
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
});
