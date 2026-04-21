// Menu Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  // Auto-refresh menu every 10 seconds to pick up admin availability changes
  setInterval(renderMenu, 3000);
});

async function renderMenu() {
  const menuGrid = document.getElementById('menu-grid');
  if (!menuGrid.children.length) menuGrid.innerHTML = 'Loading menu...';
  
  let items = MENU_ITEMS;
  try {
    const response = await fetch('admin-api.php?action=get_menu_items');
    const data = await response.json();
    if (response.ok && data.success) {
      items = data.items
        .filter(item => Number(item.is_available) === 1)
        .map(item => ({
          ...item,
          image: item.image_url || item.image || 'https://via.placeholder.com/400x300?text=No+Image',
          price: parseFloat(item.price) || 0
        }));
      MENU_ITEMS = items;
    }
  } catch (error) {
    console.warn('Unable to load live menu items, using fallback data.', error);
  }

  if (!items || items.length === 0) {
    menuGrid.innerHTML = '<div class="empty-state">No menu items available right now.</div>';
    return;
  }

  menuGrid.innerHTML = '';
  
  items.forEach(item => {
    const menuItemEl = document.createElement('div');
    menuItemEl.className = 'menu-item';
    menuItemEl.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="menu-item-image">
      <div class="menu-item-content">
        <h3 class="menu-item-name">${item.name}</h3>
        <p class="menu-item-description">${item.description}</p>
        <div class="menu-item-footer">
          <span class="menu-item-price">$${item.price.toFixed(2)}</span>
          <button class="btn btn-primary btn-add" data-id="${item.id}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add
          </button>
        </div>
      </div>
    `;
    
    const addBtn = menuItemEl.querySelector('.btn-add');
    addBtn.addEventListener('click', () => {
      addToCart(item.id);
      
      // Visual feedback
      addBtn.textContent = 'Added!';
      setTimeout(() => {
        addBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add
        `;
      }, 1000);
    });
    
    menuGrid.appendChild(menuItemEl);
  });
}
