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
                forecastDate: '',
                temp: 0,
                humidity: 0,
                wind: 0, 
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
// Grab current date to save/check localStorage
const dateToday = "11/17/2022"; 

// Global Functions Object
const globalFunc = {
    // Any functions that need global scope will be stored in this object
    // The stateCode/countryCode use iso-3166 2 character code
    getLatLon: function(city = 0, stateCode = 0, countryCode = 'us') {
        // Use the Geocoding API to get longitude/latitude for OpenWeather API
        fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city},${stateCode},${countryCode}&limit=5&appid=${oWMApiKey}`)
        .then(response => {return response.json();})
        .then(data => {
          // Convert stateCode to full string
          let stateStr = usStates[stateCode.toUpperCase()];
          //console.log(stateStr);
          // Find the index of the correct state for the city
          let index = data.findIndex(item => {return item.state === stateStr});
          //console.log(index);
          // Store the longitude/latitude provided by Geocoding API
          let lat = data[index].lat;
          let lon = data[index].lon;
          //console.log(data);
          console.log(data[index]);
          //console.log(`lat: ${lat}, lon: ${lon}`);
          globalFunc.getWeather(lat, lon, data[index].name);
        })
        //
      },
      getWeather: function(lat, lon, city) {
        // Fetch the current weather data
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${oWMApiKey}&units=imperial`)
          .then(response => {return response.json();})
          .then(data => {
            //console.log(`lat: ${lat}, lon: ${lon}`);
            /* Check if a city name was sent as the api is not always entirely accurate
            Check Morrison, CO using geocoding api and openweather api to confirm*/
            city = (city) ? city : data.name;
            //console.log(city);
            // Grab the date and convert it to a local format
            let date = new Date(data.dt * 1000);
            date = date.toLocaleDateString("en-US");
            // Add current city weather to the forecasts obj
            forecasts[data.id] = {
              name: city,
              lat: lat,
              lon: lon,
              weatherArr: [
                {
                  forecastDate: date,
                  temp: data.main.temp,
                  humidity: data.main.humidity,
                  wind: data.wind.speed,
                  conditionIcon: data.weather[0].icon
                }
              ]
            };
            console.log(data);
            //console.log(forecasts);
      
            // Fetch the forecast weather data
            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${oWMApiKey}&units=imperial`)
            .then(response => {return response.json();})
            .then(data => {
              console.log(data);
              // Pull data from response for city forecast obj
              for (let i = 0; i < data.list.length; i++) {
                // Convert the date in api response from unix
                let dateTime = new Date(data.list[i].dt * 1000);
                //console.log(dateTime);
                // Convert dateTime to needed values
                let date = dateTime.toLocaleDateString("en-US");
                let time = dateTime.toTimeString("it-IT");
                time = time.slice(0, 2);
                time = Number(time);
                //console.log('time: ' + time);
                //console.log(typeof(time));
                // Look for a time within the array for middle of the day
                const timeArr = [11, 12, 13];
                //console.log("loop: " + i);
                if (timeArr.includes(time) && date != dateToday) {
                  //console.log("if test success");
                  // Add another days forecast to the weather array
                  forecasts[data.city.id].weatherArr.push(
                    {
                      forecastDate: date,
                      temp: data.list[i].main.temp,
                      humidity: data.list[i].main.humidity,
                      wind: data.list[i].wind.speed,
                      conditionIcon: data.list[i].weather[0].icon
                    }
                  );
                }
              }
              console.log(forecasts);
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
        forecasts = JSON.parse(localStorage.getItem('savedCityWeather'));
    }
};


//globalFunc.checkExistingForecasts();
//console.log(forecasts);
globalFunc.getLatLon('morrison', 'co', 'us');
