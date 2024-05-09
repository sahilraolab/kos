
// ipcRenderer.send('message', 'Hello from renderer process');
// window.api.send

window.api.receive('order-data', (event, orderData) => {
  // Process the order data and update the user interface
  // For example, update HTML elements with the new data
  console.log("Received order data in renderer process:", orderData);
  // Update your UI here
});