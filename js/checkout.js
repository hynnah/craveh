// Checkout Page JavaScript

document.addEventListener('DOMContentLoaded', async () => {
  await window.sessionDataPromise;
  renderCheckout();
});

function renderCheckout() {
  const checkoutContent = document.getElementById('checkout-content');
  const user = getCurrentUser();
  
  // Check if user is logged in
  if (!user) {
    checkoutContent.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <h3>Please login to checkout</h3>
        <p>Create an account or login to place your order</p>
        <a href="account.html" class="btn btn-primary">Go to Account</a>
      </div>
    `;
    return;
  }
  
  // Check if cart is empty
  if (cart.length === 0) {
    checkoutContent.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        <h3>Your cart is empty</h3>
        <p>Add some items to your cart before checking out</p>
        <a href="menu.html" class="btn btn-primary">Browse Menu</a>
      </div>
    `;
    return;
  }
  
  // Show checkout form
  const total = getCartTotal();
  checkoutContent.innerHTML = `
    <h2 class="page-title">Checkout</h2>
    
    <div class="checkout-section">
      <h3>Order Summary</h3>
      <div>
        ${cart.map(item => `
          <div class="checkout-item">
            <div class="checkout-item-info">
              <span>${item.name}</span>
            </div>
            <div class="checkout-item-controls">
              <div class="quantity-controls">
                <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                <span class="quantity-display">${item.quantity}</span>
                <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
              </div>
              <span class="checkout-total-amount" style="min-width: 70px; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</span>
              <button class="btn-remove" data-id="${item.id}" title="Remove item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        `).join('')}
        <div class="checkout-total">
          <span>Total</span>
          <span class="checkout-total-amount">$${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
    
    <div class="checkout-section">
      <h3>Delivery Information</h3>
      <form id="checkout-form">
        <div class="form-group">
          <label for="address-input">Delivery Address</label>
          <textarea id="address-input" rows="3" placeholder="Enter your delivery address" required></textarea>
        </div>
        <div class="form-group">
          <label for="phone-input">Phone Number</label>
          <input type="tel" id="phone-input" placeholder="Enter your phone number" required>
        </div>
      </form>
    </div>
    
    <div class="checkout-section">
      <h3>Payment Method</h3>
      <div class="payment-method-card">
        <div class="payment-icon">💵</div>
        <div class="payment-details">
          <p>Cash on Delivery</p>
          <p>Pay when you receive your order</p>
        </div>
      </div>
    </div>
    
    <button class="btn btn-primary btn-block" id="place-order-btn">
      Place Order - $${total.toFixed(2)}
    </button>
  `;
  
  // Setup quantity controls
  const quantityBtns = checkoutContent.querySelectorAll('.quantity-btn');
  quantityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      const item = cart.find(i => i.id === itemId);
      
      if (item) {
        if (action === 'increase') {
          updateCartQuantity(itemId, item.quantity + 1);
        } else if (action === 'decrease') {
          updateCartQuantity(itemId, item.quantity - 1);
        }
        renderCheckout(); // Re-render after update
      }
    });
  });
  
  // Setup remove buttons
  const removeBtns = checkoutContent.querySelectorAll('.btn-remove');
  removeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.getAttribute('data-id');
      if (confirm('Remove this item from your cart?')) {
        removeFromCart(itemId);
        renderCheckout(); // Re-render after removal
      }
    });
  });
  
  // Setup order button
  document.getElementById('place-order-btn').addEventListener('click', handlePlaceOrder);
}

function handlePlaceOrder() {
  const address = document.getElementById('address-input').value.trim();
  const phone = document.getElementById('phone-input').value.trim();
  const user = getCurrentUser();
  
  if (!address || !phone) {
    alert('Please fill in all delivery information');
    return;
  }
  
  const order = {
    id: Date.now().toString(),
    userId: user.id,
    items: cart.map(item => ({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    })),
    total: getCartTotal(),
    address,
    phone,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  sendOrderToServer(order)
    .then(() => {
      clearCart();
      showOrderSuccess();
    })
    .catch((error) => {
      alert('Order could not be sent to server: ' + error.message);
    });
}

async function sendOrderToServer(order) {
  const response = await fetch('save_order.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(order)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(response.status + ' ' + response.statusText + '\n' + text);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Server rejected the order');
  }

  return result;
}

function showOrderSuccess() {
  const checkoutContent = document.getElementById('checkout-content');
  checkoutContent.innerHTML = `
    <div class="success-card">
      <div class="success-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <h2>Order Placed Successfully!</h2>
      <p>Your order has been received and will be delivered soon.</p>
      <div class="success-actions">
        <a href="history.html" class="btn btn-secondary">View Order History</a>
        <a href="menu.html" class="btn btn-primary">Continue Shopping</a>
      </div>
    </div>
  `;
}
