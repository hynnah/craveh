// Menu Page JavaScript

let activeCategory = 'All';
let searchQuery = '';
let previousMenuItems = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadMenuItems();
  renderCategoryFilter();
  renderMenu();

  const searchInput = document.getElementById('menu-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderMenu();
    });
  }

  // Auto-refresh menu items every 3 seconds
  setInterval(async () => {
    const oldItems = JSON.stringify(MENU_ITEMS);
    await loadMenuItems();
    const newItems = JSON.stringify(MENU_ITEMS);
    
    // Only re-render if data actually changed
    if (oldItems !== newItems) {
      renderCategoryFilter();
      renderMenu();
    }
  }, 3000);
});

function getFilteredItems() {
  let items = MENU_ITEMS;
  if (activeCategory !== 'All') items = items.filter(i => i.category === activeCategory);
  if (searchQuery) items = items.filter(i =>
    i.name.toLowerCase().includes(searchQuery) || i.description.toLowerCase().includes(searchQuery)
  );
  return items;
}

function renderCategoryFilter() {
  const container = document.getElementById('category-filter');
  if (!container) return;
  const categories = ['All', ...new Set(MENU_ITEMS.map(i => i.category))];

  container.innerHTML = categories.map(cat => {
    return `<button class="category-btn${cat === activeCategory ? ' active' : ''}" data-category="${cat}">${cat}</button>`;
  }).join('');

  container.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.category;
      container.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderMenu();
    });
  });
}

function renderMenu() {
  const menuGrid = document.getElementById('menu-grid');
  const emptyEl = document.getElementById('menu-empty');
  const countEl = document.getElementById('menu-result-count');
  const items = getFilteredItems();

  if (items.length === 0) {
    menuGrid.innerHTML = '';
    emptyEl.style.display = 'block';
    countEl.textContent = '';
    return;
  }

  emptyEl.style.display = 'none';
  countEl.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;

  menuGrid.innerHTML = '';
  items.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = 'menu-item';
    el.style.animationDelay = `${idx * 0.05}s`;
    el.innerHTML = `
      <div class="menu-item-image-wrapper">
        <img src="${item.image}" alt="${item.name}" class="menu-item-image" loading="lazy">
        <span class="menu-item-badge">${item.category}</span>
      </div>
      <div class="menu-item-content">
        <h3 class="menu-item-name">${item.name}</h3>
        <p class="menu-item-description">${item.description}</p>
        <div class="menu-item-footer">
          <span class="menu-item-price">${item.price.toFixed(2)}</span>
          <button class="btn btn-primary btn-add" data-id="${item.id}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add
          </button>
        </div>
      </div>
    `;

    const addBtn = el.querySelector('.btn-add');
    addBtn.addEventListener('click', () => {
      addToCart(item.id);
      addBtn.classList.add('btn-added');
      addBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Added!`;
      showToast(`${item.name} added to cart`);
      setTimeout(() => {
        addBtn.classList.remove('btn-added');
        addBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add`;
      }, 1200);
    });

    menuGrid.appendChild(el);
  });
}

function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}
