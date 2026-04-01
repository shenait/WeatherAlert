<?php
// Database configuration
define('DB_HOST', getenv('DB_HOST') ?: 'sql.freedb.tech');
define('DB_NAME', getenv('DB_NAME') ?: 'freedb_weatheralert-db');
define('DB_USER', getenv('DB_USER') ?: 'freedb_shenai');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_CHARSET', 'utf8mb4');

// Admin credentials
define('ADMIN_EMAIL', 'shenaithomas0323@gmail.com');
define('ADMIN_PASSWORD', '$2y$10$kLPEo6qM7sKyJ3xQ4GzXS.vE1NdH/4B1qyuP7FZKjJvxNmXJ8yxgO');

// Twilio configuration
define('TWILIO_ACCOUNT_SID', getenv('TWILIO_ACCOUNT_SID') ?: '');
define('TWILIO_AUTH_TOKEN', getenv('TWILIO_AUTH_TOKEN') ?: '');
define('TWILIO_FROM_NUMBER', getenv('TWILIO_FROM_NUMBER') ?: '');

// Application URLs
define('API_BASE_URL', getenv('API_BASE_URL') ?: 'https://weatheralertgd.onrender.com');
define('FRONTEND_URL', getenv('FRONTEND_URL') ?: 'https://weatheralertgd.onrender.com');