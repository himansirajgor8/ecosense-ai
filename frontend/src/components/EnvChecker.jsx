const EnvChecker = () => {
  const waqiToken = import.meta.env.VITE_WAQI_TOKEN;
  const weatherKey = import.meta.env.VITE_OPENWEATHER_KEY;

  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      background: '#1e293b',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #334155',
      boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <p>{waqiToken ? '✅' : '❌'} WAQI Token: {waqiToken ? 'Loaded' : 'Missing'}</p>
      <p>{weatherKey ? '✅' : '❌'} OpenWeather: {weatherKey ? 'Loaded' : 'Missing'}</p>
    </div>
  );
};

export default EnvChecker;
