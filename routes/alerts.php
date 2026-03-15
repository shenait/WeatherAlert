<?php
function getAlerts($db) {
    $userId = $_GET['user_id'] ?? null;
    
    if ($userId) {
        // Get alerts for specific user
        $alerts = $db->fetchAll(
            "SELECT a.*, as.sent_at, as.status 
             FROM alerts a 
             JOIN alert_sends as ON a.id = as.alert_id 
             WHERE as.user_id = ? 
             ORDER BY as.sent_at DESC 
             LIMIT 50",
            [$userId]
        );
    } else {
        // Get all recent alerts (admin view)
        $alerts = $db->fetchAll(
            "SELECT a.*, u.name as created_by_name,
             (SELECT COUNT(*) FROM alert_sends WHERE alert_id = a.id) as recipients_count
             FROM alerts a 
             LEFT JOIN users u ON a.created_by = u.id 
             ORDER BY a.created_at DESC 
             LIMIT 50"
        );
    }
    
    echo json_encode(['success' => true, 'alerts' => $alerts]);
}

function createAlert($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $severity = $input['severity'] ?? 'medium';
    $title = $input['title'] ?? '';
    $message = $input['message'] ?? '';
    $action = $input['action'] ?? '';
    $parish = $input['parish'] ?? null;
    $weatherData = $input['weather_data'] ?? null;
    $createdBy = $input['created_by'] ?? null;
    
    if (empty($title) || empty($message) || empty($action)) {
        http_response_code(400);
        echo json_encode(['error' => 'Title, message, and action required']);
        return;
    }
    
    $alertId = $db->insert('alerts', [
        'severity' => $severity,
        'title' => $title,
        'message' => $message,
        'action' => $action,
        'parish' => $parish,
        'weather_data' => $weatherData ? json_encode($weatherData) : null,
        'created_by' => $createdBy
    ]);
    
    echo json_encode(['success' => true, 'alert_id' => $alertId]);
}

function sendAlertToUsers($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    $alertId = $input['alert_id'] ?? null;
    
    if (!$alertId) {
        http_response_code(400);
        echo json_encode(['error' => 'Alert ID required']);
        return;
    }
    
    // Get alert details
    $alert = $db->fetchOne("SELECT * FROM alerts WHERE id = ?", [$alertId]);
    if (!$alert) {
        http_response_code(404);
        echo json_encode(['error' => 'Alert not found']);
        return;
    }
    
    // Get users with alerts enabled and phone numbers
    $users = $db->fetchAll(
        "SELECT id, name, phone, parish 
         FROM users 
         WHERE phone IS NOT NULL 
         AND phone != '' 
         AND (alert_storms = 1 OR alert_rain = 1)
         AND role = 'user'"
    );
    
    if (empty($users)) {
        echo json_encode(['success' => true, 'sent_count' => 0, 'message' => 'No users with alerts enabled']);
        return;
    }
    
    $sentCount = 0;
    $failedCount = 0;
    
    foreach ($users as $user) {
        $smsBody = "🚨 NADMA WEATHER ALERT - {$alert['parish']}\n\n";
        $smsBody .= "{$alert['title']}\n";
        $smsBody .= "{$alert['message']}\n\n";
        $smsBody .= "→ {$alert['action']}\n\n";
        $smsBody .= "Follow NADMA advisories.\nTune to GIS Radio 535 AM.";
        
        $result = sendTwilioSMS($user['phone'], $smsBody);
        
        if ($result['success']) {
            $db->insert('alert_sends', [
                'alert_id' => $alertId,
                'user_id' => $user['id'],
                'status' => 'sent'
            ]);
            $sentCount++;
        } else {
            $db->insert('alert_sends', [
                'alert_id' => $alertId,
                'user_id' => $user['id'],
                'status' => 'failed'
            ]);
            $failedCount++;
        }
    }
    
    echo json_encode([
        'success' => true,
        'sent_count' => $sentCount,
        'failed_count' => $failedCount,
        'total_users' => count($users)
    ]);
}

function sendTwilioSMS($to, $body) {
    $url = "https://api.twilio.com/2010-04-01/Accounts/" . TWILIO_ACCOUNT_SID . "/Messages.json";
    
    $data = [
        'To' => $to,
        'From' => TWILIO_FROM_NUMBER,
        'Body' => $body
    ];
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERPWD, TWILIO_ACCOUNT_SID . ':' . TWILIO_AUTH_TOKEN);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'success' => $httpCode >= 200 && $httpCode < 300,
        'response' => json_decode($response, true)
    ];
}
?>
