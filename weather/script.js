const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loader = document.getElementById('loader');
const errorContainer = document.getElementById('errorContainer');
const errorMessage = document.getElementById('errorMessage');
const weatherData = document.getElementById('weatherData');
const currentWeatherContainer = document.getElementById('currentWeather');
const forecastContainer = document.getElementById('forecastContainer');

const apiKey = 'e51e66c396ca4552be1191749252408';
const apiBaseUrl = 'https://api.weatherapi.com/v1/forecast.json';

searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

function handleSearch() {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
    } else {
        showError('Please enter a city name.');
    }
}

async function fetchWeather(city) {
    loader.classList.remove('hidden');
    weatherData.classList.add('hidden');
    errorContainer.classList.add('hidden');

    const apiUrl = `${apiBaseUrl}?key=${apiKey}&q=${city}&days=3&aqi=yes&alerts=no`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message || `HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError(error.message);
    } finally {
        loader.classList.add('hidden');
    }
}

function displayWeather(data) {
    currentWeatherContainer.innerHTML = '';
    forecastContainer.innerHTML = '';

    displayCurrentWeather(data.location, data.current);
    
    data.forecast.forecastday.forEach(day => {
        displayForecastDay(day);
    });

    weatherData.classList.remove('hidden');
}

function displayCurrentWeather(location, current) {
    const { name, region, country } = location;
    const { temp_c, condition, wind_kph, humidity, feelslike_c } = current;

    const currentHtml = `
        <div class="flex flex-col md:flex-row items-center justify-between">
            <div class="text-center md:text-left mb-4 md:mb-0">
                <h2 class="text-3xl font-bold">${name}</h2>
                <p class="text-gray-400">${region}, ${country}</p>
                <p class="text-5xl font-bold mt-2">${Math.round(temp_c)}°C</p>
                <p class="text-lg text-cyan-300 capitalize">${condition.text}</p>
            </div>
            <div class="flex items-center mb-4 md:mb-0">
                 <img src="https:${condition.icon}" alt="${condition.text}" class="w-24 h-24">
            </div>
            <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-left">
                <p><i class="fas fa-temperature-half mr-2 text-cyan-400"></i> Feels like: <strong>${Math.round(feelslike_c)}°C</strong></p>
                <p><i class="fas fa-wind mr-2 text-cyan-400"></i> Wind: <strong>${wind_kph} kph</strong></p>
                <p><i class="fas fa-tint mr-2 text-cyan-400"></i> Humidity: <strong>${humidity}%</strong></p>
            </div>
        </div>
    `;
    currentWeatherContainer.innerHTML = currentHtml;
}

function displayForecastDay(dayData) {
    const { date, day } = dayData;
    const { maxtemp_c, mintemp_c, condition } = day;

    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    });

    const forecastCard = document.createElement('div');
    forecastCard.className = 'bg-gray-700/80 p-4 rounded-lg text-center flex flex-col items-center justify-between fade-in';
    forecastCard.innerHTML = `
        <p class="font-semibold">${formattedDate}</p>
        <img src="https:${condition.icon}" alt="${condition.text}" class="w-16 h-16 my-2">
        <p class="capitalize text-sm text-gray-300">${condition.text}</p>
        <div class="mt-2">
            <span class="font-bold text-lg">${Math.round(maxtemp_c)}°</span>
            <span class="text-gray-400"> / ${Math.round(mintemp_c)}°</span>
        </div>
    `;
    forecastContainer.appendChild(forecastCard);
}

function showError(message) {
    errorMessage.textContent = message;
    errorContainer.classList.remove('hidden');
    weatherData.classList.add('hidden');
}

window.onload = () => {
    fetchWeather('London');
};
