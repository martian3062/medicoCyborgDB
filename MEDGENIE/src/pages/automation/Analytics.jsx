const Analytics = () => {
  return (
    <div className="pt-28 px-6 max-w-6xl mx-auto text-gray-900">
      <h1 className="text-4xl font-bold mb-4">📊 AI Analytics Dashboard</h1>
      <p className="mb-6 text-lg">
        Track the system performance, climate trends, outbreak risks, and crop prediction accuracy.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-white p-6 shadow-lg rounded-xl">
          <h2 className="font-semibold text-xl mb-3">🌡 Temperature Trends</h2>
          <p className="text-gray-600">Graph integration coming soon.</p>
        </div>

        <div className="bg-white p-6 shadow-lg rounded-xl">
          <h2 className="font-semibold text-xl mb-3">🌧 Rainfall Anomalies</h2>
          <p className="text-gray-600">Live IMD analysis displayed here.</p>
        </div>

        <div className="bg-white p-6 shadow-lg rounded-xl">
          <h2 className="font-semibold text-xl mb-3">🦠 Outbreak Probability</h2>
          <p className="text-gray-600">Probability scores from unified model.</p>
        </div>

        <div className="bg-white p-6 shadow-lg rounded-xl">
          <h2 className="font-semibold text-xl mb-3">🌾 Crop Success Score</h2>
          <p className="text-gray-600">Model performance metrics coming.</p>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
