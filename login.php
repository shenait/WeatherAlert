<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

// ✅ LOCAL DATABASE SETTINGS
$host = 'weatheralert-db-weatheralert2026.b.aivencloud.com';
$dbname = 'defaultdb';
$username = 'avnadmin';
$password = 'AVNS_mXVXD6xJKHD2pYRmrhk';

try {
    $db = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
    exit();
}

// Get input
$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$passwordInput = $input['password'] ?? '';

if (!$email || !$passwordInput) {
    echo json_encode(['error' => 'Email and password required']);
    exit();
}

// Fetch user
$stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

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
    'user' => $user
]);
?>