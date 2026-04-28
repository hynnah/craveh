<?php
header('Content-Type: application/json');
ini_set('serialize_precision', 14);
session_start();

$user = $_SESSION['user'] ?? null;
$cart = $_SESSION['cart'] ?? [];

echo json_encode([
    'success' => true,
    'user' => $user,
    'cart' => $cart
]);
