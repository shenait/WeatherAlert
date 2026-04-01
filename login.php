<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
$host = 'sql.freedb.tech';
$dbname = 'freedb_weatheralert-db';
$username = 'freedb_shenai';
$password = '';

try {
    $db = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['error' => 'Email and password required']);
    exit();
}

// Check if admin
if ($email === 'shenaithomas0323@gmail.com' && $password === 'WeatherAdmin2024!') {
    $user = [
        'id' => 0,
        'email' => 'shenaithomas0323@gmail.com',
        'name' => 'System Administrator',
        'role' => 'admin',
        'parish' => 'saint-george'
    ];
    echo json_encode([
        'success' => true, 
        'user' => $user, 
        'token' => base64_encode(json_encode($user))
    ]);
    exit();
}

// Check regular user
$stmt = $db->prepare("SELECT id, email, password, name, phone, parish, role, alert_storms, alert_rain FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user['password'])) {
    echo json_encode(['error' => 'Invalid email or password']);
    exit();
}

unset($user['password']);
$user['alerts'] = [
    'storms' => (bool)$user['alert_storms'],
    'rain' => (bool)$user['alert_rain']
];
unset($user['alert_storms'], $user['alert_rain']);

echo json_encode([
    'success' => true, 
    'user' => $user, 
    'token' => base64_encode(json_encode($user))
]);
?>