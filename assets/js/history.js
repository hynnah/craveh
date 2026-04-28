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
    return `<div class="order-cancelled-notice">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
      Order was cancelled
    </div>`;
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
        <div class="empty-state-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <h3>Authentication Required</h3>
        <p>Sign in to access your order history and track deliveries</p>
        <a href="account.html" class="btn btn-primary">Sign In</a>
      </div>
    `;
    return;
  }

  historyContent.innerHTML = '<div class="loading-spinner"><div class="spinner-large"></div><p>Loading order history...</p></div>';

  let userOrders = [];
  try {
    userOrders = await fetchHistory();
  } catch (error) {
    historyContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon error">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <h3>Unable to Load Orders</h3>
        <p>${error.message}</p>
        <button onclick="location.reload()" class="btn btn-secondary">Retry</button>
      </div>
    `;
    return;
  }

  if (userOrders.length === 0) {
    historyContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </div>
        <h3>No Order History</h3>
        <p>You haven't placed any orders yet. Explore our menu to get started.</p>
        <a href="menu.html" class="btn btn-primary">Browse Menu</a>
      </div>
    `;
    return;
  }

  const ordersHTML = userOrders.map(order => {
    const statusClass = `order-status-${order.status.replace(/ /g, '_')}`;
    const statusIcon = getStatusIcon(order.status);
    return `
    <div class="order-card">
      <div class="order-header">
        <div class="order-header-left">
          <div class="order-id-wrapper">
            ${statusIcon}
            <h3 class="order-id">Order #${order.id}</h3>
          </div>
          <div class="order-date">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${new Date(order.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <span class="order-status ${statusClass}">${order.status.replace(/_/g, ' ')}</span>
      </div>

      ${buildProgressTracker(order.status)}

      <div class="order-items">
        ${order.items.map(item => `
          <div class="order-item">
            <span class="order-item-name">
              <span class="item-qty-badge">${item.quantity}</span>
              ${item.name}
            </span>
            <span class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `).join('')}
      </div>

      <div class="order-footer">
        <div class="order-delivery">
          <p class="order-footer-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            Delivery Address
          </p>
          <p class="order-delivery-address">${order.delivery_address}</p>
          <p class="order-phone">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            ${order.phone}
          </p>
        </div>
        <div class="order-total">
          <p class="order-footer-label">Order Total</p>
          <p class="order-total-amount">$${order.total_amount.toFixed(2)}</p>
          <p class="order-payment-method">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
            Cash on Delivery
          </p>
        </div>
      </div>
    </div>
  `}).join('');

  historyContent.innerHTML = `<div class="orders-list">${ordersHTML}</div>`;
}

function getStatusIcon(status) {
  const icons = {
    pending: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    confirmed: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    preparing: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
    out_for_delivery: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>',
    delivered: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    cancelled: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
  };
  return icons[status] || '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>';
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
