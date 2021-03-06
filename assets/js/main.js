let city = "";
let apiKey = "345dea590c25774e262329034275a689";
let searchCity = $("#search-city");
let searchButton = $("#search-button");
let currentCity = $("#current-city");
let currentTemperature = $("#temperature");
let currentHumidity = $("#humidity");
let currentWSpeed = $("#wind-speed");
let currentUvIndex = $("#uv-index");
let cities = [];

function find(cityList) {
    for (let i = 0; i < cities.length; i++) {
        if (cityList.toLowerCase() === cities[i]) {
            return -1;
        }
    }
    return 1;
}

function displayWeather(event) {
    event.preventDefault();
    if (searchCity.val().trim() !== "") {
        city = searchCity.val().trim();
        getWeather(city);
    }
}

function getWeather(city) {
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey;
    fetch(queryURL)
        .then(data => data.json())
        .then(response => {
            let weatherIcon = response.weather[0].icon;
            let iconUrl = "https://openweathermap.org/img/wn/" + weatherIcon + "@2x.png";
            let date = new Date(response.dt * 1000).toLocaleDateString();
            $(currentCity).html(response.name + "(" + date + ")" + "<img src=" + iconUrl + ">");

            let tempF = (response.main.temp - 273.15) * 1.80 + 32;
            $(currentTemperature).html((tempF).toFixed(2) + "&#8457");
            $(currentHumidity).html(response.main.humidity + "%");
            let windSpeed = response.wind.speed;
            let windsMPH = (windSpeed * 2.237).toFixed(1);
            $(currentWSpeed).html(windsMPH + "MPH");
            UVIndex(response.coord.lon, response.coord.lat);
            forecast(response.id);
            if (response.cod == 200) {
                cities = JSON.parse(localStorage.getItem("cityName"));
                if (cities == null) {
                    cities = [];
                    cities.push(city.toLowerCase()
                    );
                    localStorage.setItem("cityName", JSON.stringify(cities));
                    addToList(city);
                }
                else {
                    if (find(city) > 0) {
                        cities.push(city.toLowerCase());
                        localStorage.setItem("cityName", JSON.stringify(cities));
                        addToList(city);
                    }
                }
            }
        });
}

function UVIndex(ln, lt) {
    let uvqURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lt + "&lon=" + ln + "&exclude=hourly&appid=" + apiKey
    fetch(uvqURL)
        .then(data => data.json())
        .then(response => {
            $(currentUvIndex).html(response.daily[0].uvi);
            $("#one").html(response.daily[1].uvi);
            $("#two").html(response.daily[2].uvi);
            $("#three").html(response.daily[3].uvi);
            $("#four").html(response.daily[4].uvi);
            $("#five").html(response.daily[5].uvi);
        });
}

function forecast(cityId) {
    let queryForecastURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityId + "&appid=" + apiKey;
    fetch(queryForecastURL)
        .then(data => data.json())
        .then(response => {
            for (i = 0; i < 5; i++) {
                let date = new Date((response.list[((i + 1) * 8) - 1].dt) * 1000).toLocaleDateString();
                let iconCode = response.list[((i + 1) * 8) - 1].weather[0].icon;
                let iconUrl = "https://openweathermap.org/img/wn/" + iconCode + ".png";
                let tempK = response.list[((i + 1) * 8) - 1].main.temp;
                let tempF = (((tempK - 273.5) * 1.80) + 32).toFixed(2);
                let humidity = response.list[((i + 1) * 8) - 1].main.humidity;

                $("#fDate" + i).html(date);
                $("#fImg" + i).html("<img src=" + iconUrl + ">");
                $("#fTemp" + i).html(tempF + " " + "&#8457");
                $("#fHumidity" + i).html(humidity + "%");
            }
        });
}

function addToList(cityList) {
    let listEl = $("<li>" + cityList.toLowerCase() + "</li>");
    $(listEl).attr("class", "list-group-item");
    $(listEl).attr("data-value", cityList.toLowerCase());
    $(".list-group").append(listEl);
}

function invokePastSearch(event) {
    let liEl = event.target;
    if (event.target.matches("li")) {
        city = liEl.textContent.trim();
        getWeather(city);
    }

}

function loadLastCity() {
    $("ul").empty();
    let cities = JSON.parse(localStorage.getItem("cityName"));
    if (cities !== null) {
        cities = JSON.parse(localStorage.getItem("cityName"));
        for (i = 0; i < cities.length; i++) {
            addToList(cities[i]);
        }
        city = cities[i - 1];
        getWeather(city);
    }

}

$("#search-button").on("click", displayWeather);
$(document).on("click", invokePastSearch);
$(window).on("load", loadLastCity);