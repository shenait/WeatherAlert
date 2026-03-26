
echo "========================================="
echo "Building WeatherAlert Backend..."
echo "========================================="

# Check PHP version
php -v

# Install Composer dependencies if composer.json exists
if [ -f "composer.json" ]; then
    echo "Installing Composer dependencies..."
    composer install --no-dev --optimize-autoloader
else
    echo "No composer.json found, skipping Composer install"
fi

# Create necessary directories
echo "Creating directories..."
mkdir -p alerts
chmod 755 alerts

echo "========================================="
echo "Build complete!"
echo "========================================="