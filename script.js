const btn = document.querySelector("#location");
btn.addEventListener("click", getMyWeather);

const submit = document.querySelector("#submit");
const form = document.querySelector("#addressForm");

form.addEventListener("submit", getAddressWeather);

const iconMap = {
  "clear-day": "🌞", // or use a CSS class or image path
  "clear-night": "🌙",
  "partly-cloudy-day": "⛅",
  "partly-cloudy-night": "🌥",
  cloudy: "☁️",
  rain: "🌧️",
  snow: "❄️",
  sleet: "🌨️",
  wind: "💨",
  fog: "🌫️",
  thunderstorm: "⛈️",
  hail: "🌩️",
};

function getUrl(address, latitude, longitude) {
  if (address !== null && address.trim().length !== 0) {
    return `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${address}?unitGroup=metric&key=YG7BB2JSBK836A6YLKRWU763T&contentType=json`;
  } else if (latitude !== undefined && longitude !== undefined) {
    return `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${latitude},${longitude}?unitGroup=metric&key=YG7BB2JSBK836A6YLKRWU763T&contentType=json`;
  }

  return null;
}

function getAddressWeather(event) {
  event.preventDefault();
  const address = document.querySelector("#address");
  const url = getUrl(address.value, null, null);
  if (url !== null) {
    getWeatherDataAsync(url);
  }

  address.value = "";
}

function getMyWeather() {
  if (!navigator.geolocation) {
    console.log("geolocation is not supported by your browser");
  } else {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
        const url = getUrl(null, latitude, longitude);
        if (url !== null) {
          getWeatherDataAsync(url);
        }
      },
      () => {
        console.log("error happened");
      }
    );
  }
}

async function getWeatherDataAsync(url) {
  const loadingImg = document.querySelector("#loadImg");
  loadingImg.classList.add("show");

  const response = await fetch(url, {
    mode: "cors",
  });

  if (!response.ok) {
    console.log("response not ok");
    alert("not valid address");
    loadingImg.classList.remove("show");
  }

  const weather = await response.json();
  loadingImg.classList.remove("show");

  console.log(weather);
  console.log(weather.currentConditions.temp);
  console.log(weather.currentConditions.icon);

  insertData("#date", getCurrentDatetime(weather));
  insertData("#resolvedAddress", weather.resolvedAddress);
  insertData(
    "#conditions",
    weather.currentConditions.conditions +
      " " +
      iconMap[weather.currentConditions.icon]
  );
  insertData("#temp", weather.currentConditions.temp);
  insertData("#feelsLike", weather.currentConditions.feelslike);
  insertData("#humidity", weather.currentConditions.humidity);
  insertData("#sunrise", weather.currentConditions.sunrise);
  insertData("#sunset", weather.currentConditions.sunset);
  insertData("#windSpeed", weather.currentConditions.windspeed);
  insertData("#latitude", weather.latitude);
  insertData("#longitude", weather.longitude);
  insertData("#timezone", weather.timezone);
  insertData("#offset", weather.tzoffset);
  insertData("#description", weather.description);

  insertGiphy(weather.currentConditions.icon);
}

function insertData(id, data) {
  const dataId = id + "El";
  const dataEl = document.querySelector(dataId);
  dataEl.textContent = data;

  const tag = document.querySelector(id);
  tag.after(dataEl);
}

function getCurrentDatetime(weather) {
  const date = new Date(weather.currentConditions.datetimeEpoch * 1000);

  // Format the date to the specified time zone
  const localTime = new Intl.DateTimeFormat("en-AU", {
    timeZone: weather.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);

  return localTime;
}

async function insertGiphy(text) {
  if (!text) {
    return;
  }

  const key = "g1l0d0WVaR6XcOWLGvaq0em0w1B7BG2a";
  const response = await fetch(
    `https://api.giphy.com/v1/gifs/translate?api_key=${key}&s=${text}`,
    { mode: "cors" }
  );
  const data = await response.json();

  const img = document.querySelector("#weatherGiphy");
  img.src = data.data.images.original.url;
}
