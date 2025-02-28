window.api.receive('order-data', (orderData) => {
  console.log("Received order data in renderer process:", orderData);
  const ordersContainer = document.getElementById('ordersContainer');

  // Create a new order element
  const orderElement = document.createElement('div');
  orderElement.classList.add('order');
  orderElement.dataset.orderId = orderData.orderId;

  const timerId = `timer-${orderData.orderId}`;


  // Generate order items dynamically
  const orderItems = orderData.orderDetails.selectedMenuList.map(item => {
    return `
      <div class="order_item" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="toggleItem(this)">
        <div style="display: flex; flex-direction: column; gap: .2rem;">
          <span style="font-size: 1rem; font-weight: bold; color: #342C2C;">${item.quantity} x ${item.name}</span>
          <span style="font-size: .8rem; font-weight: bold; color: #8F8888;">
            ${item.selectedAddons ? item.selectedAddons.map(addon => addon.name).join(", ") : ""}
          </span>
        </div>
        <div class="circle_icon">
          <div class="empty_circle" style="width: 20px; height: 20px; border: 2px solid #292D32; border-radius: 50%;"></div>
        </div>
      </div>
    `;
  }).join('');


  // Create order details
  const orderDetails = `
      <div class="order">
          <div class="order_info">
            <div class="order_owner">
              <span style="font-size: 1.3rem; font-weight: bold;">${orderData.orderDetails.userInfo.fullName}</span>
              <span id="${timerId}" style="font-size: 1rem; font-weight: bold;">00:00:00</span>
            </div>
            <svg width="2rem" height="2rem" style="cursor: pointer;" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M11.9999 22C17.4999 22 21.9999 17.5 21.9999 12C21.9999 6.5 17.4999 2 11.9999 2C6.49994 2 1.99994 6.5 1.99994 12C1.99994 17.5 6.49994 22 11.9999 22Z"
                stroke="white" stroke-width="1.51172" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M9.16992 14.8299L14.8299 9.16992" stroke="white" stroke-width="1.51172" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M14.8299 14.8299L9.16992 9.16992" stroke="white" stroke-width="1.51172" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
          <div class="order_type">
            <div>
              <div class="clock">
                <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12.1987 7.78955C12.1987 10.6291 9.8942 12.9336 7.05469 12.9336C4.21518 12.9336 1.91064 10.6291 1.91064 7.78955C1.91064 4.95004 4.21518 2.64551 7.05469 2.64551C9.8942 2.64551 12.1987 4.95004 12.1987 7.78955Z"
                    stroke="#292D32" stroke-width="1.51172" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M7.05469 4.70312V7.64258" stroke="#292D32" stroke-width="1.51172" stroke-linecap="round"
                    stroke-linejoin="round" />
                  <path d="M5.29102 1.17578H8.81836" stroke="#292D32" stroke-width="1.51172" stroke-miterlimit="10"
                    stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <span style="color: #312D2D; font-weight: bold; font-size: 1rem;">${orderData.orderDetails.orderType === "pickUp" ? "Pick Up" : "Dine In"}</span>
            </div>
            <span style="color: #312D2D; font-weight: bold; font-size: 1rem;">${formatOrderId(orderData.orderId)}</span>
          </div>
          <div class="order_item_list">
          ${orderItems}
          </div>
          <div class="order_action">
            <button class="markDoneBtn" data-order-id="${orderData.orderId}">Mark as Done</button>
            <div>
              <svg viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9.1333 8.81836H21.1011V6.29883C21.1011 3.7793 20.1563 2.51953 17.3218 2.51953H12.9126C10.0781 2.51953 9.1333 3.7793 9.1333 6.29883V8.81836Z"
                  stroke="#292D32" stroke-width="1.51172" stroke-miterlimit="10" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path
                  d="M20.1563 18.8965V23.9355C20.1563 26.4551 18.8965 27.7148 16.377 27.7148H13.8574C11.3379 27.7148 10.0781 26.4551 10.0781 23.9355V18.8965H20.1563Z"
                  stroke="#292D32" stroke-width="1.51172" stroke-miterlimit="10" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path
                  d="M26.4551 12.5977V18.8965C26.4551 21.416 25.1953 22.6758 22.6758 22.6758H20.1562V18.8965H10.0781V22.6758H7.55859C5.03906 22.6758 3.7793 21.416 3.7793 18.8965V12.5977C3.7793 10.0781 5.03906 8.81836 7.55859 8.81836H22.6758C25.1953 8.81836 26.4551 10.0781 26.4551 12.5977Z"
                  stroke="#292D32" stroke-width="1.51172" stroke-miterlimit="10" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M21.416 18.8965H19.8917H8.81836" stroke="#292D32" stroke-width="1.51172" stroke-miterlimit="10"
                  stroke-linecap="round" stroke-linejoin="round" />
                <path d="M8.81836 13.8574H12.5977" stroke="#292D32" stroke-width="1.51172" stroke-miterlimit="10"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>
        </div>
  `;

  // Set the inner HTML of the order element
  orderElement.innerHTML = orderDetails;

  // Append the new order element to the orders container
  ordersContainer.appendChild(orderElement);

  // ✅ Add event listener for "Mark as Done" button
  orderElement.querySelector('.markDoneBtn').addEventListener('click', function () {
    const orderId = this.dataset.orderId;

    // Remove the order from the DOM
    const orderElement = document.querySelector(`div[data-order-id="${orderId}"]`);
    if (orderElement) {
      orderElement.remove();
    }

    // ✅ Send order completion message to main process
    window.api.send('order-done', { orderId });
  });

  setTimeout(() => startTimer(timerId), 0);

});


function formatOrderId(orderId) {
  return orderId >= 100 ? `#${orderId}` : `#${orderId.toString().padStart(3, '0')}`;
}

// Timer function
function startTimer(timerId) {
  let seconds = 0; // Ensure seconds is initialized properly
  const timerElement = document.getElementById(timerId);

  if (!timerElement) {
    console.error(`Timer element with ID '${timerId}' not found.`);
    return;
  }

  function updateTimerDisplay() {
    if (typeof seconds !== 'number' || isNaN(seconds)) {
      console.error(`Invalid seconds value: ${seconds}`);
      return;
    }

    let hrs = Math.floor(seconds / 3600);
    let mins = Math.floor((seconds % 3600) / 60);
    let secs = seconds % 60;

    timerElement.textContent =
      `${hrs.toString().padStart(2, '0')}:` +
      `${mins.toString().padStart(2, '0')}:` +
      `${secs.toString().padStart(2, '0')}`;
  }

  updateTimerDisplay(); // Initial display
  setInterval(() => {
    seconds++;
    updateTimerDisplay();
  }, 1000);
}


// Function to toggle between empty circle and ticked circle
function toggleItem(element) {
  const circleIcon = element.querySelector('.circle_icon');
  if (circleIcon.innerHTML.includes('empty_circle')) {
    circleIcon.innerHTML = `
      <div class="circle_with_tick">
        <svg width="11" height="8" viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0.810547 4.09381L3.66266 6.94592L9.37695 1.2417" stroke="#292D32" stroke-width="1.51172"
            stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
    `;
  } else {
    circleIcon.innerHTML = `
      <div class="empty_circle" style="width: 20px; height: 20px; border: 2px solid #292D32; border-radius: 50%;"></div>
    `;
  }
}