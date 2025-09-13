const cityName = document.getElementById("city-name")
const searchbtn = document.getElementById("searchbtn")

const countryText = document.querySelector(".country-text")
const tempText = document.querySelector(".temp-text")
const conditionTxt = document.querySelector(".condition-txt")
const humidityValueTxt = document.querySelector(".humidity-value-txt")
const windValueText = document.querySelector(".wind-value-text")
const weatherSummaryImg = document.querySelector(".weather-summary-img")
const currentDateTxt = document.querySelector(".current-date-txt")
const weatherInfo = document.getElementById('weatherInfo')

const forcastItemContainer = document.getElementById('forcastItemContainer')
const notfound = document.getElementById('not-found')
const unitToggleBtn = document.getElementById("unitToggleBtn");
const container = document.getElementById('container');
const search = document.getElementById('search')
const unit = document.getElementById("unit")
const location = document.getElementById("location")


const apikey = 'f873aebe5eefd5b23ea6fcb3a1dfc0ef'

document.addEventListener('DOMContentLoaded', () => {
    search.style.display = 'block';
    weatherInfo.style.display = 'none';
    forcastItemContainer.style.display = 'none';
    notfound.style.display = 'none';
    unitToggleBtn.textContent = "°F";
    unitToggleBtn.style.display = 'none';
    unit.style.display = 'none';

});

searchbtn.addEventListener('click', () => {
    if (cityName.value.trim() != '') {
        updateWeatherInfo(cityName.value)
        cityName.value = ''
        cityName.blur()
    }
})
cityName.addEventListener('keydown', (event) => {
    if (event.key == 'Enter' &&
        cityName.value.trim() != ''
    ) {
        updateWeatherInfo(cityName.value)
        cityName.value = ''
        cityName.blur()
    }
})
let currentUnit = "metric";
function toggleUnit() {
    currentUnit = currentUnit === "metric" ? "imperial" : "metric";
}

unitToggleBtn.addEventListener("click", () => {
    toggleUnit();
    unitToggleBtn.textContent = currentUnit === "metric" ? "°F" : "°C";
    if (countryText.textContent) {
        updateWeatherInfo(countryText.textContent);
    }
});

async function getFetchData(endPoint, city, unit = "metric") {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apikey}&units=${unit}`
    const response = await fetch(apiUrl)
    console.log("respone", response)
    return response.json()
}

function getWeatherIcon(id) {
    if (id <= 232) return 'thunderstorm.svg'
    if (id <= 321) return 'drizzle.svg'
    if (id <= 531) return 'rain.svg'
    if (id <= 622) return 'snow.svg'
    if (id <= 781) return 'atmosphere.svg'
    if (id <= 800) return 'clear.svg'
    else return 'clouds.svg'
}

function getCurrentDate() {
    const currentDate = new Date()
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    }
    return currentDate.toLocaleDateString('en-GB', options)
}

async function updateWeatherInfo(city) {
    const weatherData = await getFetchData('weather', city, currentUnit)

    if (weatherData.cod != 200) {
        notfound.style.display = "block"
        weatherInfo.style.display = "none";
        forcastItemContainer.style.display = "none";
        search.style.display = 'none';
        unitToggleBtn.style.display = 'none';
        unit.style.display = 'none';
        return
    }

    notfound.style.display = "none";
    weatherInfo.style.display = "block";
    forcastItemContainer.style.display = "grid";
    search.style.display = "none";
    console.log("weatherData", weatherData)
    unit.style.display = "flex";
    unitToggleBtn.style.display = "inline-block";


    const {
        name: country,
        main: { temp, humidity },
        weather: [{ id, main }],
        wind: { speed }
    } = weatherData

    const weatherCondition = weatherData.weather[0].main;
    // const weatherCondition = "Rain";
    if (weatherCondition.toLowerCase() === "rain") {
        createRainEffect();
    }

    countryText.textContent = country
    const roundedTemp = Math.round(temp);
    tempText.textContent = `${roundedTemp}° ${currentUnit === "metric" ? "C" : "F"}`;

    // wind
    const windConverted =
        currentUnit === "metric"
            ? `${Math.round(speed * 3.6)} km/h`
            : `${Math.round(speed)} mph`; l


    conditionTxt.textContent = main
    humidityValueTxt.textContent = humidity + '%'
    windValueText.textContent = windConverted
    currentDateTxt.textContent = getCurrentDate()
    weatherSummaryImg.src = `./images/weather/${getWeatherIcon(id)}`

    await updateForecastsInfo(city)
}
function createRainEffect() {
    for (let i = 0; i < 50; i++) {
        const drop = document.createElement('div');
        drop.classList.add('weather-rainy');
        drop.style.left = Math.random() * window.innerWidth + 'px';
        drop.style.animationDuration = (Math.random() * 1 + 0.5) + 's';
        document.body.appendChild(drop);
    }
}


async function updateForecastsInfo(city) {
    const forecastData = await getFetchData('forecast', city)
    const timeTaken = '12:00:00'
    const todayDate = new Date().toISOString().split('T')[0]

    forcastItemContainer.innerHTML = ''

    forecastData.list.forEach(forecastWeather => {
        if (forecastWeather.dt_txt.includes(timeTaken) && !forecastWeather.dt_txt.includes(todayDate)) {
            updateForecastsItems(forecastWeather)
        }

    });
}
function updateForecastsItems(weatherData) {
    console.log(weatherData)
    const {
        dt_txt: date,
        weather: [{ id }],
        main: { temp }
    } = weatherData
    const dateTaken = new Date(date)
    const dateoption = {
        day: '2-digit',
        month: 'short'
    }
    const dateResult = dateTaken.toLocaleDateString(`en-Us`, dateoption)

    const roundedTemp = Math.round(temp);

    const forecastItem = `
        <div id="forecastItem"
                    class="border-1 bg-blue-300 border-secondary rounded-md p-2 flex flex-col items-center">
                    <p class="text-white">${dateResult}</p>
                    <img src="./images/weather/${getWeatherIcon(id)}">
                     <p class="text-2xl text-white">${roundedTemp}° ${currentUnit === "metric" ? "C" : "F"}</p>
                </div>
    `

    forcastItemContainer.insertAdjacentHTML('beforeend', forecastItem)
}

