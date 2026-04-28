// Checkout Page JavaScript

document.addEventListener('DOMContentLoaded', async () => {
  await window.sessionDataPromise;
  renderCheckout();
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderCheckout() {
  const checkoutContent = document.getElementById('checkout-content');
  const user = getCurrentUser();

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

  const total = getCartTotal();
  const phoneValue = user ? escapeHtml(user.phone || '') : '';

  checkoutContent.innerHTML = `
    <h2 class="page-title">Checkout</h2>

    <div class="checkout-section">
      <div class="checkout-step-header"><span class="checkout-step-number">1</span><h3>Order Summary</h3></div>
      <div>
        ${cart.map(item => `
          <div class="checkout-item">
            <div class="checkout-item-info">
              <img src="${item.image || ''}" alt="${escapeHtml(item.name)}" class="checkout-item-image">
              <span>${escapeHtml(item.name)}</span>
            </div>
            <div class="checkout-item-controls">
              <div class="quantity-controls">
                <button class="quantity-btn" data-id="${escapeHtml(item.id)}" data-action="decrease">-</button>
                <span class="quantity-display">${item.quantity}</span>
                <button class="quantity-btn" data-id="${escapeHtml(item.id)}" data-action="increase">+</button>
              </div>
              <span class="checkout-total-amount" style="min-width: 70px; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</span>
              <button class="btn-remove" data-id="${escapeHtml(item.id)}" title="Remove item">
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
      <div class="checkout-step-header"><span class="checkout-step-number">2</span><h3>Delivery Information</h3></div>
      <form id="checkout-form">
        <div class="form-group">
          <label for="street-input">Street Address</label>
          <input type="text" id="street-input" placeholder="123 Main St" required>
          <p class="field-error" id="street-error"></p>
        </div>
        <div class="form-row">
          <div class="form-group form-group-flex">
            <label for="city-input">City</label>
            <input type="text" id="city-input" placeholder="City" required>
            <p class="field-error" id="city-error"></p>
          </div>
          <div class="form-group form-group-flex">
            <label for="state-input">State</label>
            <input type="text" id="state-input" placeholder="State" required>
            <p class="field-error" id="state-error"></p>
          </div>
          <div class="form-group form-group-flex">
            <label for="zip-input">ZIP Code</label>
            <input type="text" id="zip-input" placeholder="10001" required>
            <p class="field-error" id="zip-error"></p>
          </div>
        </div>
        <div class="form-group">
          <label for="building-input">Building Name <span class="label-optional">(optional)</span></label>
          <input type="text" id="building-input" placeholder="e.g. Sunrise Apartments">
        </div>
        <div class="form-row">
          <div class="form-group form-group-flex">
            <label for="floor-input">Floor <span class="label-optional">(optional)</span></label>
            <input type="text" id="floor-input" placeholder="e.g. 3rd">
          </div>
          <div class="form-group form-group-flex">
            <label for="apt-input">Apt / Suite / Unit <span class="label-optional">(optional)</span></label>
            <input type="text" id="apt-input" placeholder="e.g. 4B">
          </div>
        </div>
        <div class="form-group">
          <label for="landmark-input">Landmark <span class="label-optional">(optional)</span></label>
          <input type="text" id="landmark-input" placeholder="e.g. Near Central Park, opposite the bank">
        </div>
        <div class="form-group">
          <label for="notes-input">Delivery Notes <span class="label-optional">(optional)</span></label>
          <textarea id="notes-input" rows="2" placeholder="Gate code, ring doorbell, etc."></textarea>
        </div>
        <div class="form-group">
          <label for="phone-input">Phone Number</label>
          <input type="tel" id="phone-input" placeholder="Enter your phone number" value="${phoneValue}" required>
          <p class="field-error" id="phone-error"></p>
        </div>
      </form>
    </div>

    <div class="checkout-section">
      <div class="checkout-step-header"><span class="checkout-step-number">3</span><h3>Payment Method</h3></div>
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

  checkoutContent.querySelectorAll('.quantity-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      const item = cart.find(i => i.id === itemId);
      if (item) {
        if (action === 'increase') updateCartQuantity(itemId, item.quantity + 1);
        else if (action === 'decrease') updateCartQuantity(itemId, item.quantity - 1);
        renderCheckout();
      }
    });
  });

  checkoutContent.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.getAttribute('data-id');
      if (confirm('Remove this item from your cart?')) {
        removeFromCart(itemId);
        renderCheckout();
      }
    });
  });

  document.getElementById('place-order-btn').addEventListener('click', () => {
    if (!user) {
      window.location.href = 'account.html';
      return;
    }
    handlePlaceOrder();
  });

  if (user) prefillFromSavedAddress(user);
}

function prefillFromSavedAddress(user) {
  const addr = user.delivery_address;
  if (!addr) return;
  const fields = {
    'street-input': addr.street,
    'city-input': addr.city,
    'state-input': addr.state,
    'zip-input': addr.zip,
    'building-input': addr.building,
    'floor-input': addr.floor,
    'apt-input': addr.apt,
    'landmark-input': addr.landmark
  };
  for (const [id, val] of Object.entries(fields)) {
    if (val) document.getElementById(id).value = val;
  }
}

function validateCheckoutFields() {
  const fields = {
    street: document.getElementById('street-input').value.trim(),
    city: document.getElementById('city-input').value.trim(),
    state: document.getElementById('state-input').value.trim(),
    zip: document.getElementById('zip-input').value.trim(),
    phone: document.getElementById('phone-input').value.trim()
  };

  const errors = {
    street: document.getElementById('street-error'),
    city: document.getElementById('city-error'),
    state: document.getElementById('state-error'),
    zip: document.getElementById('zip-error'),
    phone: document.getElementById('phone-error')
  };

  Object.values(errors).forEach(el => el.textContent = '');
  let valid = true;

  if (!fields.street || fields.street.length < 5) {
    errors.street.textContent = 'Enter a valid street address.';
    valid = false;
  }
  if (!fields.city || fields.city.length < 2) {
    errors.city.textContent = 'City is required.';
    valid = false;
  }
  if (!fields.state) {
    errors.state.textContent = 'State is required.';
    valid = false;
  }
  if (!fields.zip || !/^\d{4,10}$/.test(fields.zip)) {
    errors.zip.textContent = 'Enter a valid ZIP code.';
    valid = false;
  }
  if (!fields.phone || !/^\d{7,15}$/.test(fields.phone)) {
    errors.phone.textContent = 'Enter a valid phone number (7–15 digits).';
    valid = false;
  }

  return valid;
}

function buildAddress() {
  const street = document.getElementById('street-input').value.trim();
  const apt = document.getElementById('apt-input').value.trim();
  const city = document.getElementById('city-input').value.trim();
  const state = document.getElementById('state-input').value.trim();
  const zip = document.getElementById('zip-input').value.trim();
  const building = document.getElementById('building-input').value.trim();
  const floor = document.getElementById('floor-input').value.trim();
  const landmark = document.getElementById('landmark-input').value.trim();
  const notes = document.getElementById('notes-input').value.trim();

  let address = street;
  if (apt) address += ', ' + apt;
  address += ', ' + city + ', ' + state + ' ' + zip;
  const extras = [building, floor, landmark].filter(Boolean).join(', ');
  if (extras) address += ' [' + extras + ']';
  if (notes) address += ' (' + notes + ')';
  return address;
}

function setOrderButtonLoading(loading) {
  const btn = document.getElementById('place-order-btn');
  if (loading) {
    btn.disabled = true;
    btn.dataset.originalText = btn.textContent;
    btn.innerHTML = '<span class="spinner"></span> Placing Order…';
  } else {
    btn.disabled = false;
    btn.textContent = btn.dataset.originalText || 'Place Order';
  }
}

async function handlePlaceOrder() {
  if (!validateCheckoutFields()) return;

  const address = buildAddress();
  const phone = document.getElementById('phone-input').value.trim();
  const user = getCurrentUser();

  const order = {
    userId: user.id,
    items: cart.map(item => ({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    })),
    address,
    phone
  };

  setOrderButtonLoading(true);
  try {
    await sendOrderToServer(order);
    clearCart();
    showOrderSuccess();
  } catch (error) {
    setOrderButtonLoading(false);
    document.getElementById('street-error').textContent = 'Order failed: ' + error.message;
  }
}

async function sendOrderToServer(order) {
  const response = await fetch('../api/save_order.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
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
