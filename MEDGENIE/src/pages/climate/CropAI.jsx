import { useState } from "react";

const CropAI = () => {
  const [location, setLocation] = useState("Delhi");
  const [soil, setSoil] = useState("Loamy");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const generateRecommendation = async () => {
    setLoading(true);
    setResult("");
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/crop/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, soil }),
      });

      if (!res.ok) throw new Error("Backend error");

      const data = await res.json();
      setResult(data.crop_recommendation);

    } catch (err) {
      setError("❌ Could not generate crop recommendation.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen px-10 pt-24 bg-gradient-to-br from-green-950 via-black to-green-900 text-white">

      <h1 className="text-4xl font-bold mb-4">🌾 AI Crop Recommendation</h1>
      <p className="text-gray-300 mb-8">
        Randomized simulation model for crop suitability & farming decisions.
      </p>

      <div className="bg-white/10 p-6 rounded-xl border border-white/20 max-w-2xl mb-10">

        <label className="block text-lg">📍 Location</label>
        <input
          className="w-full p-3 mt-2 bg-white/20 border border-white/30 rounded text-white"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <label className="block mt-4 text-lg">🧪 Soil Type</label>
        <select
          className="w-full p-3 mt-2 bg-white/20 border border-white/30 rounded text-white"
          value={soil}
          onChange={(e) => setSoil(e.target.value)}
        >
          <option>Loamy</option>
          <option>Clay</option>
          <option>Sandy</option>
          <option>Black Soil</option>
          <option>Alluvial</option>
        </select>

        <button
          onClick={generateRecommendation}
          className="mt-6 w-full p-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
        >
          {loading ? "Generating..." : "Get Crop Recommendation"}
        </button>
      </div>

      {error && (
        <div className="bg-red-600/30 p-4 rounded-lg border border-red-500/50 mb-10">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-white/10 p-6 rounded-xl border border-white/20 mb-10 whitespace-pre-line">
          <h2 className="text-3xl font-semibold mb-4">🌱 Recommended Crops</h2>
          {result}
        </div>
      )}
    </div>
  );
};

export default CropAI;
