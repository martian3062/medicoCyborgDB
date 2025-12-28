export async function getIMDWeather(imdId) {
  const url = `https://mausam.imd.gov.in/api/weather/${imdId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("IMD API error");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("IMD fetch error:", error);
    return null;
  }
}

export async function getAIClimateForecast(location, weatherData) {
  try {
    const response = await fetch("http://localhost:8000/api/ai/climate-forecast/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location,
        weather: weatherData
      })
    });

    return await response.json();
  } catch (err) {
    console.error("AI Forecast error:", err);
    return null;
  }
}
