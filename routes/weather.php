<?php
function getCurrentWeather($db) {
    $lat = $_GET['lat'] ?? 12.1167;
    $lon = $_GET['lon'] ?? -61.6667;
    $parish = $_GET['parish'] ?? 'saint-george';
    $units = $_GET['units'] ?? 'metric';
    
    // Check cache (refresh every 30 minutes)
    $cached = $db->fetchOne(
        "SELECT * FROM weather_cache 
         WHERE parish = ? AND cached_at > DATE_SUB(NOW(), INTERVAL 30 MINUTE) 
         ORDER BY cached_at DESC LIMIT 1",
        [$parish]
    );
    
    if ($cached) {
        echo json_encode([
            'success' => true,
            'cached' => true,
            'data' => [
                'current' => json_decode($cached['current_data'], true),
                'hourly' => json_decode($cached['hourly_data'], true),
                'daily' => json_decode($cached['daily_data'], true)
            ]
        ]);
        return;
    }
    
    // Fetch from Open-Meteo API
    $params = http_build_query([
        'latitude' => $lat,
        'longitude' => $lon,
        'current' => 'temperature_2m,relative_humidity_2m,is_day,precipitation,rain,showers,cloud_cover,wind_speed_10m,wind_direction_10m',
        'hourly' => 'temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,rain,showers,cloud_cover,wind_speed_10m',
        'daily' => 'temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_max',
        'temperature_unit' => $units === 'metric' ? 'celsius' : 'fahrenheit',
        'wind_speed_unit' => $units === 'metric' ? 'kmh' : 'mph',
        'precipitation_unit' => 'mm',
        'timezone' => 'auto',
        'forecast_days' => 14
    ]);
    
    $url = OPENMETEO_API . '?' . $params;
    $response = file_get_contents($url);
    
    if ($response === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch weather data']);
        return;
    }
    
    $weatherData = json_decode($response, true);
    
    // Transform data
    $transformed = transformWeatherData($weatherData);
    
    // Cache the data
    $db->insert('weather_cache', [
        'parish' => $parish,
        'latitude' => $lat,
        'longitude' => $lon,
        'current_data' => json_encode($transformed['current']),
        'hourly_data' => json_encode($transformed['hourly']),
        'daily_data' => json_encode($transformed['daily'])
    ]);
    
    echo json_encode([
        'success' => true,
        'cached' => false,
        'data' => $transformed
    ]);
}

function transformWeatherData($data) {
    $current = $data['current'];
    $hourly = $data['hourly'];
    $daily = $data['daily'];
    
    return [
        'current' => [
            'temperature' => round($current['temperature_2m']),
            'feels_like' => round($current['temperature_2m']),
            'summary' => getWeatherDescription($current),
            'wind' => [
                'speed' => round($current['wind_speed_10m']),
                'direction' => $current['wind_direction_10m']
            ],
            'cloud_cover' => round($current['cloud_cover']),
            'precipitation' => ['total' => $current['precipitation']],
            'rain' => $current['rain'],
            'showers' => $current['showers'],
            'humidity' => round($current['relative_humidity_2m']),
            'is_day' => $current['is_day']
        ],
        'hourly' => [
            'data' => array_map(function($i) use ($hourly) {
                return [
                    'date' => $hourly['time'][$i],
                    'temperature' => round($hourly['temperature_2m'][$i]),
                    'precipitation' => [
                        'total' => $hourly['precipitation'][$i],
                        'probability' => $hourly['precipitation_probability'][$i]
                    ],
                    'cloud_cover' => round($hourly['cloud_cover'][$i]),
                    'rain' => $hourly['rain'][$i],
                    'showers' => $hourly['showers'][$i]
                ];
            }, range(0, min(23, count($hourly['time']) - 1)))
        ],
        'daily' => [
            'data' => array_map(function($i) use ($daily) {
                return [
                    'day' => $daily['time'][$i],
                    'all_day' => [
                        'temperature_max' => round($daily['temperature_2m_max'][$i]),
                        'temperature_min' => round($daily['temperature_2m_min'][$i]),
                        'precipitation_sum' => $daily['precipitation_sum'][$i],
                        'precipitation_probability' => $daily['precipitation_probability_max'][$i]
                    ],
                    'sunrise' => $daily['sunrise'][$i],
                    'sunset' => $daily['sunset'][$i]
                ];
            }, range(0, min(6, count($daily['time']) - 1)))
        ]
    ];
}

function getWeatherDescription($current) {
    $cloud = $current['cloud_cover'];
    $rain = $current['rain'] + $current['showers'];
    
    if ($rain > 2) return 'Heavy Rain';
    if ($rain > 0) return 'Light Rain';
    if ($cloud > 75) return 'Cloudy';
    if ($cloud > 40) return 'Partly Cloudy';
    return 'Clear';
}
?>
