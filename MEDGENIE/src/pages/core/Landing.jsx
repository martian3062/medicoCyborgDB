import { Link } from "react-router-dom";


export default function Landing() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center 
                    bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700
                    text-white px-6 text-center">

      {/* TITLE */}
      <h1 className="text-5xl md:text-6xl font-extrabold drop-shadow-xl mb-6">
        Welcome to <span className="text-yellow-300">MedGenie 3.0
            
        </span>
      </h1>

      {/* SUBTITLE */}
      <p className="text-lg md:text-xl max-w-2xl opacity-90 mb-12">
        AI-powered medical analysis platform for ECG, PPG, uploads, 
        climate forecasting, and real-time diagnosis powered by Groq Qwen-32B.
      </p>

      {/* ENTER DASHBOARD BUTTON */}
      <Link
        to="/dashboard"
        className="px-8 py-4 rounded-2xl text-lg md:text-xl font-semibold
                   bg-white text-blue-700 shadow-xl hover:shadow-2xl 
                   hover:scale-105 transition-all duration-300"
      >
        Enter Dashboard →
      </Link>
    </div>
  );
}
