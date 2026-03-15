-- WeatherAlert Database Schema

CREATE DATABASE IF NOT EXISTS weatheralert_db;
USE weatheralert_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    parish VARCHAR(50) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    alert_storms BOOLEAN DEFAULT TRUE,
    alert_rain BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    severity ENUM('critical', 'high', 'medium', 'low') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action TEXT NOT NULL,
    parish VARCHAR(50),
    weather_data JSON,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_severity (severity),
    INDEX idx_created_at (created_at)
);

-- Alert sends (track who received which alert)
CREATE TABLE IF NOT EXISTS alert_sends (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alert_id INT NOT NULL,
    user_id INT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('sent', 'failed', 'pending') DEFAULT 'sent',
    FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_alert_user (alert_id, user_id),
    INDEX idx_sent_at (sent_at)
);

-- Weather cache (to reduce API calls)
CREATE TABLE IF NOT EXISTS weather_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parish VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    current_data JSON NOT NULL,
    hourly_data JSON NOT NULL,
    daily_data JSON NOT NULL,
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_parish (parish),
    INDEX idx_cached_at (cached_at)
);

-- Insert admin user
INSERT INTO users (email, password, name, phone, parish, role) 
VALUES (
    'shenait0323@gmail.com',
    '$2y$10$kLPEo6qM7sKyJ3xQ4GzXS.vE1NdH/4B1qyuP7FZKjJvxNmXJ8yxgO', 
    'System Administrator',
    NULL,
    'saint-george',
    'admin'
) ON DUPLICATE KEY UPDATE role='admin';
