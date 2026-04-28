<?php
header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/../api/config.php';

if (empty($_SESSION['admin'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true);
$mysqli = getDbConnection();
$adminId = $_SESSION['admin']['id'];

// Get admin profile
if ($action === 'get' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $mysqli->prepare("SELECT id, email, name, phone FROM users WHERE id = ? AND role = 'admin'");
    $stmt->bind_param("i", $adminId);
    $stmt->execute();
    $result = $stmt->get_result();
    $admin = $result->fetch_assoc();
    $stmt->close();
    
    if ($admin) {
        echo json_encode(['success' => true, 'admin' => $admin]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Admin not found']);
    }
    exit;
}

// Update admin profile
if ($action === 'update' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (empty($input['name'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Name required']);
        exit;
    }

    $stmt = $mysqli->prepare("UPDATE users SET name = ?, phone = ? WHERE id = ? AND role = 'admin'");
    $stmt->bind_param("ssi", $input['name'], $input['phone'], $adminId);
    
    if ($stmt->execute()) {
        $_SESSION['admin']['name'] = $input['name'];
        echo json_encode(['success' => true, 'admin' => $_SESSION['admin']]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to update profile']);
    }
    $stmt->close();
    exit;
}

// Change password
if ($action === 'change_password' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (empty($input['currentPassword']) || empty($input['newPassword'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Current and new passwords required']);
        exit;
    }

    $stmt = $mysqli->prepare("SELECT password_hash FROM users WHERE id = ? AND role = 'admin'");
    $stmt->bind_param("i", $adminId);
    $stmt->execute();
    $result = $stmt->get_result();
    $admin = $result->fetch_assoc();
    $stmt->close();

    if (!$admin || !password_verify($input['currentPassword'], $admin['password_hash'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Current password is incorrect']);
        exit;
    }

    $newHash = password_hash($input['newPassword'], PASSWORD_BCRYPT);
    $stmt = $mysqli->prepare("UPDATE users SET password_hash = ? WHERE id = ? AND role = 'admin'");
    $stmt->bind_param("si", $newHash, $adminId);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Password changed successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to change password']);
    }
    $stmt->close();
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid action']);
