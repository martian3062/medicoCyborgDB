import { useState } from "react";
import { FiVideo, FiCpu } from "react-icons/fi";

const VideoAI = () => {
  const [file, setFile] = useState(null);
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);

  const analyzeVideo = async () => {
    if (!file) {
      alert("Upload a video first!");
      return;
    }

    setLoading(true);
    setAiResult("");

    const form = new FormData();
    form.append("video", file);

    const res = await fetch("http://127.0.0.1:8000/api/video/", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    setAiResult(data.analysis);
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-24 px-8 bg-gradient-to-br from-black via-gray-900 to-black text-white">

      <h1 className="text-4xl font-bold mb-6">🎥 AI Video Diagnosis</h1>
      <p className="text-gray-300 mb-8">Upload a patient video for AI-based posture, breathing, tremor or symptom analysis.</p>

      <div className="bg-white/10 p-8 rounded-2xl border border-white/20 max-w-2xl">
        <div className="flex flex-col items-center gap-4">

          <FiVideo className="text-6xl text-purple-400" />

          <input
            type="file"
            accept="video/*"
            className="w-full border border-gray-500 bg-white/10 p-3 rounded text-white"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button
            onClick={analyzeVideo}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg w-full font-semibold"
          >
            {loading ? "Analyzing..." : "Analyze Video"}
          </button>
        </div>

        {aiResult && (
          <div className="mt-6 p-4 bg-white/10 border border-white/20 rounded-xl">
            <FiCpu className="text-3xl mb-2 text-purple-300" />
            <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
            <p className="whitespace-pre-line text-gray-200">{aiResult}</p>
          </div>
        )}

      </div>

    </div>
  );
};

export default VideoAI;
