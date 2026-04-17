// Menu Items Data
const MENU_ITEMS = [
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
});

// Server session functions
async function loadSessionData() {
  try {
    const response = await fetch('session.php');
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
    const response = await fetch('cart.php', {
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
  if (!item) return;
  
  const existingItem = cart.find(i => i.id === itemId);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ ...item, quantity: 1 });
  }
  
  saveCartToServer();
  updateCartBadge();
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
  fetch('logout.php', { method: 'POST' }).catch(() => {});
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

