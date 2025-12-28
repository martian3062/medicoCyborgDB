// src/pages/core/Dashboard.jsx
import { Link } from "react-router-dom";
import {
  FiMessageSquare,
  FiUploadCloud,
  FiVideo,
  FiCloudRain,
  FiMap,
  FiActivity,
  FiDatabase,
} from "react-icons/fi";

const robot36Icon = "/icons/robot36.png";

export default function Dashboard() {
  const features = [
    {
      title: "AI Chat Assistant",
      desc: "Medical queries, reports, summaries & health advice.",
      icon: <FiMessageSquare className="text-4xl text-blue-400" />,
      to: "/chat",
    },
    {
      title: "Medical Uploads",
      desc: "Upload ECG, reports, scans & get instant AI insights.",
      icon: <FiUploadCloud className="text-4xl text-green-400" />,
      to: "/upload",
    },
    {
      title: "Telemedicine Room",
      desc: "Live doctor consultations with real-time translation.",
      icon: <FiVideo className="text-4xl text-purple-400" />,
      to: "/telemedicine",
    },
    {
      title: "Climate Forecast AI",
      desc: "Random weather model + disaster risk prediction.",
      icon: <FiCloudRain className="text-4xl text-yellow-300" />,
      to: "/forecast",
    },
    {
      title: "Cyborg Vault Demo",
      desc: "Seed records → Search hits → Ask AI (RAG with citations).",
      icon: <FiDatabase className="text-4xl text-cyan-300" />,
      to: "/cyborg",
    },
    {
      title: "Radio SSTV Mode",
      desc: "Offline Robot36 image transfer for no-network areas.",
      icon: <img src={robot36Icon} className="h-14 mx-auto" alt="Robot36" />,
      to: "/robot36",
    },
    {
      title: "Crop Recommendation AI",
      desc: "Best crops based on soil + climate + season.",
      icon: <FiMap className="text-4xl text-orange-400" />,
      to: "/crop",
    },
    {
      title: "Outbreak Detector",
      desc: "Mosquito, fungal & livestock disease prediction.",
      icon: <FiActivity className="text-4xl text-red-400" />,
      to: "/outbreak",
    },
  ];

  return (
    <div
      className="min-h-screen pt-24 px-8
      bg-gradient-to-br from-gray-900 via-black to-gray-950
      text-white"
    >
      <h1 className="text-5xl font-extrabold mb-4">🧬 MedGenie Dashboard</h1>

      <p className="text-gray-300 max-w-2xl mb-10 text-lg">
        Your unified Health + Climate + AI analytics platform powered by
        <span className="text-blue-400 font-semibold"> Groq Qwen</span> &
        <span className="text-green-300 font-semibold"> Rural Offline Tech</span>.
      </p>

      <div className="grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <Link
            key={i}
            to={f.to}
            className="p-6 bg-white/10 hover:bg-white/20 transition
              rounded-2xl shadow-lg border border-white/20
              backdrop-blur-lg hover:scale-[1.02] active:scale-95"
          >
            <div className="mb-4">{f.icon}</div>
            <h2 className="text-2xl font-semibold mb-2">{f.title}</h2>
            <p className="text-gray-300">{f.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
