<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Simple test endpoint
echo json_encode([
    'status' => 'success',
    'message' => 'WeatherAlert API is running!',
    'version' => '1.0',
    'timestamp' => date('Y-m-d H:i:s'),
    'endpoints' => [
        'POST /auth/login',
        'POST /auth/register',
        'GET /weather/current',
        'GET /alerts',
        'POST /alerts',
        'POST /alerts/send',
        'GET /users',
        'PUT /users/{id}'
    ]
]);
?>
