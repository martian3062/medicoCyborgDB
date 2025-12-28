import { useState } from "react";

const Maps = () => {
  return (
    <div className="pt-28 px-6 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">🗺 GIS Weather & Crop Maps</h1>
      <p>Interactive climate visualizer coming soon.</p>
    </div>
  );
};

export const IMDLive = () => {
  const [locationId, setLocationId] = useState("42182");
  const [data, setData] = useState(null);

  const fetchWeather = async () => {
    const url = `https://city.imd.gov.in/api/cityweather.php?id=${locationId}`;
    const res = await fetch(url);
    const json = await res.json();
    setData(json);
  };

  return (
    <div className="min-h-screen px-10 pt-24 bg-gradient-to-tr from-indigo-950 via-black to-blue-900 text-white">

      <h1 className="text-4xl font-bold mb-4">🌐 IMD Live Weather</h1>
      <p className="text-gray-300 mb-8">Direct IMD API monitoring for realtime weather.</p>

      <div className="bg-white/10 p-6 rounded-xl border border-white/20 max-w-xl mb-10">

        <label className="block mb-2">🆔 IMD Location ID</label>
        <input
          className="w-full p-3 bg-white/20 border border-white/30 rounded text-white"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
        />

        <button
          onClick={fetchWeather}
          className="mt-6 w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
        >
          Fetch IMD Live Weather
        </button>
      </div>

      {data && (
        <div className="bg-white/10 p-6 rounded-xl border border-white/20">
          <h2 className="text-2xl font-semibold mb-4">📊 Current Weather</h2>
          <pre className="whitespace-pre-line text-gray-300">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
};

// ✔ Only ONE default export:
export default Maps;
