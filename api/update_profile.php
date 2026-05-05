<?php
header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/config.php';

if (empty($_SESSION['user']['id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not logged in']);
    exit;
}

$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON payload']);
    exit;
}

$mysqli = $conn;

$phone = isset($input['phone']) && $input['phone'] !== null ? trim($input['phone']) : null;
$deliveryAddress = isset($input['delivery_address']) && is_array($input['delivery_address'])
    ? json_encode($input['delivery_address'])
    : null;

$stmt = $mysqli->prepare('UPDATE users SET phone = ?, delivery_address = ? WHERE id = ?');
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Update failed']);
    exit;
}

$userId = $_SESSION['user']['id'];
$stmt->bind_param('ssi', $phone, $deliveryAddress, $userId);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Update failed']);
    exit;
}

$stmt->close();

$sel = $mysqli->prepare('SELECT id, email, name, phone, delivery_address, created_at FROM users WHERE id = ?');
if (!$sel) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to refresh profile']);
    exit;
}

$sel->bind_param('i', $userId);
$sel->execute();
$result = $sel->get_result();
$user = $result->fetch_assoc();

if ($user && isset($user['delivery_address']) && !empty($user['delivery_address'])) {
    $decoded = json_decode($user['delivery_address'], true);
    $user['delivery_address'] = $decoded !== null ? $decoded : null;
} else {
    $user['delivery_address'] = null;
}

$sel->close();
$mysqli->close();

$_SESSION['user'] = $user;

echo json_encode(['success' => true, 'user' => $user]);
