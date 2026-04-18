<?php
header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/config.php';

if (empty($_SESSION['user']['id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not logged in']);
    exit;
}

$mysqli = getDbConnection();

$stmt = $mysqli->prepare('SELECT id, total_amount, delivery_address, phone, items, status, created_at FROM client_orders WHERE client_user_id = ? ORDER BY created_at DESC');
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Prepare failed']);
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
