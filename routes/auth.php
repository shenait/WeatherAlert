<?php
function login($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password required']);
        return;
    }
    
    // Check if admin
    if ($email === ADMIN_EMAIL && password_verify($password, ADMIN_PASSWORD)) {
        $user = [
            'id' => 0,
            'email' => ADMIN_EMAIL,
            'name' => 'System Administrator',
            'role' => 'admin',
            'parish' => 'saint-george'
        ];
        echo json_encode(['success' => true, 'user' => $user, 'token' => generateToken($user)]);
        return;
    }
    
    // Check regular user
    $user = $db->fetchOne(
        "SELECT id, email, password, name, phone, parish, role, alert_storms, alert_rain 
         FROM users WHERE email = ?",
        [$email]
    );
    
    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid email or password']);
        return;
    }
    
    unset($user['password']);
    $user['alerts'] = [
        'storms' => (bool)$user['alert_storms'],
        'rain' => (bool)$user['alert_rain']
    ];
    unset($user['alert_storms'], $user['alert_rain']);
    
    echo json_encode(['success' => true, 'user' => $user, 'token' => generateToken($user)]);
}

function register($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $name = $input['name'] ?? '';
    $phone = $input['phone'] ?? '';
    $parish = $input['parish'] ?? 'saint-george';
    
    if (empty($email) || empty($password) || empty($name)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email, password, and name required']);
        return;
    }
    
    // Check if user exists
    $existing = $db->fetchOne("SELECT id FROM users WHERE email = ?", [$email]);
    if ($existing) {
        http_response_code(409);
        echo json_encode(['error' => 'User with this email already exists']);
        return;
    }
    
    // Create user
    $userId = $db->insert('users', [
        'email' => $email,
        'password' => password_hash($password, PASSWORD_BCRYPT),
        'name' => $name,
        'phone' => $phone,
        'parish' => $parish,
        'role' => 'user'
    ]);
    
    $user = [
        'id' => $userId,
        'email' => $email,
        'name' => $name,
        'phone' => $phone,
        'parish' => $parish,
        'role' => 'user',
        'alerts' => ['storms' => true, 'rain' => true]
    ];
    
    echo json_encode(['success' => true, 'user' => $user, 'token' => generateToken($user)]);
}

function generateToken($user) {
    $payload = [
        'id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'exp' => time() + (7 * 24 * 60 * 60) // 7 days
    ];
    
    // Simple JWT (in production, use a proper JWT library)
    return base64_encode(json_encode($payload));
}
?>
