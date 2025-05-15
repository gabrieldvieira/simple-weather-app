// script.js

const apiKey = 'YOURAPIKEYHERE'; // Replace with your valid OpenWeatherMap API key
const citySearchInput = document.getElementById('city-search');
const autocompleteList = document.getElementById('autocomplete-list');
const weatherInfo = document.getElementById('weather-info');
const cityNameElem = document.getElementById('city-name');
const currentTempElem = document.getElementById('current-temp');
const weatherDescriptionElem = document.getElementById('weather-description');
const forecastElem = document.getElementById('forecast');

// Event listener for search input
citySearchInput.addEventListener('input', async (e) => {
    try {
        const query = e.target.value.trim();

        if (query.length >= 3) {
            const cities = await fetchCities(query);
            showAutocomplete(cities);
        } else {
            autocompleteList.style.display = 'none';
        }
    } catch (error) {
        console.error('Search error:', error);
        alert(`Search failed: ${error.message}`);
    }
});

// Fetch cities using Geocoding API
async function fetchCities(query) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Geocoding API response:', data);
        return data;
    } catch (error) {
        console.error('Error fetching cities:', error);
        return [];
    }
}

// Show city suggestions with proper scoping
function showAutocomplete(cities) {
    autocompleteList.innerHTML = '';

    if (!cities || cities.length === 0) {
        autocompleteList.style.display = 'none';
        return;
    }

    cities.forEach(city => {
        const listItem = document.createElement('li');
        listItem.classList.add('autocomplete-item');
        listItem.innerHTML = `
            <span>${city.name}, ${city.country}</span>
            <small>Lat: ${city.lat.toFixed(2)}, Lon: ${city.lon.toFixed(2)}</small>
        `;

        // Event listener inside the loop
        listItem.addEventListener('click', () => {
            citySearchInput.value = `${city.name}, ${city.country}`;
            autocompleteList.style.display = 'none';
            getWeather(city.lat, city.lon, city.name, city.country);
        });

        autocompleteList.appendChild(listItem);
    });

    autocompleteList.style.display = 'block';
}

// Get weather data using One Call API 3.0
async function getWeather(lat, lon, cityName, country) {
    try {
        const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&exclude=minutely,hourly`;
        console.log('Fetching weather from:', url);

        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Weather API error');
        }

        const weatherData = await response.json();
        console.log('Weather data:', weatherData);
        displayWeather(weatherData, cityName, country);
    } catch (error) {
        console.error('Weather fetch error:', error);
        alert(`Weather Error: ${error.message}`);
    }
}

// Display weather information
function displayWeather(weatherData, cityName, country) {
    cityNameElem.textContent = `${cityName}, ${country}`;
    currentTempElem.textContent = `Current Temp: ${weatherData.current.temp}°C`;
    weatherDescriptionElem.textContent = weatherData.current.weather[0].description;

    // Display 7-day forecast
    forecastElem.innerHTML = '';
    weatherData.daily.slice(1, 8).forEach(day => {
        const dayElem = document.createElement('div');
        dayElem.classList.add('day');
        dayElem.innerHTML = `
            <h3>${new Date(day.dt * 1000).toLocaleDateString()}</h3>
            <p>${day.temp.day}°C</p>
            <p>${day.weather[0].description}</p>
        `;
        forecastElem.appendChild(dayElem);
    });

    weatherInfo.style.display = 'block';
}
