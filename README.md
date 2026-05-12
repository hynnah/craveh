# 🍔 Craveh

> *Fresh food, delivered fast to your door.*

**Craveh** is a food ordering web application built with HTML, CSS, JavaScript, PHP, and MySQL. It features a customer-facing storefront for browsing food, managing a cart, placing orders, and tracking delivery — plus a full admin panel for managing the menu and order statuses.

---

## ✨ Features

### 🛍️ Customer Side
- Browse all available menu items
- Search items by name or description
- Filter items by category
- Add items to cart and adjust quantities at checkout
- Register an account and log in
- Save phone number and delivery address to profile
- Place orders via **Cash on Delivery**
- View order history and real-time delivery progress

### 🛠️ Admin Side
- Secure admin login
- Dashboard showing today's revenue, pending orders, and recent activity
- View, search, and filter all customer orders
- Update order status: `Pending` → `Confirmed` → `Preparing` → `Out for Delivery` → `Delivered` / `Cancelled`
- Add, edit, delete, and search menu items
- Upload menu item images
- Toggle item availability (show/hide from customer menu)

---

## 🗂️ Project Structure

```
craveh/
│
├── index.html
│
├── pages/
│   ├── menu.html              # Customer menu browsing
│   ├── checkout.html          # Cart review and order placement
│   ├── history.html           # Order history and tracking
│   └── account.html           # Login, signup, and profile
│
├── assets/
│   ├── css/
│   │   └── app.css            # Global stylesheet
│   ├── js/
│   │   ├── common.js          # Shared utilities
│   │   ├── menu.js
│   │   ├── checkout.js
│   │   ├── history.js
│   │   └── account.js
│   └── images/
│
├── api/
│   ├── config.php             # Database connection
│   ├── login.php
│   ├── signup.php
│   ├── logout.php
│   ├── session.php
│   ├── cart.php
│   ├── menu_items.php
│   ├── save_order.php
│   ├── history.php
│   └── update_profile.php
│
├── admin/
│   ├── admin-login.html
│   ├── admin-login.php
│   ├── admin-dashboard.html
│   ├── admin-orders.html
│   ├── admin-menu.html
│   ├── admin-profile.html
│   ├── admin-api.php
│   ├── admin-session.php
│   ├── admin-logout.php
│   ├── admin-setup.php        # First-time admin account creation
│   └── admin-app.css
│
├── db/
│   └── MYSQL_SCHEMA.sql       # Database schema
│
└── uploads/
    └── menu/                  # Uploaded menu item images
```


---

## 🔐 Admin Setup

To create the first admin account, visit:
```
http://localhost/craveh/admin/admin-setup.php
```
Fill in a name, email, and password. Then log in at:
```
http://localhost/craveh/admin/admin-login.html
```

> ⚠️ **Important:** Restrict or delete `admin-setup.php` after the admin account is created to prevent unauthorized access.

> 💡 **Tip:** The admin login can also be accessed from the menu page by clicking the `craveh` logo **7 times**.

---

## 📄 Pages

### Customer Pages

| Page | Description |
|------|-------------|
| `pages/menu.html` | Browse menu with search, category filters, and add-to-cart |
| `pages/checkout.html` | Cart summary, delivery form, and order placement |
| `pages/history.html` | Order history with delivery progress tracker |
| `pages/account.html` | Login, signup, logout, and saved delivery info |

### Admin Pages

| Page | Description |
|------|-------------|
| `admin/admin-login.html` | Admin login |
| `admin/admin-dashboard.html` | Revenue and order summary |
| `admin/admin-orders.html` | View, filter, and update order statuses |
| `admin/admin-menu.html` | Add, edit, delete, and manage menu items |
| `admin/admin-profile.html` | Admin profile settings |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `users` | Customer and admin accounts |
| `menu_items` | Food items with pricing, images, and availability |
| `client_orders` | Customer orders (primary order table) |
| `orders` | Normalized order records |
| `order_items` | Normalized order line items |

---

## 🔌 API Endpoints

### Customer API (`api/`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `session.php` | GET | Get current logged-in user and cart session |
| `signup.php` | POST | Create a customer account |
| `login.php` | POST | Log in a customer |
| `logout.php` | POST | Log out a customer |
| `cart.php` | POST | Save cart data to session |
| `menu_items.php` | GET | Load available menu items |
| `save_order.php` | POST | Place a customer order |
| `history.php` | GET | Load order history for logged-in user |
| `update_profile.php` | POST | Update phone and delivery address |

### Admin API (`admin/admin-api.php?action=`)

| Action | Purpose |
|--------|---------|
| `get_stats` | Dashboard statistics (revenue, orders) |
| `get_orders` | Retrieve all orders |
| `update_order_status` | Change the status of an order |
| `get_menu_items` | Retrieve all menu items |
| `add_menu_item` | Add a new menu item |
| `update_menu_item` | Edit an existing menu item |
| `delete_menu_item` | Remove a menu item |
| `upload_image` | Upload a menu item image |

---

## 📝 Notes

- The customer menu only displays items where `is_available = 1`.
- Cart data is stored server-side in the PHP session.
- Orders are saved to the `client_orders` table.
- Payment method is **Cash on Delivery** only.
- Menu images are stored under `uploads/menu/`.

---

## 🛠️ Technologies Used

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, JavaScript |
| Backend | PHP |
| Database | MySQL |
| Local Server | XAMPP (Apache + MySQL) |

---

*© 2026 Craveh. All rights reserved.*
