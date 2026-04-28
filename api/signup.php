<?php
header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON payload']);
    exit;
}

$requiredFields = ['email', 'password', 'name'];
foreach ($requiredFields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => "Missing or empty field: $field"]);
        exit;
    }
}

$mysqli = getDbConnection();

$stmt = $mysqli->prepare('SELECT id FROM users WHERE email = ?');
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Prepare failed']);
    exit;
}

$stmt->bind_param('s', $input['email']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['success' => false, 'error' => 'Email already exists']);
    exit;
}

$stmt->close();

$insertStmt = $mysqli->prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)');
if (!$insertStmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Insert prepare failed']);
    exit;
}

$hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
$insertStmt->bind_param('sss', $input['email'], $hashedPassword, $input['name']);
if (!$insertStmt->execute()) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Insert failed']);
    exit;
}

$userId = $insertStmt->insert_id;
$insertStmt->close();

$selectStmt = $mysqli->prepare('SELECT id, email, name, phone, delivery_address, created_at FROM users WHERE id = ?');
if (!$selectStmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Select prepare failed']);
    exit;
}

$selectStmt->bind_param('i', $userId);
$selectStmt->execute();
$result = $selectStmt->get_result();
$user = parseUserRow($result->fetch_assoc());
$selectStmt->close();
$mysqli->close();

$_SESSION['user'] = $user;

echo json_encode(['success' => true, 'user' => $user]);
