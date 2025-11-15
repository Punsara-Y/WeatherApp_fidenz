import dotenv from "dotenv";
dotenv.config();

import express from "express";
import pkg from "express-openid-connect";
const { auth, requiresAuth } = pkg;

import NodeCache from "node-cache";
import fetch from "node-fetch";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Required to use __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

const PORT = process.env.PORT || 4000;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// Auth0 config
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SESSION_SECRET,
  baseURL: process.env.AUTH0_BASE_URL || `http://localhost:${PORT}`,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
};

app.use(auth(config));

// Load cities.json
let cityIds = [];
try {
  const filePath = path.join(__dirname, "cities.json");
  const jsonText = fs.readFileSync(filePath, "utf8");
  const arr = JSON.parse(jsonText);
  cityIds = arr.map((c) => c.CityCode).filter(Boolean);
  console.log(`Loaded ${cityIds.length} cities.`);

// for experiment to load city details in terminal
/*
  arr.forEach((c) => {

    console.log(`
      City Code : ${c.CityCode}
      City Name : ${c.CityName}
      City Temp : ${c.Temp}
      City Status: ${c.Status}
       `);
    
  });
  */
} catch (err) {
  console.error("Error reading cities.json:", err.message);
}

// 5-minute cache (60x5 = 300)
const cache = new NodeCache({ stdTTL: 300 });

// Fetch weather helper
async function fetchWeather(id) {
  const key = `city_${id}`;
  const saved = cache.get(key);
  if (saved) return saved;

  const url = `https://api.openweathermap.org/data/2.5/weather?id=${id}&appid=${OPENWEATHER_API_KEY}&units=metric`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`OpenWeather error: ${res.statusText}`);

  const json = await res.json();

  const data = {

    //id: json.id, (remove comment if need future)

    CityName: json.name,
    WeatherCondition: json.weather?.[0]?.description || "",
    Temperature: json.main?.temp,
  };

  cache.set(key, data);
  return data;
}

// Routes
//(working)
app.get("/", (req, res) => {
  res.send({
    message: "Weather API running",
    authenticated: req.oidc.isAuthenticated(),
  });
});


//(working)
app.get("/api/weather", requiresAuth(),  async (req, res) => {
  try {
    const promises = cityIds.map((id) =>

      fetchWeather(id).catch((err) => ({ id, error: err.message }))

    );
    const CityDetails = await Promise.all(promises);

    res.json({ CityDetails });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
