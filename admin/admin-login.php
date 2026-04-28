<?php
header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/../api/config.php';

$input = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (empty($input['email']) || empty($input['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Email and password required']);
        exit;
    }

    $mysqli = getDbConnection();
    $email = trim($input['email']);
    
    $stmt = $mysqli->prepare("SELECT id, email, password_hash, name, role FROM users WHERE email = ? AND role = 'admin'");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();

    if ($user && password_verify($input['password'], $user['password_hash'])) {
        $_SESSION['admin'] = [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name']
        ];
        
        echo json_encode([
            'success' => true,
            'admin' => $_SESSION['admin']
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
    }

    $mysqli->close();
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
