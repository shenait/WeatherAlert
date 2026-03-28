# ── Stage 1: Build React frontend ──────────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ── Stage 2: PHP/Apache (your original, with frontend + CORS added) ─────────
FROM php:8.2-apache

LABEL maintainer="shenait0323@gmail.com"

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

RUN a2enmod rewrite headers

WORKDIR /var/www/html

# Your original PHP files
COPY *.php /var/www/html/
COPY Database.php /var/www/html/
COPY config_env.php /var/www/html/
COPY api.php /var/www/html/
# Copy built React app
COPY --from=frontend-build /app/build /var/www/html/

RUN mkdir -p /var/www/html/alerts && \
    chmod -R 755 /var/www/html && \
    chown -R www-data:www-data /var/www/html

# Apache config — same as yours but with CORS headers added
RUN echo 'Listen ${PORT}' > /etc/apache2/ports.conf && \
    echo '<VirtualHost *:${PORT}>' > /etc/apache2/sites-available/000-default.conf && \
    echo '    ServerAdmin admin@weatheralert.com' >> /etc/apache2/sites-available/000-default.conf && \
    echo '    DocumentRoot /var/www/html' >> /etc/apache2/sites-available/000-default.conf && \
    echo '    <Directory /var/www/html>' >> /etc/apache2/sites-available/000-default.conf && \
    echo '        Options Indexes FollowSymLinks' >> /etc/apache2/sites-available/000-default.conf && \
    echo '        AllowOverride All' >> /etc/apache2/sites-available/000-default.conf && \
    echo '        Require all granted' >> /etc/apache2/sites-available/000-default.conf && \
    echo '    </Directory>' >> /etc/apache2/sites-available/000-default.conf && \
    echo '    Header always set Access-Control-Allow-Origin "*"' >> /etc/apache2/sites-available/000-default.conf && \
    echo '    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"' >> /etc/apache2/sites-available/000-default.conf && \
    echo '    Header always set Access-Control-Allow-Headers "Content-Type, Authorization"' >> /etc/apache2/sites-available/000-default.conf && \
    echo '    ErrorLog ${APACHE_LOG_DIR}/error.log' >> /etc/apache2/sites-available/000-default.conf && \
    echo '    CustomLog ${APACHE_LOG_DIR}/access.log combined' >> /etc/apache2/sites-available/000-default.conf && \
    echo '</VirtualHost>' >> /etc/apache2/sites-available/000-default.conf

# .htaccess so React Router works (page refresh won't 404)
RUN echo '<IfModule mod_rewrite.c>' > /var/www/html/.htaccess && \
    echo '    RewriteEngine On' >> /var/www/html/.htaccess && \
    echo '    RewriteCond %{REQUEST_FILENAME} !-f' >> /var/www/html/.htaccess && \
    echo '    RewriteCond %{REQUEST_FILENAME} !-d' >> /var/www/html/.htaccess && \
    echo '    RewriteRule ^(?!.*\.php).*$ /index.html [L]' >> /var/www/html/.htaccess && \
    echo '</IfModule>' >> /var/www/html/.htaccess

EXPOSE ${PORT}

# Updated healthcheck — checks root instead of test.php
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/ || exit 1

CMD ["apache2-foreground"]