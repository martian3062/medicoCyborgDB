import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center 
                    bg-gradient-to-br from-blue-600 to-indigo-700 text-white">

      <h1 className="text-5xl font-extrabold drop-shadow-lg mb-6 text-center">
        Welcome to MedGenie AI
      </h1>

      <p className="text-lg opacity-90 max-w-xl text-center mb-10">
        AI-powered medical analysis platform for ECG, PPG, uploads, climate AI,
        and real-time diagnosis.
      </p>

      <Link
        to="/dashboard"
        className="px-8 py-4 rounded-xl text-lg font-semibold 
                   bg-white text-blue-700 shadow-lg hover:scale-105 
                   transition-all duration-200"
      >
        Enter Dashboard →
      </Link>

    </div>
  );
}
