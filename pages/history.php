<?php
header('Content-Type: application/json');
session_start();

if (empty($_SESSION['user']['id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not logged in']);
    exit;
}

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
$createDb = $mysqli->query("CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
if (!$createDb) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to create database: ' . $mysqli->error]);
    exit;
}

$mysqli->select_db($dbName);

$createTable = "CREATE TABLE IF NOT EXISTS `client_orders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `client_user_id` VARCHAR(50) NOT NULL,
    `total_amount` DECIMAL(10,2) NOT NULL,
    `delivery_address` TEXT NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `items` TEXT NOT NULL,
    `status` VARCHAR(50) DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

if (!$mysqli->query($createTable)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to create client_orders table: ' . $mysqli->error]);
    exit;
}

$stmt = $mysqli->prepare('SELECT id, total_amount, delivery_address, phone, items, status, created_at FROM client_orders WHERE client_user_id = ? ORDER BY created_at DESC');
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Prepare failed: ' . $mysqli->error]);
    exit;
}

$userId = $_SESSION['user']['id'];
$stmt->bind_param('s', $userId);
$stmt->execute();
$result = $stmt->get_result();

$orders = [];
while ($row = $result->fetch_assoc()) {
    $row['items'] = json_decode($row['items'], true) ?: [];
    $orders[] = $row;
}

$stmt->close();
$mysqli->close();

echo json_encode(['success' => true, 'orders' => $orders]);
