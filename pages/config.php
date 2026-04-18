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
        echo json_encode(['success' => false, 'error' => 'Database connection failed']);
        exit;
    }

    $mysqli->set_charset('utf8mb4');
    $mysqli->query("CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $mysqli->select_db($dbName);

    $mysqli->query("CREATE TABLE IF NOT EXISTS `users` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `email` VARCHAR(255) UNIQUE NOT NULL,
        `password_hash` VARCHAR(255) NOT NULL,
        `name` VARCHAR(255) NOT NULL,
        `phone` VARCHAR(50),
        `delivery_address` TEXT,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

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

    return $mysqli;
}

function parseUserRow($user) {
    if ($user && $user['delivery_address']) {
        $user['delivery_address'] = json_decode($user['delivery_address'], true);
    }
    return $user;
}
