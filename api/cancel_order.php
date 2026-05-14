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
if (!$input || empty($input['orderId'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Order ID required']);
    exit;
}

$mysqli = $conn;
$userId = $_SESSION['user']['id'];
$orderId = intval($input['orderId']);

// Check if order exists and belongs to user
$stmt = $mysqli->prepare('SELECT id, status, client_user_id FROM client_orders WHERE id = ?');
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error']);
    exit;
}

$stmt->bind_param('i', $orderId);
$stmt->execute();
$result = $stmt->get_result();
$order = $result->fetch_assoc();
$stmt->close();

if (!$order) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Order not found']);
    exit;
}

// Check if order belongs to current user
if ($order['client_user_id'] != $userId) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Access denied']);
    exit;
}

// Check if order can be cancelled (only pending and confirmed orders)
if (!in_array($order['status'], ['pending', 'confirmed'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Order cannot be cancelled at this stage']);
    exit;
}

// Update order status to cancelled
$updateStmt = $mysqli->prepare('UPDATE client_orders SET status = ? WHERE id = ?');
if (!$updateStmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error']);
    exit;
}

$cancelledStatus = 'cancelled';
$updateStmt->bind_param('si', $cancelledStatus, $orderId);

if ($updateStmt->execute()) {
    $updateStmt->close();
    $mysqli->close();
    echo json_encode(['success' => true, 'message' => 'Order cancelled successfully']);
} else {
    $updateStmt->close();
    $mysqli->close();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to cancel order']);
}