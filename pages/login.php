<?php
header('Content-Type: application/json');
session_start();

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

$requiredFields = ['email', 'password'];
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

$createTable = "CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

if (!$mysqli->query($createTable)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to create users table: ' . $mysqli->error]);
    exit;
}

$stmt = $mysqli->prepare('SELECT id, email, name, created_at FROM users WHERE email = ? AND password_hash = ?');
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Prepare failed: ' . $mysqli->error]);
    exit;
}

$stmt->bind_param('ss', $input['email'], $input['password']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Invalid email or password']);
    exit;
}

$user = $result->fetch_assoc();
$stmt->close();
$mysqli->close();

$_SESSION['user'] = $user;

echo json_encode(['success' => true, 'user' => $user]);
