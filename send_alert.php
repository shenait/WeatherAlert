<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';
require_once 'Database.php';

$twilioSid = 'AC747f0b849f01b888d5771cf5c279d2d5';
$twilioToken = '2fdc89f2e2de56a2605ba4c2bb965ae7';
$twilioFrom = '+13636661642';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['message'])) {
    echo json_encode(['success' => false, 'error' => 'No message provided']);
    exit;
}

$message = $data['message'];
$parish = $data['parish'] ?? 'Grenada';
$adminEmail = $data['admin_email'] ?? 'unknown';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Get all users
    $stmt = $conn->prepare("SELECT id, name, email, phone FROM users WHERE role = 'user' AND phone IS NOT NULL AND phone != ''");
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $sentCount = 0;
    $errors = [];
    
    // Send SMS to each user
    foreach ($users as $user) {
        $phone = $user['phone'];
        
        // Format message
        $smsMessage = "⚠️ WEATHER ALERT - {$parish}\n\n{$message}\n\n- WeatherAlert Grenada";
        
        // Send via Twilio
        $url = "https://api.twilio.com/2010-04-01/Accounts/{$twilioSid}/Messages.json";
        
        $postData = [
            'From' => $twilioFrom,
            'To' => $phone,
            'Body' => $smsMessage
        ];
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
        curl_setopt($ch, CURLOPT_USERPWD, "{$twilioSid}:{$twilioToken}");
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 201) {
            $sentCount++;
            
        
            $insertStmt = $conn->prepare("INSERT INTO alerts (user_id, message, parish, sent_at) VALUES (?, ?, ?, NOW())");
            $insertStmt->execute([$user['id'], $message, $parish]);
        } else {
            $errors[] = "Failed to send to {$user['name']} ({$phone}): " . $response;
        }
    }
    
    // Save alert to file for admin 
    $alertData = [
        'timestamp' => date('Y-m-d H:i:s'),
        'message' => $message,
        'parish' => $parish,
        'admin_email' => $adminEmail,
        'sent_count' => $sentCount,
        'total_users' => count($users)
    ];
    
    $alertsDir = __DIR__ . '/alerts';
    if (!file_exists($alertsDir)) {
        mkdir($alertsDir, 0755, true);
    }
    
    $filename = $alertsDir . '/alert_' . time() . '.json';
    file_put_contents($filename, json_encode($alertData, JSON_PRETTY_PRINT));
    
    echo json_encode([
        'success' => true,
        'sent_count' => $sentCount,
        'total_users' => count($users),
        'errors' => $errors
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}