-- Create database
CREATE DATABASE IF NOT EXISTS craveh_db;
USE craveh_db;

-- Users table for authentication
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Menu items table
CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    category VARCHAR(100),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    delivery_address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    status ENUM('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order items table (junction table for orders and menu items)
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT,
    INDEX idx_order_id (order_id),
    INDEX idx_menu_item_id (menu_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample menu items
INSERT INTO menu_items (name, description, price, image_url, category) VALUES
('Classic Burger', 'Juicy beef patty with lettuce, tomato, and special sauce', 12.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', 'Burgers'),
('Margherita Pizza', 'Fresh mozzarella, basil, and tomato sauce', 14.99, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002', 'Pizza'),
('Caesar Salad', 'Crisp romaine lettuce with parmesan and croutons', 9.99, 'https://images.unsplash.com/photo-1546793665-c74683f339c1', 'Salads'),
('Chicken Wings', 'Crispy wings with your choice of sauce', 11.99, 'https://images.unsplash.com/photo-1608039755401-742074f0548d', 'Appetizers'),
('Spaghetti Carbonara', 'Creamy pasta with bacon and parmesan', 13.99, 'https://images.unsplash.com/photo-1612874742237-6526221588e3', 'Pasta'),
('Fish & Chips', 'Crispy battered fish with golden fries', 15.99, 'https://images.unsplash.com/photo-1579208575657-c595a05383b7', 'Seafood'),
('BBQ Ribs', 'Tender ribs with smoky BBQ sauce', 18.99, 'https://images.unsplash.com/photo-1544025162-d76694265947', 'BBQ'),
('Tacos', 'Three soft tacos with your choice of protein', 10.99, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47', 'Mexican');
