<?php
// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'weatheralert_db');
define('DB_USER', 'root');
define('DB_PASS', '');

// API Keys
define('TWILIO_ACCOUNT_SID', 'AC747f0b849f01b888d5771cf5c279d2d5');
define('TWILIO_AUTH_TOKEN', 'ad98d0a95199d811f77abd6710e6cd5c');
define('TWILIO_FROM_NUMBER', '+13636661642');
define('OPENMETEO_API', 'https://api.open-meteo.com/v1/forecast');

// Admin credentials
define('ADMIN_EMAIL', 'shenait0323@gmail.com');
define('ADMIN_PASSWORD', password_hash('WeatherAdmin2024!', PASSWORD_BCRYPT));

// JWT Secret (change this in production!)
define('JWT_SECRET', 'your-secret-key-change-in-production');
?>
