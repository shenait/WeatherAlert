-- WeatherAlert Database Schema for PostgreSQL

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    parish VARCHAR(50) NOT NULL,
    role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    alert_storms BOOLEAN DEFAULT TRUE,
    alert_rain BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_role ON users(role);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    parish VARCHAR(50),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    severity VARCHAR(10) DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low'))
);

CREATE INDEX idx_parish ON alerts(parish);
CREATE INDEX idx_sent_at ON alerts(sent_at);

-- Alert sends table
CREATE TABLE IF NOT EXISTS alert_sends (
    id SERIAL PRIMARY KEY,
    alert_id INTEGER NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(10) DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending'))
);

CREATE INDEX idx_alert_user ON alert_sends(alert_id, user_id);
CREATE INDEX idx_sent_at_sends ON alert_sends(sent_at);

-- Weather cache table
CREATE TABLE IF NOT EXISTS weather_cache (
    id SERIAL PRIMARY KEY,
    parish VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    current_data JSONB NOT NULL,
    hourly_data JSONB NOT NULL,
    daily_data JSONB NOT NULL,
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_parish_cache ON weather_cache(parish);
CREATE INDEX idx_cached_at ON weather_cache(cached_at);

-- Insert admin user
INSERT INTO users (email, password, name, phone, parish, role) 
VALUES (
    'shenait0323@gmail.com',
    '$2y$10$kLPEo6qM7sKyJ3xQ4GzXS.vE1NdH/4B1qyuP7FZKjJvxNmXJ8yxgO',
    'System Administrator',
    NULL,
    'saint-george',
    'admin'
) ON CONFLICT (email) DO UPDATE SET role='admin';