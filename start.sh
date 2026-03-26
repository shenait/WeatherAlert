
echo "========================================="
echo "Starting WeatherAlert Backend API..."
echo "========================================="

# Get port from environment or default to 10000
PORT=${PORT:-10000}

echo "Server will start on port: $PORT"
echo "Environment: Production"
echo "PHP Version: $(php -v | head -n 1)"

# Start PHP built-in server
echo "Starting PHP server..."
php -S 0.0.0.0:${PORT} -t .

echo "========================================="
echo "Server stopped"
echo "========================================="