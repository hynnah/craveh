// Order History Page JavaScript

const ORDER_STEPS = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
const STEP_LABELS = { pending: 'Placed', confirmed: 'Confirmed', preparing: 'Preparing', out_for_delivery: 'On the way', delivered: 'Delivered' };

document.addEventListener('DOMContentLoaded', async () => {
  await window.sessionDataPromise;
  renderHistory();
});

function buildProgressTracker(status) {
  const currentIdx = ORDER_STEPS.indexOf(status);
  if (status === 'cancelled') {
    return `<div style="padding:0.5rem 0;color:var(--destructive);font-size:0.85rem;font-weight:600;">Order was cancelled</div>`;
  }
  let html = '<div class="order-progress">';
  ORDER_STEPS.forEach((step, i) => {
    const completed = i < currentIdx;
    const active = i === currentIdx;
    const cls = completed ? 'completed' : active ? 'active' : '';
    html += `<div class="progress-step ${cls}">
      <div class="progress-dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
      <span class="progress-label">${STEP_LABELS[step]}</span>
    </div>`;
    if (i < ORDER_STEPS.length - 1) {
      html += `<div class="progress-line${i < currentIdx ? ' completed' : ''}"></div>`;
    }
  });
  html += '</div>';
  return html;
}

async function renderHistory() {
  const historyContent = document.getElementById('history-content');
  const user = getCurrentUser();

  if (!user) {
    historyContent.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
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
    historyContent.innerHTML = `<div class="empty-state"><h3>An error occurred</h3><p>${error.message}</p></div>`;
    return;
  }

  if (userOrders.length === 0) {
    historyContent.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        </svg>
        <h3>No orders yet</h3>
        <p>Start ordering some delicious food!</p>
        <a href="menu.html" class="btn btn-primary">Browse Menu</a>
      </div>
    `;
    return;
  }

  const ordersHTML = userOrders.map(order => {
    const statusClass = `order-status-${order.status.replace(/ /g, '_')}`;
    return `
    <div class="order-card">
      <div class="order-header">
        <div>
          <h3 class="order-id">Order #${order.id}</h3>
          <div class="order-date">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${new Date(order.created_at).toLocaleString()}
          </div>
        </div>
        <span class="order-status ${statusClass}">${order.status.replace(/_/g, ' ')}</span>
      </div>

      ${buildProgressTracker(order.status)}

      <div class="order-items">
        ${order.items.map(item => `
          <div class="order-item">
            <span>${item.name} × ${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `).join('')}
      </div>

      <div class="order-footer">
        <div class="order-delivery">
          <p>Delivery Address</p>
          <p>${order.delivery_address}</p>
          <p style="margin-top:0.2rem;">Phone: ${order.phone}</p>
        </div>
        <div class="order-total">
          <p>Total</p>
          <p class="order-total-amount">$${order.total_amount.toFixed(2)}</p>
          <p class="order-payment-method">Cash on Delivery</p>
        </div>
      </div>
    </div>
  `}).join('');

  historyContent.innerHTML = `<div class="orders-list">${ordersHTML}</div>`;
}

async function fetchHistory() {
  const response = await fetch('../api/history.php');
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to load order history');
  }
  return result.orders.map(order => ({
    ...order,
    total_amount: parseFloat(order.total_amount),
    items: order.items.map(item => ({
      ...item,
      price: parseFloat(item.price),
      quantity: parseInt(item.quantity)
    }))
  }));
}
