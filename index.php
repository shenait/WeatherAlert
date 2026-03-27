<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config_env.php';
require_once __DIR__ . '/Database.php';

$db = new Database();

$request_method = $_SERVER['REQUEST_METHOD'];
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

$path = str_replace('/api', '', $request_uri);
$path = str_replace('/index.php', '', $path);
$path = trim($path, '/');

// Simple routing
switch($path) {
    case 'auth/login':
        if ($request_method === 'POST') {
            require_once __DIR__ . '/routes/auth.php';
            login($db);
        }
        break;
        
    case 'auth/register':
        if ($request_method === 'POST') {
            require_once __DIR__ . '/routes/auth.php';
            register($db);
        }
        break;
        
    case 'weather/current':
        if ($request_method === 'GET') {
            require_once __DIR__ . '/routes/weather.php';
            getCurrentWeather($db);
        }
        break;
        
    case 'alerts':
        if ($request_method === 'GET') {
            require_once __DIR__ . '/routes/alerts.php';
            getAlerts($db);
        } elseif ($request_method === 'POST') {
            require_once __DIR__ . '/routes/alerts.php';
            createAlert($db);
        }
        break;
        
    case 'alerts/send':
        if ($request_method === 'POST') {
            require_once __DIR__ . '/routes/alerts.php';
            sendAlertToUsers($db);
        }
        break;
        
    case 'users':
        if ($request_method === 'GET') {
            require_once __DIR__ . '/routes/users.php';
            getUsers($db);
        }
        break;
        
    default:
        // Check if it's a user update (users/{id})
        if (preg_match('/^users\/(\d+)$/', $path, $matches) && $request_method === 'PUT') {
            require_once __DIR__ . '/routes/users.php';
            updateUser($db, $matches[1]);
        } else {
            http_response_code(404);
            echo json_encode([
                'error' => 'Endpoint not found',
                'requested_path' => $path,
                'method' => $request_method,
                'uri' => $request_uri
            ]);
        }
        break;
}
?>
