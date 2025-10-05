async function loadWeatherData(lat, lon) {
    const params = {
        latitude: lat,
        longitude: lon,
        start_date: "2020-01-01",
        end_date: "2020-01-07",
        hourly: ["temperature_2m", "precipitation", "windspeed_10m"],
    };

    const url = "https://archive-api.open-meteo.com/v1/archive";
    const responses = await window.fetchWeatherApi(url, params);
    const response = responses[0];

    const utcOffsetSeconds = response.utcOffsetSeconds();
    const hourly = response.hourly();

    const time = [...Array((Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval())].map(
        (_, i) => new Date((Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) * 1000)
    );

    const weatherData = {
        time,
        temperature: hourly.variables(0).valuesArray(),
        precipitation: hourly.variables(1).valuesArray(),
        windspeed: hourly.variables(2).valuesArray()
    };

    renderWeatherCharts(weatherData);
}


function renderWeatherCharts(data) {
    // Temperature chart
    new Chart(document.getElementById("tempChart").getContext("2d"), {
        type: "line",
        data: {
            labels: data.time,
            datasets: [{
                label: "Temperature (°C)",
                data: data.temperature,
                borderColor: "red",
                backgroundColor: "rgba(255,0,0,0.1)",
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { type: "time", time: { unit: "day" } },
                y: { title: { display: true, text: "°C" } }
            }
        }
    });

    // Precipitation chart
    new Chart(document.getElementById("precipChart").getContext("2d"), {
        type: "bar",
        data: {
            labels: data.time,
            datasets: [{
                label: "Precipitation (mm)",
                data: data.precipitation,
                backgroundColor: "rgba(0,0,255,0.5)"
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { type: "time", time: { unit: "day" } },
                y: { title: { display: true, text: "mm" } }
            }
        }
    });

    // Wind speed chart
    new Chart(document.getElementById("windChart").getContext("2d"), {
        type: "line",
        data: {
            labels: data.time,
            datasets: [{
                label: "Wind Speed (m/s)",
                data: data.windspeed,
                borderColor: "green",
                backgroundColor: "rgba(0,128,0,0.1)",
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { type: "time", time: { unit: "day" } },
                y: { title: { display: true, text: "m/s" } }
            }
        }
    });
}