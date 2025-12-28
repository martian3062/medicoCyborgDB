import React from "react";
import { Link } from "react-router-dom";
import FeatureCard from "./FeatureCard";
import {
  FiMessageSquare,
  FiUploadCloud,
  FiCameraVideo,
  FiTrendingUp,
} from "react-icons/fi";

const Dashboard = () => {
  return (
    <div className="pt-32 px-8 min-h-screen bg-gray-50 dark:bg-[#0f172a]">
      <h1 className="text-4xl font-extrabold mb-10 dark:text-white">
        MedGenie Dashboard
      </h1>

      <p className="text-gray-600 dark:text-gray-300 text-lg mb-12">
        Your unified health + climate + AI analytics platform powered by Groq
        Qwen-32B & IMD live data.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* AI CHAT ASSISTANT */}
        <Link to="/chat">
          <FeatureCard
            icon={<FiMessageSquare className="text-purple-500" />}
            title="AI Chat Assistant"
            description="Ask MedGenie AI anything about ECG, symptoms, or health."
          />
        </Link>

        {/* FORECAST ENGINE */}
        <Link to="/forecast">
          <FeatureCard
            icon={<FiTrendingUp className="text-yellow-400 text-3xl" />}
            title="AI Forecasting Engine"
            description="Predict outbreaks, climate anomalies, and crop recommendations using IMD/ICAR data."
          />
        </Link>

        {/* MEDICAL UPLOADS */}
        <Link to="/upload">
          <FeatureCard
            icon={<FiUploadCloud className="text-blue-500" />}
            title="Medical Uploads"
            description="Upload ECG/PPG images or PDFs for AI-based analysis."
          />
        </Link>

        {/* TELEMEDICINE ROOM */}
        <Link to="/telemedicine">
          <FeatureCard
            icon={<FiCameraVideo className="text-pink-500" />}
            title="Telemedicine Room"
            description="Live doctor consultations via WebRTC with real-time translation."
          />
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
