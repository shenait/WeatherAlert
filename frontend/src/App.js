import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import risingSunLogo from './rising-sun.png';

const API_BASE = 'https://weatheralertgd.onrender.com';
const OPENMETEO_BASE = "https://api.open-meteo.com/v1/forecast";

const PARISHES = [
  { id:"saint-george",  name:"Saint George",  capital:"St. George's",  lat:12.0561, lon:-61.7486, desc:"Capital — Grand Anse Beach & Fort George" },
  { id:"saint-andrew",  name:"Saint Andrew",  capital:"Grenville",     lat:12.1170, lon:-61.6311, desc:"Largest parish — rainforest & spice estates" },
  { id:"saint-david",   name:"Saint David",   capital:"Perdmontemps",  lat:12.0253, lon:-61.6780, desc:"Southeast — scenic coastline & La Sagesse" },
  { id:"saint-john",    name:"Saint John",    capital:"Gouyave",       lat:12.1535, lon:-61.7282, desc:"West coast — Gouyave Fish Friday" },
  { id:"saint-mark",    name:"Saint Mark",    capital:"Victoria",      lat:12.1875, lon:-61.6994, desc:"Smallest parish — northwest mountains" },
  { id:"saint-patrick", name:"Saint Patrick", capital:"Sauteurs",      lat:12.2350, lon:-61.6340, desc:"North — Leapers Hill & Levera Park" },
  { id:"carriacou",     name:"Carriacou & Petite Martinique", capital:"Hillsborough", lat:12.4760, lon:-61.4534, desc:"Northern dependency — pristine beaches" },
];

const getWeatherBackground = (weatherData, isDark) => {
  if (!weatherData) return isDark ? "#0f1117" : "#e3f2fd";
  const cloudCover = weatherData.cloud_cover || 0;
  const rain = weatherData.rain || 0;
  const showers = weatherData.showers || 0;
  const precip = weatherData.precipitation?.total || 0;
  if (isDark) {
    if (rain > 2 || showers > 2 || precip > 5) return "linear-gradient(180deg, #1a1f35 0%, #0f1419 100%)";
    if (rain > 0 || showers > 0) return "linear-gradient(180deg, #1e2a3a 0%, #0f1419 100%)";
    if (cloudCover > 75) return "linear-gradient(180deg, #2d3748 0%, #1a202c 100%)";
    if (cloudCover > 40) return "linear-gradient(180deg, #1e3a5f 0%, #0f1419 100%)";
    return "linear-gradient(180deg, #0f1117 0%, #1a1d27 100%)";
  } else {
    if (rain > 2 || showers > 2 || precip > 5) return "linear-gradient(180deg, #78909c 0%, #90a4ae 100%)";
    if (rain > 0 || showers > 0) return "linear-gradient(180deg, #b0bec5 0%, #cfd8dc 100%)";
    if (cloudCover > 75) return "linear-gradient(180deg, #cfd8dc 0%, #eceff1 100%)";
    if (cloudCover > 40) return "linear-gradient(180deg, #bbdefb 0%, #e3f2fd 100%)";
    return "linear-gradient(180deg, #81d4fa 0%, #e3f2fd 100%)";
  }
};

const getTheme = (isDark) => isDark ? {
  bg: "#0f1117", card: "#1a1d27", cardAlt: "#20232e", accent: "#3b82f6", accent2: "#1d4ed8",
  accentBg: "rgba(59,130,246,0.10)", accentText: "#93c5fd", text: "#f1f5f9", textSub: "#cbd5e1",
  muted: "#64748b", border: "#252839", borderStrong: "#343857", glow: "rgba(59,130,246,0.20)",
  inputBg: "#13161f", navBg: "#13161f", heroGradient: "linear-gradient(180deg, rgba(15,17,23,0.4) 0%, rgba(26,29,39,0.95) 100%)",
  shadow: "0 1px 4px rgba(0,0,0,0.4)", glass: "rgba(26, 29, 39, 0.8)", success: "#22c55e",
  successBg: "rgba(34,197,94,0.10)", danger: "#ef4444", dangerBg: "rgba(239,68,68,0.08)",
  warning: "#f59e0b", warningBg: "rgba(245,158,11,0.10)",
} : {
  bg: "#e3f2fd", card: "#ffffff", cardAlt: "#f8fafc", accent: "#2563eb", accent2: "#1d4ed8",
  accentBg: "rgba(37,99,235,0.07)", accentText: "#1d4ed8", text: "#0f172a", textSub: "#334155",
  muted: "#64748b", border: "#e2e8f0", borderStrong: "#cbd5e1", glow: "rgba(37,99,235,0.12)",
  inputBg: "#f8fafc", navBg: "#ffffff", heroGradient: "linear-gradient(180deg, rgba(227,242,253,0.3) 0%, rgba(255,255,255,0.9) 100%)",
  shadow: "0 1px 4px rgba(15,23,42,0.07)", glass: "rgba(255, 255, 255, 0.75)", success: "#16a34a",
  successBg: "rgba(22,163,74,0.08)", danger: "#dc2626", dangerBg: "rgba(220,38,38,0.07)",
  warning: "#f59e0b", warningBg: "rgba(245,158,11,0.08)",
};

const getWeatherIcon = (weatherData, isNight) => {
  if (!weatherData) return "🌡️";
  const cloudCover = weatherData.cloud_cover || 0;
  const precip = weatherData.precipitation?.total || weatherData.precipitation || 0;
  const rain = weatherData.rain || 0;
  const showers = weatherData.showers || 0;
  if (rain > 2 || showers > 2 || precip > 5) return "🌧️";
  if (rain > 0 || showers > 0 || precip > 0) return "🌦️";
  if (cloudCover > 75) return "☁️";
  if (cloudCover > 50) return "🌥️";
  if (cloudCover > 25) return isNight ? "☁️" : "⛅";
  return isNight ? "🌙" : "☀️";
};

const Ic = {
  Sun:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Moon:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Dashboard:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Map:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  Shield:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Bell:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  User:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  ChevDown:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
  Pin:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  LogOut:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Refresh:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>,
};

function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [units, setUnits] = useState("metric");
  const [parish, setParish] = useState(null);
  const [dropOpen, setDropOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapLayer, setMapLayer] = useState("temp");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [page, setPage] = useState('login');
  const [alertMessage, setAlertMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState('');
  const [users, setUsers] = useState([]);

  const dropRef = useRef(null);
  const T = getTheme(isDark);
  const current = weather?.current;
  const tUnit = units==="metric"?"°C":"°F";
  
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) setUser(JSON.parse(storedUser));
    setAuthReady(true);
  }, []);

  useEffect(() => {
    const h = e => { if(dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (user && user.role === 'admin' && tab === 'admin') fetchUsers();
  }, [user, tab]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/get_users.php`);
      const data = await response.json();
      if (data.success) setUsers(data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchWeather = useCallback(async (lat, lon, u=units) => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({
        latitude: lat.toString(), longitude: lon.toString(),
        current: "temperature_2m,relative_humidity_2m,is_day,precipitation,rain,showers,cloud_cover,wind_speed_10m,wind_direction_10m",
        hourly: "temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,rain,showers,cloud_cover,wind_speed_10m",
        daily: "temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_max",
        temperature_unit: u === "metric" ? "celsius" : "fahrenheit",
        wind_speed_unit: u === "metric" ? "kmh" : "mph",
        precipitation_unit: "mm", 
        timezone: "America/Grenada",
        forecast_days: 7
      });
      const response = await fetch(`${OPENMETEO_BASE}?${params}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (!data || !data.current) throw new Error("No weather data available");

      const getWeatherDescription = (cloudCover, precip, rain, showers) => {
        if (rain > 0 || showers > 0) return precip > 5 ? "Heavy Rain" : "Light Rain";
        if (cloudCover > 75) return "Cloudy";
        if (cloudCover > 40) return "Partly Cloudy";
        return "Clear";
      };

      const currentData = data.current, hourly = data.hourly, daily = data.daily;
      const transformed = {
        current: {
          temperature: Math.round(currentData.temperature_2m),
          feels_like: Math.round(currentData.temperature_2m),
          summary: getWeatherDescription(currentData.cloud_cover, currentData.precipitation, currentData.rain, currentData.showers),
          weather: currentData.is_day ? "day" : "night",
          wind: { speed: Math.round(currentData.wind_speed_10m), direction: currentData.wind_direction_10m || 0 },
          cloud_cover: Math.round(currentData.cloud_cover || 0),
          precipitation: { total: currentData.precipitation || 0 },
          rain: currentData.rain || 0, showers: currentData.showers || 0,
          humidity: Math.round(currentData.relative_humidity_2m || 0), pressure: 1013,
        },
        hourly: {
          data: hourly.time.slice(0, 24).map((time, i) => ({
            date: time, temperature: Math.round(hourly.temperature_2m[i]),
            summary: getWeatherDescription(hourly.cloud_cover[i], hourly.precipitation[i], hourly.rain[i], hourly.showers[i]),
            weather: "auto",
            precipitation: { total: hourly.precipitation[i] || 0, probability: hourly.precipitation_probability[i] || 0 },
            wind: { speed: Math.round(hourly.wind_speed_10m[i] || 0) },
            cloud_cover: Math.round(hourly.cloud_cover[i] || 0),
            rain: hourly.rain[i] || 0, showers: hourly.showers[i] || 0
          }))
        },
        daily: {
          data: daily.time.slice(0, 7).map((time, i) => ({
            day: time,
            all_day: {
              temperature_max: Math.round(daily.temperature_2m_max[i]),
              temperature_min: Math.round(daily.temperature_2m_min[i]), weather: "auto",
              summary: daily.precipitation_sum[i] > 5 ? "Rain" : "Partly Cloudy",
              precipitation_sum: daily.precipitation_sum[i] || 0,
              precipitation_probability: daily.precipitation_probability_max[i] || 0
            },
            summary: daily.precipitation_sum[i] > 5 ? "Rain" : "Partly Cloudy",
            sunrise: daily.sunrise[i], sunset: daily.sunset[i]
          }))
        }
      };
      setWeather(transformed); setLastUpdated(new Date());
      if (user && user.role === 'admin' && parish) detectAndStoreAlerts(transformed, parish);
    } catch(e) { 
      console.error("Weather fetch error:", e);
      setError(`Weather data unavailable: ${e.message}`); 
      setWeather(null); 
    }
    setLoading(false);
  }, [units, user]);

  useEffect(() => {
    if (!user) return;
    const p = PARISHES.find(x=>x.id===user.parish)||PARISHES[0];
    setParish(p);
    fetchWeather(p.lat, p.lon, units);
  }, [user]); // eslint-disable-line

  useEffect(() => {
    if (parish && user) fetchWeather(parish.lat, parish.lon, units);
  }, [units]); // eslint-disable-line

  useEffect(() => {
    if (!parish || !user) return;
    const interval = setInterval(() => fetchWeather(parish.lat, parish.lon, units), 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [parish?.id, units, user, fetchWeather]);

  const detectAndStoreAlerts = (weatherData, currentParish) => {
    if (!currentParish) return;
    const alerts = [], w = weatherData.current;
    if (w.wind?.speed > 45) alerts.push({severity: 'critical', title: 'SEVERE WIND WARNING', message: `Dangerous winds of ${w.wind.speed} km/h detected in ${currentParish.name}`, action: 'Secure loose objects. Stay indoors. Avoid coastal areas.', parish: currentParish.name, timestamp: new Date().toISOString()});
    if (w.wind?.speed > 25 && w.wind?.speed <= 45) alerts.push({severity: 'high', title: 'Strong Wind Advisory', message: `Wind speeds reaching ${w.wind.speed} km/h in ${currentParish.name}`, action: 'Exercise caution outdoors. Secure lightweight objects.', parish: currentParish.name, timestamp: new Date().toISOString()});
    if (w.rain > 5) alerts.push({severity: 'high', title: 'Heavy Rainfall Alert', message: `Heavy rain (${w.rain}mm/hr) affecting ${currentParish.name}`, action: 'Avoid low-lying areas. Monitor for flash flooding.', parish: currentParish.name, timestamp: new Date().toISOString()});
    if (alerts.length > 0) {
      const existingAlerts = JSON.parse(localStorage.getItem('detected_alerts') || '[]');
      const newAlerts = [...alerts, ...existingAlerts].slice(0, 50);
      localStorage.setItem('detected_alerts', JSON.stringify(newAlerts));
    }
  };

  const sendAlertToAllUsers = async () => {
    if (!alertMessage.trim()) { setSendStatus('Please enter a message'); return; }
    setSending(true); setSendStatus('Sending alerts...');
    try {
      const response = await fetch(`${API_BASE}/send_alert.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: alertMessage, parish: parish?.name || 'Grenada', admin_email: user.email })
      });
      const data = await response.json();
      if (data.success) {
        setSendStatus(`✓ Alert sent to ${data.sent_count} users!`);
        setAlertMessage('');
        setTimeout(() => setSendStatus(''), 3000);
      } else setSendStatus('Failed to send alerts: ' + data.error);
    } catch (error) { setSendStatus('Error: ' + error.message); }
    setSending(false);
  };

  const selectParish = p => { setParish(p); setDropOpen(false); fetchWeather(p.lat, p.lon, units); };

  const handleLogin = async (e) => {
    e.preventDefault(); setFormError(''); setFormLoading(true);
    try {
      const response = await fetch(`${API_BASE}/login.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setPage('dashboard');
        if (data.user.role === 'admin') setTab('admin');
      } else setFormError(data.error || 'Login failed');
    } catch (err) { setFormError('Connection error. Make sure XAMPP Apache is running.'); }
    finally { setFormLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setFormError(''); setFormLoading(true);
    try {
      const response = await fetch(`${API_BASE}/register.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone, parish: 'saint-george' })
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setPage('dashboard');
      } else setFormError(data.error || 'Registration failed');
    } catch (err) { setFormError('Connection error.'); }
    finally { setFormLoading(false); }
  };

  const logout = () => { 
    localStorage.removeItem('auth_token'); localStorage.removeItem('user');
    setUser(null); setWeather(null); setParish(null); setTab("dashboard"); setPage('login');
  };

  const card = (extra={}) => ({ background:T.card, border:`1px solid ${T.border}`, borderRadius:"12px", boxShadow:T.shadow, ...extra });
  const sLabel = { color:T.muted, fontSize:"11px", fontWeight:600, letterSpacing:".07em", textTransform:"uppercase", marginBottom:"12px" };

  const css = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Outfit',sans-serif;min-height:100vh;background:${T.bg};-webkit-font-smoothing:antialiased;}input,button,select{font-family:'Outfit',sans-serif;}input:focus,select:focus{outline:none;border-color:${T.accent}!important;}input::placeholder{color:${T.muted};}@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.glass{backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);}.fade-up{animation:slideUp .5s cubic-bezier(0.34, 1.56, 0.64, 1) both;}.hour-card{transition:all .2s;cursor:default;}.hour-card:hover{transform:translateY(-4px);background:${T.glass}!important;}.day-row{transition:all .2s;cursor:default;}.day-row:hover{background:${T.accentBg}!important;}::-webkit-scrollbar{width:6px;height:6px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:${T.borderStrong};border-radius:3px;}::-webkit-scrollbar-thumb:hover{background:${T.muted};}select option{background:${T.card};color:${T.text};}`;

  if (!authReady) return null;
  
  if (!user) {
    if (page === 'login') return (
      <>
        <style>{css}</style>
        <div style={{minHeight:"100vh",background:getWeatherBackground(null, isDark),display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",fontFamily:"'Outfit',sans-serif"}}>
          <div style={{...card({padding:0,maxWidth:"450px",width:"100%",overflow:"hidden"})}}>
            <div style={{background:T.accentBg,padding:"40px 30px",textAlign:"center",borderBottom:`1px solid ${T.border}`}}>
              <img src={risingSunLogo} alt="WeatherAlert Logo" style={{width:"80px",height:"80px",marginBottom:"16px",filter:isDark?"brightness(1.1)":"none"}} onError={(e)=>{e.target.style.display='none';e.target.nextSibling.style.display='block'}}/>
              <div style={{display:"none"}}><img src={risingSunLogo} alt="WeatherAlert Logo" style={{width:"80px",height:"80px",objectFit:"contain"}}/></div>
              <h1 style={{color:T.text,fontSize:"28px",marginBottom:"8px",fontWeight:700}}>WeatherAlert</h1>
              <p style={{color:T.muted,fontSize:"14px"}}>Grenada Weather Monitoring System</p>
            </div>
            <form onSubmit={handleLogin} style={{padding:"40px 30px"}}>
              <h2 style={{color:T.text,fontSize:"22px",marginBottom:"30px",fontWeight:600}}>Sign In</h2>
              {formError && <div style={{background:T.dangerBg,border:`1px solid ${T.danger}`,color:T.danger,padding:"12px 16px",borderRadius:"8px",marginBottom:"20px",fontSize:"14px"}}>{formError}</div>}
              <div style={{marginBottom:"20px"}}>
                <label style={{display:"block",marginBottom:"8px",color:T.textSub,fontWeight:500,fontSize:"14px"}}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" required style={{width:"100%",padding:"12px 16px",border:`2px solid ${T.border}`,borderRadius:"10px",fontSize:"15px",background:T.inputBg,color:T.text,fontFamily:"'Outfit',sans-serif"}}/>
              </div>
              <div style={{marginBottom:"24px"}}>
                <label style={{display:"block",marginBottom:"8px",color:T.textSub,fontWeight:500,fontSize:"14px"}}>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required style={{width:"100%",padding:"12px 16px",border:`2px solid ${T.border}`,borderRadius:"10px",fontSize:"15px",background:T.inputBg,color:T.text,fontFamily:"'Outfit',sans-serif"}}/>
              </div>
              <button type="submit" disabled={formLoading} style={{width:"100%",padding:"14px",background:formLoading?T.cardAlt:T.accent,color:formLoading?T.muted:"#fff",border:"none",borderRadius:"10px",fontSize:"16px",fontWeight:600,cursor:formLoading?"not-allowed":"pointer",fontFamily:"'Outfit',sans-serif",transition:"all 0.2s"}}>{formLoading ? 'Signing in...' : 'Sign In'}</button>
              <p style={{textAlign:"center",marginTop:"20px",color:T.muted,fontSize:"14px"}}>Don't have an account? <a onClick={() => setPage('register')} style={{color:T.accent,textDecoration:"none",fontWeight:600,cursor:"pointer"}}>Register here</a></p>
              <div style={{marginTop:"30px",padding:"12px",background:T.cardAlt,borderRadius:"8px",textAlign:"center"}}>
              </div>
            </form>
          </div>
        </div>
      </>
    );
    if (page === 'register') return (
      <>
        <style>{css}</style>
        <div style={{minHeight:"100vh",background:getWeatherBackground(null, isDark),display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",fontFamily:"'Outfit',sans-serif"}}>
          <div style={{...card({padding:0,maxWidth:"450px",width:"100%",overflow:"hidden"})}}>
            <div style={{background:T.accentBg,padding:"40px 30px",textAlign:"center",borderBottom:`1px solid ${T.border}`}}>
              <img src={risingSunLogo} alt="WeatherAlert Logo" style={{width:"80px",height:"80px",marginBottom:"16px",filter:isDark?"brightness(1.1)":"none"}} onError={(e)=>{e.target.style.display='none';e.target.nextSibling.style.display='block'}}/>
              <div style={{display:"none"}}><img src={risingSunLogo} alt="WeatherAlert Logo" style={{width:"80px",height:"80px",objectFit:"contain"}}/></div>
              <h1 style={{color:T.text,fontSize:"28px",marginBottom:"8px",fontWeight:700}}>WeatherAlert</h1>
              <p style={{color:T.muted,fontSize:"14px"}}>Grenada Weather Monitoring System</p>
            </div>
            <form onSubmit={handleRegister} style={{padding:"40px 30px"}}>
              <h2 style={{color:T.text,fontSize:"22px",marginBottom:"30px",fontWeight:600}}>Create Account</h2>
              {formError && <div style={{background:T.dangerBg,border:`1px solid ${T.danger}`,color:T.danger,padding:"12px 16px",borderRadius:"8px",marginBottom:"20px",fontSize:"14px"}}>{formError}</div>}
              <div style={{marginBottom:"20px"}}>
                <label style={{display:"block",marginBottom:"8px",color:T.textSub,fontWeight:500,fontSize:"14px"}}>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required style={{width:"100%",padding:"12px 16px",border:`2px solid ${T.border}`,borderRadius:"10px",fontSize:"15px",background:T.inputBg,color:T.text,fontFamily:"'Outfit',sans-serif"}}/>
              </div>
              <div style={{marginBottom:"20px"}}>
                <label style={{display:"block",marginBottom:"8px",color:T.textSub,fontWeight:500,fontSize:"14px"}}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" required style={{width:"100%",padding:"12px 16px",border:`2px solid ${T.border}`,borderRadius:"10px",fontSize:"15px",background:T.inputBg,color:T.text,fontFamily:"'Outfit',sans-serif"}}/>
              </div>
              <div style={{marginBottom:"20px"}}>
                <label style={{display:"block",marginBottom:"8px",color:T.textSub,fontWeight:500,fontSize:"14px"}}>Phone (for SMS alerts)</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 473 XXX XXXX" style={{width:"100%",padding:"12px 16px",border:`2px solid ${T.border}`,borderRadius:"10px",fontSize:"15px",background:T.inputBg,color:T.text,fontFamily:"'Outfit',sans-serif"}}/>
              </div>
              <div style={{marginBottom:"24px"}}>
                <label style={{display:"block",marginBottom:"8px",color:T.textSub,fontWeight:500,fontSize:"14px"}}>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose a password (min 6 characters)" required style={{width:"100%",padding:"12px 16px",border:`2px solid ${T.border}`,borderRadius:"10px",fontSize:"15px",background:T.inputBg,color:T.text,fontFamily:"'Outfit',sans-serif"}}/>
              </div>
              <button type="submit" disabled={formLoading} style={{width:"100%",padding:"14px",background:formLoading?T.cardAlt:T.accent,color:formLoading?T.muted:"#fff",border:"none",borderRadius:"10px",fontSize:"16px",fontWeight:600,cursor:formLoading?"not-allowed":"pointer",fontFamily:"'Outfit',sans-serif",transition:"all 0.2s"}}>{formLoading ? 'Creating account...' : 'Register'}</button>
              <p style={{textAlign:"center",marginTop:"20px",color:T.muted,fontSize:"14px"}}>Already have an account? <a onClick={() => setPage('login')} style={{color:T.accent,textDecoration:"none",fontWeight:600,cursor:"pointer"}}>Sign in here</a></p>
            </form>
          </div>
        </div>
      </>
    );
  }

  const dynamicBg = getWeatherBackground(current, isDark);

  return (<><style>{css}</style><div style={{minHeight:"100vh",background:dynamicBg,fontFamily:"'Outfit',sans-serif",transition:"background 1.5s ease",position:"relative"}}><div style={{background:isDark?T.card:`${T.card}f5`,borderBottom:`1px solid ${T.border}`,position:"sticky",top:0,zIndex:90,boxShadow:T.shadow,backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)"}}><div style={{maxWidth:"960px",margin:"0 auto",padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px"}}><div style={{display:"flex",alignItems:"center",gap:"10px"}}><div style={{width:"36px",height:"36px",borderRadius:"10px",background:T.accentBg,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><img src={risingSunLogo} alt="WeatherAlert" style={{width:"24px",height:"24px",objectFit:"contain"}}/></div><div><div style={{color:T.text,fontWeight:700,fontSize:"16px",letterSpacing:"-0.01em",lineHeight:1}}>WeatherAlert</div><div style={{color:T.muted,fontSize:"10px",letterSpacing:".06em",textTransform:"uppercase",marginTop:"2px"}}>Grenada</div></div></div><nav style={{display:"flex",gap:"2px"}}>{[{id:"dashboard",ic:<Ic.Dashboard/>,la:"Weather",roles:["user","admin"]},{id:"radar",ic:<Ic.Map/>,la:"Radar",roles:["user","admin"]},{id:"disaster",ic:<Ic.Shield/>,la:"Safety",roles:["user","admin"]},{id:"alerts",ic:<Ic.Bell/>,la:"Alerts",roles:["user"]},...(user?.role==="admin"?[{id:"admin",ic:<Ic.Shield/>,la:"Admin Panel",roles:["admin"]}]:[]),].filter(t=>t.roles.includes(user?.role||"user")).map(t=>(<button key={t.id} className="tab-btn" onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:"6px",padding:"7px 14px",borderRadius:"8px",border:"none",cursor:"pointer",fontSize:"13px",fontWeight:tab===t.id?600:400,background:tab===t.id?T.accentBg:"transparent",color:tab===t.id?T.accent:T.muted,fontFamily:"'Outfit',sans-serif"}}>{t.ic}{t.la}</button>))}</nav><div style={{display:"flex",gap:"8px",alignItems:"center"}}><button onClick={()=>parish&&fetchWeather(parish.lat,parish.lon,units)} disabled={loading} style={{width:"32px",height:"32px",borderRadius:"8px",background:T.cardAlt,border:`1px solid ${T.border}`,color:loading?T.muted:T.accent,cursor:loading?"wait":"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}><div style={{animation:loading?"spin 1s linear infinite":"none"}}><Ic.Refresh/></div></button><button onClick={()=>setUnits(u=>u==="metric"?"us":"metric")} style={{background:T.cardAlt,border:`1px solid ${T.border}`,borderRadius:"7px",padding:"5px 10px",color:T.muted,fontSize:"12px",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",letterSpacing:".03em"}}>{units==="metric"?"°C":"°F"}</button><button onClick={()=>setIsDark(d=>!d)} style={{width:"32px",height:"32px",borderRadius:"8px",background:T.cardAlt,border:`1px solid ${T.border}`,color:T.muted,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{isDark?<Ic.Sun/>:<Ic.Moon/>}</button><button onClick={logout} style={{display:"flex",alignItems:"center",gap:"5px",padding:"7px 12px",borderRadius:"8px",background:T.danger,border:"none",color:"#fff",cursor:"pointer",fontSize:"12px",fontWeight:600}}><Ic.LogOut/>Logout</button></div></div></div><div style={{maxWidth:"960px",margin:"0 auto",padding:"28px 20px 60px",position:"relative",zIndex:1}}><div ref={dropRef} style={{position:"relative",marginBottom:"20px",zIndex:50}}><button onClick={()=>setDropOpen(o=>!o)} style={{width:"100%",...card({padding:"12px 16px",display:"flex",alignItems:"center",gap:"10px",cursor:"pointer",border:`1px solid ${dropOpen?T.accent:T.border}`,borderRadius:"10px",textAlign:"left",transition:"border-color .15s"})}}><Ic.Pin/><div style={{flex:1}}><span style={{color:T.text,fontSize:"14px",fontWeight:600}}>{parish?.name||"Select Parish"}</span><span style={{color:T.muted,fontSize:"13px",marginLeft:"8px"}}>{parish?`— ${parish.capital}, Grenada`:""}</span></div><div style={{color:T.muted,transition:"transform .2s",transform:dropOpen?"rotate(180deg)":"none"}}><Ic.ChevDown/></div></button>{dropOpen && (<div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,...card({borderRadius:"12px",padding:"6px",zIndex:200,boxShadow:`0 8px 32px rgba(0,0,0,${isDark?.4:.12})`})}}><div style={{padding:"6px 12px 8px",borderBottom:`1px solid ${T.border}`,marginBottom:"4px"}}><span style={{color:T.muted,fontSize:"11px",fontWeight:600,letterSpacing:".07em",textTransform:"uppercase"}}>Grenada Parishes</span></div>{PARISHES.map(p=>(<div key={p.id} onClick={()=>selectParish(p)} style={{display:"flex",alignItems:"center",gap:"12px",padding:"9px 12px",borderRadius:"8px",transition:"background .12s",background:parish?.id===p.id?T.accentBg:"transparent",cursor:"pointer"}}><div style={{flex:1}}><div style={{color:T.text,fontSize:"13px",fontWeight:parish?.id===p.id?600:400}}>{p.name}</div><div style={{color:T.muted,fontSize:"12px",marginTop:"1px"}}>{p.capital} · {p.desc}</div></div></div>))}</div>)}</div>{lastUpdated && (<div style={{textAlign:"center",marginBottom:"16px"}}><div style={{color:T.muted,fontSize:"11px"}}>Last updated: {lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div></div>)}{error && (<div style={{background:T.dangerBg,border:`1px solid ${T.danger}33`,borderRadius:"10px",padding:"12px 16px",color:T.danger,fontSize:"13px",marginBottom:"16px"}}>{error}</div>)}{loading && (<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"12px",padding:"60px 0",color:T.muted}}><div style={{width:"20px",height:"20px",border:`2px solid ${T.border}`,borderTop:`2px solid ${T.accent}`,borderRadius:"50%",animation:"spin .7s linear infinite"}}/><span style={{fontSize:"14px"}}>Loading {parish?.name} weather…</span></div>)}{!loading && tab==="dashboard" && weather && current && (<div className="fade-up"><div style={{position:"relative",marginBottom:"20px",borderRadius:"24px",overflow:"hidden",minHeight:"400px",background:T.card}}><div style={{position:"absolute",inset:0,background:T.heroGradient}}/><div style={{position:"relative",zIndex:1,padding:"40px 32px"}}><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"24px"}}><Ic.Pin/><span style={{color:T.text,fontSize:"20px",fontWeight:600}}>{parish?.capital || parish?.name}</span></div><div style={{fontSize:"120px",fontWeight:200,color:T.text,lineHeight:.85,marginBottom:"16px",letterSpacing:"-0.04em"}}>{Math.round(current.temperature)}°</div><div style={{fontSize:"24px",color:T.textSub,fontWeight:400,marginBottom:"32px"}}>{current.summary||"Partly Cloudy"}</div><div style={{display:"flex",gap:"20px",fontSize:"18px",color:T.textSub,marginBottom:"40px"}}><span>↑ {Math.round((weather.daily?.data?.[0]?.all_day?.temperature_max??current.temperature)+2)}° / ↓ {Math.round((weather.daily?.data?.[0]?.all_day?.temperature_min??current.temperature)-2)}°</span><span>Feels like {Math.round(current.feels_like??current.temperature)}°</span></div><div className="glass" style={{background:T.glass,backdropFilter:"blur(20px)",borderRadius:"16px",padding:"20px",border:`1px solid ${T.border}`}}><div style={{color:T.text,fontSize:"16px",lineHeight:1.6}}>{current.summary}. Highs {Math.round((weather.daily?.data?.[0]?.all_day?.temperature_max??current.temperature)+2)} to {Math.round((weather.daily?.data?.[0]?.all_day?.temperature_max??current.temperature)+4)}°C and lows {Math.round((weather.daily?.data?.[0]?.all_day?.temperature_min??current.temperature)-2)} to {Math.round((weather.daily?.data?.[0]?.all_day?.temperature_min??current.temperature))}°C.</div></div></div></div>{weather.hourly?.data?.length>0 && (<div className="glass" style={{background:T.glass,backdropFilter:"blur(20px)",borderRadius:"24px",padding:"24px",marginBottom:"20px",border:`1px solid ${T.border}`}}><div style={{display:"flex",gap:"0px",overflowX:"auto",paddingBottom:"4px",marginBottom:"16px"}}>{weather.hourly.data.filter(h => {const hourTime = new Date(h.date);const now = new Date();return hourTime >= now;}).slice(0,8).map((h,i)=>{const d=new Date(h.date);const hour=d.getHours();const ampm=hour>=12?"PM":"AM";const displayHour=hour%12||12;const isNight = hour < 6 || hour >= 19;const icon = getWeatherIcon(h, isNight);const precipProb = h.precipitation?.probability || 0;return (<div key={i} className="hour-card" style={{flex:"1 0 80px",display:"flex",flexDirection:"column",alignItems:"center",gap:"10px",padding:"12px 8px"}}><div style={{color:T.muted,fontSize:"13px",fontWeight:500}}>{i===0?"Now":`${displayHour} ${ampm}`}</div><div style={{fontSize:"36px",lineHeight:1}}>{icon}</div><div style={{color:T.text,fontSize:"18px",fontWeight:600}}>{Math.round(h.temperature)}°</div><div style={{display:"flex",alignItems:"center",gap:"4px",color:T.muted,fontSize:"13px",marginTop:"4px"}}>💧<span>{precipProb > 0 ? `${Math.round(precipProb)}%` : "0%"}</span></div></div>);})}</div><div style={{position:"relative",height:"3px",background:T.border,borderRadius:"2px",margin:"16px 8px 8px"}}><div style={{position:"absolute",top:"-1px",left:"0",right:"0",height:"5px",background:`linear-gradient(90deg, ${T.accent}, ${T.accent2})`,borderRadius:"3px",opacity:0.6}}/></div></div>)}{weather.daily?.data?.length>0 && (<div style={{...card({padding:"20px"})}}><div style={sLabel}>7-Day Forecast</div><div style={{display:"flex",flexDirection:"column",gap:"2px"}}>{weather.daily.data.slice(0,7).map((d,i)=>{const dateStr = d.day;const [year, month, day] = dateStr.split('-').map(Number);const dt = new Date(year, month - 1, day);const today = new Date();today.setHours(0,0,0,0);const tomorrow = new Date(today);tomorrow.setDate(tomorrow.getDate() + 1);const isToday = dt.getTime() === today.getTime();const isTomorrow = dt.getTime() === tomorrow.getTime();const la = isToday ? "Today" : isTomorrow ? "Tomorrow" : dt.toLocaleDateString([],{weekday:"long"});const hi=d.all_day?.temperature_max??0;const lo=d.all_day?.temperature_min??0;const dayWeatherData = {cloud_cover: d.all_day?.cloud_cover || 50,precipitation: d.all_day?.precipitation_sum || 0,rain: d.all_day?.precipitation_sum || 0,showers: 0};const dayIcon = getWeatherIcon(dayWeatherData, false);const range=16, min=22;const hp=Math.max(0,Math.min(100,((hi-min)/range)*100));const lp=Math.max(0,Math.min(100,((lo-min)/range)*100));return (<div key={i} className="day-row" style={{display:"flex",alignItems:"center",gap:"12px",padding:"9px 8px"}}><div style={{color:T.text,fontSize:"13px",fontWeight:i===0?600:400,width:"88px",flexShrink:0}}>{la}</div><div style={{fontSize:"20px",flexShrink:0,width:"28px",textAlign:"center"}}>{dayIcon}</div><div style={{flex:1,height:"3px",background:T.border,borderRadius:"2px",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",left:`${lp}%`,width:`${Math.max(hp-lp,6)}%`,height:"100%",background:T.accent,borderRadius:"2px",opacity:.6}}/></div><div style={{display:"flex",gap:"14px",fontFamily:"'JetBrains Mono',monospace",fontSize:"13px",flexShrink:0}}><span style={{color:T.text,fontWeight:600,minWidth:"40px",textAlign:"right"}}>{Math.round(hi)}{tUnit}</span><span style={{color:T.muted,minWidth:"40px",textAlign:"right"}}>{Math.round(lo)}{tUnit}</span></div></div>);})}</div></div>)}</div>)}{tab==="radar" && (<div className="fade-up"><div style={{...card({padding:"18px",marginBottom:"16px"})}}><div style={sLabel}>Map Layer</div><div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>{[{id:"temp",la:"Temperature"},{id:"rain",la:"Precipitation"},{id:"wind",la:"Wind"},{id:"clouds",la:"Clouds"},{id:"pressure",la:"Pressure"}].map(l=>(<button key={l.id} onClick={()=>setMapLayer(l.id)} style={{padding:"7px 14px",borderRadius:"7px",border:`1px solid ${mapLayer===l.id?T.accent:T.border}`,background:mapLayer===l.id?T.accentBg:T.cardAlt,color:mapLayer===l.id?T.accent:T.muted,fontSize:"13px",cursor:"pointer",fontWeight:mapLayer===l.id?600:400,fontFamily:"'Outfit',sans-serif",transition:"all .15s"}}>{l.la}</button>))}</div></div><div style={{...card({overflow:"hidden",padding:0})}}><iframe title="Grenada Weather Radar" src={`https://embed.windy.com/embed2.html?lat=${parish?.lat||12.11}&lon=${parish?.lon||-61.68}&zoom=9&level=surface&overlay=${mapLayer}&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C`} style={{width:"100%",height:"500px",border:"none"}} allowFullScreen/></div><div style={{...card({padding:"12px 16px",marginTop:"12px"})}}><div style={{color:T.muted,fontSize:"12px",lineHeight:1.7}}>Radar powered by <strong style={{color:T.text}}>Windy</strong>. Map centred on <strong style={{color:T.text}}>{parish?.name||"Grenada"}</strong>. Use the layer buttons to switch views.</div></div></div>)}{tab==="disaster" && (<div className="fade-up"><div style={{...card({padding:"22px",marginBottom:"18px"})}}><div style={{color:T.text,fontSize:"18px",fontWeight:700,marginBottom:"6px"}}>Disaster Preparedness</div><div style={{color:T.muted,fontSize:"14px",lineHeight:1.7}}>Essential safety tips for Grenada's weather conditions.</div><div style={{marginTop:"14px",display:"flex",alignItems:"center",gap:"10px",padding:"10px 14px",background:T.accentBg,borderRadius:"8px",border:`1px solid ${T.accent}22`}}><span style={{color:T.accent,fontSize:"14px"}}>📻</span><div style={{color:T.textSub,fontSize:"12px",lineHeight:1.6}}>During emergencies, follow <strong style={{color:T.text}}>NADMA</strong> (National Disaster Management Agency) advisories. Tune to <strong style={{color:T.text}}>GIS Radio 535 AM</strong> or <strong style={{color:T.text}}>Hott FM 105.5</strong> for official updates.</div></div></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"16px"}}><div style={{...card({padding:"20px"})}}><div style={{fontSize:"32px",marginBottom:"12px"}}>🌀</div><div style={{color:T.text,fontSize:"16px",fontWeight:600,marginBottom:"12px"}}>Hurricane</div><ul style={{color:T.textSub,fontSize:"13px",lineHeight:1.8,paddingLeft:"18px"}}><li>Prepare emergency kit: water, food, medications</li><li>Board up windows and secure outdoor items</li><li>Know your evacuation route</li><li>Stay indoors during the storm</li><li>Avoid floodwaters after the storm</li></ul></div><div style={{...card({padding:"20px"})}}><div style={{fontSize:"32px",marginBottom:"12px"}}>🌊</div><div style={{color:T.text,fontSize:"16px",fontWeight:600,marginBottom:"12px"}}>Flooding</div><ul style={{color:T.textSub,fontSize:"13px",lineHeight:1.8,paddingLeft:"18px"}}><li>Move to higher ground immediately</li><li>Never walk or drive through floodwaters</li><li>Disconnect electrical appliances</li><li>Clean and disinfect everything wet</li><li>Use bottled water after flooding</li></ul></div><div style={{...card({padding:"20px"})}}><div style={{fontSize:"32px",marginBottom:"12px"}}>🌪️</div><div style={{color:T.text,fontSize:"16px",fontWeight:600,marginBottom:"12px"}}>Tropical Storm</div><ul style={{color:T.textSub,fontSize:"13px",lineHeight:1.8,paddingLeft:"18px"}}><li>Monitor NADMA broadcasts</li><li>Secure loose outdoor items</li><li>Identify safest interior room</li><li>Keep 72-hour emergency kit ready</li><li>Stay off roads during storm</li></ul></div><div style={{...card({padding:"20px"})}}><div style={{fontSize:"32px",marginBottom:"12px"}}>🔥</div><div style={{color:T.text,fontSize:"16px",fontWeight:600,marginBottom:"12px"}}>Extreme Heat</div><ul style={{color:T.textSub,fontSize:"13px",lineHeight:1.8,paddingLeft:"18px"}}><li>Drink water regularly</li><li>Avoid outdoor activity 10 AM-4 PM</li><li>Check on elderly neighbors</li><li>Never leave children in parked cars</li><li>Know signs of heat stroke</li></ul></div><div style={{...card({padding:"20px"})}}><div style={{fontSize:"32px",marginBottom:"12px"}}>⛈️</div><div style={{color:T.text,fontSize:"16px",fontWeight:600,marginBottom:"12px"}}>Thunderstorms</div><ul style={{color:T.textSub,fontSize:"13px",lineHeight:1.8,paddingLeft:"18px"}}><li>Seek shelter indoors</li><li>Unplug electronics during lightning</li><li>Stay away from windows</li><li>Wait 30 minutes after last thunder</li><li>Watch for flash flood warnings</li></ul></div><div style={{...card({padding:"20px"})}}><div style={{fontSize:"32px",marginBottom:"12px"}}>🌍</div><div style={{color:T.text,fontSize:"16px",fontWeight:600,marginBottom:"12px"}}>Earthquake</div><ul style={{color:T.textSub,fontSize:"13px",lineHeight:1.8,paddingLeft:"18px"}}><li>Drop, Cover, and Hold On</li><li>Get under sturdy furniture</li><li>Stay away from windows</li><li>Expect aftershocks</li><li>Do not use elevators</li></ul></div></div></div>)}{tab==="alerts" && user.role === "user" && (<div className="fade-up"><div style={{...card({padding:"24px"})}}><div style={sLabel}>Your Weather Alerts</div><div style={{color:T.muted,fontSize:"13px",marginBottom:"20px"}}>Alerts sent by admin will appear here</div>{(()=>{try{const history = JSON.parse(localStorage.getItem(`user_alerts_${user.email}`) || "[]");if (history.length === 0) return (<div style={{textAlign:"center",padding:"40px 20px",color:T.muted}}><div style={{fontSize:"40px",marginBottom:"12px"}}>📭</div><div style={{fontSize:"14px"}}>No alerts received yet</div></div>);return history.slice().reverse().map((alert, i) => (<div key={i} style={{padding:"14px",borderRadius:"10px",background:T.cardAlt,border:`1px solid ${T.border}`,marginBottom:"10px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}><div style={{fontSize:"12px",fontWeight:600,color:T.accent,textTransform:"uppercase"}}>📢 Admin Alert</div><div style={{fontSize:"11px",color:T.muted}}>{new Date(alert.timestamp).toLocaleString()}</div></div><div style={{fontSize:"14px",color:T.text,marginBottom:"8px",fontWeight:600}}>{alert.parish}</div><div style={{fontSize:"13px",color:T.textSub}}>{alert.message}</div></div>));}catch(error){return <div style={{color:T.muted}}>Unable to load alerts</div>;}})()}</div></div>)}{tab==="admin" && user.role === 'admin' && (<div className="fade-up">{current && (<div style={{...card({padding:"24px",marginBottom:"20px"})}}><div style={sLabel}>Current Conditions - {parish?.name}</div><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"16px",marginTop:"16px"}}><div><div style={{color:T.muted,fontSize:"12px",marginBottom:"4px"}}>Temperature</div><div style={{color:T.text,fontSize:"20px",fontWeight:600}}>{Math.round(current.temperature)}°C</div></div><div><div style={{color:T.muted,fontSize:"12px",marginBottom:"4px"}}>Wind Speed</div><div style={{color:T.text,fontSize:"20px",fontWeight:600}}>{Math.round(current.wind?.speed||0)} km/h</div></div><div><div style={{color:T.muted,fontSize:"12px",marginBottom:"4px"}}>Rain</div><div style={{color:T.text,fontSize:"20px",fontWeight:600}}>{current.rain||0} mm</div></div><div><div style={{color:T.muted,fontSize:"12px",marginBottom:"4px"}}>Cloud Cover</div><div style={{color:T.text,fontSize:"20px",fontWeight:600}}>{current.cloud_cover||0}%</div></div></div></div>)}{(()=>{const detectedAlerts = JSON.parse(localStorage.getItem('detected_alerts') || '[]');if (detectedAlerts.length > 0) return (<div style={{...card({padding:"24px",marginBottom:"20px"})}}><div style={sLabel}>⚠️ Detected Weather Alerts</div><div style={{color:T.muted,fontSize:"12px",marginBottom:"16px"}}>These alerts were automatically detected from weather conditions</div>{detectedAlerts.slice(0, 5).map((alert, i) => (<div key={i} style={{padding:"12px",borderRadius:"8px",background:alert.severity==='critical'?T.dangerBg:T.warningBg,border:`1px solid ${alert.severity==='critical'?T.danger:T.warning}`,marginBottom:"8px"}}><div style={{fontSize:"13px",fontWeight:600,color:alert.severity==='critical'?T.danger:T.warning}}>{alert.title}</div><div style={{fontSize:"12px",color:T.textSub,marginTop:"4px"}}>{alert.message}</div><div style={{fontSize:"11px",color:T.muted,marginTop:"4px"}}>{new Date(alert.timestamp).toLocaleString()}</div></div>))}</div>);return null;})()}<div style={{...card({padding:"24px",marginBottom:"20px"})}}><div style={sLabel}>System Statistics</div><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"16px",marginTop:"16px"}}><div style={{padding:"20px",background:T.cardAlt,borderRadius:"10px",textAlign:"center"}}><div style={{fontSize:"32px",fontWeight:700,color:T.text}}>{users.length}</div><div style={{color:T.muted,fontSize:"12px",marginTop:"4px"}}>Total Users</div></div><div style={{padding:"20px",background:T.cardAlt,borderRadius:"10px",textAlign:"center"}}><div style={{fontSize:"32px",fontWeight:700,color:T.text}}>{users.filter(u=>u.phone).length}</div><div style={{color:T.muted,fontSize:"12px",marginTop:"4px"}}>Users with Phone</div></div><div style={{padding:"20px",background:T.cardAlt,borderRadius:"10px",textAlign:"center"}}><div style={{fontSize:"32px",fontWeight:700,color:T.success}}>Online</div><div style={{color:T.muted,fontSize:"12px",marginTop:"4px"}}>System Status</div></div></div></div><div style={{...card({padding:"24px",marginBottom:"20px"})}}><div style={sLabel}>📢 Broadcast Alert to All Users</div><div style={{color:T.muted,fontSize:"13px",marginBottom:"20px"}}>Send weather alerts to all registered users with phone numbers</div>{sendStatus && (<div style={{padding:"12px",borderRadius:"8px",background:sendStatus.includes('✓')?T.successBg:T.warningBg,border:`1px solid ${sendStatus.includes('✓')?T.success:T.warning}`,color:sendStatus.includes('✓')?T.success:T.warning,marginBottom:"16px",fontSize:"13px"}}>{sendStatus}</div>)}<textarea value={alertMessage} onChange={(e) => setAlertMessage(e.target.value)} placeholder="Enter alert message (e.g., Heavy rain expected in Saint George. Avoid low-lying areas.)" style={{width:"100%",minHeight:"120px",padding:"12px",borderRadius:"8px",border:`2px solid ${T.border}`,background:T.inputBg,color:T.text,fontSize:"14px",fontFamily:"'Outfit',sans-serif",marginBottom:"12px"}}/><button onClick={sendAlertToAllUsers} disabled={sending || !alertMessage.trim()} style={{width:"100%",padding:"14px",borderRadius:"9px",border:"none",background:alertMessage.trim()&&!sending?T.accent:T.cardAlt,color:alertMessage.trim()&&!sending?"#fff":T.muted,fontSize:"14px",fontWeight:600,cursor:alertMessage.trim()&&!sending?"pointer":"not-allowed",fontFamily:"'Outfit',sans-serif"}}>{sending ? "Sending..." : `📢 Send Alert to ${users.filter(u=>u.phone).length} Users`}</button></div><div style={{...card({padding:"24px"})}}><div style={sLabel}>Registered Users ({users.length})</div><div style={{marginTop:"16px"}}>{users.length === 0 ? (<div style={{textAlign:"center",padding:"40px",color:T.muted}}>No users registered yet</div>) : (users.map((u, i) => (<div key={i} style={{padding:"12px",marginBottom:"8px",background:T.cardAlt,borderRadius:"8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><strong style={{color:T.text}}>{u.name}</strong><div style={{fontSize:"12px",color:T.muted,marginTop:"2px"}}>{u.email}</div>{u.phone && <div style={{fontSize:"11px",color:T.muted}}>📱 {u.phone}</div>}</div><span style={{padding:"4px 12px",background:u.phone?T.successBg:T.dangerBg,color:u.phone?T.success:T.danger,borderRadius:"6px",fontSize:"11px",fontWeight:600}}>{u.phone ? 'SMS Enabled' : 'No Phone'}</span></div>)))}</div></div></div>)}</div></div></>);
}

export default App;