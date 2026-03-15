<?php
function getUsers($db) {
    // Admin only
    $users = $db->fetchAll(
        "SELECT id, email, name, phone, parish, role, alert_storms, alert_rain, created_at 
         FROM users 
         WHERE role = 'user' 
         ORDER BY created_at DESC"
    );
    
    foreach ($users as &$user) {
        $user['alerts'] = [
            'storms' => (bool)$user['alert_storms'],
            'rain' => (bool)$user['alert_rain']
        ];
        unset($user['alert_storms'], $user['alert_rain']);
    }
    
    echo json_encode(['success' => true, 'users' => $users]);
}

function updateUser($db, $userId) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $allowedFields = ['name', 'phone', 'parish', 'alert_storms', 'alert_rain'];
    $updateData = [];
    
    foreach ($allowedFields as $field) {
        if (isset($input[$field])) {
            $updateData[$field] = $input[$field];
        }
    }
    
    if (empty($updateData)) {
        http_response_code(400);
        echo json_encode(['error' => 'No valid fields to update']);
        return;
    }
    
    $db->update('users', $updateData, 'id = :id', ['id' => $userId]);
    
    $user = $db->fetchOne(
        "SELECT id, email, name, phone, parish, role, alert_storms, alert_rain 
         FROM users WHERE id = ?",
        [$userId]
    );
    
    $user['alerts'] = [
        'storms' => (bool)$user['alert_storms'],
        'rain' => (bool)$user['alert_rain']
    ];
    unset($user['alert_storms'], $user['alert_rain']);
    
    echo json_encode(['success' => true, 'user' => $user]);
}
?>
