import { useState } from "react";
import { api } from "../services/api";




const Forecast = () => {
  const [location, setLocation] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const runForecast = async () => {
    setLoading(true);

    const res = await fetch("http://127.0.0.1:8000/api/forecast/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location })
    });

    const result = await res.json();
    setData(result);
    setLoading(false);
  };

  return (
    <div className="pt-28 px-6 max-w-5xl mx-auto text-gray-900">
      <h1 className="text-4xl font-bold mb-6">🌦 AI Climate Forecast Engine</h1>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <input
          className="w-full p-3 rounded border"
          placeholder="Enter city/state"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <button
          onClick={runForecast}
          className="mt-4 w-full bg-blue-600 text-white p-3 rounded-lg font-bold"
        >
          Run Forecast
        </button>
      </div>

      {loading && <p className="mt-6 animate-pulse text-xl">⏳ Predicting...</p>}

      {data && (
        <div className="bg-white p-6 mt-6 rounded-xl shadow-lg whitespace-pre-wrap">
          <h2 className="text-2xl font-bold mb-4">Prediction Result</h2>
          {data.result}
        </div>
      )}
    </div>
  );
};

export default Forecast;
