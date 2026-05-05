<?php
header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/config.php';

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

$mysqli = $conn;

$stmt = $mysqli->prepare('SELECT id, email, name, phone, delivery_address, password_hash, created_at FROM users WHERE email = ?');
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Prepare failed']);
    exit;
}

$stmt->bind_param('s', $input['email']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Invalid email or password']);
    exit;
}

$user = $result->fetch_assoc();

if (!password_verify($input['password'], $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Invalid email or password']);
    exit;
}

unset($user['password_hash']);

// Parse delivery_address JSON
if ($user && isset($user['delivery_address']) && !empty($user['delivery_address'])) {
    $decoded = json_decode($user['delivery_address'], true);
    $user['delivery_address'] = $decoded !== null ? $decoded : null;
} else {
    $user['delivery_address'] = null;
}

$stmt->close();
$mysqli->close();

$_SESSION['user'] = $user;

echo json_encode(['success' => true, 'user' => $user]);
