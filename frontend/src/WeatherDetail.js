import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import windIconImg from './resources/tool.png';

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

function formatDateTime(timestamp) {
  const date = new Date(timestamp * 1000);
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const dayOfMonth = date.getDate();
  return `${time}, ${month} ${dayOfMonth}`;
}

export default function WeatherDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cityData } = location.state || {};

  if (!cityData) {
    return <div className="center">No city data found.</div>;
  }

  return (
    <div className="weather-container">
      <button className="logoutbtn" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>← Back</button>

      <div className="weather-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Card Top */}
        <div 
          className="card-top"
          style={{ backgroundImage: `url(${getCardImage(cityData.WeatherCondition)})`, minHeight: '300px' }}
        >
          <div className="card-top-content">
            <div>
              <h1>{cityData.CityName}</h1>
              <p className="timestamp">{formatDateTime(cityData.timestamp)}</p>
              <p className="condition">
                <img 
                  src={getConditionIcon(cityData.WeatherCondition)} 
                  alt={cityData.WeatherCondition} 
                  className="condition-icon"
                />
                {cityData.WeatherCondition}
              </p>
            </div>

            <div className="temp">
              {cityData.Temperature}°C
              <p className='tempminmax'>Temp Min: {cityData.TempMin}°C</p>
              <p className='tempminmax'>Temp Max: {cityData.TempMax}°C</p>
            </div>
          </div>
        </div>

        {/* Card Bottom */}
        <div className="card-bottom">
          <div>
            <p><strong>Pressure:</strong> {cityData.Pressure} hPa</p>
            <p><strong>Humidity:</strong> {cityData.Humidity}%</p>
            <p><strong>Visibility:</strong> {cityData.Visibility} km</p>
          </div>
          <div className='wind-container'>
            <img src={windIconImg} alt="Wind Icon" className="wind-icon" />
            <p><strong>Wind:</strong> {cityData.WindSpeed} m/s {cityData.WindDirection}°</p>
          </div>
          <div className='sunsetsunrice'>
            <p><strong>Sunrise:</strong> {cityData.Sunrise}</p>
            <p><strong>Sunset:</strong> {cityData.Sunset}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
