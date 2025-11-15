import React, { useEffect, useState } from 'react';
import './styles.css';

export default function WeatherList() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/weather', { credentials: 'include' });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Failed: ${res.status} ${txt}`);
      }
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="center">Loading weather...</div>;
  if (error) return <div className="center error">Error: {error}</div>;
  if (!data) return null;

  return (
    <div className="grid">
      {data.map((c) => (
        <div key={c.id} className="card">
          {c.error ? (
            <div className="error">Error: {c.error}</div>
          ) : (
            <>
              <h3>{c.name}</h3>
              <p className="desc">{c.weather}</p>
              <p className="temp">{c.temp !== undefined ? `${c.temp} °C` : 'N/A'}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
