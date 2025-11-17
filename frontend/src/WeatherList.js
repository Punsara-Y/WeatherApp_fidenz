import React, { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from 'react-router-dom'; // <-- for navigation
import './styles.css';

import fewclouds from './resources/fewclouds.png';
import brokenclouds from './resources/brokencloud.png';
import clear from './resources/clear.png';
import lightrain from './resources/lightrain.png';
import mist from './resources/mist.png';
import defaultImg from './resources/default.png';

import sunIcon from './resources/sun.png';
import fewcloudsIcon from './resources/cloud.png';
import brokencloudsIcon from './resources/clouds.png';
import rainIcon from './resources/rain.png';
import mistIcon from './resources/snow.png';
import defaultIcon from './resources/def.png';

function formatDateTime(timestamp) {
  const date = new Date(timestamp * 1000);
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const dayOfMonth = date.getDate();
  return `${time}, ${month} ${dayOfMonth}`;
}

function getCardImage(condition) {
  const c = condition.toLowerCase();
  if (c.includes("few clouds")) return fewclouds;
  if (c.includes("broken clouds")) return brokenclouds;
  if (c.includes("clear")) return clear;
  if (c.includes("rain")) return lightrain;
  if (c.includes("mist")) return mist;
  return defaultImg;
}

function getConditionIcon(condition) {
  const c = condition.toLowerCase();
  if (c.includes("clear")) return sunIcon;
  if (c.includes("few clouds")) return fewcloudsIcon;
  if (c.includes("broken clouds")) return brokencloudsIcon;
  if (c.includes("rain")) return rainIcon;
  if (c.includes("mist") || c.includes("fog")) return mistIcon;
  return defaultIcon;
}

export default function WeatherList() {
  const { getAccessTokenSilently } = useAuth0();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // navigation hook

  async function load() {
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch('/api/weather', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setData(json.CityDetails);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div className="center">Loading weather...</div>;

  return (
    <div className="weather-container">
      <h1 className="app-title"> 🌥️ Weather App</h1>

      <div className="weather-grid">
        {data.map((c, i) => (
          <div key={i} className="weather-card">
            <button className="close-btn" onClick={() => setData(d => d.filter((_, x) => x !== i))}>×</button>
            <div 
              className="card-top"
              style={{ backgroundImage: `url(${getCardImage(c.WeatherCondition)})` , cursor:'pointer' }}
              onClick={() => navigate(`/weather/${c.CityName}`, { state: { cityData: c } })} // navigate to detail page
            >
              <div className="card-top-content">
                <div>
                  <h1>{c.CityName}</h1>
                  <p className="timestamp">{formatDateTime(c.timestamp)}</p>

                  <p className="condition">
                    <img 
                      src={getConditionIcon(c.WeatherCondition)} 
                      alt={c.WeatherCondition} 
                      className="condition-icon"
                    />
                    {c.WeatherCondition}
                  </p>
                </div>

                <div className="temp">
                  {c.Temperature}°C
                  <p className='tempminmax'>Temp Min: {c.TempMin}°C</p>
                  <p className='tempminmax'>Temp Max: {c.TempMax}°C</p>
                </div>
              </div>
            </div>

            {/* Card Bottom */}
            <div className="card-bottom">
              <div>
                <p><strong>Pressure:</strong> {c.Pressure} hPa</p>
                <p><strong>Humidity:</strong> {c.Humidity}%</p>
                <p><strong>Visibility:</strong> {c.Visibility} km</p>
              </div>
              <div className='wind-container'>
                <img src={require('./resources/tool.png')} alt="Wind Icon" className="wind-icon" />
                <p><strong>Wind:</strong> {c.WindSpeed} m/s {c.WindDirection}°</p>
              </div>
              <div className='sunsetsunrice'>
                <p><strong>Sunrise:</strong> {c.Sunrise}</p>
                <p><strong>Sunset:</strong> {c.Sunset}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
