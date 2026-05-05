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

if (isset($_SERVER['SERVER_NAME']) && ($_SERVER['SERVER_NAME'] == 'theobscuredindex.cism.org' || $_SERVER['SERVER_NAME'] == 'theobscuredindex.dinnesh-nicole.com')) {
    $environment = 'online';
} else if (isset($_SERVER['SERVER_NAME']) && ($_SERVER['SERVER_NAME'] == 'localhost' || $_SERVER['SERVER_NAME'] == '127.0.0.1')) {
    $environment = 'local';
} else if (isset($_SERVER['SERVER_ADDR']) && $_SERVER['SERVER_ADDR'] == '127.0.0.1') {
    $environment = 'local';
} else {
    $environment = 'online';
}

$config = $db_config[$environment];

$conn = @mysqli_connect($config['host'], $config['user'], $config['pass'], $config['name']);

if (!$conn) {
    error_log("Database connection failed: " . mysqli_connect_error());
    
    echo "<div style='color:red; padding:20px; margin:20px; border:1px solid red; background:#fff;'>";
    echo "<h3>Connection Error</h3>";
    echo "<p>Could not connect to the database. Please check your connection settings.</p>";
    echo "<p>Server: " . (isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : 'unknown') . "</p>";
    echo "<p>Environment: " . $environment . "</p>";
    echo "<p>Error: " . mysqli_connect_error() . "</p>";
    echo "</div>";
    exit;
}

mysqli_set_charset($conn, "utf8mb4");
?>
