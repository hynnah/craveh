// Order History Page JavaScript

document.addEventListener('DOMContentLoaded', async () => {
  await window.sessionDataPromise;
  renderHistory();
});

async function renderHistory() {
  const historyContent = document.getElementById('history-content');
  const user = getCurrentUser();
  
  if (!user) {
    historyContent.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
        <h3>Please login to view your order history</h3>
        <p>Create an account or login to see your past orders</p>
        <a href="account.html" class="btn btn-primary">Go to Account</a>
      </div>
    `;
    return;
  }

  let userOrders = [];
  try {
    userOrders = await fetchHistory();
  } catch (error) {
    historyContent.innerHTML = `
      <div class="empty-state">
        <h3>An error occurred</h3>
        <p>${error.message}</p>
      </div>
    `;
    return;
  }
  
  if (userOrders.length === 0) {
    historyContent.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
        <h3>No orders yet</h3>
        <p>Start ordering some delicious food!</p>
        <a href="menu.html" class="btn btn-primary">Browse Menu</a>
      </div>
    `;
    return;
  }
  
  const ordersHTML = userOrders.map(order => `
    <div class="order-card">
      <div class="order-header">
        <div>
          <h3 class="order-id">Order #${order.id}</h3>
          <div class="order-date">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${new Date(order.created_at).toLocaleString()}
          </div>
        </div>
        <span class="order-status">${order.status}</span>
      </div>
      
      <div class="order-items">
        ${order.items.map(item => `
          <div class="order-item">
            <span>${item.name} x ${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `).join('')}
      </div>
      
      <div class="order-footer">
        <div class="order-delivery">
          <p>Delivery Address</p>
          <p>${order.delivery_address}</p>
          <p style="margin-top: 0.25rem;">Phone: ${order.phone}</p>
        </div>
        <div class="order-total">
          <p>Total</p>
          <p class="order-total-amount">$${order.total_amount.toFixed(2)}</p>
          <p class="order-payment-method">Cash on Delivery</p>
        </div>
      </div>
    </div>
  `).join('');
  
  historyContent.innerHTML = `<div class="orders-list">${ordersHTML}</div>`;
}

async function fetchHistory() {
  const response = await fetch('history.php');
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to load order history');
  }
  return result.orders;
}
