<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config_env.php';
require_once __DIR__ . '/Database.php';

$db = new Database();

$request_method = $_SERVER['REQUEST_METHOD'];
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Clean path
$path = str_replace('/api', '', $request_uri);
$path = str_replace('/index.php', '', $path);
$path = trim($path, '/');

// Routing
switch ($path) {

    // ✅ Default route (FIXED)
    case '':
        echo json_encode([
            'message' => 'WeatherAlert API is running 🚀',
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
        break;

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
        require_once __DIR__ . '/routes/alerts.php';
        if ($request_method === 'GET') {
            getAlerts($db);
        } elseif ($request_method === 'POST') {
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
        // Handle dynamic route: users/{id}
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