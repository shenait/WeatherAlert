<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Twilio credentials
define('TWILIO_ACCOUNT_SID', 'AC747f0b849f01b888d5771cf5c279d2d5');
define('TWILIO_AUTH_TOKEN', 'ad98d0a95199d811f77abd6710e6cd5c');
define('TWILIO_FROM_NUMBER', '+13636661642');

// Database connection
$host = 'localhost';
$dbname = 'weatheralert_db';
$username = 'root';
$password = '';

try {
    $db = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit();
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);
$message = $input['message'] ?? '';
$parish = $input['parish'] ?? 'Grenada';
$adminEmail = $input['admin_email'] ?? '';

if (empty($message)) {
    echo json_encode(['success' => false, 'error' => 'Message is required']);
    exit();
}

// Get all users with phone numbers
$stmt = $db->prepare("SELECT id, email, name, phone FROM users WHERE role = 'user' AND phone IS NOT NULL AND phone != ''");
$stmt->execute();
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($users)) {
    echo json_encode(['success' => true, 'sent_count' => 0, 'message' => 'No users with phone numbers']);
    exit();
}

$sentCount = 0;
$failedCount = 0;

// Format SMS message
$smsBody = "🚨 WEATHER ALERT - {$parish}\n\n";
$smsBody .= "{$message}\n\n";
$smsBody .= "Follow NADMA advisories.\nTune to GIS Radio 535 AM.";

foreach ($users as $user) {
    try {
        // Send via Twilio
        $url = "https://api.twilio.com/2010-04-01/Accounts/" . TWILIO_ACCOUNT_SID . "/Messages.json";
        
        $data = [
            'To' => $user['phone'],
            'From' => TWILIO_FROM_NUMBER,
            'Body' => $smsBody
        ];
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_USERPWD, TWILIO_ACCOUNT_SID . ':' . TWILIO_AUTH_TOKEN);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 200 && $httpCode < 300) {
            $sentCount++;
            
            // Store alert in user's alert history (using JSON in a text file or could be database)
            // For simplicity, we'll create a simple log
            $alertData = [
                'message' => $message,
                'parish' => $parish,
                'timestamp' => date('Y-m-d H:i:s'),
                'sent_by' => 'admin'
            ];
            
            // Store in a simple way that React can read
            $userAlertsFile = __DIR__ . "/user_alerts_{$user['email']}.json";
            $existingAlerts = [];
            if (file_exists($userAlertsFile)) {
                $existingAlerts = json_decode(file_get_contents($userAlertsFile), true) ?: [];
            }
            array_unshift($existingAlerts, $alertData);
            $existingAlerts = array_slice($existingAlerts, 0, 50); // Keep last 50
            file_put_contents($userAlertsFile, json_encode($existingAlerts));
            
        } else {
            $failedCount++;
        }
    } catch (Exception $e) {
        $failedCount++;
        error_log("Failed to send SMS to {$user['email']}: " . $e->getMessage());
    }
}

echo json_encode([
    'success' => true,
    'sent_count' => $sentCount,
    'failed_count' => $failedCount,
    'total_users' => count($users)
]);
?>