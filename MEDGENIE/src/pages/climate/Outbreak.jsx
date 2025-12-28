import { useState } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

const Outbreak = () => {
  const [location, setLocation] = useState("Delhi");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [riskChart, setRiskChart] = useState([]);

  const analyzeOutbreak = async () => {
    setLoading(true);
    setResult("");

    const res = await fetch("http://127.0.0.1:8000/api/climate/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location,
        mode: "outbreak",
      }),
    });

    const data = await res.json();
    setResult(data.ai_forecast);

    setRiskChart([
      { name: "Mosquito", score: Math.random() * 100 },
      { name: "Fungal", score: Math.random() * 100 },
      { name: "Livestock", score: Math.random() * 100 },
      { name: "Bacterial", score: Math.random() * 100 },
    ]);

    setLoading(false);
  };

  return (
    <div className="min-h-screen px-10 pt-24 bg-gradient-to-bl from-red-900 via-black to-purple-900 text-white">

      <h1 className="text-4xl font-bold mb-4">🦠 Outbreak Risk Predictor</h1>
      <p className="text-gray-300 mb-8">
        AI risk forecasts for mosquito, fungal & livestock diseases.
      </p>

      <div className="bg-white/10 p-6 rounded-xl border border-white/20 max-w-xl mb-10">
        <label className="block mb-2">📍 Location</label>
        <input
          className="w-full p-3 bg-white/20 border border-white/30 rounded text-white"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <button
          onClick={analyzeOutbreak}
          className="mt-6 w-full p-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
        >
          {loading ? "Analyzing..." : "Run Outbreak Analysis"}
        </button>
      </div>

      {result && (
        <div className="bg-white/10 p-6 rounded-xl border border-white/20 mb-10 whitespace-pre-line">
          <h2 className="text-2xl font-semibold mb-3">📊 Outbreak Analysis</h2>
          {result}
        </div>
      )}

      {riskChart.length > 0 && (
        <div className="bg-white/10 p-6 rounded-xl border border-white/20 max-w-xl">
          <h2 className="text-xl font-semibold mb-4">🧪 Disease Risk Radar</h2>

          <RadarChart cx={250} cy={200} outerRadius={120} width={500} height={400} data={riskChart}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" stroke="white" />
            <PolarRadiusAxis stroke="white" />
            <Radar dataKey="score" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.6} />
          </RadarChart>
        </div>
      )}

    </div>
  );
};

export default Outbreak;
