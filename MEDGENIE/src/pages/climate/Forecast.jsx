import { useState } from "react";

const Forecast = () => {
  const [location, setLocation] = useState("Delhi");
  const [locationId, setLocationId] = useState("42182");
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState("");
  const [error, setError] = useState("");

  const getForecast = async () => {
    setLoading(true);
    setForecast("");
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/climate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          location_id: locationId, // kept for compatibility but not used
        }),
      });

      if (!res.ok) throw new Error("Backend error");

      const data = await res.json();
      setForecast(data.ai_forecast);

    } catch (err) {
      setError("❌ Could not generate forecast. Backend unavailable.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen px-10 pt-24 bg-gradient-to-br from-blue-950 via-black to-blue-900 text-white">

      <h1 className="text-4xl font-bold mb-4">🌦 AI Climate Forecast</h1>
      <p className="text-gray-300 mb-8">
        Randomized simulation model for weather, risks & climate insights.
      </p>

      <div className="bg-white/10 p-6 rounded-xl border border-white/20 max-w-2xl mb-10">

        <label className="block text-lg">📍 Location</label>
        <input
          className="w-full p-3 mt-2 bg-white/20 border border-white/30 rounded text-white"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <label className="block mt-4 text-lg">🆔 IMD Location ID (Not required)</label>
        <input
          className="w-full p-3 mt-2 bg-white/20 border border-white/30 rounded text-white"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
        />

        <button
          onClick={getForecast}
          className="mt-6 w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
        >
          {loading ? "Generating..." : "Generate Climate Forecast"}
        </button>
      </div>

      {error && (
        <div className="bg-red-600/30 p-4 rounded-lg border border-red-500/50 mb-10">
          {error}
        </div>
      )}

      {forecast && (
        <div className="bg-white/10 p-6 rounded-xl border border-white/20 mb-10 whitespace-pre-line">
          <h2 className="text-3xl font-semibold mb-4">📊 AI Climate Analysis</h2>
          {forecast}
        </div>
      )}

    </div>
  );
};

export default Forecast;
