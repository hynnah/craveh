<?php
header('Content-Type: application/json');
session_start();

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
        echo json_encode(['success' => true]);
        exit;
    }
    if ($action === 'clear') {
        $_SESSION['cart'] = [];
        echo json_encode(['success' => true]);
        exit;
    }
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Unknown cart action']);
