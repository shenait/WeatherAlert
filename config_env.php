<?php
// Load environment variables from .env file
function loadEnv($path) {
    if (!file_exists($path)) {
        throw new Exception('.env file not found. Please copy .env.example to .env and configure your credentials.');
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        // Parse KEY=VALUE
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            // Remove quotes if present
            if (preg_match('/^(["\'])(.*)\1$/', $value, $matches)) {
                $value = $matches[2];
            }
            
            putenv("$key=$value");
            $_ENV[$key] = $value;
        }
    }
}

// Load environment variables
loadEnv(__DIR__ . '/.env');

// Database configuration from environment variables
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'weatheralert_db');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_CHARSET', 'utf8mb4');

// Twilio configuration from environment variables
define('TWILIO_ACCOUNT_SID', getenv('TWILIO_ACCOUNT_SID'));
define('TWILIO_AUTH_TOKEN', getenv('TWILIO_AUTH_TOKEN'));
define('TWILIO_FROM_NUMBER', getenv('TWILIO_FROM_NUMBER'));

// Application URLs
define('API_BASE_URL', getenv('API_BASE_URL') ?: 'http://localhost/alert');
define('FRONTEND_URL', getenv('FRONTEND_URL') ?: 'http://localhost:3000');

// Validate required environment variables
$requiredVars = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_FROM_NUMBER'
];

foreach ($requiredVars as $var) {
    if (!getenv($var)) {
        error_log("Warning: Required environment variable $var is not set");
    }
}