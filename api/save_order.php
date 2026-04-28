<?php
header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/config.php';

if (empty($_SESSION['user']['id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not logged in']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON payload']);
    exit;
}

$requiredFields = ['userId', 'address', 'phone', 'items'];
foreach ($requiredFields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => "Missing or empty field: $field"]);
        exit;
    }
}

if (strlen(trim($input['address'])) < 10) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Address must be at least 10 characters']);
    exit;
}

if (!preg_match('/^\d{7,15}$/', trim($input['phone']))) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Phone must be 7-15 digits']);
    exit;
}

if ($input['userId'] != $_SESSION['user']['id']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'User ID mismatch']);
    exit;
}

$mysqli = getDbConnection();

$totalAmount = 0.0;
foreach ($input['items'] as $item) {
    if (empty($item['price']) || empty($item['quantity'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Each item must have price and quantity']);
        exit;
    }
    $totalAmount += floatval($item['price']) * intval($item['quantity']);
}
$totalAmount = round($totalAmount, 2);

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
    echo json_encode(['success' => false, 'error' => 'Prepare failed']);
    exit;
}

$status = 'pending';
$stmt->bind_param(
    'sdssss',
    $input['userId'],
    $totalAmount,
    $input['address'],
    $input['phone'],
    $itemsJson,
    $status
);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Insert failed']);
    exit;
}

$orderId = $stmt->insert_id;
$stmt->close();
$mysqli->close();

echo json_encode(['success' => true, 'orderId' => $orderId]);
