// Menu Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
});

function renderMenu() {
  const menuGrid = document.getElementById('menu-grid');
  menuGrid.innerHTML = '';
  
  MENU_ITEMS.forEach(item => {
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
