# WeatherAlert Grenada - PHP Backend Docker Image
FROM php:8.2-apache

# Set maintainer
LABEL maintainer="shenait0323@gmail.com"

# Install system dependencies and PHP extensions in one layer
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    zip \
    unzip \
    && docker-php-ext-install \
    pdo \
    pdo_mysql \
    pdo_pgsql \
    pgsql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache modules
RUN a2enmod rewrite headers

# Set working directory
WORKDIR /var/www/html

# Copy application files (backend only, not frontend)
COPY *.php /var/www/html/
COPY Database.php /var/www/html/
COPY config.php /var/www/html/

# Create necessary directories with proper permissions
RUN mkdir -p /var/www/html/alerts && \
    chmod -R 755 /var/www/html && \
    chown -R www-data:www-data /var/www/html

# Configure Apache to use PORT environment variable
RUN echo 'Listen ${PORT}' > /etc/apache2/ports.conf && \
    echo '<VirtualHost *:${PORT}>' > /etc/apache2/sites-available/000-default.conf && \
    echo '    ServerAdmin admin@weatheralert.com' >> /etc/apache2/sites-available/000-default.conf && \
    echo '    DocumentRoot /var/www/html' >> /etc/apache2/sites-available/000-default.conf && \
    echo '    <Directory /var/www/html>' >> /etc/apache2/sites-available/000-default.conf && \
    echo '        Options Indexes FollowSymLinks' >> /etc/apache2/sites-available/000-default.conf && \
    echo '        AllowOverride All' >> /etc/apache2/sites-available/000-default.conf && \
    echo '        Require all granted' >> /etc/apache2/sites-available/000-default.conf && \
    echo '    </Directory>' >> /etc/apache2/sites-available/000-default.conf && \
    echo '    ErrorLog ${APACHE_LOG_DIR}/error.log' >> /etc/apache2/sites-available/000-default.conf && \
    echo '    CustomLog ${APACHE_LOG_DIR}/access.log combined' >> /etc/apache2/sites-available/000-default.conf && \
    echo '</VirtualHost>' >> /etc/apache2/sites-available/000-default.conf

# Expose port (will be set by Render)
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/test.php || exit 1

# Start Apache in foreground
CMD ["apache2-foreground"]
