<?php
header('Content-Type: application/json');
session_start();

if (isset($_SESSION['admin'])) {
    echo json_encode([
        'success' => true,
        'admin' => $_SESSION['admin']
    ]);
} else {
    echo json_encode([
        'success' => false,
        'admin' => null
    ]);
}
