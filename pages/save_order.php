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

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON payload']);
    exit;
}

$requiredFields = ['userId', 'total', 'address', 'phone', 'items'];
foreach ($requiredFields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => "Missing or empty field: $field"]);
        exit;
    }
}

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
    echo json_encode(['success' => false, 'error' => 'Failed to create orders table: ' . $mysqli->error]);
    exit;
}

$itemsJson = json_encode($input['items']);
if ($itemsJson === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to encode items']);
    exit;
}

$stmt = $mysqli->prepare(
    'INSERT INTO `client_orders` (`client_user_id`, `total_amount`, `delivery_address`, `phone`, `items`, `status`) VALUES (?, ?, ?, ?, ?, ?)' 
);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Prepare failed: ' . $mysqli->error]);
    exit;
}

$status = 'pending';
$stmt->bind_param(
    'sdssss',
    $input['userId'],
    $input['total'],
    $input['address'],
    $input['phone'],
    $itemsJson,
    $status
);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Insert failed: ' . $stmt->error]);
    exit;
}

$orderId = $stmt->insert_id;
$stmt->close();
$mysqli->close();

echo json_encode(['success' => true, 'orderId' => $orderId]);
