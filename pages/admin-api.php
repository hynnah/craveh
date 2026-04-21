<?php
header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';

// Allow public read-only access for menu items
if ($action !== 'get_menu_items' && empty($_SESSION['admin'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

// ===== IMAGE UPLOAD (no DB needed) =====
if ($action === 'upload_image' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (empty($_FILES['image'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No file uploaded']);
        exit;
    }

    $file = $_FILES['image'];
    $allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!in_array($file['type'], $allowed)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Only JPG, PNG, GIF, WEBP allowed']);
        exit;
    }

    if ($file['size'] > 5 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'File must be under 5MB']);
        exit;
    }

    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('menu_') . '.' . $ext;
    $uploadDir = __DIR__ . '/../uploads/menu/';
    $dest = $uploadDir . $filename;

    if (move_uploaded_file($file['tmp_name'], $dest)) {
        echo json_encode(['success' => true, 'url' => '../uploads/menu/' . $filename]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Upload failed']);
    }
    exit;
}

$mysqli = getDbConnection();

// ===== MENU MANAGEMENT =====
if ($action === 'get_menu_items') {
    $result = $mysqli->query("SELECT id, name, description, price, image_url, category, is_available FROM menu_items ORDER BY category, name");
    $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
    }
    echo json_encode(['success' => true, 'items' => $items]);
    exit;
}

if ($action === 'get_menu_item' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $mysqli->prepare("SELECT id, name, description, price, image_url, category, is_available FROM menu_items WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $item = $result->fetch_assoc();
    $stmt->close();
    
    if ($item) {
        echo json_encode(['success' => true, 'item' => $item]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Item not found']);
    }
    exit;
}

if ($action === 'add_menu_item' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input['name']) || empty($input['price']) || empty($input['category'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Name, price, and category required']);
        exit;
    }

    $stmt = $mysqli->prepare("INSERT INTO menu_items (name, description, price, image_url, category, is_available) VALUES (?, ?, ?, ?, ?, ?)");
    $is_available = true;
    $stmt->bind_param("ssdssi", $input['name'], $input['description'], $input['price'], $input['image_url'], $input['category'], $is_available);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'id' => $stmt->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to add item']);
    }
    $stmt->close();
    exit;
}

if ($action === 'update_menu_item' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input['id']) || empty($input['name']) || empty($input['price'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'ID, name, and price required']);
        exit;
    }

    $stmt = $mysqli->prepare("UPDATE menu_items SET name = ?, description = ?, price = ?, image_url = ?, category = ?, is_available = ? WHERE id = ?");
    $stmt->bind_param("ssdssii", $input['name'], $input['description'], $input['price'], $input['image_url'], $input['category'], $input['is_available'], $input['id']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to update item']);
    }
    $stmt->close();
    exit;
}

if ($action === 'delete_menu_item' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'ID required']);
        exit;
    }

    $stmt = $mysqli->prepare("DELETE FROM menu_items WHERE id = ?");
    $stmt->bind_param("i", $input['id']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to delete item']);
    }
    $stmt->close();
    exit;
}

// ===== ORDER MANAGEMENT =====
if ($action === 'get_orders') {
    $status = $_GET['status'] ?? null;
    
    $query = "SELECT id, client_user_id, total_amount, delivery_address, phone, items, status, created_at FROM client_orders";
    if ($status) {
        $query .= " WHERE status = '" . $mysqli->real_escape_string($status) . "'";
    }
    $query .= " ORDER BY created_at DESC";
    
    $result = $mysqli->query($query);
    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $row['items'] = json_decode($row['items'], true);
        $orders[] = $row;
    }
    echo json_encode(['success' => true, 'orders' => $orders]);
    exit;
}

if ($action === 'get_order' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $mysqli->prepare("SELECT id, client_user_id, total_amount, delivery_address, phone, items, status, created_at FROM client_orders WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $order = $result->fetch_assoc();
    $stmt->close();
    
    if ($order) {
        $order['items'] = json_decode($order['items'], true);
        echo json_encode(['success' => true, 'order' => $order]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Order not found']);
    }
    exit;
}

if ($action === 'update_order_status' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input['id']) || empty($input['status'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'ID and status required']);
        exit;
    }

    $validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!in_array($input['status'], $validStatuses)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid status']);
        exit;
    }

    $stmt = $mysqli->prepare("UPDATE client_orders SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $input['status'], $input['id']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to update order']);
    }
    $stmt->close();
    exit;
}

// ===== DASHBOARD STATS =====
if ($action === 'get_stats') {
    $today = date('Y-m-d');
    
    // Today's revenue
    $result = $mysqli->query("SELECT SUM(total_amount) as total FROM client_orders WHERE DATE(created_at) = '$today'");
    $row = $result->fetch_assoc();
    $todayRevenue = $row['total'] ?? 0;
    
    // Pending orders count
    $result = $mysqli->query("SELECT COUNT(*) as count FROM client_orders WHERE status IN ('pending', 'confirmed', 'preparing')");
    $row = $result->fetch_assoc();
    $pendingOrders = $row['count'];
    
    // Total orders today
    $result = $mysqli->query("SELECT COUNT(*) as count FROM client_orders WHERE DATE(created_at) = '$today'");
    $row = $result->fetch_assoc();
    $totalOrdersToday = $row['count'];
    
    // Recent orders
    $result = $mysqli->query("SELECT id, status, total_amount, created_at FROM client_orders ORDER BY created_at DESC LIMIT 5");
    $recentOrders = [];
    while ($row = $result->fetch_assoc()) {
        $recentOrders[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'todayRevenue' => floatval($todayRevenue),
        'pendingOrders' => $pendingOrders,
        'totalOrdersToday' => $totalOrdersToday,
        'recentOrders' => $recentOrders
    ]);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid action']);
