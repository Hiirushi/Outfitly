const express = require("express");
const axios = require("axios");
const router = express.Router();

const API_KEY = process.env.WEATHER_API_KEY;

// GET /api/weather?lat=6.9271&lon=79.8612 (coordinates)
// OR /api/weather?city=Colombo (fallback for city name)
router.get("/", async (req, res) => {
  const { lat, lon, city } = req.query;
  
  if (!API_KEY) {
    return res.status(500).json({ error: "Weather API key not configured" });
  }

  // Determine query parameter for WeatherAPI
  let queryParam;
  
  if (lat && lon) {
    // Use coordinates if provided
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: "Invalid latitude or longitude values" });
    }
    
    queryParam = `${latitude},${longitude}`;
  } else if (city) {
    // Fallback to city name
    queryParam = city;
  } else {
    return res.status(400).json({ 
      error: "Missing required parameters. Provide either 'lat' and 'lon' coordinates, or 'city' name" 
    });
  }

  try {
    console.log(`Fetching weather for: ${queryParam}`);
    
    const response = await axios.get(
      `http://api.weatherapi.com/v1/forecast.json`,
      {
        params: {
          key: API_KEY,
          q: queryParam, // Can be coordinates "lat,lon" or city name
          days: 3,
          aqi: "no",
          alerts: "no",
        },
        timeout: 8000,
      }
    );

    // Log successful response for debugging
    console.log(`Weather data fetched successfully for ${response.data.location?.name || queryParam}`);
    
    res.json(response.data);
    
  } catch (error) {
    console.error(
      "Weather fetch error:",
      error?.response?.status,
      error?.response?.statusText,
      error?.response?.data || error.message
    );

    // Provide more specific error messages
    let errorMessage = "Weather data fetch failed";
    
    if (error?.response?.status === 400) {
      errorMessage = "Invalid location. Please check your coordinates or try again.";
    } else if (error?.response?.status === 401) {
      errorMessage = "Weather service authentication failed";
    } else if (error?.response?.status === 403) {
      errorMessage = "Weather service access denied";
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = "Weather service request timed out";
    }

    res.status(error?.response?.status || 500).json({ 
      error: errorMessage,
      details: error?.response?.data?.error?.message || error.message
    });
  }
});

module.exports = router;