<?php
header('Content-Type: application/json');
session_start();

unset($_SESSION['admin']);
session_destroy();

echo json_encode(['success' => true]);
