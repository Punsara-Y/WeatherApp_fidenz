import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { auth } from "express-oauth2-jwt-bearer";
import NodeCache from "node-cache";
import fetch from "node-fetch";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

const PORT = process.env.PORT || 4000;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// ✅ JWT Validation Middleware
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});

// Load city list
let cityIds = [];
try {
  const filePath = path.join(__dirname, "cities.json");
  const arr = JSON.parse(fs.readFileSync(filePath, "utf8"));
  cityIds = arr.map((c) => c.CityCode).filter(Boolean);
  console.log(`Loaded ${cityIds.length} cities.`);
} catch (err) {
  console.error("Error loading cities.json:", err.message);
}

const cache = new NodeCache({ stdTTL: 300 });

async function fetchWeather(id) {
  const key = `city_${id}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const url = `https://api.openweathermap.org/data/2.5/weather?id=${id}&appid=${OPENWEATHER_API_KEY}&units=metric`;
  const res = await fetch(url);
  const json = await res.json();

  const data = {
    CityName: json.name,
    WeatherCondition: json.weather?.[0]?.description || "",
    Temperature: json.main?.temp,
    TempMin: json.main?.temp_min,
    TempMax: json.main?.temp_max,
    Pressure: json.main?.pressure,
    Humidity: json.main?.humidity,
    Visibility: json.visibility / 1000, // Convert meters → km
    WindSpeed: json.wind?.speed,
    WindDirection: json.wind?.deg,
    Sunrise: json.sys?.sunrise ? new Date(json.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
    Sunset: json.sys?.sunset ? new Date(json.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
    timestamp: json.dt

  };

  cache.set(key, data);
  return data;
}

// Public route
app.get("/", (req, res) => {
  res.send({ message: "Weather API running" });
});

// Protected route (JWT required)
app.get("/api/weather", checkJwt, async (req, res) => {
  try {
    const results = await Promise.all(
      cityIds.map((id) =>
        fetchWeather(id).catch((err) => ({ error: err.message }))
      )
    );

    res.json({ CityDetails: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
