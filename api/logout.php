<?php
header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/config.php';

// Save cart to database before logout if user is logged in
if (isset($_SESSION['user']['id']) && isset($_SESSION['cart'])) {
    $userId = $_SESSION['user']['id'];
    $cartJson = json_encode($_SESSION['cart']);
    $stmt = $conn->prepare('INSERT INTO user_carts (user_id, cart_data) VALUES (?, ?) ON DUPLICATE KEY UPDATE cart_data = ?, updated_at = CURRENT_TIMESTAMP');
    $stmt->bind_param('iss', $userId, $cartJson, $cartJson);
    $stmt->execute();
    $stmt->close();
}

$_SESSION = [];
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params['path'], $params['domain'],
        $params['secure'], $params['httponly']
    );
}
session_destroy();

echo json_encode(['success' => true]);
