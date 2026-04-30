<?php
ini_set('serialize_precision', 14);

function getDbConnection() {
    $dbHost = '127.0.0.1';
    $dbUser = 'root';
    $dbPass = '';
    $dbName = 'craveh_db';

    $mysqli = new mysqli($dbHost, $dbUser, $dbPass);
    if ($mysqli->connect_error) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $mysqli->connect_error]);
        exit;
    }

    $mysqli->set_charset('utf8mb4');
    
    if (!$mysqli->query("CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Could not create database: ' . $mysqli->error]);
        exit;
    }
    
    if (!$mysqli->select_db($dbName)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Could not select database: ' . $mysqli->error]);
        exit;
    }

    $mysqli->query("CREATE TABLE IF NOT EXISTS `users` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `email` VARCHAR(255) UNIQUE NOT NULL,
        `password_hash` VARCHAR(255) NOT NULL,
        `name` VARCHAR(255) NOT NULL,
        `phone` VARCHAR(50),
        `role` ENUM('admin', 'customer') DEFAULT 'customer',
        `delivery_address` JSON,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    $mysqli->query("CREATE TABLE IF NOT EXISTS `client_orders` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `client_user_id` VARCHAR(50) NOT NULL,
        `total_amount` DECIMAL(10,2) NOT NULL,
        `delivery_address` TEXT NOT NULL,
        `phone` VARCHAR(50) NOT NULL,
        `items` TEXT NOT NULL,
        `status` VARCHAR(50) DEFAULT 'pending',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $mysqli->query("CREATE TABLE IF NOT EXISTS `menu_items` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(255) NOT NULL,
        `description` TEXT,
        `price` DECIMAL(10,2) NOT NULL,
        `image_url` VARCHAR(500),
        `category` VARCHAR(100),
        `is_available` BOOLEAN DEFAULT TRUE,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_available (is_available)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Insert default menu items if table is empty
    $result = $mysqli->query("SELECT COUNT(*) as count FROM menu_items");
    $row = $result->fetch_assoc();
    if ($row['count'] == 0) {
        $defaultItems = [
            ['Classic Burger', 'Juicy beef patty with lettuce, tomato, and special sauce', 12.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', 'Burgers'],
            ['Margherita Pizza', 'Fresh mozzarella, basil, and tomato sauce', 14.99, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop', 'Pizza'],
            ['Caesar Salad', 'Crisp romaine lettuce with parmesan and croutons', 9.99, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop', 'Salads'],
            ['Chicken Wings', 'Crispy wings with your choice of sauce', 11.99, 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&h=300&fit=crop', 'Appetizers'],
            ['Spaghetti Carbonara', 'Creamy pasta with bacon and parmesan', 13.99, 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop', 'Pasta'],
            ['Fish & Chips', 'Crispy battered fish with golden fries', 15.99, 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=400&h=300&fit=crop', 'Seafood'],
            ['BBQ Ribs', 'Tender ribs with smoky BBQ sauce', 18.99, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop', 'BBQ'],
            ['Tacos', 'Three soft tacos with your choice of protein', 10.99, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop', 'Mexican'],
            ['Pepperoni Pizza', 'Classic pepperoni with mozzarella cheese', 15.99, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop', 'Pizza'],
            ['Grilled Salmon', 'Fresh Atlantic salmon with herbs', 19.99, 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=400&h=300&fit=crop', 'Seafood'],
            ['Chicken Alfredo', 'Fettuccine pasta with creamy alfredo sauce', 14.99, 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400&h=300&fit=crop', 'Pasta'],
            ['Greek Salad', 'Fresh vegetables with feta cheese and olives', 10.99, 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop', 'Salads'],
            ['Cheeseburger', 'Double beef patty with melted cheddar cheese', 13.99, 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&h=300&fit=crop', 'Burgers'],
            ['Hawaiian Pizza', 'Ham and pineapple with mozzarella', 15.99, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop', 'Pizza'],
            ['Mozzarella Sticks', 'Crispy breaded mozzarella with marinara', 8.99, 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=400&h=300&fit=crop', 'Appetizers'],
            ['Beef Burrito', 'Large flour tortilla filled with seasoned beef', 12.99, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop', 'Mexican']
        ];
        
        foreach ($defaultItems as $item) {
            $stmt = $mysqli->prepare("INSERT INTO menu_items (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param("ssdss", $item[0], $item[1], $item[2], $item[3], $item[4]);
            $stmt->execute();
            $stmt->close();
        }
    }

    return $mysqli;
}

function parseUserRow($user) {
    if ($user && isset($user['delivery_address']) && !empty($user['delivery_address'])) {
        $decoded = json_decode($user['delivery_address'], true);
        $user['delivery_address'] = $decoded !== null ? $decoded : null;
    } else {
        $user['delivery_address'] = null;
    }
    return $user;
}
