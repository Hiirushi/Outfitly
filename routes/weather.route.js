const express = require("express");
const axios = require("axios");
const router = express.Router();

const API_KEY = process.env.WEATHER_API_KEY;

// GET /api/weather?city=Colombo
router.get("/", async (req, res) => {
  const { city } = req.query;
  if (!city)
    return res.status(400).json({ error: "Missing 'city' query parameter" });
  if (!API_KEY)
    return res.status(500).json({ error: "Weather API key not configured" });

  try {
    const response = await axios.get(
      `http://api.weatherapi.com/v1/forecast.json`,
      {
        params: {
          key: API_KEY,
          q: city,
          days: 3,
          aqi: "no",
          alerts: "no",
        },
        timeout: 5000,
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      "Weather fetch error:",
      error?.response?.data || error.message
    );
    res.status(500).json({ error: "Weather data fetch failed" });
  }
});

module.exports = router;
