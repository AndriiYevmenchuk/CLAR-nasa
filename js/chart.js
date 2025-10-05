// Global chart instances to allow cleanup
let tempChartInstance = null;
let precipChartInstance = null;
let windChartInstance = null;

function aggregateMonthly(weatherData) {
    const monthly = {};

    weatherData.time.forEach((label, index) => {
        const [monthStr, yearStr] = label.split(' ');
        const date = new Date(`${monthStr} 1, ${yearStr}`);
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`; // e.g., "2015-1"

        if (!monthly[key]) {
            monthly[key] = {
                temperatureSum: 0, temperatureCount: 0,
                precipitationSum: 0,
                windMax: 0
            };
        }

        const temp = weatherData.temperature[index];
        const precip = weatherData.precipitation[index];
        const wind = weatherData.windspeed[index];

        monthly[key].temperatureSum += temp;
        monthly[key].temperatureCount += 1;
        monthly[key].precipitationSum += precip;
        monthly[key].windMax = Math.max(monthly[key].windMax, wind);
    });

    const labels = [];
    const temperature = [];
    const precipitation = [];
    const windspeed = [];

    Object.keys(monthly).sort().forEach(key => {
        const m = monthly[key];
        const [year, month] = key.split('-');
        labels.push(new Date(year, month - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }));
        temperature.push(m.temperatureSum / m.temperatureCount); // monthly mean
        precipitation.push(m.precipitationSum); // monthly total
        windspeed.push(m.windMax); // monthly max
    });

    return { labels, temperature, precipitation, windspeed };
}


async function loadWeatherData(lat, lon) {
    console.log("Loading weather data for:", lat, lon);

    const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        start_date: "2015-01-01",  // Changed: 10 years of data
        end_date: "2024-12-31",    // Changed: up to end of 2024
        daily: "temperature_2m_mean,precipitation_sum,windspeed_10m_max"  // Changed: daily instead of hourly
    });

    const url = `https://archive-api.open-meteo.com/v1/archive?${params}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (!data.daily || !data.daily.time) {  // Changed: daily instead of hourly
            throw new Error("Invalid data structure received from API");
        }

        const weatherData = {
            time: data.daily.time.map(t => {  // Changed: daily
                const date = new Date(t);
                return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            }),
            temperature: data.daily.temperature_2m_mean,  // Changed: daily mean
            precipitation: data.daily.precipitation_sum,   // Changed: daily sum
            windspeed: data.daily.windspeed_10m_max       // Changed: daily max
        };

        console.log("Weather data loaded successfully:", weatherData);
        const monthlyData = aggregateMonthly(weatherData);
        renderWeatherCharts({
            time: monthlyData.labels,
            temperature: monthlyData.temperature,
            precipitation: monthlyData.precipitation,
            windspeed: monthlyData.windspeed
        });
        return monthlyData;
    } catch (error) {
        console.error("Error fetching weather data:", error);
        showChartError("Failed to load weather data: " + error.message);
        return null;
    }
}

function renderWeatherCharts(weatherData) {
    if (!weatherData || !weatherData.time || !weatherData.time.length) {
        console.error("Invalid weatherData provided to renderWeatherCharts");
        showChartError("No data available");
        return;
    }

    // Destroy existing charts if they exist
    if (tempChartInstance) {
        tempChartInstance.destroy();
        tempChartInstance = null;
    }
    if (precipChartInstance) {
        precipChartInstance.destroy();
        precipChartInstance = null;
    }
    if (windChartInstance) {
        windChartInstance.destroy();
        windChartInstance = null;
    }

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
                        text: 'Average Temperature (2015-2024)'  // Updated title
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            maxTicksLimit: 15  // Show more ticks for longer time period
                        }
                    }
                }
            }
        });
        console.log("Temperature chart created");
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
                        text: 'Daily Precipitation (2015-2024)'  // Updated title
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            maxTicksLimit: 15
                        }
                    }
                }
            }
        });
        console.log("Precipitation chart created");
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
                        text: 'Maximum Wind Speed (2015-2024)'  // Updated title
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            maxTicksLimit: 15
                        }
                    }
                }
            }
        });
        console.log("Wind speed chart created");
    }
}

// Make functions globally accessible
window.loadWeatherData = loadWeatherData;
window.renderWeatherCharts = renderWeatherCharts;
// Legacy alias for compatibility
window.renderCharts = renderWeatherCharts;