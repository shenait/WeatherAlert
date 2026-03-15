# WeatherAlert - Grenada Weather Monitoring System

A complete weather monitoring and alert system for Grenada with PHP backend and React frontend.

## 🏗️ Architecture

```
weatheralert/
├── backend/              # PHP REST API
│   ├── index.php        # Main router
│   ├── config.php       # Configuration
│   ├── Database.php     # Database class
│   ├── schema.sql       # Database schema
│   └── routes/          # API routes
│       ├── auth.php     # Authentication
│       ├── weather.php  # Weather data
│       ├── alerts.php   # Alert management
│       └── users.php    # User management
│
└── frontend/            # React SPA
    ├── public/          # Static files
    └── src/
        ├── App.js       # Main app
        ├── components/  # React components
        └── App.css      # Styles
```

## 🚀 Setup Instructions

### Prerequisites

- PHP 7.4+ with MySQL/MariaDB
- Node.js 16+
- npm or yarn
- XAMPP, WAMP, or LAMP (for local development)

### Backend Setup

1. **Install PHP dependencies**:
   ```bash
   # No Composer dependencies needed - uses built-in PHP features
   ```

2. **Configure database**:
   ```bash
   # Start MySQL
   mysql -u root -p

   # Import schema
   source backend/schema.sql
   ```

3. **Update configuration** (`backend/config.php`):
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'weatheralert_db');
   define('DB_USER', 'root');
   define('DB_PASS', 'your_password');
   ```

4. **Start PHP server**:
   ```bash
   cd backend
   php -S localhost:8000
   ```

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**:
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

## 🔐 Default Credentials

**Admin Account**:
- Email: `shenait0323@gmail.com`
- Password: `WeatherAdmin2024!`

**Test User** (create your own via registration)

## 📋 Features

### For Users:
✅ Real-time weather from Open-Meteo API
✅ Automatic SMS alerts for severe weather
✅ 7-day forecast with hourly breakdown
✅ Dynamic backgrounds based on weather
✅ Alert history and preferences
✅ Parish-specific weather data

### For Admins:
✅ User management dashboard
✅ Manual alert broadcasting
✅ Weather monitoring for all parishes
✅ SMS alert statistics
✅ Alert history tracking

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Weather
- `GET /api/weather/current?lat={lat}&lon={lon}&parish={parish}` - Get weather data

### Alerts
- `GET /api/alerts?user_id={id}` - Get user alerts
- `POST /api/alerts` - Create new alert (admin)
- `POST /api/alerts/send` - Send alert to users (admin)

### Users
- `GET /api/users` - Get all users (admin)
- `PUT /api/users/{id}` - Update user profile

## 🔧 Configuration

### Twilio SMS (backend/config.php)
```php
define('TWILIO_ACCOUNT_SID', 'your_account_sid');
define('TWILIO_AUTH_TOKEN', 'your_auth_token');
define('TWILIO_FROM_NUMBER', 'your_twilio_number');
```

### API Proxy (frontend/package.json)
```json
"proxy": "http://localhost:8000"
```

## 📱 SMS Alert System

Automatic alerts are triggered when:
- Wind speed > 45 km/h (Critical)
- Wind speed > 25 km/h (High)
- Heavy rainfall detected
- Thunderstorms detected

Alerts are sent every 3 hours maximum to prevent spam.

## 🎨 Customization

### Parishes
Edit the parish data in the frontend components to add/remove locations.

### Weather Thresholds
Modify alert detection logic in `backend/routes/alerts.php`

### UI Theme
Update CSS variables in `frontend/src/App.css`

## 🐛 Troubleshooting

**Database connection fails**:
- Check MySQL is running
- Verify credentials in `config.php`
- Ensure database exists

**CORS errors**:
- Backend already includes CORS headers
- Check proxy in `frontend/package.json`

**SMS not sending**:
- Verify Twilio credentials
- Check phone number format (+1473...)
- Ensure Twilio account has credits

## 📦 Deployment

### Backend (PHP)
```bash
# Upload to web host
# Configure Apache/Nginx to serve backend/
# Update config.php with production database
```

### Frontend (React)
```bash
cd frontend
npm run build
# Upload build/ folder to web host
# Configure to serve React app
```

## 🔒 Security Notes

⚠️ **Production Checklist**:
- Change `JWT_SECRET` in config.php
- Use HTTPS for all requests
- Store Twilio credentials in environment variables
- Enable MySQL user permissions
- Add rate limiting to API
- Implement proper JWT validation

## 📄 License

MIT License - See LICENSE file for details

## 👥 Support

For issues or questions:
- Email: support@weatheralert.gd
- GitHub: [Your Repo URL]

---

Built with ❤️ for Grenada 🇬🇩
