/*
*****User Story*****
AS A traveler
I WANT to see the weather outlook for multiple cities
SO THAT I can plan a trip accordingly

*****Acceptance Criteria*****
GIVEN a weather dashboard with form inputs
WHEN I search for a city
THEN I am presented with current and future conditions for that city and that city is added to the search history
WHEN I view current weather conditions for that cit
THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, and the wind speed
WHEN I view future weather conditions for that city
THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, the wind speed, and the humidity
WHEN I click on a city in the search history
THEN I am again presented with current and future conditions for that city
*/

// *****Global Variables*****
// OpenWeather API key
const oWMApiKey = '13cefbf544495274d042d73ae2f79b5b';
// Obj to store weather forecast by city
/* data example inside forecasts obj
    cityId: {
        name: 'City Name',
        lat: 0,
        lon: 0,
        weatherArr: [
            {
                forecastDate: '11/17/2022',
                temp: 70.46,
                humidity: 30,
                wind: 4.23, 
                conditionIcon: '01n'
            }
        ]
    }
*/
let forecasts = {};
// Used to convert state codes to names for geocoding api
const usStates = {
    AL: 'Alabama',
    AK: 'Alaska',
    AZ: 'Arizona',
    AR: 'Arkansas',
    CA: 'California',
    CO: 'Colorado',
    CT: 'Connecticut',
    DE: 'Delaware',
    FL: 'Florida',
    GA: 'Georgia',
    HI: 'Hawaii',
    ID: 'Idaho',
    IL: 'Illinois',
    IN: 'Indiana',
    IA: 'Iowa',
    KS: 'Kansas',
    KY: 'Kentucky',
    LA: 'Louisiana',
    ME: 'Maine',
    MD: 'Maryland',
    MA: 'Massachusetts',
    MI: 'Michigan',
    MN: 'Minnesota',
    MS: 'Mississippi',
    MO: 'Missouri',
    MT: 'Montana',
    NE: 'Nebraska',
    NV: 'Nevada',
    NH: 'New Hampshire',
    NJ: 'New Jersey',
    NM: 'New Mexico',
    NY: 'New York',
    NC: 'North Carolina',
    ND: 'North Dakota',
    OH: 'Ohio',
    OK: 'Oklahoma',
    OR: 'Oregon',
    PA: 'Pennsylvania',
    RI: 'Rhode Island',
    SC: 'South Carolina',
    SD: 'South Dakota',
    TN: 'Tennessee',
    TX: 'Texas',
    UT: 'Utah',
    VT: 'Vermont',
    VA: 'Virginia',
    WA: 'Washington',
    WV: 'West Virginia',
    WI: 'Wisconsin',
    WY: 'Wyoming',
    DC: 'District of Columbia',
    AS: 'American Samoa',
    GU: 'Guam',
    MP: 'Northern Mariana Islands',
    PR: 'Puerto Rico',
    UM: 'United States Minor Outlying Islands',
    VI: 'Virgin Islands, U.S.'
  };
// Grab current date
const dateToday = dayjs().format('MM/DD/YYYY');
// Used to convert weather condition codes to relative image paths and alt text
const conditions = {
    '01d': '../icons/slight_touch_happyday.png',
    '02d': '../icons/partly_cloudy.png',
    '03d': '../icons/cloudy.png',
    '04d': '../icons/',
    '09d': '../icons/raindrops.png',
    '10d': '../icons/rainy.png',
    '11d': '../icons/thnderstorm.png',
    '13d': '../icons/snowy.png',
    '50d': '../icons/',
    '01n': '../icons/slight_touch_happyday-1.png',
    '02n': '../icons/partly_cloudy-1.png',
    '03n': '../icons/cloudy-1.png',
    '04n': '../icons/',
    '09n': '../icons/raindrops-1.png',
    '10n': '../icons/rainy-1.png',
    '11n': '../icons/thnderstorm-1.png',
    '13n': '../icons/snowy-1.png',
    '50n': '../icons/',
    '01': 'clear skies',
    '02': 'few clouds',
    '03': 'scattered clouds',
    '04': 'broken clouds',
    '09': 'rain drizzle',
    '10': 'rain',
    '11': 'thunderstorms',
    '13': 'snow',
    '50': 'foggy'
}
// DOM variables
const cityList = document.getElementById("searchHistory");
const futureForecasts = document.getElementById("sectionForecast");

// Global Scope Functions Object
const globalFunc = {
    // Any functions that need global scope will be stored in this object
    getLatLon: function(city = 0, stateCode = 0, countryCode = 'us') {
        // The stateCode/countryCode use iso-3166 2 character code
        // Use the Geocoding API to get longitude/latitude for OpenWeather API
        fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city},${stateCode},${countryCode}&limit=5&appid=${oWMApiKey}`)
        .then(response => {return response.json();})
        .then(data => {
          // Convert stateCode to full string
          let stateStr = usStates[stateCode.toUpperCase()];
          // Find the index of the correct state for the city
          let index = data.findIndex(item => {return item.state === stateStr});
          // Confirm the user city/state was found
          if (index < 0) {
            // TO DO - Change the below console.log to a modal to alert user
            console.log('ERROR! City not found in that state.');
          } else {
            // Store the longitude/latitude provided by Geocoding API
            let lat = data[index].lat;
            let lon = data[index].lon;

            // Get the forecast data
            globalFunc.getWeather(lat, lon, data[index].name);
          }  
        })
        //
    },
    getWeather: function(lat, lon, city) {
        // Fetch the current weather data
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${oWMApiKey}&units=imperial`)
          .then(response => {return response.json();})
          .then(data => {
            // Local function to only store weather forecasts
            const storeForecast = (forecastDate, temp, hum, wind, cond) => {
                // Add current weather forecast
                forecasts[data.id].weatherArr.push({
                    forecastDate: forecastDate,
                    temp: temp,
                    humidity: hum,
                    wind: wind,
                    conditionIcon: cond
                    }
                );
            };

            // Check if this is from existing data
            if (data.id in forecasts) {
                storeForecast(dateToday, data.main.temp, data.main.humidity, data.wind.speed, data.weather[0].icon);
            } else {
                /* Check if a city name was sent as the api is not always entirely accurate
                Check Morrison, CO using geocoding api and openweather api to confirm*/
                city = (city) ? city : data.name;
                // Add current city weather to the forecasts obj
                forecasts[data.id] = {
                    name: city,
                    lat: lat,
                    lon: lon,
                    weatherArr: []
                };
                storeForecast(dateToday, data.main.temp, data.main.humidity, data.wind.speed, data.weather[0].icon);
            }
      
            // Fetch the forecast weather data
            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${oWMApiKey}&units=imperial`)
            .then(response => {return response.json();})
            .then(data => {
              console.log(data);
              // Pull data from response for city forecast obj
              for (let i = 0; i < data.list.length; i++) {
                // Convert the date in api response from unix
                let dateTime = new Date(data.list[i].dt * 1000);
                // Convert dateTime to needed values
                let date = dateTime.toLocaleDateString("en-US");
                let time = dateTime.toTimeString("it-IT");
                time = time.slice(0, 2);
                time = Number(time);
                // Look for a time within the array for middle of the day
                const timeArr = [11, 12, 13];
                if (timeArr.includes(time) && date != dateToday) {
                    //console.log("if test success");
                    // Add another days forecast to the weather array
                    storeForecast(date, data.list[i].main.temp, data.list[i].main.humidity, data.list[i].wind.speed, data.list[i].weather[0].icon);
                }
              }
              // Save the forecast to the localStorage
              this.saveForecast();
            })
            //
          })
        //
    }, 
    saveForecast: function() {
        // Save retrieved weather forecasts to localStorage for retrieval later that day
        localStorage.setItem('savedCityWeather', JSON.stringify(forecasts));
    }, 
    checkExistingForecasts: function() {
        // retrieve existing forecasts from localStorage
        if (localStorage['savedCityWeather']) {
            forecasts = JSON.parse(localStorage.getItem('savedCityWeather'));
            // Check if existing forecasts are still relevant
            for (const key in forecasts) {
                // If obj still has forecast for today, use existing data
                if (forecasts[key].weatherArr[0].forecastDate === dateToday) {
                    // TO DO - Add html weather forecasts for first city in forecasts
                } else {
                    // Remove old forecast data
                    forecasts[key].weatherArr = []
                    // Get new forecast data
                    this.getWeather(forecasts[key].lat, forecasts[key].lon, forecasts[key].name);
                }
                // Generate html city cards
                this.htmlAddCity(forecasts[key], key);
            }
        }
    },
    removeSavedCity: function(id) {
        // Remove a saved city based on obj key of city
        delete forecasts[id];
        // Save new forecasts obj to localStorage
        this.saveForecast();
    },
    htmlAddCity: function(cityObj, cityId) {
        // Function local variables
        const conditionCode = cityObj.weatherArr[0].conditionIcon;
        const weatherIcon = conditions[conditionCode];
        const weatherAltText = conditions[conditionCode[0] + conditionCode[1]];
        console.log(weatherAltText);

        // Create html elements
        const cityCard = document.createElement("article");
        const cityName = document.createElement("div");
        const h2 = document.createElement("h2");
        const date = document.createElement("span");
        const conditionContainer = document.createElement("div");
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        const figcaption = document.createElement("figcaption");
        const weather = document.createElement("div");
        const tempDiv = document.createElement("div");
        const tempH3 = document.createElement("h3");
        const tempSpan = document.createElement("span");
        const windDiv = document.createElement("div");
        const windH3 = document.createElement("h3");
        const windSpan = document.createElement("span");
        const humidityDiv = document.createElement("div");        
        const humidityH3 = document.createElement("h3");
        const humiditySpan = document.createElement("span");

        // Add attributes to html elements
        cityCard.classList.add("city-card");
        cityCard.setAttribute("data-id", cityId);
        cityName.classList.add("city-name");
        date.classList.add("current-date");
        conditionContainer.classList.add("container-weather-condition");
        img.setAttribute("src", weatherIcon);
        img.setAttribute("alt", weatherAltText);
        weather.classList.add("container-weather");
        tempSpan.classList.add("temperature");
        tempH3.classList.add("weather-info");
        windSpan.classList.add("wind");
        windH3.classList.add("weather-info");
        humiditySpan.classList.add("humidity");
        humidityH3.classList.add("weather-info");

        // Add text for user to see in created elements
        h2.textContent = cityObj.name;
        date.textContent = dateToday;
        figcaption.textContent = weatherAltText;
        tempSpan.textContent = cityObj.weatherArr[0].temp + ' \u00B0' + 'F';
        tempH3.textContent - 'TEMP';
        windSpan.textContent = cityObj.weatherArr[0].wind + ' MPH';
        windH3.textContent - 'WIND';
        humiditySpan.textContent = cityObj.weatherArr[0].humidity + '%';
        humidityH3.textContent - 'HUMIDITY';

        // Append elements together to create html city card
        cityName.appendChild(h2);
        cityName.appendChild(date);
        figure.appendChild(img);
        figure.appendChild(figcaption);
        conditionContainer.appendChild(figure);
        tempDiv.appendChild(tempSpan);
        tempDiv.appendChild(tempH3);
        windDiv.appendChild(windSpan);
        windDiv.appendChild(windH3);
        humidityDiv.appendChild(humiditySpan);
        humidityDiv.appendChild(humidityH3);
        weather.appendChild(tempDiv);
        weather.appendChild(windDiv);
        weather.appendChild(humidityDiv);
        cityCard.appendChild(cityName);
        cityCard.appendChild(conditionContainer);
        cityCard.appendChild(weather);
        // Add city card to html
        cityList.appendChild(cityCard);

        // TO DO - Add sorting alphabetically or by add date
        // TO DO - Change weather in CSS class 'container-weather' to a function
    }
};

globalFunc.checkExistingForecasts();

//globalFunc.getLatLon('longmont', 'co', 'us');
