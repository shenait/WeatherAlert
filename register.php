<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
$host = 'localhost';
$dbname = 'weatheralert_db';
$username = 'root';
$password = '';

try {
    $db = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$pass = $input['password'] ?? '';
$name = $input['name'] ?? '';
$phone = $input['phone'] ?? '';
$parish = $input['parish'] ?? 'saint-george';

if (empty($email) || empty($pass) || empty($name)) {
    echo json_encode(['error' => 'Email, password, and name required']);
    exit();
}

// Check if user exists
$stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    echo json_encode(['error' => 'User with this email already exists']);
    exit();
}

// Create user
$hashedPassword = password_hash($pass, PASSWORD_BCRYPT);
$stmt = $db->prepare("INSERT INTO users (email, password, name, phone, parish, role) VALUES (?, ?, ?, ?, ?, 'user')");
$stmt->execute([$email, $hashedPassword, $name, $phone, $parish]);
$userId = $db->lastInsertId();

$user = [
    'id' => $userId,
    'email' => $email,
    'name' => $name,
    'phone' => $phone,
    'parish' => $parish,
    'role' => 'user',
    'alerts' => ['storms' => true, 'rain' => true]
];

echo json_encode([
    'success' => true, 
    'user' => $user, 
    'token' => base64_encode(json_encode($user))
]);
?>