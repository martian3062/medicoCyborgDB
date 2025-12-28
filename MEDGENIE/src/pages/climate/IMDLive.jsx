import { useState } from "react";

const IMDLive = () => {
  const [cityId, setCityId] = useState("");
  const [weather, setWeather] = useState(null);

  const fetchWeather = async () => {
    const url = `https://mausam.imd.gov.in/api/current_wx_api.php?id=${cityId}`;
    const res = await fetch(url);
    const data = await res.json();
    setWeather(data);
  };

  return (
    <div className="pt-28 px-6 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">🌍 IMD Live Weather</h1>

      <input
        value={cityId}
        onChange={(e) => setCityId(e.target.value)}
        className="p-3 border w-full rounded"
        placeholder="Enter city ID (like 42182)"
      />

      <button onClick={fetchWeather} className="mt-3 w-full p-3 bg-blue-600 text-white rounded-lg">
        Fetch Now
      </button>

      {weather && (
        <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-3">Current Weather</h2>
          <pre className="whitespace-pre-wrap">{JSON.stringify(weather, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default IMDLive;
