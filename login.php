<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

$host     = 'weatheralert-db-weatheralert2026.b.aivencloud.com';
$port     = '18209'; 
$dbname   = 'defaultdb';
$username = 'avnadmin';
$password = 'AVNS_mXVXD6xJKHD2pYRmrhk';

try {
    $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false, // SSL required by Aiven
    ];
    $db = new PDO($dsn, $username, $password, $options);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

// Get input
$input         = json_decode(file_get_contents('php://input'), true);
$email         = trim($input['email'] ?? '');
$passwordInput = $input['password'] ?? '';

if (!$email || !$passwordInput) {
    echo json_encode(['error' => 'Email and password required']);
    exit();
}

// Fetch user
$stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
    echo json_encode(['error' => 'User not found']);
    exit();
}

// Verify password
if (!password_verify($passwordInput, $user['password'])) {
    echo json_encode(['error' => 'Invalid password']);
    exit();
}

// Clean response
unset($user['password']);

echo json_encode([
    'success' => true,
    'user'    => $user
]);
?>