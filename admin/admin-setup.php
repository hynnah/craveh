<?php
require_once __DIR__ . '/../api/config.php';

// This file helps create the first admin account
// Access: http://localhost/craveh/pages/admin-setup.php

$action = $_GET['action'] ?? '';

if ($action === 'create' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input['email']) || empty($input['password']) || empty($input['name'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Email, password, and name required']);
        exit;
    }

    if (strlen($input['password']) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Password must be at least 6 characters']);
        exit;
    }

    $mysqli = getDbConnection();
    
    // Check if admin already exists
    $result = $mysqli->query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
    $row = $result->fetch_assoc();
    
    if ($row['count'] > 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Admin account already exists. Delete it first if you need to recreate.']);
        exit;
    }

    $passwordHash = password_hash($input['password'], PASSWORD_BCRYPT);
    
    $stmt = $mysqli->prepare("INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, 'admin')");
    $stmt->bind_param("sss", $input['email'], $passwordHash, $input['name']);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Admin account created successfully. You can now login at admin-login.html',
            'adminId' => $stmt->insert_id
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to create admin account']);
    }
    $stmt->close();
    $mysqli->close();
    exit;
}

if ($action === 'check' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Content-Type: application/json');
    $mysqli = getDbConnection();
    $result = $mysqli->query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
    $row = $result->fetch_assoc();
    $mysqli->close();
    
    echo json_encode([
        'success' => true,
        'adminExists' => $row['count'] > 0,
        'adminCount' => $row['count']
    ]);
    exit;
}

// Return HTML form if accessed directly
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Setup - Craveh</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 400px;
      margin: 50px auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      text-align: center;
      color: #2c3e50;
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
      color: #333;
    }
    input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
      font-size: 14px;
    }
    input:focus {
      outline: none;
      border-color: #4CAF50;
    }
    button {
      width: 100%;
      padding: 12px;
      background-color: #34495e;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 10px;
    }
    button:hover {
      background-color: #34495e;
    }
    .message {
      text-align: center;
      margin-top: 15px;
      padding: 10px;
      border-radius: 4px;
    }
    .success {
      background-color: #d4edda;
      color: #2c3e50;
    }
    .error {
      background-color: #f8d7da;
      color: #721c24;
    }
    .note {
      background-color: #e7f3ff;
      color: #004085;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
      font-size: 14px;
      border-left: 4px solid #004085;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Craveh Admin Setup</h1>
    
    <div class="note">
      ⚠️ <strong>Important:</strong> This page should only be used once to create the first admin account. After that, delete or restrict access to this file.
    </div>

    <form id="setupForm">
      <div class="form-group">
        <label for="name">Admin Name *</label>
        <input type="text" id="name" required placeholder="e.g., John Doe">
      </div>

      <div class="form-group">
        <label for="email">Email *</label>
        <input type="email" id="email" required placeholder="admin@craveh.com">
      </div>

      <div class="form-group">
        <label for="password">Password (min 6 characters) *</label>
        <input type="password" id="password" required placeholder="Create a strong password">
      </div>

      <button type="submit">Create Admin Account</button>
    </form>

    <div id="message"></div>
  </div>

  <script>
    document.getElementById('setupForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const messageDiv = document.getElementById('message');

      try {
        const response = await fetch('admin-setup.php?action=create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (data.success) {
          messageDiv.className = 'message success';
          messageDiv.innerHTML = `<strong>✓ Success!</strong><br>${data.message}<br><br><a href="admin-login.html" style="color: #004085; text-decoration: underline;">Go to Admin Login</a>`;
          document.getElementById('setupForm').reset();
        } else {
          messageDiv.className = 'message error';
          messageDiv.textContent = data.error || 'Setup failed';
        }
      } catch (error) {
        console.error('Error:', error);
        messageDiv.className = 'message error';
        messageDiv.textContent = 'An error occurred. Please try again.';
      }
    });

    // Check if admin already exists
    async function checkAdmin() {
      try {
        const response = await fetch('admin-setup.php?action=check');
        const data = await response.json();
        
        if (data.adminExists) {
          document.getElementById('setupForm').style.display = 'none';
          const messageDiv = document.getElementById('message');
          messageDiv.className = 'message error';
          messageDiv.innerHTML = '<strong>Admin account already exists!</strong><br>Go to <a href="admin-login.html" style="color: #721c24; text-decoration: underline;">Admin Login</a> to access the system.';
        }
      } catch (error) {
        console.error('Error checking admin:', error);
      }
    }

    checkAdmin();
  </script>
</body>
</html>
