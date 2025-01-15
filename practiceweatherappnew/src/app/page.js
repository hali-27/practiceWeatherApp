
"use client";

import { useEffect, useState } from "react";

const WeatherPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });
  const [cityName, setCityName] = useState(""); // State for city name
  const [searchCity, setSearchCity] = useState(""); // State for user input city
  const [debouncedCity, setDebouncedCity] = useState(""); // For debounced city input

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCity(searchCity);
    }, 5000); // Delay the search for 1 second

    return () => {
      clearTimeout(timer); // Clear the timeout if the user types again before the 1 second
    };
  }, [searchCity]);



  useEffect(() => {
    // Fetch coordinates of the city when debouncedCity changes
    const fetchCoordinates = async (city) => {
      try {
        if (!city) return; // Don't fetch if city is empty
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch coordinates");
        }

        const data = await res.json();
        console.log("Geocoding API response:", data);

        if (data.results && data.results.length > 0) {
          const { latitude, longitude, name } = data.results[0]; // Extract the city name from API response
          setCoordinates({ latitude, longitude }); // Set coordinates
          setCityName(name); // Set city name
        } else {
          throw new Error("No results found for this city");
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };



    
    if (searchCity) {
      fetchCoordinates(debouncedCity); // Fetch coordinates for the city entered by the user
    } else {
      fetchCoordinates("London"); // Default to "London" if no city is searched
    }

  }, [searchCity]); // Runs every time the searchCity changes

  // Fetch weather data using the coordinates
  useEffect(() => {
    if (coordinates.latitude && coordinates.longitude) {
      const fetchWeatherData = async () => {
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&current=temperature_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&wind_speed_unit=mph&timezone=GMT`
          );

          if (!res.ok) {
            throw new Error("Failed to fetch weather data");
          }

          const weatherData = await res.json();
          console.log("Weather API response:", weatherData);
          setData(weatherData);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchWeatherData();
    }
  }, [coordinates]); // Re-fetch weather data when coordinates change

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-700">Loading weather data...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-500">Error: {error}</p>
      </div>
    );

  // Extracting data for easy rendering
  const { current, daily } = data;

  // Handle the change in search input
  const handleSearchChange = (e) => {
    setSearchCity(e.target.value);
  };

  // Handle form submit to trigger the search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchCity.trim() !== "") {
      setCityName(searchCity); // Update city name based on search
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-4xl font-semibold text-center text-gray-800 mb-6">
        Weather Forecast for {cityName || "Your City"}
      </h1>

      {/* Search Bar */}
      <div className="mb-6">
        <form onSubmit={handleSearchSubmit} className="flex justify-center items-center space-x-4">
          <input
            type="text"
            value={searchCity}
            onChange={handleSearchChange}
            placeholder="Enter city name"
            className="px-4 py-2 border rounded-lg text-lg"
          />
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg">
            Search
          </button>
        </form>
      </div>

      {/* Current Weather */}
      <div className="bg-gray-50 p-6 rounded-md mb-6 shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Current Weather</h2>
        <div className="space-y-2">
          <p className="text-lg text-gray-600">
            <span className="font-bold">Temperature:</span> {current.temperature_2m}°C
          </p>
          <p className="text-lg text-gray-600">
            <span className="font-bold">Wind Speed:</span> {current.wind_speed_10m} mph
          </p>
          <p className="text-lg text-gray-600">
            <span className="font-bold">Weather Code:</span> {current.weather_code}
          </p>
        </div>
      </div>

      {/* Daily Forecast */}
      <div className="bg-gray-50 p-6 rounded-md shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Daily Forecast</h2>
        <ul className="space-y-4">
          {daily.temperature_2m_max.map((temp, index) => (
            <li
              key={index}
              className="flex justify-between items-center p-4 bg-white shadow rounded-md"
            >
              <div>
                <p className="font-semibold text-gray-800">
                  Max Temp: {temp}°C | Min Temp: {daily.temperature_2m_min[index]}°C
                </p>
                <p className="text-gray-600">
                  Weather Code: {daily.weather_code[index]}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WeatherPage;





// "use client"

// export default function Home() {
//   return (
//     <div>

// <h2> Hello </h2>

//     </div>
//   );
// }
