import React, { useEffect, useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import './styles.css';

function formatDateTime(timestamp) {
  const date = new Date(timestamp * 1000);
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const day = date.toLocaleDateString('en-US', { weekday: 'short' });
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const dayOfMonth = date.getDate();
  return `${time}, ${day}, ${month} ${dayOfMonth}`;
}

function getColorClass(condition) {
  const lower = condition?.toLowerCase() || '';
  if (lower.includes('cloud') || lower.includes('clear')) return 'card-blue';
  if (lower.includes('rain')) return 'card-orange';
  if (lower.includes('mist')) return 'card-red';
  return 'card-default';
}

export default function WeatherList() {
  const { getAccessTokenSilently } = useAuth0();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const removeCity = (index) => setData(d => d.filter((_, i) => i !== index));

  async function load() {
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch('/api/weather', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to load weather data");
      const json = await res.json();
      setData(json.CityDetails);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div className="center">Loading weather...</div>;
  if (error) return <div className="center error">Error: {error}</div>;

  return (
    <div className="weather-dashboard">
      <div className="grid">
        {data.map((c, i) => (
          <div key={i} className={`card ${getColorClass(c.WeatherCondition)}`}>
            {c.error ? (
              <div className="error">Error: {c.error}</div>
            ) : (
              <>
                <div className="card-header">
                  <h3>{c.CityName}, {c.CityCode}</h3>
                  <span className="remove-btn" onClick={() => removeCity(i)}>×</span>
                </div>

                <div className="temp-section">
                  <div className="temp-icon">
                    <span className={`weather-icon icon-${c.WeatherCondition.toLowerCase().replace(/\s/g, '-')}`}></span>
                  </div>
                  <div className="temp-details">
                    <p className="current-temp">{c.Temperature} °C</p>
                    <p className="desc">{c.WeatherCondition}</p>
                    <p className="min-max">Min: {c.TempMin} °C</p>
                    <p className="min-max">Max: {c.TempMax} °C</p>
                  </div>
                </div>

                <div className="details-section">
                  <p className="datetime">{formatDateTime(c.timestamp)}</p>
                  <div className="detail-row">
                    <div className="detail-item"><span className="label">Pressure:</span> {c.Pressure} hPa</div>
                    <div className="detail-item"><span className="label">Humidity:</span> {c.Humidity}%</div>
                    <div className="detail-item"><span className="label">Visibility:</span> {c.Visibility} km</div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-item"><span className="label">Wind:</span> {c.WindSpeed} m/s / {c.WindDirection}°</div>
                    <div className="detail-item"><span className="label">Sunrise:</span> {c.Sunrise}</div>
                    <div className="detail-item"><span className="label">Sunset:</span> {c.Sunset}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
