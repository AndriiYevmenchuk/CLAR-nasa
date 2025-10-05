// Global chart instances to allow cleanup
let tempChartInstance = null;
let precipChartInstance = null;
let windChartInstance = null;

async function loadWeatherData(lat, lon) {
    const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        start_date: "2020-01-01",
        end_date: "2020-01-07",
        hourly: "temperature_2m,precipitation,windspeed_10m"
    });

    const url = `https://archive-api.open-meteo.com/v1/archive?${params}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const weatherData = {
            time: data.hourly.time.map(t => {
                const date = new Date(t);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
            }),
            temperature: data.hourly.temperature_2m,
            precipitation: data.hourly.precipitation,
            windspeed: data.hourly.windspeed_10m
        };

        console.log("Weather data loaded successfully");
        renderWeatherCharts(weatherData);
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

function renderWeatherCharts(weatherData) {
    // Destroy existing charts if they exist
    if (tempChartInstance) tempChartInstance.destroy();
    if (precipChartInstance) precipChartInstance.destroy();
    if (windChartInstance) windChartInstance.destroy();

    // Temperature Chart
    const tempCtx = document.getElementById("tempChart");
    if (tempCtx) {
        tempChartInstance = new Chart(tempCtx, {
            type: "line",
            data: {
                labels: weatherData.time,
                datasets: [{
                    label: "Temperature (°C)",
                    data: weatherData.temperature,
                    borderColor: "rgb(255, 99, 132)",
                    backgroundColor: "rgba(255, 99, 132, 0.1)",
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Temperature (Jan 2020)'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            maxTicksLimit: 10
                        }
                    }
                }
            }
        });
    }

    // Precipitation Chart
    const precipCtx = document.getElementById("precipChart");
    if (precipCtx) {
        precipChartInstance = new Chart(precipCtx, {
            type: "bar",
            data: {
                labels: weatherData.time,
                datasets: [{
                    label: "Precipitation (mm)",
                    data: weatherData.precipitation,
                    backgroundColor: "rgba(54, 162, 235, 0.7)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Precipitation (Jan 2020)'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            maxTicksLimit: 10
                        }
                    }
                }
            }
        });
    }

    // Wind Speed Chart
    const windCtx = document.getElementById("windChart");
    if (windCtx) {
        windChartInstance = new Chart(windCtx, {
            type: "line",
            data: {
                labels: weatherData.time,
                datasets: [{
                    label: "Wind Speed (m/s)",
                    data: weatherData.windspeed,
                    borderColor: "rgb(75, 192, 192)",
                    backgroundColor: "rgba(75, 192, 192, 0.1)",
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Wind Speed (Jan 2020)'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            maxTicksLimit: 10
                        }
                    }
                }
            }
        });
    }
}

// Make functions globally accessible
window.loadWeatherData = loadWeatherData;
window.renderWeatherCharts = renderWeatherCharts;
// Legacy alias for compatibility
window.renderCharts = renderWeatherCharts;