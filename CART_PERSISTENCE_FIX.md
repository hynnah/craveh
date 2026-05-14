# Cart Persistence Fix

## Problem
When a logged-in user adds items to their cart and then logs out, the cart items are lost when they log back in. This happens because the cart was only stored in the PHP session, which gets destroyed on logout.

## Solution
Implemented persistent cart storage using a database table that saves the cart for logged-in users.

## Changes Made

### 1. Database Schema (`db/MYSQL_SCHEMA.sql`)
Added a new `user_carts` table:
```sql
CREATE TABLE IF NOT EXISTS user_carts (
    user_id INT PRIMARY KEY,
    cart_data JSON NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 2. Cart API (`api/cart.php`)
- When a logged-in user saves their cart, it's now stored in both the session AND the database
- When a logged-in user clears their cart, it's removed from both the session AND the database

### 3. Login API (`api/login.php`)
- When a user logs in, their saved cart is automatically restored from the database
- If no saved cart exists, an empty cart is initialized

### 4. Logout API (`api/logout.php`)
- Before destroying the session, the current cart is saved to the database
- This ensures the cart is preserved even if the user logs out

### 5. Migration Script (`db/migrate_user_carts.php`)
- Created a migration script to add the `user_carts` table to existing databases
- Already executed successfully ✓

## How It Works

1. **Adding items to cart (logged in)**: Cart is saved to both session and database
2. **Logging out**: Cart is saved to database before session is destroyed
3. **Logging in**: Cart is restored from database into the new session
4. **Guest users**: Cart remains in session only (not persisted)

## Testing Steps

1. Log in as a customer
2. Add items to the cart
3. Log out
4. Log back in
5. Verify that the cart items are still there

## Notes

- Guest users (not logged in) will still lose their cart if they close the browser, as their cart is only stored in the session
- Only logged-in users benefit from persistent cart storage
- The cart is automatically synced to the database whenever it's updated
