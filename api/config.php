<?php
$db_config = [
    'local' => [
        'host' => 'localhost',
        'user' => 'root',
        'pass' => '',
        'name' => 'craveh_db'
    ],
    'online' => [
        'host' => 'localhost', 
        'user' => 's22800098_craveh_db',
        'pass' => 'Manondo22800098!',
        'name' => 's22800098_craveh_db'
    ]
];

// Auto-detect environment
if (isset($_SERVER['SERVER_NAME']) && 
    ($_SERVER['SERVER_NAME'] == 'craveh.dcism.org')) {
    $environment = 'online';
} else {
    $environment = 'local';
}

$config = $db_config[$environment];
$conn = @mysqli_connect($config['host'], $config['user'], $config['pass'], $config['name']);

if (!$conn) {
    http_response_code(500);
    die(json_encode(['success' => false, 'error' => 'Database connection failed']));
}

mysqli_set_charset($conn, "utf8mb4");
?>
