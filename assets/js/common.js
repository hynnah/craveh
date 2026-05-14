// Menu Items Data
let MENU_ITEMS = [
  {
    id: '1',
    name: 'Classic Burger',
    description: 'Juicy beef patty with lettuce, tomato, and special sauce',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    category: 'Burgers'
  },
  {
    id: '2',
    name: 'Margherita Pizza',
    description: 'Fresh mozzarella, basil, and tomato sauce',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop',
    category: 'Pizza'
  },
  {
    id: '3',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with parmesan and croutons',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
    category: 'Salads'
  },
  {
    id: '4',
    name: 'Chicken Wings',
    description: 'Crispy wings with your choice of sauce',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&h=300&fit=crop',
    category: 'Appetizers'
  },
  {
    id: '5',
    name: 'Spaghetti Carbonara',
    description: 'Creamy pasta with bacon and parmesan',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop',
    category: 'Pasta'
  },
  {
    id: '6',
    name: 'Fish & Chips',
    description: 'Crispy battered fish with golden fries',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=400&h=300&fit=crop',
    category: 'Seafood'
  },
  {
    id: '7',
    name: 'BBQ Ribs',
    description: 'Tender ribs with smoky BBQ sauce',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
    category: 'BBQ'
  },
  {
    id: '8',
    name: 'Tacos',
    description: 'Three soft tacos with your choice of protein',
    price: 10.99,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop',
    category: 'Mexican'
  }
];

// Global State - accessible from all pages
let currentUser = null;
let cart = [];

async function loadMenuItems() {
  try {
    const response = await fetch('../api/menu_items.php');
    const result = await response.json();
    if (!response.ok || !result.success || !Array.isArray(result.items)) {
      throw new Error(result.error || 'Failed to load menu items');
    }

    MENU_ITEMS = result.items.map(item => ({
      ...item,
      id: String(item.id),
      price: Number(item.price)
    }));
    
    // Always validate cart after loading menu items
    if (cart.length > 0) {
      validateCartItems();
    }
  } catch (error) {
    console.error('Failed to load menu items from database', error);
  }
}

// Initialize on page load
const sessionDataPromise = loadSessionData();
window.sessionDataPromise = sessionDataPromise;

document.addEventListener('DOMContentLoaded', () => {
  sessionDataPromise.then(() => {
    updateCartBadge();
    updateAccountLink();
    if (typeof updateAccountPage === 'function') {
      updateAccountPage();
    }
  });

  const hamburger = document.getElementById('hamburger-btn');
  const nav = document.getElementById('main-nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      nav.classList.toggle('open');
    });
  }
});

// Server session functions
async function loadSessionData() {
  try {
    const response = await fetch('../api/session.php');
    const result = await response.json();
    if (result.success) {
      currentUser = result.user || null;
      cart = result.cart || [];
    } else {
      currentUser = null;
      cart = [];
    }
  } catch (error) {
    console.error('Failed to load session data', error);
    currentUser = null;
    cart = [];
  }
}

async function saveCartToServer() {
  try {
    const response = await fetch('../api/cart.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'save',
        cart
      })
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      console.error('Failed to save cart to server', result.error || response.statusText);
    }
  } catch (error) {
    console.error('Failed to save cart to server', error);
  }
}

// Cart Functions
function addToCart(itemId) {
  const item = MENU_ITEMS.find(i => i.id === itemId);
  if (!item) {
    console.error('Item not found or no longer available');
    return false;
  }
  
  const existingItem = cart.find(i => i.id === itemId);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ ...item, quantity: 1 });
  }
  
  saveCartToServer();
  updateCartBadge();
  return true;
}

function removeFromCart(itemId) {
  cart = cart.filter(i => i.id !== itemId);
  saveCartToServer();
  updateCartBadge();
}

function updateCartQuantity(itemId, newQuantity) {
  const item = cart.find(i => i.id === itemId);
  if (item) {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      item.quantity = newQuantity;
      saveCartToServer();
      updateCartBadge();
    }
  }
}

function clearCart() {
  cart = [];
  saveCartToServer();
  updateCartBadge();
}

// Validate cart items against current menu availability
function validateCartItems() {
  const unavailableItems = [];
  const availableItemIds = MENU_ITEMS.map(item => item.id);
  
  // Find items in cart that are no longer available
  cart.forEach(cartItem => {
    if (!availableItemIds.includes(cartItem.id)) {
      unavailableItems.push(cartItem.name);
    }
  });
  
  // Remove unavailable items from cart
  if (unavailableItems.length > 0) {
    cart = cart.filter(cartItem => availableItemIds.includes(cartItem.id));
    saveCartToServer();
    updateCartBadge();
    
    // Show notification
    const itemText = unavailableItems.length === 1 ? 'item' : 'items';
    const itemList = unavailableItems.join(', ');
    showUnavailableItemNotification(`${unavailableItems.length} ${itemText} removed from cart: ${itemList}`);
  }
}

// Show notification for unavailable items
function showUnavailableItemNotification(message) {
  showUnavailableItemsModal(message, false); // false = not from checkout
}

// Unified modal for unavailable items (used by both cart validation and checkout)
function showUnavailableItemsModal(message, isCheckout = true) {
  // Create modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'unavailable-modal-overlay';
  modalOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  // Create modal content
  const modal = document.createElement('div');
  modal.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 30px;
    max-width: 450px;
    width: 90%;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    transform: scale(0.9);
    transition: transform 0.3s ease;
    text-align: center;
  `;

  const title = isCheckout ? 'Cannot Complete Order' : 'Items Removed from Cart';
  const description = isCheckout 
    ? 'The following items in your cart are no longer available and have been removed:'
    : 'The following items are no longer available and have been automatically removed from your cart:';

  modal.innerHTML = `
    <div style="margin-bottom: 20px;">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc3545" stroke-width="2" style="margin-bottom: 15px;">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
      <h3 style="margin: 0 0 10px 0; color: #dc3545; font-size: 20px;">${title}</h3>
      <p style="margin: 0 0 20px 0; color: #666; line-height: 1.5;">
        ${description}
      </p>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <strong style="color: #dc3545;">${message}</strong>
      </div>
      <p style="margin: 0; color: #666; font-size: 14px;">
        ${isCheckout ? 'Please review your cart and try again.' : 'You can continue browsing our menu.'}
      </p>
    </div>
    <div style="display: flex; gap: 10px; justify-content: center;">
      <button id="modal-ok-btn" style="
        padding: 12px 24px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
      ">OK</button>
    </div>
  `;

  modalOverlay.appendChild(modal);
  document.body.appendChild(modalOverlay);

  // Show modal with animation
  setTimeout(() => {
    modalOverlay.style.opacity = '1';
    modal.style.transform = 'scale(1)';
  }, 10);

  // Add event listeners
  document.getElementById('modal-ok-btn').addEventListener('click', () => {
    closeModal();
  });

  // Close modal function
  function closeModal() {
    modalOverlay.style.opacity = '0';
    modal.style.transform = 'scale(0.9)';
    setTimeout(() => {
      if (modalOverlay.parentNode) {
        modalOverlay.parentNode.removeChild(modalOverlay);
      }
    }, 300);
  }

  // Close on overlay click
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  // Close on escape key
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  if (badge) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalItems;
  }
}

// Auth Functions
function getCurrentUser() {
  return currentUser;
}

function setCurrentUser(user) {
  currentUser = user;
  updateAccountLink();
}

function logout() {
  currentUser = null;
  cart = [];
  fetch('../api/logout.php', { method: 'POST' }).catch(() => {});
  updateAccountLink();
  updateCartBadge();
}

function updateAccountLink() {
  const accountLink = document.getElementById('account-link');
  if (accountLink) {
    if (currentUser) {
      accountLink.textContent = currentUser.name;
    } else {
      accountLink.textContent = 'Account';
    }
  }
}
