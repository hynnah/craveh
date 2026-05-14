<?php
header('Content-Type: application/json');
ini_set('serialize_precision', 14);
session_start();
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['action'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid request']);
    exit;
}

action: {
    $action = $input['action'];
    if ($action === 'get') {
        echo json_encode(['success' => true, 'cart' => $_SESSION['cart'] ?? []]);
        exit;
    }
    if ($action === 'save') {
        $cart = $input['cart'] ?? [];
        if (!is_array($cart)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Cart must be an array']);
            exit;
        }
        $_SESSION['cart'] = $cart;
        
        // Save to database if user is logged in
        if (isset($_SESSION['user']['id'])) {
            $userId = $_SESSION['user']['id'];
            $cartJson = json_encode($cart);
            $stmt = $conn->prepare('INSERT INTO user_carts (user_id, cart_data) VALUES (?, ?) ON DUPLICATE KEY UPDATE cart_data = ?, updated_at = CURRENT_TIMESTAMP');
            $stmt->bind_param('iss', $userId, $cartJson, $cartJson);
            $stmt->execute();
            $stmt->close();
        }
        
        echo json_encode(['success' => true]);
        exit;
    }
    if ($action === 'clear') {
        $_SESSION['cart'] = [];
        
        // Clear from database if user is logged in
        if (isset($_SESSION['user']['id'])) {
            $userId = $_SESSION['user']['id'];
            $stmt = $conn->prepare('DELETE FROM user_carts WHERE user_id = ?');
            $stmt->bind_param('i', $userId);
            $stmt->execute();
            $stmt->close();
        }
        
        echo json_encode(['success' => true]);
        exit;
    }
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Unknown cart action']);
