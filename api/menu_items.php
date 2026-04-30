<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

$mysqli = getDbConnection();

$result = $mysqli->query(
    "SELECT id, name, description, price, image_url, category
     FROM menu_items
     WHERE is_available = 1
     ORDER BY id"
);

if (!$result) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to load menu items']);
    exit;
}

$items = [];
while ($row = $result->fetch_assoc()) {
    $items[] = [
        'id' => (string) $row['id'],
        'name' => $row['name'],
        'description' => $row['description'] ?? '',
        'price' => (float) $row['price'],
        'image' => $row['image_url'] ?? '',
        'category' => $row['category'] ?? 'Other',
    ];
}

$result->free();
$mysqli->close();

echo json_encode(['success' => true, 'items' => $items]);
